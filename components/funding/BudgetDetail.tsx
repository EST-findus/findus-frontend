"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CAMPAIGN, CAMPAIGNS, formatManWon, formatWon, type TierId } from "@/lib/funding";
import {
  campaignBudget, FIXED_COSTS, listedPartners, PARTNER_ROLES, partnerById, PAYMENT_FEE_RATE, tierBreakdown,
  type ItemTotal, type Partner, type PartnerRole,
} from "@/lib/fundingBudget";
import { useFunding } from "@/lib/useFunding";
import { useCountUp } from "@/lib/useMotion";
import { ArrowUpRightIcon, ChevronLeftIcon } from "../Icons";

const NAV = [
  { id: "flow", label: "돈이 가는 곳" },
  { id: "receipt", label: "내 후원금" },
  { id: "partners", label: "함께하는 곳" },
  { id: "promise", label: "공개 약속" },
] as const;

/** 품목의 짧은 이름과 세는 단위 */
const ITEM_NAME: Record<ItemTotal["id"], { name: string; unit: string }> = {
  keyring: { name: "키링 세트", unit: "개" },
  ecobag: { name: "에코백", unit: "개" },
  tshirt: { name: "티셔츠", unit: "장" },
  hoodie: { name: "후드", unit: "벌" },
  postcard: { name: "엽서·스티커팩", unit: "세트" },
  shipping: { name: "택배", unit: "상자" },
  fee: { name: "결제 수수료", unit: "" },
};

const DISCLOSURE = [
  { when: "펀딩 중", what: "견적 기준 예상 금액", now: true },
  { when: "마감 후 3일", what: "발주 확정 금액" },
  { when: "배송 후 3일", what: "실제 지출과 영수증" },
];

/* 후원금 사용 계획: "공개 장부" 느낌. 상자를 줄이고 선과 숫자로 정리한다. */
const focusRing = "focus-visible:rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-coral";
/** 갈래별 색: 굿즈 = 공공 블루, 찾기 홍보 = 코랄, 가족 지원 = 하늘색 */
const BUCKET_BG: Record<string, string> = { goods: "bg-brand", search: "bg-coral", family: "bg-[#8DB4EA]" };
const BUCKET_BEFORE_BG: Record<string, string> = { goods: "before:bg-brand", search: "before:bg-coral", family: "before:bg-[#8DB4EA]" };

const section = "scroll-mt-[120px] pt-[72px] pb-2";
const sectionHead =
  "grid max-w-[44rem] grid-cols-[56px_minmax(0,1fr)] gap-x-2 max-md:grid-cols-[1fr] " +
  "[&_h2]:text-[30px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.8px] [&_h2]:break-keep max-md:[&_h2]:text-[24px] [&_p]:mt-2 [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:break-keep [&_p]:text-muted";
const sectionNo = "row-span-2 pt-2 text-[15px] font-extrabold tracking-[.04em] text-coral max-md:row-auto max-md:pt-0";
const small = "mt-3 text-[13px] leading-[1.65] break-keep text-muted";
const legendItem = "relative flex flex-col gap-0.5 pt-3.5 before:absolute before:top-0 before:left-0 before:h-[3px] before:w-7 before:rounded-[2px] before:content-['']";
const legendShare = "text-[30px] font-light not-italic tracking-[-1px]";
const legendName = "text-[14px] font-bold break-keep text-[#D5E1F2]";
const payeeAmount = "pr-[52px] text-[14px] font-bold max-md:col-[2] max-md:pr-0 max-md:text-[13px]";
const receiptLines = "mt-2 flex flex-col gap-[9px]";
const receiptLine = "flex items-end gap-1.5 text-[13px]";
const receiptLabel = "flex max-w-[72%] min-w-0 flex-col font-semibold break-keep";
const receiptSub = "text-[11px] font-medium text-subtle";
const receiptSection = "mt-4 text-[11px] font-extrabold tracking-[.08em] text-subtle";
const dots = "mb-[5px] min-w-3 flex-1 border-b border-dotted border-[#A9B6C6]";
const receiptAmount = "text-[14px] font-extrabold";
const tile = "flex flex-col px-[22px] pt-[22px] pb-5 [transition:background-color_.2s]";
const tileRole = "flex justify-between gap-2 text-[12px] font-bold text-subtle";
const tileName = "mt-4 text-[17px] font-extrabold break-keep";
const tileWhy = "mt-2.5 text-[13px] leading-[1.65] break-keep text-muted";
const promiseGrid = "mt-[52px] grid grid-cols-2 gap-12 max-md:grid-cols-[1fr] max-md:gap-9 [&_h3]:text-[17px] [&_h3]:font-extrabold";
const promise =
  "relative pl-[22px] text-[14px] leading-[1.65] break-keep before:absolute before:top-1.5 before:left-0.5 before:h-1.5 before:w-2.5 before:-rotate-45 before:border-b-2 before:border-l-2 before:border-brand before:content-['']";
const promiseMuted =
  "relative pl-[22px] text-[14px] leading-[1.65] break-keep text-muted before:absolute before:top-2.5 before:left-0.5 before:h-0 before:w-2 before:border-b-2 before:border-subtle before:content-['']";

const FEE_PERCENT = `${+(PAYMENT_FEE_RATE * 100).toFixed(2)}%`;
const itemRole = (item: ItemTotal): PartnerRole => (item.id === "shipping" ? "shipping" : item.id === "fee" ? "payment" : "making");
const count = (item: ItemTotal) => (item.id === "fee" ? "" : `${item.quantity.toLocaleString("ko-KR")}${ITEM_NAME[item.id].unit}`);
const share = (amount: number, total: number) => (total > 0 ? Math.round((amount / total) * 100) : 0);

interface Payee {
  key: string;
  partners: Partner[];
  name: string;
  detail: string;
  amount: number;
}

interface Flow {
  role: PartnerRole;
  bucket: "goods" | "search" | "family";
  title: string;
  amount: number;
  payees: Payee[];
}

/** 협력사 로고. 로고 파일이 없으면 이름 첫 글자, 업체가 정해지지 않았으면 빈 칸을 보여준다. 이름은 옆에 글로 있으므로 그림은 꾸밈으로 둔다. */
function Mark({ partner, size = "sm" }: { partner: Partner | null; size?: "sm" | "lg" }) {
  const base = "inline-grid shrink-0 place-items-center overflow-hidden font-extrabold text-navy";
  if (partner?.logo) {
    return (
      <span className={`${base} bg-white ${size === "lg" ? "h-16 w-full rounded-[10px] text-[22px]" : "h-[30px] w-[76px] rounded-[6px] text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)]"}`}>
        <Image src={partner.logo.src} alt="" width={partner.logo.width} height={partner.logo.height} unoptimized={partner.logo.src.endsWith(".svg")}
          className={`h-auto w-auto object-contain ${size === "lg" ? "max-h-9 max-w-[min(70%,180px)]" : "max-h-5 max-w-[62px]"}`} />
      </span>
    );
  }
  // 로고가 없는 큰 표시는 원 안에 첫 글자를 넣는다. 업체가 정해지지 않은 칸은 빗금으로 비워 둔다.
  const look = size === "lg" ? "size-14 rounded-full bg-brand-soft text-[22px]"
    : partner ? "h-[30px] w-[76px] rounded-[6px] bg-white text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)]"
    : "h-[30px] w-[76px] rounded-[6px] bg-[repeating-linear-gradient(-45deg,#F3F6FA_0_6px,#fff_6px_12px)] text-[13px] shadow-[inset_0_0_0_1px_#C9D5E5]";
  return <span className={`${base} ${look}`} aria-hidden="true">{partner ? partner.name.replace(/[^가-힣A-Za-z]/g, "").slice(0, 1) : ""}</span>;
}

function Total({ value }: { value: number }) {
  const shown = useCountUp(value, { duration: 1100 });
  return <>{Math.round(shown).toLocaleString("ko-KR")}</>;
}

/**
 * 후원금 사용 계획. 회차 전체 예산(어느 협력사에 얼마를 써서 몇 개를 만드는지), 내 후원금 영수증,
 * 협력 기업, 공개 약속을 한곳에 보여준다. 협약 전 기업은 개발 환경에서만 보인다.
 */
export default function BudgetDetail({ campaignId, initialTier }: { campaignId: string; initialTier: TierId | null }) {
  const campaign = CAMPAIGNS.find((item) => item.id === campaignId) ?? CAMPAIGN;
  const { raised, backers, sold } = useFunding(campaign);
  const [tierId, setTierId] = useState<TierId>(initialTier ?? "ecobag");
  const tier = campaign.tiers.find((item) => item.id === tierId) ?? campaign.tiers[0];
  const receipt = tierBreakdown(tier, raised, campaign);
  const budget = campaignBudget(sold, raised, campaign);
  const name = campaign.child.name;
  const partners = listedPartners();
  const proposals = partners.some((partner) => partner.status === "proposal");
  const bucketTitle = (id: string) => (id === "search" ? `${name}님 찾기 홍보` : campaign.fundsPlan.find((item) => item.id === id)?.title ?? "");
  const description = (id: string) => campaign.fundsPlan.find((item) => item.id === id)?.description ?? "";
  const boxes = budget.items.find((item) => item.id === "shipping")?.quantity ?? 0;

  // 원가 품목은 맡는 곳별로 묶는다. 업체가 안 정해진 품목은 "업체 선정 중"으로 모은다.
  const roleTitle = (role: PartnerRole) => PARTNER_ROLES.find((item) => item.id === role)?.title ?? "";
  const costFlows: Flow[] = (["making", "shipping", "payment"] as const).map((role) => {
    const payees = new Map<string, Payee>();
    for (const item of budget.items.filter((entry) => itemRole(entry) === role && entry.amount > 0)) {
      const partner = partnerById(item.partnerId);
      const key = partner?.id ?? "pending";
      const payee = payees.get(key) ?? { key, partners: partner ? [partner] : [], name: partner?.name ?? "업체 선정 중", detail: "", amount: 0 };
      payee.detail = [payee.detail, item.id === "fee" ? `모인 금액의 ${FEE_PERCENT}` : `${ITEM_NAME[item.id].name} ${count(item)}`].filter(Boolean).join(" · ");
      payee.amount += item.amount;
      payees.set(key, payee);
    }
    const list = [...payees.values()];
    return { role, bucket: "goods", title: roleTitle(role), amount: list.reduce((sum, payee) => sum + payee.amount, 0), payees: list };
  });
  const bucketFlow = (role: "promotion" | "donation", bucket: "search" | "family", fallback: string, detail: string): Flow => {
    const amount = budget.buckets.find((item) => item.id === bucket)?.amount ?? 0;
    const list = partners.filter((partner) => partner.role === role);
    return {
      role, bucket, title: bucketTitle(bucket), amount,
      payees: [{ key: role, partners: list, name: list.length > 0 ? list.map((partner) => partner.name).join(" · ") : fallback, detail, amount }],
    };
  };
  const flows = [
    ...costFlows,
    bucketFlow("promotion", "search", "홍보 매체 선정 중", "QR 포스터, 실종 지역 옥외·온라인 광고 · 매체별 금액은 협약 후 확정"),
    bucketFlow("donation", "family", "기부처 선정 중", "후보 중 한 곳을 정해 전액 기부"),
  ];
  const paidTo = new Map(costFlows.flatMap((flow) => flow.payees.map((payee) => [payee.key, payee.amount] as const)));

  return (
    <div className="bg-page tabular-nums">
      {/* ───── 머리: 모인 돈 한 줄 요약 ───── */}
      <header className="bg-[radial-gradient(120%_140%_at_85%_-20%,#2A5596_0%,var(--color-navy)_45%,#0F2A52_100%)] pt-5 pb-10 text-white">
        <div className="page-container">
          <Link href={`/funding/${campaign.id}`} className={`inline-flex items-center gap-0.5 text-[14px] font-bold text-[#B9CDEA] [transition:color_.2s] hover:text-white ${focusRing}`}><ChevronLeftIcon size={18} />{name}님 펀딩</Link>
          <div className="mt-9 flex flex-wrap items-end justify-between gap-6 max-md:mt-6">
            <div>
              <p className="text-[14px] font-bold text-[#FFB4A8]">{campaign.round}회차 후원금 사용 계획</p>
              <h1 className="mt-2.5 text-[length:clamp(34px,5vw,52px)] leading-[1.15] font-extrabold tracking-[-1.5px] text-white">모인 돈은<br />이렇게 쓰여요</h1>
            </div>
            <div className="text-right max-md:text-left">
              <p className="text-[20px] font-bold"><strong className="text-[length:clamp(40px,6vw,64px)] font-extrabold tracking-[-2px]"><Total value={budget.total} /></strong>원</p>
              <span className="text-[14px] text-[#B9CDEA]">후원자 {backers.toLocaleString("ko-KR")}명 · 보낼 상자 {boxes.toLocaleString("ko-KR")}개</span>
            </div>
          </div>

          <div className="mt-9 flex h-3.5 gap-[3px]" role="img" aria-label={budget.buckets.map((bucket) => `${bucketTitle(bucket.id)} ${formatWon(bucket.amount)}`).join(", ")}>
            {budget.buckets.map((bucket) => <span key={bucket.id} data-bucket={bucket.id} className={`min-w-1 basis-0 origin-left animate-budget-grow rounded-[3px] motion-reduce:animate-none ${BUCKET_BG[bucket.id] ?? ""}`} style={{ flexGrow: Math.max(bucket.amount, 1) }} />)}
          </div>
          <ul className="mt-5 grid grid-cols-4 gap-5 max-md:grid-cols-2">
            {budget.buckets.map((bucket) => (
              <li key={bucket.id} data-bucket={bucket.id} className={`${legendItem} ${BUCKET_BEFORE_BG[bucket.id] ?? ""}`}>
                <em className={legendShare}>{share(bucket.amount, budget.total)}%</em>
                <span className={legendName}>{bucketTitle(bucket.id)}</span>
                <strong className="text-[15px] font-extrabold">{formatWon(bucket.amount)}</strong>
              </li>
            ))}
            <li data-bucket="ops" className={`${legendItem} before:border-t-2 before:border-dashed before:border-[#6F8DBA]`}>
              <em className={`${legendShare} text-[#9FB6D8]`}>0%</em>
              <span className={legendName}>FindUs 운영비</span>
              <strong className="text-[13px] font-semibold text-[#9FB6D8]">0원 · 기업 후원으로 따로 마련</strong>
            </li>
          </ul>
          {raised < campaign.goal && <p className="mt-6 border-t border-white/14 pt-3.5 text-[13px] text-[#B9CDEA]">목표 {formatManWon(campaign.goal)}원에 못 미치면 모든 결제를 취소하고, 이 돈은 쓰이지 않아요.</p>}
        </div>
      </header>

      <nav className="sticky top-16 z-5 border-b border-line bg-white/92 backdrop-blur-[8px]" aria-label="이 페이지 내용">
        <div className="page-container flex gap-7 overflow-x-auto [scrollbar-width:none]">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`}
              className={`shrink-0 border-b-2 border-transparent py-3.5 text-[14px] font-bold text-muted [transition:color_.2s,border-color_.2s] hover:border-b-navy hover:text-navy ${focusRing}`}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="page-container">
        {/* ───── 01 돈이 가는 곳 ───── */}
        <section id="flow" className={section} aria-labelledby="flow-title">
          <div className={sectionHead}>
            <span className={sectionNo}>01</span>
            <h2 id="flow-title">돈이 가는 곳</h2>
            <p>굿즈를 만들고 보내는 곳에 원가만큼 먼저 내고, 남은 돈은 모두 {name}님 찾기 홍보와 가족 지원에 써요.</p>
          </div>

          <div className="mt-8 border-t-2 border-navy">
            {flows.map((flow) => (
              <div key={flow.role} className="border-b border-line py-[18px]" data-bucket={flow.bucket}>
                <p className="flex items-baseline justify-between gap-3">
                  <span className={`inline-flex items-center gap-2.5 text-[16px] font-extrabold text-navy before:size-2.5 before:rounded-[2px] before:content-[''] ${BUCKET_BEFORE_BG[flow.bucket]}`}>{flow.title}</span>
                  <strong className="text-[20px] font-extrabold text-navy">{formatWon(flow.amount)}<em className="ml-2 inline-block min-w-11 text-right text-[13px] font-bold not-italic text-subtle">{share(flow.amount, budget.total)}%</em></strong>
                </p>
                <ul className="mt-3 flex flex-col gap-2.5 pl-5 max-md:pl-0">
                  {flow.payees.map((payee) => (
                    <li key={payee.key} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 max-md:grid-cols-[auto_minmax(0,1fr)]">
                      <span className="flex gap-1.5">
                        {payee.partners.length > 0 ? payee.partners.map((partner) => <Mark key={partner.id} partner={partner} />) : <Mark partner={null} />}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <strong className="text-[14px] font-bold">{payee.name}</strong>
                        <span className="text-[13px] leading-[1.5] break-keep text-muted">{payee.detail}</span>
                      </span>
                      {flow.payees.length > 1 && <span className={payeeAmount}>{formatWon(payee.amount)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="flex items-baseline justify-between py-[18px]"><span className="text-[15px] font-extrabold">합계</span><strong className="pr-[52px] text-[24px] font-extrabold text-navy max-md:pr-0">{formatWon(flows.reduce((sum, flow) => sum + flow.amount, 0))}</strong></p>
          </div>

          <details className="group mt-2">
            <summary
              className={`inline-flex cursor-pointer list-none items-center gap-1.5 text-[14px] font-extrabold text-brand [&::-webkit-details-marker]:hidden ${focusRing} after:h-[7px] after:w-[7px] after:-translate-y-0.5 after:rotate-45 after:border-r-2 after:border-b-2 after:[transition:rotate_.2s] after:content-[''] group-open:after:translate-y-0.5 group-open:after:rotate-[225deg]`}>품목별 수량과 단가 보기</summary>
            <div className="mt-3.5 overflow-x-auto">
              <table
                className={"w-full min-w-[38rem] border-collapse text-[13px] [&_:is(th,td)]:border-b [&_:is(th,td)]:border-line [&_:is(th,td)]:px-3 [&_:is(th,td)]:py-[11px] [&_:is(th,td)]:text-right [&_:is(th,td)]:whitespace-nowrap " +
                  "[&_thead_th]:border-b-navy [&_thead_th]:text-[12px] [&_thead_th]:font-bold [&_thead_th]:text-subtle [&_th:first-child]:text-left [&_td:nth-child(2)]:text-left " +
                  "[&_tbody_th]:font-semibold [&_tbody_th]:break-keep [&_tbody_th]:whitespace-normal [&_td:last-child]:font-extrabold [&_td:last-child]:text-navy"}>
                <thead>
                  <tr><th scope="col">품목</th><th scope="col">맡는 곳</th><th scope="col">수량</th><th scope="col">단가</th><th scope="col">합계</th></tr>
                </thead>
                <tbody>
                  {budget.items.map((item) => (
                    <tr key={item.id}>
                      <th scope="row">{item.label}</th>
                      <td>{partnerById(item.partnerId)?.name ?? "업체 선정 중"}</td>
                      <td>{item.id === "fee" ? "—" : count(item)}</td>
                      <td>{item.id === "fee" ? FEE_PERCENT : formatWon(item.unit)}</td>
                      <td>{formatWon(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={small}>
              모두 견적 전 예상 단가예요.{budget.extra > 0 && ` 리워드 없이 더 보내 주신 ${formatWon(budget.extra)}은 굿즈 없이 수수료만 빼고 홍보·기부로 가요.`}
            </p>
          </details>
        </section>

        {/* ───── 02 내 후원금 ───── */}
        <section id="receipt" className={section} aria-labelledby="receipt-title">
          <div className={sectionHead}>
            <span className={sectionNo}>02</span>
            <h2 id="receipt-title">내 후원금은 어디로 가나요</h2>
            <p>리워드를 고르면 한 사람의 후원금을 원 단위까지 나눠 보여드려요.</p>
          </div>

          <div className="mt-8 grid grid-cols-[260px_minmax(0,1fr)] gap-8 max-lg:grid-cols-[1fr]">
            <div role="radiogroup" aria-label="리워드 고르기" className="flex flex-col self-start border-t-2 border-navy max-lg:flex-row max-lg:flex-wrap max-lg:gap-1.5 max-lg:border-t-0">
              {campaign.tiers.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={item.id === tier.id} onClick={() => setTierId(item.id)}
                  className={"relative flex items-baseline justify-between border-b border-line py-3.5 pr-1 pl-4 text-left text-[15px] font-bold text-muted [transition:color_.2s,background-color_.2s] hover:bg-[#F4F7FB] hover:text-navy aria-checked:text-navy " +
                    "before:absolute before:top-3 before:bottom-3 before:left-0 before:w-[3px] before:rounded-[2px] before:bg-transparent before:[transition:background-color_.2s] before:content-[''] aria-checked:before:bg-coral " +
                    `max-lg:flex-col max-lg:gap-0.5 max-lg:rounded-xl max-lg:border max-lg:px-3.5 max-lg:py-2.5 max-lg:text-[13px] max-lg:before:hidden max-lg:aria-checked:border-navy max-lg:aria-checked:shadow-[inset_0_0_0_1px_var(--color-navy)] ${focusRing} max-lg:focus-visible:rounded-[6px]`}>
                  <span>{item.title}</span>
                  <strong className="text-[14px] font-extrabold">{formatWon(item.price)}</strong>
                </button>
              ))}
            </div>

            <div className="grid rounded-[20px] bg-[linear-gradient(160deg,#E9EEF5,#F4F6F9)] px-6 pt-10 pb-[52px] [place-items:start_center] max-md:px-3 max-md:pt-7 max-md:pb-10">
              <div
                className={"relative w-full max-w-[400px] animate-budget-print bg-white px-[26px] pt-7 pb-[26px] [filter:drop-shadow(0_14px_22px_rgb(23_59_112/12%))] motion-reduce:animate-none " +
                  "after:absolute after:inset-x-0 after:bottom-[-10px] after:h-2.5 after:[background:linear-gradient(135deg,#fff_5px,transparent_0)_0_0/10px_10px_repeat-x,linear-gradient(-135deg,#fff_5px,transparent_0)_0_0/10px_10px_repeat-x] after:content-['']"}>
                <p className="text-center text-[13px] font-black tracking-[.3em] text-navy">FindUs</p>
                <p className="mt-1.5 text-center text-[17px] font-extrabold">후원금 사용 예상 내역</p>
                <p className="mt-0.5 border-b border-dashed border-[#B8C4D3] pb-4 text-center text-[12px] text-muted">{name}님 펀딩 {campaign.round}회차 · {tier.title}</p>

                <p className={receiptSection}>굿즈 제작·배송</p>
                <ul className={receiptLines}>
                  {receipt.lines.map((item) => (
                    <li key={`${item.id}-${item.bonus}`} className={receiptLine}>
                      <span className={receiptLabel}>
                        {item.label}{item.quantity > 1 && ` ×${item.quantity}`}
                        {item.bonus && <em className="text-[11px] font-extrabold not-italic text-coral-deep"> 보너스</em>}
                        <small className={receiptSub}>{partnerById(item.partnerId)?.name ?? "업체 선정 중"}</small>
                      </span>
                      <span className={dots} aria-hidden="true" />
                      <strong className={receiptAmount}>{item.amount.toLocaleString("ko-KR")}</strong>
                    </li>
                  ))}
                </ul>

                <p className={receiptSection}>남은 돈 (홍보 5 : 기부 3)</p>
                <ul className={receiptLines}>
                  {receipt.buckets.slice(1).map((bucket) => (
                    <li key={bucket.id} className={receiptLine}>
                      <span className={receiptLabel}>{bucketTitle(bucket.id)}<small className={receiptSub}>{description(bucket.id)}</small></span>
                      <span className={dots} aria-hidden="true" />
                      <strong className={receiptAmount}>{bucket.amount.toLocaleString("ko-KR")}</strong>
                    </li>
                  ))}
                  <li className={receiptLine}>
                    <span className={receiptLabel}>FindUs 운영비</span>
                    <span className={dots} aria-hidden="true" />
                    <strong className={receiptAmount}>0</strong>
                  </li>
                </ul>

                <p className="mt-[18px] flex items-baseline justify-between border-t-2 border-ink pt-3.5"><span className="text-[14px] font-extrabold">합계</span><strong className="text-[22px] font-extrabold">{formatWon(receipt.total)}</strong></p>
                <p className="mt-3 text-center text-[11px] leading-[1.6] break-keep text-subtle">견적 기준 예상 금액이에요. 많이 모여 단가가 내려가면 그만큼 홍보·기부가 늘어나요.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───── 03 함께하는 곳 ───── */}
        <section id="partners" className={section} aria-labelledby="partners-title">
          <div className={sectionHead}>
            <span className={sectionNo}>03</span>
            <h2 id="partners-title">함께하는 곳</h2>
            <p>실종아동 찾기에 오래 참여해 온 기업과 기관에 먼저 제안해요. 맡는 일과 고른 이유를 그대로 공개해요.</p>
          </div>
          {proposals && (
            <p className="mt-6 max-w-[44rem] border-l-[3px] border-coral py-0.5 pl-3.5 text-[13px] leading-[1.65] break-keep text-muted [&_strong]:text-ink">
              아래는 실종아동 캠페인 이력을 보고 고른 <strong>제안 대상</strong>이에요. 아직 협약 전이라 개발 환경에서만 보이고, 협약을 맺은 곳만 실제 화면에 공개해요.
            </p>
          )}

          {partners.length === 0 ? (
            <p className="mt-6 text-[14px] text-subtle">협약을 맺은 곳이 생기면 이곳에 공개해요.</p>
          ) : (
            <ul className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-[18px] border border-line bg-line max-lg:grid-cols-2 max-md:grid-cols-[1fr]">
              {partners.map((partner) => {
                const amount = paidTo.get(partner.id);
                return (
                  <li key={partner.id} className={`${tile} bg-white hover:bg-[#FAFBFD]`}>
                    <p className={tileRole}>
                      {roleTitle(partner.role)}
                      {partner.status === "proposal" && <span className="text-coral-ink">제안 단계</span>}
                    </p>
                    <div className="mt-3.5 grid place-items-center rounded-xl bg-[#F6F8FB] py-1.5"><Mark partner={partner} size="lg" /></div>
                    <h3 className={tileName}>{partner.name}</h3>
                    <p className="mt-1 text-[14px] leading-[1.55] font-semibold break-keep text-ink">{partner.ask}</p>
                    {amount !== undefined && <p className="mt-2 text-[13px] text-muted">이번 회차 예상 <strong className="ml-1 font-extrabold text-brand">{formatWon(amount)}</strong></p>}
                    <p className={tileWhy}>{partner.why}</p>
                    <p className="mt-auto flex flex-wrap gap-x-2.5 gap-y-1 pt-3">
                      {partner.sources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-0.5 text-[11px] text-subtle underline underline-offset-3 hover:text-brand ${focusRing}`}>
                          {source.label}<ArrowUpRightIcon size={11} /><span className="sr-only"> (새 창)</span>
                        </a>
                      ))}
                    </p>
                  </li>
                );
              })}
              <li className={`${tile} justify-end bg-[repeating-linear-gradient(-45deg,#F6F8FB_0_10px,#fff_10px_20px)]`} data-invite="true">
                <p className={`${tileRole} mb-auto`}>함께할 곳</p>
                <h3 className={`${tileName} text-navy`}>함께할 기업을 찾고 있어요</h3>
                <p className={tileWhy}>키링·에코백 제작사, 실종 지역 홍보 매체, 회차 스폰서와의 협력을 기다려요. 기업 후원 문의 창구는 준비 중이에요.</p>
              </li>
            </ul>
          )}
          <p className={small}>{PARTNER_ROLES.find((role) => role.id === "shipping")?.description}</p>
        </section>

        {/* ───── 04 공개 약속 ───── */}
        <section id="promise" className={section} aria-labelledby="promise-title">
          <div className={sectionHead}>
            <span className={sectionNo}>04</span>
            <h2 id="promise-title">언제, 무엇을 공개하나요</h2>
            <p>금액은 세 번 바뀌어요. 바뀔 때마다 이 페이지를 고치고, 마지막에는 영수증까지 올려요.</p>
          </div>

          <ol
            className={"relative mt-9 grid grid-cols-3 before:absolute before:top-[7px] before:right-2 before:left-2 before:h-0.5 before:bg-[linear-gradient(90deg,var(--color-navy)_0_16%,var(--color-line)_16%)] before:content-[''] " +
              "max-md:grid-cols-[1fr] max-md:gap-[18px] max-md:before:top-2 max-md:before:right-auto max-md:before:bottom-2 max-md:before:left-[7px] max-md:before:h-auto max-md:before:w-0.5 max-md:before:bg-line max-md:before:bg-none"}>
            {DISCLOSURE.map((step) => (
              <li key={step.when} data-now={step.now ?? false} className="group relative flex flex-col gap-0.5 pt-7 pr-3 max-md:pt-0 max-md:pl-[30px]">
                <span className="absolute top-0 left-0 size-4 rounded-full border-2 border-line bg-white group-data-[now=true]:border-navy group-data-[now=true]:bg-navy group-data-[now=true]:shadow-[0_0_0_5px_rgb(23_59_112/12%)]" aria-hidden="true" />
                <strong className="text-[16px] font-extrabold text-navy">{step.when}</strong>
                <span className="text-[14px] text-muted">{step.what}</span>
                {step.now && <em className="absolute -top-[3px] left-[26px] rounded-full bg-coral px-2 py-px text-[11px] font-extrabold not-italic text-white max-md:static max-md:mt-1 max-md:self-start">지금</em>}
              </li>
            ))}
          </ol>

          <div className={promiseGrid}>
            <div>
              <h3>한 번만 드는 돈</h3>
              <p className={small}>후원자 수와 상관없이 회차마다 드는 비용이에요. 후원금이 아니라 회차 스폰서가 맡아요.</p>
              <ul className="mt-3.5 border-t-2 border-navy">
                {FIXED_COSTS.map((cost) => (
                  <li key={cost.label} className="flex justify-between gap-4 border-b border-line py-3.5">
                    <span className="flex flex-col gap-0.5 text-[14px] font-bold break-keep">{cost.label}<small className="text-[13px] leading-[1.55] font-medium text-muted">{cost.note}</small></span>
                    <strong className="shrink-0 text-[15px] font-extrabold text-navy">약 {formatManWon(cost.amount)}원</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>지키는 것</h3>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                <li className={promise}>사용 내역은 날짜 · 항목 · 거래처 · 금액 · 영수증으로 한 줄씩 올려요. 영수증의 개인정보는 가려요.</li>
                <li className={promise}>{name}님이 가족을 다시 만나면, 남은 홍보비는 가족 동의를 받아 다른 장기 실종아동 홍보에 써요.</li>
                <li className={promise}>아이의 이름과 사진은 찾기 목적에만 써요. (실종아동법 제15조)</li>
              </ul>
              <h3 className="mt-7">아직 확인 중</h3>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                <li className={promiseMuted}>리워드 펀딩의 부가세 처리 — 세무 확인 후 원가에 넣어요.</li>
                <li className={promiseMuted}>포장재 · 박스 견적 — 지금은 택배비에 포함한 예상값이에요.</li>
              </ul>
            </div>
          </div>
        </section>

        <p className="mt-16 border-t border-line pt-5 pb-12 text-[12px] text-subtle">단가와 배분 비율은 견적 전 예상값이고, 수량은 예시 모금액에 이 브라우저에서 한 후원을 더해 계산했어요. [가정]</p>
      </div>
    </div>
  );
}

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
import styles from "./Budget.module.css";

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
  if (partner?.logo) {
    return (
      <span className={styles.mark} data-size={size}>
        <Image src={partner.logo.src} alt="" width={partner.logo.width} height={partner.logo.height} unoptimized={partner.logo.src.endsWith(".svg")} />
      </span>
    );
  }
  return <span className={styles.mark} data-size={size} data-empty={!partner} aria-hidden="true">{partner ? partner.name.replace(/[^가-힣A-Za-z]/g, "").slice(0, 1) : ""}</span>;
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
    <div className={styles.page}>
      {/* ───── 머리: 모인 돈 한 줄 요약 ───── */}
      <header className={styles.hero}>
        <div className="page-container">
          <Link href={`/funding/${campaign.id}`} className={styles.back}><ChevronLeftIcon size={18} />{name}님 펀딩</Link>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.kicker}>{campaign.round}회차 후원금 사용 계획</p>
              <h1 className="text-white">모인 돈은<br />이렇게 쓰여요</h1>
            </div>
            <div className={styles.heroTotal}>
              <p><strong><Total value={budget.total} /></strong>원</p>
              <span>후원자 {backers.toLocaleString("ko-KR")}명 · 보낼 상자 {boxes.toLocaleString("ko-KR")}개</span>
            </div>
          </div>

          <div className={styles.ribbon} role="img" aria-label={budget.buckets.map((bucket) => `${bucketTitle(bucket.id)} ${formatWon(bucket.amount)}`).join(", ")}>
            {budget.buckets.map((bucket) => <span key={bucket.id} data-bucket={bucket.id} style={{ flexGrow: Math.max(bucket.amount, 1) }} />)}
          </div>
          <ul className={styles.ribbonLegend}>
            {budget.buckets.map((bucket) => (
              <li key={bucket.id} data-bucket={bucket.id}>
                <em>{share(bucket.amount, budget.total)}%</em>
                <span>{bucketTitle(bucket.id)}</span>
                <strong>{formatWon(bucket.amount)}</strong>
              </li>
            ))}
            <li data-bucket="ops">
              <em>0%</em>
              <span>FindUs 운영비</span>
              <strong>0원 · 기업 후원으로 따로 마련</strong>
            </li>
          </ul>
          {raised < campaign.goal && <p className={styles.heroNote}>목표 {formatManWon(campaign.goal)}원에 못 미치면 모든 결제를 취소하고, 이 돈은 쓰이지 않아요.</p>}
        </div>
      </header>

      <nav className={styles.nav} aria-label="이 페이지 내용">
        <div className="page-container">
          {NAV.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
        </div>
      </nav>

      <div className="page-container">
        {/* ───── 01 돈이 가는 곳 ───── */}
        <section id="flow" className={styles.section} aria-labelledby="flow-title">
          <div className={styles.sectionHead}>
            <span className={styles.no}>01</span>
            <h2 id="flow-title">돈이 가는 곳</h2>
            <p>굿즈를 만들고 보내는 곳에 원가만큼 먼저 내고, 남은 돈은 모두 {name}님 찾기 홍보와 가족 지원에 써요.</p>
          </div>

          <div className={styles.ledger}>
            {flows.map((flow) => (
              <div key={flow.role} className={styles.ledgerGroup} data-bucket={flow.bucket}>
                <p className={styles.ledgerHead}>
                  <span>{flow.title}</span>
                  <strong>{formatWon(flow.amount)}<em>{share(flow.amount, budget.total)}%</em></strong>
                </p>
                <ul>
                  {flow.payees.map((payee) => (
                    <li key={payee.key}>
                      <span className={styles.marks}>
                        {payee.partners.length > 0 ? payee.partners.map((partner) => <Mark key={partner.id} partner={partner} />) : <Mark partner={null} />}
                      </span>
                      <span className={styles.payee}>
                        <strong>{payee.name}</strong>
                        <span>{payee.detail}</span>
                      </span>
                      {flow.payees.length > 1 && <span className={styles.payeeAmount}>{formatWon(payee.amount)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className={styles.ledgerTotal}><span>합계</span><strong>{formatWon(flows.reduce((sum, flow) => sum + flow.amount, 0))}</strong></p>
          </div>

          <details className={styles.details}>
            <summary>품목별 수량과 단가 보기</summary>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
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
            <p className={styles.small}>
              모두 견적 전 예상 단가예요.{budget.extra > 0 && ` 리워드 없이 더 보내 주신 ${formatWon(budget.extra)}은 굿즈 없이 수수료만 빼고 홍보·기부로 가요.`}
            </p>
          </details>
        </section>

        {/* ───── 02 내 후원금 ───── */}
        <section id="receipt" className={styles.section} aria-labelledby="receipt-title">
          <div className={styles.sectionHead}>
            <span className={styles.no}>02</span>
            <h2 id="receipt-title">내 후원금은 어디로 가나요</h2>
            <p>리워드를 고르면 한 사람의 후원금을 원 단위까지 나눠 보여드려요.</p>
          </div>

          <div className={styles.receiptLayout}>
            <div role="radiogroup" aria-label="리워드 고르기" className={styles.tierList}>
              {campaign.tiers.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={item.id === tier.id} onClick={() => setTierId(item.id)} className={styles.tierOption}>
                  <span>{item.title}</span>
                  <strong>{formatWon(item.price)}</strong>
                </button>
              ))}
            </div>

            <div className={styles.paper}>
              <div className={styles.receipt}>
                <p className={styles.receiptBrand}>FindUs</p>
                <p className={styles.receiptTitle}>후원금 사용 예상 내역</p>
                <p className={styles.receiptMeta}>{name}님 펀딩 {campaign.round}회차 · {tier.title}</p>

                <p className={styles.receiptSection}>굿즈 제작·배송</p>
                <ul className={styles.receiptLines}>
                  {receipt.lines.map((item) => (
                    <li key={`${item.id}-${item.bonus}`}>
                      <span>
                        {item.label}{item.quantity > 1 && ` ×${item.quantity}`}
                        {item.bonus && <em> 보너스</em>}
                        <small>{partnerById(item.partnerId)?.name ?? "업체 선정 중"}</small>
                      </span>
                      <span className={styles.dots} aria-hidden="true" />
                      <strong>{item.amount.toLocaleString("ko-KR")}</strong>
                    </li>
                  ))}
                </ul>

                <p className={styles.receiptSection}>남은 돈 (홍보 5 : 기부 3)</p>
                <ul className={styles.receiptLines}>
                  {receipt.buckets.slice(1).map((bucket) => (
                    <li key={bucket.id}>
                      <span>{bucketTitle(bucket.id)}<small>{description(bucket.id)}</small></span>
                      <span className={styles.dots} aria-hidden="true" />
                      <strong>{bucket.amount.toLocaleString("ko-KR")}</strong>
                    </li>
                  ))}
                  <li>
                    <span>FindUs 운영비</span>
                    <span className={styles.dots} aria-hidden="true" />
                    <strong>0</strong>
                  </li>
                </ul>

                <p className={styles.receiptTotal}><span>합계</span><strong>{formatWon(receipt.total)}</strong></p>
                <p className={styles.receiptFoot}>견적 기준 예상 금액이에요. 많이 모여 단가가 내려가면 그만큼 홍보·기부가 늘어나요.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───── 03 함께하는 곳 ───── */}
        <section id="partners" className={styles.section} aria-labelledby="partners-title">
          <div className={styles.sectionHead}>
            <span className={styles.no}>03</span>
            <h2 id="partners-title">함께하는 곳</h2>
            <p>실종아동 찾기에 오래 참여해 온 기업과 기관에 먼저 제안해요. 맡는 일과 고른 이유를 그대로 공개해요.</p>
          </div>
          {proposals && (
            <p className={styles.notice}>
              아래는 실종아동 캠페인 이력을 보고 고른 <strong>제안 대상</strong>이에요. 아직 협약 전이라 개발 환경에서만 보이고, 협약을 맺은 곳만 실제 화면에 공개해요.
            </p>
          )}

          {partners.length === 0 ? (
            <p className={styles.empty}>협약을 맺은 곳이 생기면 이곳에 공개해요.</p>
          ) : (
            <ul className={styles.wall}>
              {partners.map((partner) => {
                const amount = paidTo.get(partner.id);
                return (
                  <li key={partner.id} className={styles.tile}>
                    <p className={styles.tileRole}>
                      {roleTitle(partner.role)}
                      {partner.status === "proposal" && <span>제안 단계</span>}
                    </p>
                    <div className={styles.tileMark}><Mark partner={partner} size="lg" /></div>
                    <h3 className={styles.tileName}>{partner.name}</h3>
                    <p className={styles.tileAsk}>{partner.ask}</p>
                    {amount !== undefined && <p className={styles.tileAmount}>이번 회차 예상 <strong>{formatWon(amount)}</strong></p>}
                    <p className={styles.tileWhy}>{partner.why}</p>
                    <p className={styles.sources}>
                      {partner.sources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.label}<ArrowUpRightIcon size={11} /><span className="sr-only"> (새 창)</span>
                        </a>
                      ))}
                    </p>
                  </li>
                );
              })}
              <li className={styles.tile} data-invite="true">
                <p className={styles.tileRole}>함께할 곳</p>
                <h3 className={styles.tileName}>함께할 기업을 찾고 있어요</h3>
                <p className={styles.tileWhy}>키링·에코백 제작사, 실종 지역 홍보 매체, 회차 스폰서와의 협력을 기다려요. 기업 후원 문의 창구는 준비 중이에요.</p>
              </li>
            </ul>
          )}
          <p className={styles.small}>{PARTNER_ROLES.find((role) => role.id === "shipping")?.description}</p>
        </section>

        {/* ───── 04 공개 약속 ───── */}
        <section id="promise" className={styles.section} aria-labelledby="promise-title">
          <div className={styles.sectionHead}>
            <span className={styles.no}>04</span>
            <h2 id="promise-title">언제, 무엇을 공개하나요</h2>
            <p>금액은 세 번 바뀌어요. 바뀔 때마다 이 페이지를 고치고, 마지막에는 영수증까지 올려요.</p>
          </div>

          <ol className={styles.timeline}>
            {DISCLOSURE.map((step) => (
              <li key={step.when} data-now={step.now ?? false}>
                <span className={styles.dot} aria-hidden="true" />
                <strong>{step.when}</strong>
                <span>{step.what}</span>
                {step.now && <em>지금</em>}
              </li>
            ))}
          </ol>

          <div className={styles.promiseGrid}>
            <div>
              <h3>한 번만 드는 돈</h3>
              <p className={styles.small}>후원자 수와 상관없이 회차마다 드는 비용이에요. 후원금이 아니라 회차 스폰서가 맡아요.</p>
              <ul className={styles.fixed}>
                {FIXED_COSTS.map((cost) => (
                  <li key={cost.label}>
                    <span>{cost.label}<small>{cost.note}</small></span>
                    <strong>약 {formatManWon(cost.amount)}원</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>지키는 것</h3>
              <ul className={styles.promises}>
                <li>사용 내역은 날짜 · 항목 · 거래처 · 금액 · 영수증으로 한 줄씩 올려요. 영수증의 개인정보는 가려요.</li>
                <li>{name}님이 가족을 다시 만나면, 남은 홍보비는 가족 동의를 받아 다른 장기 실종아동 홍보에 써요.</li>
                <li>아이의 이름과 사진은 찾기 목적에만 써요. (실종아동법 제15조)</li>
              </ul>
              <h3 className={styles.checkingTitle}>아직 확인 중</h3>
              <ul className={styles.promises} data-tone="muted">
                <li>리워드 펀딩의 부가세 처리 — 세무 확인 후 원가에 넣어요.</li>
                <li>포장재 · 박스 견적 — 지금은 택배비에 포함한 예상값이에요.</li>
              </ul>
            </div>
          </div>
        </section>

        <p className={styles.foot}>단가와 배분 비율은 견적 전 예상값이고, 수량은 예시 모금액에 이 브라우저에서 한 후원을 더해 계산했어요. [가정]</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { formatWon, type Campaign, type FundsBucket } from "@/lib/funding";
import { tierBreakdown } from "@/lib/fundingBudget";
import { useCountUp, useInView } from "@/lib/useMotion";
import { ArrowRightIcon, CheckIcon, HeartIcon, QrIcon, SearchIcon } from "../Icons";

const ICONS: Record<FundsBucket["id"], React.ReactNode> = {
  goods: <QrIcon size={26} />,
  search: <SearchIcon size={26} />,
  family: <HeartIcon size={26} />,
};

/** 갈래별 색: 굿즈 = 공공 블루, 찾기 홍보 = 코랄, 가족 지원 = 남색 */
const BAR: Record<FundsBucket["id"], string> = { goods: "bg-brand", search: "bg-coral", family: "bg-navy" };
const BUCKET: Record<FundsBucket["id"], string> = { goods: "border-t-brand bg-white", search: "border-t-coral bg-[#FFF8F6]", family: "border-t-navy bg-white" };
const BUCKET_ICON: Record<FundsBucket["id"], string> = { goods: "bg-brand-soft text-brand", search: "bg-[#FFE7E2] text-[#E0523F]", family: "bg-[#E6ECF5] text-navy" };

// 부모(group/flow)의 data-visible이 true가 되면 막대와 카드가 차례로 나타난다.
const drop =
  "mx-auto block h-[34px] w-0.5 origin-top scale-y-0 bg-[repeating-linear-gradient(var(--color-navy)_0_5px,transparent_5px_10px)] [transition:scale_.5s_ease_.1s] " +
  "group-data-[visible=true]/flow:scale-y-100 group-data-[visible=true]/flow:animate-flow-down motion-reduce:scale-none motion-reduce:transition-none motion-reduce:animate-none!";
const barPart =
  "flex w-0 items-center justify-center overflow-hidden text-[13px] font-extrabold whitespace-nowrap text-white [transition:width_.9s_cubic-bezier(.2,.8,.2,1)_var(--delay)] " +
  "group-data-[visible=true]/flow:w-(--share) motion-reduce:w-(--share) motion-reduce:transition-none";
const bucketCard =
  "relative translate-y-[14px] rounded-[14px] border border-t-4 border-line p-[18px] opacity-0 [transition:opacity_.5s_ease_var(--delay),translate_.6s_cubic-bezier(.2,.8,.2,1)_var(--delay)] " +
  "group-data-[visible=true]/flow:translate-y-0 group-data-[visible=true]/flow:opacity-100 motion-reduce:translate-none motion-reduce:opacity-100 motion-reduce:transition-none max-md:grid max-md:grid-cols-[46px_1fr] max-md:gap-x-3";
const promise = "flex items-start gap-2 text-[14px] leading-[1.55] font-semibold break-keep text-navy";
const promiseIcon = "mt-[3px] shrink-0 text-brand";

function Amount({ value, start }: { value: number; start: boolean }) {
  const shown = useCountUp(value, { start, duration: 900 });
  return <>{formatWon(shown)}</>;
}

/**
 * 모인 돈이 가는 길. 후원금이 세 갈래로 나뉘는 모습을 막대와 카드로 보여준다.
 * 아이를 내건 펀딩이라 찾기 목적에만 쓰고, 운영비는 넣지 않는다.
 * 굿즈 제작·배송은 리워드별 실제 원가라 리워드마다 몫이 달라진다.
 */
export default function FundsFlow({ campaign, raised }: { campaign: Campaign; raised: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const shipping = campaign.tiers.filter((tier) => tier.needsShipping);
  const [tierId, setTierId] = useState(shipping.find((tier) => tier.id === "ecobag")?.id ?? shipping[0]?.id ?? campaign.tiers[0].id);
  const tier = campaign.tiers.find((item) => item.id === tierId)!;
  const parts = tierBreakdown(tier, raised, campaign).buckets;
  const percent = (index: number) => Math.round(parts[index].ratio * 100);
  const name = campaign.child.name;
  const title = (bucket: FundsBucket) => (bucket.id === "search" ? `${name}님 찾기 홍보` : bucket.title);

  return (
    <div ref={ref} className="group/flow mt-7 rounded-3xl border border-line bg-[linear-gradient(180deg,#fff,#F7F9FC)] p-7 max-md:px-4 max-md:py-5" data-visible={inView}>
      <div>
        <h3 className="text-[20px] font-extrabold tracking-[-0.3px] break-keep">모인 돈은 {name}님을 찾는 데에만 써요</h3>
        <p className="mt-1.5 text-[14px] leading-[1.6] break-keep text-muted">FindUs 운영비는 이 펀딩에서 쓰지 않아요. 운영비는 기업 후원으로 마련해요.</p>
      </div>

      <div role="group" aria-label="리워드 고르기" className="mt-[18px] flex flex-wrap gap-1.5">
        {shipping.map((item) => (
          <button key={item.id} type="button" aria-pressed={item.id === tierId} onClick={() => setTierId(item.id)}
            className="rounded-full border border-line bg-white px-[11px] py-[7px] text-[12px] font-bold text-muted [transition:all_.2s] hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">
            {item.title} {formatWon(item.price)}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-[26px] flex w-max flex-col items-center rounded-2xl bg-navy px-[26px] py-3 text-white shadow-[0_10px_24px_rgb(23_59_112/20%)]">
        <span className="text-[12px] font-bold text-[#B9D9FC]">내 후원금</span>
        <strong className="text-[24px] font-extrabold tabular-nums"><Amount value={tier.price} start={inView} /></strong>
      </div>
      <span className={drop} aria-hidden="true" />

      <div className="flex h-11 overflow-hidden rounded-xl bg-[#E3EAF3]" role="img" aria-label={campaign.fundsPlan.map((bucket, index) => `${title(bucket)} ${percent(index)}%`).join(", ")}>
        {campaign.fundsPlan.map((bucket, index) => (
          <span key={bucket.id} data-bucket={bucket.id} className={`${barPart} ${BAR[bucket.id]}`} style={{ "--share": `${parts[index].ratio * 100}%`, "--delay": `${200 + index * 250}ms` } as React.CSSProperties}>
            {percent(index)}%
          </span>
        ))}
      </div>

      <ol className="mt-4 grid grid-cols-[1.2fr_1fr_1fr] gap-3 max-md:grid-cols-[1fr]">
        {campaign.fundsPlan.map((bucket, index) => (
          <li key={bucket.id} data-bucket={bucket.id} className={`${bucketCard} ${BUCKET[bucket.id]}`} style={{ "--delay": `${600 + index * 200}ms` } as React.CSSProperties}>
            <span className={`grid size-[46px] place-items-center rounded-xl max-md:row-span-3 ${BUCKET_ICON[bucket.id]}`} aria-hidden="true">{ICONS[bucket.id]}</span>
            <p className="mt-3 text-[15px] font-extrabold break-keep max-md:mt-0">{title(bucket)} <span className="ml-1 text-[13px] font-bold text-muted">{percent(index)}%</span></p>
            <p className={`mt-0.5 text-[22px] font-extrabold tabular-nums ${bucket.id === "search" ? "text-coral-deep" : "text-navy"}`}><Amount value={parts[index].amount} start={inView} /></p>
            <p className="mt-1.5 text-[13px] leading-[1.6] break-keep text-muted max-md:col-[2]">{bucket.description}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-5 flex flex-col gap-2 rounded-[14px] bg-brand-soft px-[18px] py-4">
        <li className={promise}><CheckIcon size={16} strokeWidth={2.4} className={promiseIcon} />마감 후 영수증까지 사용 내역을 공개해요</li>
        <li className={promise}><CheckIcon size={16} strokeWidth={2.4} className={promiseIcon} />{name}님이 가족을 다시 만나면, 남은 홍보비는 가족 동의를 받아 다른 장기 실종아동 홍보에 써요</li>
        <li className={promise}><CheckIcon size={16} strokeWidth={2.4} className={promiseIcon} />아이의 이름과 사진은 찾기 목적에만 써요 (실종아동법 제15조)</li>
      </ul>
      <Link href={`/funding/${campaign.id}/budget?tier=${tier.id}`} className="mt-3 flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-[14px] font-extrabold text-navy [transition:border-color_.2s,color_.2s] hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        어디서 만들고 어떻게 쓰는지 자세히 보기 <ArrowRightIcon size={16} />
      </Link>
      <p className="mt-2.5 text-[12px] text-subtle">굿즈 원가는 견적 전 예상 단가로 계산했어요. 남은 돈은 홍보 5 : 기부 3으로 나누고, 비율과 기부처는 공개 전에 확정해요. [가정]</p>
    </div>
  );
}

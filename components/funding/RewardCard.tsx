import Link from "next/link";
import { formatWon, remainingStock, type Campaign, type RewardTier } from "@/lib/funding";
import GoodsStage from "./GoodsStage";
import { reward, rewardLink, rewardPrice, rewardTitle } from "./styles";

export default function RewardCard({ campaign, tier, sold, canBack, popular = false }: { campaign: Campaign; tier: RewardTier; sold: number; canBack: boolean; popular?: boolean }) {
  const left = remainingStock(tier, sold);
  const soldOut = left === 0;
  const disabled = !canBack || soldOut;
  const body = (
    <>
      <div className="flex justify-between gap-2.5">
        <div>
          <p className={rewardPrice}>{formatWon(tier.price)} +</p>
          <h3 className={rewardTitle}>{tier.title}{popular && <span className="rounded-full bg-coral-soft px-[7px] py-0.5 text-[11px] font-extrabold text-coral-ink">인기</span>}</h3>
        </div>
        <GoodsStage kinds={tier.stage} label="" idPrefix={`reward-${tier.id}`} still className="-mt-1 w-[128px] shrink-0 [[data-disabled=true]_&]:opacity-50" />
      </div>
      <ul className="mt-2.5 text-[13px] leading-[1.7] text-ink">
        {tier.items.map((item) => <li key={item} className="before:mr-1.5 before:text-subtle before:content-['·']">{item}</li>)}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1 border-t border-dashed border-line pt-3 text-[12px] text-muted">
        <span>{tier.needsShipping ? campaign.deliveryNote : "배송 없음 · 바로 감사 카드 발송"}</span>
        {tier.sizeCount > 0 && <span>사이즈 선택</span>}
        {left !== null && <span className={soldOut ? "font-extrabold text-muted line-through" : "font-extrabold text-coral-ink"}>{soldOut ? "마감" : `${left}개 남음`}</span>}
        <span>{sold.toLocaleString("ko-KR")}명 선택</span>
      </p>
    </>
  );
  return disabled ? (
    <div className={reward} aria-disabled="true" data-disabled="true">{body}</div>
  ) : (
    <Link href={`/funding/${campaign.id}/checkout?tier=${tier.id}`} className={rewardLink} aria-label={`${tier.title} ${formatWon(tier.price)} 선택하기`}>{body}</Link>
  );
}

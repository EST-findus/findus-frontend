import Link from "next/link";
import { formatWon, remainingStock, type Campaign, type RewardTier } from "@/lib/funding";
import GoodsStage from "./GoodsStage";
import styles from "./Funding.module.css";

export default function RewardCard({ campaign, tier, sold, canBack, popular = false }: { campaign: Campaign; tier: RewardTier; sold: number; canBack: boolean; popular?: boolean }) {
  const left = remainingStock(tier, sold);
  const soldOut = left === 0;
  const disabled = !canBack || soldOut;
  const body = (
    <>
      <div className={styles.rewardTop}>
        <div>
          <p className={styles.rewardPrice}>{formatWon(tier.price)} +</p>
          <h3 className={styles.rewardTitle}>{tier.title}{popular && <span className={styles.rewardPopular}>인기</span>}</h3>
        </div>
        <GoodsStage kinds={tier.stage} label="" idPrefix={`reward-${tier.id}`} still className={styles.rewardStage} />
      </div>
      <ul className={styles.rewardItems}>
        {tier.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className={styles.rewardMeta}>
        <span>{tier.needsShipping ? campaign.deliveryNote : "배송 없음 · 바로 감사 카드 발송"}</span>
        {tier.sizeCount > 0 && <span>사이즈 선택</span>}
        {left !== null && <span className={soldOut ? styles.rewardSoldOut : styles.rewardLeft}>{soldOut ? "마감" : `${left}개 남음`}</span>}
        <span>{sold.toLocaleString("ko-KR")}명 선택</span>
      </p>
    </>
  );
  return disabled ? (
    <div className={styles.reward} aria-disabled="true" data-disabled="true">{body}</div>
  ) : (
    <Link href={`/funding/${campaign.id}/checkout?tier=${tier.id}`} className={styles.reward} aria-label={`${tier.title} ${formatWon(tier.price)} 선택하기`}>{body}</Link>
  );
}

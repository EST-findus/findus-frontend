"use client";

import Link from "next/link";
import { useState } from "react";
import { formatWon, type Campaign, type FundsBucket } from "@/lib/funding";
import { tierBreakdown } from "@/lib/fundingBudget";
import { useCountUp, useInView } from "@/lib/useMotion";
import { ArrowRightIcon, CheckIcon, HeartIcon, QrIcon, SearchIcon } from "../Icons";
import styles from "./FundsFlow.module.css";

const ICONS: Record<FundsBucket["id"], React.ReactNode> = {
  goods: <QrIcon size={26} />,
  search: <SearchIcon size={26} />,
  family: <HeartIcon size={26} />,
};

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
    <div ref={ref} className={styles.flow} data-visible={inView}>
      <div className={styles.head}>
        <h3>모인 돈은 {name}님을 찾는 데에만 써요</h3>
        <p>FindUs 운영비는 이 펀딩에서 쓰지 않아요. 운영비는 기업 후원으로 마련해요.</p>
      </div>

      <div role="group" aria-label="리워드 고르기" className={styles.chips}>
        {shipping.map((item) => (
          <button key={item.id} type="button" aria-pressed={item.id === tierId} onClick={() => setTierId(item.id)} className={styles.chip}>
            {item.title} {formatWon(item.price)}
          </button>
        ))}
      </div>

      <div className={styles.source}>
        <span className={styles.sourceLabel}>내 후원금</span>
        <strong><Amount value={tier.price} start={inView} /></strong>
      </div>
      <span className={styles.drop} aria-hidden="true" />

      <div className={styles.bar} role="img" aria-label={campaign.fundsPlan.map((bucket, index) => `${title(bucket)} ${percent(index)}%`).join(", ")}>
        {campaign.fundsPlan.map((bucket, index) => (
          <span key={bucket.id} data-bucket={bucket.id} style={{ "--share": `${parts[index].ratio * 100}%`, "--delay": `${200 + index * 250}ms` } as React.CSSProperties}>
            {percent(index)}%
          </span>
        ))}
      </div>

      <ol className={styles.buckets}>
        {campaign.fundsPlan.map((bucket, index) => (
          <li key={bucket.id} data-bucket={bucket.id} style={{ "--delay": `${600 + index * 200}ms` } as React.CSSProperties}>
            <span className={styles.bucketIcon} aria-hidden="true">{ICONS[bucket.id]}</span>
            <p className={styles.bucketTitle}>{title(bucket)} <span>{percent(index)}%</span></p>
            <p className={styles.bucketAmount}><Amount value={parts[index].amount} start={inView} /></p>
            <p className={styles.bucketText}>{bucket.description}</p>
          </li>
        ))}
      </ol>

      <ul className={styles.promises}>
        <li><CheckIcon size={16} strokeWidth={2.4} />마감 후 영수증까지 사용 내역을 공개해요</li>
        <li><CheckIcon size={16} strokeWidth={2.4} />{name}님이 가족을 다시 만나면, 남은 홍보비는 가족 동의를 받아 다른 장기 실종아동 홍보에 써요</li>
        <li><CheckIcon size={16} strokeWidth={2.4} />아이의 이름과 사진은 찾기 목적에만 써요 (실종아동법 제15조)</li>
      </ul>
      <Link href={`/funding/${campaign.id}/budget?tier=${tier.id}`} className={styles.more}>
        어디서 만들고 어떻게 쓰는지 자세히 보기 <ArrowRightIcon size={16} />
      </Link>
      <p className={styles.note}>굿즈 원가는 견적 전 예상 단가로 계산했어요. 남은 돈은 홍보 5 : 기부 3으로 나누고, 비율과 기부처는 공개 전에 확정해요. [가정]</p>
    </div>
  );
}

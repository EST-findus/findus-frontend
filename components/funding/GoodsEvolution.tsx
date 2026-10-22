"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { bonusesFor, formatManWon, formatWon, newGoods, tierForAmount, type Campaign, type GoodsKind } from "@/lib/funding";
import { useCountUp, useInView, useReducedMotion } from "@/lib/useMotion";
import { ArrowRightIcon, SparklesIcon } from "../Icons";
import GoodsStage from "./GoodsStage";
import styles from "./Funding.module.css";

const GOODS_LABEL: Record<GoodsKind, string> = {
  card: "감사·안내 카드",
  keyring: "QR 키링",
  ecobag: "캔버스 에코백",
  tshirt: "반사 QR 티셔츠",
  hoodie: "자수 로고 후드",
  extras: "티셔츠·키링 추가",
  numbered: "한정 넘버링 카드",
};

// 들어오면 응원 → 키링 → 에코백까지 한 번 보여주고 멈춘다.
const INTRO = ["cheer", "keyring", "ecobag"] as const;

export default function GoodsEvolution({ campaign, raised, canBack }: { campaign: Campaign; raised: number; canBack: boolean }) {
  const MIN = campaign.tiers[0].price;
  const MAX = campaign.tiers.at(-1)!.price;
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [amount, setAmount] = useState<number>(MIN);
  const touched = useRef(false);
  const sliderId = useId();
  const tier = tierForAmount(amount, campaign)!;
  const shown = useCountUp(amount, { from: MIN, duration: 600 });
  const fresh = newGoods(tier.id, campaign);
  const bonuses = bonusesFor(tier.id, raised, campaign);

  useEffect(() => {
    if (!inView || reduced || touched.current) return;
    const timers = INTRO.slice(1).map((id, i) => window.setTimeout(() => {
      if (!touched.current) setAmount(campaign.tiers.find((t) => t.id === id)!.price);
    }, 900 + i * 1500));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, reduced, campaign]);

  const choose = (value: number) => {
    touched.current = true;
    setAmount(value);
  };

  return (
    <div ref={ref} className={styles.evolution}>
      <div className={styles.evolutionStage}>
        <GoodsStage kinds={tier.stage} highlight={fresh} label={`${tier.title} 구성: ${tier.stage.map((kind) => GOODS_LABEL[kind]).join(", ")}`} idPrefix="evolution" />
      </div>
      <div className={styles.evolutionPanel}>
        <div role="group" aria-label="후원 금액 단계" className={styles.chips}>
          {campaign.tiers.map((item) => (
            <button key={item.id} type="button" aria-pressed={item.id === tier.id} onClick={() => choose(item.price)} className={styles.chip}>
              {item.price >= 10_000 ? `${formatManWon(item.price)}원` : `${item.price / 1000}천원`}
            </button>
          ))}
        </div>
        <label htmlFor={sliderId} className="sr-only">내 후원 금액</label>
        <input
          id={sliderId} type="range" min={MIN} max={MAX} step={1000} value={amount}
          onChange={(event) => choose(Number(event.target.value))}
          aria-valuetext={`${formatWon(amount)}, ${tier.title}`}
          className={styles.slider}
          style={{ "--fill": `${((amount - MIN) / (MAX - MIN)) * 100}%` } as React.CSSProperties}
        />
        <p className={styles.evolutionAmount} aria-live="polite">
          <span className={styles.evolutionAmountValue}>{formatWon(shown)}</span>
          <span>이면 <strong>{tier.title}</strong></span>
        </p>
        <ul className={styles.evolutionItems}>
          {tier.stage.map((kind) => (
            <li key={kind} data-fresh={fresh.includes(kind)}>
              {GOODS_LABEL[kind]}
              {fresh.includes(kind) && <span className={styles.newBadge}>NEW</span>}
            </li>
          ))}
        </ul>
        {bonuses.length > 0 && (
          <p className={styles.evolutionBonus}><SparklesIcon size={16} />지금 모금액이면 보너스: {bonuses.join(" · ")}</p>
        )}
        {canBack && (
          <Link href={`/funding/${campaign.id}/checkout?tier=${tier.id}`} className={styles.primaryButton}>
            {tier.title} {formatWon(tier.price)}로 후원하기 <ArrowRightIcon size={17} />
          </Link>
        )}
      </div>
    </div>
  );
}

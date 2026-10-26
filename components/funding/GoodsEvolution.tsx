"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { bonusesFor, formatManWon, formatWon, newGoods, tierForAmount, type Campaign, type GoodsKind } from "@/lib/funding";
import { useCountUp, useInView, useReducedMotion } from "@/lib/useMotion";
import { ArrowRightIcon, SparklesIcon } from "../Icons";
import GoodsStage from "./GoodsStage";
import { FOCUS_RING, primaryButton } from "./styles";

const CHIP = `rounded-full border border-line bg-white px-[11px] py-[7px] text-[13px] font-bold text-muted [transition:all_.2s] hover:border-brand hover:text-brand aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white ${FOCUS_RING}`;
const SLIDER_THUMB = "[&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgb(150_61_50/35%)] [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-coral [&::-moz-range-thumb]:shadow-[0_2px_8px_rgb(150_61_50/35%)]";

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
    <div ref={ref} className="mt-7 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-7 rounded-3xl bg-[linear-gradient(160deg,#F3F8FF,#FFF5F2)] p-7 max-lg:grid-cols-1 max-sm:px-4 max-sm:py-5">
      <div className="self-center">
        <GoodsStage kinds={tier.stage} highlight={fresh} label={`${tier.title} 구성: ${tier.stage.map((kind) => GOODS_LABEL[kind]).join(", ")}`} idPrefix="evolution" />
      </div>
      <div className="flex flex-col">
        <div role="group" aria-label="후원 금액 단계" className="flex flex-wrap gap-1.5">
          {campaign.tiers.map((item) => (
            <button key={item.id} type="button" aria-pressed={item.id === tier.id} onClick={() => choose(item.price)} className={CHIP}>
              {item.price >= 10_000 ? `${formatManWon(item.price)}원` : `${item.price / 1000}천원`}
            </button>
          ))}
        </div>
        <label htmlFor={sliderId} className="sr-only">내 후원 금액</label>
        <input
          id={sliderId} type="range" min={MIN} max={MAX} step={1000} value={amount}
          onChange={(event) => choose(Number(event.target.value))}
          aria-valuetext={`${formatWon(amount)}, ${tier.title}`}
          className={`mt-[18px] h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,var(--color-coral)_var(--fill),#DCE5F0_var(--fill))] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brand ${SLIDER_THUMB}`}
          style={{ "--fill": `${((amount - MIN) / (MAX - MIN)) * 100}%` } as React.CSSProperties}
        />
        <p className="mt-5 flex flex-wrap items-baseline gap-1.5 text-[16px]" aria-live="polite">
          <span className="text-[30px] font-extrabold text-navy tabular-nums">{formatWon(shown)}</span>
          <span>이면 <strong className="text-coral-ink">{tier.title}</strong></span>
        </p>
        <ul className="mt-3.5 flex flex-col gap-1.5">
          {tier.stage.map((kind) => (
            <li key={kind} data-fresh={fresh.includes(kind)} className="flex items-center gap-2 rounded-[10px] bg-[rgb(255_255_255/80%)] px-3 py-[9px] text-[14px] font-semibold data-[fresh=true]:bg-white data-[fresh=true]:shadow-[inset_0_0_0_2px_var(--color-coral)] motion-safe:data-[fresh=true]:animate-funding-fresh-in">
              {GOODS_LABEL[kind]}
              {fresh.includes(kind) && <span className="ml-auto rounded-full bg-coral px-[7px] py-0.5 text-[10px] font-extrabold tracking-[.05em] text-white">NEW</span>}
            </li>
          ))}
        </ul>
        {bonuses.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-brand"><SparklesIcon size={16} />지금 모금액이면 보너스: {bonuses.join(" · ")}</p>
        )}
        {canBack && (
          <Link href={`/funding/${campaign.id}/checkout?tier=${tier.id}`} className={`${primaryButton} mt-5`}>
            {tier.title} {formatWon(tier.price)}로 후원하기 <ArrowRightIcon size={17} />
          </Link>
        )}
      </div>
    </div>
  );
}

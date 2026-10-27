"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { DEMO_IMAGE, DEMO_PHOTOS, DEMO_STEPS, FACE_BOX, FEATURE_LINES, FEATURE_POINTS, FIVE_POINTS } from "@/lib/aiDemo";
import { useCountUp, useInView, useReducedMotion } from "@/lib/useMotion";

const STEP_MS = 6500;
const BRAND = "#2468C5";
const ACCENT = "#FFD25A";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
// 기본 스타일이 '완성된 장면'이고 애니메이션은 그 장면으로 들어가는 과정만 그린다. 동작 줄이기를 켜면 완성된 장면이 그대로 보인다.
const SCAN = "opacity-0 animate-ai-scan motion-reduce:animate-none";
const DRAW = "[stroke-dasharray:1] [stroke-dashoffset:0] animate-ai-draw motion-reduce:animate-none";
const POP = "origin-center [transform-box:fill-box] animate-ai-pop motion-reduce:animate-none";
const FADE = "animate-ai-fade motion-reduce:animate-none";
const BAR = "origin-bottom [transform-box:fill-box] animate-ai-grow motion-reduce:animate-none";
const LAYER = "[transition:opacity_.6s_ease] motion-reduce:[transition:none]";
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** 사진 한 장이 AI 예상 모습이 되는 과정을 단계별 애니메이션으로 보여준다. */
export default function AiPipelineDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hairPick, setHairPick] = useState<string | null>(null);
  const auto = playing && inView && !reduced;
  const current = DEMO_STEPS[step];

  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % DEMO_STEPS.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [auto, step]);

  const choose = (index: number) => { setStep(index); setPlaying(false); setHairPick(null); };

  return (
    <div ref={ref} className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] max-md:gap-6">
      <figure className="mx-auto w-full max-w-105 md:sticky md:top-24">
        <div className="relative isolate aspect-[543/724] overflow-hidden rounded-[28px] bg-[#e9ecea] shadow-[0_24px_48px_rgba(20,40,30,.14)]">
          <div className="absolute inset-0 origin-[50%_48%] [transition:transform_1.2s_cubic-bezier(.2,.8,.2,1)] data-[zoomed=true]:[transform:scale(1.16)] motion-reduce:[transition:none]" data-zoomed={current.key === "align"}>
            <Image quality={90} src={DEMO_PHOTOS.past} alt="" fill sizes="420px" className="object-cover" priority />
            {["age", "hair", "result"].includes(current.key) && <Image quality={90} key={`aged-${step}`} src={DEMO_PHOTOS.aged} alt="" fill sizes="420px" className={`object-cover ${current.key === "age" ? "animate-ai-age-in motion-reduce:animate-none" : ""}`} />}
            {current.key === "hair" && DEMO_PHOTOS.styles.slice(1).map((style, i) => (
              <Image quality={90} key={`${style.key}-${step}-${hairPick}`} src={style.src} alt="" fill sizes="420px"
                className={`object-cover ${hairPick ? LAYER : i === 0 ? "opacity-0 animate-ai-hair-a motion-reduce:animate-none" : "opacity-0 animate-ai-hair-b motion-reduce:animate-none"}`}
                style={hairPick ? { opacity: hairPick === style.key ? 1 : 0 } : undefined} />
            ))}
            <StageOverlay key={step} stepKey={current.key} />
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-sm">{current.model}</span>
          {current.key === "age" && <AgeBadge key={`age-${step}`} />}
        </div>
        {current.key === "hair" && (
          <div role="group" aria-label="머리 모양 골라 보기" className="mt-3 flex justify-center gap-2">
            {DEMO_PHOTOS.styles.map((style) => (
              <button key={style.key} type="button" aria-pressed={hairPick === style.key} onClick={() => { setHairPick(style.key); setPlaying(false); }}
                className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13px] font-bold transition-colors ${hairPick === style.key ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand"} ${FOCUS}`}>
                <span className="relative h-7 w-7 overflow-hidden rounded-full"><Image quality={90} src={style.src} alt="" fill sizes="28px" className="object-cover" /></span>{style.label}
              </button>
            ))}
          </div>
        )}
        <figcaption className="mt-3 text-center text-[12.5px] text-muted">가상 인물 예시 · 점과 선은 작동 방식을 보여주기 위한 시연이에요.</figcaption>
      </figure>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-[14px] font-bold text-brand">{step + 1} / {DEMO_STEPS.length} 단계</p>
          {!reduced && <button type="button" onClick={() => setPlaying(!playing)} className={`rounded-full border border-line px-4 py-1.5 text-[13px] font-bold hover:border-brand hover:text-brand ${FOCUS}`}>{playing ? "일시정지" : "자동 재생"}</button>}
        </div>
        <ol className="flex flex-col gap-2">
          {DEMO_STEPS.map((item, index) => {
            const active = index === step;
            return (
              <li key={item.key}>
                <button type="button" aria-current={active ? "step" : undefined} onClick={() => choose(index)}
                  className={`relative w-full overflow-hidden rounded-2xl border text-left transition-colors ${active ? "border-brand bg-brand-soft/50" : "border-line bg-card hover:border-brand/50"} ${FOCUS}`}>
                  <span className="flex items-center gap-4 px-5 py-4 max-sm:gap-3 max-sm:px-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold ${active ? "bg-brand text-white" : "bg-surface text-muted"}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[22px] leading-snug font-extrabold tracking-tight break-keep max-sm:text-[19px] ${active ? "text-ink" : "text-ink/70"}`}>{item.title}</span>
                      <span className="mt-0.5 block text-[12.5px] font-semibold text-muted">{item.model}</span>
                    </span>
                  </span>
                  {active && <span className="block px-5 pb-5 pl-19 max-sm:px-4 max-sm:pl-17">
                    <span className="block text-[17px] leading-[1.7] break-keep text-ink/85 max-sm:text-[16px]">{item.text}</span>
                    {item.detail && <span className="mt-2 block text-[14px] leading-relaxed break-keep text-muted">{item.detail}</span>}
                  </span>}
                  {active && <span aria-hidden="true" data-paused={!auto} className={`absolute bottom-0 left-0 h-1 w-full bg-brand origin-left animate-ai-progress data-[paused=true]:animate-none data-[paused=true]:[transform:scaleX(0)] motion-reduce:animate-none motion-reduce:[transform:scaleX(0)]`} style={{ "--ms": `${STEP_MS}ms` } as CSSProperties} />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function AgeBadge() {
  const age = useCountUp(DEMO_PHOTOS.ageTo, { from: DEMO_PHOTOS.ageFrom, duration: 2600 });
  return (
    <span className="absolute right-3 bottom-3 rounded-2xl bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
      <span className="block text-[11px] font-bold text-white/75">목표 나이</span>
      <span className="block text-[30px] leading-none font-extrabold tabular-nums">{Math.round(age)}<span className="ml-0.5 text-[16px]">세</span></span>
    </span>
  );
}

function StageOverlay({ stepKey }: { stepKey: string }) {
  const [x, y, w, h] = FACE_BOX;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${DEMO_IMAGE.width} ${DEMO_IMAGE.height}`} preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full">
      {stepKey === "detect" && <>
        <rect className={SCAN} x="0" y="150" width={DEMO_IMAGE.width} height="4" fill={ACCENT} />
        <rect className={DRAW} style={delay(500)} pathLength={1} x={x} y={y} width={w} height={h} rx="18" fill="none" stroke={ACCENT} strokeWidth="4" />
        <text className={FADE} style={delay(1200)} x={x} y={y - 12} fill={ACCENT} fontSize="22" fontWeight="800">얼굴</text>
        {FIVE_POINTS.map(([cx, cy], i) => <circle key={i} className={POP} style={delay(1400 + i * 180)} cx={cx} cy={cy} r="9" fill={ACCENT} stroke="#fff" strokeWidth="3" />)}
      </>}

      {stepKey === "align" && <>
        <line className={DRAW} pathLength={1} x1="40" y1="316" x2="503" y2="316" stroke={ACCENT} strokeWidth="3" />
        <text className={FADE} style={delay(700)} x="44" y="304" fill={ACCENT} fontSize="20" fontWeight="800">눈높이 수평</text>
        <rect className={DRAW} style={delay(900)} pathLength={1} x="96" y="176" width="350" height="350" fill="none" stroke="#fff" strokeWidth="4" />
        <text className={FADE} style={delay(1700)} x="271" y="556" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">1024 × 1024</text>
        {FIVE_POINTS.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="7" fill={ACCENT} stroke="#fff" strokeWidth="2" />)}
      </>}

      {stepKey === "encode" && <>
        {FEATURE_LINES.map(([from, to, closed], i) => {
          const pts = FEATURE_POINTS.slice(from, to + 1);
          const d = `M${pts.map(([px, py]) => `${px} ${py}`).join(" L")}${closed ? " Z" : ""}`;
          return <path key={i} className={DRAW} style={delay(1500 + i * 120)} pathLength={1} d={d} fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2" />;
        })}
        {FEATURE_POINTS.map(([cx, cy], i) => <circle key={i} className={POP} style={delay(i * 28)} cx={cx} cy={cy} r="4.5" fill={ACCENT} />)}
        <rect className={FADE} style={delay(2000)} x="20" y="604" width="503" height="100" rx="16" fill="rgba(0,0,0,.55)" />
        <text className={FADE} style={delay(2000)} x="40" y="634" fill="#fff" fontSize="18" fontWeight="800">18단계 × 512개 숫자</text>
        {Array.from({ length: 18 }, (_, i) => {
          const barH = 14 + Math.round(Math.abs(Math.sin(i * 1.7 + 0.4)) * 40);
          return <rect key={i} className={BAR} style={delay(2200 + i * 60)} x={40 + i * 26} y={692 - barH} width="16" height={barH} rx="3" fill={i % 3 === 0 ? ACCENT : BRAND} />;
        })}
      </>}

      {stepKey === "hair" && <>
        <ellipse className={DRAW} pathLength={1} cx="278" cy="322" rx="122" ry="152" fill="none" stroke="#fff" strokeWidth="3" />
        <rect className={FADE} style={delay(600)} x="178" y="490" width="200" height="40" rx="20" fill="rgba(0,0,0,.6)" />
        <text className={FADE} style={delay(600)} x="278" y="517" textAnchor="middle" fill="#fff" fontSize="19" fontWeight="800">얼굴은 그대로</text>
        <text className={FADE} style={delay(900)} x="40" y="120" fill={ACCENT} fontSize="22" fontWeight="800">머리만 바꿔요</text>
      </>}

      {stepKey === "result" && <g className="origin-center [transform:rotate(-8deg)] [transform-box:fill-box] animate-ai-stamp motion-reduce:animate-none">
        <rect x="300" y="40" width="210" height="66" rx="12" fill="rgba(255,255,255,.92)" stroke={BRAND} strokeWidth="4" />
        <text x="405" y="70" textAnchor="middle" fill={BRAND} fontSize="24" fontWeight="900">AI 생성</text>
        <text x="405" y="95" textAnchor="middle" fill={BRAND} fontSize="16" fontWeight="800">참고용 이미지</text>
      </g>}
    </svg>
  );
}

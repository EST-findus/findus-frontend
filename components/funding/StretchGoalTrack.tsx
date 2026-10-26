"use client";

import { useState } from "react";
import { formatManWon, formatWon, nextGoal, trackPosition, type Campaign, type StretchGoal } from "@/lib/funding";
import { useCountUp, useInView } from "@/lib/useMotion";
import { CheckIcon, LockIcon } from "../Icons";
import GoodsStage from "./GoodsStage";
import { FOCUS_RING } from "./styles";

// 펼친 골 미리보기의 문단. 상태 줄·안내 문구가 같은 p라 기본값을 함께 둔다.
const PREVIEW_TEXT = "text-[14px] leading-[1.65] break-keep";

const FILL_MS = 2400;

// 골 점: 달성하면 브랜드 색, 다음 골은 숨 쉬듯 빛난다. 화면에 들어오면(data-visible) 달성한 골이 차례로 열린다.
const MILESTONE_DOT = "relative grid size-8 place-items-center rounded-full border-3 border-white bg-[#C5D1E0] text-white shadow-[0_2px_6px_rgb(23_59_112/15%)] [transition:background-color_.4s_ease,transform_.4s_cubic-bezier(.34,1.56,.64,1)] [transition-delay:var(--delay)] group-data-[done=true]/milestone:bg-brand motion-safe:group-data-[visible=true]/stretch:group-data-[done=true]/milestone:animate-funding-unlock group-data-[next=true]/milestone:bg-white group-data-[next=true]/milestone:text-coral group-data-[next=true]/milestone:shadow-[0_0_0_3px_var(--color-coral)] motion-safe:group-data-[next=true]/milestone:animate-funding-breathe";

const PREVIEW_STAGE = "w-[180px] max-sm:w-[150px]";

function GoalPreview({ goal, raised }: { goal: StretchGoal; raised: number }) {
  const done = raised >= goal.amount;
  return (
    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-2xl bg-brand-soft px-[22px] py-5 motion-safe:animate-funding-fresh-in-soft max-sm:grid-cols-1" aria-live="polite">
      <div>
        <p className={`${PREVIEW_TEXT} inline-flex items-center gap-[5px] font-extrabold text-coral-ink data-[done=true]:text-[#1D6B43]`} data-done={done}>
          {done ? <><CheckIcon size={15} />달성했어요</> : <><LockIcon size={15} />{formatWon(goal.amount - raised)} 남았어요</>}
        </p>
        <h3 className="mt-1.5 text-[18px] font-extrabold">{formatManWon(goal.amount)} 원 · {goal.title}</h3>
        <p className={`${PREVIEW_TEXT} mt-1`}>{goal.description}</p>
        {goal.needsChoice && <p className="mt-2 text-[13px] leading-[1.65] break-keep text-muted">이미 후원한 분께도 선택 링크를 보내요. 로그인한 후원자는 마이페이지에서 고를 수 있어요.</p>}
      </div>
      {goal.amount === 10_000_000 && (
        <GoodsStage kinds={["card", "keyring", "ecobag"]} highlight={["ecobag"]} label="QR 키링 세트에 에코백이 추가된 모습" idPrefix="goal" still className={PREVIEW_STAGE} />
      )}
      {goal.amount === 5_000_000 && (
        <GoodsStage kinds={["keyring"]} label="키링 디자인" idPrefix="goal5" still className={PREVIEW_STAGE} />
      )}
    </div>
  );
}

export default function StretchGoalTrack({ campaign, raised }: { campaign: Campaign; raised: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const goals = campaign.stretchGoals;
  const position = trackPosition(raised, campaign);
  const shown = useCountUp(raised, { start: inView, duration: FILL_MS });
  const [selected, setSelected] = useState<number | null>(null);
  const active = goals.find((goal) => goal.amount === selected) ?? nextGoal(raised, campaign) ?? goals.at(-1)!;

  return (
    <div ref={ref} className="group/stretch mt-7 rounded-3xl border border-line bg-white px-7 pt-7 pb-6 max-sm:px-4 max-sm:py-5" data-visible={inView}>
      <p className="text-[15px] text-muted">
        지금까지 <strong className="text-[24px] font-extrabold text-navy tabular-nums">{formatWon(shown)}</strong>
      </p>
      <div className="relative mt-[34px] mr-[34px] ml-2.5 pb-[78px] max-sm:mr-[18px] max-sm:ml-2 max-sm:pb-24" style={{ "--position": inView ? position : 0, "--fill-ms": `${FILL_MS}ms` } as React.CSSProperties}>
        <div className="h-3 overflow-hidden rounded-full bg-[#E3EAF3]"><div className="h-full w-[calc(var(--position)*100%)] rounded-[inherit] bg-[linear-gradient(90deg,var(--color-brand),var(--color-coral))] [transition:width_var(--fill-ms)_cubic-bezier(.25,.6,.3,1)]" /></div>
        <ol className="absolute inset-0">
          {goals.map((goal, index) => {
            const at = (index + 1) / goals.length;
            const done = raised >= goal.amount;
            return (
              <li key={goal.amount} className="absolute -top-2.5 [translate:-50%_0]" style={{ left: `${at * 100}%`, "--delay": `${Math.round((at / Math.max(position, 0.01)) * FILL_MS * 0.9)}ms` } as React.CSSProperties}>
                <button
                  type="button"
                  aria-pressed={active.amount === goal.amount}
                  aria-label={`${formatManWon(goal.amount)} 원 ${goal.title} ${done ? "달성" : "미달성"}`}
                  onClick={() => setSelected(goal.amount)}
                  className={`group/milestone flex w-24 flex-col items-center gap-1.5 text-center max-sm:w-[58px] ${FOCUS_RING}`}
                  data-done={done}
                  data-next={!done && nextGoal(raised, campaign)?.amount === goal.amount}
                >
                  <span className={MILESTONE_DOT} aria-hidden="true">
                    {done ? <CheckIcon size={16} strokeWidth={2.6} /> : <LockIcon size={14} />}
                    {done && <span className="absolute -inset-1 rounded-full border-2 border-coral opacity-0 motion-safe:group-data-[visible=true]/stretch:animate-funding-burst" />}
                  </span>
                  <span className="text-[14px] font-extrabold text-navy group-aria-pressed/milestone:underline group-aria-pressed/milestone:decoration-coral group-aria-pressed/milestone:decoration-2 group-aria-pressed/milestone:underline-offset-4">{formatManWon(goal.amount)}</span>
                  <span className="text-[12px] leading-[1.35] break-keep text-muted group-aria-pressed/milestone:font-bold group-aria-pressed/milestone:text-navy max-sm:hidden">{goal.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <GoalPreview goal={active} raised={raised} />
    </div>
  );
}

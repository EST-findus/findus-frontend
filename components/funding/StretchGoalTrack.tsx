"use client";

import { useState } from "react";
import { formatManWon, formatWon, nextGoal, trackPosition, type Campaign, type StretchGoal } from "@/lib/funding";
import { useCountUp, useInView } from "@/lib/useMotion";
import { CheckIcon, LockIcon } from "../Icons";
import GoodsStage from "./GoodsStage";
import styles from "./Funding.module.css";

const FILL_MS = 2400;

function GoalPreview({ goal, raised }: { goal: StretchGoal; raised: number }) {
  const done = raised >= goal.amount;
  return (
    <div className={styles.goalPreview} aria-live="polite">
      <div>
        <p className={styles.goalPreviewState} data-done={done}>
          {done ? <><CheckIcon size={15} />달성했어요</> : <><LockIcon size={15} />{formatWon(goal.amount - raised)} 남았어요</>}
        </p>
        <h3>{formatManWon(goal.amount)} 원 · {goal.title}</h3>
        <p>{goal.description}</p>
        {goal.needsChoice && <p className={styles.goalPreviewNote}>이미 후원한 분께도 선택 링크를 보내요. 로그인한 후원자는 마이페이지에서 고를 수 있어요.</p>}
      </div>
      {goal.amount === 10_000_000 && (
        <GoodsStage kinds={["card", "keyring", "ecobag"]} highlight={["ecobag"]} label="QR 키링 세트에 에코백이 추가된 모습" idPrefix="goal" still className={styles.goalPreviewStage} />
      )}
      {goal.amount === 5_000_000 && (
        <GoodsStage kinds={["keyring"]} label="키링 디자인" idPrefix="goal5" still className={styles.goalPreviewStage} />
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
    <div ref={ref} className={styles.stretch} data-visible={inView}>
      <p className={styles.stretchNow}>
        지금까지 <strong>{formatWon(shown)}</strong>
      </p>
      <div className={styles.track} style={{ "--position": inView ? position : 0, "--fill-ms": `${FILL_MS}ms` } as React.CSSProperties}>
        <div className={styles.trackBar}><div className={styles.trackFill} /></div>
        <ol className={styles.milestones}>
          {goals.map((goal, index) => {
            const at = (index + 1) / goals.length;
            const done = raised >= goal.amount;
            return (
              <li key={goal.amount} style={{ left: `${at * 100}%`, "--delay": `${Math.round((at / Math.max(position, 0.01)) * FILL_MS * 0.9)}ms` } as React.CSSProperties}>
                <button
                  type="button"
                  aria-pressed={active.amount === goal.amount}
                  aria-label={`${formatManWon(goal.amount)} 원 ${goal.title} ${done ? "달성" : "미달성"}`}
                  onClick={() => setSelected(goal.amount)}
                  className={styles.milestone}
                  data-done={done}
                  data-next={!done && nextGoal(raised, campaign)?.amount === goal.amount}
                >
                  <span className={styles.milestoneDot} aria-hidden="true">
                    {done ? <CheckIcon size={16} strokeWidth={2.6} /> : <LockIcon size={14} />}
                    {done && <span className={styles.burst} />}
                  </span>
                  <span className={styles.milestoneAmount}>{formatManWon(goal.amount)}</span>
                  <span className={styles.milestoneTitle}>{goal.title}</span>
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

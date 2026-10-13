"use client";

import { useRef } from "react";
import type { StylePhoto } from "@/lib/types";

interface StyleTabsProps {
  /** 그룹 접근성 이름에 쓰는 대상 이름 */
  name: string;
  styles: StylePhoto[];
  value: number;
  onChange: (index: number) => void;
  className?: string;
}

export default function StyleTabs({ name, styles, value, onChange, className = "" }: StyleTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // 라디오 그룹 관례: 화살표 키로 선택 이동, Tab은 선택된 항목 하나만 거친다.
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = styles.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[12px] font-semibold text-muted" aria-hidden="true">
        스타일
      </span>
      <div
        role="radiogroup"
        aria-label={`${name} 스타일 변형 선택`}
        className="flex gap-1 rounded-lg bg-surface p-0.5"
      >
        {styles.map((s, i) => {
          const checked = i === value;
          return (
            <button
              key={s.label}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${
                checked ? "bg-brand text-white" : "text-muted hover:text-brand"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

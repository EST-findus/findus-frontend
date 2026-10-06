"use client";

import { useRef } from "react";
import type { FilterKey } from "@/lib/types";

export const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체보기" },
  { key: "child", label: "실종아동" },
  { key: "senior", label: "치매어르신" },
  { key: "disabled", label: "장애인" },
  { key: "longterm", label: "장기실종" },
];

interface FilterChipsProps {
  value: FilterKey;
  onChange: (value: FilterKey) => void;
}

export default function FilterChips({ value, onChange }: FilterChipsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // 라디오 그룹 관례: 화살표 키로 선택 이동, Tab은 선택된 칩 하나만 거친다.
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = FILTER_OPTIONS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    onChange(FILTER_OPTIONS[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="카테고리"
      className="mt-4 flex flex-wrap justify-center gap-2"
    >
      {FILTER_OPTIONS.map((opt, i) => {
        const checked = opt.key === value;
        return (
          <button
            key={opt.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.key)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`rounded-full border px-4 py-1.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
              checked
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-muted hover:border-navy hover:text-navy"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

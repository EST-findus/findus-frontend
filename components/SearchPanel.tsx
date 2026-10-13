"use client";

import { useId, useRef } from "react";
import type { AgeGroupKey, GenderFilter, PeriodKey, SearchFilters } from "@/lib/types";
import { CloseIcon, ResetIcon, SearchIcon } from "./Icons";

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "남", label: "남자" },
  { value: "여", label: "여자" },
];

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "all", label: "전체 기간" },
  { value: "before2000", label: "1999년 이전" },
  { value: "2000s", label: "2000년대" },
  { value: "2010s", label: "2010년대" },
  { value: "after2020", label: "2020년 이후" },
];

const AGE_OPTIONS: { value: AgeGroupKey; label: string }[] = [
  { value: "all", label: "전체 나이" },
  { value: "0-3", label: "0~3세" },
  { value: "4-6", label: "4~6세" },
  { value: "7-9", label: "7~9세" },
  { value: "10+", label: "10세 이상" },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  regions: string[];
  onReset: () => void;
  onSubmit: () => void;
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[14px] font-medium ${FOCUS_RING}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SearchPanel({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  regions,
  onReset,
  onSubmit,
}: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof SearchFilters>(key: K) => (value: SearchFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-card max-sm:p-4">
      <form
        role="search"
        // 입력할 때마다 즉시 걸러지므로 제출은 결과 목록으로 이동만 한다.
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex gap-2"
      >
        <div className="relative flex min-w-0 flex-1 items-center rounded-xl border border-line bg-surface transition-shadow focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15">
          <SearchIcon
            size={19}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-4 text-subtle"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="이름이나 실종 지역을 입력해주세요"
            aria-label="실종아동 검색"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3 pr-3 pl-11 text-[15px] font-medium outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              aria-label="검색어 지우기"
              className={`mr-2 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-line text-muted hover:bg-subtle/40 ${FOCUS_RING}`}
            >
              <CloseIcon size={13} strokeWidth={2.6} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className={`shrink-0 rounded-xl bg-brand px-6 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark max-sm:px-4 ${FOCUS_RING}`}
        >
          검색하기
        </button>
      </form>

      <div className="mt-4 grid grid-cols-2 items-end gap-3 md:grid-cols-[repeat(4,1fr)_auto]">
        <Select label="성별" value={filters.gender} options={GENDER_OPTIONS} onChange={set("gender")} />
        <Select
          label="실종 지역"
          value={filters.region}
          options={[
            { value: "all", label: "전체 지역" },
            ...regions.map((r) => ({ value: r, label: r })),
          ]}
          onChange={set("region")}
        />
        <Select label="실종 연도" value={filters.period} options={PERIOD_OPTIONS} onChange={set("period")} />
        <Select
          label="실종 당시 나이"
          value={filters.ageGroup}
          options={AGE_OPTIONS}
          onChange={set("ageGroup")}
        />
        <button
          type="button"
          onClick={onReset}
          className={`col-span-2 flex items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-muted transition-colors hover:bg-surface hover:text-brand md:col-span-1 ${FOCUS_RING}`}
        >
          <ResetIcon size={15} strokeWidth={2.2} /> 초기화
        </button>
      </div>
    </div>
  );
}

import type { SortKey } from "@/lib/types";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "최근 실종순" },
  { key: "longterm", label: "오래된 실종순" },
  { key: "name", label: "이름순" },
];

interface ResultBarProps {
  count: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export default function ResultBar({ count, sort, onSortChange }: ResultBarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="text-[18px] font-extrabold tracking-[-0.3px]" aria-live="polite">
        조회된 실종자 <span className="text-navy">{count}</span>명
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-[13px] font-semibold text-muted">
          정렬
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-lg border border-line bg-card px-3 py-2 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

import { SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon, ResetIcon, SearchIcon } from "./Icons";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-brand shadow-card">
        <SearchIcon size={24} />
      </span>
      <p className="mt-4 text-[17px] font-bold">조건에 맞는 실종아동 정보가 없습니다</p>
      <p className="mt-1.5 text-[14px] break-keep text-muted">
        검색어나 조건을 줄여서 다시 찾아보세요. 공식 실종 정보는 안전Dream에서도 확인할 수 있어요.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[14px] font-bold">
        <button
          type="button"
          onClick={onReset}
          className={`inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
        >
          <ResetIcon size={16} strokeWidth={2.2} /> 조건 초기화
        </button>
        <a
          href={SAFE182_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 rounded-lg border border-line bg-card px-4 py-2.5 transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
        >
          안전Dream 바로가기 <ArrowUpRightIcon size={14} strokeWidth={2.2} />
        </a>
      </div>
    </div>
  );
}

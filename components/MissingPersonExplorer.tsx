"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FILTERS, filterPersons, listRegions } from "@/lib/filter";
import { SAFE182_URL } from "@/lib/links";
import type { MissingPerson, SearchFilters, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import { ArrowUpRightIcon } from "./Icons";
import PersonCard from "./PersonCard";
import ResultBar from "./ResultBar";
import SearchPanel from "./SearchPanel";
import SectionHeading from "./SectionHeading";
import TipModal from "./TipModal";
import Toast from "./Toast";

const TOAST_MS = 3000;
const TIP_DONE_MESSAGE = "소중한 목격 제보가 접수되었습니다. 따뜻한 관심에 감사드립니다.";

export default function MissingPersonExplorer({ persons }: { persons: MissingPerson[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("recent");
  const [detailPerson, setDetailPerson] = useState<MissingPerson | null>(null);
  const [tipPerson, setTipPerson] = useState<MissingPerson | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 상세 → 제보로 이어져도 최종적으로는 처음 누른 카드 버튼으로 포커스를 돌려준다.
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const regions = useMemo(() => listRegions(persons), [persons]);
  const results = useMemo(
    () => filterPersons(persons, { query, filters, sort }),
    [persons, query, filters, sort],
  );

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const openDetail = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setDetailPerson(person);
  }, []);

  const reset = () => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  };

  const goToResults = () => {
    const heading = document.getElementById("results");
    heading?.scrollIntoView({ behavior: "smooth", block: "start" });
    heading?.focus({ preventScroll: true });
  };

  const reportFromDetail = (person: MissingPerson) => {
    setDetailPerson(null);
    setTipPerson(person);
  };

  const handleTipSubmitted = () => {
    setTipPerson(null);
    setToast(TIP_DONE_MESSAGE);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };

  return (
    <>
      <section className="mx-auto max-w-310 px-6 pt-14 max-sm:px-4 max-sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading
            as="h1"
            eyebrow="Find someone"
            title="기억 속 그 아이를 찾고 있나요?"
            description="이름을 몰라도 괜찮아요. 기억나는 정보부터 찾아보세요."
          />
          <a
            href={SAFE182_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[13.5px] font-bold text-brand hover:underline"
          >
            공식 실종정보 확인 <ArrowUpRightIcon size={14} strokeWidth={2.2} />
          </a>
        </div>

        <p className="mt-5 flex items-start gap-2 text-[12.5px] break-keep text-muted">
          <span className="shrink-0 rounded bg-gold-soft px-1.5 py-0.5 font-bold text-gold">
            사진 안내
          </span>
          <span className="pt-0.5">
            실종 당시 원본과 AI 예상 모습, 스타일 변형 3장을 함께 비교해 보세요. 현재 목록은 시연용
            예시 데이터입니다.
          </span>
        </p>

        <div className="mt-4">
          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            regions={regions}
            onReset={reset}
            onSubmit={goToResults}
          />
        </div>
      </section>

      <section aria-labelledby="results" className="mx-auto mt-10 max-w-310 px-6 max-sm:px-4">
        <ResultBar count={results.length} sort={sort} onSortChange={setSort} />
        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {results.map((person) => (
              <PersonCard key={person.id} person={person} onOpenDetail={openDetail} />
            ))}
          </div>
        ) : (
          <EmptyState onReset={reset} />
        )}
      </section>

      {detailPerson && (
        <DetailModal
          person={detailPerson}
          returnFocusTo={trigger}
          onClose={() => setDetailPerson(null)}
          onReport={reportFromDetail}
        />
      )}
      {tipPerson && (
        <TipModal
          person={tipPerson}
          returnFocusTo={trigger}
          onClose={() => setTipPerson(null)}
          onSubmitted={handleTipSubmitted}
        />
      )}
      <Toast message={toast} />
    </>
  );
}

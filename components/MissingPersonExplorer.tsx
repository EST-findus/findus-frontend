"use client";

import { useCallback, useMemo, useState } from "react";
import { MOCK_PHOTO_LABEL } from "@/lib/attribution";
import { DEFAULT_FILTERS, filterPersons, listRegions } from "@/lib/filter";
import { SAFE182_URL } from "@/lib/links";
import type { MissingPerson, SearchFilters, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import { ArrowUpRightIcon } from "./Icons";
import PageHero from "./PageHero";
import PersonCard from "./PersonCard";
import ReportGuideModal from "./ReportGuideModal";
import ResultBar from "./ResultBar";
import SearchPanel from "./SearchPanel";
import ShareModal from "./ShareModal";

export default function MissingPersonExplorer({ persons }: { persons: MissingPerson[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("recent");
  const [detailPerson, setDetailPerson] = useState<MissingPerson | null>(null);
  const [tipPerson, setTipPerson] = useState<MissingPerson | null>(null);
  const [sharePerson, setSharePerson] = useState<MissingPerson | null>(null);
  // 상세 → 제보 안내로 이어져도 최종적으로는 처음 누른 카드 버튼으로 포커스를 돌려준다.
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);

  const regions = useMemo(() => listRegions(persons), [persons]);
  const results = useMemo(
    () => filterPersons(persons, { query, filters, sort }),
    [persons, query, filters, sort],
  );

  const openDetail = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setDetailPerson(person);
  }, []);

  const openTip = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setTipPerson(person);
  }, []);

  const openShare = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setSharePerson(person);
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

  return (
    <>
      <PageHero
        compact
        eyebrow="장기 실종아동 찾기"
        title="기억 속 그 아이를 찾고 있나요?"
        description="이름을 몰라도 괜찮아요. 성별, 실종 지역, 연도처럼 기억나는 정보부터 찾아보세요."
      >
        <div className="mt-8 max-sm:mt-6">
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
      </PageHero>

      <section aria-labelledby="results" className="page-container mt-12 max-sm:mt-8">
        <ResultBar count={results.length} sort={sort} onSortChange={setSort} />

        <p className="-mt-2 mb-3 text-[12.5px] font-medium text-muted">
          시연용 예시 정보 · {MOCK_PHOTO_LABEL}
        </p>

        <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-gold-soft px-4 py-3 text-[13.5px] leading-normal break-keep text-ink/80">
          <span className="font-bold text-gold-ink">사진 안내</span>
          <span className="min-w-0 flex-1 basis-72">
            현재 목록의 사진은 모두 AI로 만든 가상 인물입니다. 어린 시절 → 성인 예상 모습 → 스타일 변형을 비교하는 시연용 예시예요.
          </span>
          <a
            href={SAFE182_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 font-bold text-brand hover:underline"
          >
            공식 실종정보 확인 <ArrowUpRightIcon size={14} strokeWidth={2.2} />
          </a>
        </p>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {results.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onOpenDetail={openDetail}
                onReport={openTip}
                onShare={openShare}
              />
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
        <ReportGuideModal
          person={tipPerson}
          returnFocusTo={trigger}
          onClose={() => setTipPerson(null)}
        />
      )}
      {sharePerson && (
        <ShareModal
          person={sharePerson}
          returnFocusTo={trigger}
          onClose={() => setSharePerson(null)}
        />
      )}
    </>
  );
}

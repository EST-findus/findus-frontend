"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterPersons } from "@/lib/filter";
import type { FilterKey, MissingPerson, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import FilterChips from "./FilterChips";
import Header from "./Header";
import Intro from "./Intro";
import PersonCard from "./PersonCard";
import ResultBar from "./ResultBar";
import SearchBar from "./SearchBar";
import TipModal from "./TipModal";
import Toast from "./Toast";

const TOAST_MS = 3000;
const TIP_DONE_MESSAGE = "소중한 목격 제보가 접수되었습니다. 따뜻한 관심에 감사드립니다.";

export default function MissingPersonExplorer({ persons }: { persons: MissingPerson[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [detailPerson, setDetailPerson] = useState<MissingPerson | null>(null);
  const [tipPerson, setTipPerson] = useState<MissingPerson | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 상세 → 제보로 이어져도 최종적으로는 처음 누른 카드 버튼으로 포커스를 돌려준다.
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const results = useMemo(
    () => filterPersons(persons, { query, filter, sort }),
    [persons, query, filter, sort],
  );

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const openDetail = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setDetailPerson(person);
  }, []);

  const openTip = useCallback((person: MissingPerson, el: HTMLElement) => {
    setTrigger(el);
    setTipPerson(person);
  }, []);

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
      <Header />
      <section className="bg-hero px-4 pt-12 pb-10">
        <Intro total={persons.length} />
        <div className="mx-auto mt-7 max-w-[660px]">
          <SearchBar value={query} onChange={setQuery} />
          <FilterChips value={filter} onChange={setFilter} />
        </div>
      </section>

      <main className="mx-auto mt-10 max-w-[1240px] px-6 max-sm:px-4">
        <ResultBar count={results.length} sort={sort} onSortChange={setSort} />
        {results.length > 0 ? (
          <section
            aria-label="실종자 목록"
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {results.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onOpenDetail={openDetail}
                onOpenTip={openTip}
              />
            ))}
          </section>
        ) : (
          <EmptyState />
        )}
      </main>

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
      <a
        href="tel:182"
        className="fixed right-6 bottom-6 z-40 flex items-center gap-1.5 rounded-full bg-red px-5 py-3 text-[14px] font-bold text-white shadow-float transition-colors hover:bg-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy max-sm:right-4 max-sm:bottom-4"
      >
        <span aria-hidden="true">☎</span> 182 신고
      </a>
      <Toast message={toast} />
    </>
  );
}

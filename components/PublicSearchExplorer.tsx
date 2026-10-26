"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatGender } from "@/lib/format";
import HomeChildCard from "./HomeChildCard";
import CountUp from "./CountUp";
import styles from "./PublicSearch.module.css";
import { DEFAULT_FILTERS, filterPersons, listRegions } from "@/lib/filter";
import type { MissingPerson, SearchFilters, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import ReportGuideModal from "./ReportGuideModal";
import SearchPanel from "./SearchPanel";
import ShareModal from "./ShareModal";
import { useScrollReveal } from "./useScrollReveal";

const SEARCH_INPUT_ID = "public-search-input";

export default function PublicSearchExplorer({ persons }: { persons: MissingPerson[] }) {
  const pageRef = useScrollReveal<HTMLDivElement>();

  // 홈의 '실종아동 검색' 바로가기(?focus=search)로 들어오면 검색창에 바로 커서를 둔다. 주소의 표시는 지운다.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("focus") !== "search") return;
    const input = document.getElementById(SEARCH_INPUT_ID);
    if (input) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      input.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      input.focus({ preventScroll: true });
    }
    url.searchParams.delete("focus");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  const [page, setPage] = useState(0);
  const pageSize=12;
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

  const pages=Math.ceil(results.length/pageSize);
  const current=Math.min(page,Math.max(0,pages-1));
  const visible=results.slice(current*pageSize,(current+1)*pageSize);
  const reset = () => {
    setPage(0);
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

  const periods = { before2000: "1999년 이전", "2000s": "2000년대", "2010s": "2010년대", after2020: "2020년 이후" };
  const selected = [query.trim() ? `검색어: ${query.trim()}` : "", filters.region !== "all" ? `지역: ${filters.region}` : "", filters.gender !== "all" ? `성별: ${formatGender(filters.gender)}` : "", filters.ageGroup !== "all" ? `당시 나이: ${filters.ageGroup === "10+" ? "10세 이상" : filters.ageGroup.replace("-", "~") + "세"}` : "", filters.period !== "all" ? `실종 연도: ${periods[filters.period]}` : ""].filter(Boolean);
  return (
    <div ref={pageRef} className={styles.page}>
      <div className={`page-container ${styles.campaignLayout}`}>
      <div className={styles.mainRail}>
      <section className={styles.campaignHero} aria-labelledby="campaign-title">
        <Image src="/images/search-campaign-hope.png" alt="" fill priority sizes="(min-width: 1280px) 1200px, 100vw" className={styles.campaignPhoto} />
        <div className={styles.campaignVeil} />
        <div className={styles.campaignCopy}>
          <p className={styles.heroEyebrow}>작은 관심으로 함께 만드는 안전한 내일</p>
          <h1 id="campaign-title">실종아동을<br /><span>함께 찾아주세요</span></h1>
          <p>작은 관심이 한 아이의 내일을 바꿀 수 있습니다.<br />이름, 지역, 나이 등 기억나는 정보로 찾아보세요.</p>
        </div>
        <span className={styles.campaignImageNote}>AI로 제작한 캠페인 이미지</span>
      </section>
      <section className={styles.searchSection} aria-labelledby="search-page-title">
        <div className="page-container">
          <h2 id="search-page-title" className="sr-only" tabIndex={-1}>실종아동 검색</h2>
          <div className={styles.searchBox}><SearchPanel query={query} onQueryChange={(value)=>{setQuery(value);setPage(0);}} filters={filters} onFiltersChange={(value)=>{setFilters(value);setPage(0);}} regions={regions} onReset={reset} onSubmit={goToResults} inputId={SEARCH_INPUT_ID} /></div>
          {selected.length > 0 && <div className={styles.conditions} aria-label="선택한 검색 조건" aria-live="polite"><strong>선택한 조건</strong>{selected.map((label) => <span key={label}>{label}</span>)}</div>}

        </div>
      </section>
      <section aria-labelledby="results" className={`page-container ${styles.results}`}>
        <header className={styles.resultHeader}>
          <h2 id="results" tabIndex={-1}>현재 찾고 있는 아이들</h2>
          <div className={styles.resultTools}>
            <p aria-live="polite">총 <strong><CountUp value={results.length} /></strong>명</p>
            <label htmlFor="public-search-sort" className="sr-only">정렬</label>
            <select id="public-search-sort" value={sort} onChange={(event) => {setSort(event.target.value as SortKey);setPage(0);}}>
              <option value="recent">실종 연도 최신순</option>
              <option value="oldest">실종 연도 오래된순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </header>
        <div className={styles.exampleNote}><span>자료 출처: 경찰청</span><p>우리 DB에 동기화된 공개 실종아동 정보입니다. 검색과 페이지 이동은 저장된 정보만 조회합니다.</p></div>
        {results.length > 0 ? (
          <div id="search-card-page" className={styles.cardGrid} data-reveal-items>
            {visible.map((person) => (
              // 홈의 아동 카드와 같은 카드를 써서, 홈에서 넘어와도 같은 모양으로 이어 보이게 한다.
              <HomeChildCard
                key={person.id}
                person={person}
                onOpenDetail={openDetail}
                onReport={openTip}
                onShare={openShare}
              />
            ))}
          </div>
        ) : (
          persons.length ? <EmptyState onReset={reset} /> : <p role="status" className="rounded-xl border border-line bg-card p-8 text-center text-muted">현재 저장된 공개 실종아동 정보가 없습니다.</p>
        )}
        {pages>1 && <nav aria-label="검색 결과 페이지" className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button type="button" disabled={current===0} onClick={()=>setPage(current-1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-40">이전</button>
          {Array.from({length:Math.min(10,pages-Math.floor(current/10)*10)},(_,i)=>Math.floor(current/10)*10+i).map(index=><button type="button" key={index} aria-current={current===index ? 'page' : undefined} onClick={()=>setPage(index)} className={'rounded-lg border border-line px-3 py-2 '+(current===index?'bg-brand text-white':'bg-card')}>{index+1}</button>)}
          <button type="button" disabled={current>=pages-1} onClick={()=>setPage(current+1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-40">다음</button>
          <span role="status" className="text-sm text-muted">{current+1} / {pages}페이지</span>
        </nav>}
      </section>

      <Link href="/help#know" className={styles.reportBanner} aria-label="기억나는 작은 단서, 목격 제보 안내 보기">
        <Image src="/images/report-hope-hand.png" alt="" width={112} height={74} sizes="(max-width: 640px) 76px, 112px" className={styles.reportBannerArt} />
        <span className={styles.reportBannerCopy}>
          <strong>기억나는 작은 단서, <span>다시 만나는 희망이 됩니다.</span></strong>
          <small>작은 기억도 소중한 제보가 될 수 있어요.</small>
        </span>
      </Link>
      </div>
      </div>

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
    </div>
  );
}

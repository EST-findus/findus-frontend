"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatGender } from "@/lib/format";
import PublicPersonCard from "./ChildComparisonCard";
import styles from "./PublicSearch.module.css";
import { DEFAULT_FILTERS, filterPersons, listRegions } from "@/lib/filter";
import { SAFE182_URL } from "@/lib/links";
import type { MissingPerson, SearchFilters, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import { ArrowRightIcon, LayersIcon, PhoneIcon, ShareIcon, ShieldIcon } from "./Icons";
import ReportGuideModal from "./ReportGuideModal";
import SearchPanel from "./SearchPanel";
import ShareModal from "./ShareModal";

export default function PublicSearchExplorer({ persons }: { persons: MissingPerson[] }) {
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
    <div className={styles.page}>
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
          <div className={styles.searchBox}><SearchPanel query={query} onQueryChange={(value)=>{setQuery(value);setPage(0);}} filters={filters} onFiltersChange={(value)=>{setFilters(value);setPage(0);}} regions={regions} onReset={reset} onSubmit={goToResults} /></div>
          {selected.length > 0 && <div className={styles.conditions} aria-label="선택한 검색 조건" aria-live="polite"><strong>선택한 조건</strong>{selected.map((label) => <span key={label}>{label}</span>)}</div>}

        </div>
      </section>
      <section aria-labelledby="results" className={`page-container ${styles.results}`}>
        <header className={styles.resultHeader}>
          <h2 id="results" tabIndex={-1}>현재 찾고 있는 아이들</h2>
          <div className={styles.resultTools}>
            <p aria-live="polite">총 <strong>{results.length}</strong>명</p>
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
          <div id="search-card-page" className={styles.cardGrid}>
            {visible.map((person) => (
              <PublicPersonCard
                key={person.id}
                person={person}
                comparison
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

      <Link href="/guide#know" className={styles.reportBanner} aria-label="기억나는 작은 단서, 목격 제보 안내 보기">
        <Image src="/images/report-hope-hand.png" alt="" width={112} height={74} sizes="(max-width: 640px) 76px, 112px" className={styles.reportBannerArt} />
        <span className={styles.reportBannerCopy}>
          <strong>기억나는 작은 단서,<br className={styles.reportBannerBreak} /> <span>다시 만나는 희망이 됩니다.</span></strong>
          <small>작은 기억도 소중한 제보가 될 수 있어요.</small>
        </span>
        <span className={styles.reportBannerAction}><span>목격 제보 안내</span><ArrowRightIcon size={16} /></span>
      </Link>
      <nav className={styles.quickLinks} aria-label="찾기와 제보 도움 안내">
        <Link href="/guide#know"><ShieldIcon size={26} /><span><strong>목격 제보 안내</strong><small>기억나는 단서를 전하는 방법</small></span><ArrowRightIcon size={17} /></Link>
        <Link href="/guide#families"><LayersIcon size={26} /><span><strong>DNA 등록 안내</strong><small>가족을 찾는 또 하나의 연결</small></span><ArrowRightIcon size={17} /></Link>
        <Link href="/community"><ShareIcon size={26} /><span><strong>소식·이야기</strong><small>함께 나누는 정보와 따뜻한 응원</small></span><ArrowRightIcon size={17} /></Link>
        <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer"><PhoneIcon size={26} /><span><strong>공식 기관 안내</strong><small>긴급 신고 112 · 실종 상담 182</small></span><ArrowRightIcon size={17} /></a>
      </nav>

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

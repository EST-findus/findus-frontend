"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatGender, formatSyncTime } from "@/lib/format";
import HomeChildCard from "./HomeChildCard";
import CountUp from "./CountUp";
import { ArrowRightIcon, PhoneIcon } from "./Icons";
import { SEARCH_PALETTE } from "./searchStyles";
import { DEFAULT_FILTERS, filterPersons, listRegions } from "@/lib/filter";
import type { MissingPerson, SearchFilters, SortKey } from "@/lib/types";
import DetailModal from "./DetailModal";
import EmptyState from "./EmptyState";
import ReportGuideModal from "./ReportGuideModal";
import SearchPanel from "./SearchPanel";
import ShareModal from "./ShareModal";
import { useScrollReveal } from "./useScrollReveal";

const SEARCH_INPUT_ID = "public-search-input";

const RISE = "animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_backwards]";

// 페이지 전체: 공식 팔레트, 포커스 테두리, 스크롤로 나타나는 목록(useScrollReveal), 동작 줄이기
const PAGE = [
  SEARCH_PALETTE,
  "bg-white pb-[17px]",
  "[&_:is(a,button):focus-visible]:outline-2 [&_:is(a,button):focus-visible]:outline-offset-3 [&_:is(a,button):focus-visible]:outline-brand",
  "[&[data-motion=on]_[data-reveal]:not([data-revealed])]:opacity-0 [&[data-motion=on]_[data-reveal-items]>:not([data-revealed])]:opacity-0",
  "[&_[data-reveal][data-revealed=in]]:animate-[search-rise_.7s_cubic-bezier(.2,.7,.2,1)_var(--reveal-delay,0s)_backwards] [&_[data-reveal-items]>[data-revealed=in]]:animate-[search-rise_.7s_cubic-bezier(.2,.7,.2,1)_var(--reveal-delay,0s)_backwards]",
  "motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! motion-reduce:[&_*::before]:animate-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::after]:animate-none! motion-reduce:[&_*::after]:transition-none!",
].join(" ");

// SearchPanel의 카드 틀을 지우고 이 상자의 색·크기로 맞춘다.
const SEARCH_BOX = [
  "rounded-[18px] border border-[#E7ECF2] bg-[#F9FAFC] shadow-[0_4px_18px_rgba(23,59,112,.035)] animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_.24s_backwards] max-[640px]:rounded-[14px]",
  "[&>div]:border-0 [&>div]:bg-transparent [&>div]:p-[22px] [&>div]:shadow-none max-[800px]:[&>div]:p-[18px] max-[640px]:[&>div]:p-[13px]",
  "[&_form]:gap-3 max-[640px]:[&_form]:gap-2",
  "[&_form>div]:h-14 [&_form>div]:border-[#d4e1f0] [&_form>div]:bg-white [&_form>div]:[transition:border-color_.2s_ease,box-shadow_.2s_ease] [&_form>div:focus-within]:border-brand [&_form>div:focus-within]:[box-shadow:0_0_0_4px_rgba(57,120,184,.1)] max-[640px]:[&_form>div]:h-12",
  "[&_form>button]:h-14 [&_form>button]:min-w-[170px] [&_form>button]:bg-brand [&_form>button]:[transition:background-color_.2s_ease,transform_.25s_cubic-bezier(.2,.7,.2,1),box-shadow_.25s_ease] [&_form>button:hover]:bg-navy [&_form>button:hover]:[transform:translateY(-1px)] [&_form>button:hover]:shadow-[0_10px_22px_rgba(57,120,184,.24)] max-[800px]:[&_form>button]:min-w-[110px] max-[640px]:[&_form>button]:h-12 max-[640px]:[&_form>button]:w-12 max-[640px]:[&_form>button]:min-w-0",
  "[&_input::placeholder]:text-subtle max-[640px]:[&_input]:text-[16px]",
  "[&_form+div]:mt-[18px] [&_form+div]:gap-[18px] [&_form+div]:border-0 [&_form+div]:pt-0 max-[640px]:[&_form+div]:mt-2.5 max-[640px]:[&_form+div]:gap-2 max-[640px]:[&_form+div>button]:h-[30px]",
  "[&_label]:text-[13px] [&_label]:text-[#344c69]",
  "[&_select]:border-[#d4e1f0] [&_select]:bg-white [&_select]:text-[14px] [&_select]:[transition:border-color_.2s_ease] [&_select:hover]:border-[#B9CDE6] max-[640px]:[&_select]:h-10 max-[640px]:[&_select]:px-2 max-[640px]:[&_select]:text-[13px]",
].join(" ");

const PAGE_BUTTON = "[transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.2s_ease] [&:not(:disabled):not([aria-current]):hover]:border-brand [&:not(:disabled):not([aria-current]):hover]:text-brand [&:not(:disabled):active]:[transform:scale(.95)]";

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
  // AI 사진 조회 상태 확인용: 목록 응답의 aiPhotoUrl 기준으로 있는 아동/없는 아동을 브라우저 콘솔에 남긴다.
  useEffect(() => {
    const api = persons.filter((person) => person.source === "api");
    const withAi = api.filter((person) => person.photos.aged);
    const withoutAi = api.filter((person) => !person.photos.aged);
    console.log(`[AI 사진] 검색 목록 ${persons.length}명 중 AI 사진 있음 ${withAi.length}명 · 없음 ${withoutAi.length}명`);
    if (!persons.length) console.warn("[AI 사진] 목록이 비어 있습니다. 백엔드 응답을 확인하세요.");
    if (withAi.length) console.table(withAi.map((person) => ({ id: person.id, name: person.name, aiPhoto: person.photos.aged })));
    if (withoutAi.length) console.log("[AI 사진] 없음 (aiPhotoUrl이 비었거나 이 아동 경로가 아님)", withoutAi.map((person) => ({ id: person.id, name: person.name })));
  }, [persons]);
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
  // 가장 최근에 동기화된 시각을 목록 전체의 기준 시각으로 보여 준다.
  const syncedAt = useMemo(
    () => persons.reduce<string | undefined>((latest, p) => (p.lastSyncedAt && (!latest || p.lastSyncedAt > latest) ? p.lastSyncedAt : latest), undefined),
    [persons],
  );
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
    <div ref={pageRef} className={PAGE}>
      <div className="page-container pt-0">
      <div className="min-w-0">
      {/* 사진 없이 옅은 파란 바탕에 오른쪽으로 잔잔한 검색 물결만 둔다. 아래 실제 아이들의 사진만 얼굴로 남게 한다. */}
      <section className="relative overflow-hidden rounded-[18px] border border-[#E3EAF3] bg-[linear-gradient(120deg,#F7FAFE_0%,#EAF2F9_100%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[repeating-radial-gradient(circle_at_86%_58%,rgb(57_120_184/10%)_0_1px,transparent_1px_44px)] after:[-webkit-mask-image:linear-gradient(90deg,transparent_45%,#000_80%)] after:[mask-image:linear-gradient(90deg,transparent_45%,#000_80%)] after:content-[''] max-[640px]:rounded-[14px] max-[640px]:after:[-webkit-mask-image:linear-gradient(90deg,transparent_30%,#000_90%)] max-[640px]:after:[mask-image:linear-gradient(90deg,transparent_30%,#000_90%)]" aria-labelledby="campaign-title">
        <div className="relative z-1 px-10 pt-9 pb-10 max-[800px]:pl-[25px] max-[640px]:px-5 max-[640px]:pt-[26px] max-[640px]:pb-7">
          <p className={`${RISE} mb-3.5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgb(57_120_184/16%)] bg-white px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-brand before:size-1.5 before:rounded-full before:bg-brand before:content-[''] max-[640px]:text-[11px]`}>경찰청 공개 실종아동 정보</p>
          <h1 id="campaign-title" className="mb-3.5 animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_.08s_backwards] text-[40px] leading-[1.22] font-[850] tracking-[-1.4px] text-navy max-[1100px]:text-[36px] max-[800px]:text-[32px] max-[640px]:text-[29px] max-[640px]:tracking-[-1px]">실종아동을<br /><span className="text-brand">함께 찾아주세요</span></h1>
          <p className="animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_.16s_backwards] text-[15px] leading-[1.8] break-keep text-muted max-[800px]:text-[13px]">작은 관심이 한 아이의 내일을 바꿀 수 있습니다.<br />이름, 지역, 나이 등 기억나는 정보로 찾아보세요.</p>
        </div>
      </section>
      <section className="relative mt-4 max-[640px]:mt-3" aria-labelledby="search-page-title">
        <div className="mx-auto w-full max-w-300">
          <h2 id="search-page-title" className="sr-only" tabIndex={-1}>실종아동 검색</h2>
          <div className={SEARCH_BOX}><SearchPanel query={query} onQueryChange={(value)=>{setQuery(value);setPage(0);}} filters={filters} onFiltersChange={(value)=>{setFilters(value);setPage(0);}} regions={regions} onReset={reset} onSubmit={goToResults} inputId={SEARCH_INPUT_ID} /></div>
          {selected.length > 0 && <div className="mx-[3px] mt-3 mb-0 flex flex-wrap items-center gap-[7px] text-[12px] text-[#6e8095] max-[640px]:text-[11px]" aria-label="선택한 검색 조건" aria-live="polite"><strong className="font-semibold">선택한 조건</strong>{selected.map((label) => <span key={label} className="animate-search-chip-in rounded-[5px] bg-brand-soft px-2 py-[3px]">{label}</span>)}</div>}
          {/* 얼굴을 막 알아본 사람에게 가장 먼저 필요한 번호를 검색창 바로 아래에 둔다. */}
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border border-[#F6D9D5] bg-[#FEF7F6] px-3.5 py-2.5 text-[13px] leading-[1.5] text-muted max-[640px]:px-3 max-[640px]:text-[12px] [&>svg]:shrink-0 [&>svg]:text-[#C9483F] [&_a]:font-extrabold [&_a]:text-[#B4473F] [&_a]:underline [&_a]:decoration-[rgba(201,72,63,.35)] [&_a]:underline-offset-3 [&_a:hover]:decoration-[#C9483F]"><PhoneIcon size={15} strokeWidth={2.2} aria-hidden="true" />아이를 지금 목격했다면 바로 <a href="tel:112">112 긴급 신고</a><span aria-hidden="true" className="text-[#D9B5B0]">·</span><a href="tel:182">182 실종아동 제보·상담</a></p>

        </div>
      </section>
      <section aria-labelledby="results" className="mx-auto mt-4 w-full max-w-300 rounded-2xl border border-[#E3EAF3] bg-white px-[22px] pt-6 pb-7 shadow-[0_6px_22px_rgba(23,59,112,.035)] max-[640px]:mt-3 max-[640px]:rounded-[13px] max-[640px]:px-[13px] max-[640px]:pt-[18px] max-[640px]:pb-5">
        <header className="mb-3.5 flex items-center justify-between gap-[18px] max-[640px]:mb-3 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2.5">
          <h2 id="results" tabIndex={-1} className="flex scroll-mt-[100px] items-center gap-2.5 text-[24px] leading-[1.4] font-extrabold tracking-[-.7px] text-navy outline-none before:size-2 before:flex-none before:rounded-full before:bg-brand before:shadow-[0_0_0_4px_#EAF2F9] before:content-[''] max-[640px]:text-[22px]">현재 찾고 있는 아이들</h2>
          <div className="flex shrink-0 items-center gap-3.5 max-[640px]:w-full max-[640px]:justify-between">
            <p aria-live="polite" className="rounded-full bg-brand-soft px-3 py-1.5 text-[14px] text-[#3D5877]">총 <strong className="font-[750] text-brand"><CountUp value={results.length} /></strong>명</p>
            <label htmlFor="public-search-sort" className="sr-only">정렬</label>
            <select id="public-search-sort" className="h-[38px] rounded-lg border border-[#D4E1F0] bg-white py-0 pr-[30px] pl-3 text-[13px] text-[#3D5877] [transition:border-color_.2s_ease] hover:border-[#B9CDE6] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand max-[640px]:h-9 max-[640px]:text-[12px]" value={sort} onChange={(event) => {setSort(event.target.value as SortKey);setPage(0);}}>
              <option value="recent">실종 연도 최신순</option>
              <option value="oldest">실종 연도 오래된순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </header>
        <div className="mb-[18px] flex items-center gap-2.5 rounded-xl border border-[#E7ECF2] bg-[#F9FAFC] px-[13px] py-2.5 text-[12px] leading-[1.7] text-[#6b7b8e] max-[640px]:items-start max-[640px]:gap-2 max-[640px]:px-[11px] max-[640px]:text-[11px]"><span className="shrink-0 border-r border-[#d9e2ec] pr-2.5 text-[11px] font-bold text-brand max-[640px]:pr-2 max-[640px]:text-[10px]">자료 출처: 경찰청</span><p>경찰청이 공개한 실종아동 정보를 정기적으로 받아 보여 드립니다.{syncedAt && <> 기준: {formatSyncTime(syncedAt)}.</>} 사진과 정보는 공개 당시 기준이라 지금 모습과 다를 수 있습니다.</p></div>
        {results.length > 0 ? (
          <div id="search-card-page" className="grid grid-cols-[1fr] gap-[18px] min-[800px]:grid-cols-2 min-[1100px]:grid-cols-3 sm:max-[800px]:grid-cols-2 sm:max-[800px]:gap-3.5" data-reveal-items>
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
          <button type="button" disabled={current===0} onClick={()=>setPage(current-1)} className={`rounded-lg border border-line px-3 py-2 disabled:opacity-40 ${PAGE_BUTTON}`}>이전</button>
          {Array.from({length:Math.min(10,pages-Math.floor(current/10)*10)},(_,i)=>Math.floor(current/10)*10+i).map(index=><button type="button" key={index} aria-current={current===index ? 'page' : undefined} onClick={()=>setPage(index)} className={`${PAGE_BUTTON} `+'rounded-lg border border-line px-3 py-2 '+(current===index?'bg-brand text-white':'bg-card')}>{index+1}</button>)}
          <button type="button" disabled={current>=pages-1} onClick={()=>setPage(current+1)} className={`rounded-lg border border-line px-3 py-2 disabled:opacity-40 ${PAGE_BUTTON}`}>다음</button>
          <span role="status" className="text-sm text-muted">{current+1} / {pages}페이지</span>
        </nav>}
      </section>

      <Link href="/help#know" className="group/report mt-5 flex items-center gap-4 rounded-[14px] border border-[#DCE5F0] bg-[#F5F8FC] px-[22px] py-[18px] [transition:border-color_.2s_ease,background-color_.2s_ease] hover:border-[#A9C4E5] hover:bg-[#EEF4FB] max-[640px]:flex-wrap max-[640px]:gap-3 max-[640px]:p-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#DCE5F0] bg-white text-brand max-[640px]:size-[38px]" aria-hidden="true"><PhoneIcon size={20} /></span>
        <span className="min-w-0 max-[640px]:flex-1">
          <strong className="block text-[17px] leading-[1.5] font-extrabold tracking-[-.4px] break-keep text-navy max-[640px]:text-[15px]">기억나는 작은 단서도 제보가 됩니다</strong>
          <small className="mt-0.5 block text-[13px] break-keep text-muted max-[640px]:text-[12px]">언제, 어디서 봤는지만 알려 주셔도 큰 도움이 돼요.</small>
        </span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[14px] font-bold whitespace-nowrap text-brand max-[800px]:text-[13px] max-[640px]:w-full max-[640px]:justify-end">목격 제보 방법 보기<ArrowRightIcon size={15} aria-hidden="true" /></span>
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

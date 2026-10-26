"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatGender } from "@/lib/format";
import HomeChildCard from "./HomeChildCard";
import CountUp from "./CountUp";
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
      <section className="relative mx-0 min-h-[345px] overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#F4F8FD_0%,#FFFFFF_100%)] max-[640px]:min-h-[295px] max-[640px]:rounded-[14px]" aria-labelledby="campaign-title">
        <Image src="/images/search-campaign-hope.png" alt="" fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="animate-search-zoom object-cover object-[75%_38%] opacity-62 saturate-80 [-webkit-mask-image:linear-gradient(90deg,transparent_18%,#000_58%)] [mask-image:linear-gradient(90deg,transparent_18%,#000_58%)] max-[640px]:object-[65%_center] max-[640px]:opacity-40 max-[640px]:[-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_70%)] max-[640px]:[mask-image:linear-gradient(90deg,transparent_0%,#000_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,248,253,0)_0%,rgba(244,248,253,.35)_72%,rgba(255,255,255,.7)_100%)] max-[640px]:bg-[linear-gradient(180deg,rgba(244,248,253,.1),rgba(255,255,255,.6))]" />
        <div className="relative px-10 pt-[38px] pb-[88px] max-[800px]:pl-[25px] max-[640px]:px-5 max-[640px]:pt-7 max-[640px]:pb-20">
          <p className={`${RISE} mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[rgb(57_120_184/16%)] bg-white/78 px-3 py-[5px] text-[12px] leading-[1.8] font-bold tracking-[.02em] break-keep text-brand backdrop-blur-[6px] before:size-1.5 before:animate-search-dot before:rounded-full before:bg-coral before:content-[''] max-[640px]:max-w-[180px] max-[640px]:text-[11px] motion-reduce:before:animate-none`}>작은 관심으로 함께 만드는 안전한 내일</p>
          <h1 id="campaign-title" className="mb-4 animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_.08s_backwards] text-[44px] leading-[1.22] font-[850] tracking-[-1.6px] text-navy max-[1100px]:text-[40px] max-[800px]:text-[34px] max-[640px]:text-[31px] max-[640px]:tracking-[-1px]">실종아동을<br /><span className="text-brand">함께 찾아주세요</span></h1>
          <p className="animate-[search-rise_.85s_cubic-bezier(.2,.7,.2,1)_.16s_backwards] text-[15px] leading-[1.8] break-keep text-muted max-[800px]:text-[13px] max-[640px]:max-w-[230px] max-[640px]:text-[12px]">작은 관심이 한 아이의 내일을 바꿀 수 있습니다.<br />이름, 지역, 나이 등 기억나는 정보로 찾아보세요.</p>
        </div>
        <span className="absolute right-5 bottom-[65px] text-[10px] text-white [text-shadow:0_1px_4px_#15314b] max-[640px]:right-3 max-[640px]:bottom-12 max-[640px]:text-[8px]">AI로 제작한 캠페인 이미지</span>
      </section>
      <section className="relative mt-4 max-[640px]:mt-3" aria-labelledby="search-page-title">
        <div className="mx-auto w-full max-w-300">
          <h2 id="search-page-title" className="sr-only" tabIndex={-1}>실종아동 검색</h2>
          <div className={SEARCH_BOX}><SearchPanel query={query} onQueryChange={(value)=>{setQuery(value);setPage(0);}} filters={filters} onFiltersChange={(value)=>{setFilters(value);setPage(0);}} regions={regions} onReset={reset} onSubmit={goToResults} inputId={SEARCH_INPUT_ID} /></div>
          {selected.length > 0 && <div className="mx-[3px] mt-3 mb-0 flex flex-wrap items-center gap-[7px] text-[12px] text-[#6e8095] max-[640px]:text-[11px]" aria-label="선택한 검색 조건" aria-live="polite"><strong className="font-semibold">선택한 조건</strong>{selected.map((label) => <span key={label} className="animate-search-chip-in rounded-[5px] bg-brand-soft px-2 py-[3px]">{label}</span>)}</div>}

        </div>
      </section>
      <section aria-labelledby="results" className="mx-auto mt-4 w-full max-w-300 rounded-2xl border border-[#E3EAF3] bg-white px-[22px] pt-6 pb-7 shadow-[0_6px_22px_rgba(23,59,112,.035)] max-[640px]:mt-3 max-[640px]:rounded-[13px] max-[640px]:px-[13px] max-[640px]:pt-[18px] max-[640px]:pb-5">
        <header className="mb-3.5 flex items-center justify-between gap-[18px] max-[640px]:mb-3 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2.5">
          <h2 id="results" tabIndex={-1} className="flex scroll-mt-[100px] items-center gap-2.5 text-[24px] leading-[1.4] font-extrabold tracking-[-.7px] text-navy outline-none before:size-2 before:flex-none before:rounded-full before:bg-coral before:shadow-[0_0_0_4px_#FEF4F3] before:content-[''] max-[640px]:text-[22px]">현재 찾고 있는 아이들</h2>
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
        <div className="mb-[18px] flex items-center gap-2.5 rounded-xl border border-[#E7ECF2] bg-[#F9FAFC] px-[13px] py-2.5 text-[12px] leading-[1.7] text-[#6b7b8e] max-[640px]:items-start max-[640px]:gap-2 max-[640px]:px-[11px] max-[640px]:text-[11px]"><span className="shrink-0 border-r border-[#d9e2ec] pr-2.5 text-[11px] font-bold text-brand max-[640px]:pr-2 max-[640px]:text-[10px]">자료 출처: 경찰청</span><p>우리 DB에 동기화된 공개 실종아동 정보입니다. 검색과 페이지 이동은 저장된 정보만 조회합니다.</p></div>
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

      <Link href="/help#know" className="mt-[25px] grid min-h-[100px] grid-cols-[130px_minmax(0,1fr)] items-center gap-[18px] rounded-[13px] bg-[linear-gradient(100deg,#fdf2f1,#f8f5f5_60%,#faf1f0)] px-[22px] py-2 [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease] hover:[transform:translateY(-3px)] hover:shadow-[0_14px_30px_rgba(185,78,64,.12)] max-[640px]:grid-cols-[76px_minmax(0,1fr)] max-[640px]:gap-2.5 max-[640px]:p-2.5" aria-label="기억나는 작은 단서, 목격 제보 안내 보기">
        <Image src="/images/report-hope-hand.png" alt="" width={112} height={74} sizes="(max-width: 640px) 76px, 112px" className="h-24 w-[150px] shrink-0 animate-search-float object-contain max-[800px]:h-[85px] max-[800px]:w-[110px] max-[640px]:h-[68px] max-[640px]:w-[76px]" />
        <span className="min-w-0 text-center max-[640px]:flex-1">
          <strong className="block text-[20px] leading-[1.5] font-extrabold tracking-[-.5px] break-keep max-[1100px]:text-[18px] max-[640px]:text-[14px]">기억나는 작은 단서, <span className="text-brand">다시 만나는 희망이 됩니다.</span></strong>
          <small className="mt-[5px] block text-[13px] text-[#7b8493] max-[640px]:text-[10px]">작은 기억도 소중한 제보가 될 수 있어요.</small>
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

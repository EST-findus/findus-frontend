"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { MissingPerson, SortKey } from "@/lib/types";
import { DEFAULT_FILTERS, filterPersons } from "@/lib/filter";
import HomeChildCard from "./HomeChildCard";
import DetailModal from "./DetailModal";
import ReportGuideModal from "./ReportGuideModal";
import ShareModal from "./ShareModal";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

// Long enough to read a name and region before the cards move on.
const AUTO_ADVANCE_MS = 6000;
const SORT: SortKey = "recent";

// Home children listing: section heading, a link to the full search, and a slow carousel of comparison cards.
const cardsGrid = "grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-sm:grid-cols-[1fr] max-sm:gap-3.5";
const pageButtonBase = "flex size-10 cursor-pointer items-center justify-center border [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.2s_ease] enabled:active:[transform:scale(.95)] disabled:cursor-default disabled:opacity-35 max-sm:size-11";
const pageButton = `${pageButtonBase} rounded-full border-[#DCE6F1] bg-white text-[#3D5877] enabled:hover:border-brand enabled:hover:bg-brand enabled:hover:text-white`;

const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(max-width: 639px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const mobileSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
const serverSnapshot = () => false;
const subscribeDesktop = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 1100px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const desktopSnapshot = () => window.matchMedia("(min-width: 1100px)").matches;
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HomeChildren({persons}: {persons: MissingPerson[]}) {
  const [page, setPage] = useState(0);
  const [outgoing, setOutgoing] = useState<MissingPerson[] | null>(null);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, serverSnapshot);
  const [detail, setDetail] = useState<MissingPerson | null>(null);
  const [report, setReport] = useState<MissingPerson | null>(null);
  const [share, setShare] = useState<MissingPerson | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
  const pageSize = mobile ? 1 : desktop ? 3 : 2;
  // 검색과 정렬은 실종아동 찾기 화면에서 한다. 홈은 최근 실종 순으로 카드만 넘겨 보여준다.
  const results = useMemo(()=>filterPersons(persons,{query:"",filters:DEFAULT_FILTERS,sort:SORT}),[persons]);
  const pages = Math.ceil(results.length / pageSize);
  const current = Math.min(page,Math.max(0,pages-1));
  const start = current * pageSize;
  const end = Math.min(start+pageSize,results.length);
  const move = useCallback((next: number, travel: "next" | "previous") => {
    if (outgoing || pages < 2) return;
    setDirection(travel);
    if (!reducedMotion) setOutgoing(results.slice(start,end));
    setPage((next + pages) % pages);
  }, [outgoing,pages,reducedMotion,results,start,end]);

  useEffect(() => {
    if (!outgoing) return;
    const timer = window.setTimeout(()=>setOutgoing(null),620);
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry])=>setInView(entry.isIntersecting && entry.intersectionRatio >= 0.4),{threshold:0.4});
    observer.observe(element);
    const visibility = () => setVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange",visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",visibility); };
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion || hovered || focused || !inView || !visible || detail || report || share || pages < 2 || outgoing) return;
    const timer = window.setTimeout(()=>move(current+1,"next"),AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [playing,reducedMotion,hovered,focused,inView,visible,detail,report,share,pages,outgoing,current,move]);

  const renderCard = (person: MissingPerson) => <HomeChildCard key={person.id} person={person} onOpenDetail={(person,element)=>{setTrigger(element);setDetail(person);}} onReport={(person,element)=>{setTrigger(element);setReport(person);}} onShare={(person,element)=>{setTrigger(element);setShare(person);}} />;
  return <section className="bg-white pt-10 pb-5 max-sm:pt-7 max-sm:pb-4 [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-3 [&_select:focus-visible]:outline-brand" aria-labelledby="home-children-title">
    <div className="page-container relative">
      <header className="mb-[22px] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-3.5 max-sm:mb-3.5 max-sm:grid-cols-[minmax(0,1fr)] max-sm:gap-3" data-reveal="stagger">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-brand"><span className="size-1.5 animate-home-dot-pulse rounded-full bg-[#F28B82]" />함께 찾고 있어요</p>
          <h2 id="home-children-title" className="mt-2.5 text-[30px] leading-[1.3] font-extrabold tracking-[-.9px] break-keep text-brand-dark max-sm:mt-3 max-sm:text-[23px]">지금, 우리가 함께 찾고 있는 아이들</h2>
          <p className="mt-1.5 text-[14px] leading-[1.7] break-keep text-muted max-sm:text-[13px]">경찰청에 공개된 실종아동 정보입니다. 기억나는 얼굴이 있다면 상세 정보를 확인해 주세요.</p>
        </div>
        <Link className="group/all inline-flex items-center gap-2 px-0.5 py-2.5 text-[14px] font-bold whitespace-nowrap text-brand [background:linear-gradient(currentColor,currentColor)_left_calc(100%-6px)/0_1px_no-repeat] [transition:background-size_.3s_ease,color_.2s_ease] hover:text-brand-dark hover:[background-size:calc(100%-24px)_1px] max-sm:justify-self-start max-sm:px-0 max-sm:py-1 max-sm:text-[13px]" href="/search">전체 아동 찾아보기 <ArrowRightIcon size={16} className="[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover/all:[transform:translateX(4px)]" /></Link>
      </header>
      <div ref={carouselRef} data-reveal className="relative" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);}}>
        <div className="relative -mx-3 -mt-3.5 -mb-7 overflow-hidden px-3 pt-3.5 pb-7" id="home-comparison-cards" aria-roledescription="슬라이드" aria-label="아동 비교 카드">
          {outgoing && <div className={`${cardsGrid} pointer-events-none absolute top-3.5 right-3 left-3 motion-reduce:animate-none ${direction === "next" ? "animate-home-cards-exit-left" : "animate-home-cards-exit-right"}`} inert aria-hidden="true">{outgoing.map(renderCard)}</div>}
          <div key={`${current}-${pageSize}`} className={`${cardsGrid} ${outgoing ? `motion-reduce:animate-none ${direction === "next" ? "animate-home-cards-enter-right" : "animate-home-cards-enter-left"}` : ""}`}>{results.slice(start,end).map(renderCard)}</div>
        </div>
        {results.length === 0 && <p className="px-5 py-14 text-center text-[14px] text-[#6C7F94]">현재 표시할 아동 정보가 없습니다. 전체 검색에서 다시 확인해 주세요.</p>}
        <div className="relative mt-2 min-h-10 max-[1100px]:flex max-[1100px]:flex-col max-[1100px]:items-center max-[1100px]:gap-2.5">
        {pages > 1 && <nav className="flex items-center justify-center gap-4 max-sm:gap-3" aria-label="홈 아동 카드 넘기기">
          <button type="button" className={pageButton} aria-label="이전 아동 카드 보기" aria-controls="home-comparison-cards" disabled={Boolean(outgoing)} onClick={()=>move(current-1,"previous")}><ChevronLeftIcon size={19} /></button>
          <p className="min-w-[72px] text-center text-[13px] text-subtle" aria-live={playing && !reducedMotion ? "off" : "polite"}><strong className="font-[750] text-brand-dark">{mobile ? start+1 : `${start+1}–${end}`}</strong><span> / {results.length}명</span><span className="sr-only"> · {current+1} / {pages} 페이지</span></p>
          <button type="button" className={pageButton} aria-label="다음 아동 카드 보기" aria-controls="home-comparison-cards" disabled={Boolean(outgoing)} onClick={()=>move(current+1,"next")}><ChevronRightIcon size={19} /></button>
          {!reducedMotion && <button type="button" className={`${pageButtonBase} w-auto! gap-1.5 rounded-lg border-transparent bg-transparent px-3 text-[12px] text-muted enabled:hover:border-transparent enabled:hover:bg-[#EEF4FB] enabled:hover:text-brand-dark max-sm:px-1.5 max-sm:text-[11px]`} aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 시작"} aria-pressed={!playing} onClick={()=>setPlaying(!playing)}><span aria-hidden="true" className="text-[14px]">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "일시정지" : "자동 넘김"}</span></button>}
        </nav>}
        <p className="absolute top-1/2 right-0 m-0 flex -translate-y-1/2 items-baseline gap-[9px] text-[11px] leading-[1.7] text-subtle max-[1100px]:static max-[1100px]:translate-none max-sm:items-start max-sm:gap-[7px] max-sm:text-left max-sm:text-[10.5px]"><span className="shrink-0 font-[650] text-[#3D5877]">자료 출처: 경찰청</span><span>DB에 동기화된 공개 실종아동 정보와 원본 사진입니다.</span></p>
        </div>
      </div>
    </div>
    {detail && <DetailModal person={detail} returnFocusTo={trigger} onClose={()=>setDetail(null)} onReport={person=>{setDetail(null);setReport(person);}} />}
    {report && <ReportGuideModal person={report} returnFocusTo={trigger} onClose={()=>setReport(null)} />}
    {share && <ShareModal person={share} returnFocusTo={trigger} onClose={()=>setShare(null)} />}
  </section>;
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { MissingPerson, SortKey } from "@/lib/types";
import { DEFAULT_FILTERS, filterPersons } from "@/lib/filter";
import ChildComparisonCard from "./ChildComparisonCard";
import DetailModal from "./DetailModal";
import ReportGuideModal from "./ReportGuideModal";
import ShareModal from "./ShareModal";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import styles from "./HomeChildren.module.css";

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
  const [sort, setSort] = useState<SortKey>("recent");
  const [detail, setDetail] = useState<MissingPerson | null>(null);
  const [report, setReport] = useState<MissingPerson | null>(null);
  const [share, setShare] = useState<MissingPerson | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
  const pageSize = mobile ? 1 : desktop ? 3 : 2;
  const results = useMemo(()=>filterPersons(persons,{query:"",filters:DEFAULT_FILTERS,sort}),[persons,sort]);
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
    const timer = window.setTimeout(()=>move(current+1,"next"),2000);
    return () => window.clearTimeout(timer);
  }, [playing,reducedMotion,hovered,focused,inView,visible,detail,report,share,pages,outgoing,current,move]);

  const renderCard = (person: MissingPerson) => <ChildComparisonCard key={person.id} person={person} comparison actionVariant="home" className={styles.comparisonCard} onOpenDetail={(person,element)=>{setTrigger(element);setDetail(person);}} onReport={(person,element)=>{setTrigger(element);setReport(person);}} onShare={(person,element)=>{setTrigger(element);setShare(person);}} />;
  return <section className={styles.section} aria-labelledby="home-children-title">
    <div className={`page-container ${styles.sectionBox}`}>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}><span />함께 찾는 마음</p><h2 id="home-children-title">지금, 우리가 함께 찾고 있는 아이들</h2><p className={styles.description}>기억 속 얼굴을 다시 살펴보세요. 작은 관심이 소중한 단서가 될 수 있습니다.</p></div>
        <Link className={styles.allLink} href="/search">전체 아동 찾아보기 <ArrowRightIcon size={17} /></Link>
      </header>
      <div className={styles.toolbar}>
        <p><strong>{results.length}명</strong>의 정보를 함께 살펴보고 있어요.</p>
        <div><label htmlFor="home-children-sort">정렬</label><select id="home-children-sort" value={sort} onChange={event=>{setSort(event.target.value as SortKey);setPage(0);setOutgoing(null);}}><option value="recent">실종 연도 최신순</option><option value="oldest">실종 연도 오래된순</option><option value="name">이름순</option></select></div>
      </div>
      <div ref={carouselRef} className={styles.carousel} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);}}>
        <div className={styles.viewport} id="home-comparison-cards" aria-roledescription="슬라이드" aria-label="아동 비교 카드">
          {outgoing && <div className={`${styles.cards} ${styles.outgoing} ${direction === "next" ? styles.exitLeft : styles.exitRight}`} inert aria-hidden="true">{outgoing.map(renderCard)}</div>}
          <div key={`${sort}-${current}-${pageSize}`} className={`${styles.cards} ${outgoing ? direction === "next" ? styles.enterRight : styles.enterLeft : ""}`}>{results.slice(start,end).map(renderCard)}</div>
        </div>
        {results.length === 0 && <p className={styles.empty}>현재 표시할 아동 정보가 없습니다. 전체 검색에서 다시 확인해 주세요.</p>}
        {pages > 1 && <nav className={styles.pagination} aria-label="홈 아동 카드 넘기기">
          <button type="button" aria-label="이전 아동 카드 보기" aria-controls="home-comparison-cards" disabled={Boolean(outgoing)} onClick={()=>move(current-1,"previous")}><ChevronLeftIcon size={19} /></button>
          <p aria-live={playing && !reducedMotion ? "off" : "polite"}><strong>{mobile ? start+1 : `${start+1}–${end}`}</strong><span> / {results.length}명</span><span className="sr-only"> · {current+1} / {pages} 페이지</span></p>
          <button type="button" aria-label="다음 아동 카드 보기" aria-controls="home-comparison-cards" disabled={Boolean(outgoing)} onClick={()=>move(current+1,"next")}><ChevronRightIcon size={19} /></button>
          {!reducedMotion && <button type="button" className={styles.rotationControl} aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 시작"} aria-pressed={!playing} onClick={()=>setPlaying(!playing)}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "일시정지" : "자동 넘김"}</span></button>}
        </nav>}
      </div>
      <p className={styles.demo}><span>자료 출처: 경찰청</span><span>DB에 동기화된 공개 실종아동 정보와 원본 사진입니다.</span></p>
    </div>
    {detail && <DetailModal person={detail} returnFocusTo={trigger} onClose={()=>setDetail(null)} onReport={person=>{setDetail(null);setReport(person);}} />}
    {report && <ReportGuideModal person={report} returnFocusTo={trigger} onClose={()=>setReport(null)} />}
    {share && <ShareModal person={share} returnFocusTo={trigger} onClose={()=>setShare(null)} />}
  </section>;
}

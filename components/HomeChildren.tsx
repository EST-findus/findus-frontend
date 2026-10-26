"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MissingPerson, SortKey } from "@/lib/types";
import { DEFAULT_FILTERS, filterPersons } from "@/lib/filter";
import HomeChildCard, { yearsApart } from "./HomeChildCard";
import DetailModal from "./DetailModal";
import ReportGuideModal from "./ReportGuideModal";
import ShareModal from "./ShareModal";
import StoredPhoto from "./StoredPhoto";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import styles from "./HomeChildren.module.css";

// Long enough to read a name and region before the spotlight moves on.
const AUTO_ADVANCE_MS = 4000;
const SORT: SortKey = "recent";
// The list beside the spotlight shows this many children at a time; the highlight moves within the group.
const GROUP = 5;
const SWIPE_PX = 50;

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => false;

function Thumb({ person }: { person: MissingPerson }) {
  return person.source === "api"
    ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt="" sizes="72px" />
    : <Image src={person.photos.past} alt="" fill sizes="72px" />;
}

/**
 * 홈 '함께 찾고 있는 아이들'. 왼쪽에 한 아이를 크게(스포트라이트) 보여주고, 오른쪽에 같은 묶음의 다음 아이들을 둔다.
 * 4초마다 다음 아이로 넘어가고, 목록을 누르거나 화살표·스와이프로 직접 고를 수 있다.
 */
export default function HomeChildren({persons}: {persons: MissingPerson[]}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<MissingPerson | null>(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, serverSnapshot);
  const [detail, setDetail] = useState<MissingPerson | null>(null);
  const [report, setReport] = useState<MissingPerson | null>(null);
  const [share, setShare] = useState<MissingPerson | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  // 검색과 정렬은 실종아동 찾기 화면에서 한다. 홈은 최근 실종 순으로 보여주되,
  // AI 예상 모습이 준비된 아이를 앞에 두어 첫 화면이 빈 칸으로 시작하지 않게 한다.
  const results = useMemo(()=>{
    const sorted = filterPersons(persons,{query:"",filters:DEFAULT_FILTERS,sort:SORT});
    return [...sorted.filter(p=>p.photos.aged), ...sorted.filter(p=>!p.photos.aged)];
  },[persons]);
  const total = results.length;
  const current = total ? ((index % total) + total) % total : 0;
  const person = results[current];
  const groupStart = Math.floor(current / GROUP) * GROUP;
  const group = results.slice(groupStart, groupStart + GROUP);

  const select = useCallback((next: number) => {
    if (total < 2) return;
    const target = ((next % total) + total) % total;
    if (target === current) return;
    if (!reducedMotion && person) setLeaving(person);
    setIndex(target);
  }, [total, current, reducedMotion, person]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(()=>setLeaving(null),620);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry])=>setInView(entry.isIntersecting && entry.intersectionRatio >= 0.3),{threshold:0.3});
    observer.observe(element);
    const visibility = () => setVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange",visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",visibility); };
  }, []);

  const autoplay = playing && !reducedMotion && !hovered && !focused && inView && visible && !detail && !report && !share && total > 1;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(()=>select(current+1),AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay,current,select]);

  const actions = {
    onOpenDetail:(p: MissingPerson, el: HTMLElement)=>{setTrigger(el);setDetail(p);},
    onReport:(p: MissingPerson, el: HTMLElement)=>{setTrigger(el);setReport(p);},
    onShare:(p: MissingPerson, el: HTMLElement)=>{setTrigger(el);setShare(p);},
  };

  return <section className={styles.section} aria-labelledby="home-children-title">
    <div className={`page-container ${styles.sectionBox}`}>
      <header className={styles.heading} data-reveal="stagger">
        <div className={styles.headingCopy}>
          <p className={styles.eyebrow}><span />함께 찾고 있어요</p>
          <h2 id="home-children-title">지금, 우리가 함께 찾고 있는 아이들</h2>
          <p className={styles.description}>경찰청에 공개된 실종아동 정보입니다. 기억나는 얼굴이 있다면 상세 정보를 확인해 주세요.</p>
        </div>
        <Link className={styles.allLink} href="/search">전체 아동 찾아보기 <ArrowRightIcon size={16} /></Link>
      </header>

      {person ? (
        <div ref={stageRef} data-reveal className={styles.spotlight} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);}}>
          <div className={styles.stage} id="home-spotlight" aria-roledescription="슬라이드" aria-label="함께 찾고 있는 아이"
            onTouchStart={event=>{touchX.current = event.touches[0].clientX;}}
            onTouchEnd={event=>{ if(touchX.current===null) return; const dx = event.changedTouches[0].clientX - touchX.current; touchX.current = null; if(Math.abs(dx) > SWIPE_PX) select(current + (dx < 0 ? 1 : -1)); }}>
            {leaving && <div className={`${styles.stageCard} ${styles.leaving}`} inert aria-hidden="true"><HomeChildCard person={leaving} feature {...actions} /></div>}
            <div key={person.id} className={`${styles.stageCard} ${styles.entering}`}><HomeChildCard person={person} feature {...actions} /></div>
          </div>

          <aside className={styles.queue} aria-label="다음 아이들">
            <p className={styles.queueTitle}>함께 기억해 주세요 <span>{current+1} / {total}명</span></p>
            <div className={styles.queueBox} style={{ "--i": current - groupStart } as CSSProperties}>
            <span aria-hidden="true" className={styles.queueMarker} />
            <ol className={styles.queueList}>
              {group.map((item, offset) => {
                const active = groupStart + offset === current;
                const years = yearsApart(item);
                return <li key={item.id}>
                  <button type="button" aria-current={active ? "true" : undefined} aria-controls="home-spotlight" onClick={()=>select(groupStart+offset)} className={styles.queueItem}>
                    <span className={styles.queueThumb}><Thumb person={item} /></span>
                    <span className={styles.queueText}>
                      <strong>{item.name}</strong>
                      <small>{item.region || "지역 정보 없음"}{years !== null ? ` · ${years}년째` : ""}</small>
                    </span>
                    {active && autoplay && <span key={current} aria-hidden="true" className={styles.queueProgress} style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }} />}
                  </button>
                </li>;
              })}
            </ol>
            </div>
            <nav className={styles.queueNav} aria-label="함께 찾고 있는 아이 넘기기">
              <button type="button" aria-label="이전 아이 보기" aria-controls="home-spotlight" onClick={()=>select(current-1)}><ChevronLeftIcon size={18} /></button>
              <button type="button" aria-label="다음 아이 보기" aria-controls="home-spotlight" onClick={()=>select(current+1)}><ChevronRightIcon size={18} /></button>
              {!reducedMotion && <button type="button" className={styles.rotationControl} aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 시작"} aria-pressed={!playing} onClick={()=>setPlaying(!playing)}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "일시정지" : "자동 넘김"}</span></button>}
            </nav>
            <p className={styles.demo}><span>자료 출처: 경찰청</span><span>DB에 동기화된 공개 실종아동 정보와 원본 사진입니다.</span></p>
          </aside>
          <p className="sr-only" aria-live={autoplay ? "off" : "polite"}>{person.name}, {current+1}번째 아이</p>
        </div>
      ) : <p className={styles.empty}>현재 표시할 아동 정보가 없습니다. 전체 검색에서 다시 확인해 주세요.</p>}
    </div>
    {detail && <DetailModal person={detail} returnFocusTo={trigger} onClose={()=>setDetail(null)} onReport={p=>{setDetail(null);setReport(p);}} />}
    {report && <ReportGuideModal person={report} returnFocusTo={trigger} onClose={()=>setReport(null)} />}
    {share && <ShareModal person={share} returnFocusTo={trigger} onClose={()=>setShare(null)} />}
  </section>;
}

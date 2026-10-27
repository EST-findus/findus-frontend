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

// Long enough to read a name and region before the spotlight moves on.
const AUTO_ADVANCE_MS = 4000;
const SORT: SortKey = "recent";
// The list beside the spotlight shows this many children at a time; the highlight moves within the group.
const GROUP = 5;
const SWIPE_PX = 50;

// Spotlight: one child large on the left, the rest of the group listed on the right. Changing child cross-fades:
// the old card fades away while the new one settles in, its text arriving just after the photo.
const entering = [
  "relative z-1 min-w-0",
  "[&_article>div:first-child]:animate-home-stage-photo [&_article>div:nth-child(2)>*]:animate-home-stage-text",
  "[&_article>div:nth-child(2)>:nth-child(2)]:[animation-delay:.24s] [&_article>div:nth-child(2)>:nth-child(3)]:[animation-delay:.3s] [&_article>div:nth-child(2)>:nth-child(n+4)]:[animation-delay:.36s]",
  "motion-reduce:[&_article>div]:animate-none! motion-reduce:[&_article>div:nth-child(2)>*]:animate-none!",
].join(" ");
// The highlight slides to the active row, like the tab indicator elsewhere on the site. Narrow screens scroll the list sideways instead.
const queueMarker = "pointer-events-none absolute inset-x-0 top-0 h-[88px] rounded-2xl border border-l-4 border-[#BFD3EC] border-l-brand bg-brand-soft [transform:translateY(calc(var(--i)*98px))] [transition:transform_.45s_cubic-bezier(.2,.7,.2,1)] max-[1000px]:hidden motion-reduce:[transition:none]";
const queueItem = "group/item relative flex h-[88px] w-full cursor-pointer items-center gap-3.5 overflow-hidden rounded-2xl border bg-transparent px-3.5 py-2.5 text-left [transition:background-color_.2s_ease,border-color_.2s_ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-sm:h-[76px] max-sm:gap-2.5 max-sm:px-2.5 max-sm:py-2 motion-reduce:[transition:none]";
const navButtonBase = "grid size-10 cursor-pointer place-items-center border [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.2s_ease] active:[transform:scale(.95)] motion-reduce:[transition:none]";
const navButton = `${navButtonBase} rounded-full border-[#DCE6F1] bg-white text-[#3D5877] hover:border-brand hover:bg-brand hover:text-white`;

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
    : <Image quality={90} src={person.photos.past} alt="" fill sizes="72px" />;
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

  return <section className="bg-white pt-24 pb-12 max-sm:pt-14 max-sm:pb-8 [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-3 [&_select:focus-visible]:outline-brand" aria-labelledby="home-children-title">
    <div className="page-container relative">
      <header className="mb-9 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-4 max-sm:mb-6 max-sm:grid-cols-[minmax(0,1fr)] max-sm:gap-3" data-reveal="stagger">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-brand"><span className="size-1.5 animate-home-dot-pulse rounded-full bg-[#F28B82]" />함께 찾고 있어요</p>
          <h2 id="home-children-title" className="mt-3.5 text-[30px] leading-[1.3] font-extrabold tracking-[-.9px] break-keep text-brand-dark max-sm:mt-3 max-sm:text-[23px]">지금, 우리가 함께 찾고 있는 아이들</h2>
          <p className="mt-2.5 text-[14px] leading-[1.7] break-keep text-muted max-sm:text-[13px]">경찰청에 공개된 실종아동 정보입니다. 기억나는 얼굴이 있다면 상세 정보를 확인해 주세요.</p>
        </div>
        <Link className="group/all inline-flex items-center gap-2 px-0.5 py-2.5 text-[14px] font-bold whitespace-nowrap text-brand [background:linear-gradient(currentColor,currentColor)_left_calc(100%-6px)/0_1px_no-repeat] [transition:background-size_.3s_ease,color_.2s_ease] hover:text-brand-dark hover:[background-size:calc(100%-24px)_1px] max-sm:justify-self-start max-sm:px-0 max-sm:py-1 max-sm:text-[13px]" href="/search">전체 아동 찾아보기 <ArrowRightIcon size={16} className="[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover/all:[transform:translateX(4px)]" /></Link>
      </header>

      {person ? (
        <div ref={stageRef} data-reveal className="grid grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)] items-stretch gap-10 max-[1000px]:grid-cols-[minmax(0,1fr)] max-[1000px]:gap-6" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);}}>
          <div className="relative min-w-0 touch-pan-y" id="home-spotlight" aria-roledescription="슬라이드" aria-label="함께 찾고 있는 아이"
            onTouchStart={event=>{touchX.current = event.touches[0].clientX;}}
            onTouchEnd={event=>{ if(touchX.current===null) return; const dx = event.changedTouches[0].clientX - touchX.current; touchX.current = null; if(Math.abs(dx) > SWIPE_PX) select(current + (dx < 0 ? 1 : -1)); }}>
            {leaving && <div className="pointer-events-none absolute inset-0 z-0 min-w-0 animate-home-stage-out motion-reduce:animate-none" inert aria-hidden="true"><HomeChildCard person={leaving} feature {...actions} /></div>}
            <div key={person.id} className={entering}><HomeChildCard person={person} feature {...actions} /></div>
          </div>

          <aside className="flex min-w-0 flex-col" aria-label="다음 아이들">
            <p className="mb-3.5 flex items-baseline justify-between gap-2.5 text-[16px] font-extrabold tracking-[-.3px] text-brand-dark">함께 기억해 주세요 <span className="text-[13px] font-semibold text-subtle tabular-nums">{current+1} / {total}명</span></p>
            <div className="relative" style={{ "--i": current - groupStart } as CSSProperties}>
            <span aria-hidden="true" className={queueMarker} />
            <ol className="relative grid gap-2.5 max-[1000px]:flex max-[1000px]:overflow-x-auto max-[1000px]:pb-1 max-[1000px]:[scrollbar-width:none]">
              {group.map((item, offset) => {
                const active = groupStart + offset === current;
                const years = yearsApart(item);
                return <li key={item.id} className="relative z-1 max-[1000px]:flex-[0_0_220px] max-sm:basis-[180px]">
                  <button type="button" aria-current={active ? "true" : undefined} aria-controls="home-spotlight" onClick={()=>select(groupStart+offset)} className={`${queueItem} ${active ? "border-transparent max-[1000px]:border-[#BFD3EC] max-[1000px]:border-l-4 max-[1000px]:border-l-brand max-[1000px]:bg-brand-soft" : "border-[#E3EAF3] hover:border-[#C9DAEE] hover:bg-[#F7FAFE]"}`}>
                    <span className="relative size-16 flex-none overflow-hidden rounded-xl bg-[#E6EBF1] [transition:transform_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/item:[transform:scale(1.05)] max-sm:size-[54px] motion-reduce:[transition:none]"><Thumb person={item} /></span>
                    <span className="grid min-w-0 gap-[3px]">
                      <strong className="truncate text-[16px] font-extrabold text-brand-dark">{item.name}</strong>
                      <small className="truncate text-[12.5px] text-muted">{item.region || "지역 정보 없음"}{years !== null ? ` · ${years}년째` : ""}</small>
                    </span>
                    {active && autoplay && <span key={current} aria-hidden="true" className="absolute inset-x-3.5 bottom-2 h-[3px] origin-left animate-home-queue-fill rounded-full bg-brand opacity-75 motion-reduce:animate-none" style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }} />}
                  </button>
                </li>;
              })}
            </ol>
            </div>
            {/* 컨트롤과 출처는 카드 아래선에 맞춰 오른쪽 아래로 보낸다. 일시정지를 앞에 두어 둥근 버튼이 오른쪽 끝에 닿게 한다. */}
            <nav className="mt-auto flex items-center justify-end gap-2 pt-4" aria-label="함께 찾고 있는 아이 넘기기">
              <button type="button" className={navButton} aria-label="이전 아이 보기" aria-controls="home-spotlight" onClick={()=>select(current-1)}><ChevronLeftIcon size={18} /></button>
              <button type="button" className={navButton} aria-label="다음 아이 보기" aria-controls="home-spotlight" onClick={()=>select(current+1)}><ChevronRightIcon size={18} /></button>
              {!reducedMotion && <button type="button" className={`${navButtonBase} order-first w-auto! grid-flow-col gap-1.5 rounded-lg border-transparent bg-transparent px-3 text-[12px] text-muted hover:bg-[#EEF4FB] hover:text-brand-dark`} aria-label={playing ? "자동 넘김 일시정지" : "자동 넘김 시작"} aria-pressed={!playing} onClick={()=>setPlaying(!playing)}><span aria-hidden="true" className="text-[14px]">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "일시정지" : "자동 넘김"}</span></button>}
            </nav>
            <p className="mt-3.5 grid justify-items-end gap-0.5 text-right text-[12.5px] leading-[1.7] text-subtle max-sm:text-[12px]"><span className="font-[650] text-[#3D5877]">자료 출처: 경찰청</span><span>DB에 동기화된 공개 실종아동 정보와 원본 사진입니다.</span></p>
          </aside>
          <p className="sr-only" aria-live={autoplay ? "off" : "polite"}>{person.name}, {current+1}번째 아이</p>
        </div>
      ) : <p className="px-5 py-14 text-center text-[14px] text-[#6C7F94]">현재 표시할 아동 정보가 없습니다. 전체 검색에서 다시 확인해 주세요.</p>}
    </div>
    {detail && <DetailModal person={detail} returnFocusTo={trigger} onClose={()=>setDetail(null)} onReport={p=>{setDetail(null);setReport(p);}} />}
    {report && <ReportGuideModal person={report} returnFocusTo={trigger} onClose={()=>setReport(null)} />}
    {share && <ShareModal person={share} returnFocusTo={trigger} onClose={()=>setShare(null)} />}
  </section>;
}

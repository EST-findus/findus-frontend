import Link from "next/link";
import type { CSSProperties } from "react";
import { kicker, rise, sectionText, sectionTitle } from "./infoStyles";
import { ArrowUpRightIcon, ChevronRightIcon, HeartIcon } from "./Icons";
import { NEWS_PAGE_HREF, NEWS_SUMMARY_COUNT, REUNION_NEWS } from "@/lib/reunionStories";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// 마이페이지 요약: 최근 소식 세 개를 작은 카드로, 올리면 살짝 떠오른다.
const SUMMARY_LIST =
  "mt-3.5 grid grid-cols-3 gap-2.5 max-md:grid-cols-1 max-md:gap-2 [&>li]:animate-reunion-rise [&>li:nth-child(2)]:[animation-delay:.07s] [&>li:nth-child(3)]:[animation-delay:.14s] motion-reduce:[&>li]:animate-none";
const SUMMARY_CARD =
  "group relative flex h-full min-h-[104px] flex-col rounded-[14px] border border-civic-line bg-civic-panel px-4 py-3.5 text-navy [-webkit-tap-highlight-color:transparent] [transition:translate_.3s_cubic-bezier(.2,.7,.2,1),border-color_.25s_ease,background-color_.25s_ease,box-shadow_.3s_ease] before:absolute before:top-3.5 before:bottom-3.5 before:left-0 before:w-[3px] before:rounded-[0_3px_3px_0] before:bg-coral before:opacity-85 before:content-[''] hover:[translate:0_-3px] hover:border-civic-hover hover:bg-white hover:shadow-[0_12px_26px_rgb(23_59_112/9%)] focus-visible:[translate:0_-3px] focus-visible:border-civic-hover focus-visible:bg-white focus-visible:shadow-[0_12px_26px_rgb(23_59_112/9%)] max-md:min-h-0 max-md:px-3.5 max-md:py-3 motion-reduce:transition-none motion-reduce:hover:[translate:none] motion-reduce:focus-visible:[translate:none]";
const SUMMARY_ACTION =
  "mt-auto inline-flex items-center gap-[3px] pt-2.5 text-[12.5px] font-bold text-civic max-md:absolute max-md:top-3 max-md:right-3.5 max-md:m-0 max-md:p-0 max-md:text-[0px] [&_svg]:[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover:[&_svg]:[transform:translate(2px,-2px)] motion-reduce:[&_svg]:transition-none";

// 정보 마당 뉴스: 첫 소식은 연한 하늘빛 면에 크게, 모든 카드에 헤어져 있던 햇수를 보여준다.
const NEWS_GRID =
  "mt-5 grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-2.5";
const NEWS_LEAD = "row-span-2 max-[900px]:col-span-full max-[900px]:row-auto";
const NEWS_CARD =
  "group relative flex min-h-[168px] flex-col overflow-hidden rounded-[18px] border shadow-[0_2px_8px_rgba(23,59,112,.04)] [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,border-color_.25s_ease] hover:[transform:translateY(-4px)] hover:shadow-[0_18px_36px_rgba(23,59,112,.1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-civic max-sm:min-h-0 motion-reduce:transition-none motion-reduce:hover:[transform:none]";
const NEWS_CARD_REST = "border-civic-line bg-white px-5 py-[18px] hover:border-civic-hover max-sm:p-4";
// 첫 소식: 하늘빛 면에 코랄 빛, 오른쪽 아래에 둥근 선을 하나 둔다. 올려도 테두리 색은 그대로다.
const NEWS_CARD_LEAD =
  "border-[#D4E3F2] bg-[radial-gradient(circle_at_100%_0%,rgba(242,139,130,.14),transparent_45%),#EAF2F9] px-[26px] pt-[26px] pb-[22px] after:pointer-events-none after:absolute after:-right-7 after:-bottom-7 after:size-[140px] after:rounded-full after:border after:border-civic/16 after:content-[''] max-sm:p-5";
const NEWS_CTA_TITLE =
  "text-[18px] font-extrabold tracking-[-.3px] before:mr-2.5 before:mb-[3px] before:inline-block before:size-[7px] before:rounded-full before:bg-coral before:content-['']";
const CTA_PRIMARY =
  "inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-[18px] text-[14px] font-extrabold text-navy [transition:background-color_.2s_ease,translate_.25s_cubic-bezier(.2,.7,.2,1)] hover:[translate:0_-1px] hover:bg-civic-soft motion-reduce:transition-none";
const CTA_GHOST =
  "inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 text-[14px] font-bold text-white [transition:background-color_.2s_ease,border-color_.2s_ease] hover:border-white/60 hover:bg-white/8 motion-reduce:transition-none";

/** 마이페이지용 요약. 전체 목록은 정보 마당의 뉴스 탭에서 본다. 최근 소식 세 개를 작은 카드로 보여준다. */
export default function ReunionStory() {
  return (
    <aside data-reunion-summary aria-labelledby="reunion-story-title" className="mx-auto mt-3.5 w-full max-w-[900px] rounded-[20px] border border-civic-line bg-white px-5 pt-[18px] pb-3.5 shadow-[0_2px_10px_rgb(23_59_112/5%)] max-md:rounded-2xl max-md:px-3.5 max-md:pt-4 max-md:pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex-none rounded-full bg-civic-soft px-[9px] py-[3px] text-[11.5px] font-bold text-civic">뉴스</span>
          <h3 className="text-[17px] font-extrabold tracking-[-.3px] text-navy">다시 만난 가족</h3>
        </div>
        <Link href={NEWS_PAGE_HREF} aria-label="다시 만난 가족 뉴스 자세히 보기" className={`inline-flex flex-none items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-civic-muted [transition:background-color_.2s_ease,color_.2s_ease] hover:bg-civic-soft hover:text-civic motion-reduce:transition-none ${FOCUS}`}>
          자세히 보기<ChevronRightIcon size={14} />
        </Link>
      </div>
      <ul className={SUMMARY_LIST}>
        {REUNION_NEWS.slice(0, NEWS_SUMMARY_COUNT).map((item) => <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer" title={`${item.title} · ${item.source} · ${item.date}`}
            aria-label={`${item.kind}, ${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`}
            className={`${SUMMARY_CARD} ${FOCUS}`}>
            <span className="text-[12px] text-civic-sub">{item.source} · {item.date}</span>
            <span className="mt-1 text-[15px] leading-[1.45] font-extrabold tracking-[-.2px] break-keep max-md:pr-5 max-md:text-[14px]">{item.title}</span>
            <span className={SUMMARY_ACTION}>{item.action}<ArrowUpRightIcon size={14} /></span>
          </a>
        </li>)}
      </ul>
      <h2 id="reunion-story-title" className="mt-3.5 flex items-center justify-center gap-1.5 border-t border-[#EEF2F7] pt-3 text-center text-[13px] font-semibold text-civic-deep max-md:text-[12px]"><HeartIcon size={15} className="flex-none text-coral" />다시 만날 날을 바라며, 희망을 함께 이어가요.</h2>
    </aside>
  );
}

/** 제목 속 "52년 만에"처럼 헤어져 있던 햇수. 카드에 크게 보여준다. */
const yearsApart = (title: string) => title.match(/(\d+)년/)?.[1] ?? null;

/** 정보 마당 뉴스 탭의 전체 목록. 첫 소식은 크게, 나머지는 작은 카드로 두고, 마지막에 찾기·안내로 잇는다. */
export function ReunionNewsList() {
  return (
    <section aria-labelledby="reunion-news-title" className="page-container max-w-5xl pt-7 max-sm:pt-5">
      <div className={`${rise} flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-3`}>
        <div>
          <p className={kicker}>REUNION NEWS</p>
          <h2 id="reunion-news-title" className={sectionTitle}>다시 만난 가족들의 이야기</h2>
          <p className={sectionText}>오랜 기다림 끝에 가족을 다시 만난 소식입니다. 카드를 누르면 기사·영상 원문이 새 창에서 열립니다.</p>
        </div>
        <p className="flex-none rounded-full border border-[#DCE8F4] bg-civic-soft px-3.5 py-2 text-[13px] font-semibold text-civic-deep"><strong className="mr-0.5 text-[15px] font-[850] text-civic">{REUNION_NEWS.length}</strong>건의 만남</p>
      </div>
      <ul className={NEWS_GRID}>
        {REUNION_NEWS.map((item, order) => {
          const years = yearsApart(item.title);
          const lead = order === 0;
          return <li key={item.href} className={`${rise} ${lead ? NEWS_LEAD : ""}`} style={{ "--d": `${0.08 + order * 0.06}s` } as CSSProperties}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`} className={`${NEWS_CARD} ${lead ? NEWS_CARD_LEAD : NEWS_CARD_REST} h-full`}>
              <span className="flex items-center justify-between gap-2.5">
                <span className={`w-fit rounded-full px-2.5 py-[3px] text-[11.5px] font-bold text-civic ${lead ? "bg-white" : "bg-civic-soft"}`}>{item.kind}</span>
                <ArrowUpRightIcon size={18} className="flex-none text-[#9FB3CC] [transition:transform_.25s_cubic-bezier(.2,.7,.2,1),color_.2s_ease] group-hover:[transform:translate(2px,-2px)] group-hover:text-civic motion-reduce:transition-none" />
              </span>
              {years && <span aria-hidden="true" className={`text-[12.5px] font-semibold tracking-[.01em] text-civic-muted ${lead ? "mt-auto pt-6" : "mt-3.5"}`}><strong className={`mr-0.5 font-[850] text-civic tabular-nums ${lead ? "text-[64px] tracking-[-2.5px] max-[900px]:text-[48px] max-sm:text-[42px]" : "text-[30px] tracking-[-1px]"}`}>{years}</strong>년 만의 만남</span>}
              <span className={`mt-1.5 leading-[1.45] font-extrabold break-keep text-navy ${lead ? "text-[22px] tracking-[-.5px] max-sm:text-[19px]" : "text-[16.5px] tracking-[-.3px]"}`}>{item.title}</span>
              <span className={`flex items-center justify-between gap-2.5 border-t pt-3.5 text-[12.5px] text-civic-sub ${lead ? "mt-[18px] border-solid border-[#D4E3F2]" : "mt-auto border-dashed border-transparent"}`}>
                <span>{item.source} · {item.date}</span>
                <span className="font-bold text-civic">{item.action}</span>
              </span>
            </a>
          </li>;
        })}
      </ul>
      <div className={`${rise} mt-[22px] flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[18px] bg-navy px-[26px] py-[22px] text-white max-sm:p-[18px]`} style={{ "--d": ".4s" } as CSSProperties}>
        <div>
          <p className={NEWS_CTA_TITLE}>누군가의 기다림이 끝나는 날까지.</p>
          <p className="mt-1 text-[13.5px] leading-[1.6] break-keep text-white/78">기억나는 얼굴이 있다면, 작은 단서도 다시 만남의 시작이 될 수 있어요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className={`${CTA_PRIMARY} ${FOCUS}`}>실종아동 찾아보기 <ChevronRightIcon size={16} /></Link>
          <Link href="/help" className={`${CTA_GHOST} ${FOCUS}`}>제보·상담 안내</Link>
        </div>
      </div>
    </section>
  );
}

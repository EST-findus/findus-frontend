import Link from "next/link";
import styles from "./ReunionStory.module.css";
import { ArrowUpRightIcon, ChevronRightIcon, HeartIcon } from "./Icons";
import { NEWS_PAGE_HREF, NEWS_SUMMARY_COUNT, REUNION_NEWS } from "@/lib/reunionStories";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 마이페이지용 요약. 전체 목록은 정보 마당의 뉴스 탭에서 본다. */
export default function ReunionStory() {
  return (
    <aside data-reunion-panel aria-labelledby="reunion-story-title" className="mt-4 rounded-2xl border border-line bg-[#f7faf8] max-md:mt-3">
      <section aria-label="다시 만난 가족" className="min-w-0 px-4 pt-3.5 pb-0.5 max-sm:px-2.5 max-sm:pt-2 max-sm:pb-0">
        <div className="mb-1 flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5 max-sm:gap-0.5">
            <span className="shrink-0 rounded-md border border-brand/10 bg-brand-soft px-1.5 py-0.5 text-[11px] leading-4 font-semibold text-brand max-sm:px-1 max-sm:text-[9px]">뉴스</span>
            <h3 className="min-w-0 truncate text-[15px] font-bold text-brand max-sm:text-[14px]">다시 만난 가족</h3>
          </div>
          <Link href={NEWS_PAGE_HREF} aria-label="다시 만난 가족 뉴스 자세히 보기" className={`inline-flex shrink-0 items-center gap-0.5 rounded px-1 text-[13px] text-muted hover:text-brand max-sm:text-[12px] ${FOCUS}`}>
            자세히 보기<ChevronRightIcon size={12} />
          </Link>
        </div>
        <ul>
          {REUNION_NEWS.slice(0, NEWS_SUMMARY_COUNT).map((item) => <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" title={`${item.title} · ${item.source} · ${item.date}`}
              aria-label={`${item.kind}, ${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`}
              className={`${styles.link} flex min-w-0 items-center gap-1.5 rounded py-0.5 text-[14px] leading-5 max-sm:py-0.5 max-sm:text-[13px] ${FOCUS}`}>
              <ArrowUpRightIcon size={15} className={`${styles.arrow} shrink-0 text-brand/70`} />
              <span className={`${styles.title} truncate`}>{item.title}</span>
              <span className="ml-auto shrink-0 pl-2 text-[12px] text-muted max-sm:hidden">{item.source} · {item.date}</span>
            </a>
          </li>)}
        </ul>
      </section>
      <h2 id="reunion-story-title" className="flex items-center justify-end gap-2 text-right px-4 pt-1 pb-2 text-[14px] font-semibold text-gold-ink max-sm:px-3 max-sm:pt-1 max-sm:text-[13px]"><HeartIcon size={16} className="shrink-0 text-gold" />다시 만날 날을 바라며, 희망을 함께 이어가요.</h2>
    </aside>
  );
}

/** 정보 마당 뉴스 탭의 전체 목록 */
export function ReunionNewsList() {
  return (
    <section aria-labelledby="reunion-news-title" className="page-container max-w-5xl pt-8 max-sm:pt-6">
      <h2 id="reunion-news-title" className="text-[20px] font-extrabold tracking-tight max-sm:text-[18px]">다시 만난 가족들의 이야기</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted max-sm:text-[13px]">오랜 기다림 끝에 가족을 다시 만난 소식입니다. 제목을 누르면 기사·영상 원문이 새 창에서 열립니다.</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {REUNION_NEWS.map((item) => <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`}
            className={`${styles.link} flex items-center justify-between gap-3 rounded-lg px-2 py-4 ${FOCUS}`}>
            <span className="min-w-0">
              <span className="block text-[12px] text-muted">{item.kind} · {item.source} · {item.date}</span>
              <span className={`${styles.title} mt-1 block text-[16px] font-bold max-sm:text-[15px]`}>{item.title}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand">
              <span className="max-sm:hidden">{item.action}</span>
              <ArrowUpRightIcon size={17} className={styles.arrow} />
            </span>
          </a>
        </li>)}
      </ul>
    </section>
  );
}

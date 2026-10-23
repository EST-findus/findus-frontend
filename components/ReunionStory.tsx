import Link from "next/link";
import type { CSSProperties } from "react";
import info from "./InfoPages.module.css";
import styles from "./ReunionStory.module.css";
import { ArrowUpRightIcon, ChevronRightIcon, HeartIcon } from "./Icons";
import { NEWS_PAGE_HREF, NEWS_SUMMARY_COUNT, REUNION_NEWS } from "@/lib/reunionStories";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 마이페이지용 요약. 전체 목록은 정보 마당의 뉴스 탭에서 본다. 최근 소식 세 개를 작은 카드로 보여준다. */
export default function ReunionStory() {
  return (
    <aside data-reunion-summary aria-labelledby="reunion-story-title" className={styles.summary}>
      <div className={styles.summaryHead}>
        <div className={styles.summaryTitle}>
          <span className={styles.summaryBadge}>뉴스</span>
          <h3>다시 만난 가족</h3>
        </div>
        <Link href={NEWS_PAGE_HREF} aria-label="다시 만난 가족 뉴스 자세히 보기" className={`${styles.summaryMore} ${FOCUS}`}>
          자세히 보기<ChevronRightIcon size={14} />
        </Link>
      </div>
      <ul className={styles.summaryList}>
        {REUNION_NEWS.slice(0, NEWS_SUMMARY_COUNT).map((item) => <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer" title={`${item.title} · ${item.source} · ${item.date}`}
            aria-label={`${item.kind}, ${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`}
            className={`${styles.summaryCard} ${FOCUS}`}>
            <span className={styles.summaryMeta}>{item.source} · {item.date}</span>
            <span className={styles.summaryCardTitle}>{item.title}</span>
            <span className={styles.summaryAction}>{item.action}<ArrowUpRightIcon size={14} /></span>
          </a>
        </li>)}
      </ul>
      <h2 id="reunion-story-title" className={styles.summaryFoot}><HeartIcon size={15} />다시 만날 날을 바라며, 희망을 함께 이어가요.</h2>
    </aside>
  );
}

/** 제목 속 "52년 만에"처럼 헤어져 있던 햇수. 카드에 크게 보여준다. */
const yearsApart = (title: string) => title.match(/(\d+)년/)?.[1] ?? null;

/** 정보 마당 뉴스 탭의 전체 목록. 첫 소식은 크게, 나머지는 작은 카드로 두고, 마지막에 찾기·안내로 잇는다. */
export function ReunionNewsList() {
  return (
    <section aria-labelledby="reunion-news-title" className="page-container max-w-5xl pt-7 max-sm:pt-5">
      <div className={`${info.rise} ${info.newsHead}`}>
        <div>
          <p className={info.kicker}>REUNION NEWS</p>
          <h2 id="reunion-news-title" className={info.sectionTitle}>다시 만난 가족들의 이야기</h2>
          <p className={info.sectionText}>오랜 기다림 끝에 가족을 다시 만난 소식입니다. 카드를 누르면 기사·영상 원문이 새 창에서 열립니다.</p>
        </div>
        <p className={info.newsCount}><strong>{REUNION_NEWS.length}</strong>건의 만남</p>
      </div>
      <ul className={info.newsGrid}>
        {REUNION_NEWS.map((item, order) => {
          const years = yearsApart(item.title);
          return <li key={item.href} className={`${info.rise} ${order === 0 ? info.newsLead : ""}`} style={{ "--d": `${0.08 + order * 0.06}s` } as CSSProperties}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`} className={`${info.newsCard} h-full`}>
              <span className={info.newsTop}>
                <span className={info.newsKind}>{item.kind}</span>
                <ArrowUpRightIcon size={18} className={info.newsArrow} />
              </span>
              {years && <span aria-hidden="true" className={info.newsYears}><strong>{years}</strong>년 만의 만남</span>}
              <span className={info.newsTitle}>{item.title}</span>
              <span className={info.newsMeta}>
                <span>{item.source} · {item.date}</span>
                <span className={info.newsAction}>{item.action}</span>
              </span>
            </a>
          </li>;
        })}
      </ul>
      <div className={`${info.rise} ${info.newsCta}`} style={{ "--d": ".4s" } as CSSProperties}>
        <div>
          <p className={info.newsCtaTitle}>누군가의 기다림이 끝나는 날까지.</p>
          <p className={info.newsCtaText}>기억나는 얼굴이 있다면, 작은 단서도 다시 만남의 시작이 될 수 있어요.</p>
        </div>
        <div className={info.newsCtaActions}>
          <Link href="/search" className={`${info.ctaPrimary} ${FOCUS}`}>실종아동 찾아보기 <ChevronRightIcon size={16} /></Link>
          <Link href="/help" className={`${info.ctaGhost} ${FOCUS}`}>제보·상담 안내</Link>
        </div>
      </div>
    </section>
  );
}

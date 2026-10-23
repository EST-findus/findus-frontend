"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_TABS,
  filterPosts,
  formatPostDate,
  getPosts,
  paginate,
  type CategoryFilter,
  type Post,
} from "@/lib/community";
import CategoryBadge from "./CategoryBadge";
import styles from "./InfoPages.module.css";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, MessageIcon, PencilIcon, SearchIcon } from "./Icons";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const tabLabel = (c: CategoryFilter) => (c === "all" ? "전체" : CATEGORY_LABELS[c]);

export default function CommunityBoard({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);

  // 서버에서는 목업만 그리고, 브라우저에 저장된 글·댓글은 마운트 후 합친다.
  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  const filtered = useMemo(() => filterPosts(posts, { category, query }), [posts, category, query]);
  const { items, page: current, totalPages } = paginate(filtered, page);
  // 공지를 뺀 글에만 최신 글이 가장 큰 번호를 매긴다.
  const normalCount = filtered.filter((p) => p.category !== "notice").length;
  const normalOffset = filtered.length - normalCount;

  const changeCategory = (c: CategoryFilter) => {
    setCategory(c);
    setPage(1);
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(draft);
    setPage(1);
  };

  return (
    <section aria-labelledby="board-title" className="page-container max-w-5xl pt-5 max-sm:pt-4">
      <div className="min-w-0">
        <h2 id="board-title" className="sr-only">
          게시글 목록
        </h2>

        <div className={`${styles.boardPanel} ${styles.rise}`}>
          <div className={styles.boardSearch}>
            <form role="search" onSubmit={search} className={styles.searchField}>
              <label htmlFor="board-search" className="sr-only">게시글 검색</label>
              <input id="board-search" type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="제목·내용·작성자 검색" />
              <button type="submit" aria-label="검색" className={FOCUS_RING}><SearchIcon size={18} /></button>
            </form>
            <Link href="/community/write" className={`${styles.writeButton} ${FOCUS_RING}`}><PencilIcon size={16} strokeWidth={2} />글쓰기</Link>
          </div>

          <div role="group" aria-label="게시글 분류" className={styles.chips}>
            {CATEGORY_TABS.filter((c) => c !== "notice").map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => changeCategory(c)} className={`${styles.chip} ${FOCUS_RING}`}>
                {tabLabel(c)}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count} aria-live="polite">
          {query ? (
            <>
              <span className={styles.query}>‘{query}’</span> 검색 결과{" "}
            </>
          ) : (
            category === "all" ? "전체 " : `${CATEGORY_LABELS[category]} `
          )}
          <strong>{filtered.length}</strong>건
        </p>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className="text-[16px] font-bold">게시글이 없습니다</p>
            <p className="mt-1.5 text-[14px] break-keep text-muted">
              다른 분류를 고르거나 검색어를 바꿔 보세요.
            </p>
          </div>
        ) : (
          // 분류·검색어·페이지가 바뀌면 목록을 새로 그려 행이 다시 차례로 떠오르게 한다.
          <ul key={`${category}-${query}-${current}`} className={styles.list}>
            <li
              aria-hidden="true"
              className={`grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center py-3 text-center max-md:hidden ${styles.listHead}`}
            >
              <span>번호</span>
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>작성일</span>
              <span>조회</span>
            </li>
            {items.map((post, order) => {
              const index = filtered.indexOf(post);
              const isNotice = post.category === "notice";
              return (
                <li
                  key={post.id}
                  style={{ "--i": order } as CSSProperties}
                  className={`grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center text-[14px] max-md:flex max-md:flex-col max-md:items-start max-md:gap-1.5 max-md:px-4 max-md:py-4 ${styles.row} ${isNotice ? styles.notice : ""}`}
                >
                  <span className="text-center text-muted max-md:hidden">
                    {isNotice ? (
                      <span className="font-bold text-brand">공지</span>
                    ) : (
                      normalCount - (index - normalOffset)
                    )}
                  </span>
                  <span className="text-center max-md:hidden">
                    <CategoryBadge category={post.category} />
                  </span>
                  <Link
                    href={`/community/${post.id}`}
                    className={`group flex min-w-0 items-center gap-2 py-4 pr-4 max-md:w-full max-md:py-0 max-md:pr-0 ${FOCUS_RING}`}
                  >
                    <span className="md:hidden">
                      <CategoryBadge category={post.category} />
                    </span>
                    <span
                      className={`truncate ${styles.rowTitle} ${isNotice ? "font-bold" : "font-semibold"}`}
                    >
                      {post.title}
                    </span>
                    {post.comments.length > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-gold-ink">
                        <MessageIcon size={13} strokeWidth={2} />
                        <span className="sr-only">댓글</span>
                        {post.comments.length}
                      </span>
                    )}
                  </Link>
                  <span className="truncate px-2 text-center text-ink/80 max-md:hidden">{post.author}</span>
                  <span className="text-center text-muted max-md:hidden">{formatPostDate(post.createdAt)}</span>
                  <span className="text-center text-muted max-md:hidden">{post.views.toLocaleString()}</span>
                  <span className="flex flex-wrap gap-x-2 text-[13px] text-muted md:hidden">
                    <span className="text-ink/80">{post.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatPostDate(post.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <EyeIcon size={13} />
                      <span className="sr-only">조회</span>
                      {post.views.toLocaleString()}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <nav aria-label="페이지" className={styles.pager}>
            <PageButton label="이전 페이지" disabled={current === 1} onClick={() => setPage(current - 1)}>
              <ChevronLeftIcon size={16} strokeWidth={2.2} />
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PageButton key={n} label={`${n}페이지`} active={n === current} onClick={() => setPage(n)}>
                {n}
              </PageButton>
            ))}
            <PageButton
              label="다음 페이지"
              disabled={current === totalPages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRightIcon size={16} strokeWidth={2.2} />
            </PageButton>
          </nav>
        )}
      </div>
    </section>
  );
}

function PageButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.pageButton} ${FOCUS_RING}`}
    >
      {children}
    </button>
  );
}

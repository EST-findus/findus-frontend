"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    <section aria-labelledby="board-title" className="page-container relative z-10 -mt-12 max-sm:-mt-10">
      <div className="rounded-3xl bg-card p-8 shadow-panel max-md:p-6 max-sm:p-4">
        <h2 id="board-title" className="sr-only">
          게시글 목록
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="게시판 분류" className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => changeCategory(c)}
                className={`rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${FOCUS_RING} ${
                  category === c ? "bg-brand text-white" : "bg-surface text-ink/75 hover:text-brand"
                }`}
              >
                {tabLabel(c)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 max-sm:w-full">
            <form role="search" onSubmit={search} className="relative max-sm:flex-1">
              <label htmlFor="board-search" className="sr-only">
                게시글 검색
              </label>
              <input
                id="board-search"
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="제목·내용·작성자 검색"
                className="h-11 w-64 rounded-xl border border-line bg-card pr-11 pl-4 text-[14px] placeholder:text-subtle focus:border-brand focus:outline-none max-sm:w-full"
              />
              <button
                type="submit"
                aria-label="검색"
                className={`absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-brand ${FOCUS_RING}`}
              >
                <SearchIcon size={18} />
              </button>
            </form>
            <Link
              href="/community/write"
              className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
            >
              <PencilIcon size={16} strokeWidth={2} /> 글쓰기
            </Link>
          </div>
        </div>

        <p className="mt-6 text-[14px] text-muted" aria-live="polite">
          {query ? (
            <>
              <strong className="text-ink">‘{query}’</strong> 검색 결과{" "}
            </>
          ) : (
            "전체 "
          )}
          <strong className="text-brand">{filtered.length}</strong>건
        </p>

        {items.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-surface px-5 py-16 text-center">
            <p className="text-[16px] font-bold">게시글이 없습니다</p>
            <p className="mt-1.5 text-[14px] break-keep text-muted">
              다른 분류를 고르거나 검색어를 바꿔 보세요.
            </p>
          </div>
        ) : (
          <ul className="mt-3 border-t-2 border-ink">
            <li
              aria-hidden="true"
              className="grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center border-b border-line bg-surface py-3 text-center text-[13px] font-bold text-muted max-md:hidden"
            >
              <span>번호</span>
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>작성일</span>
              <span>조회</span>
            </li>
            {items.map((post) => {
              const index = filtered.indexOf(post);
              const isNotice = post.category === "notice";
              return (
                <li
                  key={post.id}
                  className={`grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center border-b border-line text-[14px] max-md:flex max-md:flex-col max-md:items-start max-md:gap-1.5 max-md:px-1 max-md:py-4 ${
                    isNotice ? "bg-brand-soft/50" : ""
                  }`}
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
                      className={`truncate group-hover:text-brand group-hover:underline ${
                        isNotice ? "font-bold" : "font-semibold"
                      }`}
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
          <nav aria-label="페이지" className="mt-8 flex items-center justify-center gap-1">
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
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[14px] font-bold transition-colors disabled:opacity-35 ${FOCUS_RING} ${
        active ? "bg-brand text-white" : "text-muted hover:bg-surface hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

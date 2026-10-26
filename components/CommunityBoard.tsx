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
import { chip, rise } from "./infoStyles";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, MessageIcon, PencilIcon, SearchIcon } from "./Icons";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const BOARD_PANEL =
  "rounded-[18px] border border-[#E7ECF2] bg-civic-panel p-[18px] shadow-[0_4px_18px_rgba(23,59,112,.035)] max-sm:rounded-2xl max-sm:p-3.5";
const SEARCH_FIELD =
  "relative flex h-12 min-w-0 items-center rounded-xl border border-[#D4E1F0] bg-white pr-1.5 pl-4 [transition:border-color_.2s_ease,box-shadow_.2s_ease] hover:not-focus-within:border-[#B9CDE6] focus-within:border-civic focus-within:shadow-[0_0_0_4px_rgba(57,120,184,.1)]";
const WRITE_BUTTON =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-civic px-5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(57,120,184,.2)] [transition:background-color_.2s_ease,transform_.25s_cubic-bezier(.2,.7,.2,1),box-shadow_.25s_ease] hover:bg-navy hover:[transform:translateY(-1px)] hover:shadow-[0_10px_22px_rgba(57,120,184,.24)] max-sm:px-3.5 max-sm:text-[14px] motion-reduce:transition-none motion-reduce:hover:[transform:none] [&_svg]:[transition:transform_.3s_cubic-bezier(.2,.7,.2,1)] hover:[&_svg]:[transform:rotate(-12deg)] motion-reduce:[&_svg]:transition-none";
// 행에 올리면 왼쪽에 공공 블루 막대가 자라 나온다. 공지는 막대가 늘 보인다.
const ROW =
  "group/row relative border-t border-[#EEF2F7] animate-info-row [transition:background-color_.2s_ease] hover:bg-[#F7FAFE] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-civic before:content-[''] before:[transition:opacity_.2s_ease,transform_.3s_cubic-bezier(.2,.7,.2,1)] hover:before:opacity-100 hover:before:[transform:none] motion-reduce:animate-none! motion-reduce:transition-none motion-reduce:before:transition-none";
const ROW_TITLE =
  "[transition:color_.2s_ease,translate_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/row:text-civic group-hover/row:[translate:3px_0] motion-reduce:transition-none motion-reduce:group-hover/row:[translate:none]";
const PAGE_BUTTON =
  "grid h-[38px] min-w-[38px] cursor-pointer place-items-center rounded-full border border-[#DCE6F1] bg-white px-2 text-[14px] font-bold text-civic-deep [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.2s_ease] [&:hover:not(:disabled):not([aria-current])]:border-civic [&:hover:not(:disabled):not([aria-current])]:text-civic [&:active:not(:disabled)]:[transform:scale(.95)] [&[aria-current]]:border-civic [&[aria-current]]:bg-civic [&[aria-current]]:text-white [&[aria-current]]:shadow-[0_6px_14px_rgb(57_120_184/22%)] disabled:cursor-default disabled:opacity-35 motion-reduce:transition-none";

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

        <div className={`${BOARD_PANEL} ${rise}`}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
            <form role="search" onSubmit={search} className={SEARCH_FIELD}>
              <label htmlFor="board-search" className="sr-only">게시글 검색</label>
              <input id="board-search" type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="제목·내용·작성자 검색" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-navy [outline:0] placeholder:text-civic-faint" />
              <button type="submit" aria-label="검색" className={`grid size-9 cursor-pointer place-items-center rounded-[9px] text-civic-sub [transition:background-color_.2s_ease,color_.2s_ease] hover:bg-civic-soft hover:text-civic ${FOCUS_RING}`}><SearchIcon size={18} /></button>
            </form>
            <Link href="/community/write" className={`${WRITE_BUTTON} ${FOCUS_RING}`}><PencilIcon size={16} strokeWidth={2} />글쓰기</Link>
          </div>

          <div role="group" aria-label="게시글 분류" className="mt-3.5 flex flex-wrap gap-2">
            {CATEGORY_TABS.filter((c) => c !== "notice").map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => changeCategory(c)} className={`${chip} ${FOCUS_RING}`}>
                {tabLabel(c)}
              </button>
            ))}
          </div>
        </div>

        <p className="mx-0.5 mt-5 mb-2.5 flex items-center gap-1.5 text-[13px] text-civic-muted before:size-1.5 before:rounded-full before:bg-coral before:content-['']" aria-live="polite">
          {query ? (
            <>
              <span className="font-bold text-navy">‘{query}’</span> 검색 결과{" "}
            </>
          ) : (
            category === "all" ? "전체 " : `${CATEGORY_LABELS[category]} `
          )}
          <strong className="text-[15px] font-extrabold text-navy">{filtered.length}</strong>건
        </p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4E1F0] bg-civic-panel px-5 py-14 text-center">
            <p className="text-[16px] font-bold">게시글이 없습니다</p>
            <p className="mt-1.5 text-[14px] break-keep text-muted">
              다른 분류를 고르거나 검색어를 바꿔 보세요.
            </p>
          </div>
        ) : (
          // 분류·검색어·페이지가 바뀌면 목록을 새로 그려 행이 다시 차례로 떠오르게 한다.
          <ul key={`${category}-${query}-${current}`} className="overflow-hidden rounded-2xl border border-civic-line bg-white shadow-[0_2px_8px_rgba(23,59,112,.04)]">
            <li
              aria-hidden="true"
              className={`grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center py-3 text-center max-md:hidden border-b border-civic-line bg-[#F7F9FC] text-[12.5px] font-bold tracking-[.02em] text-civic-deep`}
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
                  className={`grid grid-cols-[64px_96px_1fr_120px_104px_72px] items-center text-[14px] max-md:flex max-md:flex-col max-md:items-start max-md:gap-1.5 max-md:px-4 max-md:py-4 ${ROW} ${isNotice ? "bg-[#F4F8FE] before:opacity-100 before:[transform:none]" : "before:opacity-0 before:[transform:scaleY(.4)]"}`}
                >
                  <span className="text-center text-muted max-md:hidden">
                    {isNotice ? (
                      <span className="inline-flex items-center gap-1 font-bold text-brand"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5M9 10.76V6h6v4.76l2 3.24H7z" /><path d="M8 2h8" /></svg>공지</span>
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
                      className={`truncate ${ROW_TITLE} ${isNotice ? "font-bold text-navy" : "font-semibold"}`}
                    >
                      {post.title}
                    </span>
                    {post.comments.length > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#EAF2F9] px-1.5 py-px text-[12px] font-bold text-[#3978B8]">
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
          <nav aria-label="페이지" className="mt-6 flex items-center justify-center gap-1.5">
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
      className={`${PAGE_BUTTON} ${FOCUS_RING}`}
    >
      {children}
    </button>
  );
}

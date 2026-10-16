"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";
import { formatPostDate, getPosts, type Post } from "@/lib/community";
import type { MissingPerson } from "@/lib/types";
import AccountButton from "./AccountButton";
import styles from "./MyPage.module.css";
import FavoriteChildren from "./FavoriteChildren";
import ReunionStory from "./ReunionStory";
import { ArrowRightIcon, MessageIcon } from "./Icons";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";
const PAGE_TABS = [
  { key: "favorites", label: "관심 아동" },
  { key: "activity", label: "내 활동" },
] as const;
type PageTab = (typeof PAGE_TABS)[number]["key"];

export default function MyPage({ continuation, persons }: { continuation: string | null; persons: MissingPerson[] }) {
  const user = useCurrentUser();
  const ready = useAuthReady();
  const router = useRouter();
  const [activity, setActivity] = useState<{ userId: string; posts: Post[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const userId = user?.id;
  const [pageTab, setPageTab] = useState<PageTab>("favorites");
  const tabId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTab = (event: React.KeyboardEvent, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % PAGE_TABS.length;
    else if (event.key === "ArrowLeft") next = (index + PAGE_TABS.length - 1) % PAGE_TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = PAGE_TABS.length - 1;
    else return;
    event.preventDefault();
    setPageTab(PAGE_TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = () => {
      getPosts().then((posts) => {
        if (active) { setActivity({ userId, posts }); setFailed(false); }
      }).catch(() => { if (active) setFailed(true); });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [userId]);

  if (!ready || !user) {
    return <p role="status" className="page-container py-24 text-center text-muted">첫 화면을 준비하고 있어요.</p>;
  }

  const loaded = activity?.userId === user.id;
  const posts = loaded ? activity.posts : [];
  const myPosts = posts.filter((post) => post.authorId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myComments = posts.flatMap((post) => post.comments.filter((comment) => comment.authorId === user.id).map((comment) => ({ ...comment, postId: post.id, postTitle: post.title }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = tab === "posts" ? myPosts.length : myComments.length;

  return (
    <>
      <h1 className="sr-only">마이페이지</h1>
      <div className={`${styles.layout} page-container max-w-5xl pt-6 pb-5 max-md:pt-12 max-md:pb-3 max-sm:pt-9 max-sm:pb-1`}>
        {continuation && (
          <aside className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold-soft p-6">
            <div><p className="font-bold">로그인 전에 보던 화면이 있어요.</p><p className="mt-1 text-[14px] text-muted">마이페이지에서 확인한 뒤 하던 일을 이어갈 수 있어요.</p></div>
            <Link href={continuation} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-gold-ink hover:bg-gold/10 ${FOCUS}`}>이어서 진행하기 <ArrowRightIcon size={18} /></Link>
          </aside>
        )}

        <div data-mypage-toolbar className="mb-4 flex items-center justify-between gap-3 max-md:mb-2">
        <div role="tablist" aria-label="마이페이지 메뉴" className="inline-flex gap-0.5 rounded-xl border border-line bg-surface p-0.5">
          {PAGE_TABS.map(({ key, label }, index) => (
            <button
              key={key} ref={(el) => { tabRefs.current[index] = el; }} type="button" role="tab"
              id={`${tabId}-tab-${key}`} aria-controls={`${tabId}-panel-${key}`}
              aria-selected={pageTab === key} tabIndex={pageTab === key ? 0 : -1}
              onClick={() => setPageTab(key)} onKeyDown={(event) => moveTab(event, index)}
              className={`min-w-21 rounded-lg px-3 py-1.5 text-[13px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-sm:min-w-19 max-sm:px-2.5 max-sm:text-[12px] ${pageTab === key ? "bg-brand text-white shadow-sm" : "text-muted hover:bg-brand-soft hover:text-brand"}`}
            >{label}</button>
          ))}
        </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <AccountButton />
          </div>
        </div>

        <div role="tabpanel" id={`${tabId}-panel-favorites`} aria-labelledby={`${tabId}-tab-favorites`} hidden={pageTab !== "favorites"} tabIndex={0} className={`rounded-lg ${FOCUS}`}>
          <FavoriteChildren key={user.id} userId={user.id} persons={persons} />
          <ReunionStory />
        </div>

        <div role="tabpanel" id={`${tabId}-panel-activity`} aria-labelledby={`${tabId}-tab-activity`} hidden={pageTab !== "activity"} tabIndex={0} className={`rounded-lg ${FOCUS}`}>
          <section aria-labelledby="mypage-activity" className="min-w-0 rounded-3xl border border-line bg-card p-8 max-sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="mypage-activity" className="flex items-center gap-2 text-[23px] font-extrabold"><MessageIcon className="text-brand" />내 정보 마당 활동</h2>
              <Link href="/community/write" className={`rounded-lg px-3 py-2 text-[14px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>글쓰기</Link>
            </div>
            <div role="group" aria-label="내 활동 분류" className="mt-6 flex gap-2 border-b border-line pb-4">
              {(["posts", "comments"] as const).map((key) => <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-[14px] font-bold ${FOCUS} ${tab === key ? "bg-brand text-white" : "bg-surface text-muted hover:bg-brand-soft"}`}>{key === "posts" ? "내가 쓴 글" : "내가 쓴 댓글"} <span className="ml-1">{loaded ? (key === "posts" ? myPosts.length : myComments.length) : "—"}</span></button>)}
            </div>
            <div aria-live="polite">
              {failed ? <p role="alert" className="py-10 text-center text-muted">활동을 불러오지 못했어요. 새로고침 후 다시 확인해 주세요.</p> : !loaded ? <p role="status" className="py-10 text-center text-muted">내 활동을 불러오고 있어요.</p> : count === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-bold">아직 작성한 {tab === "posts" ? "글이" : "댓글이"} 없어요.</p>
                  <p className="mt-2 text-[14px] text-muted">나누고 싶은 정보나 응원의 마음을 남겨 보세요.</p>
                  <Link href="/community" className={`mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>정보 마당 둘러보기 <ArrowRightIcon size={16} /></Link>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-[12px] text-muted">최근 활동 {Math.min(count, 5)}개를 보여드려요.</p>
                  <ul className="mt-2 divide-y divide-line">
                    {tab === "posts" ? myPosts.slice(0, 5).map((post) => <li key={post.id}><Link href={`/community/${post.id}`} className={`block rounded-lg py-4 hover:text-brand ${FOCUS}`}><p className="truncate font-bold">{post.title}</p><p className="mt-2 text-[12px] text-muted">{formatPostDate(post.createdAt)} · 댓글 {post.comments.length}개</p></Link></li>) : myComments.slice(0, 5).map((comment) => <li key={comment.id}><Link href={`/community/${comment.postId}`} className={`block rounded-lg py-4 hover:text-brand ${FOCUS}`}><p className="line-clamp-2 text-[14px] leading-relaxed">{comment.content}</p><p className="mt-2 truncate text-[12px] text-muted">{comment.postTitle} · {formatPostDate(comment.createdAt)}</p></Link></li>)}
                  </ul>
                </>
              )}
            </div>
          </section>

        </div>

      </div>
    </>
  );
}

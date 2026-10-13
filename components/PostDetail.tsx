"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addComment,
  formatPostDateTime,
  getPost,
  LIMITS,
  validateComment,
  type Comment,
  type Post,
} from "@/lib/community";
import { useCurrentUser } from "@/lib/useCurrentUser";
import CategoryBadge from "./CategoryBadge";
import { ChevronLeftIcon, EyeIcon, MessageIcon } from "./Icons";
import LoginRequired from "./LoginRequired";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const FIELD =
  "w-full rounded-xl border border-line bg-card px-4 text-[15px] placeholder:text-subtle focus:border-brand focus:outline-none";

/**
 * initialPost: 서버에서 찾은 목업 글. 브라우저에만 저장된 글이면 undefined로 오고,
 * 마운트 후 저장소를 읽어 채운다 (null이면 없는 글).
 */
export default function PostDetail({ id, initialPost }: { id: string; initialPost?: Post }) {
  const [post, setPost] = useState<Post | null | undefined>(initialPost);

  useEffect(() => {
    getPost(id).then(setPost);
  }, [id]);

  if (post === undefined) {
    return <p className="py-24 text-center text-[15px] text-muted">글을 불러오는 중이에요…</p>;
  }

  if (post === null) {
    return (
      <div className="py-24 text-center">
        <p className="text-[18px] font-bold">글을 찾을 수 없어요</p>
        <p className="mt-2 text-[14px] text-muted">삭제되었거나 주소가 잘못되었을 수 있어요.</p>
        <BackLink className="mt-6" />
      </div>
    );
  }

  return (
    <>
      <article className="rounded-3xl border border-line bg-card p-10 shadow-panel max-md:p-6 max-sm:p-5">
        <header className="border-b border-line pb-6">
          <CategoryBadge category={post.category} />
          <h1 className="mt-3 text-[28px] leading-[1.4] font-extrabold tracking-[-0.02em] break-keep max-sm:text-[22px]">
            {post.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span className="font-bold text-ink/85">{post.author}</span>
            <time dateTime={post.createdAt}>{formatPostDateTime(post.createdAt)}</time>
            <span className="inline-flex items-center gap-1">
              <EyeIcon size={15} /> 조회 {post.views.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageIcon size={15} /> 댓글 {post.comments.length}
            </span>
          </p>
        </header>
        <div className="min-h-40 py-8 text-[16px] leading-[1.85] break-keep whitespace-pre-line">
          {post.content}
        </div>
      </article>

      <CommentSection post={post} onAdded={setPost} />

      <div className="mt-8 flex justify-center">
        <BackLink />
      </div>
    </>
  );
}

function CommentSection({ post, onAdded }: { post: Post; onAdded: (post: Post) => void }) {
  const user = useCurrentUser();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const input = { content, author: user.nickname, authorId: user.id };
    const invalid = validateComment(input);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    try {
      const comment = await addComment(post.id, input);
      onAdded({ ...post, comments: [...post.comments, comment] });
      setContent("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 등록하지 못했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section aria-labelledby="comments-title" className="mt-6 rounded-3xl border border-line bg-card p-10 shadow-panel max-md:p-6 max-sm:p-5">
      <h2 id="comments-title" className="text-[18px] font-extrabold">
        댓글 <span className="text-brand">{post.comments.length}</span>
      </h2>

      {post.comments.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-surface px-5 py-8 text-center text-[14px] text-muted">
          첫 댓글로 따뜻한 마음을 전해 주세요.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {post.comments.map((c) => (
            <li key={c.id} className="py-5">
              <p className="flex flex-wrap items-center gap-x-2 text-[14px]">
                <span className="font-bold">{c.author}</span>
                {isPostAuthor(post, c) && (
                  <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand">작성자</span>
                )}
                <time dateTime={c.createdAt} className="text-[13px] text-subtle">
                  {formatPostDateTime(c.createdAt)}
                </time>
              </p>
              <p className="mt-2 text-[15px] leading-[1.7] break-keep whitespace-pre-line text-ink/90">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {!user ? (
        <LoginRequired message="댓글을 남기려면 로그인이 필요해요." className="mt-6" />
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 rounded-2xl bg-surface p-5 max-sm:p-4">
          <div className="flex flex-col gap-3">
            <label htmlFor="comment-content" className="text-[14px] font-bold">
              {user.nickname}
              <span className="sr-only"> 님으로 댓글 쓰기</span>
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={LIMITS.comment.max}
              rows={3}
              placeholder="연락처 등 개인정보는 적지 말아 주세요."
              aria-describedby={error ? "comment-error" : undefined}
              className={`${FIELD} resize-y py-3 leading-relaxed`}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p id="comment-error" role="alert" className="text-[13px] font-semibold text-red">
              {error}
            </p>
            <span className="ml-auto text-[12px] text-subtle">
              {content.length}/{LIMITS.comment.max}
            </span>
            <button
              type="submit"
              disabled={pending}
              className={`h-10 shrink-0 rounded-lg bg-brand px-5 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60 ${FOCUS_RING}`}
            >
              댓글 등록
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/** 회원 글이면 id로, 목업 글이면 이름으로 글쓴이를 알아본다. */
function isPostAuthor(post: Post, comment: Comment) {
  return post.authorId ? comment.authorId === post.authorId : comment.author === post.author;
}

function BackLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/community"
      className={`inline-flex h-11 items-center gap-1 rounded-xl border border-line bg-card px-5 text-[14px] font-bold transition-colors hover:border-brand hover:text-brand ${FOCUS_RING} ${className}`}
    >
      <ChevronLeftIcon size={16} strokeWidth={2.2} /> 목록으로
    </Link>
  );
}

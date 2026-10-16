"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CATEGORY_LABELS,
  createPost,
  LIMITS,
  validatePost,
  WRITABLE_CATEGORIES,
  type PostCategory,
} from "@/lib/community";
import type { User } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";
import LoginRequired from "./LoginRequired";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const FIELD =
  "w-full rounded-xl border border-line bg-card px-4 text-[15px] placeholder:text-subtle focus:border-brand focus:outline-none";
const LABEL = "text-[14px] font-bold";

export default function PostForm() {
  const user = useCurrentUser();

  if (!user) {
    return (
      <div className="rounded-3xl bg-card p-10 shadow-panel max-md:p-6 max-sm:p-5">
        <LoginRequired message="정보 마당에 글을 쓰려면 로그인이 필요해요." />
      </div>
    );
  }
  return <PostFormFields user={user} />;
}

function PostFormFields({ user }: { user: User }) {
  const router = useRouter();
  const [category, setCategory] = useState<PostCategory>("info");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { category, title, content, author: user.nickname, authorId: user.id };
    const invalid = validatePost(input);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    try {
      const post = await createPost(input);
      router.push(`/community/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "글을 등록하지 못했어요.");
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-6 rounded-3xl bg-card p-10 shadow-panel max-md:p-6 max-sm:p-5"
    >
      <fieldset>
        <legend className={LABEL}>분류</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {WRITABLE_CATEGORIES.map((c) => (
            <label
              key={c}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${
                category === c
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-card text-ink/75 hover:border-brand hover:text-brand"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={c}
                checked={category === c}
                onChange={() => setCategory(c)}
                className="sr-only"
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div>
          <label htmlFor="post-title" className={LABEL}>
            제목
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={LIMITS.title.max}
            placeholder="제목을 입력해 주세요"
            className={`${FIELD} mt-2.5 h-12`}
          />
        </div>
        <div>
          <p className={LABEL}>작성자</p>
          <p className="mt-2.5 flex h-12 items-center rounded-xl bg-surface px-4 text-[15px] font-semibold">
            {user.nickname}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="post-content" className={LABEL}>
            내용
          </label>
          <span className="text-[12px] text-subtle">
            {content.length}/{LIMITS.content.max}
          </span>
        </div>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={LIMITS.content.max}
          rows={12}
          placeholder="나누고 싶은 정보나 이야기를 적어 주세요."
          className={`${FIELD} mt-2.5 resize-y py-3.5 leading-[1.75]`}
        />
      </div>

      <p className="rounded-xl bg-gold-soft px-4 py-3 text-[13px] leading-relaxed break-keep text-gold-ink">
        실종아동·가족의 연락처, 주소 같은 개인정보는 올리지 말아 주세요. 목격 제보는 정보 마당가 아닌{" "}
        <strong>112</strong> 또는 <strong>182</strong>로 바로 알려 주세요.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p role="alert" className="mr-auto text-[14px] font-semibold text-red">
          {error}
        </p>
        <Link
          href="/community"
          className={`inline-flex h-12 items-center rounded-xl border border-line bg-card px-6 text-[15px] font-bold transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className={`h-12 rounded-xl bg-brand px-7 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60 ${FOCUS_RING}`}
        >
          {pending ? "등록 중…" : "등록하기"}
        </button>
      </div>
    </form>
  );
}

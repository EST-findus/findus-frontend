"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockIcon } from "./Icons";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 로그인이 필요한 기능 자리에 대신 보여주는 안내. 로그인 후 지금 화면으로 돌아온다. */
export default function LoginRequired({ message, className = "" }: { message: string; className?: string }) {
  const next = encodeURIComponent(usePathname());

  return (
    <div className={`rounded-2xl bg-surface px-5 py-10 text-center ${className}`}>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-brand shadow-card">
        <LockIcon size={20} />
      </span>
      <p className="mt-4 text-[15px] font-bold break-keep">{message}</p>
      <div className="mt-5 flex justify-center gap-2 text-[14px] font-bold">
        <Link
          href={`/login?next=${next}`}
          className={`inline-flex h-10 items-center rounded-lg bg-brand px-5 text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
        >
          로그인
        </Link>
        <Link
          href={`/signup?next=${next}`}
          className={`inline-flex h-10 items-center rounded-lg border border-line bg-card px-5 transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}

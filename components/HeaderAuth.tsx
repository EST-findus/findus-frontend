"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logOut } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function HeaderAuth() {
  const user = useCurrentUser();
  const pathname = usePathname();

  if (user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-2 text-[14px] font-bold">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[13px] font-extrabold text-brand"
          >
            {user.nickname.slice(0, 1)}
          </span>
          <span className="max-w-24 truncate max-sm:sr-only">{user.nickname}님</span>
        </span>
        <button
          type="button"
          onClick={logOut}
          className={`h-9 rounded-lg px-3 text-[14px] font-bold text-muted transition-colors hover:bg-surface hover:text-brand ${FOCUS_RING}`}
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 로그인·회원가입 화면에서 서로 오갈 때는 원래 돌아갈 주소를 덮어쓰지 않는다.
  const onAuthPage = pathname === "/login" || pathname === "/signup";
  const query = onAuthPage || pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Link
        href={`/login${query}`}
        className={`inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-bold text-ink/80 transition-colors hover:bg-surface hover:text-brand ${FOCUS_RING}`}
      >
        로그인
      </Link>
      <Link
        href={`/signup${query}`}
        className={`inline-flex h-9 items-center rounded-lg bg-brand px-3.5 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark max-sm:hidden ${FOCUS_RING}`}
      >
        회원가입
      </Link>
    </div>
  );
}

"use client";

import { UserIcon } from "./Icons";
import actionStyles from "./HeaderActions.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function HeaderAuth() {
  const user = useCurrentUser();
  const pathname = usePathname();

  if (user) {
    return (
      <Link href="/mypage" aria-label="마이페이지" title="마이페이지" className={`${actionStyles.boxedAction} ${actionStyles.account} ${pathname === "/mypage" ? "max-md:hidden" : ""} ${FOCUS_RING}`}>
        <UserIcon size={20} className="shrink-0" />
      </Link>
    );
  }

  // 로그인·회원가입 화면에서 서로 오갈 때는 원래 돌아갈 주소를 덮어쓰지 않는다.
  const onAuthPage = pathname === "/login" || pathname === "/signup";
  const query = onAuthPage || pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Link
        href={`/login${query}`}
        className={`inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-bold text-ink/80 transition-colors hover:bg-surface hover:text-brand max-sm:px-2 max-sm:text-[13px] ${FOCUS_RING}`}
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

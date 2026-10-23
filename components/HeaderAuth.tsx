"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HeartIcon, MessageIcon, UserIcon } from "./Icons";
import actionStyles from "./HeaderActions.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logOut, type User } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function HeaderAuth() {
  const user = useCurrentUser();
  const pathname = usePathname();

  if (user) return <AccountMenu user={user} hiddenOnMobile={pathname === "/mypage"} />;

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

const LogoutIcon = () => (
  <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

/** 로그인한 회원의 사람 아이콘. 누르면 닉네임과 마이페이지 바로가기, 로그아웃이 담긴 작은 메뉴가 열린다. */
function AccountMenu({ user, hiddenOnMobile }: { user: User; hiddenOnMobile: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const close = () => setOpen(false);
  const signOut = () => {
    logOut();
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={container} className={`relative ${hiddenOnMobile ? "max-md:hidden" : ""}`}>
      <button ref={trigger} type="button" aria-label={`${user.nickname}님 계정 메뉴`} title="계정 메뉴" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}
        className={`${actionStyles.boxedAction} ${actionStyles.account} ${open ? actionStyles.accountOpen : ""} ${FOCUS_RING}`}>
        <UserIcon size={20} className="shrink-0" />
      </button>
      {open && (
        <div id={menuId} className={actionStyles.menu}>
          <div className={actionStyles.menuHead}>
            <span aria-hidden="true" className={actionStyles.menuAvatar}>{user.nickname.slice(0, 1)}</span>
            <span className="min-w-0">
              <strong>{user.nickname}님</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <nav aria-label="계정 메뉴" className={actionStyles.menuLinks}>
            <Link href="/mypage" onClick={close} className={FOCUS_RING}><UserIcon size={17} />마이페이지</Link>
            <Link href="/mypage?tab=activity" onClick={close} className={FOCUS_RING}><MessageIcon size={17} />내 활동</Link>
            <Link href="/mypage?tab=funding" onClick={close} className={FOCUS_RING}><HeartIcon size={17} />내 후원</Link>
          </nav>
          <button type="button" onClick={signOut} className={`${actionStyles.menuLogout} ${FOCUS_RING}`}><LogoutIcon />로그아웃</button>
        </div>
      )}
    </div>
  );
}

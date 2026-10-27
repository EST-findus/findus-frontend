"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { HeartIcon, HelpCircleIcon, HomeIcon, LayersIcon, UserIcon } from "./Icons";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const entries = [
    { href: "/search", label: "아동찾기", Icon: HomeIcon, active: pathname === "/" || pathname.startsWith("/search") || pathname.startsWith("/missing/") },
    { href: "/community", label: "정보마당", Icon: LayersIcon, active: pathname.startsWith("/community") },
    { href: "/help", label: "이용안내", Icon: HelpCircleIcon, active: pathname.startsWith("/help") },
    { href: "/funding", label: "후원하기", Icon: HeartIcon, active: pathname.startsWith("/funding") },
    { href: user ? "/mypage" : "/login?next=%2Fmypage", label: "MY", Icon: UserIcon, active: pathname === "/mypage" },
  ];

  return (
    <>
      <div aria-hidden="true" className="h-[calc(64px+env(safe-area-inset-bottom))] shrink-0 md:hidden" />
      <nav aria-label="하단 주요 메뉴" className="fixed inset-x-0 bottom-0 z-60 grid grid-cols-5 border-t border-line bg-white px-1 pt-1 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        {entries.map(({ href, label, Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined} aria-label={label === "MY" ? "마이페이지" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-semibold whitespace-nowrap ${active ? "bg-brand-soft/60 text-brand" : "text-muted hover:bg-surface"} ${FOCUS}`}><Icon size={21} /><span>{label}</span></Link>)}
      </nav>
    </>
  );
}

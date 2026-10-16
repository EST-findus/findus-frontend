"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRef, useState } from "react";
import { HomeIcon, LayersIcon, UserIcon } from "./Icons";
import Modal from "./Modal";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const infoActive = ["/community", "/guide", "/ai"].some((path) => pathname.startsWith(path));
  const entries = [
    { href: "/search", label: "실종아동 찾기", Icon: HomeIcon, active: pathname === "/" || pathname.startsWith("/search") || pathname.startsWith("/missing/") },
    { href: "/community", label: "정보 마당", Icon: LayersIcon, active: infoActive },
    { href: user ? "/mypage" : "/login?next=%2Fmypage", label: "마이페이지", Icon: UserIcon, active: pathname === "/mypage" },
  ];

  return (
    <>
      <div aria-hidden="true" className="h-[calc(64px+env(safe-area-inset-bottom))] shrink-0 md:hidden" />
      <nav aria-label="하단 주요 메뉴" className="fixed inset-x-0 bottom-0 z-60 grid grid-cols-4 border-t border-line bg-white px-2 pt-1 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        {entries.map(({ href, label, Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-semibold ${active ? "bg-brand-soft/60 text-brand" : "text-muted hover:bg-surface"} ${FOCUS}`}><Icon size={21} /><span>{label}</span></Link>)}
        <button ref={menuTrigger} type="button" aria-label="전체 메뉴 열기" aria-haspopup="dialog" onClick={() => setMenuOpen(true)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-semibold ${pathname === "/about" ? "text-brand" : "text-muted"} hover:bg-surface ${FOCUS}`}>
          <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg><span>전체 메뉴</span>
        </button>
      </nav>
      {menuOpen && <Modal title="전체 메뉴" onClose={() => setMenuOpen(false)} returnFocusTo={menuTrigger.current}>
        <nav aria-label="전체 메뉴" className="divide-y divide-line">
          {[{ href: "/search", label: "실종아동 찾기" }, { href: "/community", label: "정보 마당" }, { href: "/guide", label: "제보·상담 안내", child: true }, { href: "/ai", label: "AI 연구 안내", child: true }, { href: user ? "/mypage" : "/login?next=%2Fmypage", label: "마이페이지" }, { href: "/about", label: "서비스 소개·정보" }].map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`block rounded-lg py-3 text-[15px] ${item.child ? "pl-6 text-muted" : "px-2 font-bold"} hover:bg-surface ${FOCUS}`}>{item.label}</Link>)}
        </nav>
      </Modal>}
    </>
  );
}

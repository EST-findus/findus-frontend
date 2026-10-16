"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import ServiceInfoModal from "./ServiceInfoModal";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/search", label: "실종아동 찾기", short: "찾기" },
  { href: "/community", label: "정보 마당", short: "정보 마당" },
  { href: "/about", label: "서비스 소개", short: "소개" },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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

  const active = (href: string) => href === "/search"
    ? pathname === "/" || pathname.startsWith("/search") || pathname.startsWith("/missing/")
    : href === "/community" ? ["/community", "/guide", "/ai"].some((path) => pathname.startsWith(path)) : pathname.startsWith(href);

  return (
    <div ref={container} className="relative hidden md:block lg:flex lg:flex-1 max-lg:order-last">
      <nav aria-label="주요 메뉴" className="hidden flex-1 justify-end gap-1 lg:flex">
        {NAV_ITEMS.map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}
          className={`shrink-0 rounded-lg px-3.5 py-2 text-[15px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:max-xl:px-2.5 ${active(item.href) ? "text-brand" : "text-ink/75 hover:bg-surface hover:text-brand"}`}
        >{item.label}</Link>)}
      </nav>
      <button ref={trigger} type="button" aria-label={open ? "전체 메뉴 닫기" : "전체 메뉴 열기"} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      {open && <nav id={menuId} aria-label="전체 메뉴" className="text-right absolute top-full right-0 z-50 mt-3 w-64 max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-card p-2 shadow-panel lg:hidden">
        {NAV_ITEMS.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.href) ? "page" : undefined}
          className={`block rounded-xl px-4 py-3 text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-brand ${active(item.href) ? "bg-brand-soft text-brand" : "text-ink/80 hover:bg-surface"}`}
        >{item.label}</Link>)}
        <button type="button" aria-haspopup="dialog" onClick={() => { setOpen(false); setInfoOpen(true); }} className="mt-1 block w-full rounded-xl border-t border-line px-4 py-3 text-right text-[13px] font-semibold text-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand">서비스 정보</button>
      </nav>}
      {infoOpen && <ServiceInfoModal onClose={() => setInfoOpen(false)} returnFocusTo={trigger.current} />}
    </div>
  );
}

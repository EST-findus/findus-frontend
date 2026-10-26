"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { PhoneIcon } from "./Icons";
import mega from "./MegaMenu.module.css";

export const NAV_ITEMS = [
  { href: "/search", label: "실종아동 찾기", short: "찾기" },
  { href: "/community", label: "정보 마당", short: "정보 마당" },
  { href: "/help", label: "이용 안내", short: "안내" },
  { href: "/funding", label: "후원하기", short: "후원" },
];

// Pages under each top menu, shown together in the desktop mega menu.
const SUB_ITEMS: Record<string, { href: string; label: string }[]> = {
  "/search": [
    { href: "/search?focus=search", label: "실종아동 검색" },
    { href: "/mypage", label: "관심 아동" },
    { href: "/help#know", label: "목격 제보 방법" },
  ],
  "/community": [
    { href: "/community", label: "소식·이야기" },
    { href: "/community?tab=news", label: "다시 만난 이야기" },
    { href: "/community/write", label: "글쓰기" },
  ],
  "/help": [
    { href: "/help", label: "제보·상담 안내" },
    { href: "/help?tab=ai", label: "AI 연구 안내" },
    { href: "/help?tab=info", label: "공식 기관·정보" },
    { href: "/help#faq", label: "자주 묻는 질문" },
  ],
  "/funding": [
    { href: "/funding", label: "진행 중인 펀딩" },
    { href: "/mypage?tab=funding", label: "내 후원 내역" },
  ],
};

// Short delays so a cursor passing over the menu doesn't flash the panel open or shut.
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 160;

export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const megaId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const [megaKey, setMegaKey] = useState<string | null>(null);
  const [panelTop, setPanelTop] = useState(64);
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);

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

  // Close the mega menu on navigation, Escape, or scroll.
  useEffect(() => { setMegaKey(null); }, [pathname]);
  useEffect(() => {
    if (!megaKey) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMegaKey(null); };
    const scroll = () => setMegaKey(null);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { document.removeEventListener("keydown", escape); window.removeEventListener("scroll", scroll); };
  }, [megaKey]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const active = (href: string) => href === "/search"
    ? pathname === "/" || pathname.startsWith("/search") || pathname.startsWith("/missing/")
    : pathname.startsWith(href);

  const place = (key: string) => {
    const header = navRef.current?.closest("header");
    if (header) setPanelTop(header.getBoundingClientRect().bottom);
    const link = navRef.current?.querySelector<HTMLElement>(`[data-key="${key}"]`);
    const nav = navRef.current;
    if (link && nav) setUnderline({ left: link.offsetLeft + 10, width: link.offsetWidth - 20 });
  };
  const show = (key: string, delay = OPEN_DELAY_MS) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { place(key); setMegaKey(key); }, megaKey ? 0 : delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMegaKey(null), CLOSE_DELAY_MS);
  };
  const keep = () => window.clearTimeout(timer.current);
  const leaveFocus = (event: React.FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (navRef.current?.contains(next) || panelRef.current?.contains(next))) return;
    hide();
  };

  return (
    <div ref={container} className="relative hidden md:block lg:flex lg:flex-1 max-lg:order-last">
      <nav ref={navRef} aria-label="주요 메뉴" className="relative hidden flex-1 justify-end gap-1 lg:flex" onMouseLeave={hide} onBlur={leaveFocus}>
        {NAV_ITEMS.map((item) => <Link key={item.href} href={item.href} data-key={item.href} aria-current={active(item.href) ? "page" : undefined}
          aria-expanded={megaKey !== null} aria-controls={megaId}
          onMouseEnter={() => show(item.href)} onFocus={() => show(item.href, 0)}
          className={`${mega.topLink} shrink-0 rounded-lg px-3.5 py-2 text-[15px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:max-xl:px-2.5 ${active(item.href) || megaKey === item.href ? "text-brand" : "text-ink/75 hover:bg-surface hover:text-brand"}`}
        >{item.label}</Link>)}
        {underline && <span aria-hidden="true" className={mega.underline} style={{ left: underline.left, width: underline.width, opacity: megaKey ? 1 : 0 }} />}
      </nav>

      {/* Rendered on <body>: the header's backdrop blur would otherwise become the panel's containing block. */}
      {megaKey && createPortal(
        <div ref={panelRef} id={megaId} className={`${mega.panel} hidden lg:block`} style={{ top: panelTop }} onMouseEnter={keep} onMouseLeave={hide} onBlur={leaveFocus}>
          <div className={`page-container ${mega.inner}`}>
            <div className={mega.band}>
              <div>
                <p className={mega.bandTitle}>기억을 단서로 잇는<br />FindUs</p>
                <p className={mega.bandText}>실종 신고와 목격 제보는 공식 기관으로 바로 이어 주세요.</p>
              </div>
              <a href="tel:182" className={mega.bandCall}>
                <PhoneIcon size={18} strokeWidth={2} />
                <span><small>실종아동 제보·상담</small><strong>경찰청 182</strong></span>
              </a>
            </div>
            {NAV_ITEMS.map((item) => (
              <div key={item.href} className={mega.column} data-active={megaKey === item.href} onMouseEnter={() => { keep(); if (megaKey !== item.href) { place(item.href); setMegaKey(item.href); } }}>
                <Link href={item.href} className={mega.columnTitle} onClick={() => setMegaKey(null)}>{item.label}</Link>
                <ul>
                  {SUB_ITEMS[item.href].map((sub) => (
                    <li key={sub.href}><Link href={sub.href} className={mega.item} onClick={() => setMegaKey(null)}>{sub.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}

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
      </nav>}
    </div>
  );
}

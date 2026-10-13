"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "실종아동 찾기", short: "찾기" },
  { href: "/guide", label: "제보·상담 안내", short: "제보·상담" },
  { href: "/ai", label: "AI 연구 안내", short: "AI 연구" },
  { href: "/community", label: "커뮤니티", short: "커뮤니티" },
  { href: "/about", label: "서비스 소개", short: "소개" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex flex-1 justify-center gap-1 max-lg:order-last max-lg:-mx-2.5 max-lg:basis-full max-lg:justify-between max-lg:overflow-x-auto max-lg:[scrollbar-width:none]"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative shrink-0 rounded-lg px-3.5 py-2 text-[15px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-lg:px-2.5 max-lg:pb-3 max-lg:text-[14.5px] max-sm:px-2 max-sm:text-[14px] lg:max-xl:px-2.5 ${
              active
                ? "text-brand after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand lg:after:hidden"
                : "text-ink/75 hover:bg-surface hover:text-brand"
            }`}
          >
            <span className="max-sm:hidden">{item.label}</span>
            <span className="sm:hidden">{item.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}

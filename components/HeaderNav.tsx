"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "실종아동 찾기" },
  { href: "/guide", label: "제보·상담 안내" },
  { href: "/ai", label: "AI 연구 안내" },
  { href: "/about", label: "서비스 소개" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex flex-1 justify-center gap-1 max-md:order-last max-md:-mx-2 max-md:basis-full max-md:justify-start max-md:overflow-x-auto"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-[14.5px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active ? "text-brand" : "text-ink/80 hover:bg-surface hover:text-brand"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

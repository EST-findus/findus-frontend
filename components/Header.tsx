"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SEARCH_LOGO, SEARCH_PALETTE } from "./searchStyles";
import HeaderAuth from "./HeaderAuth";
import HeaderNav from "./HeaderNav";
import LogoMark from "./LogoMark";
import ReportCallButton from "./ReportCallButton";
import { requestFeaturedPopup } from "./HomeFeaturedPopup";

export function Logo({ blue = false }: { blue?: boolean }) {
  return (
    <span className={`flex items-center gap-2 ${blue ? SEARCH_LOGO : ""}`}>
      <LogoMark size={36} className="shrink-0" />
      <span className="text-[21px] font-extrabold tracking-[-0.4px]">
        <span style={{ color: "#173B70" }}>Find</span>
        <span style={{ color: "#3978B8" }}>Us</span>
      </span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const onMyPage = pathname === "/mypage";
  const onPublicPage = pathname === "/search" || pathname === "/";
  return (
    <header className={`${onPublicPage ? SEARCH_PALETTE : ""} sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur ${onMyPage ? "max-md:hidden" : ""}`}>
      <div className={`page-container flex h-16 items-center gap-5 max-lg:gap-3 max-sm:gap-2 ${onMyPage ? "max-md:h-13" : ""}`}>
        <Link href="/" aria-label="FindUs 홈" onClick={requestFeaturedPopup} className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <Logo blue={onPublicPage} />
        </Link>
        <HeaderNav />
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:order-last lg:ml-0 max-sm:gap-1.5">
          <ReportCallButton />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SAFE182_URL } from "@/lib/links";
import HealthCheckButton from "./HealthCheckButton";
import { SEARCH_PALETTE } from "./searchStyles";
import HeaderAuth from "./HeaderAuth";
import HeaderNav from "./HeaderNav";
import Wordmark from "./Wordmark";
import { ArrowUpRightIcon } from "./Icons";
import ReportCallButton from "./ReportCallButton";
import { requestFeaturedPopup } from "./HomeFeaturedPopup";

// 헤더는 아이콘 없이 글자 로고만 쓴다. 정사각형 심볼(LogoMark)은 파비콘·앱 아이콘 몫.
export function Logo() {
  return <Wordmark className="text-[25px] leading-none max-sm:text-[23px]" />;
}

export default function Header() {
  const pathname = usePathname();
  const onMyPage = pathname === "/mypage";
  const onPublicPage = pathname === "/search" || pathname === "/";
  const hideUtilityBar = onPublicPage || pathname === "/help" || pathname === "/community" || onMyPage || pathname.startsWith("/funding");
  return (
    <header className={`${onPublicPage ? SEARCH_PALETTE : ""} sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur ${onMyPage ? "max-md:hidden" : ""}`}>
      {/* 서버 상태·안전Dream 바로가기 줄은 데스크톱에서만 보인다. */}
      {!hideUtilityBar && <div className="border-b border-line bg-surface max-md:hidden">
        <div className="page-container flex items-center gap-4 py-1.5 text-[12px] text-muted">
          <p className="break-keep max-sm:hidden">오래된 기억도, 다시 단서가 되도록</p>
          <div className="ml-auto flex items-center gap-4">
            <HealthCheckButton />
            <a
              href={SAFE182_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold hover:text-brand"
            >
              안전Dream <ArrowUpRightIcon size={13} strokeWidth={2.2} />
            </a>
          </div>
        </div>
      </div>

}
      <div className={`page-container flex h-16 items-center gap-5 max-lg:gap-3 max-sm:gap-2 ${onMyPage ? "max-md:h-13" : ""}`}>
        <Link href="/" aria-label="FindUs 홈" onClick={requestFeaturedPopup} className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <Logo />
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

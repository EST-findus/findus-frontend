"use client";

import Link from "next/link";
import Image from "next/image";
import LogoMark from "./LogoMark";
import { usePathname } from "next/navigation";
import { MOCK_PHOTO_LABEL } from "@/lib/attribution";
import { MISSING_CHILD_CENTER_URL, SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon, ShieldIcon } from "./Icons";
import searchStyles from "./PublicSearch.module.css";

const LINK_CLASS = "inline-flex items-center gap-0.5 rounded font-semibold text-ink/75 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Footer() {
  const pathname = usePathname();
  const onMyPage = pathname === "/mypage";
  if (pathname === "/search" || pathname === "/") {
    return (
      <footer className={`${searchStyles.palette} ${searchStyles.searchFooter}`}>
        <div className={`page-container ${searchStyles.footerRow}`}>
          <div className={searchStyles.footerBrand}>
            <Link href="/about" aria-label="FindUs 서비스 소개" className={searchStyles.footerLogo}>
              <span className={searchStyles.searchLogo}><LogoMark size={25} /></span><strong>FindUs</strong>
            </Link>
            <p>작은 관심이 한 아이의 내일을 바꿀 수 있습니다.</p>
          </div>
          <div className={searchStyles.footerNotice}>
            <ShieldIcon size={18} />
            <div><strong>공식 신고·상담 안내</strong><p>긴급 신고 <a href="tel:112">112</a> · 실종 상담 <a href="tel:182">182</a><br />현재 목록은 {MOCK_PHOTO_LABEL}입니다.</p></div>
          </div>
          <nav className={searchStyles.footerAgencies} aria-label="공식 기관 바로가기">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" aria-label="경찰청 안전Dream 공식 사이트 (새 창)"><Image src="/images/agencies/safety-dream.gif" alt="경찰청 안전Dream" width={209} height={36} unoptimized className={searchStyles.safetyDreamMark} /></a>
            <a href="https://www.ncrc.or.kr/" target="_blank" rel="noopener noreferrer" aria-label="국가아동권리보장원 공식 사이트 (새 창)"><Image src="/images/agencies/ncrc.png" alt="국가아동권리보장원" width={244} height={24} className={searchStyles.ncrcMark} /></a>
          </nav>
        </div>
        <div className={`page-container ${searchStyles.footerCopyright}`}><span>© 2026 FindUs</span><span>{pathname === "/" ? "FindUs는 정부 공식 운영 사이트가 아닙니다." : "아이들이 안전한 내일을 함께합니다."}</span></div>
      </footer>
    );
  }
  return (
    <footer className={`max-md:hidden border-t border-line bg-surface text-[13px] text-muted max-sm:text-[12px] ${onMyPage ? "mt-1" : "mt-6 max-sm:mt-4"}`}>
      <div className={`page-container ${onMyPage ? "py-2" : "py-5 max-sm:py-4"}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <nav aria-label="공식 기관" className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>안전Dream <ArrowUpRightIcon size={12} /></a>
            <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>실종아동전문기관 <ArrowUpRightIcon size={12} /></a>
          </nav>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="tel:112" className={LINK_CLASS}>긴급 신고 <span className="font-extrabold text-brand">112</span></a>
            <a href="tel:182" className={LINK_CLASS}>실종 상담 <span className="font-extrabold text-brand">182</span></a>
          </div>
        </div>
        <p className={`mt-2 text-[12px] leading-relaxed break-keep max-sm:text-[11px] ${onMyPage ? "sr-only" : ""}`}>현재 목록은 {MOCK_PHOTO_LABEL}입니다. 실종 신고·상담은 경찰청(112·182)을 이용해 주세요.</p>
        <div className={`${onMyPage ? "mt-1" : "mt-2"} flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] max-sm:text-[11px]`}>
          <p>© 2026 FindUs</p>
          {/* TODO: 실제 페이지가 생기면 경로 연결 */}
          <a href="#" className={LINK_CLASS}>개인정보처리방침</a>
        </div>
      </div>
    </footer>
  );
}

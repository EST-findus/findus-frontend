import Link from "next/link";
import Image from "next/image";
import LogoMark from "./LogoMark";
import { SAFE182_URL } from "@/lib/links";
import { ShieldIcon } from "./Icons";
import searchStyles from "./PublicSearch.module.css";

export default function Footer() {
  return (
      <footer className={`${searchStyles.palette} ${searchStyles.searchFooter}`}>
        <div className={`page-container ${searchStyles.footerRow}`}>
          <div className={searchStyles.footerBrand}>
            <Link href="/" aria-label="FindUs 홈" className={searchStyles.footerLogo}>
              <span className={searchStyles.searchLogo}><LogoMark size={30} /></span><strong><span style={{ color: "#173B70" }}>Find</span><span style={{ color: "#3978B8" }}>Us</span></strong>
            </Link>
            <p>작은 관심이 한 아이의 내일을 바꿀 수 있습니다.</p>
          </div>
          <div className={searchStyles.footerNotice}>
            <ShieldIcon size={18} />
            <div><strong>공식 신고·상담 안내</strong><p>긴급 신고 <a href="tel:112">112</a> · 실종 상담 <a href="tel:182">182</a><br />아동 정보 자료 출처: 경찰청.</p></div>
          </div>
          <nav className={searchStyles.footerAgencies} aria-label="공식 기관 바로가기">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" aria-label="경찰청 안전Dream 공식 사이트 (새 창)"><Image src="/images/agencies/safety-dream.gif" alt="경찰청 안전Dream" width={209} height={36} unoptimized className={searchStyles.safetyDreamMark} /></a>
            <a href="https://www.ncrc.or.kr/" target="_blank" rel="noopener noreferrer" aria-label="국가아동권리보장원 공식 사이트 (새 창)"><Image src="/images/agencies/ncrc.png" alt="국가아동권리보장원" width={244} height={24} className={searchStyles.ncrcMark} /></a>
          </nav>
        </div>
        <div className={`page-container ${searchStyles.footerCopyright}`}>
          <span>© 2026 FindUs</span>
          {/* 사진이 공개되는 가족이 정정·비공개를 요청할 길을 늘 바닥에 둔다. */}
          <nav className={searchStyles.footerLinks} aria-label="서비스 정책">
            <Link href="/help">이용 안내</Link>
            <Link href="/help?tab=ai">AI 이용 원칙</Link>
            <Link href="/mypage/verify">정보 정정·비공개 요청</Link>
          </nav>
        </div>
      </footer>
  );
}

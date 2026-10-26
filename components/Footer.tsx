import Link from "next/link";
import Image from "next/image";
import LogoMark from "./LogoMark";
import { SAFE182_URL } from "@/lib/links";
import { ShieldIcon } from "./Icons";
import { SEARCH_LOGO, SEARCH_PALETTE } from "./searchStyles";

const NOTICE_LINK = "font-bold text-[#466a94]";
// 공식 기관 마크는 원래 색과 비율을 그대로 둔다.
const AGENCY_LINK = "flex min-h-8 items-center py-1";

export default function Footer() {
  return (
      <footer className={`${SEARCH_PALETTE} border-t border-[#edf2f8] bg-[linear-gradient(180deg,#fafcff,white)] pt-2.5 pb-1.5 max-[640px]:pt-3 max-[640px]:pb-[84px] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#3978B8]`}>
        <div className="page-container grid grid-cols-[1.25fr_1fr_auto] items-center gap-[18px] max-[1000px]:grid-cols-[1fr_1fr] max-[1000px]:gap-2.5 max-[640px]:grid-cols-[1fr]">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="FindUs 홈" className="inline-flex shrink-0 items-center gap-[7px] text-navy">
              <span className={SEARCH_LOGO}><LogoMark size={30} /></span><strong className="text-[18px] font-extrabold tracking-[-.5px] max-[640px]:text-[17px]"><span style={{ color: "#173B70" }}>Find</span><span style={{ color: "#3978B8" }}>Us</span></strong>
            </Link>
            <p className="max-w-[220px] text-[11px] leading-[1.7] break-keep text-subtle max-[640px]:max-w-none max-[640px]:text-[10px]">작은 관심이 한 아이의 내일을 바꿀 수 있습니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldIcon size={18} className="mt-0.5 shrink-0 text-[#2e6cb1]" />
            <div><strong className="text-[12px] font-[750] text-[#365674]">공식 신고·상담 안내</strong><p className="mt-px text-[10px] leading-[1.5] text-subtle">긴급 신고 <a href="tel:112" className={NOTICE_LINK}>112</a> · 실종 상담 <a href="tel:182" className={NOTICE_LINK}>182</a><br />아동 정보 자료 출처: 경찰청.</p></div>
          </div>
          <nav className="flex items-center gap-5 max-[1000px]:col-span-full max-[1000px]:justify-end max-[640px]:col-auto max-[640px]:flex-wrap max-[640px]:justify-start max-[640px]:gap-x-5 max-[640px]:gap-y-2.5" aria-label="공식 기관 바로가기">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" aria-label="경찰청 안전Dream 공식 사이트 (새 창)" className={AGENCY_LINK}><Image src="/images/agencies/safety-dream.gif" alt="경찰청 안전Dream" width={209} height={36} unoptimized className="h-auto w-[140px] object-contain" /></a>
            <a href="https://www.ncrc.or.kr/" target="_blank" rel="noopener noreferrer" aria-label="국가아동권리보장원 공식 사이트 (새 창)" className={AGENCY_LINK}><Image src="/images/agencies/ncrc.png" alt="국가아동권리보장원" width={244} height={24} className="h-auto w-[175px] object-contain max-[640px]:w-[170px]" /></a>
          </nav>
        </div>
        <div className="page-container mt-1.5 flex justify-between gap-3 border-t border-[#f0f3f8] pt-[5px] text-[10px] text-subtle max-[640px]:text-[9px]"><span>© 2026 FindUs</span><span>기억이 단서가 되어, 다시 만나는 날까지 함께합니다.</span></div>
      </footer>
  );
}

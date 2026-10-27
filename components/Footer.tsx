import Link from "next/link";
import Image from "next/image";
import { SAFE182_URL } from "@/lib/links";
import { ShieldIcon } from "./Icons";
import { SEARCH_PALETTE } from "./searchStyles";
import Wordmark from "./Wordmark";

// 데스크톱은 본문 속 번호, 모바일은 바로 걸 수 있는 버튼 모양.
const CALL_LINK = "[&_b]:font-bold [&_b]:text-[#466a94] max-[640px]:inline-flex max-[640px]:min-h-9 max-[640px]:items-center max-[640px]:gap-1.5 max-[640px]:rounded-full max-[640px]:border max-[640px]:border-[#dbe6f2] max-[640px]:bg-[#f5f9fd] max-[640px]:px-3.5 max-[640px]:text-[13px] max-[640px]:text-[#365674]";
const POLICY_LINK = "font-[650] text-[#466a94] hover:text-navy hover:underline hover:underline-offset-3";
// 공식 기관 마크는 원래 색과 비율을 그대로 둔다.
const AGENCY_LINK = "flex min-h-8 items-center py-1";

export default function Footer() {
  return (
      <footer className={`${SEARCH_PALETTE} border-t border-[#edf2f8] bg-[linear-gradient(180deg,#fafcff,white)] pt-2.5 pb-1.5 max-[640px]:pt-5 max-[640px]:pb-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#3978B8]`}>
        <div className="page-container grid grid-cols-[1.25fr_1fr_auto] items-center gap-[18px] max-[1000px]:grid-cols-[1fr_1fr] max-[1000px]:gap-2.5 max-[640px]:grid-cols-[1fr] max-[640px]:gap-4">
          <div className="flex items-center gap-3 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-1">
            <Link href="/" aria-label="FindUs 홈" className="inline-flex shrink-0 items-center gap-[7px] text-navy">
              <Wordmark className="text-[21px] leading-none max-[640px]:text-[20px]" />
            </Link>
            <p className="text-[12.5px] leading-[1.7] break-keep whitespace-nowrap text-subtle max-[640px]:text-[12px] max-[640px]:whitespace-normal">다시 그린 얼굴로, 잊혀 가는 아이를 한 번 더 기억합니다.</p>
          </div>
          <div className="flex items-start gap-2 max-[640px]:rounded-xl max-[640px]:border max-[640px]:border-[#e6edf6] max-[640px]:bg-white max-[640px]:p-3.5">
            <ShieldIcon size={18} className="mt-0.5 shrink-0 text-[#2e6cb1]" />
            <div><strong className="text-[13px] font-[750] text-[#365674]">공식 신고·상담 안내</strong>
              <p className="mt-px flex flex-wrap items-center gap-x-1 text-[12px] leading-[1.5] text-subtle max-[640px]:mt-2 max-[640px]:gap-2">
                <a href="tel:112" className={CALL_LINK}>긴급 신고 <b>112</b></a>
                <span aria-hidden="true" className="max-[640px]:hidden">·</span>
                <a href="tel:182" className={CALL_LINK}>실종 상담 <b>182</b></a>
                <span className="basis-full max-[640px]:text-[11.5px]">아동 정보 자료 출처: 경찰청.</span>
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-5 max-[1000px]:col-span-full max-[1000px]:justify-end max-[640px]:col-auto max-[640px]:justify-between max-[640px]:gap-4 max-[640px]:px-1" aria-label="공식 기관 바로가기">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" aria-label="경찰청 안전Dream 공식 사이트 (새 창)" className={AGENCY_LINK}><Image src="/images/agencies/safety-dream.gif" alt="경찰청 안전Dream" width={209} height={36} unoptimized className="h-auto w-[140px] object-contain max-[640px]:w-[124px]" /></a>
            <a href="https://www.ncrc.or.kr/" target="_blank" rel="noopener noreferrer" aria-label="국가아동권리보장원 공식 사이트 (새 창)" className={AGENCY_LINK}><Image src="/images/agencies/ncrc.png" alt="국가아동권리보장원" width={244} height={24} unoptimized className="h-auto w-[175px] object-contain max-[640px]:w-[160px]" /></a>
          </nav>
        </div>
        <div className="page-container mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-[#f0f3f8] pt-[5px] text-[11.5px] text-subtle max-[640px]:mt-4 max-[640px]:flex-col-reverse max-[640px]:items-start max-[640px]:gap-y-2 max-[640px]:pt-3.5 max-[640px]:text-[11px]">
          <span>© 2026 FindUs</span>
          {/* 사진이 공개되는 가족이 정정·비공개를 요청할 길을 늘 바닥에 둔다. */}
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="서비스 정책">
            <Link href="/help" className={POLICY_LINK}>이용 안내</Link>
            <Link href="/help?tab=ai" className={POLICY_LINK}>AI 이용 원칙</Link>
            <Link href="/mypage/verify" className={POLICY_LINK}>정보 정정·비공개 요청</Link>
          </nav>
        </div>
      </footer>
  );
}

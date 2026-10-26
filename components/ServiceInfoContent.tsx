import Image from "next/image";
import type { CSSProperties } from "react";
import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon, PhoneIcon, ShieldIcon } from "./Icons";
import { rise } from "./infoStyles";

const AGENCIES = [
  { href: SAFE182_URL, name: "경찰청 안전Dream", text: "공식 실종 정보 확인과 온라인 제보", logo: "/images/agencies/safety-dream.gif", width: 209, height: 36 },
  { href: MISSING_CHILD_CENTER_URL, name: "실종아동전문기관", text: "아동권리보장원 · 가족 찾기와 실종 가족 지원", logo: "/images/agencies/ncrc.png", width: 244, height: 24 },
];

// 긴급 신고는 코랄, 실종아동 제보·상담은 공공 블루, 전문기관은 라이트 블루로 구분한다.
const CALL_TONE: Record<string, string> = { "112": "urgent", "182": "primary", "027770182": "soft" };

// 위에 톤 색 띠가 있는 전화 카드. 900px 아래에서는 아이콘·번호·'전화 걸기'를 한 줄로 놓고, 휴대폰에서는 다시 쌓는다.
const CALL_CARD = [
  "group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-civic-line bg-white px-5 pt-[18px] pb-4 shadow-[0_2px_8px_rgba(23,59,112,.04)]",
  "[--tone-soft:#EAF2F9] [--tone:#3978B8] data-[tone=soft]:[--tone-soft:#F1F6FB] data-[tone=soft]:[--tone:#5B8FC6] data-[tone=urgent]:[--tone-soft:#FEF4F3] data-[tone=urgent]:[--tone:#D4675E]",
  "before:absolute before:inset-[0_0_auto] before:h-[3px] before:bg-(--tone) before:content-['']",
  "[transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,border-color_.25s_ease] hover:[transform:translateY(-4px)] hover:border-(--tone) hover:shadow-[0_18px_36px_rgba(23,59,112,.1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-civic",
  "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
  "sm:max-[900px]:grid sm:max-[900px]:grid-cols-[auto_minmax(0,1fr)_auto] sm:max-[900px]:items-center sm:max-[900px]:gap-x-4 sm:max-[900px]:gap-y-1 sm:max-[900px]:px-[18px] sm:max-[900px]:py-4",
  "max-sm:items-start max-sm:gap-0 max-sm:px-4 max-sm:pt-4 max-sm:pb-3.5",
].join(" ");
const CALL_TOP =
  "flex items-center gap-2 max-[900px]:gap-1.5 sm:max-[900px]:[grid-column:1] sm:max-[900px]:[grid-row:1/span_2] sm:max-[900px]:min-w-24 sm:max-[900px]:flex-col sm:max-[900px]:items-start";
const CALL_NUMBER =
  "mt-3 text-[32px] leading-[1.1] font-[850] tracking-[-1px] text-navy tabular-nums group-data-[tone=urgent]:text-coral-ink max-[900px]:text-[26px] sm:max-[900px]:mt-0 sm:max-[900px]:[grid-column:2] max-sm:mt-2.5";
const CALL_TEXT =
  "mt-2 text-[13px] leading-[1.6] break-keep text-civic-muted sm:max-[900px]:mt-0 sm:max-[900px]:[grid-column:2] max-sm:mt-1.5";
const CALL_GO =
  "mt-auto inline-flex items-center gap-1 pt-3.5 text-[13px] font-bold text-(--tone) sm:max-[900px]:m-0 sm:max-[900px]:p-0 sm:max-[900px]:[grid-column:3] sm:max-[900px]:[grid-row:1/span_2] max-sm:pt-2.5";

const AGENCY =
  "group flex items-center gap-3.5 rounded-[14px] border border-civic-line bg-white px-[18px] py-4 [transition:transform_.3s_cubic-bezier(.2,.7,.2,1),border-color_.25s_ease,box-shadow_.3s_ease] hover:[transform:translateY(-2px)] hover:border-civic-hover hover:shadow-[0_12px_26px_rgba(23,59,112,.08)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-civic motion-reduce:transition-none motion-reduce:hover:[transform:none]";

/** 공식 전화번호 세 개. 이용 안내의 공식 기관·정보 탭 맨 위에 크게 보여준다. */
export function OfficialCalls() {
  return (
    <ul className="mt-[18px] grid grid-cols-3 gap-3 max-[900px]:grid-cols-1" aria-label="공식 신고·상담 전화">
      {OFFICIAL_CALLS.map((call, index) => (
        <li key={call.tel} className={rise} style={{ "--d": `${0.08 + index * 0.06}s` } as CSSProperties}>
          <a href={`tel:${call.tel}`} className={CALL_CARD} data-tone={CALL_TONE[call.tel]}>
            <span className={CALL_TOP}>
              <span aria-hidden="true" className="grid size-8 place-items-center rounded-[10px] bg-(--tone-soft) text-(--tone)"><PhoneIcon size={18} strokeWidth={2} /></span>
              <span className="text-[13px] font-bold text-civic-deep">{call.label}</span>
            </span>
            <strong className={CALL_NUMBER}>{call.number}</strong>
            <span className={CALL_TEXT}>{call.description}</span>
            <span className={CALL_GO}>전화 걸기 <span aria-hidden="true" className="[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover:[transform:translateX(3px)] motion-reduce:transition-none">→</span></span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ServiceInfoContent() {
  return (
    <>
      <nav aria-label="공식 기관" className="mt-3 grid gap-2.5">
        {AGENCIES.map((agency) => (
          <a key={agency.href} href={agency.href} target="_blank" rel="noopener noreferrer" className={AGENCY}>
            <span className="flex h-[34px] w-32 flex-none items-center max-sm:w-24"><Image src={agency.logo} alt="" width={agency.width} height={agency.height} unoptimized className="h-auto max-h-[26px] w-auto max-w-full" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-[14.5px] font-extrabold text-navy">{agency.name}</strong><span className="mt-0.5 block text-[12.5px] text-civic-sub">{agency.text}</span></span>
            <ArrowUpRightIcon size={17} className="flex-none text-civic [transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover:[transform:translate(2px,-2px)] motion-reduce:transition-none" />
            <span className="sr-only">(새 창)</span>
          </a>
        ))}
      </nav>
      <p className="mt-3 flex gap-2.5 rounded-[14px] border border-[#DCE8F4] bg-civic-soft px-4 py-3.5 text-[13px] leading-[1.65] break-keep text-civic-deep"><ShieldIcon size={16} strokeWidth={2} className="mt-0.5 flex-none text-civic" /><span><strong className="font-extrabold text-navy">FindUs는 제보를 직접 받지 않아요.</strong> 실종 신고와 목격 제보는 112·182 또는 안전Dream으로 해 주세요.</span></p>
      <p className="mt-3.5 text-[11.5px] leading-[1.7] text-civic-faint">아동 정보 자료 출처: 경찰청. 실종 신고·상담은 경찰청(112·182)을 이용해 주세요.<br />개인정보처리방침은 준비 중입니다. © 2026 FindUs</p>
    </>
  );
}

import type { Metadata } from "next";
import type { CSSProperties } from "react";
import AiContent from "@/components/AiContent";
import GuideContent from "@/components/GuideContent";
import InfoHero from "@/components/InfoHero";
import InquiryForm from "@/components/InquiryForm";
import PageTabs from "@/components/PageTabs";
import { kicker, rise, sectionText, sectionTitle } from "@/components/infoStyles";
import ServiceInfoContent, { OfficialCalls } from "@/components/ServiceInfoContent";

export const metadata: Metadata = {
  title: "이용 안내",
  description: "실종아동 제보·상담 절차, AI 연령 변환 연구 원칙, 공식 기관 연락처를 안내합니다.",
  alternates: { canonical: "/help" },
};

const TABS = [
  { key: "guide", label: "제보·상담 안내" },
  { key: "ai", label: "AI 연구 안내" },
  { key: "info", label: "공식 기관·정보" },
];

// 예전 /community#ai 같은 해시 링크로 들어와도 맞는 탭을 연다.
const HASH_ALIASES = { "#ai": "ai", "#service-info": "info", "#inquiry": "info" };

const SUB_TITLE =
  "flex items-center gap-2 text-[18px] font-extrabold tracking-[-.4px] text-navy before:size-1.5 before:rounded-full before:bg-coral before:content-['']";
// 문의 폼(InquiryForm)을 이 면의 색에 맞춘다: 안내 문구는 코랄 면, 입력칸은 흰 바탕에 공공 블루 포커스.
const FORM_PANEL = [
  "rounded-[18px] border border-[#E7ECF2] bg-civic-panel p-[22px] shadow-[0_4px_18px_rgba(23,59,112,.035)] max-sm:rounded-2xl max-sm:p-4",
  "[&_form>p:first-child]:border [&_form>p:first-child]:border-coral-line [&_form>p:first-child]:bg-coral-faint [&_form>p:first-child]:text-[#5E4A44] [&_form>p:first-child_strong]:text-coral-ink",
  "[&_textarea]:bg-white [&_textarea]:[transition:border-color_.2s_ease,box-shadow_.2s_ease] [&_textarea:focus]:border-civic [&_textarea:focus]:shadow-[0_0_0_4px_rgba(57,120,184,.1)]",
  "[&_input[type=email]]:bg-white [&_input[type=email]]:[transition:border-color_.2s_ease,box-shadow_.2s_ease] [&_input[type=email]:focus]:border-civic [&_input[type=email]:focus]:shadow-[0_0_0_4px_rgba(57,120,184,.1)]",
  "[&_button[type=submit]]:[transition:background-color_.2s_ease,translate_.25s_cubic-bezier(.2,.7,.2,1),box-shadow_.25s_ease] [&_button[type=submit]:hover:not(:disabled)]:[translate:0_-1px] [&_button[type=submit]:hover:not(:disabled)]:shadow-[0_10px_22px_rgba(57,120,184,.24)]",
].join(" ");

export default function HelpPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <InfoHero
        eyebrow="이용 안내"
        title="기억을 단서로"
        accent="잇는 방법"
        description={<>목격 제보와 가족 찾기 절차, AI 사용 원칙, <br className="max-sm:hidden" />공식 기관 연락처를 확인하세요.</>}
        image="/images/support-children-background.png"
        imagePosition="70% 45%"
      />
      <PageTabs
        label="이용 안내 분야"
        tabs={TABS}
        hashAliases={HASH_ALIASES}
        panels={[
          <GuideContent key="guide" embedded />,
          <AiContent key="ai" />,
          <section key="info" aria-labelledby="service-info-title" className="page-container max-w-5xl pt-7 max-sm:pt-5">
            {/* 가장 먼저 필요한 전화번호를 맨 위에 크게, 그 아래에 기관 바로가기와 서비스 문의를 둔다. */}
            <div className={rise}>
              <p className={kicker}>OFFICIAL CONTACTS</p>
              <h2 id="service-info-title" className={sectionTitle}>공식 기관·서비스 정보</h2>
              <p className={sectionText}>실종 신고와 제보, 상담은 아래 공식 기관에서 진행해 주세요. 번호를 누르면 바로 전화가 연결돼요.</p>
            </div>
            <OfficialCalls />
            <div className="mt-7 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6 max-[900px]:grid-cols-[minmax(0,1fr)] max-[900px]:gap-[18px]">
              <div className={rise} style={{ "--d": ".2s" } as CSSProperties}>
                <h3 className={SUB_TITLE}>공식 기관 바로가기</h3>
                <ServiceInfoContent />
              </div>
              <div className={rise} style={{ "--d": ".28s" } as CSSProperties}>
                <h3 id="inquiry-title" className={SUB_TITLE}>서비스 문의</h3>
                <p className="mt-1 text-[13.5px] leading-[1.65] break-keep text-civic-muted">사이트를 쓰며 불편했던 점이나 개선 의견을 들려주세요.</p>
                <div className={`mt-3 ${FORM_PANEL}`}><InquiryForm /></div>
              </div>
            </div>
          </section>,
        ]}
      />
    </main>
  );
}

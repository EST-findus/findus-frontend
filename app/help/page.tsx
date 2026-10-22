import type { Metadata } from "next";
import AiContent from "@/components/AiContent";
import GuideContent from "@/components/GuideContent";
import InquiryForm from "@/components/InquiryForm";
import PageTabs from "@/components/PageTabs";
import ServiceInfoContent from "@/components/ServiceInfoContent";

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

export default function HelpPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <header className="page-container max-w-5xl pt-8 pb-6 max-sm:pt-6 max-sm:pb-5">
        <p className="text-[13px] font-bold text-brand">이용 안내</p>
        <h1 className="mt-2 text-[32px] leading-snug font-extrabold tracking-tight max-sm:text-[25px]">기억을 단서로 잇는 방법</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted max-sm:text-[14px]">목격 제보와 가족 찾기 절차, AI 사용 원칙, 공식 기관 연락처를 확인하세요.</p>
      </header>
      <PageTabs
        label="이용 안내 분야"
        tabs={TABS}
        hashAliases={HASH_ALIASES}
        panels={[
          <GuideContent key="guide" embedded />,
          <AiContent key="ai" />,
          <section key="info" aria-labelledby="service-info-title" className="page-container max-w-3xl pt-8 max-sm:pt-6">
            <h2 id="service-info-title" className="mb-4 text-[20px] font-extrabold tracking-tight">공식 기관·서비스 정보</h2>
            <ServiceInfoContent />
            <h2 id="inquiry-title" className="mt-12 mb-4 text-[20px] font-extrabold tracking-tight">서비스 문의</h2>
            <InquiryForm />
          </section>,
        ]}
      />
    </main>
  );
}

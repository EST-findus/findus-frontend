import type { Metadata } from "next";
import type { CSSProperties } from "react";
import AiContent from "@/components/AiContent";
import GuideContent from "@/components/GuideContent";
import InfoHero from "@/components/InfoHero";
import InquiryForm from "@/components/InquiryForm";
import PageTabs from "@/components/PageTabs";
import styles from "@/components/InfoPages.module.css";
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
          <section key="info" aria-labelledby="service-info-title" className={`page-container max-w-5xl pt-7 max-sm:pt-5 ${styles.infoGrid}`}>
            <div className={styles.rise}>
              <p className={styles.kicker}>OFFICIAL CONTACTS</p>
              <h2 id="service-info-title" className={styles.sectionTitle}>공식 기관·서비스 정보</h2>
              <p className={styles.sectionText}>실종 신고와 제보, 상담은 아래 공식 기관에서 진행해 주세요.</p>
              <ServiceInfoContent />
            </div>
            <div className={styles.rise} style={{ "--d": ".1s" } as CSSProperties}>
              <p className={styles.kicker}>CONTACT US</p>
              <h2 id="inquiry-title" className={styles.sectionTitle}>서비스 문의</h2>
              <p className={styles.sectionText}>사이트를 쓰며 불편했던 점이나 개선 의견을 들려주세요.</p>
              <div className={`mt-4 ${styles.formPanel}`}><InquiryForm /></div>
            </div>
          </section>,
        ]}
      />
    </main>
  );
}

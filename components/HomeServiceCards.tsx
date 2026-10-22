"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "./Icons";
import DnaGuideButton from "./DnaGuideButton";
import { GuidePopup, type GuidePopupId } from "./GuideSteps";
import styles from "./HomeServiceCards.module.css";

const FEATURE_IMAGE_SIZES = "(max-width: 680px) calc(100vw - 40px), (max-width: 1000px) 46vw, 360px";
const GUIDE_IMAGE_SIZES = "(max-width: 680px) calc(100vw - 40px), (max-width: 1000px) 46vw, 300px";

export default function HomeServiceCards() {
  const [activeGuide, setActiveGuide] = useState<GuidePopupId | null>(null);
  const guideTriggerRefs = useRef<Record<GuidePopupId, HTMLButtonElement | null>>({ know: null, me: null });

  return (
    <>
      <nav className={`page-container ${styles.section}`} aria-label="주요 서비스 바로가기">
        <div className={styles.grid} data-reveal="stagger">
          <header className={styles.intro}>
            <div>
              <span className={styles.eyebrow}>지금 시작하세요</span>
              <h2>실종아동을 찾는 다양한 방법</h2>
            </div>
            <p>기억하고 있는 정보로, 소중한 아이를 다시 만날 수 있습니다.</p>
          </header>

          <button
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("know")}
            ref={(element) => { guideTriggerRefs.current.know = element; }}
            type="button"
            className={`${styles.feature} ${styles.featureReport}`}
          >
            <span aria-hidden="true" className={styles.featureMedia}>
              <Image src="/images/home-drawing-report.svg" alt="" fill sizes={FEATURE_IMAGE_SIZES} />
              <span className={styles.chip}>목격·제보</span>
            </span>
            <span className={styles.featureBody}>
              <strong>이 사람을 알아요.</strong>
              <span>어디선가 본 얼굴이라면, 기억나는 단서를 공식 제보로 연결해 주세요.</span>
              <span className={styles.action}>절차 보기 <ArrowRightIcon size={16} /></span>
            </span>
          </button>

          <button
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("me")}
            ref={(element) => { guideTriggerRefs.current.me = element; }}
            type="button"
            className={`${styles.feature} ${styles.featureFamily}`}
          >
            <span aria-hidden="true" className={styles.featureMedia}>
              <Image src="/images/home-drawing-family.svg" alt="" fill sizes={FEATURE_IMAGE_SIZES} />
              <span className={styles.chip}>가족 찾기</span>
            </span>
            <span className={styles.featureBody}>
              <strong>혹시 나?</strong>
              <span>어린 시절 기억이 낯설게 느껴진다면, 차근차근 확인하고 상담부터 시작해 보세요.</span>
              <span className={styles.action}>절차 보기 <ArrowRightIcon size={16} /></span>
            </span>
          </button>

          <DnaGuideButton className={`${styles.guide} ${styles.guideDna}`}>
            <span aria-hidden="true" className={styles.guideMedia}>
              <Image src="/images/home-service-lab.jpg" alt="" fill sizes={GUIDE_IMAGE_SIZES} />
              <span className={styles.chip}>본인·가족 찾기</span>
            </span>
            <span className={styles.guideBody}>
              <strong>DNA 검사·상담 안내</strong>
              <span>본인·가족의 DNA 채취 절차를 확인하세요.</span>
              <span className={styles.action}>안내 보기 <ArrowRightIcon size={15} /></span>
            </span>
          </DnaGuideButton>

          <Link href="/help?tab=ai" className={`${styles.guide} ${styles.guideAi}`}>
            <span aria-hidden="true" className={styles.guideMedia}>
              <Image src="/images/home-service-research.jpg" alt="" fill sizes={GUIDE_IMAGE_SIZES} />
              <span className={styles.chip}>책임 있는 AI</span>
            </span>
            <span className={styles.guideBody}>
              <strong>AI 연구 안내</strong>
              <span>시간의 변화를 돕는 AI를 신중하게 연구합니다.</span>
              <span className={styles.action}>연구 안내 보기 <ArrowRightIcon size={15} /></span>
            </span>
          </Link>
        </div>
      </nav>

      {activeGuide && (
        <GuidePopup
          guideId={activeGuide}
          onClose={() => setActiveGuide(null)}
          returnFocusTo={guideTriggerRefs.current[activeGuide]}
        />
      )}
    </>
  );
}

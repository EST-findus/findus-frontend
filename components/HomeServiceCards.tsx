"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon, HeartIcon, ScanFaceIcon, SparklesIcon } from "./Icons";
import DnaGuideButton from "./DnaGuideButton";
import { GuidePopup, type GuidePopupId } from "./GuideSteps";
import Modal from "./Modal";
import styles from "./HomeLanding.module.css";

export default function HomeServiceCards({ aiPanel }: { aiPanel: ReactNode }) {
  const [activeGuide, setActiveGuide] = useState<GuidePopupId | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const guideTriggerRefs = useRef<Record<GuidePopupId, HTMLButtonElement | null>>({ know: null, me: null });
  const aiTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <nav className={`page-container ${styles.serviceCards}`} aria-label="주요 서비스 바로가기">
        <button
          ref={(element) => { guideTriggerRefs.current.know = element; }}
          type="button"
          aria-haspopup="dialog"
          onClick={() => setActiveGuide("know")}
          className={`${styles.serviceCard} ${styles.serviceCardKnow}`}
        >
          <span aria-hidden="true" className={styles.serviceCardIcon}><ScanFaceIcon size={26} strokeWidth={1.8} /></span>
          <span className={styles.serviceCardCopy}>
            <span className={styles.serviceCardLabel}>목격·제보</span>
            <strong>이 사람을 알아요.</strong>
            <span className={styles.serviceCardDescription}>어디선가 본 얼굴이라면, 기억나는 단서를 공식 제보로 연결해 주세요.</span>
            <span className={styles.serviceCardAction}>절차 보기 <ArrowRightIcon size={16} /></span>
          </span>
        </button>

        <div className={styles.serviceGroup} aria-label="가족 찾기 안내">
          <button
            ref={(element) => { guideTriggerRefs.current.me = element; }}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("me")}
            className={`${styles.serviceCard} ${styles.serviceGroupItem}`}
          >
            <span aria-hidden="true" className={`${styles.serviceCardIcon} ${styles.serviceCardIconCoral}`}><HeartIcon size={26} strokeWidth={1.8} /></span>
            <span className={styles.serviceCardCopy}>
              <span className={styles.serviceCardLabel}>가족 찾기</span>
              <strong>혹시 나?</strong>
              <span className={styles.serviceCardDescription}>어린 시절 기억이 낯설게 느껴진다면, 차근차근 확인하고 상담부터 시작해 보세요.</span>
              <span className={styles.serviceCardAction}>절차 보기 <ArrowRightIcon size={16} /></span>
            </span>
          </button>
          <DnaGuideButton variant="homeCard" className={`${styles.serviceCard} ${styles.serviceGroupItem} ${styles.serviceCardDna}`} />
        </div>

        <button ref={aiTriggerRef} type="button" aria-haspopup="dialog" onClick={() => setAiOpen(true)} className={`${styles.serviceCard} ${styles.serviceCardAi}`}>
          <span aria-hidden="true" className={styles.serviceCardIcon}><SparklesIcon size={26} strokeWidth={1.8} /></span>
          <span className={styles.serviceCardCopy}>
            <span className={styles.serviceCardLabel}>책임 있는 AI</span>
            <strong>AI 연구 안내</strong>
            <span className={styles.serviceCardDescription}>시간의 변화를 돕는 AI를 신중하게 연구합니다.</span>
            <span className={styles.serviceCardAction}>연구 안내 보기 <ArrowRightIcon size={16} /></span>
          </span>
        </button>
      </nav>

      {activeGuide && (
        <GuidePopup
          guideId={activeGuide}
          onClose={() => setActiveGuide(null)}
          returnFocusTo={guideTriggerRefs.current[activeGuide]}
        />
      )}
      {aiOpen && (
        <Modal eyebrow="책임 있는 AI" title="AI 연구 안내" accent="brand" onClose={() => setAiOpen(false)} returnFocusTo={aiTriggerRef.current} size="wide">
          {aiPanel}
        </Modal>
      )}
    </>
  );
}

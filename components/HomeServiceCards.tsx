"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "./Icons";
import DnaGuideButton from "./DnaGuideButton";
import { GuidePopup, type GuidePopupId } from "./GuideSteps";
import styles from "./HomeServiceCards.module.css";

// Two-tone tile icons: a soft filled shape (`.iconFill`) under a 1.8px line, both in the tile's tone colour.
function TileIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const SearchGlyph = () => (
  <TileIcon>
    <circle className={styles.iconFill} cx="10.5" cy="10.5" r="6.5" stroke="none" />
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4 20 20" />
    <path d="M7.8 9.2a3 3 0 0 1 2.4-1.7" />
  </TileIcon>
);

const WitnessGlyph = () => (
  <TileIcon>
    <path className={styles.iconFill} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="none" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </TileIcon>
);

const FamilyGlyph = () => (
  <TileIcon>
    <circle className={styles.iconFill} cx="10" cy="8.5" r="3.8" stroke="none" />
    <path className={styles.iconFill} d="M3.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2Z" stroke="none" />
    <circle cx="10" cy="8.5" r="3.8" />
    <path d="M3.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
    <path d="M17.2 4.6a2 2 0 1 1 2.8 1.8c-.6.3-1 .8-1 1.4v.4" />
    <circle cx="19" cy="10.6" r=".9" fill="currentColor" stroke="none" />
  </TileIcon>
);

const DnaGlyph = () => (
  <TileIcon>
    <path className={styles.iconFill} d="M8 3c0 4.5 8 6.5 8 9s-8 4.5-8 9h8c0-4.5-8-6.5-8-9s8-4.5 8-9Z" stroke="none" />
    <path d="M8 3c0 4.5 8 6.5 8 9s-8 4.5-8 9" />
    <path d="M16 3c0 4.5-8 6.5-8 9s8 4.5 8 9" />
    <path d="M9.3 6.5h5.4M10.6 9.5h2.8M10.6 14.5h2.8M9.3 17.5h5.4" />
  </TileIcon>
);

function TileBody({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return (
    <>
      <span aria-hidden="true" className={styles.icon}>{icon}</span>
      <span className={styles.copy}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <strong>{title}</strong>
      </span>
      <span aria-hidden="true" className={styles.arrow}><ArrowRightIcon size={15} /></span>
    </>
  );
}

// Four quick shortcuts in one row across the home hero's bottom edge.
export default function HomeServiceCards() {
  const [activeGuide, setActiveGuide] = useState<GuidePopupId | null>(null);
  const guideTriggerRefs = useRef<Record<GuidePopupId, HTMLButtonElement | null>>({ know: null, me: null });

  return (
    <>
      <nav className={styles.panel} aria-label="주요 서비스 바로가기">
        <div className={styles.grid}>
          {/* 실종아동 찾기 화면으로 가서 검색창에 바로 커서를 둔다. */}
          <Link href="/search?focus=search" className={`${styles.tile} ${styles.toneNavy}`}>
            <TileBody icon={<SearchGlyph />} eyebrow="검색 바로가기" title="실종아동 검색" />
          </Link>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("know")}
            ref={(element) => { guideTriggerRefs.current.know = element; }}
            className={`${styles.tile} ${styles.toneBlue}`}
          >
            <TileBody icon={<WitnessGlyph />} eyebrow="목격·제보" title="이 사람을 알아요" />
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("me")}
            ref={(element) => { guideTriggerRefs.current.me = element; }}
            className={`${styles.tile} ${styles.toneCoral}`}
          >
            <TileBody icon={<FamilyGlyph />} eyebrow="본인 확인" title="내가 실종아동일까?" />
          </button>
          <DnaGuideButton className={`${styles.tile} ${styles.toneGold}`}>
            <TileBody icon={<DnaGlyph />} eyebrow="본인·가족 찾기" title="DNA 검사·상담" />
          </DnaGuideButton>
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

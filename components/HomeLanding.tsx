"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MissingPerson } from "@/lib/types";
import HomeChildren from "./HomeChildren";
import { ArrowRightIcon } from "./Icons";
import styles from "./HomeLanding.module.css";
import HomeServiceCards from "./HomeServiceCards";
import { useScrollReveal } from "./useScrollReveal";

export default function HomeLanding({ persons, aiPanel }: { persons: MissingPerson[]; aiPanel: ReactNode }) {
  const pageRef = useScrollReveal<HTMLDivElement>();
  return <div ref={pageRef} className={styles.page}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroVisual}><Image src="/images/search-campaign-hope.png" alt="햇살 아래 인형을 안고 있는 아이의 모습 · AI 캠페인 이미지" fill priority sizes="100vw" /><span>AI로 제작한 캠페인 이미지</span></div>
      <div className={`page-container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />아이를 기억하는 마음, FindUs</p>
          <h1 id="home-title">다시 그린 얼굴에,<br /><em>우리의 마음을 더하다.</em></h1>
          <p className={styles.heroLead}>잊혀진 얼굴에 다시 시선을, 기다리는 가족에게 새로운 희망을.</p>
          <p className={styles.heroDescription}>AI 나이 예측 기술로 시간이 흐른 아이들의 모습을 그려보고, 다시 만날 희망을 이어갑니다.</p>
        </div>
        <div className={styles.heroPhotos} aria-label="AI로 만든 가상 인물 예시 사진">
          <figure className={styles.heroPhotoCard}>
            <div className={styles.heroPhotoImage}><Image src="/images/mock-persons/MC-2008-0915/past.jpg" alt="AI로 만든 가상 인물의 어린 시절 예시" fill sizes="(max-width: 640px) 42vw, 240px" /></div>
            <figcaption>어린 시절 예시</figcaption>
          </figure>
          <span className={styles.heroPhotoArrow} aria-hidden="true"><ArrowRightIcon size={16} /></span>
          <figure className={styles.heroPhotoCard}>
            <div className={styles.heroPhotoImage}><Image src="/images/mock-persons/MC-2008-0915/aged.jpg" alt="AI로 만든 가상 인물의 현재 추정 모습" fill sizes="(max-width: 640px) 42vw, 240px" /></div>
            <figcaption><span>AI</span> 예상 모습</figcaption>
          </figure>
          <p className={styles.heroPhotoNote}>가상 인물 예시 · 실제 모습과 다를 수 있습니다</p>
        </div>
      </div>
    </section>

    <HomeChildren persons={persons} />

    <div className={styles.serviceBand}>
      <HomeServiceCards aiPanel={aiPanel} />
    </div>

    <section className={styles.closing} aria-label="FindUs 마무리 메시지">
      <div className={`page-container ${styles.closingInner}`} data-reveal="stagger">
        <span className={styles.closingTag}>함께 기억하는 FindUs</span>
        <h2>AI로 그리는 오늘,<br /><em>가족에게 돌아가는 내일.</em></h2>
        <p>잊지 않고 기억하며, 다시 만날 희망을 이어갑니다.</p>
        <div className={styles.closingActions}>
          <Link href="/search" className={styles.closingPrimary}>실종아동 찾아보기 <ArrowRightIcon size={16} /></Link>
          <Link href="/funding" className={styles.closingSecondary}>프로젝트 후원하기</Link>
        </div>
      </div>
    </section>
  </div>;
}

"use client";
import { Nanum_Pen_Script, Noto_Serif_KR } from "next/font/google";
import Image from "next/image";
import type { MissingPerson } from "@/lib/types";
import HomeChildren from "./HomeChildren";
import HomeFeaturedChild from "./HomeFeaturedChild";
import { ArrowRightIcon } from "./Icons";
import styles from "./HomeLanding.module.css";
import HomeServiceCards, { HomeAiGuideLink } from "./HomeServiceCards";
import HomeStory from "./HomeStory";
import { useScrollReveal } from "./useScrollReveal";

const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const serif = Noto_Serif_KR({ weight: ["500", "600"], subsets: ["latin"], display: "swap", preload: false });

export default function HomeLanding({ persons, featured }: { persons: MissingPerson[]; featured: MissingPerson | null }) {
  const pageRef = useScrollReveal<HTMLDivElement>();
  return <div ref={pageRef} className={styles.page}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroVisual}><Image src="/images/search-campaign-hope.png" alt="햇살 아래 인형을 안고 있는 아이의 모습 · AI 캠페인 이미지" fill priority sizes="100vw" /><span>AI로 제작한 캠페인 이미지</span></div>
      <div className={`page-container ${styles.heroInner}`}>
        <div className={styles.heroMain}>
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
        <HomeAiGuideLink />
        </div>
        <div className={styles.heroSide}>
          {featured && <HomeFeaturedChild person={featured} />}
          <HomeServiceCards />
        </div>
      </div>
    </section>

    <HomeChildren persons={persons} />

    <HomeStory />

    <section className={styles.closing} aria-labelledby="closing-title" data-reveal>
      {/* The sky photo carries no copy; the copy is page text laid over its left side, so it stays sharp at any height.
          On phones the photo is cropped to the two people and the copy moves below it. */}
      <div className={styles.closingStage}>
        <Image src="/images/home-closing-sky.webp" alt="" fill sizes="100vw" unoptimized className={styles.closingSky} />
        <div className={`page-container ${styles.closingCopy}`}>
          <p className={`${serif.className} ${styles.closingTag}`}>함께 기억하는 <strong>FindUs</strong></p>
          <h2 id="closing-title" className={serif.className}>AI로 그리는 오늘,<br /><em>가족에게 돌아가는 내일.</em></h2>
          <p className={styles.closingDescription}>실종 원본 사진을 기반으로 AI가 나이 예측을 통해 미래의 모습을 그립니다.</p>
          <div className={styles.closingPair} aria-label="AI 나이 예측 예시">
            <figure><Image src="/images/home-closing-past.webp" alt="AI로 만든 가상 인물의 어린 시절 예시" width={240} height={224} /><figcaption>실종 원본</figcaption></figure>
            <span aria-hidden="true"><ArrowRightIcon size={14} /></span>
            <figure><Image src="/images/home-closing-aged.webp" alt="AI로 만든 가상 인물의 현재 추정 모습" width={240} height={224} /><figcaption>미래 예측 이미지</figcaption></figure>
          </div>
          <p className={styles.closingFoot}>잊지 않고 기억하며, 다시 만날 희망을 이어갑니다.</p>
        </div>
        <p className={`${pen.className} ${styles.closingNote}`}>기술이<br />기억을 이어,<br />사랑이 다시 만듭니다.</p>
      </div>
    </section>
  </div>;
}

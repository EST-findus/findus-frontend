"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import type { MissingPerson } from "@/lib/types";
import HomeChildren from "./HomeChildren";
import styles from "./HomeLanding.module.css";
import HomeServiceCards from "./HomeServiceCards";

export default function HomeLanding({ persons, aiPanel }: { persons: MissingPerson[]; aiPanel: ReactNode }) {
return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroVisual}><Image src="/images/search-campaign-hope.png" alt="햇살 아래 인형을 안고 있는 아이의 모습 · AI 캠페인 이미지" fill priority sizes="(min-width: 800px) 60vw, 100vw" /><span>AI로 제작한 캠페인 이미지</span></div>
      <div className={`page-container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />아이를 기억하는 마음, FindUs</p>
          <h1 id="home-title">다시 그린 얼굴에,<br /><em>우리의 마음을 더하다.</em></h1>
          <p className={styles.heroLead}>잊혀진 얼굴에 다시 시선을, 기다리는 가족에게 새로운 희망을.</p>
          <p className={styles.heroDescription}>AI 나이 예측 기술로 시간이 흐른 아이들의 모습을 그려보고, 다시 만날 희망을 이어갑니다.</p>
        </div>
      </div>
    </section>

    <HomeChildren persons={persons} />

    <HomeServiceCards aiPanel={aiPanel} />


    <section className={styles.closing} aria-label="FindUs 마무리 메시지">
      <div className={`page-container ${styles.closingInner}`}>
        <span className={styles.closingTag}>함께 기억하는 FindUs</span>
        <h2>AI로 그리는 오늘,<br /><em>가족에게 돌아가는 내일.</em></h2>
        <p>잊지 않고 기억하며, 다시 만날 희망을 이어갑니다.</p>
        <div className={styles.closingRule} aria-hidden="true" />
      </div>
    </section>
  </div>;
}

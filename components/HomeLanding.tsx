"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MissingPerson } from "@/lib/types";
import { HeartIcon } from "./Icons";
import HomeChildren from "./HomeChildren";
import coralStyles from "./CoralAction.module.css";
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

    <section className={styles.supportSection} aria-labelledby="home-support-title">
      <Image src="/images/support-children-background.png" alt="" fill sizes="100vw" className={styles.supportPhoto} />
      <div className={styles.supportShade} aria-hidden="true" />
      <div className={`page-container ${styles.supportBanner}`}>
        <div className={styles.supportCopy}>
          <div className={styles.supportEyebrow}><span>FINDUS CAMPAIGN</span><span className={styles.supportBadge}>펀딩 진행 중</span></div>
          <h2 id="home-support-title">오랜 기다림이 끝나고,<br /><em>다시 가족의 품으로.</em></h2>
          <p>장기 실종아동이 안전하게 집으로 돌아오는 날을 위해,<br />작은 관심을 하나의 희망으로 잇습니다.</p>
          <span className={styles.supportMessage}>잊지 않고 기억하는 마음이, 다시 만날 내일을 만듭니다.</span>
        </div>
        <aside className={styles.supportCard} aria-label="후원 프로젝트 안내">
          <p className={styles.supportCardLabel}><HeartIcon size={17} fill="currentColor" />함께 만드는 프로젝트</p>
          <h3>기억을 들고 다니는 QR 굿즈</h3>
          <p className={styles.supportCardDescription}>가방과 옷에 남은 작은 QR이<br />실종아동의 얼굴을 다시 한 번 보게 합니다.</p>
          <Link href="/funding" className={`${styles.supportButton} ${coralStyles.soft}`}>펀딩 보러 가기</Link>
          <p className={styles.supportCardNote}>목표 300만 원에 닿지 못하면 전액 환불해요.</p>
        </aside>
        <span className={styles.supportArtNote}>AI로 제작한 캠페인 이미지</span>
      </div>
    </section>

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

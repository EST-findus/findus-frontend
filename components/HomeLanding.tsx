"use client";

import Image from "next/image";
import Link from "next/link";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, SearchIcon, PhoneIcon, LayersIcon, ShieldIcon, PencilIcon } from "./Icons";
import HomeChildren from "./HomeChildren";
import styles from "./HomeLanding.module.css";
import coralStyles from "./CoralAction.module.css";

const services = [
  { title:"실종아동 찾기", description:"기억나는 얼굴과 정보를 살펴보세요.", href:"/search", Icon:SearchIcon },
  { title:"목격 정보 제보하기", description:"작은 단서를 공식 기관에 전하는 방법", href:"/guide#know", Icon:PhoneIcon },
  { title:"DNA 안내", description:"가족을 찾기 위한 검사·상담 절차", href:"/guide#families", Icon:LayersIcon },
  { title:"실종 예방 안내", description:"사전등록과 예방 정보를 확인하세요.", href:"/guide#faq", Icon:ShieldIcon },
];
const steps = [
  { title:"정보를 살펴봐요.", text:"사진과 실종 지역, 신체 특징을 함께 확인해요.", Icon:SearchIcon },
  { title:"기억을 정리해요.", text:"목격 장소와 시간 등 기억나는 단서를 메모해요.", Icon:PencilIcon },
  { title:"공식 기관에 전해요.", text:"112·182 또는 안전Dream에 정보를 전해요.", Icon:PhoneIcon },
  { title:"관심을 이어가요.", text:"확인된 정보를 살펴보고, 안전하게 함께 나눠요.", Icon:HeartIcon },
];

export default function HomeLanding({ persons }: { persons: MissingPerson[] }) {
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroVisual}><Image src="/images/search-campaign-hope.png" alt="햇살 아래 인형을 안고 있는 아이의 모습 · AI 캠페인 이미지" fill priority sizes="(min-width: 800px) 60vw, 100vw" /><span>AI로 제작한 캠페인 이미지</span></div>
      <div className={`page-container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />아이를 기억하는 마음, FindUs</p>
          <h1 id="home-title">아이들이 다시<br /><em>가족의 품으로</em><br />돌아갈 수 있도록.</h1>
          <div className={styles.heroActions}><Link className={styles.primary} href="/search">실종아동 찾아보기 <ArrowRightIcon size={18} /></Link><Link className={styles.secondary} href="/guide#know">목격 정보 제보하기 <ArrowRightIcon size={17} /></Link></div>
          <p className={styles.heroFootnote}>작은 기억도, 누군가에게는 소중한 단서가 됩니다.</p>
          <section className={styles.heroAbout} aria-labelledby="home-about-title">
            <h2 id="home-about-title" className={styles.heroAboutLabel}>FindUs</h2>
            <p className={styles.heroDescription}>아이를 향한 관심, 가족을 향한 희망.<br />FindUs는 시민의 작은 기억을 소중한 단서로 연결합니다.</p>
            <Link className={styles.heroAboutLink} href="/about">FindUs 소개 <ArrowRightIcon size={14} /></Link>
          </section>
        </div>
      </div>
    </section>

    <nav className={`page-container ${styles.services}`} aria-label="주요 서비스 바로가기">
      {services.map(({title,description,href,Icon},i) => <Link key={title} href={href}><span className={`${styles.serviceIcon} ${i===1 ? styles.coralIcon : ""}`}><Icon size={25} /></span><div><strong>{title}</strong><p>{description}</p></div><ArrowRightIcon size={16} /></Link>)}
    </nav>

    <section className={styles.supportSection} aria-labelledby="home-support-title">

        <Image src="/images/support-children-background.png" alt="" fill sizes="100vw" className={styles.supportPhoto} />
      <div className={styles.supportShade} aria-hidden="true" />
      <div className={`page-container ${styles.supportBanner}`}>
        <div className={styles.supportCopy}>
          <div className={styles.supportEyebrow}><span>FINDUS CAMPAIGN</span><span className={styles.supportBadge}>프로젝트 준비 중</span></div>
          <h2 id="home-support-title">오랜 기다림이 끝나고,<br /><em>다시 가족의 품으로.</em></h2>
          <p>장기 실종아동이 안전하게 집으로 돌아오는 날을 위해,<br />작은 관심을 하나의 희망으로 잇습니다.</p>
          <span className={styles.supportMessage}>잊지 않고 기억하는 마음이, 다시 만날 내일을 만듭니다.</span>
        </div>
        <aside className={styles.supportCard} aria-label="후원 프로젝트 안내">
          <p className={styles.supportCardLabel}><HeartIcon size={17} fill="currentColor" />함께 만드는 프로젝트</p>
          <h3>후원 프로젝트 준비 중</h3>
          <p className={styles.supportCardDescription}>오래 기다린 가족과 아이들의 재회를 돕는<br />의미 있는 프로젝트를 준비하고 있습니다.</p>
          <a href="https://tumblbug.com/" target="_blank" rel="noopener noreferrer" aria-label="텀블벅 둘러보기 (새 창)" className={`${styles.supportButton} ${coralStyles.soft}`}>텀블벅 둘러보기</a>
          <p className={styles.supportCardNote}>현재 텀블벅 홈페이지로 연결됩니다.</p>
        </aside>
        <span className={styles.supportArtNote}>AI로 제작한 캠페인 이미지</span>
      </div>
    </section>
    <HomeChildren persons={persons} />

    <section className={styles.videoCampaign} aria-labelledby="home-campaign-title">
      <div className={`page-container ${styles.videoCampaignInner}`}>
        <header className={styles.videoCampaignHeading}>
          <div className={styles.videoCampaignCopy}>
            <p className={styles.eyebrow}><span />함께 기억하는 캠페인 영상</p>
            <h2 id="home-campaign-title">사진으로 기억하는 <em>실종아동네컷</em></h2>
            <p className={styles.videoCampaignDescription}>한 번 더 얼굴을 살펴보는 작은 관심. 아이와 가족을 기억하는 마음을 함께 나눠주세요.</p>
          </div>
          <Link href="/guide#know" className={styles.videoCampaignLink}>목격 제보 안내 <ArrowRightIcon size={16} /></Link>
        </header>
        <figure className={styles.videoEmbed}>
          <div className={styles.videoPlayer}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/xvB02ibSPiU?autoplay=0&playsinline=1&rel=0"
              title="2024 인생네컷 실종아동네컷 캠페인(KOR) · YouTube"
              width="560"
              height="315"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <figcaption className={styles.videoCredit}>
            <p>2024 인생네컷 · 실종아동네컷 캠페인</p>
            <div>
              <span>영상 출처 · <a href="https://www.youtube.com/@projectxt6732" target="_blank" rel="noopener noreferrer">HYO JIN KIM<span className="sr-only"> (새 창)</span></a></span>
              <a href="https://www.youtube.com/watch?v=xvB02ibSPiU" target="_blank" rel="noopener noreferrer" className={styles.videoOriginal}>YouTube 원본 보기 <ArrowUpRightIcon size={14} /><span className="sr-only"> (새 창)</span></a>
            </div>
            <p className={styles.videoCreditNote}>재생이 제한되면 YouTube 원본에서 시청해 주세요.</p>
          </figcaption>
        </figure>
      </div>
    </section>
    <section className={styles.stepsScene} aria-labelledby="home-steps-title">
      <Image src="/images/home-family-walk.png" alt="" fill sizes="(min-width: 1200px) 1200px, 100vw" className={styles.stepsBackground} />
      <div className={styles.stepsVeil} />
      <div className={`page-container ${styles.section} ${styles.stepsContent}`}>
      <header className={styles.stepsHeading}><p className={styles.eyebrow}><span aria-hidden="true" />누구나 함께할 수 있어요</p><h2 id="home-steps-title">관심을 전하는 <em>네 걸음</em></h2><p>살펴보고, 기억하고, 공식 기관에 전해주세요.</p></header>
      <ol className={styles.steps}>{steps.map(({title,text,Icon},i)=><li key={title}><div className={styles.stepTop}><span>0{i+1}</span><span className={styles.stepIcon} aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span></div><h3>{title}</h3><p>{text}</p>{i<3 && <ArrowRightIcon className={styles.stepArrow} size={20} />}</li>)}</ol>
      <p className={styles.stepNote}>FindUs는 직접 신고를 접수하지 않습니다. 제보 확인과 신원 확인은 담당 기관의 안내에 따라 진행됩니다.</p>
      </div>
    </section>

  </div>;
}

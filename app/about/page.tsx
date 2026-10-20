import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, HomeIcon, LayersIcon, PhoneIcon, SearchIcon } from "@/components/Icons";
import ServiceInfoContent from "@/components/ServiceInfoContent";
import styles from "./AboutPage.module.css";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "오래된 기억이 가족을 잇는 단서가 되도록, FindUs가 하는 일을 소개합니다.",
  alternates: { canonical: "/about" },
};

const QUICK_LINKS = [
  { href: "/guide#know", Icon: SearchIcon, title: "이 사람을 알아요", text: "기억나는 목격 단서를 전하고 싶어요" },
  { href: "/guide#me", Icon: HeartIcon, title: "혹시 나?", text: "어린 시절의 기록과 가족을 찾고 싶어요" },
  { href: "/guide#families", Icon: HomeIcon, title: "가족·보호자 안내", text: "가족을 찾는 절차를 확인하고 싶어요" },
];
const FEATURES = [
  { Icon: LayersIcon, title: "원본 사진과 정보 확인", text: "등록된 사진과 실종 정보를 살펴보고, 상세 화면에서 다른 사진도 선택해 볼 수 있어요." },
  { Icon: SearchIcon, title: "기억나는 단서로 검색", text: "이름을 몰라도 성별, 실종 지역, 연도, 당시 나이로 범위를 좁혀 찾을 수 있어요." },
  { Icon: PhoneIcon, title: "공식 제보 방법 안내", text: "기억나는 단서를 정리하고, 경찰청 182·안전Dream에 전달하는 방법을 확인할 수 있어요." },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={`page-container ${styles.container}`}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}><span aria-hidden="true" />서비스 소개</p>
          <h1>기억을 잇고, 다시 만날 수 있도록.</h1>
          <p className={styles.description}>시간이 흘러도, 기다림은 이어집니다. 작은 관심과 오래된 기억이 가족을 잇는 단서가 됩니다.</p>
          <Link href="/search" className={styles.primary}>실종아동 정보 찾아보기 <ArrowRightIcon size={16} /></Link>
        </header>

        <nav className={styles.guideLinks} aria-label="상황별 안내">
          {QUICK_LINKS.map(({ href, Icon, title, text }) => (
            <Link key={href} href={href}>
              <Icon size={22} className={styles.guideIcon} />
              <span><strong>{title}</strong><small>{text}</small></span>
              <ArrowUpRightIcon size={16} className={styles.linkArrow} />
            </Link>
          ))}
        </nav>

        <section className={styles.features} aria-labelledby="features-title">
          <p className={styles.eyebrow}>주요 기능</p>
          <h2 id="features-title">FindUs는 이렇게 도와요</h2>
          <p className={styles.description}>기억 속 얼굴을 살펴보는 일부터, 작은 단서를 전하는 일까지 함께합니다.</p>
          <ul className={styles.featureList}>
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title}>
                <span className={styles.featureIcon} aria-hidden="true"><Icon size={23} /></span>
                <div className={styles.featureCopy}><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ul>
          <p className={styles.aiNote}>AI 예상 모습은 준비 중입니다. 현재는 등록된 원본 사진과 실종 정보를 제공합니다.</p>
        </section>

        <section id="service-info" aria-labelledby="service-info-title" className={styles.serviceInfo}>
          <h2 id="service-info-title">서비스 정보</h2>
          <ServiceInfoContent />
        </section>
      </div>
    </main>
  );
}
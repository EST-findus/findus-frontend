import Image from "next/image";
import styles from "./InfoPages.module.css";

type InfoHeroProps = {
  eyebrow: string;
  title: string;
  /** 제목 둘째 줄, 브랜드 블루로 강조 */
  accent: string;
  description: React.ReactNode;
  image: string;
  /** 사진 속 인물이 글 쪽에 있으면 좌우를 뒤집어 오른쪽으로 보낸다 */
  flip?: boolean;
  imagePosition?: string;
};

/** 정보 마당·이용 안내의 첫 화면. /search 캠페인 카드와 같은 톤으로, 사진은 오른쪽에 은은하게 깐다. */
export default function InfoHero({ eyebrow, title, accent, description, image, flip = false, imagePosition = "center" }: InfoHeroProps) {
  return (
    <header className={`page-container max-w-5xl ${styles.heroWrap}`}>
      <section className={styles.hero} aria-labelledby="info-hero-title">
        <div aria-hidden="true" className={`${styles.heroVisual} ${flip ? styles.flip : ""}`}>
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 680px, 100vw" style={{ objectPosition: imagePosition }} />
        </div>
        <div aria-hidden="true" className={styles.heroVeil} />
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}><span aria-hidden="true" />{eyebrow}</p>
          <h1 id="info-hero-title">{title}<br /><span>{accent}</span></h1>
          <p>{description}</p>
        </div>
        <span className={styles.heroNote}>AI로 제작한 캠페인 이미지</span>
      </section>
    </header>
  );
}

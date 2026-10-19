"use client";

import Image from "next/image";
import type { MissingPerson } from "@/lib/types";
import { formatDate, formatGender } from "@/lib/format";
import FavoriteButton from "./FavoriteButton";
import { ArrowRightIcon, ShareIcon } from "./Icons";
import styles from "./PublicSearch.module.css";

type PersonAction = (person: MissingPerson, trigger: HTMLElement) => void;
export default function ChildComparisonCard({ person, onOpenDetail, onReport, onShare, className = "" }: { person: MissingPerson; onOpenDetail: PersonAction; onReport: PersonAction; onShare: PersonAction; className?: string }) {
  return <article className={`${styles.card} ${className}`} aria-labelledby={`public-person-${person.id}`}>
    <div className={styles.cardMain}>
      <header className={styles.cardTop}>
        <h3 id={`public-person-${person.id}`}>{person.name}<small>{formatGender(person.gender)}</small></h3>
        <FavoriteButton personId={person.id} name={person.name} />
      </header>
      <div className={styles.portraitPair}>
        <figure>
          <figcaption>실종 당시 모습</figcaption>
          <button type="button" className={styles.photo} aria-label={`${person.name} 상세정보 열기`} onClick={(event) => onOpenDetail(person, event.currentTarget)}><Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" /></button>
          <p>당시 <strong>{person.ageAtMissing}세</strong></p>
        </figure>
        <figure className={styles.aiPortrait}>
          <figcaption><span>AI</span> 예상 모습</figcaption>
          <button type="button" className={styles.photo} aria-label={`${person.name} 다른 AI 예상 모습 보기`} onClick={(event) => onOpenDetail(person, event.currentTarget)}><Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (가상 인물·AI 생성 예시, 실제 모습과 다를 수 있음)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" /></button>
          <p>현재 추정 <strong>{person.currentAge}세</strong></p>
        </figure>
      </div>
      <p className={styles.aiCaution}>AI 예상 · 실제 모습과 다를 수 있습니다.</p>
      <dl className={styles.cardFacts}><div><dt>실종 지역</dt><dd>{person.region}</dd></div><div><dt>실종 일자</dt><dd>{formatDate(person.missingDate)}</dd></div></dl>
    </div>
    <div className={styles.cardActions}><button type="button" onClick={(event) => onOpenDetail(person, event.currentTarget)}>상세정보 · 다른 예상 모습 보기<ArrowRightIcon size={15} /></button><button type="button" onClick={(event) => onReport(person, event.currentTarget)}>목격 제보 안내</button><button type="button" aria-label={`${person.name} 정보 공유하기`} aria-haspopup="dialog" onClick={(event) => onShare(person, event.currentTarget)}><ShareIcon size={18} /></button></div>
  </article>;
}

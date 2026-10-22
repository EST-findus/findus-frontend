"use client";

import Image from "next/image";
import StoredPhoto from "./StoredPhoto";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import { ArrowRightIcon, ArrowUpRightIcon, ScanFaceIcon, ShareIcon } from "./Icons";
import styles from "./PublicSearch.module.css";

type PersonAction = (person: MissingPerson, trigger: HTMLElement) => void;
interface Props {
  person: MissingPerson;
  onOpenDetail: PersonAction;
  onReport: PersonAction;
  onShare: PersonAction;
  className?: string;
  comparison?: boolean;
  actionVariant?: "default" | "home";
}

export default function ChildComparisonCard({ person, onOpenDetail, onReport, onShare, className = "", comparison = false, actionVariant = "default" }: Props) {
  const live = person.source === "api";
  const showComparison = comparison || !live;
  const hasAiPhoto = Boolean(person.photos.aged);
  const openDetail = (event: React.MouseEvent<HTMLButtonElement>) => onOpenDetail(person, event.currentTarget);

  return (
    <article className={`${styles.card} ${comparison ? styles.comparisonCard : ""} ${className}`} aria-labelledby={`public-person-${person.id}`}>
      <div className={styles.cardMain}>
        <header className={styles.cardTop}>
          <h3 id={`public-person-${person.id}`}>{person.name}<small>{formatGender(person.gender)}</small></h3>
          <FavoriteButton personId={person.id} name={person.name} />
        </header>
        <div className={styles.portraitPair} style={!showComparison ? { gridTemplateColumns: "minmax(0,1fr)", maxWidth: 260, marginInline: "auto", width: "100%" } : undefined}>
          <figure>
            <figcaption>{live ? "등록된 원본 사진" : "실종 당시 모습"}</figcaption>
            <button type="button" className={styles.photo} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
              {live ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} /> : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" />}
            </button>
            <p>당시 <strong>{formatAge(person.ageAtMissing)}</strong></p>
          </figure>
          {showComparison && <figure className={styles.aiPortrait}>
            <figcaption><span>AI</span> 예상 모습</figcaption>
            {hasAiPhoto ? (
              <button type="button" className={styles.photo} aria-label={`${person.name} 다른 AI 예상 모습 보기`} onClick={openDetail}>
                <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" />
              </button>
            ) : (
              <div className={`${styles.photo} ${styles.aiPending}`} role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
                <ScanFaceIcon size={36} strokeWidth={1.3} />
                <strong>AI 예상 모습 준비 중</strong>
                <span>생성된 이미지가 아직 없습니다</span>
              </div>
            )}
            <p>{live ? "현재 " : "현재 추정 "}<strong>{formatAge(person.currentAge)}</strong></p>
          </figure>}
        </div>
        <p className={styles.aiCaution}>{showComparison ? hasAiPhoto ? "AI 예상 · 실제 모습과 다를 수 있습니다." : "자료 출처: 경찰청 · AI 예상 모습은 준비 중입니다." : `자료 출처: 경찰청 · 현재 나이 ${formatAge(person.currentAge)}`}</p>
        <dl className={styles.cardFacts}>
          <div><dt>실종 지역</dt><dd>{person.region}</dd></div>
          <div><dt>실종 일자</dt><dd>{formatDate(person.missingDate)}</dd></div>
        </dl>
      </div>
      <div className={styles.cardActions}>
        <button type="button" onClick={openDetail}>{actionVariant === "home" ? "상세보기" : hasAiPhoto ? "상세정보 · 다른 예상 모습 보기" : "상세정보 · 사진 보기"}<ArrowRightIcon size={15} /></button>
        <button type="button" onClick={event => onReport(person, event.currentTarget)}>목격 제보 안내{actionVariant === "home" && <ArrowUpRightIcon size={14} />}</button>
        <button type="button" aria-label={`${person.name} 정보 공유하기`} aria-haspopup="dialog" onClick={event => onShare(person, event.currentTarget)}><ShareIcon size={18} /></button>
      </div>
    </article>
  );
}
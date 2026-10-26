"use client";

import Image from "next/image";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import StoredPhoto from "./StoredPhoto";
import { ArrowRightIcon, ChevronRightIcon, EyeIcon, ShareIcon, SparklesIcon } from "./Icons";
import styles from "./HomeChildCard.module.css";

type PersonAction = (person: MissingPerson, trigger: HTMLElement) => void;

/** 실종된 해부터 지금까지 지난 햇수. 나이로 먼저 계산하고, 없으면 실종 연도로 계산한다. */
function yearsApart(person: MissingPerson): number | null {
  if (person.currentAge !== null && person.ageAtMissing !== null) return Math.max(0, person.currentAge - person.ageAtMissing);
  const year = Number(person.missingDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? Math.max(0, new Date().getFullYear() - year) : null;
}

/**
 * 홈 '함께 찾고 있는 아이들' 카드. 위쪽 절반씩 실종 당시 사진과 AI 예상 모습을 나란히 두고,
 * 가운데에 헤어져 있던 햇수를 띄운다. 아래에는 이름, 지역·실종일, 상세보기·목격 제보·공유가 온다.
 */
export default function HomeChildCard({ person, onOpenDetail, onReport, onShare }: { person: MissingPerson; onOpenDetail: PersonAction; onReport: PersonAction; onShare: PersonAction }) {
  const live = person.source === "api";
  const hasAiPhoto = Boolean(person.photos.aged);
  const years = yearsApart(person);
  const missingYear = person.missingDate.slice(0, 4);
  const openDetail = (event: React.MouseEvent<HTMLButtonElement>) => onOpenDetail(person, event.currentTarget);

  return (
    <article className={styles.card} aria-labelledby={`home-child-${person.id}`}>
      <div className={styles.media}>
        <button type="button" className={styles.past} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
          {live
            ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />
            : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />}
          <span className={`${styles.badge} ${styles.badgeLeft}`}>{missingYear}년 · {formatAge(person.ageAtMissing)}</span>
        </button>

        {hasAiPhoto ? (
          <button type="button" className={styles.aged} aria-label={`${person.name} AI 예상 모습 보기`} onClick={openDetail}>
            <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />
            <span className={styles.aiChip}><SparklesIcon size={12} strokeWidth={2.2} />AI 예상</span>
            <span className={`${styles.badge} ${styles.badgeRight}`}>현재 · {formatAge(person.currentAge)}</span>
          </button>
        ) : (
          <div className={`${styles.aged} ${styles.pending}`} role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
            <span aria-hidden="true" className={styles.pendingRing} />
            <span className={styles.aiChipSoft}><SparklesIcon size={12} strokeWidth={2.2} />AI 예상</span>
            <strong>지금 {formatAge(person.currentAge)}의 모습을<br />그리고 있어요</strong>
            <span className={styles.pendingSub}>곧 공개됩니다</span>
          </div>
        )}

        {years !== null && <span className={styles.years} aria-label={`${years}년째 기다리는 중`}>{years}년 <ArrowRightIcon size={13} strokeWidth={2.4} /></span>}
        <div className={styles.favorite}><FavoriteButton personId={person.id} name={person.name} variant="icon" /></div>
      </div>

      <div className={styles.body}>
        <h3 id={`home-child-${person.id}`} className={styles.name}>{person.name}<small>{formatGender(person.gender)}</small></h3>
        <p className={styles.meta}>{person.region} · {formatDate(person.missingDate)} 실종</p>
        <div className={styles.actions}>
          <button type="button" className={styles.detail} onClick={openDetail}>상세보기 <ChevronRightIcon size={16} strokeWidth={2.4} /></button>
          <span className={styles.iconActions}>
            <button type="button" aria-label={`${person.name} 목격 제보 안내`} title="목격 제보 안내" aria-haspopup="dialog" onClick={event => onReport(person, event.currentTarget)}><EyeIcon size={20} /></button>
            <button type="button" aria-label={`${person.name} 정보 공유하기`} title="공유하기" aria-haspopup="dialog" onClick={event => onShare(person, event.currentTarget)}><ShareIcon size={19} /></button>
          </span>
        </div>
      </div>
      <p className={styles.note}>출처: 경찰청 · AI 예상 이미지는 실제 모습과 다를 수 있습니다</p>
    </article>
  );
}

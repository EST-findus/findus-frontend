"use client";

import { useState } from "react";
import Image from "next/image";
import { formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import DetailModal from "./DetailModal";
import ReportGuideModal from "./ReportGuideModal";
import StoredPhoto from "./StoredPhoto";
import { ArrowRightIcon, ScanFaceIcon } from "./Icons";
import styles from "./HomeFeaturedChild.module.css";

const MegaphoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

// A small version of the home list card for one randomly picked child in the hero:
// name, the original photo next to the AI estimate, and a report button.
export default function HomeFeaturedChild({ person }: { person: MissingPerson }) {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [detail, setDetail] = useState(false);
  const [report, setReport] = useState(false);
  const live = person.source === "api";
  const hasAiPhoto = Boolean(person.photos.aged);
  const openDetail = (event: React.MouseEvent<HTMLButtonElement>) => { setTrigger(event.currentTarget); setDetail(true); };

  return (
    <article className={styles.card} aria-labelledby="home-featured-name">
      <header className={styles.top}>
        <p className={styles.label}><span aria-hidden="true" />지금 함께 찾고 있는 아이</p>
        <p className={styles.source}>자료 출처: 경찰청</p>
      </header>
      <h2 id="home-featured-name" className={styles.name}>{person.name}<small>{formatGender(person.gender)}</small></h2>
      <div className={styles.photos}>
        <button type="button" className={styles.photo} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
          {live
            ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} sizes="120px" />
            : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="120px" />}
          <span className={styles.tag}>원본</span>
        </button>
        <span aria-hidden="true" className={styles.arrow}><ArrowRightIcon size={15} /></span>
        {hasAiPhoto ? (
          <button type="button" className={styles.photo} aria-label={`${person.name} AI 예상 모습 보기`} onClick={openDetail}>
            <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="120px" />
            <span className={`${styles.tag} ${styles.tagAi}`}>AI 예상</span>
          </button>
        ) : (
          <div className={`${styles.photo} ${styles.pending}`} role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
            <ScanFaceIcon size={20} strokeWidth={1.5} />
            <span>AI 준비 중</span>
            <span className={`${styles.tag} ${styles.tagAi}`}>AI 예상</span>
          </div>
        )}
      </div>
      <button type="button" className={styles.report} aria-haspopup="dialog" onClick={event => { setTrigger(event.currentTarget); setReport(true); }}>
        <MegaphoneIcon />제보하기
      </button>

      {detail && <DetailModal person={person} returnFocusTo={trigger} onClose={() => setDetail(false)} onReport={() => { setDetail(false); setReport(true); }} />}
      {report && <ReportGuideModal person={person} returnFocusTo={trigger} onClose={() => setReport(false)} />}
    </article>
  );
}

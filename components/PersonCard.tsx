"use client";

import { useState } from "react";
import { formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon, ShareIcon } from "./Icons";
import PhotoFrame from "./PhotoFrame";
import StyleTabs from "./StyleTabs";

interface PersonCardProps {
  person: MissingPerson;
  onOpenDetail: (person: MissingPerson, trigger: HTMLElement) => void;
  onReport: (person: MissingPerson, trigger: HTMLElement) => void;
  onShare: (person: MissingPerson, trigger: HTMLElement) => void;
}

const SIZES = "(min-width: 1024px) 180px, 30vw";
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function PersonCard({ person, onOpenDetail, onReport, onShare }: PersonCardProps) {
  const [styleIndex, setStyleIndex] = useState(0);
  const style = person.photos.styles[styleIndex];
  const openDetail = (e: React.MouseEvent<HTMLButtonElement>) =>
    onOpenDetail(person, e.currentTarget);
  const frameLabel = `${person.name} 상세정보 열기`;
  const missingYear = person.missingDate.slice(0, 4);

  const columns = [
    {
      title: "실종 당시 원본",
      sub: `만 ${person.ageAtMissing}세 · ${missingYear}년`,
      src: person.photos.past,
      alt: `${person.name} 실종 당시 사진`,
      badge: "실종 당시",
      ai: false,
    },
    {
      title: "AI 예상 모습",
      sub: `추정 ${person.currentAge}세 · 현재 기준`,
      src: person.photos.aged,
      alt: `${person.name} AI 예상 현재 모습`,
      badge: "AI 예상",
      ai: true,
    },
    {
      title: "스타일 변형",
      sub: `${style.label} · 추정 ${person.currentAge}세`,
      src: style.src,
      alt: `${person.name} AI 스타일 변형 (${style.label})`,
      badge: "AI 예상",
      ai: true,
    },
  ];

  return (
    <article
      aria-labelledby={`person-${person.id}`}
      className="flex flex-col rounded-2xl border border-line bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover max-sm:p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={`person-${person.id}`}
            className="text-[21px] leading-tight font-extrabold tracking-[-0.01em] max-sm:text-[19px]"
          >
            {person.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold text-muted">
            당시 {person.ageAtMissing}세
            <ArrowRightIcon size={14} strokeWidth={2.2} className="text-subtle" />
            <span className="font-bold text-brand">현재 추정 {person.currentAge}세</span>
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-[12px] font-semibold text-muted">
          {missingYear}년 실종
        </span>
      </header>

      <div className="mt-5 grid grid-cols-3 gap-3 max-sm:mt-4 max-sm:gap-2">
        {columns.map((col) => (
          <figure key={col.title} className="min-w-0">
            <PhotoFrame
              src={col.src}
              alt={col.alt}
              sizes={SIZES}
              badge={col.badge}
              ai={col.ai}
              ariaLabel={frameLabel}
              onClick={openDetail}
            />
            <figcaption className="mt-2 break-keep">
              <span className="block text-[13.5px] font-bold max-sm:text-[12.5px]">{col.title}</span>
              <span className="block text-[12px] text-muted max-sm:text-[11.5px]">{col.sub}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <StyleTabs
        name={person.name}
        styles={person.photos.styles}
        value={styleIndex}
        onChange={setStyleIndex}
        className="mt-4"
      />

      <dl className="mt-5 grid grid-cols-[68px_1fr] gap-x-3 gap-y-2 rounded-xl bg-surface px-4 py-3.5 text-[14px] leading-normal max-sm:mt-4">
        <dt className="text-muted">실종 일자</dt>
        <dd className="font-semibold">{formatDate(person.missingDate)}</dd>
        <dt className="text-muted">실종 지역</dt>
        <dd className="font-semibold break-keep">{person.missingLocation}</dd>
        <dt className="text-muted">성별</dt>
        <dd className="font-semibold">{formatGender(person.gender)}</dd>
      </dl>

      <div className="mt-auto grid grid-cols-[1fr_1fr_auto] gap-2.5 pt-5 text-[15px] font-bold max-sm:gap-2 max-sm:pt-4">
        <button
          type="button"
          onClick={openDetail}
          className={`group flex h-12 items-center justify-center gap-1 rounded-xl border border-line bg-card transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
        >
          상세정보 보기
          <ArrowRightIcon
            size={16}
            strokeWidth={2.2}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </button>
        <button
          type="button"
          onClick={(e) => onReport(person, e.currentTarget)}
          className={`flex h-12 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
        >
          목격 제보하기
        </button>
        <button
          type="button"
          onClick={(e) => onShare(person, e.currentTarget)}
          aria-haspopup="dialog"
          aria-label={`${person.name} 정보 공유하기`}
          title="공유하기"
          className={`flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
        >
          <ShareIcon size={19} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

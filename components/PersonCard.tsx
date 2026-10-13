"use client";

import { useState } from "react";
import { formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon } from "./Icons";
import PhotoFrame from "./PhotoFrame";
import StyleTabs from "./StyleTabs";

interface PersonCardProps {
  person: MissingPerson;
  onOpenDetail: (person: MissingPerson, trigger: HTMLElement) => void;
}

const SIZES = "(min-width: 1024px) 170px, 30vw";

export default function PersonCard({ person, onOpenDetail }: PersonCardProps) {
  const [styleIndex, setStyleIndex] = useState(0);
  const style = person.photos.styles[styleIndex];
  const openDetail = (e: React.MouseEvent<HTMLButtonElement>) =>
    onOpenDetail(person, e.currentTarget);
  const frameLabel = `${person.name} 상세정보 열기`;

  const columns = [
    {
      title: "실종 당시 원본",
      sub: `만 ${person.ageAtMissing}세 · ${person.missingDate.slice(0, 4)}년`,
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
      className="flex flex-col rounded-2xl border border-line bg-card p-5 shadow-card transition duration-200 hover:shadow-card-hover max-sm:p-4"
    >
      <span className="mb-3 self-start rounded-md border border-line px-2 py-0.5 text-[11.5px] font-semibold text-muted">
        AI 연령 변환 · 사진 3장 비교
      </span>

      <div className="grid grid-cols-3 gap-2.5 max-sm:gap-2">
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
              <span className="block text-[13px] font-bold">{col.title}</span>
              <span className="block text-[11.5px] text-muted">{col.sub}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <StyleTabs
        name={person.name}
        styles={person.photos.styles}
        value={styleIndex}
        onChange={setStyleIndex}
        className="mt-3"
      />
      <p className="mt-2 text-[11.5px] break-keep text-subtle">
        AI 예상 얼굴은 실제 모습과 다를 수 있어요. 참고용으로만 봐 주세요.
      </p>

      <div className="mt-4 flex flex-1 flex-col border-t border-line pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 id={`person-${person.id}`} className="min-w-0 text-[18px] font-extrabold">
            {person.name}
          </h3>
          <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-brand">
            실종 당시 {person.ageAtMissing}세
          </span>
        </div>
        <dl className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 text-[13.5px]">
          <dt className="text-muted">실종 일자</dt>
          <dd className="font-medium">{formatDate(person.missingDate)}</dd>
          <dt className="text-muted">실종 지역</dt>
          <dd className="font-medium break-keep">{person.missingLocation}</dd>
          <dt className="text-muted">성별</dt>
          <dd className="font-medium">{formatGender(person.gender)}</dd>
        </dl>
      </div>

      <button
        type="button"
        onClick={openDetail}
        className="group mt-4 flex items-center justify-between rounded-lg border-t border-line px-1 pt-3.5 text-[14px] font-bold transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        상세정보 보기
        <ArrowRightIcon
          size={17}
          strokeWidth={2.2}
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </button>
    </article>
  );
}

"use client";

import Image from "next/image";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import StoredPhoto from "./StoredPhoto";
import { ArrowRightIcon, EyeIcon, ShareIcon, SparklesIcon } from "./Icons";

const PinGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
const CalendarGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

type PersonAction = (person: MissingPerson, trigger: HTMLElement) => void;

// Home "함께 찾고 있는 아이들" card, in the site palette: 공공 블루 #3978B8, 라이트 블루 #EAF2F9, 웜 코랄 #F28B82, white.
// Photo pair, edge to edge, split down the middle by a thin white line.
const photo = "relative block cursor-pointer overflow-hidden border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand [&_img]:[transition:transform_.6s_cubic-bezier(.2,.7,.2,1)] hover:[&_img]:[transform:scale(1.05)] motion-reduce:[&_img]:[transition:none] motion-reduce:hover:[&_img]:[transform:none]";
const badge = "absolute bottom-2.5 z-1 rounded-full bg-[rgba(23,32,48,.72)] px-2.5 py-1 text-[12px] font-bold tracking-[-.1px] whitespace-nowrap text-white backdrop-blur-[4px]";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
// Body: name with a gender chip, two fact cells, then one primary action and two quiet icon buttons.
const iconButton = `grid size-10 cursor-pointer place-items-center rounded-[11px] border border-[#E3EAF3] bg-white text-[#3D5877] [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease] hover:border-[#BFD3EC] hover:bg-brand-soft hover:text-brand motion-reduce:[transition:none] ${focusRing}`;
const factCell = "min-w-0 px-3 py-[9px]";
const factTerm = "flex items-center gap-1 text-[11px] font-bold text-[#7A8BA0] [&_svg]:flex-none [&_svg]:text-brand";
const factValue = "mt-0.5 truncate text-[14px] font-extrabold tracking-[-.2px] text-brand-dark tabular-nums";

/** 실종된 해부터 지금까지 지난 햇수. 나이로 먼저 계산하고, 없으면 실종 연도로 계산한다. */
export function yearsApart(person: MissingPerson): number | null {
  if (person.currentAge !== null && person.ageAtMissing !== null) return Math.max(0, person.currentAge - person.ageAtMissing);
  const year = Number(person.missingDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? Math.max(0, new Date().getFullYear() - year) : null;
}

/**
 * 홈 '함께 찾고 있는 아이들' 카드. 위쪽 절반씩 실종 당시 사진과 AI 예상 모습을 나란히 두고,
 * 가운데에 헤어져 있던 햇수를 띄운다. 아래에는 이름·성별, 실종 지역·일자 칸, 상세보기·목격 제보·공유가 온다.
 */
export default function HomeChildCard({ person, onOpenDetail, onReport, onShare, feature = false }: { person: MissingPerson; onOpenDetail: PersonAction; onReport: PersonAction; onShare: PersonAction; feature?: boolean }) {
  const live = person.source === "api";
  const hasAiPhoto = Boolean(person.photos.aged);
  const years = yearsApart(person);
  const missingYear = person.missingDate.slice(0, 4);
  const openDetail = (event: React.MouseEvent<HTMLButtonElement>) => onOpenDetail(person, event.currentTarget);

  return (
    <article className={`flex h-full flex-col overflow-hidden border border-[#E3EAF3] bg-white [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,border-color_.25s_ease] hover:border-[#C9DAEE] motion-reduce:[transition:none] ${feature ? "rounded-3xl shadow-[0_18px_40px_rgba(23,59,112,.1)]" : "rounded-[20px] shadow-[0_2px_10px_rgba(23,59,112,.05)] hover:[transform:translateY(-4px)] hover:shadow-[0_18px_36px_rgba(23,59,112,.11)] motion-reduce:hover:[transform:none]"}`} aria-labelledby={`home-child-${person.id}`}>
      <div className={`relative grid grid-cols-[1fr_1fr] gap-0.5 bg-white ${feature ? "h-[340px] max-sm:h-[240px]" : "h-[232px] max-sm:h-[208px]"}`}>
        <button type="button" className={`${photo} bg-[#E6EBF1]`} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
          {live
            ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />
            : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />}
          <span className={`${badge} left-2.5`}>{missingYear}년 · {formatAge(person.ageAtMissing)}</span>
        </button>

        {hasAiPhoto ? (
          <button type="button" className={`${photo} bg-brand-soft`} aria-label={`${person.name} AI 예상 모습 보기`} onClick={openDetail}>
            <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="(min-width: 1100px) 200px, (min-width: 640px) 25vw, 50vw" />
            <span className="absolute top-2.5 left-2.5 z-1 inline-flex items-center gap-1 rounded-[7px] bg-brand px-[9px] py-1 text-[11.5px] font-extrabold text-white"><SparklesIcon size={12} strokeWidth={2.2} />AI 예상</span>
            <span className={`${badge} right-2.5`}>현재 · {formatAge(person.currentAge)}</span>
          </button>
        ) : (
          <div className="relative flex cursor-default flex-col items-center justify-center gap-1.5 overflow-hidden bg-brand-soft px-3 pt-4 pb-[34px] text-center" role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-[62px] left-1/2 -ml-[66px] size-[132px] animate-home-ring-turn rounded-full border-2 border-dashed border-[#BFD3EC] motion-reduce:animate-none" />
            <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#BFD3EC] bg-white px-[9px] py-[3px] text-[11.5px] font-extrabold text-brand"><SparklesIcon size={12} strokeWidth={2.2} />AI 예상</span>
            <strong className="mt-1 text-[14.5px] leading-[1.4] font-extrabold tracking-[-.3px] break-keep text-brand-dark">지금 {formatAge(person.currentAge)}의 모습을<br />그리고 있어요</strong>
            <span className="text-[12px] text-muted">곧 공개됩니다</span>
          </div>
        )}

        {years !== null && <span className="pointer-events-none absolute top-1/2 left-1/2 z-2 inline-flex -translate-1/2 items-center gap-[3px] rounded-full bg-white px-[13px] py-[7px] text-[13px] font-extrabold whitespace-nowrap text-brand-dark shadow-[0_6px_16px_rgba(23,59,112,.18)]" aria-label={`${years}년째 기다리는 중`}>{years}년 <ArrowRightIcon size={13} strokeWidth={2.4} className="text-[#F28B82]" /></span>}
        <div className="absolute top-2.5 right-2.5 z-2"><FavoriteButton personId={person.id} name={person.name} variant="icon" /></div>
      </div>

      <div className={`flex flex-1 flex-col ${feature ? "px-[26px] pt-[22px] pb-5 max-sm:px-[18px] max-sm:pt-4 max-sm:pb-3.5" : "px-[18px] py-4 max-sm:px-4 max-sm:pt-3.5 max-sm:pb-2.5"}`}>
        {feature && years !== null && <p className="mb-2 inline-flex items-center gap-[7px] text-[13px] font-extrabold text-[#B4473F]"><span aria-hidden="true" className="size-[7px] animate-home-dot-pulse rounded-full bg-[#F28B82] motion-reduce:animate-none" />{years}년째 기다리는 중</p>}
        <h3 id={`home-child-${person.id}`} className={`flex items-center gap-2 font-[850] tracking-[-.5px] text-brand-dark ${feature ? "text-[26px] max-sm:text-[22px]" : "text-[20px]"}`}>{person.name}<small className="rounded-full bg-[#F1F5FA] px-2 py-0.5 text-[11.5px] font-bold tracking-normal text-muted">{formatGender(person.gender)}</small></h3>
        {feature && person.features && person.features !== "정보 없음" && <p className="mt-2 line-clamp-2 text-[14px] leading-[1.65] break-keep text-[#4A5D75]">{person.features}</p>}
        {/* 실종 지역과 날짜를 같은 칸 모양으로 나란히 둔다. 모든 카드가 같은 자리에 같은 정보를 보여준다. */}
        <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#E7ECF2] bg-[#F9FAFC]">
          <div className={factCell}><dt className={factTerm}><PinGlyph />실종 지역</dt><dd className={factValue}>{person.region || "정보 없음"}</dd></div>
          <div className={`${factCell} border-l border-[#E7ECF2]`}><dt className={factTerm}><CalendarGlyph />실종 일자</dt><dd className={factValue}>{formatDate(person.missingDate)}</dd></div>
        </dl>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_40px_40px] items-center gap-2 pt-3.5">
          <button type="button" className={`group/detail flex h-10 cursor-pointer items-center justify-center gap-[5px] rounded-[11px] bg-brand-soft text-[14px] font-extrabold text-[#2F66A0] [transition:background-color_.2s_ease,color_.2s_ease] hover:bg-brand hover:text-white motion-reduce:[transition:none] ${focusRing}`} onClick={openDetail}>상세보기 <ArrowRightIcon size={15} strokeWidth={2.4} className="[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] group-hover/detail:[transform:translateX(3px)] motion-reduce:[transition:none]" /></button>
          <button type="button" className={iconButton} aria-label={`${person.name} 목격 제보 안내`} title="목격 제보 안내" aria-haspopup="dialog" onClick={event => onReport(person, event.currentTarget)}><EyeIcon size={19} /></button>
          <button type="button" className={iconButton} aria-label={`${person.name} 정보 공유하기`} title="공유하기" aria-haspopup="dialog" onClick={event => onShare(person, event.currentTarget)}><ShareIcon size={18} /></button>
        </div>
      </div>
      <p className={`border-t border-[#EEF2F7] pt-2.5 pb-3 text-[11.5px] text-[#7A8BA0] ${feature ? "px-[26px]" : "px-[18px] max-sm:px-4"}`}>출처: 경찰청 · AI 예상 이미지는 실제 모습과 다를 수 있습니다</p>
    </article>
  );
}

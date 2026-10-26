"use client";

import Image from "next/image";
import StoredPhoto from "./StoredPhoto";
import { logAiImageLoadFail } from "./AiStylePhoto";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import { ArrowRightIcon, ArrowUpRightIcon, ScanFaceIcon, ShareIcon } from "./Icons";

// 카드 머리의 관심 등록 버튼 크기
const TOP = "flex items-center justify-between gap-2.5 [&_:is(button,a)]:min-h-[34px] [&_:is(button,a)]:px-[9px] [&_:is(button,a)]:py-1.5 [&_:is(button,a)]:text-[12px] max-[640px]:[&_:is(button,a)]:min-h-9";
const PHOTO = "relative w-full cursor-pointer overflow-hidden rounded-[7px] [&_img]:object-cover [&_img]:object-center";
const ACTION = "flex cursor-pointer items-center gap-1.5 border";
const AGE_STRONG = "font-[750] text-[#345574]";
const FACT_VALUE = "font-[550] text-[#3d5877]";

// 일반 목록(실종아동 찾기)에서 쓰는 카드
const styles = {
  card: "overflow-hidden rounded-[15px] border border-[#e0e8f2] bg-white [transition:border-color_.18s,box-shadow_.18s] hover:border-[#adc6e5] hover:shadow-[0_5px_20px_#214b7a0a] motion-reduce:transition-none",
  main: "px-[18px] pt-[17px] pb-3.5 max-[800px]:p-3 max-[640px]:p-3.5",
  top: `${TOP} mb-3.5`,
  title: "flex items-center gap-[9px] text-[22px] font-extrabold tracking-[-.5px] max-[640px]:text-[21px]",
  gender: "text-[13px] font-medium text-subtle",
  pair: "grid grid-cols-[1fr_1fr] gap-3 rounded-[11px] bg-[#F7F9FC] max-[800px]:gap-2",
  figure: "min-w-0 p-2.5 max-[800px]:p-[7px] max-[640px]:p-2",
  caption: "mb-[7px] flex min-h-[22px] items-center gap-[5px] text-[12px] font-bold text-muted max-[640px]:text-[11px]",
  photo: `${PHOTO} block h-[215px] bg-transparent max-[800px]:h-[170px] max-[640px]:h-[185px]`,
  pending: `${PHOTO} flex h-[215px] flex-col items-center justify-center gap-2.5 border border-dashed border-[#cdd9e8] bg-[#edf1f7] p-3 text-center text-[#7a8da6] max-[800px]:h-[170px] max-[640px]:h-[185px] max-[640px]:gap-2 max-[640px]:p-2`,
  pendingTitle: "text-[13px] font-[650] break-keep text-[#647d9d] max-[640px]:text-[12px]",
  pendingText: "text-[11px] leading-[1.5] break-keep max-[640px]:text-[10px]",
  age: "mt-2 text-center text-[12px] leading-[1.5] text-[#6a7d93]",
  caution: "mt-2 mb-3 text-right text-[11px] leading-[1.6] text-subtle max-[640px]:text-[10px]",
  facts: "flex flex-wrap gap-x-6 gap-y-1 border-t border-[#edf1f6] pt-3 text-[13px] leading-[1.6] max-[640px]:gap-x-[17px] max-[640px]:text-[12px]",
  fact: "flex gap-[9px]",
  actions: "grid grid-cols-[1.3fr_1fr_40px] gap-2 px-[18px] pb-[17px] max-[800px]:grid-cols-[1fr_40px] max-[800px]:px-3 max-[800px]:pb-3 max-[640px]:grid-cols-[1fr_44px] max-[640px]:px-3.5 max-[640px]:pb-3.5",
  detail: `${ACTION} min-h-10 justify-center rounded-[7px] border-[#d9e5f4] bg-brand-soft text-[13px] font-[650] text-brand hover:border-[#a9c4e5] hover:bg-brand-soft max-[800px]:col-span-full max-[640px]:min-h-11`,
  report: `${ACTION} min-h-10 justify-center rounded-[7px] border-[#d9e5f4] bg-white text-[11px] font-[650] text-[#38618c] hover:border-[#a9c4e5] hover:bg-brand-soft max-[640px]:min-h-11 max-[640px]:text-[12px]`,
  share: `${ACTION} min-h-10 justify-center rounded-[7px] border-[#d9e5f4] bg-white text-[11px] font-[650] text-[#38618c] hover:border-[#a9c4e5] hover:bg-brand-soft max-[640px]:min-h-11 max-[640px]:text-[12px]`,
};


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
    <article className={`${styles.card} ${className}`} aria-labelledby={`public-person-${person.id}`}>
      <div className={styles.main}>
        <header className={styles.top}>
          <h3 id={`public-person-${person.id}`} className={styles.title}>{person.name}<small className={styles.gender}>{formatGender(person.gender)}</small></h3>
          <FavoriteButton personId={person.id} name={person.name} />
        </header>
        <div className={styles.pair} style={!showComparison ? { gridTemplateColumns: "minmax(0,1fr)", maxWidth: 260, marginInline: "auto", width: "100%" } : undefined}>
          <figure className={styles.figure}>
            <figcaption className={styles.caption}>{live ? "등록된 원본 사진" : "실종 당시 모습"}</figcaption>
            <button type="button" className={styles.photo} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
              {live ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} /> : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" />}
            </button>
            <p className={styles.age}>당시 <strong className={AGE_STRONG}>{formatAge(person.ageAtMissing)}</strong></p>
          </figure>
          {showComparison && <figure className={styles.figure}>
            <figcaption className={styles.caption}><span className="rounded bg-[#e6ebf1] px-[5px] py-px text-[10px]">AI</span> 예상 모습</figcaption>
            {hasAiPhoto ? (
              <button type="button" className={styles.photo} aria-label={`${person.name} 다른 AI 예상 모습 보기`} onClick={openDetail}>
                <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="(min-width: 1200px) 240px, (min-width: 640px) 23vw, 42vw" onError={() => logAiImageLoadFail(person.photos.aged, person.name)} />
              </button>
            ) : (
              <div className={styles.pending} role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
                <ScanFaceIcon size={36} strokeWidth={1.3} />
                <strong className={styles.pendingTitle}>AI 예상 모습 준비 중</strong>
                <span className={styles.pendingText}>생성된 이미지가 아직 없습니다</span>
              </div>
            )}
            <p className={styles.age}>{live ? "현재 " : "현재 추정 "}<strong className={AGE_STRONG}>{formatAge(person.currentAge)}</strong></p>
          </figure>}
        </div>
        <p className={styles.caution}>{showComparison ? hasAiPhoto ? "AI 예상 · 실제 모습과 다를 수 있습니다." : "자료 출처: 경찰청 · AI 예상 모습은 준비 중입니다." : `자료 출처: 경찰청 · 현재 나이 ${formatAge(person.currentAge)}`}</p>
        <dl className={styles.facts}>
          <div className={styles.fact}><dt className="text-subtle">실종 지역</dt><dd className={FACT_VALUE}>{person.region}</dd></div>
          <div className={styles.fact}><dt className="text-subtle">실종 일자</dt><dd className={FACT_VALUE}>{formatDate(person.missingDate)}</dd></div>
        </dl>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={openDetail} className={styles.detail}>{actionVariant === "home" || comparison ? "상세보기" : hasAiPhoto ? "상세정보 · 다른 예상 모습 보기" : "상세정보 · 사진 보기"}<ArrowRightIcon size={15} /></button>
        <button type="button" onClick={event => onReport(person, event.currentTarget)} className={styles.report}>목격 제보 안내{actionVariant === "home" && <ArrowUpRightIcon size={14} />}</button>
        <button type="button" aria-label={`${person.name} 정보 공유하기`} aria-haspopup="dialog" onClick={event => onShare(person, event.currentTarget)} className={styles.share}><ShareIcon size={18} /></button>
      </div>
    </article>
  );
}

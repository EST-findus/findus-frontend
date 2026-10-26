"use client";

import { useState } from "react";
import Image from "next/image";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import DetailModal from "./DetailModal";
import ReportGuideModal from "./ReportGuideModal";
import StoredPhoto from "./StoredPhoto";
import { ArrowRightIcon, ScanFaceIcon } from "./Icons";

const MegaphoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
// Hero mini card, in the same frosted style as the hero shortcut tiles. One tile column wide (the tile grid has an 8px gap),
// so its left edge lines up with the right column of tiles. The popup variant fills the popup instead.
const cardHero = "w-[max(220px,calc((100%-8px)/2))] animate-[home-rise_.8s_cubic-bezier(.2,.7,.2,1)_.4s_backwards] rounded-[18px] border border-white/85 bg-white/78 px-3 py-2.5 shadow-[inset_0_1px_0_#FFFFFF,0_12px_30px_rgba(23,59,112,.12)] backdrop-blur-[14px] backdrop-saturate-[1.1] hover:[transform:translateY(-3px)] hover:bg-white/88 hover:shadow-[inset_0_1px_0_#FFFFFF,0_18px_38px_rgba(23,59,112,.16)] max-[720px]:w-full max-[720px]:bg-white/88 motion-reduce:animate-none motion-reduce:hover:[transform:none]";
const cardBase = "text-brand-dark [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,background-color_.3s_ease] motion-reduce:[transition:none]";
// Calm motion: the name and photos settle in after the card, the arrow nudges now and then,
// and a slow light passes over the empty AI slot to suggest it is still being prepared.
const fadeUp = {
  name: "animate-[home-fade-up_.6s_cubic-bezier(.2,.7,.2,1)_.55s_backwards]",
  first: "animate-[home-fade-up_.6s_cubic-bezier(.2,.7,.2,1)_.65s_backwards]",
  third: "animate-[home-fade-up_.6s_cubic-bezier(.2,.7,.2,1)_.8s_backwards]",
};
const name = `flex items-baseline gap-1.5 font-extrabold tracking-[-.3px] text-brand-dark motion-reduce:animate-none ${fadeUp.name}`;
const nameSmall = "text-[12px] font-medium text-subtle";
const photoBase = "relative flex cursor-pointer overflow-hidden motion-reduce:animate-none";
const photoButton = `[&_img]:[transition:transform_.5s_cubic-bezier(.2,.7,.2,1)] hover:[&_img]:[transform:scale(1.05)] motion-reduce:[&_img]:[transition:none] motion-reduce:hover:[&_img]:[transform:none] ${focusRing}`;
const tag = "absolute bottom-1.5 z-1 rounded-full px-[7px] py-0.5 text-[10px] font-bold text-white";
const reportButton = `flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[#F6CDC9] bg-[#FFF7F6] font-extrabold text-[#D4675E] animate-[fade-in_.5s_ease_.95s_backwards] [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.25s_cubic-bezier(.2,.7,.2,1)] hover:border-[#D4675E] hover:bg-[#D4675E] hover:text-white hover:[transform:translateY(-1px)] [&_svg]:[transition:transform_.3s_cubic-bezier(.2,.7,.2,1)] hover:[&_svg]:[transform:rotate(-10deg)_scale(1.08)] motion-reduce:animate-none motion-reduce:[transition:none] motion-reduce:hover:[transform:none] motion-reduce:[&_svg]:[transition:none] motion-reduce:hover:[&_svg]:[transform:none] ${focusRing}`;
const factRow = "grid grid-cols-[72px_minmax(0,1fr)] gap-2.5 border-t border-[#EEF2F7] px-3.5 py-2 text-[13.5px] first:border-t-0 first:bg-brand-soft";
const factTerm = "font-semibold text-subtle";
const factValue = "font-bold break-keep text-brand-dark";

// A small version of the home list card for one randomly picked child:
// name, the original photo next to the AI estimate, and a report button.
// The "popup" variant is shown in the first-visit popup: larger photos, a few facts and a detail button.
export default function HomeFeaturedChild({ person, variant = "hero" }: { person: MissingPerson; variant?: "hero" | "popup" }) {
  const popup = variant === "popup";
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [detail, setDetail] = useState(false);
  const [report, setReport] = useState(false);
  const live = person.source === "api";
  const hasAiPhoto = Boolean(person.photos.aged);
  const openDetail = (event: React.MouseEvent<HTMLButtonElement>) => { setTrigger(event.currentTarget); setDetail(true); };
  const photoSize = popup ? "aspect-square h-auto rounded-[14px]" : "h-[84px] rounded-[10px] max-[720px]:h-[110px]";

  return (
    <article className={`${cardBase} ${popup ? "w-full" : cardHero}`} aria-labelledby="home-featured-name">
      <header className="flex items-center justify-between gap-2">
        {popup ? <h3 id="home-featured-name" className={`${name} m-0 text-[20px]`}>{person.name}<small className={nameSmall}>{formatGender(person.gender)}</small></h3> : <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand"><span aria-hidden="true" className="size-1.5 animate-home-dot-pulse rounded-full bg-[#F28B82] motion-reduce:animate-none" />지금 함께 찾고 있는 아이</p>}
        <p className="text-[10px] whitespace-nowrap text-[#8B9AAD]">자료 출처: 경찰청</p>
      </header>
      {!popup && <h2 id="home-featured-name" className={`${name} mx-0 mt-1 mb-1.5 text-[16px]`}>{person.name}<small className={nameSmall}>{formatGender(person.gender)}</small></h2>}
      <div className={`grid items-center ${popup ? "mt-3 grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)] gap-2.5" : "grid-cols-[minmax(0,1fr)_18px_minmax(0,1fr)] gap-1.5"}`}>
        <button type="button" className={`${photoSize} ${photoBase} bg-[#E6EFF9] ${photoButton} ${fadeUp.first}`} aria-label={`${person.name} 상세정보 열기`} onClick={openDetail}>
          {live
            ? <StoredPhoto fit="cover" urls={(person.images ?? []).map(image => image.url)} alt={`${person.name} 등록 사진`} sizes="120px" />
            : <Image src={person.photos.past} alt={`${person.name} 실종 당시 모습 (가상 인물·AI 생성 예시)`} fill sizes="120px" />}
          <span className={`${tag} left-1.5 bg-[rgba(23,59,112,.78)]`}>원본</span>
        </button>
        <span aria-hidden="true" className="flex animate-[fade-in_.5s_ease_.85s_backwards] justify-center text-brand motion-reduce:animate-none"><ArrowRightIcon size={15} className="animate-[home-nudge_2.8s_ease-in-out_1.6s_infinite] motion-reduce:animate-none" /></span>
        {hasAiPhoto ? (
          <button type="button" className={`${photoSize} ${photoBase} bg-[#E6EFF9] ${photoButton} ${fadeUp.third}`} aria-label={`${person.name} AI 예상 모습 보기`} onClick={openDetail}>
            <Image src={person.photos.aged} alt={`${person.name} AI 예상 모습 (실제 모습과 다를 수 있음)`} fill sizes="120px" />
            <span className={`${tag} right-1.5 bg-brand`}>AI 예상</span>
          </button>
        ) : (
          <div className={`${photoSize} ${photoBase} cursor-default flex-col items-center justify-center gap-1 border border-dashed border-[#C7D8EC] bg-[#EEF3F9] text-[#54708F] after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-110%] after:animate-[home-sweep_4.5s_ease-in-out_1.8s_infinite] after:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,.7)_50%,transparent_70%)] after:content-[''] motion-reduce:after:animate-none ${fadeUp.third}`} role="img" aria-label={`${person.name} AI 예상 모습 준비 중`}>
            <ScanFaceIcon size={20} strokeWidth={1.5} className="animate-[home-breathe_3.6s_ease-in-out_1.2s_infinite] motion-reduce:animate-none" />
            <span className={`font-bold ${popup ? "text-[12px]" : "text-[10.5px]"}`}>AI 준비 중</span>
            <span className={`${tag} right-1.5 bg-brand`}>AI 예상</span>
          </div>
        )}
      </div>
      {popup && (
        <dl className="mt-3.5 grid animate-[home-fade-up_.6s_cubic-bezier(.2,.7,.2,1)_.9s_backwards] gap-0 overflow-hidden rounded-xl border border-[#E3EAF3] motion-reduce:animate-none">
          <div className={factRow}><dt className={factTerm}>나이</dt><dd className="font-bold break-keep text-brand">당시 {formatAge(person.ageAtMissing)} · 현재 {formatAge(person.currentAge)}</dd></div>
          <div className={factRow}><dt className={factTerm}>실종 일자</dt><dd className={factValue}>{formatDate(person.missingDate)}</dd></div>
          <div className={factRow}><dt className={factTerm}>실종 지역</dt><dd className={factValue}>{person.missingLocation}</dd></div>
        </dl>
      )}
      {popup && <p className="mt-3 text-[13.5px] leading-[1.65] break-keep text-[#3D5877]">혹시 이 아이를 본 적이 있나요? 작은 기억도 다시 만남의 단서가 됩니다.</p>}
      <div className={popup ? "mt-3.5 grid grid-cols-2 gap-2" : undefined}>
        <button type="button" className={`${reportButton} ${popup ? "h-11 text-[14px]" : "mt-2 h-8 text-[12.5px]"}`} aria-haspopup="dialog" onClick={event => { setTrigger(event.currentTarget); setReport(true); }}>
          <MegaphoneIcon />제보하기
        </button>
        {popup && <button type="button" className={`flex h-11 animate-[fade-in_.5s_ease_.95s_backwards] cursor-pointer items-center justify-center gap-1 rounded-[10px] border border-brand bg-brand text-[14px] font-extrabold text-white [transition:background-color_.2s_ease,transform_.25s_cubic-bezier(.2,.7,.2,1)] hover:bg-[#2F66A0] hover:[transform:translateY(-1px)] motion-reduce:animate-none motion-reduce:hover:[transform:none] ${focusRing}`} aria-haspopup="dialog" onClick={openDetail}>상세정보 보기 <ArrowRightIcon size={14} /></button>}
      </div>

      {detail && <DetailModal person={person} returnFocusTo={trigger} onClose={() => setDetail(false)} onReport={() => { setDetail(false); setReport(true); }} />}
      {report && <ReportGuideModal person={person} returnFocusTo={trigger} onClose={() => setReport(false)} />}
    </article>
  );
}

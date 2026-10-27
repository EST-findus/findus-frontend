"use client";

import PersonPhotoGallery from "./PersonPhotoGallery";
import AiStylePhoto from "./AiStylePhoto";
import Image from "next/image";
import { useState } from "react";
import type { MissingPerson } from "@/lib/types";
import InfoRows from "./InfoRows";
import ShareModal from "./ShareModal";
import StyleTabs from "./StyleTabs";
import { ShareIcon } from "./Icons";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function MobilePersonDetail({ person, onReport, embedded = false }: { person: MissingPerson; onReport: (trigger: HTMLElement) => void; embedded?: boolean }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  if (person.source === 'api') return <div className={embedded ? 'space-y-4' : 'flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:hidden'}>
    <div data-favorite-api-body={embedded || undefined} className="grid gap-4 min-[600px]:grid-cols-2"><PersonPhotoGallery key={person.id} person={person} comparison={embedded}/><InfoRows compact person={person}/></div>
    {/* 관심 아동(embedded)은 위 비교 화면에 대표 AI 사진이 이미 있으므로, 모달에서만 AI 사진 탭을 보여준다. */}
    {!embedded && person.photos.aged && <AiStylePhoto key={person.id} person={person}/>}
    <div data-embedded-actions={embedded || undefined} className="mt-4 flex gap-3 border-t border-line pt-3"><button type="button" onClick={e=>onReport(e.currentTarget)} className="flex-1 rounded-xl bg-brand px-3 py-3 font-bold text-white">목격 제보 안내</button><button type="button" onClick={()=>setShareOpen(true)} className="flex-1 rounded-xl border border-line px-3 py-3 font-bold">링크 공유</button></div>
    {shareOpen && <ShareModal person={person} onClose={()=>setShareOpen(false)}/>}</div>;
  const choices = [{ label: "대표", src: person.photos.aged }, ...person.photos.styles];
  const selectedPhoto = choices[photoIndex];

  return (
    <div className={embedded ? "flex flex-1 flex-col" : "hidden min-h-0 flex-1 flex-col max-md:flex"}>
      <div data-embedded-body={embedded || undefined} className={embedded ? "flex flex-1 flex-col gap-4 pt-4 max-md:gap-1.5 max-md:pt-1.5 min-[600px]:grid min-[600px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[600px]:items-start md:gap-8" : "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-3"}>
        <div className={embedded ? "flex min-w-0 flex-col gap-2 max-md:gap-1.5" : "contents"}>
        <div className={embedded ? "mx-auto flex w-full max-w-80 justify-center gap-3" : "flex min-h-28 max-h-[30dvh] flex-1 justify-center gap-3"}>
          <figure data-embedded-photo={embedded || undefined} className={embedded ? "flex w-1/2 max-w-36 flex-col text-center max-md:max-w-[clamp(80px,calc(60dvh_-_364px),120px)] min-[600px]:max-md:max-w-28" : "flex min-h-0 w-1/2 max-w-40 flex-col text-center"}>
            <div className={embedded ? "relative aspect-3/4 w-full" : "relative min-h-0 flex-1"}>
              <Image src={person.photos.past} alt={`${person.name} 실종 당시 사진`} fill sizes="160px" className="rounded-lg object-contain" />
            </div>
            <figcaption className="mt-1 shrink-0 whitespace-nowrap text-[12px] font-bold max-sm:text-[10px]">실종 당시</figcaption>
          </figure>
          <figure data-embedded-photo={embedded || undefined} className={embedded ? "flex w-1/2 max-w-36 flex-col text-center max-md:max-w-[clamp(80px,calc(60dvh_-_364px),120px)] min-[600px]:max-md:max-w-28" : "flex min-h-0 w-1/2 max-w-40 flex-col text-center"}>
            <div className={embedded ? "relative aspect-3/4 w-full" : "relative min-h-0 flex-1"}>
              <Image src={selectedPhoto.src} alt={`${person.name} AI 예상 모습 (${selectedPhoto.label})`} fill sizes="160px" className="rounded-lg object-contain" />
            </div>
            <figcaption className="mt-1 shrink-0 whitespace-nowrap text-[12px] font-bold max-sm:text-[10px] text-brand">AI 예상 · {selectedPhoto.label}</figcaption>
          </figure>
        </div>
        <div data-embedded-style={embedded || undefined} className="flex shrink-0 justify-center">
          <StyleTabs name={person.name} styles={choices} value={photoIndex} onChange={setPhotoIndex} />
        </div>
        </div>
        <div className={embedded ? "flex min-w-0 flex-col gap-2 max-md:gap-1.5" : "contents"}>
        <div className={`shrink-0 border-t border-line pt-2 ${embedded ? "min-[600px]:border-t-0 min-[600px]:pt-0" : ""}`}>
          <div className={embedded ? "max-md:[&_dl]:text-[12px]" : ""}><InfoRows person={person} compact /></div>
        </div>
        <p data-embedded-note={embedded || undefined} className="shrink-0 border-l-2 border-brand/45 pl-2 text-[11px] leading-[1.4] break-keep text-muted"><span className="font-bold text-brand">AI 분석 안내 : </span>{person.aiNote}</p>
        </div>
      </div>
      <div data-embedded-actions={embedded || undefined} className={embedded ? "mt-4 border-t border-line pt-3 max-md:mt-2 max-md:pt-2" : "shrink-0 border-t border-line bg-card px-4 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"}>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3 text-[14px] font-bold">
          <button type="button" onClick={(event) => onReport(event.currentTarget)} className={`h-11 rounded-xl bg-brand text-white hover:bg-brand-dark ${FOCUS}`}>목격 제보하기</button>
          <button type="button" onClick={() => setShareOpen(true)} aria-haspopup="dialog" className={`flex h-11 items-center justify-center gap-2 rounded-xl border border-line hover:bg-surface ${FOCUS}`}><ShareIcon size={17} />공유하기</button>
        </div>
      </div>
      {shareOpen && <ShareModal person={person} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

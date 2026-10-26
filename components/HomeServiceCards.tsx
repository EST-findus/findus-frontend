"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "./Icons";
import DnaGuideButton from "./DnaGuideButton";
import { GuidePopup, type GuidePopupId } from "./GuideSteps";

// Hero shortcuts: frosted tiles over the campaign photo. Each tile carries one calm tone (--tone*)
// that only comes forward on hover: a tinted wash, a filled icon chip, and a soft light sweep.
const tone = {
  navy: "[--tone:#1F4B8A] [--tone-soft:#E3EAF5] [--tone-softer:#F1F5FB] [--tone-ring:rgba(31,75,138,.24)]",
  blue: "[--tone:#3978B8] [--tone-soft:#E1ECFB] [--tone-softer:#F0F6FE] [--tone-ring:rgba(57,120,184,.26)]",
  coral: "[--tone:#D4675E] [--tone-soft:#FDE8E6] [--tone-softer:#FEF4F3] [--tone-ring:rgba(212,103,94,.24)]",
  // DNA tile: a deeper coral, so it stays apart from the 혹시 나? tile next to it.
  gold: "[--tone:#C25A52] [--tone-soft:#FBE1DE] [--tone-softer:#FEF2F1] [--tone-ring:rgba(194,90,82,.24)]",
  violet: "[--tone:#4A56A6] [--tone-soft:#E6E8F7] [--tone-softer:#F3F4FC] [--tone-ring:rgba(74,86,166,.24)]",
};

const tile = [
  "group/tile relative isolate flex min-h-[68px] min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-[18px] border border-white/82 bg-white/74 py-[11px] pr-3 pl-[13px] text-left text-brand-dark",
  "shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(23,59,112,.04),0_10px_26px_rgba(23,59,112,.07)] backdrop-blur-[14px] backdrop-saturate-[1.1]",
  "[transition:transform_.35s_cubic-bezier(.2,.7,.2,1),background-color_.3s_ease,box-shadow_.35s_ease,border-color_.3s_ease]",
  "before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(130%_110%_at_0%_50%,var(--tone-softer),transparent_62%)] before:opacity-0 before:[transition:opacity_.35s_ease] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-0 after:-z-1 after:translate-x-[-120%] after:bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.75)_50%,transparent_65%)] after:[transition:translate_.9s_cubic-bezier(.2,.7,.2,1)] after:content-['']",
  "hover:[transform:translateY(-3px)] hover:border-[color:var(--tone-ring)] hover:bg-white/90 hover:shadow-[inset_0_1px_0_#FFFFFF,0_2px_4px_rgba(23,59,112,.05),0_18px_36px_rgba(23,59,112,.12)] hover:before:opacity-100 hover:after:translate-x-[120%] active:[transform:translateY(-1px)_scale(.99)]",
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand",
  "max-[720px]:min-h-[70px] max-[720px]:gap-2.5 max-[720px]:rounded-2xl max-[720px]:bg-white/88 max-[720px]:p-3",
  "motion-reduce:animate-none! motion-reduce:[transition:none] motion-reduce:before:[transition:none] motion-reduce:after:[transition:none] motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none] motion-reduce:hover:after:translate-x-[-120%]",
].join(" ");

// Tiles rise in one after another (the AI guide link last).
const tileInDelays = [
  "animate-[home-tile-in_.7s_cubic-bezier(.2,.7,.2,1)_.55s_backwards]",
  "animate-[home-tile-in_.7s_cubic-bezier(.2,.7,.2,1)_.63s_backwards]",
  "animate-[home-tile-in_.7s_cubic-bezier(.2,.7,.2,1)_.71s_backwards]",
  "animate-[home-tile-in_.7s_cubic-bezier(.2,.7,.2,1)_.79s_backwards]",
  "animate-[home-tile-in_.7s_cubic-bezier(.2,.7,.2,1)_.85s_backwards]",
];

const iconFill = "fill-current opacity-16 [transition:opacity_.35s_ease] group-hover/tile:opacity-30 motion-reduce:[transition:none]";

// Two-tone tile icons: a soft filled shape (`iconFill`) under a 1.8px line, both in the tile's tone colour.
function TileIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const SearchGlyph = () => (
  <TileIcon>
    <circle className={iconFill} cx="10.5" cy="10.5" r="6.5" stroke="none" />
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4 20 20" />
    <path d="M7.8 9.2a3 3 0 0 1 2.4-1.7" />
  </TileIcon>
);

const WitnessGlyph = () => (
  <TileIcon>
    <path className={iconFill} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="none" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </TileIcon>
);

const FamilyGlyph = () => (
  <TileIcon>
    <circle className={iconFill} cx="10" cy="8.5" r="3.8" stroke="none" />
    <path className={iconFill} d="M3.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2Z" stroke="none" />
    <circle cx="10" cy="8.5" r="3.8" />
    <path d="M3.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
    <path d="M17.2 4.6a2 2 0 1 1 2.8 1.8c-.6.3-1 .8-1 1.4v.4" />
    <circle cx="19" cy="10.6" r=".9" fill="currentColor" stroke="none" />
  </TileIcon>
);

const DnaGlyph = () => (
  <TileIcon>
    <path className={iconFill} d="M8 3c0 4.5 8 6.5 8 9s-8 4.5-8 9h8c0-4.5-8-6.5-8-9s8-4.5 8-9Z" stroke="none" />
    <path d="M8 3c0 4.5 8 6.5 8 9s-8 4.5-8 9" />
    <path d="M16 3c0 4.5-8 6.5-8 9s8 4.5 8 9" />
    <path d="M9.3 6.5h5.4M10.6 9.5h2.8M10.6 14.5h2.8M9.3 17.5h5.4" />
  </TileIcon>
);

const AiGlyph = () => (
  <TileIcon>
    <path className={iconFill} d="M11 3.5 12.9 9 18.5 11l-5.6 2L11 18.5 9.1 13 3.5 11l5.6-2Z" stroke="none" />
    <path d="M11 3.5 12.9 9 18.5 11l-5.6 2L11 18.5 9.1 13 3.5 11l5.6-2Z" />
    <path d="M18.5 15.5v4M16.5 17.5h4" />
  </TileIcon>
);

function TileBody({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return (
    <>
      <span aria-hidden="true" className="flex size-[42px] flex-[0_0_42px] items-center justify-center rounded-[14px] text-[color:var(--tone)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8),0_2px_6px_rgba(23,59,112,.06)] [background:linear-gradient(150deg,var(--tone-softer),var(--tone-soft))] [transition:background_.35s_ease,color_.35s_ease,transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease] group-hover/tile:text-white group-hover/tile:shadow-[0_6px_14px_var(--tone-ring)] group-hover/tile:[background:var(--tone)] group-hover/tile:[transform:scale(1.05)] max-[720px]:size-[38px] max-[720px]:basis-[38px] max-[720px]:rounded-xl motion-reduce:[transition:none]">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] leading-[1.3] font-bold text-[color:var(--tone)] opacity-78">{eyebrow}</span>
        <strong className="mt-[3px] overflow-hidden text-[15px] leading-[1.35] font-extrabold tracking-[-.3px] text-ellipsis whitespace-nowrap max-[720px]:text-[14px]">{title}</strong>
      </span>
      <span aria-hidden="true" className="flex size-6 flex-none items-center justify-center rounded-full text-[color:var(--tone)] opacity-45 [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),opacity_.3s_ease,background-color_.3s_ease] group-hover/tile:bg-[color:var(--tone-soft)] group-hover/tile:opacity-100 group-hover/tile:[transform:translateX(3px)] motion-reduce:[transition:none] max-[720px]:[[data-tile-grid]_&]:hidden"><ArrowRightIcon size={15} /></span>
    </>
  );
}

// The AI guide link under the hero's AI example, in the same tile style as the shortcuts.
export function HomeAiGuideLink() {
  return (
    <Link href="/help?tab=ai" className={`${tile} ${tone.violet} w-[min(100%,320px)] ${tileInDelays[4]} max-[720px]:w-full`}>
      <TileBody icon={<AiGlyph />} eyebrow="책임 있는 AI" title="AI 연구 안내" />
    </Link>
  );
}

// Four quick shortcuts that sit in the home hero, beside the AI age-progression example.
export default function HomeServiceCards() {
  const [activeGuide, setActiveGuide] = useState<GuidePopupId | null>(null);
  const guideTriggerRefs = useRef<Record<GuidePopupId, HTMLButtonElement | null>>({ know: null, me: null });

  return (
    <>
      <nav className="w-full max-w-[500px] animate-[fade-in_.9s_cubic-bezier(.2,.7,.2,1)_.45s_backwards] max-[1000px]:max-w-[560px] max-[720px]:max-w-none motion-reduce:animate-none!" aria-label="주요 서비스 바로가기">
        <p className="mb-2 ml-0.5 flex items-center gap-2 text-[13px] font-bold tracking-[-.1px] text-[#3D5877] before:h-0.5 before:w-4 before:rounded-[2px] before:bg-brand before:opacity-60 before:content-['']">어떤 도움이 필요하신가요?</p>
        <div className="grid grid-cols-2 gap-2" data-tile-grid>
          {/* 실종아동 찾기 화면으로 가서 검색창에 바로 커서를 둔다. */}
          <Link href="/search?focus=search" className={`${tile} ${tone.navy} ${tileInDelays[0]}`}>
            <TileBody icon={<SearchGlyph />} eyebrow="검색 바로가기" title="실종아동 검색" />
          </Link>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("know")}
            ref={(element) => { guideTriggerRefs.current.know = element; }}
            className={`${tile} ${tone.blue} ${tileInDelays[1]}`}
          >
            <TileBody icon={<WitnessGlyph />} eyebrow="목격·제보" title="이 사람을 알아요" />
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setActiveGuide("me")}
            ref={(element) => { guideTriggerRefs.current.me = element; }}
            className={`${tile} ${tone.coral} ${tileInDelays[2]}`}
          >
            <TileBody icon={<FamilyGlyph />} eyebrow="가족 찾기" title="혹시 나?" />
          </button>
          <DnaGuideButton className={`${tile} ${tone.gold} ${tileInDelays[3]}`}>
            <TileBody icon={<DnaGlyph />} eyebrow="본인·가족 찾기" title="DNA 검사·상담" />
          </DnaGuideButton>
        </div>
      </nav>

      {activeGuide && (
        <GuidePopup
          guideId={activeGuide}
          onClose={() => setActiveGuide(null)}
          returnFocusTo={guideTriggerRefs.current[activeGuide]}
        />
      )}
    </>
  );
}

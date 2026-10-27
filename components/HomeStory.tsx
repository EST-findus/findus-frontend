"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Nanum_Pen_Script } from "next/font/google";
import { CAMPAIGN, formatWon } from "@/lib/funding";
import { ArrowRightIcon, HeartIcon, PhoneIcon, SearchIcon, SparklesIcon, UsersIcon } from "./Icons";
import LogoMark from "./LogoMark";
import Modal from "./Modal";

// Handwritten accents only; the body text stays in the site font.
const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

const SERVICE_PAST = "/images/mock-persons/MC-2015-0104/past.jpg";
const SERVICE_AGED = "/images/mock-persons/MC-2015-0104/aged.jpg";
const POLAROID = "/images/mock-persons/MC-2001-0812/past.jpg";

type Section = { id: string; label: string; content: ReactNode };

// Each card and guide carries one tone (공공 블루 / 웜 코랄 / 네이비) through --tone*.
const toneBrand = "[--tone:#3978B8] [--tone-ink:#2F66A0] [--tone-soft:#EAF2F9] [--tone-line:#D4E3F2]";
const toneCoral = "[--tone:#D4675E] [--tone-ink:#B4473F] [--tone-soft:#FEF4F3] [--tone-line:#F6CDC9]";
const toneNavy = "[--tone:#25508F] [--tone-ink:#173B70] [--tone-soft:#EEF3FA] [--tone-line:#D2DEEC]";
// Home story cards (서비스 소개 · 후원 안내 · 함께하는 캠페인) and the two-pane guides they open.
const ui = {
  section: "page-container pt-18 pb-28 max-sm:pt-12 max-sm:pb-18",
  cards: "grid grid-cols-[minmax(0,1fr)] gap-22 [counter-reset:story] max-[1000px]:gap-16 max-[760px]:gap-13",
  // Section heading, in the same voice as the other home sections.
  storyHead: "mb-9",
  storyKicker: "inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-brand",
  storyTitle: "mt-3.5 text-[26px] leading-[1.35] font-extrabold tracking-[-.8px] break-keep text-brand-dark max-sm:text-[21px]",
  storyText: "mt-2.5 text-[14px] leading-[1.7] break-keep text-muted max-sm:text-[13px]",
  dot: "size-1.5 rounded-full bg-[#F28B82]",

  // No boxes: each story is a picture and its copy on the open page, the picture switching sides
  // from one story to the next, with a large faint number behind the copy.
  card: "group/card relative grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-16 p-0 text-left text-brand-dark [counter-increment:story] focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[12px] focus-visible:outline-brand max-[1000px]:gap-9 max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:gap-[22px]",
  cardService: toneBrand,
  cardSupport: toneCoral,
  // 03 · 함께하는 캠페인: in navy, with a short list of everyday places under the copy.
  cardCampaign: toneNavy,
  cardCopy: "relative isolate z-1 flex flex-col items-start px-0 py-3 after:pointer-events-none after:absolute after:-top-[46px] after:right-0 after:-z-1 after:text-[120px] after:leading-none after:font-black after:tracking-[-6px] after:text-[color:var(--tone-soft)] after:content-['0'_counter(story)] max-[1000px]:after:-top-[34px] max-[1000px]:after:text-[92px] max-[760px]:px-1 max-[760px]:py-0 max-[760px]:after:-top-5 max-[760px]:after:text-[72px]",
  cardLabel: "inline-flex items-center gap-2 rounded-full bg-[color:var(--tone-soft)] py-1.5 pr-3.5 pl-2.5 text-[14px] font-extrabold tracking-[.01em] text-[color:var(--tone-ink)] max-[760px]:py-[5px] max-[760px]:pr-3 max-[760px]:pl-[9px] max-[760px]:text-[13px]",
  cardIcon: "flex items-center justify-center text-[color:var(--tone)] [&_svg]:size-[18px]",
  cardTitle: "mt-4 text-[26px] leading-[1.4] font-[850] tracking-[-.5px] break-keep text-brand-dark max-[1000px]:text-[22px] max-[760px]:text-[20px]",
  cardText: "mt-2.5 max-w-[30em] text-[15px] leading-[1.85] break-keep text-muted max-[760px]:text-[14px]",
  cardTags: "mt-4 flex flex-wrap gap-1.5 max-sm:hidden",
  cardTag: "rounded-[7px] border border-[#E3EAF3] bg-[#F9FAFC] px-[9px] py-[3px] text-[11.5px] font-bold text-[#3D5877]",
  // Always follows the tags or the place list, so it keeps a fixed gap instead of margin-top: auto.
  cardMore: "mt-[26px] inline-flex items-center gap-1.5 rounded-full border border-[color:var(--tone)] px-3.5 py-2 text-[13px] font-extrabold text-[color:var(--tone-ink)] [transition:background-color_.2s_ease,color_.2s_ease] group-hover/card:bg-[color:var(--tone)] group-hover/card:text-white motion-reduce:[transition:none]",
  cardMoreIcon: "[transition:transform_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/card:[transform:translateX(3px)] motion-reduce:[transition:none]",

  // The picture beside each story: same height for all three, softly rounded, lifting a little on hover.
  picture: "relative order-[-1] m-0 h-[340px] min-h-0 self-stretch overflow-hidden rounded-3xl shadow-[0_18px_40px_rgba(23,59,112,.12)] [transition:transform_.45s_cubic-bezier(.2,.7,.2,1),box-shadow_.45s_ease] group-hover/card:[transform:translateY(-6px)] group-hover/card:shadow-[0_26px_52px_rgba(23,59,112,.16)] max-[1000px]:h-[280px] max-[760px]:h-[230px] max-[760px]:rounded-[20px] motion-reduce:[transition:none] motion-reduce:group-hover/card:[transform:none]",
  // Child and AI-aged halves of one face, framed like a scanner viewfinder, on a light-blue stage.
  splitFace: "bg-[#E6EFF9]",
  splitHalf: "absolute inset-0 [clip-path:inset(0_50%_0_0)]",
  splitRight: "absolute inset-0 [clip-path:inset(0_0_0_50%)]",
  zoomImage: "[transition:transform_.6s_cubic-bezier(.2,.7,.2,1)] group-hover/card:[transform:scale(1.05)] motion-reduce:[transition:none]",
  splitLine: "absolute inset-y-0 left-1/2 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(23,59,112,.08)]",
  scanCorners: "absolute inset-2.5 opacity-90 [background:linear-gradient(#FFFFFF,#FFFFFF)_top_left/16px_2px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_top_left/2px_16px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_top_right/16px_2px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_top_right/2px_16px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_bottom_left/16px_2px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_bottom_left/2px_16px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_bottom_right/16px_2px_no-repeat,linear-gradient(#FFFFFF,#FFFFFF)_bottom_right/2px_16px_no-repeat]",
  splitTag: "absolute bottom-3 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold text-white",
  splitTagLeft: "left-3.5 bg-[rgba(23,32,48,.68)]",
  splitTagRight: "right-3.5 bg-brand",
  // Story 02 puts its picture on the right (on top again once the stories stack).
  // A breakpoint variant so it outranks the picture's base order-[-1] on the same element.
  supportVisual: "min-[761px]:order-1",
  // Places the campaigns reach, as a dotted list: blue and coral dots in turn.
  campaignPlaces: "mt-[18px] flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] font-bold text-[#3D5877] max-sm:gap-x-3 max-sm:text-[12.5px]",
  campaignPlace: "inline-flex items-center gap-1.5 before:size-[5px] before:rounded-full before:bg-[color:var(--tone)] before:content-[''] even:before:bg-[#F28B82]",
  supportTag: "absolute right-4 bottom-4 z-1 rounded-full bg-white/90 px-[9px] py-[3px] text-[10.5px] font-extrabold tracking-[.02em] text-[#B4473F] shadow-[0_4px_10px_rgba(23,59,112,.1)]",

  // Guide sheet inside the bare modal.
  // Coral point: a few small warm marks in every guide sheet (section dots, the quote edge, the handwritten note
  // and the last 'hope' step), so the sheets stay blue but not cold.
  sheet: "grid min-h-full grid-cols-[232px_minmax(0,1fr)] text-[#1C2F4D] [--point:#F28B82] [--point-strong:#D4675E] [--point-ink:#B4473F] [--point-soft:#FDECEA] max-[760px]:grid-cols-[minmax(0,1fr)]",
  // Side navigation: a quiet reading guide. Steps sit on a thin line, the current one is filled with the tone,
  // steps already read keep a soft tint, and a progress bar shows how far the reader is.
  sheetNav: "border-r border-[#E6EDF5] bg-[#F7F9FC] max-[760px]:sticky max-[760px]:top-0 max-[760px]:z-20 max-[760px]:border-r-0 max-[760px]:border-b",
  sheetNavInner: "sticky top-0 flex min-h-[min(100%,100dvh)] flex-col pt-[30px] pr-[18px] pb-[22px] pl-[22px] max-[760px]:static max-[760px]:min-h-0 max-[760px]:pt-3.5 max-[760px]:pr-16 max-[760px]:pb-2.5 max-[760px]:pl-4",
  sheetNavEyebrow: "inline-flex items-center gap-[7px] text-[11px] font-extrabold tracking-[.1em] text-[color:var(--tone-ink)] max-[760px]:hidden",
  sheetNavTitle: "mt-2 text-[19px] font-[850] tracking-[-.5px] text-brand-dark max-[760px]:mb-2 max-[760px]:text-[15px]",
  sheetProgress: "mt-3.5 mb-[18px] flex items-center gap-2.5 max-[760px]:hidden",
  sheetProgressBar: "relative h-1 flex-1 overflow-hidden rounded-full bg-[#E3EAF3]",
  sheetProgressFill: "absolute inset-y-0 right-auto left-0 rounded-[inherit] bg-[color:var(--tone)] [transition:width_.45s_cubic-bezier(.2,.7,.2,1)] motion-reduce:[transition:none]",
  sheetProgressText: "text-[11.5px] text-[#7A8BA0] tabular-nums",
  sheetSteps: "relative grid gap-1 before:absolute before:top-[22px] before:bottom-[22px] before:left-6 before:w-0.5 before:rounded-[2px] before:bg-[#E3EAF3] before:content-[''] max-[760px]:flex max-[760px]:gap-1.5 max-[760px]:overflow-x-auto max-[760px]:[scrollbar-width:none] max-[760px]:before:hidden",
  sheetNavButton: "group/step relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-semibold [transition:background-color_.2s_ease,color_.2s_ease,box-shadow_.2s_ease] hover:bg-white aria-[current=true]:bg-white aria-[current=true]:font-extrabold aria-[current=true]:text-brand-dark aria-[current=true]:shadow-[0_4px_14px_rgba(23,59,112,.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-[760px]:gap-1.5 max-[760px]:rounded-full max-[760px]:border max-[760px]:border-line max-[760px]:bg-white max-[760px]:px-3 max-[760px]:py-[7px] max-[760px]:text-[12.5px] max-[760px]:whitespace-nowrap max-[760px]:aria-[current=true]:border-[color:var(--tone)] max-[760px]:aria-[current=true]:bg-[color:var(--tone)] max-[760px]:aria-[current=true]:text-white max-[760px]:aria-[current=true]:shadow-none motion-reduce:[transition:none]",
  // Steps already read keep their colour on hover.
  sheetNavButtonDone: "text-[#3D5877]",
  sheetNavButtonRest: "text-muted hover:text-brand-dark",
  sheetStep: "relative z-1 grid size-[30px] flex-none place-items-center rounded-full border-2 text-[11.5px] font-extrabold tabular-nums [transition:background-color_.25s_ease,border-color_.25s_ease,color_.25s_ease,transform_.25s_cubic-bezier(.2,.7,.2,1)] max-[760px]:size-auto max-[760px]:border-0 motion-reduce:[transition:none]",
  sheetStepDone: "border-[color:var(--tone-line)] bg-[color:var(--tone-soft)] text-[color:var(--tone-ink)]",
  sheetStepRest: "border-line bg-white text-[#7A8BA0] group-hover/step:border-[color:var(--tone-line)] group-aria-[current=true]/step:border-[color:var(--tone)] group-aria-[current=true]/step:bg-[color:var(--tone)] group-aria-[current=true]/step:text-white group-aria-[current=true]/step:[transform:scale(1.06)] group-aria-[current=true]/step:shadow-[0_0_0_4px_var(--tone-soft)] max-[760px]:bg-transparent max-[760px]:group-aria-[current=true]/step:bg-transparent max-[760px]:group-aria-[current=true]/step:[transform:none] max-[760px]:group-aria-[current=true]/step:shadow-none",
  sheetStepLabel: "min-w-0 break-keep",
  // Help line at the foot of the navigation.
  sheetHelp: "mt-7 flex items-center gap-2.5 rounded-[14px] border border-[#E3EAF3] bg-white p-3 text-brand-dark [transition:border-color_.2s_ease,box-shadow_.2s_ease] hover:border-[color:var(--tone-line)] hover:shadow-[0_8px_20px_rgba(23,59,112,.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-[760px]:hidden motion-reduce:[transition:none]",
  sheetHelpIcon: "grid size-8 flex-none place-items-center rounded-[10px] bg-[color:var(--tone-soft)] text-[color:var(--tone)]",
  sheetBody: "min-w-0",
  sheetSection: "scroll-mt-2 animate-home-rise border-b border-[#EEF2F7] px-12 pt-10 pb-9 first:bg-[linear-gradient(180deg,#F4F8FD_0%,#FFFFFF_70%)] first:pt-[52px] [&:nth-child(2)]:[animation-delay:.06s] max-[1000px]:px-8 max-[1000px]:pt-[34px] max-[1000px]:pb-[30px] max-[760px]:px-5 max-[760px]:pt-7 max-[760px]:pb-[26px] max-[760px]:first:pt-[30px] motion-reduce:animate-none",

  kicker: "flex items-center gap-[7px] text-[12px] font-bold tracking-[.02em] text-brand before:size-1.5 before:flex-none before:rounded-full before:bg-[color:var(--point)] before:content-['']",
  bigTitle: "mt-3 text-[30px] leading-[1.35] font-extrabold tracking-[-.9px] break-keep text-brand-dark max-[760px]:text-[23px]",
  midTitle: "mt-2 text-[22px] leading-[1.4] font-extrabold tracking-[-.5px] break-keep text-brand-dark max-[760px]:text-[19px]",
  lead: "mt-4 text-[16px] leading-[1.65] font-[650] break-keep text-brand",
  body: "mt-3 text-[14px] leading-[1.85] break-keep text-[#4A5D75]",
  note: "mt-3.5 text-[12.5px] leading-[1.7] break-keep text-[#6B7D93]",
  blockGap: "mt-[34px]",

  purpose: "grid grid-cols-[minmax(0,1fr)_230px] items-center gap-8 max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:gap-6",
  polaroid: "group/polaroid relative m-0 max-[760px]:w-[min(220px,70%)] max-[760px]:justify-self-center",
  polaroidFrame: "rounded-[4px] bg-white px-2.5 pt-2.5 pb-[34px] shadow-[0_18px_40px_rgba(23,59,112,.16),0_2px_6px_rgba(23,59,112,.08)] [transform:rotate(-5deg)] [transition:transform_.5s_cubic-bezier(.2,.7,.2,1)] group-hover/polaroid:[transform:rotate(-2deg)_translateY(-4px)] motion-reduce:[transition:none] motion-reduce:group-hover/polaroid:[transform:none]",
  polaroidPhoto: "relative aspect-[4/5] overflow-hidden bg-[#E6EFF9]",
  handNote: "mt-4 text-center text-[22px] leading-[1.3] break-keep text-[color:var(--point-ink)] [transform:rotate(-3deg)]",
  handNoteOnPhoto: "absolute right-3 bottom-3.5 left-3 z-1 m-0 text-center text-[20px] leading-[1.3] break-keep text-white [text-shadow:0_2px_8px_rgba(0,0,0,.35)] [transform:rotate(-3deg)]",

  // A short straight bar inside the card, in the guide's own tone, instead of a left border bent by the corner radius.
  quote: "relative mt-[30px] flex items-center gap-[18px] rounded-2xl border border-[#E1EAF5] bg-white px-6 py-5 shadow-[0_8px_22px_rgba(23,59,112,.06)] first:mt-0 max-[760px]:flex-col max-[760px]:items-start before:absolute before:top-[22%] before:bottom-[22%] before:left-0 before:w-[3px] before:rounded-r-[3px] before:bg-[color:var(--tone)] before:content-['']",
  quoteMark: "flex size-14 flex-none items-center justify-center border-r border-line pr-[18px] max-[760px]:border-r-0 max-[760px]:pr-0",
  quoteTitle: "block text-[17px] font-extrabold tracking-[-.3px] text-brand-dark",
  quoteText: "mt-1 block text-[13px] leading-[1.6] text-muted",

  features: "mt-[22px] grid grid-cols-2 gap-3 max-[760px]:grid-cols-[minmax(0,1fr)]",
  feature: "flex items-start gap-3.5 rounded-2xl border border-[#E6EDF5] bg-[#FBFCFE] p-[18px] [transition:transform_.3s_cubic-bezier(.2,.7,.2,1),border-color_.25s_ease,box-shadow_.3s_ease] hover:[transform:translateY(-2px)] hover:border-[#C9DAEE] hover:shadow-[0_10px_24px_rgba(23,59,112,.07)] motion-reduce:[transition:none] motion-reduce:hover:[transform:none]",
  featureIcon: "flex size-[42px] flex-[0_0_42px] items-center justify-center rounded-[13px] bg-[linear-gradient(150deg,#F1F6FE,#E1ECFB)] text-brand",
  featureTitle: "block text-[15px] font-extrabold text-brand-dark",
  featureText: "mt-1 block text-[13px] leading-[1.6] break-keep text-muted",
  // Campaign guide items: one per row, each with its news source.
  campaignList: "mt-[22px] grid grid-cols-[minmax(0,1fr)] gap-3",
  // Each campaign leads with a white tile: the organisations' own logos, a campaign photo, or a plain icon.
  campaignMark: "relative flex h-[84px] flex-[0_0_120px] flex-col justify-center gap-2 overflow-hidden rounded-[14px] border [transition:border-color_.25s_ease,transform_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/feature:[transform:scale(1.03)] group-hover/feature:border-[#D2DEEC] max-sm:h-[72px] max-sm:basis-24 motion-reduce:[transition:none] motion-reduce:group-hover/feature:[transform:none]",
  campaignMarkLogo: "border-[#E3EAF3] bg-white px-3.5 py-3 max-sm:p-2.5",
  campaignMarkPhoto: "border-[#E3EAF3] bg-white p-0",
  campaignMarkIcon: "items-center border-[#DCE8F4] bg-[#EAF2F9] px-3.5 py-3 text-brand max-sm:p-2.5 [&_svg]:size-7",
  campaignLogo: "relative block min-h-0 flex-1",
  campaignSource: "mt-2 inline-block rounded-[6px] bg-[#EEF3FA] px-2 py-0.5 text-[12px] font-bold text-[#3D5877] not-italic",

  // CU reunion case as a short four-step timeline.
  timeline: "relative grid grid-cols-4 gap-3 before:absolute before:top-[7px] before:right-[12%] before:left-[12%] before:h-0.5 before:rounded-[2px] before:bg-[linear-gradient(90deg,#B9CDE6,#F6CDC9)] before:content-[''] [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.16s] [&>:nth-child(4)]:[animation-delay:.24s] max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:gap-4 max-[760px]:pl-2 max-[760px]:before:top-2 max-[760px]:before:right-auto max-[760px]:before:bottom-2 max-[760px]:before:left-[15px] max-[760px]:before:h-auto max-[760px]:before:w-0.5 max-[760px]:before:bg-[linear-gradient(180deg,#B9CDE6,#F6CDC9)]",
  timelineItem: "relative flex animate-home-rise flex-col items-center pt-6 text-center before:absolute before:top-0 before:left-1/2 before:size-4 before:-translate-x-1/2 before:rounded-full before:border-[3px] before:border-white before:bg-brand before:shadow-[0_0_0_1px_#B9CDE6] before:content-[''] last:before:bg-[#C2553F] last:before:shadow-[0_0_0_1px_#F6CDC9] max-[760px]:items-start max-[760px]:p-0 max-[760px]:pl-[30px] max-[760px]:text-left max-[760px]:before:left-0 max-[760px]:before:translate-none motion-reduce:animate-none",
  timelineTitle: "text-[14.5px] font-extrabold text-brand-dark",
  timelineText: "mt-1.5 text-[12.5px] leading-[1.6] break-keep text-muted",

  aiRow: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-8 max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:gap-6",
  agePair: "flex items-center gap-3.5 max-[760px]:justify-center",
  ageFigure: "m-0 text-center",
  agePhoto: "relative aspect-[4/5] w-[130px] overflow-hidden rounded-[14px] bg-[#E6EFF9] shadow-[0_10px_24px_rgba(23,59,112,.12)] max-[760px]:w-[110px]",
  ageCaption: "relative -mt-3.5 inline-block rounded-full px-3 py-1 text-[11.5px] font-bold text-white",

  steps: "mt-[26px] grid grid-cols-4 gap-3 [counter-reset:step] max-[760px]:grid-cols-2 max-[760px]:gap-y-[22px]",
  step: "group/item relative flex flex-col items-center px-1.5 py-1 text-center not-last:after:absolute not-last:after:top-7 not-last:after:-right-3 not-last:after:h-0.5 not-last:after:w-3 not-last:after:rounded-[2px] not-last:after:bg-[#B9CDE6] not-last:after:content-[''] max-[760px]:not-last:after:hidden",
  stepIcon: "flex size-14 items-center justify-center rounded-full [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),background-color_.3s_ease,color_.3s_ease] group-hover/item:[transform:translateY(-3px)] group-hover/item:text-white motion-reduce:[transition:none] motion-reduce:group-hover/item:[transform:none]",
  stepIconTone: "bg-brand-soft text-brand shadow-[inset_0_0_0_1px_#D7E5F5] group-hover/item:bg-brand",
  // The last 'hope' step takes the coral point.
  stepIconHope: "bg-[color:var(--point-soft)] text-[color:var(--point-strong)] shadow-[inset_0_0_0_1px_#F6CDC9] group-hover/item:bg-[color:var(--point-strong)]",
  stepTitle: "mt-3 text-[14.5px] font-extrabold text-brand-dark",
  stepText: "mt-1.5 text-[12.5px] leading-[1.6] break-keep text-muted",

  actions: "mt-7 flex flex-wrap gap-2.5",
  primary: "group/primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-[22px] text-[14.5px] font-bold text-white shadow-[0_8px_20px_rgba(57,120,184,.22)] [transition:transform_.25s_cubic-bezier(.2,.7,.2,1),box-shadow_.25s_ease,background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease] hover:bg-[#2F66A0] hover:[transform:translateY(-2px)] hover:shadow-[0_14px_28px_rgba(57,120,184,.28)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:[transition:none] [&_svg]:[transition:transform_.25s_cubic-bezier(.2,.7,.2,1)] hover:[&_svg]:[transform:translateX(4px)]",
  secondary: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#CFDDEE] bg-white px-[22px] text-[14.5px] font-bold text-brand-dark [transition:transform_.25s_cubic-bezier(.2,.7,.2,1),box-shadow_.25s_ease,background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease] hover:border-brand hover:text-brand hover:[transform:translateY(-2px)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:[transition:none]",

  supportPhoto: "relative m-0 aspect-[4/5] overflow-hidden rounded-[18px] shadow-[0_16px_36px_rgba(23,59,112,.14)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_45%,rgba(14,32,62,.55)_100%)] after:content-[''] max-[760px]:aspect-[16/10]",

  tiers: "mt-[22px] grid grid-cols-3 gap-2.5 max-[1000px]:grid-cols-2 max-[760px]:grid-cols-[minmax(0,1fr)]",
  tier: "flex flex-col rounded-[14px] border border-[#E6EDF5] bg-[#FBFCFE] p-4 [transition:transform_.3s_cubic-bezier(.2,.7,.2,1),border-color_.25s_ease,box-shadow_.3s_ease] hover:[transform:translateY(-2px)] hover:border-[#EBD3C9] hover:shadow-[0_10px_24px_rgba(23,59,112,.07)] motion-reduce:[transition:none] motion-reduce:hover:[transform:none]",

  // A small, tall photo (data-side: the QR key ring, the four-frame print) sits at its own size on the right and fades into navy.
  sheetEnding: "relative isolate flex [&:has(>[data-side])]:bg-[#1E3A63] min-h-[190px] items-end justify-between gap-4 overflow-hidden px-10 py-7 before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,.85)_0%,rgba(23,59,112,.15)_45%,rgba(14,32,62,.55)_100%)] before:content-[''] [&>:not(img)]:relative [&>:not(img)]:z-1 max-[760px]:flex-col max-[760px]:items-start max-[760px]:px-5 max-[760px]:py-6",
  // scale crops the thin white border baked into the source photos
  endingPhoto: "-z-1 object-cover object-[center_45%] [transform:scale(1.06)]",
  endingPhotoSide: "-z-1 left-auto! w-[46%]! object-cover object-[30%_52%] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_45%)] [mask-image:linear-gradient(90deg,transparent_0%,#000_45%)] max-sm:w-[70%]!",
  endingNote: "text-[26px] leading-[1.35] text-white [text-shadow:0_2px_10px_rgba(0,0,0,.35)] [transform:rotate(-2deg)] max-[760px]:text-[22px]",
  toTop: "inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-full border border-white/60 bg-white/18 px-3.5 py-2 text-[12.5px] font-bold text-white backdrop-blur-[6px] [transition:background-color_.2s_ease] hover:bg-white/32 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand",
  toTopIcon: "[transform:rotate(-90deg)]",

  // Campaign video: the four-frame photo is the play button, and the YouTube player opens full width under the intro.
  playButton: "absolute inset-0 z-2 flex cursor-pointer flex-col items-center justify-center gap-2 pb-[52px] text-white focus-visible:rounded-[18px] focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand",
  playIcon: "grid size-[52px] place-items-center rounded-full bg-[rgba(23,59,112,.82)] pl-[3px] shadow-[0_8px_20px_rgba(14,32,62,.3)] [transition:transform_.3s_cubic-bezier(.2,.7,.2,1),background-color_.2s_ease] group-hover/play:[transform:scale(1.08)] group-hover/play:bg-brand motion-reduce:[transition:none]",
  playLabel: "rounded-full bg-[rgba(14,32,62,.6)] px-2.5 py-[3px] text-[12.5px] font-bold",
  videoFrame: "relative mt-[22px] aspect-video overflow-hidden rounded-2xl bg-[#0E203E] shadow-[0_16px_36px_rgba(23,59,112,.14)]",
  videoCredit: "mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12.5px] leading-[1.6] break-keep text-[#62748C]",

  // Campaign guide: two case cards, each led by a scene recreated where the campaign actually ran.
  caseRow: "mt-[26px] grid grid-cols-2 gap-3.5 max-sm:grid-cols-[minmax(0,1fr)]",
  caseCard: "flex animate-[home-rise_.6s_cubic-bezier(.2,.7,.2,1)_.15s_backwards] flex-col gap-3.5 rounded-[18px] border border-[#E3EAF3] bg-[#FBFCFE] p-[18px] [transition:transform_.3s_cubic-bezier(.2,.7,.2,1),border-color_.25s_ease,box-shadow_.3s_ease] hover:[transform:translateY(-3px)] hover:border-[#D2DEEC] hover:shadow-[0_14px_30px_rgba(23,59,112,.08)] [&+&]:[animation-delay:.25s] motion-reduce:animate-none motion-reduce:[transition:none] motion-reduce:hover:[transform:none]",
  caseWhere: "text-[12px] font-bold text-[#25508F]",
  caseName: "mt-0.5 block text-[17px] font-extrabold tracking-[-.3px] text-brand-dark",
  caseText: "mt-1.5 text-[13.5px] leading-[1.7] break-keep text-[#4A5D75]",
  caseNote: "mt-2.5 text-[12.5px] text-[#7A8BA0]",
  scene: "relative h-[150px] overflow-hidden rounded-[14px]",
  sceneTag: "absolute top-2 right-2 z-2 rounded-full bg-[rgba(23,32,48,.62)] px-2 py-0.5 text-[11px] font-bold text-white not-italic",
  // 호프테이프: kraft cardboard with a center seam, crossed by a printed packing tape.
  tapeScene: "[background:linear-gradient(90deg,transparent_calc(50%-1px),rgba(120,82,40,.28)_50%,transparent_calc(50%+1px)),linear-gradient(160deg,#DDB984,#C79A5F)]",
  tape: "absolute top-1/2 left-[-12%] flex w-[124%] border-y border-[rgba(160,120,70,.35)] bg-[rgba(252,248,238,.94)] py-2 shadow-[0_6px_14px_rgba(80,52,20,.22)] [transform:translateY(-50%)_rotate(-5deg)]",
  tapeCell: "flex flex-none items-center gap-[5px] border-r border-dashed border-[rgba(160,120,70,.45)] px-3.5",
  tapePhoto: "relative h-12 w-10 overflow-hidden rounded-[4px] bg-[#E6EBF1]",
  // 에어서울: a seat back with its screen showing the pair and a QR code.
  monitorScene: "grid place-items-center [background:radial-gradient(120%_90%_at_50%_0%,#5B6676,#2E3642)]",
  monitor: "w-[min(88%,280px)] rounded-xl bg-[#11161D] p-2 shadow-[0_10px_22px_rgba(0,0,0,.35),inset_0_0_0_1px_rgba(255,255,255,.06)]",
  monitorPhoto: "relative aspect-square max-w-16 flex-1 overflow-hidden rounded-[6px] bg-[#E6EBF1]",
  monitorPhotoTag: "absolute inset-x-[3px] bottom-[3px] z-1 rounded-full py-px text-center text-[9px] font-bold text-white not-italic",

  // Support story: a recreated convenience-store POS screen.
  posScreen: "overflow-hidden rounded-2xl border-[6px] border-[#25303B] bg-white shadow-[0_14px_30px_rgba(23,59,112,.16)] [transform:rotate(-1.5deg)]",
};

/* Two-pane guide shown inside a bare Modal: a numbered sidebar that follows the reading position, and the sections. */
function GuideSheet({ title, sections, ending, tone = "brand" }: { title: string; sections: Section[]; ending: ReactNode; tone?: "brand" | "coral" | "navy" }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0].id);

  const scroller = () => sheetRef.current?.closest<HTMLElement>("[data-modal-scroll]") ?? null;
  const smooth = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The active item is the last section whose top has passed a line near the top of the box,
  // or the last section once the box is scrolled to the end (short final sections never reach the line).
  useEffect(() => {
    const root = scroller();
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rootTop = root.getBoundingClientRect().top;
      const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top - rootTop <= 120) current = section.id;
      }
      setActive(atEnd ? sections[sections.length - 1].id : current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => { root.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [sections]);

  const goTo = (id: string) => {
    const root = scroller();
    const target = document.getElementById(id);
    if (!root || !target) return;
    const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 8;
    root.scrollTo({ top, behavior: smooth() ? "smooth" : "auto" });
    setActive(id);
  };

  const activeIndex = Math.max(0, sections.findIndex(section => section.id === active));

  return (
    <div ref={sheetRef} className={`${ui.sheet} ${tone === "coral" ? toneCoral : tone === "navy" ? toneNavy : toneBrand}`} data-tone={tone}>
      <aside className={ui.sheetNav}>
        <nav aria-label={`${title} 목차`} className={ui.sheetNavInner}>
          <p className={ui.sheetNavEyebrow}><span aria-hidden="true" className={ui.dot} />FINDUS GUIDE</p>
          <p className={ui.sheetNavTitle}>{title}</p>
          {/* 지금 읽는 위치: 막대와 숫자로 보여준다. */}
          <div className={ui.sheetProgress} aria-hidden="true">
            <span className={ui.sheetProgressBar}><span className={ui.sheetProgressFill} style={{ width: `${((activeIndex + 1) / sections.length) * 100}%` }} /></span>
            <span className={ui.sheetProgressText}><strong className="font-extrabold text-[color:var(--tone-ink)]">{activeIndex + 1}</strong> / {sections.length}</span>
          </div>
          <ol className={ui.sheetSteps}>
            {sections.map((section, index) => (
              <li key={section.id} data-state={index < activeIndex ? "done" : index === activeIndex ? "active" : "next"} className="relative max-[760px]:flex-none">
                <button type="button" aria-current={active === section.id ? "true" : undefined} onClick={() => goTo(section.id)} className={`${ui.sheetNavButton} ${index < activeIndex ? ui.sheetNavButtonDone : ui.sheetNavButtonRest}`}>
                  <span className={`${ui.sheetStep} ${index < activeIndex ? ui.sheetStepDone : ui.sheetStepRest}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={ui.sheetStepLabel}>{section.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <a href="tel:182" className={ui.sheetHelp}>
            <span aria-hidden="true" className={ui.sheetHelpIcon}><PhoneIcon size={16} strokeWidth={2} /></span>
            <span><small className="block text-[12px] font-semibold text-[#62748C]">제보·상담이 필요하다면</small><strong className="mt-px block text-[14px] font-[850]">경찰청 182</strong></span>
          </a>
        </nav>
      </aside>
      <div className={ui.sheetBody}>
        {sections.map(section => <section key={section.id} id={section.id} aria-label={section.label} className={ui.sheetSection}>{section.content}</section>)}
        <div className={ui.sheetEnding}>
          {ending}
          <button type="button" className={ui.toTop} onClick={() => scroller()?.scrollTo({ top: 0, behavior: smooth() ? "smooth" : "auto" })}>
            <ArrowRightIcon size={14} className={ui.toTopIcon} />맨 위로
          </button>
        </div>
      </div>
    </div>
  );
}

function Polaroid({ src, alt, note }: { src: string; alt: string; note: string }) {
  return (
    <figure className={ui.polaroid}>
      <div className={ui.polaroidFrame}>
        <div className={ui.polaroidPhoto}><Image src={src} alt={alt} fill sizes="220px" className="object-cover [filter:sepia(.22)_saturate(.85)]" /></div>
      </div>
      <figcaption className={`${pen.className} ${ui.handNote}`}>{note}</figcaption>
    </figure>
  );
}

function AgePair({ past, aged }: { past: string; aged: string }) {
  return (
    <div className={ui.agePair} aria-label="AI로 만든 가상 인물 예시">
      <figure className={ui.ageFigure}><div className={ui.agePhoto}><Image src={past} alt="가상 인물의 어린 시절 예시" fill sizes="150px" className="object-cover object-[center_30%]" /></div><figcaption className={`${ui.ageCaption} bg-[#2E4A6E]`}>과거 사진</figcaption></figure>
      <span aria-hidden="true" className="animate-home-nudge text-brand motion-reduce:animate-none"><ArrowRightIcon size={18} /></span>
      <figure className={ui.ageFigure}><div className={ui.agePhoto}><Image src={aged} alt="가상 인물의 AI 예상 모습" fill sizes="150px" className="object-cover object-[center_30%]" /></div><figcaption className={`${ui.ageCaption} bg-brand`}>AI 예측 · 현재 모습</figcaption></figure>
    </div>
  );
}

function Steps({ items }: { items: { icon: ReactNode; title: string; text: string }[] }) {
  return (
    <ol className={ui.steps}>
      {items.map((item, index) => (
        <li key={item.title} className={ui.step}>
          <span aria-hidden="true" className={`${ui.stepIcon} ${index === items.length - 1 ? ui.stepIconHope : ui.stepIconTone}`}>{item.icon}</span>
          <strong className={ui.stepTitle}>{item.title}</strong>
          <span className={ui.stepText}>{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

const DnaGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M8 3c0 4.5 8 6.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 6.5-8 9s8 4.5 8 9M9.3 6.5h5.4M10.6 9.5h2.8M10.6 14.5h2.8M9.3 17.5h5.4" />
  </svg>
);
const GiftGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="3.5" y="8.5" width="17" height="12" rx="2" /><path d="M3.5 12.5h17M12 8.5v12M12 8.5S10.5 4 8 4.6 7.6 8.5 12 8.5ZM12 8.5S13.5 4 16 4.6s.4 3.9-4 3.9Z" />
  </svg>
);
const QrGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6h-6M17 18h0" />
  </svg>
);
const MonitorGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="3" y="4" width="18" height="12.5" rx="2" /><path d="M8.5 20.5h7M12 16.5v4" />
  </svg>
);

function ServiceGuide() {
  const sections: Section[] = [
    {
      id: "service-purpose",
      label: "우리가 만드는 이유",
      content: (
        <>
          <div className={ui.purpose}>
            <div>
              <p className={ui.kicker}>OUR PURPOSE · 우리가 이 서비스를 만드는 이유</p>
              <h3 className={ui.bigTitle}>시간이 흘러도,<br />잊지 말아야 할 얼굴이 있습니다.</h3>
              <p className={ui.lead}>누군가에게는 오래전 사진 한 장이지만,<br />누군가에게는 오늘도 기다리는 가족의 얼굴입니다.</p>
              <p className={ui.body}>시간이 흐를수록 사람의 모습은 달라지고, 오래된 사진만으로 지금의 모습을 떠올리기는 쉽지 않습니다. 하지만 시간이 흘렀다고 해서 누군가를 찾는 마음까지 사라지는 것은 아닙니다.</p>
              <p className={ui.body}>FindUs는 AI 나이 예측 기술로 시간이 흐른 뒤의 모습을 그려보고, 잊혀 가는 실종아동에게 다시 사회적 관심을 모으고자 합니다. 더 많은 사람이 얼굴을 기억하고, 한 번 더 바라보도록 돕습니다.</p>
              <p className={ui.body}>예측된 얼굴이 만남을 보장할 수는 없지만, 잊지 않고 기억하는 마음은 다시 만날 희망을 이어갈 수 있습니다.</p>
            </div>
            <Polaroid src={POLAROID} alt="AI로 만든 가상 인물의 어린 시절 사진" note="기억하는 마음이 다시 만날 희망이 됩니다." />
          </div>
          <blockquote className={ui.quote}>
            <span aria-hidden="true" className={ui.quoteMark}><LogoMark size={34} /></span>
            <div>
              <strong className={ui.quoteTitle}>다시 그린 얼굴에, 우리의 마음을 더하다.</strong>
              <span className={ui.quoteText}>기술로 얼굴을 그리는 일을 넘어, 기억과 관심을 잇고 다시 만날 희망을 함께합니다.</span>
            </div>
          </blockquote>
        </>
      ),
    },
    {
      id: "service-features",
      label: "주요 기능",
      content: (
        <>
          <p className={ui.kicker}>주요 기능</p>
          <h3 className={ui.midTitle}>기억나는 단서를 공식 절차로 잇습니다.</h3>
          <ul className={ui.features}>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><SearchIcon size={20} /></span><div><strong className={ui.featureTitle}>실종아동 정보 검색</strong><span className={ui.featureText}>경찰청에 공개된 실종아동 정보를 이름과 지역으로 찾아볼 수 있어요.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><PhoneIcon size={20} /></span><div><strong className={ui.featureTitle}>목격 제보 안내</strong><span className={ui.featureText}>본 적 있는 얼굴이라면 112·182 공식 창구로 바로 이어 드려요.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><SparklesIcon size={20} /></span><div><strong className={ui.featureTitle}>AI 나이 예측</strong><span className={ui.featureText}>오래된 사진 속 얼굴이 지금은 어떤 모습일지 참고 이미지를 보여 드려요.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><DnaGlyph /></span><div><strong className={ui.featureTitle}>가족 찾기 · DNA 안내</strong><span className={ui.featureText}>어린 시절 기억이 낯설다면 상담과 DNA 채취 절차를 안내해 드려요.</span></div></li>
          </ul>
        </>
      ),
    },
    {
      id: "service-ai",
      label: "AI 나이 예측",
      content: (
        <div className={ui.aiRow}>
          <div>
            <p className={ui.kicker}>AI 나이 예측 기술</p>
            <h3 className={ui.midTitle}>지금의 모습을 다시 그립니다.</h3>
            <p className={ui.body}>오래된 사진 속 얼굴의 특징을 바탕으로, 시간이 흐른 뒤의 모습을 예측합니다.</p>
            <p className={ui.note}>예측 이미지는 참고용이며 실제 모습과 다를 수 있습니다. 사진은 AI로 만든 가상 인물입니다.</p>
          </div>
          <AgePair past={SERVICE_PAST} aged={SERVICE_AGED} />
        </div>
      ),
    },
    {
      id: "service-together",
      label: "함께하는 방법",
      content: (
        <>
          <p className={ui.kicker}>기억과 관심이 연결될 때,</p>
          <h3 className={ui.midTitle}>더 많은 사람이 실종아동을 찾을 수 있습니다.</h3>
          <Steps items={[
            { icon: <SearchIcon size={22} />, title: "실종 정보 발견", text: "누구나 쉽게 정보를 확인할 수 있습니다." },
            { icon: <SparklesIcon size={22} />, title: "AI 나이 예측", text: "시간이 흐른 뒤의 모습을 예측합니다." },
            { icon: <UsersIcon size={22} />, title: "사회적 관심", text: "더 많은 사람이 기억하고 바라봅니다." },
            { icon: <HeartIcon size={22} />, title: "다시 만날 희망", text: "작은 관심이 큰 변화를 만듭니다." },
          ]} />
          <div className={ui.actions}>
            <Link href="/search" className={ui.primary}>실종아동 찾아보기 <ArrowRightIcon size={16} /></Link>
            <a href="tel:182" className={ui.secondary}><PhoneIcon size={16} />실종 상담 182</a>
          </div>
        </>
      ),
    },
  ];
  return (
    <GuideSheet
      title="서비스 소개"
      sections={sections}
      ending={<>
        <Image src="/images/home-closing-sky.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={ui.endingPhoto} />
        <p className={`${pen.className} ${ui.endingNote}`}>기억은 사라지지 않습니다.<br />다시 만날 그날을 위해, 오늘도.</p>
      </>}
    />
  );
}

function SupportGuide() {
  const campaign = CAMPAIGN;
  const remainder = campaign.fundsPlan.filter(bucket => bucket.share > 0);
  const sections: Section[] = [
    {
      id: "support-story",
      label: "시작한 이유",
      content: (
        <>
        <div className={ui.purpose}>
          <div>
            <p className={ui.kicker}>REAL STORY · 우리가 이 프로젝트를 시작한 이유</p>
            <h3 className={ui.bigTitle}>편의점에서 발견한 한 장의 사진이,<br />20년 만의 가족 상봉으로 이어졌습니다.</h3>
            <p className={ui.body}>2000년 네 살 때 실종된 한 여성이 2020년, CU 편의점 결제 화면에서 자신의 어린 시절 사진을 발견했습니다. 이후 확인 절차를 거쳐 오랜 시간 헤어져 있던 가족과 다시 만났습니다.</p>
            <p className={ui.body}>이 사례는 우리에게 한 가지 가능성을 보여주었습니다. 실종 정보가 사람들의 일상 속에서 한 번 더 발견된다면, 누군가에게는 가족을 다시 만날 기회가 될 수 있다는 것을요.</p>
            <p className={ui.lead}>우리는 이 가능성을 우리의 일상에서도 이어가고 싶습니다.</p>
          </div>
          {/* 편의점 결제 화면을 재현한 예시. 실제 당사자 사진은 쓰지 않는다. */}
          <figure className="m-0 grid animate-[home-rise_.7s_cubic-bezier(.2,.7,.2,1)_.1s_backwards] gap-2.5 motion-reduce:animate-none" aria-label="편의점 결제 화면에 뜬 실종아동 정보 (재현 예시)">
            <div className={ui.posScreen} aria-hidden="true">
              <div className="flex items-center justify-between gap-2 bg-[#EEF1F5] px-2.5 py-1.5 text-[10.5px] font-bold text-[#62748C]"><span className="relative h-[18px] w-[30px]"><Image src="/images/partners/cu.png" alt="" fill sizes="40px" unoptimized className="object-contain" /></span><span>재현 예시 화면</span></div>
              <div className="flex items-center gap-2.5 p-2.5">
                <span className="relative aspect-[3/4] w-[62px] flex-none overflow-hidden rounded-[6px] bg-[#E6EBF1]"><Image src="/images/mock-persons/MC-1999-0341/past.jpg" alt="" fill sizes="80px" className="object-cover object-[center_30%] [filter:saturate(.8)]" /></span>
                <span className="grid gap-0.5"><strong className="text-[13px] font-[850] text-[#B4473F]">실종아동을 찾습니다</strong><small className="text-[11px] text-[#4A5D75]">2000년 · 당시 4세</small><small className="text-[11px] text-[#4A5D75]">보신 분은 182로 연락 주세요</small></span>
              </div>
            </div>
          </figure>
        </div>
          <ol className={`${ui.timeline} ${ui.blockGap}`} aria-label="CU 실종아동 찾기 캠페인 상봉 사례">
            <li className={ui.timelineItem}><strong className={ui.timelineTitle}>2000년 6월</strong><span className={ui.timelineText}>네 살 아이가 가족과 헤어졌습니다.</span></li>
            <li className={ui.timelineItem}><strong className={ui.timelineTitle}>2020년 가을</strong><span className={ui.timelineText}>CU 편의점 결제 화면에서 자신의 어린 시절 사진을 발견했습니다.</span></li>
            <li className={ui.timelineItem}><strong className={ui.timelineTitle}>확인 절차</strong><span className={ui.timelineText}>아동권리보장원 실종아동전문센터를 통해 확인했습니다.</span></li>
            <li className={ui.timelineItem}><strong className={ui.timelineTitle}>20년 만의 상봉</strong><span className={ui.timelineText}>오랜 시간 헤어져 있던 가족과 다시 만났습니다.</span></li>
          </ol>
          <p className={ui.note}>출처: 뉴데일리, 「편의점에 어릴 적 내 사진이?… 20년 전 실종아동 가족 품으로」(2020.10.6). 당사자의 이름과 사진은 싣지 않습니다.</p>
        </>
      ),
    },
    {
      id: "support-goods",
      label: "QR 굿즈",
      content: (
        <>
          <blockquote className={ui.quote}>
            <span aria-hidden="true" className={ui.quoteMark}><LogoMark size={34} /></span>
            <div>
              <strong className={ui.quoteTitle}>CU가 편의점에서 발견의 기회를 만들었다면,</strong>
              <span className={ui.quoteText}>우리는 사람들이 매일 사용하는 물건을 통해 그 기회를 이어가고자 합니다.</span>
            </div>
          </blockquote>
          <p className={ui.body}>여러분의 후원은 QR 굿즈를 만들고, 더 많은 사람이 장기 실종 아동의 정보를 쉽게 접할 수 있는 서비스를 만들어가는 데 힘이 됩니다.</p>
          <p className={ui.note}>물론 굿즈 하나가 곧바로 가족과의 상봉을 약속하지는 않습니다. 하지만 한 번 더 발견되고, 한 번 더 기억되고, 한 번 더 공유되는 정보가 쌓인다면 다시 만날 가능성을 넓히는 데 보탬이 될 수 있습니다.</p>
          <p className={`${ui.kicker} ${ui.blockGap}`}>펀딩마다 한 명의 장기 실종 아동을 함께 기억합니다</p>
          <h3 className={ui.midTitle}>굿즈에는 아이의 얼굴 대신, QR 코드만 담습니다.</h3>
          <p className={ui.body}>후원으로 만들어지는 키링, 에코백, 옷에는 QR 코드만 담깁니다. 굿즈를 사용하는 일상 속에서 누군가 QR을 발견하고, 아이의 이야기를 읽고, 실종 정보에 다시 관심을 가질 수 있도록.</p>
          <ul className={ui.features}>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><QrGlyph /></span><div><strong className={ui.featureTitle}>얼굴 대신 QR</strong><span className={ui.featureText}>아이의 사진은 굿즈에 직접 넣지 않고, QR로만 연결합니다.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><SearchIcon size={20} /></span><div><strong className={ui.featureTitle}>이야기와 공식 정보</strong><span className={ui.featureText}>QR을 스캔하면 아이의 이야기와 공식 실종 정보를 확인할 수 있어요.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><UsersIcon size={20} /></span><div><strong className={ui.featureTitle}>한 번 더 공유</strong><span className={ui.featureText}>필요한 정보를 다른 사람에게 공유할 수 있도록 안내합니다.</span></div></li>
            <li className={ui.feature}><span aria-hidden="true" className={ui.featureIcon}><HeartIcon size={20} /></span><div><strong className={ui.featureTitle}>일상 속 연결점</strong><span className={ui.featureText}>굿즈는 후원의 대가를 넘어, 잊히기 쉬운 실종 정보를 다시 만나는 연결점입니다.</span></div></li>
          </ul>
        </>
      ),
    },
    {
      id: "support-rewards",
      label: "후원 방법",
      content: (
        <>
          <p className={ui.kicker}>{campaign.title}</p>
          <h3 className={ui.midTitle}>마음에 드는 굿즈를 골라 후원해 주세요.</h3>
          <ul className={ui.tiers}>
            {campaign.tiers.map(tier => (
              <li key={tier.id} className={ui.tier}><strong className="text-[15px] font-extrabold text-brand-dark">{tier.title}</strong><span className="mt-1 text-[12.5px] leading-[1.55] break-keep text-muted">{tier.summary}</span><em className="mt-auto pt-2.5 text-[15px] font-extrabold text-[#D4675E] not-italic">{formatWon(tier.price)}</em></li>
            ))}
          </ul>
          <p className={ui.note}>목표 금액 {formatWon(campaign.goal)}에 닿지 못하면 결제한 금액을 전액 환불해요. 굿즈는 {campaign.deliveryNote}.</p>
        </>
      ),
    },
    {
      id: "support-funds",
      label: "후원금 사용",
      content: (
        <>
          <p className={ui.kicker}>후원금은 이렇게 쓰여요</p>
          <h3 className={ui.midTitle}>굿즈 원가를 뺀 나머지는 모두 아이 찾기에.</h3>
          <ul className={ui.features}>
            {campaign.fundsPlan.map(bucket => (
              <li key={bucket.id} className={ui.feature}>
                <span aria-hidden="true" className={ui.featureIcon}>{bucket.id === "goods" ? <GiftGlyph /> : bucket.id === "search" ? <QrGlyph /> : <HeartIcon size={20} />}</span>
                <div><strong className={ui.featureTitle}>{bucket.title}</strong><span className={ui.featureText}>{bucket.description}</span></div>
              </li>
            ))}
          </ul>
          {remainder.length > 1 && <p className={ui.note}>원가를 뺀 금액은 {remainder.map(bucket => bucket.title).join("와 ")}에 {remainder.map(bucket => bucket.share).join(" : ")} 비율로 나눠 씁니다.</p>}
        </>
      ),
    },
    {
      id: "support-together",
      label: "함께하는 방법",
      content: (
        <>
          <p className={ui.kicker}>후원은 이렇게 이어져요</p>
          <h3 className={ui.midTitle}>한 아이의 이야기가 더 많은 사람에게 닿을 수 있도록.</h3>
          <p className={ui.body}>잊히지 않도록, 다시 만날 가능성을 함께 만들어 주세요.</p>
          <Steps items={[
            { icon: <GiftGlyph />, title: "굿즈 고르기", text: "응원부터 패밀리 세트까지 고를 수 있어요." },
            { icon: <HeartIcon size={22} />, title: "후원하기", text: "목표에 닿지 않으면 전액 환불돼요." },
            { icon: <QrGlyph />, title: "QR 굿즈 받기", text: `${campaign.deliveryNote}.` },
            { icon: <UsersIcon size={22} />, title: "기억 잇기", text: "QR로 누군가 아이의 이야기를 다시 만납니다." },
          ]} />
          <div className={ui.actions}>
            <Link href="/funding" className={ui.primary}>펀딩 보러 가기 <ArrowRightIcon size={16} /></Link>
          </div>
        </>
      ),
    },
  ];
  return (
    <GuideSheet
      title="후원 안내"
      tone="coral"
      sections={sections}
      ending={<>
        <Image src="/images/support-qr-goods-card.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={ui.endingPhotoSide} data-side />
        <p className={`${pen.className} ${ui.endingNote}`}>굿즈를 만드는 일에서 시작해,<br />한 아이를 기억하는 일로.</p>
      </>}
    />
  );
}

// 일상 속에서 실종아동을 다시 보게 하는 국내 캠페인 모음. 보도 기사를 바탕으로 정리했다.
const CAMPAIGNS = {
  store: [
    { title: "CU · 아이CU", text: "전국 CU 점포에서 길 잃은 아이를 보호하고 경찰에 인계해요. POS 화면에 장기 실종아동 사진을 띄워 20년 만의 상봉 사례도 있어요.", source: "파이낸셜뉴스", logos: ["/images/partners/cu.png"] },
    { title: "우체국 · 한진 · 경찰청 '호프테이프'", text: "택배 포장 테이프에 실종 당시 사진과 나이 변환 예상 모습을 함께 인쇄했어요. 한진은 이 캠페인 등으로 사회공헌 시상에서 상을 받기도 했어요.", source: "사이언스타임즈 · 메트로서울", logos: ["/images/partners/epost.png", "/images/partners/hanjin.png"] },
    { title: "티르티르 택배 라벨", text: "뷰티 브랜드 티르티르는 택배 상자 안쪽에 실종 당시 사진과 현재 추정 사진을 비교하는 라벨을 붙였어요.", source: "메트로서울", logos: ["/images/partners/tirtir.svg"] },
    { title: "인생네컷 × 경찰청 '실종아동네컷'", text: "인생네컷과 경찰청이 함께한 장기 실종아동 찾기 캠페인이에요. 네 컷 사진 프레임에 아이들의 어린 시절 모습과 특징을 담았어요.", source: "캠페인 포스터", photo: "/images/campaign-four-frame.webp" },
  ],
  app: [
    { title: "당근 × 경찰청 실종 정보 실시간 공유", text: "안전Dream에 공개된 실종 정보가 당근 앱에 실시간으로 올라가고, 발견되면 자동 삭제돼요.", source: "뉴시스", logos: ["/images/partners/daangn.svg"] },
    { title: "토스 × 대전경찰청 결제 단말기 실종경보", text: "실종경보 발령 시 지역 가맹점의 토스 결제 단말기에 실종 정보를 띄우는 협약이에요. 대전에서 먼저 시작해요.", source: "토스피드", logos: ["/images/partners/toss.png"] },
    { title: "NH농협은행 인터넷뱅킹 실종아동 찾기", text: "2016년부터 이체 화면에 실종아동 사진과 정보를 노출해 왔어요. 10년째 이어진 장수 캠페인이에요.", source: "스마트투데이", logos: ["/images/partners/nh.png"] },
  ],
  more: [
    { title: "에어서울 기내 모니터 실종아동 찾기", text: "좌석 모니터에 실종 당시 모습과 나이 변환 예상 모습을 함께 보여주고, 안전Dream QR도 띄웠어요.", source: "아이뉴스24" },
    { title: "KB국민은행 · 실종 예방 협력", text: "자녀 지문을 등록하고 사전신고증을 내면 어린이 적금에 우대이율을 주는 상품이 있었어요. 올해 실종아동의 날 행사에서 KB국민은행과 NH농협은행이 경찰청장 감사장을 받았어요.", source: "데일리안 · 다자비", logos: ["/images/partners/kb.png", "/images/partners/nh.png"] },
  ],
} as const;

type CampaignItem = { title: string; text: string; source: string; logos?: readonly string[]; photo?: string };

// Each campaign leads with what it is: the organisations' own logos, a campaign photo, or a plain icon.
function CampaignList({ items, icon }: { items: readonly CampaignItem[]; icon: ReactNode }) {
  return (
    <ul className={ui.campaignList}>
      {items.map(item => (
        <li key={item.title} className={`group/feature ${ui.feature}`}>
          {item.photo ? (
            <span aria-hidden="true" className={`${ui.campaignMark} ${ui.campaignMarkPhoto}`}><Image src={item.photo} alt="" fill sizes="120px" className="object-cover object-[center_40%]" /></span>
          ) : item.logos?.length ? (
            <span aria-hidden="true" className={`${ui.campaignMark} ${ui.campaignMarkLogo}`}>
              {item.logos.map(logo => <span key={logo} className={ui.campaignLogo}><Image src={logo} alt="" fill sizes="100px" unoptimized className="object-contain" /></span>)}
            </span>
          ) : (
            <span aria-hidden="true" className={`${ui.campaignMark} ${ui.campaignMarkIcon}`}>{icon}</span>
          )}
          <div><strong className={ui.featureTitle}>{item.title}</strong><span className={ui.featureText}>{item.text}</span><em className={ui.campaignSource}>출처: {item.source}</em></div>
        </li>
      ))}
    </ul>
  );
}

const TAPE_PERSON = "/images/mock-persons/MC-1994-0627";
const MONITOR_PERSON = "/images/mock-persons/MC-2004-0302";

/** 호프테이프 재현: 택배 상자 위를 가로지르는 포장 테이프에 '당시 → 현재 추정' 사진이 이어 인쇄된 모습. */
function TapeScene() {
  return (
    <div className={`${ui.scene} ${ui.tapeScene}`} aria-hidden="true">
      <div className={ui.tape}>
        {[0, 1, 2].map(i => (
          <span key={i} className={ui.tapeCell}>
            <span className={ui.tapePhoto}><Image src={`${TAPE_PERSON}/past.jpg`} alt="" fill sizes="48px" className="object-cover object-[center_30%] [filter:saturate(.75)_contrast(.95)]" /></span>
            <span className={ui.tapePhoto}><Image src={`${TAPE_PERSON}/aged.jpg`} alt="" fill sizes="48px" className="object-cover object-[center_30%] [filter:saturate(.75)_contrast(.95)]" /></span>
            <span className="ml-[3px] grid"><b className="text-[11.5px] font-[850] whitespace-nowrap text-[#B4473F]">실종아동을 찾습니다</b><small className="text-[10.5px] whitespace-nowrap text-[#5A4630]">보신 분은 182</small></span>
          </span>
        ))}
      </div>
      <em className={ui.sceneTag}>재현 예시</em>
    </div>
  );
}

/** 에어서울 재현: 앞 좌석 등받이 모니터에 '당시 → 현재 추정' 사진과 안전Dream QR이 뜬 모습. */
function MonitorScene() {
  return (
    <div className={`${ui.scene} ${ui.monitorScene}`} aria-hidden="true">
      <div className={ui.monitor}>
        <p className="rounded-t-[6px] bg-[#173B70] px-2 py-1 text-[11px] font-extrabold text-white">실종아동을 찾습니다</p>
        <div className="flex items-center gap-1.5 rounded-b-[6px] bg-[#F4F7FB] p-2">
          <span className={ui.monitorPhoto}><Image src={`${MONITOR_PERSON}/past.jpg`} alt="" fill sizes="64px" className="object-cover object-[center_30%]" /><em className={`${ui.monitorPhotoTag} bg-[rgba(23,32,48,.72)]`}>당시</em></span>
          <i className="grid flex-none text-[#F28B82]"><ArrowRightIcon size={11} /></i>
          <span className={ui.monitorPhoto}><Image src={`${MONITOR_PERSON}/aged.jpg`} alt="" fill sizes="64px" className="object-cover object-[center_30%]" /><em className={`${ui.monitorPhotoTag} bg-[#3978B8]`}>현재 추정</em></span>
          <span className="ml-auto grid flex-none justify-items-center gap-[3px]"><span className="size-[38px] border-[3px] border-white outline outline-[#DCE5F0] [background:conic-gradient(#173B70_25%,#FFFFFF_0_50%,#173B70_0_75%,#FFFFFF_0)_0_0/8px_8px]" /><small className="text-[9.5px] font-extrabold text-[#25508F]">안전Dream</small></span>
        </div>
      </div>
      <em className={ui.sceneTag}>재현 예시</em>
    </div>
  );
}

// 실종아동네컷 캠페인 영상. 내려받아 다시 올리지 않고 YouTube 공식 퍼가기 플레이어로만 보여주며, 올린 채널을 출처로 밝힌다.
const CAMPAIGN_VIDEO = {
  id: "xvB02ibSPiU",
  title: "2024 인생네컷 × 경찰청 '실종아동네컷' 캠페인 영상",
  channel: "HYO JIN KIM",
};

/** The campaign intro. The four-frame photo doubles as the video's play button; the player loads only after a click,
 *  so opening the guide never contacts YouTube on its own. */
function CampaignIntro() {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${CAMPAIGN_VIDEO.id}`;
  return (
    <>
      <div className={ui.purpose}>
        <div>
          <p className={ui.kicker}>EVERYDAY CAMPAIGNS · 일상 속 실종아동 찾기</p>
          <h3 className={ui.bigTitle}>길 위에서, 계산대에서, 화면 속에서<br />한 번 더 발견되도록.</h3>
          <p className={ui.body}>실종아동의 얼굴을 사람들의 일상 속에서 다시 보게 하려는 노력은 이미 여러 곳에서 이어지고 있습니다. 그중 FindUs와 특히 가까운 사례가 둘 있습니다.</p>
        </div>
        <figure className={ui.supportPhoto}>
          <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="(max-width: 640px) 100vw, 230px" className="object-cover" />
          <button type="button" className={`group/play ${ui.playButton}`} onClick={() => setPlaying(true)} aria-expanded={playing} aria-controls="campaign-video" aria-label={`${CAMPAIGN_VIDEO.title} 재생 (YouTube)`}>
            <span className={ui.playIcon} aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg></span>
            <span className={ui.playLabel}>{playing ? "아래에서 재생 중" : "캠페인 영상 보기"}</span>
          </button>
          <figcaption className={`${pen.className} ${ui.handNoteOnPhoto}`}>사진 한 장이, 다시 보는 계기가 됩니다.</figcaption>
        </figure>
      </div>
      <div id="campaign-video">
        {playing && (
          <div>
            <div className={ui.videoFrame}>
              <iframe
                className="absolute inset-0 size-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${CAMPAIGN_VIDEO.id}?autoplay=1&rel=0`}
                title={CAMPAIGN_VIDEO.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className={ui.videoCredit}>
              {CAMPAIGN_VIDEO.title} · 영상 출처: YouTube &lsquo;{CAMPAIGN_VIDEO.channel}&rsquo; 채널
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="flex-none font-bold text-[#2F66A0] hover:underline hover:underline-offset-3">YouTube에서 보기 <span aria-hidden="true">↗</span><span className="sr-only">(새 창)</span></a>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function CampaignGuide() {
  const sections: Section[] = [
    {
      id: "campaign-why",
      label: "FindUs와 닮은 사례",
      content: (
        <>
          <CampaignIntro />
          {/* 두 사례를 실제 쓰인 자리(택배 테이프, 기내 좌석 모니터)를 재현한 장면으로 보여준다.
              보도 사진은 쓰지 않고, 장면 속 얼굴은 AI로 만든 가상 인물 예시다. */}
          <ul className={ui.caseRow}>
            {[
              { name: "호프테이프", where: "우체국 · 한진 · 경찰청", text: "택배 포장 테이프에 장기 실종아동 28명의 실종 당시 모습과 경찰의 나이 변환 몽타주, 실종 장소와 신체 특징을 담았어요.", scene: <TapeScene /> },
              { name: "에어서울 기내 모니터", where: "에어서울", text: "좌석 모니터에 실종 당시 모습과 나이 변환 예상 모습을 함께 보여주고, 안전Dream QR도 띄웠어요.", scene: <MonitorScene /> },
            ].map(item => (
              <li key={item.name} className={ui.caseCard}>
                {item.scene}
                <div>
                  <p className={ui.caseWhere}>{item.where}</p>
                  <strong className={ui.caseName}>{item.name}</strong>
                  <p className={ui.caseText}>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={ui.caseNote}>카드 속 장면은 이해를 돕기 위해 재현한 예시이며, 얼굴은 AI로 만든 가상 인물입니다.</p>
          <p className={ui.lead}>원본과 AI 예상 모습을 나란히 비교하는 방식은, 이미 현장에서 검증된 방법입니다.</p>
        </>
      ),
    },
    { id: "campaign-store", label: "편의점·택배·사진", content: (<><p className={ui.kicker}>편의점 · 택배 · 사진</p><h3 className={ui.midTitle}>매일 지나치는 계산대와 상자, 사진 한 장 위에서.</h3><CampaignList items={CAMPAIGNS.store} icon={<BoxGlyph />} /></>) },
    { id: "campaign-app", label: "앱·결제·은행", content: (<><p className={ui.kicker}>앱 · 결제 · 은행</p><h3 className={ui.midTitle}>손안의 화면에서, 한 번 더.</h3><CampaignList items={CAMPAIGNS.app} icon={<PhoneIcon size={20} />} /></>) },
    {
      id: "campaign-more",
      label: "기내·예방 협력",
      content: (
        <>
          <p className={ui.kicker}>기내 · 실종 예방</p>
          <h3 className={ui.midTitle}>이동하는 순간에도, 미리 대비하는 순간에도.</h3>
          <CampaignList items={CAMPAIGNS.more} icon={<UsersIcon size={20} />} />
          <p className={ui.note}>각 캠페인 내용은 보도 기사를 바탕으로 정리했으며, 현재 진행 여부와 세부 내용은 달라질 수 있습니다. FindUs는 위 기업·기관과 제휴 관계가 아닙니다.</p>
        </>
      ),
    },
  ];
  return (
    <GuideSheet
      title="함께하는 캠페인"
      tone="navy"
      sections={sections}
      ending={<>
        <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={ui.endingPhotoSide} data-side />
        <p className={`${pen.className} ${ui.endingNote}`}>일상의 한 장면이,<br />다시 만나는 길이 됩니다.</p>
      </>}
    />
  );
}

const BoxGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);

// Places on the campaign card.
const CAMPAIGN_PLACES = ["편의점", "택배", "동네 앱", "결제 단말기", "인터넷뱅킹", "기내 모니터"] as const;

// Story cards near the end of the home page; each opens a full guide instead of leaving the page.
export default function HomeStory() {
  const [open, setOpen] = useState<"service" | "support" | "campaign" | null>(null);
  const serviceRef = useRef<HTMLButtonElement>(null);
  const supportRef = useRef<HTMLButtonElement>(null);
  const campaignRef = useRef<HTMLButtonElement>(null);

  return (
    <section className={`page-container ${ui.section}`} aria-labelledby="home-story-title">
      <header className={ui.storyHead} data-reveal>
        <p className={ui.storyKicker}><span aria-hidden="true" className={ui.dot} />FindUs가 함께하는 일</p>
        <h2 id="home-story-title" className={ui.storyTitle}>기술은 기억을 잇고, 관심은 만남을 만듭니다.</h2>
        <p className={ui.storyText}>AI로 시간이 흐른 얼굴을 다시 그리고, 시민의 작은 관심을 공식 제보로 이어갑니다.</p>
      </header>
      <div className={ui.cards} data-reveal="stagger">
        <button ref={serviceRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("service")} className={`${ui.card} ${ui.cardService}`}>
          <span className={ui.cardCopy}>
            <span className={ui.cardLabel}><span aria-hidden="true" className={ui.cardIcon}><MonitorGlyph /></span>01 · 서비스 소개</span>
            <span className={ui.cardTitle}>잊혀 가는 얼굴을, 지금의 모습으로</span>
            <span className={ui.cardText}>AI 나이 예측 기술로 실종아동의 지금 모습을 그려보고, 더 많은 사람에게 알리는 서비스입니다.</span>
            <span className={ui.cardTags}><span className={ui.cardTag}>AI 나이 예측</span><span className={ui.cardTag}>공식 정보 연결</span></span>
            <span className={ui.cardMore}>자세히 보기 <ArrowRightIcon size={15} className={ui.cardMoreIcon} /></span>
          </span>
          <span aria-hidden="true" className={`${ui.picture} ${ui.splitFace}`}>
            <span className={ui.splitHalf}><Image src={SERVICE_PAST} alt="" fill sizes="190px" className={`object-cover object-[center_30%] ${ui.zoomImage}`} /></span>
            <span className={ui.splitRight}><Image src={SERVICE_AGED} alt="" fill sizes="190px" className={`object-cover object-[center_30%] ${ui.zoomImage}`} /></span>
            <span className={ui.splitLine} />
            <span className={ui.scanCorners} />
            <span className={`${ui.splitTag} ${ui.splitTagLeft}`}>당시</span>
            <span className={`${ui.splitTag} ${ui.splitTagRight}`}>AI 예상</span>
          </span>
        </button>
        <button ref={supportRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("support")} className={`${ui.card} ${ui.cardSupport}`}>
          <span className={ui.cardCopy}>
            <span className={ui.cardLabel}><span aria-hidden="true" className={ui.cardIcon}><HeartIcon size={18} /></span>02 · 후원 안내</span>
            <span className={ui.cardTitle}>한 장의 사진이, 다시 만남으로</span>
            <span className={ui.cardText}>편의점에서 발견한 사진 한 장이 20년 만의 가족 상봉으로 이어졌습니다. 한 아이를 기억하는 QR 굿즈를 함께 만들어요.</span>
            <span className={ui.cardTags}><span className={ui.cardTag}>QR 굿즈</span><span className={ui.cardTag}>리워드 펀딩</span></span>
            <span className={ui.cardMore}>자세히 보기 <ArrowRightIcon size={15} className={ui.cardMoreIcon} /></span>
          </span>
          <span aria-hidden="true" className={`${ui.picture} ${ui.supportVisual}`}>
            <Image src="/images/support-qr-goods-card.webp" alt="" fill sizes="260px" className={`object-cover object-[30%_52%] ${ui.zoomImage}`} />
            <span className={ui.supportTag}>Remember A Child</span>
          </span>
        </button>
        <button ref={campaignRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("campaign")} className={`${ui.card} ${ui.cardCampaign}`}>
          <span className={ui.cardCopy}>
            <span className={ui.cardLabel}><span aria-hidden="true" className={ui.cardIcon}><UsersIcon size={18} /></span>03 · 함께하는 캠페인</span>
            <span className={ui.cardTitle}>일상 곳곳에서, 한 번 더 보게 합니다</span>
            <span className={ui.cardText}>편의점 계산대, 택배 상자, 결제 화면, 기내 모니터까지. 실종아동의 얼굴을 일상에서 다시 보게 하는 캠페인들을 소개합니다.</span>
            <span className={ui.campaignPlaces}>
              {CAMPAIGN_PLACES.map(place => <span key={place} className={ui.campaignPlace}>{place}</span>)}
            </span>
            <span className={ui.cardMore}>자세히 보기 <ArrowRightIcon size={15} className={ui.cardMoreIcon} /></span>
          </span>
          <span aria-hidden="true" className={ui.picture}>
            <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="280px" className={`object-cover object-[center_40%] ${ui.zoomImage}`} />
            <span className={ui.supportTag}>실종아동네컷</span>
          </span>
        </button>
      </div>

      {open === "service" && (
        <Modal bare mobileFullscreen title="서비스 소개" onClose={() => setOpen(null)} returnFocusTo={serviceRef.current}>
          <ServiceGuide />
        </Modal>
      )}
      {open === "campaign" && (
        <Modal bare mobileFullscreen title="함께하는 캠페인" onClose={() => setOpen(null)} returnFocusTo={campaignRef.current}>
          <CampaignGuide />
        </Modal>
      )}
      {open === "support" && (
        <Modal bare mobileFullscreen title="후원 안내" onClose={() => setOpen(null)} returnFocusTo={supportRef.current}>
          <SupportGuide />
        </Modal>
      )}
    </section>
  );
}

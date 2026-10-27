"use client";
import { Nanum_Pen_Script, Noto_Serif_KR } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { MissingPerson } from "@/lib/types";
import HomeChildren from "./HomeChildren";
import HomeFeaturedPopup from "./HomeFeaturedPopup";
import { ArrowRightIcon, PhoneIcon, SparklesIcon } from "./Icons";
import HomeServiceCards from "./HomeServiceCards";
import HomeStory from "./HomeStory";
import { useScrollReveal } from "./useScrollReveal";

const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const serif = Noto_Serif_KR({ weight: ["500", "600"], subsets: ["latin"], display: "swap", preload: false });

// Home page: calm public-service tone — navy type, one brand blue, soft neutral surfaces.
// The page re-tones the shared color tokens for everything inside it, and owns the scroll-reveal motion:
// blocks marked data-reveal fade up once; "stagger" reveals its children in turn.
const page = [
  "bg-white text-ink [--color-brand:#3978B8] [--color-brand-dark:#173B70] [--color-brand-soft:#EAF2F9] [--color-ink:#1C2F4D] [--color-muted:#5C6F86] [--color-subtle:#62748C] [--color-line:#DCE5F0] [--ease-out:cubic-bezier(.2,.7,.2,1)]",
  "[&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-brand [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-brand",
  "[&[data-motion=on]_[data-reveal]:not([data-revealed])]:opacity-0",
  "[&_[data-reveal][data-revealed=in]:not([data-reveal=stagger])]:animate-home-reveal-up [&_[data-reveal=stagger][data-revealed=in]>*]:animate-home-reveal-up",
  "[&_[data-reveal=stagger][data-revealed=in]>:nth-child(2)]:[animation-delay:.08s] [&_[data-reveal=stagger][data-revealed=in]>:nth-child(3)]:[animation-delay:.16s] [&_[data-reveal=stagger][data-revealed=in]>:nth-child(4)]:[animation-delay:.24s] [&_[data-reveal=stagger][data-revealed=in]>:nth-child(5)]:[animation-delay:.32s]",
  "motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! motion-reduce:[&_*::before]:animate-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::after]:animate-none! motion-reduce:[&_*::after]:transition-none!",
].join(" ");

// On wide screens the campaign photo fills the whole hero, softened to stay in the background. It is drawn wider than the
// hero and shifted left so the child's face lands in the middle, clear of the copy and the right column.
// A light veil on the left keeps the copy readable, and the bottom fades into the next section.
// Narrower screens go back to a softer photo anchored on the right.
const heroVisual = "pointer-events-none absolute inset-y-0 right-auto left-[-30%] z-0 w-[130%] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_23%,rgba(255,255,255,.62)_26%,rgba(255,255,255,.3)_45%,rgba(255,255,255,0)_62%),linear-gradient(180deg,rgba(255,255,255,0)_78%,#FFFFFF_100%)] after:content-[''] max-[1000px]:right-0 max-[1000px]:left-auto max-[1000px]:w-[58%] max-[1000px]:after:bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.35)_72%,#FFFFFF_100%)] max-[720px]:w-full";
const heroVisualImage = "animate-home-slow-zoom object-cover object-[center_32%] opacity-55 saturate-[.85] max-[1000px]:opacity-62 max-[1000px]:saturate-[.8] max-[1000px]:[-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_38%)] max-[1000px]:[mask-image:linear-gradient(90deg,transparent_0%,#000_38%)] max-[720px]:opacity-28 max-[720px]:[-webkit-mask-image:linear-gradient(180deg,#000_0%,transparent_75%)] max-[720px]:[mask-image:linear-gradient(180deg,#000_0%,transparent_75%)]";
const heroCopy = "*:animate-[home-reveal-up_.9s_cubic-bezier(.2,.7,.2,1)_backwards] [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.16s] [&>:nth-child(4)]:[animation-delay:.22s]";
const heroPhotoCard = "group/photo relative m-0 min-w-0 rounded-[20px] border border-white/90 bg-white/82 p-2 shadow-[0_18px_40px_rgba(23,59,112,.12)] backdrop-blur-[10px] [transition:transform_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease] hover:[transform:translateY(-6px)] hover:shadow-[0_24px_48px_rgba(23,59,112,.16)] max-[720px]:rounded-[18px] max-[720px]:p-[7px]";
const heroPhotoImage = "relative aspect-square overflow-hidden rounded-[14px] bg-brand-soft max-[720px]:rounded-xl";
const heroPhotoImg = "object-cover object-[center_30%] [transition:transform_.6s_cubic-bezier(.2,.7,.2,1)] group-hover/photo:[transform:scale(1.04)]";
const heroPhotoCaption = "flex items-center justify-center gap-1.5 px-1 pt-[7px] pb-px text-[12px] font-bold text-brand-dark max-[720px]:pt-2";

// Closing: a full-bleed sky photo with the copy laid over its left side as page text.
// Softened the same way as the hero photo: faded onto white and slightly desaturated, no veil and no gradient,
// so the band reads light and calm. When the band scrolls in, the copy settles in line by line and the photo eases in.
const closingCopy = "page-container relative z-1 flex h-full flex-col justify-center text-brand-dark [text-shadow:0_1px_12px_rgba(255,255,255,.7)] [[data-revealed=in]_&>*]:animate-home-reveal-up [[data-revealed=in]_&>:nth-child(2)]:[animation-delay:.08s] [[data-revealed=in]_&>:nth-child(3)]:[animation-delay:.16s] [[data-revealed=in]_&>:nth-child(4)]:[animation-delay:.24s] [[data-revealed=in]_&>:nth-child(5)]:[animation-delay:.32s] max-[720px]:h-auto max-[720px]:pt-[22px] max-[720px]:pb-8 max-[720px]:[text-shadow:none]";
const closingPairFigure = "group/pair m-0 grid justify-items-center gap-[5px]";
const closingPairImage = "h-auto w-[66px] rounded-[9px] border-2 border-white shadow-[0_6px_16px_rgba(23,59,112,.16)] [transition:transform_.4s_cubic-bezier(.2,.7,.2,1)] group-hover/pair:[transform:translateY(-3px)] max-[720px]:shadow-[0_6px_16px_rgba(23,59,112,.14)]";
const closingPairCaption = "rounded-full bg-brand-dark px-[9px] py-0.5 text-[11.5px] font-semibold text-white [text-shadow:none]";

export default function HomeLanding({ persons, featured }: { persons: MissingPerson[]; featured: MissingPerson | null }) {
  const pageRef = useScrollReveal<HTMLDivElement>();
  return <div ref={pageRef} className={page}>
    <section className="relative overflow-hidden bg-white" aria-labelledby="home-title">
      <div className={heroVisual}><Image src="/images/search-campaign-hope.png" alt="햇살 아래 인형을 안고 있는 아이의 모습 · AI 캠페인 이미지" fill priority sizes="100vw" className={heroVisualImage} /><span className="absolute right-4 bottom-[60px] z-1 text-[11.5px] tracking-[.01em] text-[#8A99AC] opacity-85">AI로 제작한 캠페인 이미지</span></div>
      {/* The bottom padding leaves room for the shortcut row, which overlaps the hero's bottom edge. */}
      <div className="page-container relative z-1 grid min-h-0 grid-cols-[minmax(0,640px)] pt-16 pb-28 max-[1000px]:pt-12 max-[1000px]:pb-24 max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:pt-9 max-[720px]:pb-18">
        <div className="grid min-w-0 gap-[26px] max-[1000px]:gap-4">
        <div className={heroCopy}>
          <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(57,120,184,.14)] bg-white/75 px-[13px] py-1.5 text-[12px] font-bold tracking-[.02em] text-brand backdrop-blur-[6px]"><span className="size-1.5 animate-home-dot-pulse rounded-full bg-[#F28B82]" />아이를 기억하는 마음, FindUs</p>
          <h1 id="home-title" className="mt-5 text-[44px] leading-[1.24] font-extrabold tracking-[-1.8px] break-keep text-brand-dark max-[1000px]:text-[38px] max-[1000px]:tracking-[-1.3px] max-[720px]:mt-4 max-[720px]:text-[31px] max-[720px]:leading-[1.3] max-[720px]:tracking-[-1px]">다시 그린 얼굴에,<br /><em className="text-brand not-italic">우리의 마음을 더하다.</em></h1>
          <p className="mt-[18px] max-w-[32em] text-[16.5px] leading-[1.7] font-semibold break-keep text-[#3D5877] max-[1000px]:text-[15.5px] max-[720px]:mt-4 max-[720px]:text-[14.5px] max-[720px]:[&_br]:hidden">AI 나이 예측으로 시간이 흐른 아이의 얼굴을 다시 그려,<br />기다리는 가족에게 다시 만날 희망을 이어갑니다.</p>
        </div>
        <div className="grid justify-items-start gap-3.5 max-[720px]:gap-3">
        <div className="relative grid w-[min(100%,270px)] grid-cols-2 items-start gap-4 max-[1000px]:w-[min(100%,300px)] max-[720px]:gap-3.5" aria-label="AI로 만든 가상 인물 예시 사진">
          <figure className={`${heroPhotoCard} animate-[home-photo-in_1s_cubic-bezier(.2,.7,.2,1)_.25s_backwards]`}>
            <div className={heroPhotoImage}><Image src="/images/mock-persons/MC-2008-0915/past.jpg" alt="AI로 만든 가상 인물의 어린 시절 예시" fill sizes="(max-width: 640px) 42vw, 240px" quality={90} className={heroPhotoImg} /></div>
            <figcaption className={heroPhotoCaption}>어린 시절 예시</figcaption>
          </figure>
          <span className="absolute top-[calc(50%-3px)] left-1/2 z-2 grid size-[38px] -translate-1/2 animate-[fade-in_.6s_ease_.7s_backwards] place-items-center rounded-full border border-line bg-white text-brand shadow-[0_6px_16px_rgba(23,59,112,.12)] max-[720px]:size-8" aria-hidden="true"><ArrowRightIcon size={16} /></span>
          <figure className={`${heroPhotoCard} mt-3.5 animate-[home-photo-in_1s_cubic-bezier(.2,.7,.2,1)_.4s_backwards] max-[720px]:mt-[18px]`}>
            <div className={heroPhotoImage}><Image src="/images/mock-persons/MC-2008-0915/aged.jpg" alt="AI로 만든 가상 인물의 현재 추정 모습" fill sizes="(max-width: 640px) 42vw, 240px" quality={90} className={heroPhotoImg} /></div>
            <figcaption className={heroPhotoCaption}><span className="rounded-md bg-brand px-[7px] py-0.5 text-[10.5px] font-extrabold tracking-[.04em] text-white">AI</span> 예상 모습</figcaption>
          </figure>
        </div>
        {/* Under the example: the caveat first, then the guide that explains it, read in that order.
            The link is a text line with a standing brand-blue underline, so it reads as clickable without becoming another box. */}
        <div className="grid justify-items-start gap-2 pl-0.5">
          <p className="animate-[fade-in_.6s_ease_.8s_backwards] text-[12.5px] tracking-[.01em] text-muted">가상 인물 예시 · 실제 모습과 다를 수 있습니다</p>
          <Link href="/help?tab=ai" className="group/ai inline-flex animate-[fade-in_.6s_ease_.85s_backwards] items-center gap-1.5 rounded-md text-[15px] font-extrabold tracking-[-.3px] text-brand-dark"><SparklesIcon size={15} aria-hidden="true" className="flex-none text-brand" /><span className="underline decoration-[rgba(57,120,184,.45)] decoration-2 underline-offset-5 [transition:text-decoration-color_.25s_ease] group-hover/ai:decoration-brand">AI 나이 예측은 어떻게 하나요?</span><ArrowRightIcon size={14} strokeWidth={2.4} aria-hidden="true" className="flex-none text-brand [transition:transform_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/ai:[transform:translateX(3px)]" /></Link>
        </div>
        </div>
        </div>
      </div>
    </section>

    {/* The four shortcuts run in one row across the hero's bottom edge, so the campaign child above stays clear. */}
    {/* The popup carries the full emergency box; once it is closed, this quiet line keeps the numbers on the page. */}
    <div className="page-container relative z-2 -mt-12 max-[720px]:-mt-10">
      <HomeServiceCards />
      <p className="mt-3.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[13px] text-muted max-[720px]:justify-start [&>svg]:text-[#C9483F] [&_a]:font-extrabold [&_a]:text-[#B4473F] [&_a]:underline [&_a]:decoration-[rgba(201,72,63,.35)] [&_a]:underline-offset-3 [&_a:hover]:decoration-[#C9483F]"><PhoneIcon size={14} strokeWidth={2.2} aria-hidden="true" />지금 아이를 잃어버렸다면 바로 <a href="tel:112">112 긴급 신고</a><span aria-hidden="true" className="text-[#C5CFDB]">·</span><a href="tel:182">182 실종 상담</a></p>
    </div>

    {featured && <HomeFeaturedPopup person={featured} />}

    <HomeChildren persons={persons} />

    <HomeStory />

    <section className="relative overflow-hidden" aria-labelledby="closing-title" data-reveal>
      {/* The sky photo carries no copy; the copy is page text laid over its left side, so it stays sharp at any height.
          On phones the photo is cropped to the two people and the copy moves below it. */}
      {/* Same veil as the hero: a soft white wash behind the copy on the left, and the top and bottom edges
          melting into the white page, so the band sits in the page instead of looking pasted on. */}
      <div className="relative h-[clamp(340px,28vw,420px)] bg-white after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,.72)_0%,rgba(255,255,255,.5)_30%,rgba(255,255,255,0)_52%),linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_16%,rgba(255,255,255,0)_80%,#FFFFFF_100%)] after:content-[''] max-[720px]:h-auto max-[720px]:bg-transparent max-[720px]:after:hidden">
        <Image src="/images/home-closing-sky.webp" alt="" fill sizes="100vw" unoptimized className="object-cover object-[62%_42%] opacity-[.62] saturate-[.85] [[data-revealed=in]_&]:animate-home-slow-zoom max-[720px]:relative! max-[720px]:block max-[720px]:aspect-[4/3] max-[720px]:h-auto! max-[720px]:w-full! max-[720px]:object-[66%_40%]" />
        <div className={closingCopy}>
          <p className={`${serif.className} border-l-[1.5px] border-brand pl-3.5 text-[17px] font-medium tracking-[.06em] text-[#25508F] max-[720px]:text-brand`}>함께 기억하는 <strong className="ml-1 text-[25px] font-semibold tracking-[.01em] text-brand-dark">FindUs</strong></p>
          <h2 id="closing-title" className={`${serif.className} mt-4 pl-[15px] text-[23px] leading-[1.42] font-medium tracking-[-.2px] break-keep text-brand-dark`}>AI로 그리는 오늘,<br /><em className="font-semibold text-brand not-italic">가족에게 돌아가는 내일.</em></h2>
          <p className="mt-3 pl-[15px] text-[12.5px] leading-[1.6] break-keep text-[#3D5877] max-[720px]:text-[#4A5D75]">실종 원본 사진을 기반으로 AI가 나이 예측을 통해 미래의 모습을 그립니다.</p>
          <div className="mt-[18px] flex items-center gap-3.5 pl-[15px]" aria-label="AI 나이 예측 예시">
            <figure className={closingPairFigure}><Image src="/images/home-closing-past.webp" alt="AI로 만든 가상 인물의 어린 시절 예시" width={240} height={224} className={closingPairImage} /><figcaption className={closingPairCaption}>실종 원본</figcaption></figure>
            <span aria-hidden="true" className="grid text-brand"><ArrowRightIcon size={14} /></span>
            <figure className={closingPairFigure}><Image src="/images/home-closing-aged.webp" alt="AI로 만든 가상 인물의 현재 추정 모습" width={240} height={224} className={closingPairImage} /><figcaption className={closingPairCaption}>미래 예측 이미지</figcaption></figure>
          </div>
          <p className="mt-[18px] pl-[15px] text-[12.5px] font-semibold text-brand-dark before:mb-2 before:block before:h-px before:w-[22px] before:bg-[#9FB6D2] before:content-[''] max-[720px]:text-[#4A5D75] max-[720px]:before:bg-[#C7D6E8]">잊지 않고 기억하며, 다시 만날 희망을 이어갑니다.</p>
        </div>
        <p className={`${pen.className} absolute top-[14%] right-[max(24px,calc((100%-1200px)/2+40px))] z-1 rotate-[-6deg] text-[21px] leading-[1.3] text-[#25508F] [text-shadow:0_1px_10px_rgba(255,255,255,.7)] [[data-revealed=in]_&]:animate-[fade-in_1.2s_ease_.5s_backwards] max-[720px]:hidden`}>기술이<br />기억을 이어,<br />사랑이 다시 만듭니다.</p>
      </div>
    </section>
  </div>;
}

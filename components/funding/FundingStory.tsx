"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { STORY, type StoryImage } from "@/lib/fundingStory";
import { useCountUp, useInView, useReducedMotion } from "@/lib/useMotion";
import { ArrowUpRightIcon, ImageIcon, PhoneIcon } from "../Icons";
import Reveal from "./Reveal";
import { storyInner } from "./styles";

// 이야기 구역은 책자 톤(--story-*, 펀딩 페이지 바탕에서 정함)을 쓴다.
const CHAPTER = "py-[88px] max-md:py-16";
const PAPER = "bg-(--story-paper)";
const STORY_TITLE = "mt-3.5 text-[36px] leading-[1.35] font-extrabold tracking-[-.8px] break-keep max-md:text-[28px]";
const STORY_BODY = "mt-[18px] text-[17px] leading-[1.9] break-keep";
const STORY_NOTE = "mt-[22px] text-[13px] leading-[1.6] text-[#7A8590]";
const PHOTO_EMPTY = "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(-45deg,#EAE3DA_0_10px,#E4DCD1_10px_20px)] text-[13px] font-bold text-[#8B7B6E] [&_code]:text-[11px] [&_code]:font-medium [&_code]:opacity-80";
/** 사진 틀. 비율과 모양은 놓이는 자리마다 다르다. */
const FRAME = {
  default: "aspect-[4/5] rounded-[6px]",
  wide: "aspect-video rounded-[6px]",
  profile: "aspect-[4/5] rounded-[4px] border-8 border-white shadow-[0_18px_40px_rgb(37_48_59/18%)] [rotate:-2deg]",
  waiting: "aspect-[4/3] rounded-[6px] max-lg:aspect-video",
} as const;
const COMPARE_MOVE = "[[data-animate=true]_&]:[transition:clip-path_1.6s_cubic-bezier(.6,0,.2,1),left_1.6s_cubic-bezier(.6,0,.2,1)]";
const COMPARE_TAG = "absolute bottom-3 rounded-[6px] bg-[rgb(37_48_59/72%)] px-[9px] py-[5px] text-[12px] font-bold text-white";
const CLOSING_CALL = "inline-flex items-center gap-2 rounded-xl border border-[#556474] px-4 py-[11px] text-[14px] text-[#E7ECF1] [transition:background-color_.2s] hover:bg-[#334150] [&_strong]:text-[17px] [&_strong]:text-white";

/** 경찰청 공개 사진(실종아동 DB)으로 대신할 때의 캡션 */
const OFFICIAL_CAPTION = "경찰청 공개 사진 · 자료 출처: 경찰청";

/**
 * 사진 파일이 아직 없으면 자리 표시를 보여준다.
 * fallbackSrc(실종아동 DB의 공식 사진)가 있으면 자리 표시 대신 그 사진을 쓴다.
 */
function StoryPhoto({ image, available, sizes, className = "", fallbackSrc = null, frame = "default" }: { image: StoryImage; available: boolean; sizes: string; className?: string; fallbackSrc?: string | null; frame?: keyof typeof FRAME }) {
  const official = !available && !!fallbackSrc;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden bg-(--story-sand) [&_img]:object-cover ${FRAME[frame]}`}>
        {available ? <Image quality={90} src={image.src} alt={image.alt} fill sizes={sizes} /> : official ? <Image src={fallbackSrc} alt={image.alt} fill sizes={sizes} unoptimized style={{ objectFit: "cover" }} /> : (
          <div className={PHOTO_EMPTY} role="img" aria-label={`${image.alt} (사진 준비 중)`}>
            <ImageIcon size={26} />
            <span>사진 준비 중</span>
            <code>{image.src.split("/").at(-1)}</code>
          </div>
        )}
      </div>
      <figcaption className="mt-2.5 text-[12px] leading-[1.5] break-keep text-[#7A8590]">{official ? OFFICIAL_CAPTION : image.caption}</figcaption>
    </figure>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-bold tracking-[.16em] text-(--story-brown)">{children}</p>;
}

/** 2000 → 2026 연도가 올라가며 기다린 시간을 보여준다. */
function YearsCounter() {
  const [ref, inView] = useInView<HTMLDivElement>(0.6);
  const year = useCountUp(2026, { start: inView, from: 2000, duration: 2200 });
  return (
    <div ref={ref} className="mt-[34px] flex items-center gap-[18px] text-[64px] font-light tracking-[-2px] text-(--story-brown) tabular-nums max-md:gap-3 max-md:text-[44px]" aria-label="2000년부터 2026년까지 26년">
      <span aria-hidden="true">2000</span>
      <span aria-hidden="true" className="h-[3px] max-w-[220px] flex-1 origin-left bg-(--story-brown) [transform:scaleX(0)] [transition:transform_2.2s_cubic-bezier(.3,.7,.2,1)] data-[visible=true]:[transform:scaleX(1)]" data-visible={inView} />
      <span aria-hidden="true" className="font-semibold">{Math.round(year)}</span>
    </div>
  );
}

/** 당시 사진과 추정 이미지를 가르는 와이프 비교. 화면에 들어오면 한 번 저절로 움직인다. */
function PhotoCompare({ available, childPhotoUrl }: { available: (src: string) => boolean; childPhotoUrl: string | null }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const reduced = useReducedMotion();
  const [split, setSplit] = useState(100);
  const [touched, setTouched] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!inView || touched) return;
    if (reduced) { setSplit(50); return; }
    const timer = window.setTimeout(() => setSplit(50), 300);
    return () => window.clearTimeout(timer);
  }, [inView, reduced, touched]);

  const child = STORY.childPhoto;
  const aged = STORY.agedPhoto;
  return (
    <div ref={ref} className="w-full">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-(--story-sand) select-none" data-animate={!touched} style={{ "--split": `${split}%` } as React.CSSProperties}>
        <div className="absolute inset-0 [&_img]:object-cover">
          {available(aged.src) ? <Image quality={90} src={aged.src} alt={aged.alt} fill sizes="(min-width: 768px) 420px, 90vw" /> : <div className={PHOTO_EMPTY}><ImageIcon size={26} /><span>성인 추정 이미지 준비 중</span><code>aged.jpg</code></div>}
        </div>
        <div className={`absolute inset-0 [clip-path:inset(0_calc(100%_-_var(--split))_0_0)] [&_img]:object-cover ${COMPARE_MOVE}`}>
          {available(child.src) ? <Image quality={90} src={child.src} alt={child.alt} fill sizes="(min-width: 768px) 420px, 90vw" /> : childPhotoUrl ? <Image src={childPhotoUrl} alt={child.alt} fill sizes="(min-width: 768px) 420px, 90vw" unoptimized style={{ objectFit: "cover" }} /> : <div className={PHOTO_EMPTY}><ImageIcon size={26} /><span>당시 사진 준비 중</span><code>child.jpg</code></div>}
        </div>
        <span className={`absolute inset-y-0 left-(--split) -ml-[1.5px] w-[3px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/8%)] after:absolute after:top-1/2 after:left-1/2 after:grid after:size-[38px] after:place-items-center after:rounded-full after:bg-white after:text-[18px] after:text-(--story-brown) after:shadow-[0_4px_14px_rgb(0_0_0/18%)] after:[translate:-50%_-50%] after:content-['⟷'] ${COMPARE_MOVE}`} aria-hidden="true" />
        <span className={`${COMPARE_TAG} left-3`}>2000 · 당시 사진</span>
        <span className={`${COMPARE_TAG} right-3`}>추정 이미지</span>
      </div>
      <label htmlFor={id} className="sr-only">당시 사진과 추정 이미지 비교 위치</label>
      <input id={id} type="range" min={0} max={100} value={split} onChange={(event) => { setTouched(true); setSplit(Number(event.target.value)); }} className="mt-3.5 w-full accent-(--story-brown)" />
      <p className="mt-2 text-[12px] leading-[1.6] text-[#7A8590]">왼쪽 · {available(child.src) || !childPhotoUrl ? child.caption : OFFICIAL_CAPTION}<br />오른쪽 · {aged.caption}</p>
    </div>
  );
}

export default function FundingStory({ availableImages, childPhotoUrl = null }: { availableImages: string[]; childPhotoUrl?: string | null }) {
  const available = (src: string) => availableImages.includes(src);
  const { person, day, sighting, waiting } = STORY;

  return (
    <div className="bg-white text-(--story-ink)">
      {/* ① 그날 */}
      <section className={CHAPTER} aria-labelledby="story-day">
        <div className={`page-container ${storyInner}`}>
          <Reveal><Eyebrow>01 · THE DAY</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 id="story-day" className="mt-4 flex flex-col text-[56px] leading-[1.15] font-extrabold tracking-[-1.6px] max-md:text-[42px]">{day.date}<span className="mt-1.5 text-[48px] font-bold text-(--story-brown) max-md:text-[34px]">{day.weekday}</span></h2>
          </Reveal>
          <ol className="relative mt-11 pl-7 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-0.5 before:bg-[linear-gradient(var(--story-brown),var(--story-sand))] before:content-['']">
            {day.timeline.map((item, index) => (
              <Reveal as="li" key={item.time} delay={200 + index * 220} className="relative border-b border-[#E6E2DB] pt-3.5 pb-[18px] before:absolute before:top-[22px] before:-left-7 before:size-3 before:rounded-full before:border-3 before:border-(--story-brown) before:bg-white before:content-[''] last:before:bg-(--story-brown) last:before:shadow-[0_0_0_6px_rgb(138_90_68/15%)]">
                <strong className="text-[18px] font-extrabold">{item.time}</strong>
                <p className="mt-1.5 text-[16px] leading-[1.75] break-keep">{item.text}</p>
              </Reveal>
            ))}
          </ol>
          <p className={STORY_NOTE}>{day.note}</p>
        </div>
      </section>

      {/* ② 프로필 */}
      <section className={`${CHAPTER} ${PAPER}`} aria-labelledby="story-profile">
        <div className={`page-container ${storyInner} grid grid-cols-[280px_minmax(0,1fr)] items-center gap-12 max-lg:grid-cols-1 max-lg:gap-7`}>
          <Reveal className="max-lg:max-w-[260px]">
            <StoryPhoto image={STORY.childPhoto} available={available(STORY.childPhoto.src)} fallbackSrc={childPhotoUrl} sizes="(min-width: 768px) 280px, 70vw" frame="profile" />
          </Reveal>
          <div>
            <Reveal><Eyebrow>02 · PROFILE</Eyebrow></Reveal>
            <Reveal delay={100}><h2 id="story-profile" className={STORY_TITLE}>{person.name}님을 찾습니다</h2></Reveal>
            <Reveal delay={200}>
              <p className="mt-[18px] text-[17px] leading-[1.8] break-keep">{person.name} ({person.gender}) · {person.birth} 출생 · {person.missingDate} 실종 · <strong>실종 당시 {person.ageAtMissing}</strong></p>
              <dl className="mt-[22px] border-t border-[#DCD5CB] [&_dd]:mt-1 [&_dd]:text-[16px] [&_dd]:leading-[1.7] [&_dd]:break-keep [&_div]:border-b [&_div]:border-[#DCD5CB] [&_div]:py-3.5 [&_dt]:text-[15px] [&_dt]:font-extrabold">
                <div><dt>실종 장소</dt><dd>{person.place}</dd></div>
                <div><dt>실종 당시 신체 정보</dt><dd>{person.body}</dd></div>
                <div><dt>당시 특징으로 보도된 내용</dt><dd>{person.features}</dd></div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ③ 확인되지 않은 이야기 */}
      <section className={CHAPTER} aria-labelledby="story-sighting">
        <div className={`page-container ${storyInner}`}>
          <Reveal><Eyebrow>03 · LAST REPORTED SIGHTING</Eyebrow></Reveal>
          <Reveal delay={100}><h2 id="story-sighting" className={STORY_TITLE}>마지막 목격 장소로<br />보도된 곳</h2></Reveal>
          <div className="mt-8 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-9 max-lg:grid-cols-1 max-lg:gap-7">
            <Reveal delay={150}><StoryPhoto image={sighting.image} available={available(sighting.image.src)} sizes="(min-width: 1024px) 600px, 92vw" frame="wide" /></Reveal>
            <Reveal delay={250}>
              <p className={STORY_BODY}>{sighting.text}</p>
              <div className="mt-[22px] border-l-4 border-(--story-brown) bg-[#F0EEEA] px-[22px] py-5">
                <strong className="text-[15px]">중요한 구분</strong>
                <p className="mt-1.5 text-[15px] leading-[1.75] break-keep">{sighting.caution}</p>
              </div>
              <p className={STORY_NOTE}>출처: {sighting.source}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ④ 26년의 기다림 */}
      <section className={`${CHAPTER} ${PAPER}`} aria-labelledby="story-waiting">
        <div className={`page-container ${storyInner}`}>
          <Reveal><Eyebrow>04 · THE FAMILY</Eyebrow></Reveal>
          <Reveal delay={100}><h2 id="story-waiting" className={STORY_TITLE}>오랫동안 이어진<br />가족의 기다림</h2></Reveal>
          <YearsCounter />
          <ol className="mt-10 grid grid-cols-3 gap-6 max-lg:grid-cols-1">
            {waiting.map((item, index) => (
              <Reveal as="li" key={item.year} delay={index * 180}>
                <StoryPhoto image={item.image} available={available(item.image.src)} sizes="(min-width: 1024px) 360px, 80vw" frame="waiting" />
                <p className="mt-[18px] text-[14px] font-extrabold tracking-[.08em] text-(--story-brown)">{item.year}</p>
                <h3 className="mt-1 text-[19px] font-extrabold">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.75] break-keep">{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ⑤ 사진 밖의 시간 */}
      <section className={CHAPTER} aria-labelledby="story-time">
        <div className={`page-container ${storyInner} grid grid-cols-[minmax(0,1fr)_minmax(0,420px)] items-center gap-12 max-lg:grid-cols-1 max-lg:gap-7`}>
          <div>
            <Reveal><Eyebrow>05 · REMEMBER THE PERSON</Eyebrow></Reveal>
            <Reveal delay={100}><h2 id="story-time" className={STORY_TITLE}>사진 밖의 시간을<br />기억합니다</h2></Reveal>
            <Reveal delay={200}>
              <p className={STORY_BODY}>우리가 알고 있는 얼굴은 어린 시절의 사진입니다. 그러나 실종된 한 사람의 삶은 사진이 찍힌 순간에 멈춰 있는 것이 아닙니다.</p>
              <p className={STORY_BODY}>오른쪽 이미지는 성인이 된 {person.name}님의 실제 사진이 아니라, 나이가 든 모습을 기술적으로 추정해 만든 이미지입니다. 비슷한 사람을 봤다고 생각하더라도 온라인에서 신원을 추측하거나 공개적으로 지목하지 말고 <strong>182</strong>로 직접 전해 주세요.</p>
            </Reveal>
          </div>
          <Reveal delay={150}><PhotoCompare available={available} childPhotoUrl={childPhotoUrl} /></Reveal>
        </div>
      </section>

      {/* ⑥ 펀딩으로 잇는 문장 + 마무리 */}
      <section className="bg-[#25303B] pt-24 pb-[72px] text-[#E7ECF1]" aria-labelledby="story-closing">
        <div className={`page-container ${storyInner}`}>
          <Reveal><p className="text-[13px] font-bold tracking-[.16em] text-[#E3B9A3]">REMEMBER · REPORT</p></Reveal>
          <Reveal delay={100}><h2 id="story-closing" className="mt-[18px] text-[44px] leading-[1.3] font-extrabold tracking-[-1px] text-white max-md:text-[34px]">{person.name}님을<br />기억해 주세요.</h2></Reveal>
          <Reveal delay={200}>
            <p className="mt-[26px] text-[18px] leading-[1.8]">2000년 4월 4일, 그날을 기억하는 누군가가 아직 있을지 모릅니다.</p>
            <p className="mt-[30px] border-t border-[#4A5866] pt-[30px] text-[20px] leading-[1.8] break-keep max-md:text-[17px]">사진 한 장은 몇 달이면 잊히지만, 매일 드는 가방의 QR은 몇 년 동안 길 위에 남습니다.<br />그래서 FindUs는 <em className="font-extrabold text-[#FFB3A8] not-italic">기억을 들고 다니는 굿즈</em>를 만듭니다.</p>
          </Reveal>
          <Reveal delay={300} className="mt-7 flex flex-wrap gap-2.5">
            <a href="tel:182" className={CLOSING_CALL}><PhoneIcon size={16} />실종 관련 제보 <strong>182</strong></a>
            <a href="tel:112" className={CLOSING_CALL}><PhoneIcon size={16} />긴급 신고 <strong>112</strong></a>
          </Reveal>
          <div className="mt-10 border-t border-[#3B4856] pt-[22px] text-[13px] leading-[1.75] break-keep text-[#AEB8C3]">
            <p>이 펀딩은 QR 굿즈로 {person.name}님을 다시 보게 하는 찾기 펀딩입니다. 모인 돈은 굿즈 제작, {person.name}님 찾기 홍보, 실종아동 가족 지원에만 쓰고 FindUs 운영비로 쓰지 않습니다. {person.name}님의 이야기는 가족과 권리자의 동의를 받아 소개합니다. 목격담은 확인된 사실과 구별해 실었고, 추측으로 누군가를 지목하지 않습니다.</p>
            <details className="mt-3">
              <summary className="cursor-pointer font-bold text-[#D5DDE6]">이야기의 출처 보기</summary>
              <ul className="my-3 grid grid-cols-2 gap-x-5 gap-y-1.5 max-md:grid-cols-1">
                {STORY.sources.map((source) => (
                  <li key={source.label}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#D5DDE6] underline underline-offset-[3px]">{source.label} · {source.title} <ArrowUpRightIcon size={13} /></a>
                  </li>
                ))}
              </ul>
              <p>책자 「{person.name}, 기억을 잇다」 기록 기준 2026년 10월 20일. 경찰이나 가족을 대리하는 공식 수사 문서가 아닙니다.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}

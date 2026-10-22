"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { STORY, type StoryImage } from "@/lib/fundingStory";
import { useCountUp, useInView, useReducedMotion } from "@/lib/useMotion";
import { ArrowUpRightIcon, ImageIcon, PhoneIcon } from "../Icons";
import Reveal from "./Reveal";
import styles from "./Funding.module.css";

/** 경찰청 공개 사진(실종아동 DB)으로 대신할 때의 캡션 */
const OFFICIAL_CAPTION = "경찰청 공개 사진 · 자료 출처: 경찰청";

/**
 * 사진 파일이 아직 없으면 자리 표시를 보여준다.
 * fallbackSrc(실종아동 DB의 공식 사진)가 있으면 자리 표시 대신 그 사진을 쓴다.
 */
function StoryPhoto({ image, available, sizes, className = "", fallbackSrc = null }: { image: StoryImage; available: boolean; sizes: string; className?: string; fallbackSrc?: string | null }) {
  const official = !available && !!fallbackSrc;
  return (
    <figure className={`${styles.storyPhoto} ${className}`}>
      <div className={styles.storyPhotoFrame}>
        {available ? <Image src={image.src} alt={image.alt} fill sizes={sizes} /> : official ? <Image src={fallbackSrc} alt={image.alt} fill sizes={sizes} unoptimized style={{ objectFit: "cover" }} /> : (
          <div className={styles.storyPhotoEmpty} role="img" aria-label={`${image.alt} (사진 준비 중)`}>
            <ImageIcon size={26} />
            <span>사진 준비 중</span>
            <code>{image.src.split("/").at(-1)}</code>
          </div>
        )}
      </div>
      <figcaption>{official ? OFFICIAL_CAPTION : image.caption}</figcaption>
    </figure>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className={styles.storyEyebrow}>{children}</p>;
}

/** 2000 → 2026 연도가 올라가며 기다린 시간을 보여준다. */
function YearsCounter() {
  const [ref, inView] = useInView<HTMLDivElement>(0.6);
  const year = useCountUp(2026, { start: inView, from: 2000, duration: 2200 });
  return (
    <div ref={ref} className={styles.years} aria-label="2000년부터 2026년까지 26년">
      <span aria-hidden="true">2000</span>
      <span aria-hidden="true" className={styles.yearsLine} data-visible={inView} />
      <span aria-hidden="true" className={styles.yearsNow}>{Math.round(year)}</span>
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
    <div ref={ref} className={styles.compare}>
      <div className={styles.compareFrame} data-animate={!touched} style={{ "--split": `${split}%` } as React.CSSProperties}>
        <div className={styles.compareLayer}>
          {available(aged.src) ? <Image src={aged.src} alt={aged.alt} fill sizes="(min-width: 768px) 420px, 90vw" /> : <div className={styles.storyPhotoEmpty}><ImageIcon size={26} /><span>성인 추정 이미지 준비 중</span><code>aged.jpg</code></div>}
        </div>
        <div className={`${styles.compareLayer} ${styles.compareTop}`}>
          {available(child.src) ? <Image src={child.src} alt={child.alt} fill sizes="(min-width: 768px) 420px, 90vw" /> : childPhotoUrl ? <Image src={childPhotoUrl} alt={child.alt} fill sizes="(min-width: 768px) 420px, 90vw" unoptimized style={{ objectFit: "cover" }} /> : <div className={styles.storyPhotoEmpty}><ImageIcon size={26} /><span>당시 사진 준비 중</span><code>child.jpg</code></div>}
        </div>
        <span className={styles.compareHandle} aria-hidden="true" />
        <span className={`${styles.compareTag} ${styles.compareTagLeft}`}>2000 · 당시 사진</span>
        <span className={`${styles.compareTag} ${styles.compareTagRight}`}>추정 이미지</span>
      </div>
      <label htmlFor={id} className="sr-only">당시 사진과 추정 이미지 비교 위치</label>
      <input id={id} type="range" min={0} max={100} value={split} onChange={(event) => { setTouched(true); setSplit(Number(event.target.value)); }} className={styles.compareSlider} />
      <p className={styles.compareCaption}>왼쪽 · {available(child.src) || !childPhotoUrl ? child.caption : OFFICIAL_CAPTION}<br />오른쪽 · {aged.caption}</p>
    </div>
  );
}

export default function FundingStory({ availableImages, childPhotoUrl = null }: { availableImages: string[]; childPhotoUrl?: string | null }) {
  const available = (src: string) => availableImages.includes(src);
  const { person, day, sighting, waiting } = STORY;

  return (
    <div className={styles.story}>
      {/* ① 그날 */}
      <section className={styles.storyChapter} aria-labelledby="story-day">
        <div className={`page-container ${styles.storyInner}`}>
          <Reveal><Eyebrow>01 · THE DAY</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 id="story-day" className={styles.storyDate}>{day.date}<span>{day.weekday}</span></h2>
          </Reveal>
          <ol className={styles.timeline}>
            {day.timeline.map((item, index) => (
              <Reveal as="li" key={item.time} delay={200 + index * 220} className={styles.timelineItem}>
                <strong>{item.time}</strong>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ol>
          <p className={styles.storyNote}>{day.note}</p>
        </div>
      </section>

      {/* ② 프로필 */}
      <section className={`${styles.storyChapter} ${styles.storyPaper}`} aria-labelledby="story-profile">
        <div className={`page-container ${styles.storyInner} ${styles.profile}`}>
          <Reveal className={styles.profilePhoto}>
            <StoryPhoto image={STORY.childPhoto} available={available(STORY.childPhoto.src)} fallbackSrc={childPhotoUrl} sizes="(min-width: 768px) 280px, 70vw" />
          </Reveal>
          <div>
            <Reveal><Eyebrow>02 · PROFILE</Eyebrow></Reveal>
            <Reveal delay={100}><h2 id="story-profile" className={styles.storyTitle}>{person.name}님을 찾습니다</h2></Reveal>
            <Reveal delay={200}>
              <p className={styles.profileLead}>{person.name} ({person.gender}) · {person.birth} 출생 · {person.missingDate} 실종 · <strong>실종 당시 {person.ageAtMissing}</strong></p>
              <dl className={styles.profileFacts}>
                <div><dt>실종 장소</dt><dd>{person.place}</dd></div>
                <div><dt>실종 당시 신체 정보</dt><dd>{person.body}</dd></div>
                <div><dt>당시 특징으로 보도된 내용</dt><dd>{person.features}</dd></div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ③ 확인되지 않은 이야기 */}
      <section className={styles.storyChapter} aria-labelledby="story-sighting">
        <div className={`page-container ${styles.storyInner}`}>
          <Reveal><Eyebrow>03 · LAST REPORTED SIGHTING</Eyebrow></Reveal>
          <Reveal delay={100}><h2 id="story-sighting" className={styles.storyTitle}>마지막 목격 장소로<br />보도된 곳</h2></Reveal>
          <div className={styles.sighting}>
            <Reveal delay={150}><StoryPhoto image={sighting.image} available={available(sighting.image.src)} sizes="(min-width: 1024px) 600px, 92vw" className={styles.wide} /></Reveal>
            <Reveal delay={250}>
              <p className={styles.storyBody}>{sighting.text}</p>
              <div className={styles.caution}>
                <strong>중요한 구분</strong>
                <p>{sighting.caution}</p>
              </div>
              <p className={styles.storyNote}>출처: {sighting.source}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ④ 26년의 기다림 */}
      <section className={`${styles.storyChapter} ${styles.storyPaper}`} aria-labelledby="story-waiting">
        <div className={`page-container ${styles.storyInner}`}>
          <Reveal><Eyebrow>04 · THE FAMILY</Eyebrow></Reveal>
          <Reveal delay={100}><h2 id="story-waiting" className={styles.storyTitle}>오랫동안 이어진<br />가족의 기다림</h2></Reveal>
          <YearsCounter />
          <ol className={styles.waiting}>
            {waiting.map((item, index) => (
              <Reveal as="li" key={item.year} delay={index * 180} className={styles.waitingItem}>
                <StoryPhoto image={item.image} available={available(item.image.src)} sizes="(min-width: 1024px) 360px, 80vw" />
                <p className={styles.waitingYear}>{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ⑤ 사진 밖의 시간 */}
      <section className={styles.storyChapter} aria-labelledby="story-time">
        <div className={`page-container ${styles.storyInner} ${styles.timeOutside}`}>
          <div>
            <Reveal><Eyebrow>05 · REMEMBER THE PERSON</Eyebrow></Reveal>
            <Reveal delay={100}><h2 id="story-time" className={styles.storyTitle}>사진 밖의 시간을<br />기억합니다</h2></Reveal>
            <Reveal delay={200}>
              <p className={styles.storyBody}>우리가 알고 있는 얼굴은 어린 시절의 사진입니다. 그러나 실종된 한 사람의 삶은 사진이 찍힌 순간에 멈춰 있는 것이 아닙니다.</p>
              <p className={styles.storyBody}>오른쪽 이미지는 성인이 된 {person.name}님의 실제 사진이 아니라, 나이가 든 모습을 기술적으로 추정해 만든 이미지입니다. 비슷한 사람을 봤다고 생각하더라도 온라인에서 신원을 추측하거나 공개적으로 지목하지 말고 <strong>182</strong>로 직접 전해 주세요.</p>
            </Reveal>
          </div>
          <Reveal delay={150}><PhotoCompare available={available} childPhotoUrl={childPhotoUrl} /></Reveal>
        </div>
      </section>

      {/* ⑥ 펀딩으로 잇는 문장 + 마무리 */}
      <section className={styles.storyClosing} aria-labelledby="story-closing">
        <div className={`page-container ${styles.storyInner}`}>
          <Reveal><p className={styles.storyEyebrowLight}>REMEMBER · REPORT</p></Reveal>
          <Reveal delay={100}><h2 id="story-closing" className="text-white">{person.name}님을<br />기억해 주세요.</h2></Reveal>
          <Reveal delay={200}>
            <p className={styles.closingLead}>2000년 4월 4일, 그날을 기억하는 누군가가 아직 있을지 모릅니다.</p>
            <p className={styles.closingBridge}>사진 한 장은 몇 달이면 잊히지만, 매일 드는 가방의 QR은 몇 년 동안 길 위에 남습니다.<br />그래서 FindUs는 <em>기억을 들고 다니는 굿즈</em>를 만듭니다.</p>
          </Reveal>
          <Reveal delay={300} className={styles.closingCalls}>
            <a href="tel:182"><PhoneIcon size={16} />실종 관련 제보 <strong>182</strong></a>
            <a href="tel:112"><PhoneIcon size={16} />긴급 신고 <strong>112</strong></a>
          </Reveal>
          <div className={styles.closingNotice}>
            <p>이 펀딩은 QR 굿즈로 {person.name}님을 다시 보게 하는 찾기 펀딩입니다. 모인 돈은 굿즈 제작, {person.name}님 찾기 홍보, 실종아동 가족 지원에만 쓰고 FindUs 운영비로 쓰지 않습니다. {person.name}님의 이야기는 가족과 권리자의 동의를 받아 소개합니다. 목격담은 확인된 사실과 구별해 실었고, 추측으로 누군가를 지목하지 않습니다.</p>
            <details>
              <summary>이야기의 출처 보기</summary>
              <ul>
                {STORY.sources.map((source) => (
                  <li key={source.label}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} · {source.title} <ArrowUpRightIcon size={13} /></a>
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

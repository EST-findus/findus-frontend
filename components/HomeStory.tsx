"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Nanum_Pen_Script } from "next/font/google";
import { CAMPAIGN, formatWon } from "@/lib/funding";
import { ArrowRightIcon, HeartIcon, PhoneIcon, SearchIcon, SparklesIcon, UsersIcon } from "./Icons";
import LogoMark from "./LogoMark";
import Modal from "./Modal";
import styles from "./HomeStory.module.css";

// Handwritten accents only; the body text stays in the site font.
const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

const SERVICE_PAST = "/images/mock-persons/MC-2015-0104/past.jpg";
const SERVICE_AGED = "/images/mock-persons/MC-2015-0104/aged.jpg";
const POLAROID = "/images/mock-persons/MC-2001-0812/past.jpg";

type Section = { id: string; label: string; content: ReactNode };

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
    <div ref={sheetRef} className={styles.sheet} data-tone={tone}>
      <aside className={styles.sheetNav}>
        <nav aria-label={`${title} 목차`}>
          <p className={styles.sheetNavEyebrow}><span aria-hidden="true" />FINDUS GUIDE</p>
          <p className={styles.sheetNavTitle}>{title}</p>
          {/* 지금 읽는 위치: 막대와 숫자로 보여준다. */}
          <div className={styles.sheetProgress} aria-hidden="true">
            <span className={styles.sheetProgressBar}><span style={{ width: `${((activeIndex + 1) / sections.length) * 100}%` }} /></span>
            <span className={styles.sheetProgressText}><strong>{activeIndex + 1}</strong> / {sections.length}</span>
          </div>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id} data-state={index < activeIndex ? "done" : index === activeIndex ? "active" : "next"}>
                <button type="button" aria-current={active === section.id ? "true" : undefined} onClick={() => goTo(section.id)}>
                  <span className={styles.sheetStep}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.sheetStepLabel}>{section.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <a href="tel:182" className={styles.sheetHelp}>
            <span aria-hidden="true" className={styles.sheetHelpIcon}><PhoneIcon size={16} strokeWidth={2} /></span>
            <span><small>제보·상담이 필요하다면</small><strong>경찰청 182</strong></span>
          </a>
        </nav>
      </aside>
      <div className={styles.sheetBody}>
        {sections.map(section => <section key={section.id} id={section.id} aria-label={section.label} className={styles.sheetSection}>{section.content}</section>)}
        <div className={styles.sheetEnding}>
          {ending}
          <button type="button" className={styles.toTop} onClick={() => scroller()?.scrollTo({ top: 0, behavior: smooth() ? "smooth" : "auto" })}>
            <ArrowRightIcon size={14} className={styles.toTopIcon} />맨 위로
          </button>
        </div>
      </div>
    </div>
  );
}

function Polaroid({ src, alt, note }: { src: string; alt: string; note: string }) {
  return (
    <figure className={styles.polaroid}>
      <div className={styles.polaroidFrame}>
        <div className={styles.polaroidPhoto}><Image src={src} alt={alt} fill sizes="220px" /></div>
      </div>
      <figcaption className={`${pen.className} ${styles.handNote}`}>{note}</figcaption>
    </figure>
  );
}

function AgePair({ past, aged }: { past: string; aged: string }) {
  return (
    <div className={styles.agePair} aria-label="AI로 만든 가상 인물 예시">
      <figure><div><Image src={past} alt="가상 인물의 어린 시절 예시" fill sizes="150px" /></div><figcaption>과거 사진</figcaption></figure>
      <span aria-hidden="true"><ArrowRightIcon size={18} /></span>
      <figure><div><Image src={aged} alt="가상 인물의 AI 예상 모습" fill sizes="150px" /></div><figcaption className={styles.aiCaption}>AI 예측 · 현재 모습</figcaption></figure>
    </div>
  );
}

function Steps({ items }: { items: { icon: ReactNode; title: string; text: string }[] }) {
  return (
    <ol className={styles.steps}>
      {items.map(item => (
        <li key={item.title}>
          <span aria-hidden="true" className={styles.stepIcon}>{item.icon}</span>
          <strong>{item.title}</strong>
          <span>{item.text}</span>
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
          <div className={styles.purpose}>
            <div>
              <p className={styles.kicker}>OUR PURPOSE · 우리가 이 서비스를 만드는 이유</p>
              <h3 className={styles.bigTitle}>시간이 흘러도,<br />잊지 말아야 할 얼굴이 있습니다.</h3>
              <p className={styles.lead}>누군가에게는 오래전 사진 한 장이지만,<br />누군가에게는 오늘도 기다리는 가족의 얼굴입니다.</p>
              <p className={styles.body}>시간이 흐를수록 사람의 모습은 달라지고, 오래된 사진만으로 지금의 모습을 떠올리기는 쉽지 않습니다. 하지만 시간이 흘렀다고 해서 누군가를 찾는 마음까지 사라지는 것은 아닙니다.</p>
              <p className={styles.body}>FindUs는 AI 나이 예측 기술로 시간이 흐른 뒤의 모습을 그려보고, 잊혀 가는 실종아동에게 다시 사회적 관심을 모으고자 합니다. 더 많은 사람이 얼굴을 기억하고, 한 번 더 바라보도록 돕습니다.</p>
              <p className={styles.body}>예측된 얼굴이 만남을 보장할 수는 없지만, 잊지 않고 기억하는 마음은 다시 만날 희망을 이어갈 수 있습니다.</p>
            </div>
            <Polaroid src={POLAROID} alt="AI로 만든 가상 인물의 어린 시절 사진" note="기억하는 마음이 다시 만날 희망이 됩니다." />
          </div>
          <blockquote className={styles.quote}>
            <span aria-hidden="true" className={styles.quoteMark}><LogoMark size={34} /></span>
            <div>
              <strong>다시 그린 얼굴에, 우리의 마음을 더하다.</strong>
              <span>기술로 얼굴을 그리는 일을 넘어, 기억과 관심을 잇고 다시 만날 희망을 함께합니다.</span>
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
          <p className={styles.kicker}>주요 기능</p>
          <h3 className={styles.midTitle}>기억나는 단서를 공식 절차로 잇습니다.</h3>
          <ul className={styles.features}>
            <li><span aria-hidden="true" className={styles.featureIcon}><SearchIcon size={20} /></span><div><strong>실종아동 정보 검색</strong><span>경찰청에 공개된 실종아동 정보를 이름과 지역으로 찾아볼 수 있어요.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><PhoneIcon size={20} /></span><div><strong>목격 제보 안내</strong><span>본 적 있는 얼굴이라면 112·182 공식 창구로 바로 이어 드려요.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><SparklesIcon size={20} /></span><div><strong>AI 나이 예측</strong><span>오래된 사진 속 얼굴이 지금은 어떤 모습일지 참고 이미지를 보여 드려요.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><DnaGlyph /></span><div><strong>가족 찾기 · DNA 안내</strong><span>어린 시절 기억이 낯설다면 상담과 DNA 채취 절차를 안내해 드려요.</span></div></li>
          </ul>
        </>
      ),
    },
    {
      id: "service-ai",
      label: "AI 나이 예측",
      content: (
        <div className={styles.aiRow}>
          <div>
            <p className={styles.kicker}>AI 나이 예측 기술</p>
            <h3 className={styles.midTitle}>지금의 모습을 다시 그립니다.</h3>
            <p className={styles.body}>오래된 사진 속 얼굴의 특징을 바탕으로, 시간이 흐른 뒤의 모습을 예측합니다.</p>
            <p className={styles.note}>예측 이미지는 참고용이며 실제 모습과 다를 수 있습니다. 사진은 AI로 만든 가상 인물입니다.</p>
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
          <p className={styles.kicker}>기억과 관심이 연결될 때,</p>
          <h3 className={styles.midTitle}>더 많은 사람이 실종아동을 찾을 수 있습니다.</h3>
          <Steps items={[
            { icon: <SearchIcon size={22} />, title: "실종 정보 발견", text: "누구나 쉽게 정보를 확인할 수 있습니다." },
            { icon: <SparklesIcon size={22} />, title: "AI 나이 예측", text: "시간이 흐른 뒤의 모습을 예측합니다." },
            { icon: <UsersIcon size={22} />, title: "사회적 관심", text: "더 많은 사람이 기억하고 바라봅니다." },
            { icon: <HeartIcon size={22} />, title: "다시 만날 희망", text: "작은 관심이 큰 변화를 만듭니다." },
          ]} />
          <div className={styles.actions}>
            <Link href="/search" className={styles.primary}>실종아동 찾아보기 <ArrowRightIcon size={16} /></Link>
            <a href="tel:182" className={styles.secondary}><PhoneIcon size={16} />실종 상담 182</a>
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
        <Image src="/images/home-closing-sky.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={styles.endingPhoto} />
        <p className={`${pen.className} ${styles.endingNote}`}>기억은 사라지지 않습니다.<br />다시 만날 그날을 위해, 오늘도.</p>
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
        <div className={styles.purpose}>
          <div>
            <p className={styles.kicker}>REAL STORY · 우리가 이 프로젝트를 시작한 이유</p>
            <h3 className={styles.bigTitle}>편의점에서 발견한 한 장의 사진이,<br />20년 만의 가족 상봉으로 이어졌습니다.</h3>
            <p className={styles.body}>2000년 네 살 때 실종된 한 여성이 2020년, CU 편의점 결제 화면에서 자신의 어린 시절 사진을 발견했습니다. 이후 확인 절차를 거쳐 오랜 시간 헤어져 있던 가족과 다시 만났습니다.</p>
            <p className={styles.body}>이 사례는 우리에게 한 가지 가능성을 보여주었습니다. 실종 정보가 사람들의 일상 속에서 한 번 더 발견된다면, 누군가에게는 가족을 다시 만날 기회가 될 수 있다는 것을요.</p>
            <p className={styles.lead}>우리는 이 가능성을 우리의 일상에서도 이어가고 싶습니다.</p>
          </div>
          {/* 편의점 결제 화면을 재현한 예시. 실제 당사자 사진은 쓰지 않는다. */}
          <figure className={styles.cuStory} aria-label="편의점 결제 화면에 뜬 실종아동 정보 (재현 예시)">
            <div className={styles.posScreen} aria-hidden="true">
              <div className={styles.posBar}><span className={styles.posLogo}><Image src="/images/partners/cu.png" alt="" fill sizes="40px" unoptimized /></span><span>재현 예시 화면</span></div>
              <div className={styles.posBody}>
                <span className={styles.posPhoto}><Image src="/images/mock-persons/MC-1999-0341/past.jpg" alt="" fill sizes="80px" /></span>
                <span className={styles.posCopy}><strong>실종아동을 찾습니다</strong><small>2000년 · 당시 4세</small><small>보신 분은 182로 연락 주세요</small></span>
              </div>
            </div>
          </figure>
        </div>
          <ol className={`${styles.timeline} ${styles.blockGap}`} aria-label="CU 실종아동 찾기 캠페인 상봉 사례">
            <li><strong>2000년 6월</strong><span>네 살 아이가 가족과 헤어졌습니다.</span></li>
            <li><strong>2020년 가을</strong><span>CU 편의점 결제 화면에서 자신의 어린 시절 사진을 발견했습니다.</span></li>
            <li><strong>확인 절차</strong><span>아동권리보장원 실종아동전문센터를 통해 확인했습니다.</span></li>
            <li><strong>20년 만의 상봉</strong><span>오랜 시간 헤어져 있던 가족과 다시 만났습니다.</span></li>
          </ol>
          <p className={styles.note}>출처: 뉴데일리, 「편의점에 어릴 적 내 사진이?… 20년 전 실종아동 가족 품으로」(2020.10.6). 당사자의 이름과 사진은 싣지 않습니다.</p>
        </>
      ),
    },
    {
      id: "support-goods",
      label: "QR 굿즈",
      content: (
        <>
          <blockquote className={styles.quote}>
            <span aria-hidden="true" className={styles.quoteMark}><LogoMark size={34} /></span>
            <div>
              <strong>CU가 편의점에서 발견의 기회를 만들었다면,</strong>
              <span>우리는 사람들이 매일 사용하는 물건을 통해 그 기회를 이어가고자 합니다.</span>
            </div>
          </blockquote>
          <p className={styles.body}>여러분의 후원은 QR 굿즈를 만들고, 더 많은 사람이 장기 실종 아동의 정보를 쉽게 접할 수 있는 서비스를 만들어가는 데 힘이 됩니다.</p>
          <p className={styles.note}>물론 굿즈 하나가 곧바로 가족과의 상봉을 약속하지는 않습니다. 하지만 한 번 더 발견되고, 한 번 더 기억되고, 한 번 더 공유되는 정보가 쌓인다면 다시 만날 가능성을 넓히는 데 보탬이 될 수 있습니다.</p>
          <p className={`${styles.kicker} ${styles.blockGap}`}>펀딩마다 한 명의 장기 실종 아동을 함께 기억합니다</p>
          <h3 className={styles.midTitle}>굿즈에는 아이의 얼굴 대신, QR 코드만 담습니다.</h3>
          <p className={styles.body}>후원으로 만들어지는 키링, 에코백, 옷에는 QR 코드만 담깁니다. 굿즈를 사용하는 일상 속에서 누군가 QR을 발견하고, 아이의 이야기를 읽고, 실종 정보에 다시 관심을 가질 수 있도록.</p>
          <ul className={styles.features}>
            <li><span aria-hidden="true" className={styles.featureIcon}><QrGlyph /></span><div><strong>얼굴 대신 QR</strong><span>아이의 사진은 굿즈에 직접 넣지 않고, QR로만 연결합니다.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><SearchIcon size={20} /></span><div><strong>이야기와 공식 정보</strong><span>QR을 스캔하면 아이의 이야기와 공식 실종 정보를 확인할 수 있어요.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><UsersIcon size={20} /></span><div><strong>한 번 더 공유</strong><span>필요한 정보를 다른 사람에게 공유할 수 있도록 안내합니다.</span></div></li>
            <li><span aria-hidden="true" className={styles.featureIcon}><HeartIcon size={20} /></span><div><strong>일상 속 연결점</strong><span>굿즈는 후원의 대가를 넘어, 잊히기 쉬운 실종 정보를 다시 만나는 연결점입니다.</span></div></li>
          </ul>
        </>
      ),
    },
    {
      id: "support-rewards",
      label: "후원 방법",
      content: (
        <>
          <p className={styles.kicker}>{campaign.title}</p>
          <h3 className={styles.midTitle}>마음에 드는 굿즈를 골라 후원해 주세요.</h3>
          <ul className={styles.tiers}>
            {campaign.tiers.map(tier => (
              <li key={tier.id}><strong>{tier.title}</strong><span>{tier.summary}</span><em>{formatWon(tier.price)}</em></li>
            ))}
          </ul>
          <p className={styles.note}>목표 금액 {formatWon(campaign.goal)}에 닿지 못하면 결제한 금액을 전액 환불해요. 굿즈는 {campaign.deliveryNote}.</p>
        </>
      ),
    },
    {
      id: "support-funds",
      label: "후원금 사용",
      content: (
        <>
          <p className={styles.kicker}>후원금은 이렇게 쓰여요</p>
          <h3 className={styles.midTitle}>굿즈 원가를 뺀 나머지는 모두 아이 찾기에.</h3>
          <ul className={styles.features}>
            {campaign.fundsPlan.map(bucket => (
              <li key={bucket.id}>
                <span aria-hidden="true" className={styles.featureIcon}>{bucket.id === "goods" ? <GiftGlyph /> : bucket.id === "search" ? <QrGlyph /> : <HeartIcon size={20} />}</span>
                <div><strong>{bucket.title}</strong><span>{bucket.description}</span></div>
              </li>
            ))}
          </ul>
          {remainder.length > 1 && <p className={styles.note}>원가를 뺀 금액은 {remainder.map(bucket => bucket.title).join("와 ")}에 {remainder.map(bucket => bucket.share).join(" : ")} 비율로 나눠 씁니다.</p>}
        </>
      ),
    },
    {
      id: "support-together",
      label: "함께하는 방법",
      content: (
        <>
          <p className={styles.kicker}>후원은 이렇게 이어져요</p>
          <h3 className={styles.midTitle}>한 아이의 이야기가 더 많은 사람에게 닿을 수 있도록.</h3>
          <p className={styles.body}>잊히지 않도록, 다시 만날 가능성을 함께 만들어 주세요.</p>
          <Steps items={[
            { icon: <GiftGlyph />, title: "굿즈 고르기", text: "응원부터 패밀리 세트까지 고를 수 있어요." },
            { icon: <HeartIcon size={22} />, title: "후원하기", text: "목표에 닿지 않으면 전액 환불돼요." },
            { icon: <QrGlyph />, title: "QR 굿즈 받기", text: `${campaign.deliveryNote}.` },
            { icon: <UsersIcon size={22} />, title: "기억 잇기", text: "QR로 누군가 아이의 이야기를 다시 만납니다." },
          ]} />
          <div className={styles.actions}>
            <Link href="/funding" className={styles.primary}>펀딩 보러 가기 <ArrowRightIcon size={16} /></Link>
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
        <Image src="/images/support-qr-goods-card.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={`${styles.endingPhoto} ${styles.endingPhotoSide}`} />
        <p className={`${pen.className} ${styles.endingNote}`}>굿즈를 만드는 일에서 시작해,<br />한 아이를 기억하는 일로.</p>
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
    <ul className={`${styles.features} ${styles.campaignList}`}>
      {items.map(item => (
        <li key={item.title}>
          {item.photo ? (
            <span aria-hidden="true" className={`${styles.campaignMark} ${styles.campaignMarkPhoto}`}><Image src={item.photo} alt="" fill sizes="120px" /></span>
          ) : item.logos?.length ? (
            <span aria-hidden="true" className={styles.campaignMark}>
              {item.logos.map(logo => <span key={logo} className={styles.campaignLogo}><Image src={logo} alt="" fill sizes="100px" unoptimized /></span>)}
            </span>
          ) : (
            <span aria-hidden="true" className={`${styles.campaignMark} ${styles.campaignMarkIcon}`}>{icon}</span>
          )}
          <div><strong>{item.title}</strong><span>{item.text}</span><em className={styles.campaignSource}>출처: {item.source}</em></div>
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
    <div className={styles.tapeScene} aria-hidden="true">
      <div className={styles.tape}>
        {[0, 1, 2].map(i => (
          <span key={i} className={styles.tapeCell}>
            <span className={styles.tapePhoto}><Image src={`${TAPE_PERSON}/past.jpg`} alt="" fill sizes="48px" /></span>
            <span className={styles.tapePhoto}><Image src={`${TAPE_PERSON}/aged.jpg`} alt="" fill sizes="48px" /></span>
            <span className={styles.tapeText}><b>실종아동을 찾습니다</b><small>보신 분은 182</small></span>
          </span>
        ))}
      </div>
      <em className={styles.sceneTag}>재현 예시</em>
    </div>
  );
}

/** 에어서울 재현: 앞 좌석 등받이 모니터에 '당시 → 현재 추정' 사진과 안전Dream QR이 뜬 모습. */
function MonitorScene() {
  return (
    <div className={styles.monitorScene} aria-hidden="true">
      <div className={styles.monitor}>
        <p className={styles.monitorHead}>실종아동을 찾습니다</p>
        <div className={styles.monitorBody}>
          <span className={styles.monitorPhoto}><Image src={`${MONITOR_PERSON}/past.jpg`} alt="" fill sizes="64px" /><em>당시</em></span>
          <i><ArrowRightIcon size={11} /></i>
          <span className={styles.monitorPhoto}><Image src={`${MONITOR_PERSON}/aged.jpg`} alt="" fill sizes="64px" /><em className={styles.caseAi}>현재 추정</em></span>
          <span className={styles.monitorQr}><span /><small>안전Dream</small></span>
        </div>
      </div>
      <em className={styles.sceneTag}>재현 예시</em>
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
      <div className={styles.purpose}>
        <div>
          <p className={styles.kicker}>EVERYDAY CAMPAIGNS · 일상 속 실종아동 찾기</p>
          <h3 className={styles.bigTitle}>길 위에서, 계산대에서, 화면 속에서<br />한 번 더 발견되도록.</h3>
          <p className={styles.body}>실종아동의 얼굴을 사람들의 일상 속에서 다시 보게 하려는 노력은 이미 여러 곳에서 이어지고 있습니다. 그중 FindUs와 특히 가까운 사례가 둘 있습니다.</p>
        </div>
        <figure className={`${styles.supportPhoto} ${styles.videoFacade}`}>
          <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="(max-width: 640px) 100vw, 230px" />
          <button type="button" onClick={() => setPlaying(true)} aria-expanded={playing} aria-controls="campaign-video" aria-label={`${CAMPAIGN_VIDEO.title} 재생 (YouTube)`}>
            <span className={styles.playIcon} aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg></span>
            <span className={styles.playLabel}>{playing ? "아래에서 재생 중" : "캠페인 영상 보기"}</span>
          </button>
          <figcaption className={`${pen.className} ${styles.handNote}`}>사진 한 장이, 다시 보는 계기가 됩니다.</figcaption>
        </figure>
      </div>
      <div id="campaign-video">
        {playing && (
          <div className={styles.videoBlock}>
            <div className={styles.videoFrame}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${CAMPAIGN_VIDEO.id}?autoplay=1&rel=0`}
                title={CAMPAIGN_VIDEO.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className={styles.videoCredit}>
              {CAMPAIGN_VIDEO.title} · 영상 출처: YouTube &lsquo;{CAMPAIGN_VIDEO.channel}&rsquo; 채널
              <a href={watchUrl} target="_blank" rel="noopener noreferrer">YouTube에서 보기 <span aria-hidden="true">↗</span><span className="sr-only">(새 창)</span></a>
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
          <ul className={styles.caseRow}>
            {[
              { name: "호프테이프", where: "우체국 · 한진 · 경찰청", text: "택배 포장 테이프에 장기 실종아동 28명의 실종 당시 모습과 경찰의 나이 변환 몽타주, 실종 장소와 신체 특징을 담았어요.", scene: <TapeScene /> },
              { name: "에어서울 기내 모니터", where: "에어서울", text: "좌석 모니터에 실종 당시 모습과 나이 변환 예상 모습을 함께 보여주고, 안전Dream QR도 띄웠어요.", scene: <MonitorScene /> },
            ].map(item => (
              <li key={item.name} className={styles.caseCard}>
                {item.scene}
                <div>
                  <p className={styles.caseWhere}>{item.where}</p>
                  <strong>{item.name}</strong>
                  <p className={styles.caseText}>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.caseNote}>카드 속 장면은 이해를 돕기 위해 재현한 예시이며, 얼굴은 AI로 만든 가상 인물입니다.</p>
          <p className={styles.lead}>원본과 AI 예상 모습을 나란히 비교하는 방식은, 이미 현장에서 검증된 방법입니다.</p>
        </>
      ),
    },
    { id: "campaign-store", label: "편의점·택배·사진", content: (<><p className={styles.kicker}>편의점 · 택배 · 사진</p><h3 className={styles.midTitle}>매일 지나치는 계산대와 상자, 사진 한 장 위에서.</h3><CampaignList items={CAMPAIGNS.store} icon={<BoxGlyph />} /></>) },
    { id: "campaign-app", label: "앱·결제·은행", content: (<><p className={styles.kicker}>앱 · 결제 · 은행</p><h3 className={styles.midTitle}>손안의 화면에서, 한 번 더.</h3><CampaignList items={CAMPAIGNS.app} icon={<PhoneIcon size={20} />} /></>) },
    {
      id: "campaign-more",
      label: "기내·예방 협력",
      content: (
        <>
          <p className={styles.kicker}>기내 · 실종 예방</p>
          <h3 className={styles.midTitle}>이동하는 순간에도, 미리 대비하는 순간에도.</h3>
          <CampaignList items={CAMPAIGNS.more} icon={<UsersIcon size={20} />} />
          <p className={styles.note}>각 캠페인 내용은 보도 기사를 바탕으로 정리했으며, 현재 진행 여부와 세부 내용은 달라질 수 있습니다. FindUs는 위 기업·기관과 제휴 관계가 아닙니다.</p>
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
        <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={`${styles.endingPhoto} ${styles.endingPhotoSide}`} />
        <p className={`${pen.className} ${styles.endingNote}`}>일상의 한 장면이,<br />다시 만나는 길이 됩니다.</p>
      </>}
    />
  );
}

const BoxGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);

// Story cards near the end of the home page; each opens a full guide instead of leaving the page.
export default function HomeStory() {
  const [open, setOpen] = useState<"service" | "support" | "campaign" | null>(null);
  const serviceRef = useRef<HTMLButtonElement>(null);
  const supportRef = useRef<HTMLButtonElement>(null);
  const campaignRef = useRef<HTMLButtonElement>(null);

  return (
    <section className={`page-container ${styles.section}`} aria-labelledby="home-story-title">
      <header className={styles.storyHead} data-reveal>
        <p className={styles.storyKicker}><span aria-hidden="true" />FindUs가 함께하는 일</p>
        <h2 id="home-story-title">기술은 기억을 잇고, 관심은 만남을 만듭니다.</h2>
        <p>AI로 시간이 흐른 얼굴을 다시 그리고, 시민의 작은 관심을 공식 제보로 이어갑니다.</p>
      </header>
      <div className={styles.cards} data-reveal="stagger">
        <button ref={serviceRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("service")} className={`${styles.card} ${styles.cardService}`}>
          <span className={styles.cardCopy}>
            <span className={styles.cardLabel}><span aria-hidden="true" className={styles.cardIcon}><MonitorGlyph /></span>01 · 서비스 소개</span>
            <span className={styles.cardTitle}>잊혀 가는 얼굴을, 지금의 모습으로</span>
            <span className={styles.cardText}>AI 나이 예측 기술로 실종아동의 지금 모습을 그려보고, 더 많은 사람에게 알리는 서비스입니다.</span>
            <span className={styles.cardTags}><span>AI 나이 예측</span><span>공식 정보 연결</span></span>
            <span className={styles.cardMore}>자세히 보기 <ArrowRightIcon size={15} /></span>
          </span>
          <span aria-hidden="true" className={styles.splitFace}>
            <span className={styles.splitHalf}><Image src={SERVICE_PAST} alt="" fill sizes="190px" /></span>
            <span className={`${styles.splitHalf} ${styles.splitRight}`}><Image src={SERVICE_AGED} alt="" fill sizes="190px" /></span>
            <span className={styles.splitLine} />
            <span className={styles.scanCorners} />
            <span className={`${styles.splitTag} ${styles.splitTagLeft}`}>당시</span>
            <span className={`${styles.splitTag} ${styles.splitTagRight}`}>AI 예상</span>
          </span>
        </button>
        <button ref={supportRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("support")} className={`${styles.card} ${styles.cardSupport}`}>
          <span className={styles.cardCopy}>
            <span className={styles.cardLabel}><span aria-hidden="true" className={styles.cardIcon}><HeartIcon size={18} /></span>02 · 후원 안내</span>
            <span className={styles.cardTitle}>한 장의 사진이, 다시 만남으로</span>
            <span className={styles.cardText}>편의점에서 발견한 사진 한 장이 20년 만의 가족 상봉으로 이어졌습니다. 한 아이를 기억하는 QR 굿즈를 함께 만들어요.</span>
            <span className={styles.cardTags}><span>QR 굿즈</span><span>리워드 펀딩</span></span>
            <span className={styles.cardMore}>자세히 보기 <ArrowRightIcon size={15} /></span>
          </span>
          <span aria-hidden="true" className={styles.supportVisual}>
            <Image src="/images/support-qr-goods-card.webp" alt="" fill sizes="260px" />
            <span className={styles.supportTag}>Remember A Child</span>
          </span>
        </button>
        <button ref={campaignRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("campaign")} className={`${styles.card} ${styles.cardCampaign}`}>
          <span className={styles.cardCopy}>
            <span className={styles.cardLabel}><span aria-hidden="true" className={styles.cardIcon}><UsersIcon size={18} /></span>03 · 함께하는 캠페인</span>
            <span className={styles.cardTitle}>일상 곳곳에서, 한 번 더 보게 합니다</span>
            <span className={styles.cardText}>편의점 계산대, 택배 상자, 결제 화면, 기내 모니터까지. 실종아동의 얼굴을 일상에서 다시 보게 하는 캠페인들을 소개합니다.</span>
            <span className={styles.campaignPlaces}>
              {["편의점", "택배", "동네 앱", "결제 단말기", "인터넷뱅킹", "기내 모니터"].map(place => <span key={place}>{place}</span>)}
            </span>
            <span className={styles.cardMore}>자세히 보기 <ArrowRightIcon size={15} /></span>
          </span>
          <span aria-hidden="true" className={styles.campaignPhoto}>
            <Image src="/images/campaign-four-frame.webp" alt="" fill sizes="280px" />
            <span className={styles.supportTag}>실종아동네컷</span>
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

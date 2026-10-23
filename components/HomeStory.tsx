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
function GuideSheet({ title, sections, ending }: { title: string; sections: Section[]; ending: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0].id);

  const scroller = () => sheetRef.current?.closest<HTMLElement>("[role=dialog]") ?? null;
  const smooth = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The active item is the last section whose top has passed a line near the top of the box,
  // or the last section once the box is scrolled to the end (short final sections never reach the line).
  useEffect(() => {
    const root = sheetRef.current?.closest<HTMLElement>("[role=dialog]");
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

  return (
    <div ref={sheetRef} className={styles.sheet}>
      <aside className={styles.sheetNav}>
        <nav aria-label={`${title} 목차`}>
          <p className={styles.sheetNavTitle}>{title}</p>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                <button type="button" aria-current={active === section.id ? "true" : undefined} onClick={() => goTo(section.id)}>
                  <span>{String(index + 1).padStart(2, "0")}.</span>{section.label}
                </button>
              </li>
            ))}
          </ol>
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
        <Image src="/images/home-family-walk.png" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={styles.endingPhoto} />
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
          <figure className={styles.supportPhoto}>
            <Image src="/images/support-children-background.png" alt="햇살 아래 손을 잡고 뛰어가는 아이들 · AI 캠페인 이미지" fill sizes="(max-width: 640px) 100vw, 320px" />
            <figcaption className={`${pen.className} ${styles.handNote}`}>한 번 더 발견되는 일이, 다시 만나는 길이 됩니다.</figcaption>
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
      sections={sections}
      ending={<>
        <Image src="/images/support-children-background.png" alt="" fill sizes="(max-width: 640px) 100vw, 800px" className={styles.endingPhoto} />
        <p className={`${pen.className} ${styles.endingNote}`}>굿즈를 만드는 일에서 시작해,<br />한 아이를 기억하는 일로.</p>
      </>}
    />
  );
}

// Two story cards near the end of the home page; each opens a full guide instead of leaving the page.
export default function HomeStory() {
  const [open, setOpen] = useState<"service" | "support" | null>(null);
  const serviceRef = useRef<HTMLButtonElement>(null);
  const supportRef = useRef<HTMLButtonElement>(null);

  return (
    <section className={`page-container ${styles.section}`} aria-label="서비스 소개와 후원 안내">
      <div className={styles.cards} data-reveal="stagger">
        <button ref={serviceRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("service")} className={`${styles.card} ${styles.cardService}`}>
          <span className={styles.cardCopy}>
            <span className={styles.cardTitle}><span aria-hidden="true" className={styles.cardIcon}><MonitorGlyph /></span>서비스 소개</span>
            <span className={styles.cardText}>AI 나이 예측 기술로, <br />실종아동의 지금 모습을 그려보고 <br />더 많은 사람에게 알리는 서비스입니다.</span>
            <span className={styles.cardMore}>자세히 보기 <ArrowRightIcon size={15} /></span>
          </span>
          <span aria-hidden="true" className={styles.splitFace}>
            <span className={styles.splitHalf}><Image src={SERVICE_PAST} alt="" fill sizes="170px" /></span>
            <span className={`${styles.splitHalf} ${styles.splitRight}`}><Image src={SERVICE_AGED} alt="" fill sizes="170px" /></span>
            <span className={styles.splitLine} />
            <span className={styles.scanCorners} />
          </span>
        </button>
        <button ref={supportRef} type="button" aria-haspopup="dialog" onClick={() => setOpen("support")} className={`${styles.card} ${styles.cardSupport}`}>
          <span className={styles.cardCopy}>
            <span className={styles.cardTitle}><span aria-hidden="true" className={styles.cardIcon}><HeartIcon size={20} /></span>후원 안내</span>
            <span className={styles.cardText}>편의점에서 발견한 사진 한 장이 <br />20년 만의 가족 상봉으로 이어졌습니다. <br />한 아이를 기억하는 QR 굿즈를 함께 만들어요.</span>
            <span className={styles.cardMore}>자세히 보기 <ArrowRightIcon size={15} /></span>
          </span>
          <span aria-hidden="true" className={styles.supportVisual}><Image src="/images/support-qr-goods-card.webp" alt="" fill sizes="260px" /></span>
        </button>
      </div>

      {open === "service" && (
        <Modal bare mobileFullscreen title="서비스 소개" onClose={() => setOpen(null)} returnFocusTo={serviceRef.current}>
          <ServiceGuide />
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

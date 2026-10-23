"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MISSING_CHILD_CENTER_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, LayersIcon, PhoneIcon, ScanFaceIcon, ShieldIcon } from "./Icons";
import styles from "./DnaGuide.module.css";
import Modal from "./Modal";

const OFFICIAL_DNA_URL = "https://www.safe182.go.kr/cont/homeLogContents.do?contentsNm=report_info_dna";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const ROUTES = [
  {
    title: "1. 본인 DNA 채취",
    purpose: "어릴 때 헤어진 친가족을 찾고 싶어요",
    Icon: ScanFaceIcon,
    steps: [
      ["대상 여부 문의", "182에 실종·보호시설·입양 이력 등 본인의 상황을 설명해요."],
      ["방문 준비", "담당 경찰서와 부서, 필요한 기록·준비물을 안내받아요."],
      ["확인·동의 후 채취", "대상 여부를 확인하고 동의한 뒤 구강세포 등의 검체를 채취해요."],
    ],
    note: "친가족을 찾는 모든 사람이 자동으로 등록되는 것은 아니에요. 본인의 대상 요건을 먼저 확인해 주세요.",
  },
  {
    title: "2. 부모·가족 DNA 채취",
    purpose: "실종된 자녀 또는 가족을 찾고 싶어요",
    Icon: HeartIcon,
    steps: [
      ["신고·가족관계 확인", "182에 실종신고 내역과 가족관계를 설명하고 채취 대상 여부를 문의해요."],
      ["방문 준비", "담당 경찰서와 부서, 가족관계 확인에 필요한 준비물을 안내받아요."],
      ["확인·동의 후 채취", "대상 여부와 관계를 확인하고 동의한 뒤 검체를 채취해요."],
    ],
    note: "실종된 자녀가 발견되기 전에도 부모님은 채취 절차를 문의할 수 있어요. 다른 가족의 대상 여부도 182에서 확인해 주세요.",
  },
] as const;

function DnaGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M7 3c0 6 10 12 10 18M17 3c0 6-10 12-10 18" />
      <path d="M7 3h10M8 7h8M10 11h4M10 13h4M8 17h8M7 21h10" />
    </svg>
  );
}

// `children` replaces the trigger content so a page can render the button in its own card layout.
export default function DnaGuideButton({ variant = "default", className, children }: { variant?: "default" | "followup"; className?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (variant !== "followup") return;
    const openFromHash = () => {
      if (window.location.hash === "#families") setOpen(true);
    };
    const openFromLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash !== "#families") return;
      event.preventDefault();
      setOpen(true);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", openFromLink, true);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", openFromLink, true);
    };
  }, [variant]);

  const closeGuide = () => {
    setOpen(false);
    if (window.location.hash === "#families") {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      <button ref={triggerRef} id={variant === "followup" ? "families" : undefined} type="button" aria-haspopup="dialog" aria-label="본인·가족 찾기 — DNA·상담 안내" onClick={() => setOpen(true)}
        className={className ?? (variant === "followup"
          ? `group flex min-h-24 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#F6CDC9] bg-[#FFF8F7] px-4 py-3 text-left text-[#B4473F] shadow-panel transition-all hover:-translate-y-0.5 hover:border-[#D4675E]/50 hover:shadow-card-hover motion-reduce:transition-none max-sm:gap-2.5 max-sm:px-3.5 ${focusRing}`
          : `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-card px-5 py-3 text-[15px] font-bold text-brand transition-colors hover:bg-brand-soft ${focusRing}`)}>
        {children ?? (variant === "followup" ? (
          <>
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDE8E6] transition-transform group-hover:scale-105 motion-reduce:transition-none">
              <DnaGlyph />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold">본인·부모·가족을 위한 다음 단계</span>
              <span className="mt-1 block text-[19px] leading-snug font-extrabold tracking-[-0.02em] max-sm:text-[18px]"><span className="text-brand">DNA</span> 검사·상담 안내</span>
              <span className="mt-1 block text-[12px] leading-relaxed break-keep text-muted">본인·가족의 DNA 채취 절차를 확인하세요.</span>
            </span>
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card/80"><ArrowRightIcon size={17} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" /></span>
          </>
        ) : (
          <>
            <span>본인·가족 찾기 — DNA·상담 안내</span>
            <ArrowRightIcon size={16} strokeWidth={2.2} className="shrink-0" />
          </>
        ))}
      </button>
      {open && (
        <Modal eyebrow="본인·가족 찾기" title="DNA 검사·상담 안내" accent="coral" onClose={closeGuide} returnFocusTo={triggerRef.current} mobileFullscreen size="wide">
          <div className={styles.guide}>
          <div className={styles.intro}>
            <span aria-hidden="true" className={styles.introIcon}><DnaGlyph /></span>
            <p>
              <strong>친가족을 찾는 본인도, 실종된 자녀·가족을 찾는 부모와 가족도 시작할 수 있어요.</strong>
              <span>검사 대상 여부와 방문 절차는 먼저 182에 문의해 주세요.</span>
            </p>
          </div>
          <div className={styles.routes}>
            {ROUTES.map(({ title, purpose, Icon, steps, note }, index) => (
              <section key={title} aria-label={title} className={styles.route} data-tone={index === 0 ? "brand" : "coral"}>
                <div className={styles.routeHead}>
                  <span aria-hidden="true" className={styles.routeIcon}><Icon size={23} strokeWidth={1.8} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{purpose}</p>
                  </div>
                </div>
                <ol className={styles.steps}>
                  {steps.map(([heading, text], i) => (
                    <li key={heading}>
                      <span aria-hidden="true" className={styles.number}>{i + 1}</span>
                      <div className="min-w-0">
                        <h4>{heading}</h4>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className={styles.routeNote}><ShieldIcon size={15} strokeWidth={2} />{note}</p>
              </section>
            ))}
          </div>
          <section aria-label="DNA 채취 후 절차와 이용 안내" className={styles.after}>
            <h3 className={styles.afterTitle}><LayersIcon size={20} />DNA 채취 후 절차와 이용 안내</h3>
            <h4 className={styles.flowLabel}>채취 후에는 이렇게 진행돼요</h4>
            <ol className={styles.flow}>
              <li>유전자정보 분석·등록</li>
              <li aria-hidden="true"><ArrowRightIcon size={16} strokeWidth={2.2} /></li>
              <li>대조</li>
              <li aria-hidden="true"><ArrowRightIcon size={16} strokeWidth={2.2} /></li>
              <li>일치 가능성이 있으면 추가 신원 확인</li>
            </ol>
            <p className={styles.flowNote}>당장 일치자가 없어도 이후 확보된 정보와 대조할 수 있어요.</p>
            <h4 className={styles.flowLabel}>함께 알아두세요</h4>
            <ul className={styles.knowList}>
              <li>같은 날 채취할 필요는 없어요.</li>
              <li>DNA 등록이 가족 확인을 보장하지는 않아요.</li>
              <li>지문·사진을 등록하는 예방 사전등록과는 별도 절차예요.</li>
              <li>FindUs는 DNA나 신청자 정보를 수집하지 않아요.</li>
            </ul>
          </section>
          <div className={styles.contact}>
            <p className={styles.contactNote}>대상 여부와 준비물은 182에서 가장 정확하게 안내받을 수 있어요.</p>
            <div className={styles.contactRow}>
              <a href="tel:182" className={`${styles.call} ${focusRing}`}><span aria-hidden="true"><PhoneIcon size={17} /></span><span><strong>182에 문의하기</strong><small>실종아동 제보·상담</small></span></a>
              <a href={OFFICIAL_DNA_URL} target="_blank" rel="noopener noreferrer" className={`${styles.ghost} ${focusRing}`}>안전Dream 공식 안내 <ArrowUpRightIcon size={14} /><span className="sr-only">(새 창)</span></a>
              <a href="/documents/dna-collection-guide.pdf" download className={`${styles.pdf} ${focusRing}`}>참고용 PDF 내려받기</a>
            </div>
          </div>
          <section aria-label="실종아동 전문기관 안내" className={styles.center}>
            <span aria-hidden="true"><HeartIcon size={20} /></span>
            <div>
              <h3>실종아동 전문기관 안내</h3>
              <p>가족 찾기와 관련된 상담·지원 정보가 필요하다면, 실종아동 전문기관의 공식 안내를 확인하세요.</p>
            </div>
            <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer" className={`${styles.centerLink} ${focusRing}`}>
              전문기관 공식 사이트 <ArrowUpRightIcon size={14} /><span className="sr-only">(새 창)</span>
            </a>
          </section>
          <p className={styles.source}>참고: 경찰청 안전Dream 유전자(DNA) 분석 정책 · 안내 확인일 2026. 10. 14. PDF는 참고 자료이며, 최신 대상 요건과 준비물은 182에서 확인해 주세요.</p>
          </div>
        </Modal>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MISSING_CHILD_CENTER_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, LayersIcon, PhoneIcon, ScanFaceIcon, ShieldIcon } from "./Icons";
import Modal from "./Modal";

const OFFICIAL_DNA_URL = "https://www.safe182.go.kr/cont/homeLogContents.do?contentsNm=report_info_dna";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const ROUTES = [
  {
    title: "1. 본인 DNA 채취",
    purpose: "어릴 때 헤어진 친가족을 찾고 싶어요",
    Icon: ScanFaceIcon,
    tone: "bg-brand-soft text-brand",
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
    tone: "bg-gold-soft text-gold-ink",
    steps: [
      ["신고·가족관계 확인", "182에 실종신고 내역과 가족관계를 설명하고 채취 대상 여부를 문의해요."],
      ["방문 준비", "담당 경찰서와 부서, 가족관계 확인에 필요한 준비물을 안내받아요."],
      ["확인·동의 후 채취", "대상 여부와 관계를 확인하고 동의한 뒤 검체를 채취해요."],
    ],
    note: "실종된 자녀가 발견되기 전에도 부모님은 채취 절차를 문의할 수 있어요. 다른 가족의 대상 여부도 182에서 확인해 주세요.",
  },
] as const;

export default function DnaGuideButton({ variant = "default", className }: { variant?: "default" | "followup" | "homeCard"; className?: string }) {
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
        className={className ?? (variant === "homeCard"
          ? `group flex w-full cursor-pointer items-start gap-4 text-left ${focusRing}`
          : variant === "followup"
          ? `group flex min-h-24 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-gold-faint px-4 py-3 text-left text-gold-ink shadow-panel transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card-hover motion-reduce:transition-none max-sm:gap-2.5 max-sm:px-3.5 ${focusRing}`
          : `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-card px-5 py-3 text-[15px] font-bold text-brand transition-colors hover:bg-brand-soft ${focusRing}`)}>
        {variant === "followup" || variant === "homeCard" ? (
          <>
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 transition-transform group-hover:scale-105 motion-reduce:transition-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                <path d="M7 3c0 6 10 12 10 18M17 3c0 6-10 12-10 18" />
                <path d="M7 3h10M8 7h8M10 11h4M10 13h4M8 17h8M7 21h10" />
              </svg>
            </span>
            <span className={`min-w-0 flex-1 ${variant === "homeCard" ? "flex h-full flex-col items-start" : ""}`}>
              <span className="block text-[11px] font-bold">{variant === "homeCard" ? "본인·가족 찾기" : "본인·부모·가족을 위한 다음 단계"}</span>
              <span className="mt-1 block text-[19px] leading-snug font-extrabold tracking-[-0.02em] max-sm:text-[18px]"><span className="text-brand">DNA</span> 검사·상담 안내</span>
              <span className="mt-1 block text-[12px] leading-relaxed break-keep text-muted">본인·가족의 DNA 채취 절차를 확인하세요.</span>
              {variant === "homeCard" && <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[14px] font-bold text-brand">안내 보기 <ArrowRightIcon size={16} /></span>}
            </span>
            {variant !== "homeCard" && <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card/80"><ArrowRightIcon size={17} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" /></span>}
          </>
        ) : (
          <>
            <span>본인·가족 찾기 — DNA·상담 안내</span>
            <ArrowRightIcon size={16} strokeWidth={2.2} className="shrink-0" />
          </>
        )}
      </button>
      {open && (
        <Modal eyebrow="본인·가족 찾기" title="DNA 검사·상담 안내" accent="gold" onClose={closeGuide} returnFocusTo={triggerRef.current} mobileFullscreen size="wide">
          <p className="rounded-2xl border border-gold/20 bg-gold-faint p-4 text-[14px] leading-relaxed break-keep text-muted">
            친가족을 찾는 본인도, 실종된 자녀·가족을 찾는 부모와 가족도 시작할 수 있어요.
            검사 대상 여부와 방문 절차는 먼저 182에 문의해 주세요.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ROUTES.map(({ title, purpose, Icon, tone, steps, note }) => (
              <section key={title} aria-label={title} className="flex flex-col rounded-2xl border border-line p-5 max-sm:p-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={23} strokeWidth={1.8} /></span>
                  <div>
                    <h3 className="text-[17px] font-extrabold">{title}</h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed break-keep text-muted">{purpose}</p>
                  </div>
                </div>
                <ol className="my-5 flex flex-col gap-3">
                  {steps.map(([heading, text], i) => (
                    <li key={heading} className="flex gap-2.5">
                      <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${tone}`}>{i + 1}</span>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-bold">{heading}</h4>
                        <p className="mt-0.5 text-[13px] leading-relaxed break-keep text-muted">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-auto rounded-xl bg-surface p-3 text-[12px] leading-relaxed break-keep text-muted">{note}</p>
              </section>
            ))}
          </div>
          <section aria-label="DNA 채취 후 절차와 이용 안내" className="mt-5 rounded-2xl bg-brand-soft p-4">
            <div className="flex items-center gap-2 text-brand">
              <LayersIcon size={20} />
              <h3 className="text-[16px] font-extrabold">DNA 채취 후 절차와 이용 안내</h3>
            </div>
            <div className="mt-3">
              <h4 className="text-[13px] font-bold text-brand">채취 후에는 이렇게 진행돼요</h4>
              <p className="mt-1 text-[13px] leading-relaxed break-keep text-muted">유전자정보 분석·등록 및 대조 → 일치 가능성이 있으면 추가 신원 확인. 당장 일치자가 없어도 이후 확보된 정보와 대조할 수 있어요.</p>
            </div>
            <div className="mt-3">
              <h4 className="text-[13px] font-bold text-brand">함께 알아두세요</h4>
              <p className="mt-1 text-[13px] leading-relaxed break-keep text-muted">같은 날 채취할 필요는 없으며, DNA 등록이 가족 확인을 보장하지는 않아요. 지문·사진을 등록하는 예방 사전등록과는 별도 절차예요. FindUs는 DNA나 신청자 정보를 수집하지 않아요.</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href="tel:182" className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-[14px] font-bold text-white hover:bg-brand-dark ${focusRing}`}><PhoneIcon size={17} />182에 문의하기</a>
              <a href={OFFICIAL_DNA_URL} target="_blank" rel="noopener noreferrer" className={`flex min-h-11 items-center gap-1 rounded-xl border border-brand/20 bg-card px-4 py-3 text-[13px] font-bold text-brand hover:bg-hero ${focusRing}`}>안전Dream 공식 안내 <ArrowUpRightIcon size={14} /></a>
              <a href="/documents/dna-collection-guide.pdf" download className={`text-[12px] font-bold text-brand underline underline-offset-2 ${focusRing}`}>참고용 PDF 내려받기</a>
            </div>
          </section>
          <section aria-label="실종아동 전문기관 안내" className="mt-5 rounded-2xl bg-gold-soft p-4">
            <div className="flex items-center gap-2 text-gold-ink">
              <ShieldIcon size={20} />
              <h3 className="text-[16px] font-extrabold">실종아동 전문기관 안내</h3>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed break-keep text-muted">가족 찾기와 관련된 상담·지원 정보가 필요하다면, 실종아동 전문기관의 공식 안내를 확인하세요.</p>
            <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer"
              className={`mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl border border-gold/30 bg-card px-4 py-2 text-[13px] font-bold text-gold-ink hover:bg-gold/15 ${focusRing}`}>
              전문기관 공식 사이트 <ArrowUpRightIcon size={14} /><span className="sr-only">(새 창)</span>
            </a>
          </section>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">참고: 경찰청 안전Dream 유전자(DNA) 분석 정책 · 안내 확인일 2026. 10. 14. PDF는 참고 자료이며, 최신 대상 요건과 준비물은 182에서 확인해 주세요.</p>
        </Modal>
      )}
    </>
  );
}

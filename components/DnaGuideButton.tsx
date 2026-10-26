"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MISSING_CHILD_CENTER_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, LayersIcon, PhoneIcon, ScanFaceIcon, ShieldIcon } from "./Icons";
import Modal from "./Modal";

const OFFICIAL_DNA_URL = "https://www.safe182.go.kr/cont/homeLogContents.do?contentsNm=report_info_dna";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/* DNA 검사·상담 안내 팝업. 상황별 안내 팝업(GuideSteps)과 같은 결: 파랑·코랄로 나뉜 두 갈래 카드, 세로 타임라인,
   채취 후 흐름, 남색 연락 상자. 열릴 때 한 번만 차례로 떠오른다. */
const GUIDE =
  "[&>*]:animate-guide-rise [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.5s] [&>:nth-child(4)]:[animation-delay:.58s] [&>:nth-child(5)]:[animation-delay:.66s] [&>:nth-child(6)]:[animation-delay:.72s] motion-reduce:[&>*]:animate-none";
// 갈래마다 --tone 색을 바꾼다: 첫 갈래는 공공 블루, 둘째(data-tone="coral")는 코랄.
const ROUTE = [
  "[--tone-ink:#173B70] [--tone-line:#CFDEF0] [--tone-ring:rgb(57_120_184/16%)] [--tone-soft:#F1F7FF] [--tone:#3978B8]",
  "data-[tone=coral]:[--tone-ink:#B4473F] data-[tone=coral]:[--tone-line:#F6CDC9] data-[tone=coral]:[--tone-ring:rgb(212_103_94/18%)] data-[tone=coral]:[--tone-soft:#FEF4F3] data-[tone=coral]:[--tone:#D4675E]",
  "relative flex flex-col overflow-hidden rounded-[20px] border border-(--tone-line) bg-white shadow-[0_10px_28px_rgb(23_59_112/7%)] before:absolute before:inset-[0_0_auto] before:h-1 before:bg-(--tone) before:content-['']",
  "[transition:translate_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,border-color_.25s_ease] hover:[translate:0_-3px] hover:border-(--tone) hover:shadow-[0_18px_36px_rgb(23_59_112/11%)]",
  "motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:[translate:none]",
].join(" ");
// 번호 뒤로 세로선이 위에서 아래로 자란다.
const STEPS =
  "relative grid gap-3.5 px-5 pt-5 pb-4 max-sm:px-4 before:absolute before:top-[30px] before:bottom-[22px] before:left-[33px] before:w-0.5 before:origin-top before:animate-dna-line before:rounded-[2px] before:bg-(--tone-line) before:content-[''] max-sm:before:left-[29px] motion-reduce:before:animate-none";
const STEP_NUMBER =
  "relative z-1 grid size-7 flex-none animate-guide-number place-items-center rounded-full border-2 border-white bg-(--tone) text-[12px] font-extrabold text-white shadow-[0_3px_10px_var(--tone-ring)] motion-reduce:animate-none";
const STEP_DELAYS = ["[animation-delay:.36s]", "[animation-delay:.46s]", "[animation-delay:.56s]"];
const FLOW_STEP =
  "animate-dna-flow rounded-full border border-[#CFDEF0] bg-white px-3.5 py-2 text-[13px] font-bold text-navy motion-reduce:animate-none";
const FLOW_ARROW = "grid text-[#8AA3C2]";
const FLOW_LABEL = "mt-3.5 text-[13px] font-extrabold text-civic";
const KNOW_ITEM =
  "relative pl-3.5 text-[13px] leading-[1.6] break-keep text-civic-deep before:absolute before:top-[.62em] before:left-0 before:size-[5px] before:rounded-full before:bg-civic before:content-['']";
const CALL =
  "flex min-h-14 items-center gap-2.5 rounded-[14px] bg-white py-2.5 pr-[18px] pl-3 text-navy [transition:background-color_.2s_ease,translate_.25s_cubic-bezier(.2,.7,.2,1)] hover:[translate:0_-2px] hover:bg-[#EEF5FE] motion-reduce:transition-none motion-reduce:hover:[translate:none]";
const GHOST =
  "inline-flex min-h-11 items-center gap-1 rounded-xl border border-white/28 px-3.5 text-[13px] font-bold text-white [transition:background-color_.2s_ease,border-color_.2s_ease] hover:border-white/55 hover:bg-white/10 motion-reduce:transition-none";
const CENTER_LINK =
  "inline-flex min-h-10 flex-none items-center gap-[3px] rounded-xl border border-[#F2BDB8] bg-white px-3.5 text-[13px] font-bold text-coral-ink [transition:background-color_.2s_ease] hover:bg-[#FDEDEB] motion-reduce:transition-none";
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
          <div className={GUIDE}>
          <div className="flex items-center gap-3.5 rounded-[18px] border border-coral-line bg-coral-faint p-[18px] max-sm:p-3.5">
            <span aria-hidden="true" className="grid size-12 flex-none place-items-center rounded-[14px] bg-coral-strong text-white shadow-[0_8px_18px_rgb(212_103_94/18%)] [&_svg]:animate-dna-spin motion-reduce:[&_svg]:animate-none"><DnaGlyph /></span>
            <p>
              <strong className="block text-[15px] leading-[1.55] font-bold break-keep text-navy">친가족을 찾는 본인도, 실종된 자녀·가족을 찾는 부모와 가족도 시작할 수 있어요.</strong>
              <span className="mt-[3px] block text-[13px] leading-[1.6] break-keep text-civic-body">검사 대상 여부와 방문 절차는 먼저 182에 문의해 주세요.</span>
            </p>
          </div>
          <div className="mt-[18px] grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
            {ROUTES.map(({ title, purpose, Icon, steps, note }, index) => (
              <section key={title} aria-label={title} className={`${ROUTE} ${index === 0 ? "animate-dna-route" : "animate-dna-route-next"}`} data-tone={index === 0 ? "brand" : "coral"}>
                <div className="flex items-center gap-3 border-b border-(--tone-line) bg-(--tone-soft) px-5 pt-[22px] pb-[18px] max-sm:px-4 max-sm:pt-[18px] max-sm:pb-3.5">
                  <span aria-hidden="true" className="grid size-[46px] flex-none place-items-center rounded-[13px] bg-(--tone) text-white shadow-[0_8px_18px_var(--tone-ring)]"><Icon size={23} strokeWidth={1.8} /></span>
                  <div>
                    <h3 className="text-[17px] leading-[1.35] font-extrabold text-navy">{title}</h3>
                    <p className="mt-[3px] text-[13px] leading-[1.5] font-semibold break-keep text-(--tone-ink)">{purpose}</p>
                  </div>
                </div>
                <ol className={STEPS}>
                  {steps.map(([heading, text], i) => (
                    <li key={heading} className="relative flex gap-3">
                      <span aria-hidden="true" className={`${STEP_NUMBER} ${STEP_DELAYS[i]}`}>{i + 1}</span>
                      <div className="min-w-0">
                        <h4 className="text-[14.5px] leading-[1.4] font-extrabold text-navy">{heading}</h4>
                        <p className="mt-[3px] text-[13px] leading-[1.6] break-keep text-civic-body">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mx-5 mt-auto mb-5 flex gap-2 rounded-xl bg-(--tone-soft) px-3.5 py-3 text-[12.5px] leading-[1.6] break-keep text-civic-deep shadow-[inset_0_0_0_1px_var(--tone-line)] max-sm:mx-4"><ShieldIcon size={15} strokeWidth={2} className="mt-0.5 flex-none text-(--tone)" />{note}</p>
              </section>
            ))}
          </div>
          <section aria-label="DNA 채취 후 절차와 이용 안내" className="mt-[18px] rounded-[18px] border border-civic-line bg-civic-panel p-5 max-sm:p-3.5">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-navy"><LayersIcon size={20} className="text-civic" />DNA 채취 후 절차와 이용 안내</h3>
            <h4 className={FLOW_LABEL}>채취 후에는 이렇게 진행돼요</h4>
            <ol className="mt-2.5 flex flex-wrap items-center gap-2">
              <li className={`${FLOW_STEP} [animation-delay:.75s]`}>유전자정보 분석·등록</li>
              <li aria-hidden="true" className={FLOW_ARROW}><ArrowRightIcon size={16} strokeWidth={2.2} /></li>
              <li className={`${FLOW_STEP} [animation-delay:.85s]`}>대조</li>
              <li aria-hidden="true" className={FLOW_ARROW}><ArrowRightIcon size={16} strokeWidth={2.2} /></li>
              <li className={`${FLOW_STEP} [animation-delay:.95s]`}>일치 가능성이 있으면 추가 신원 확인</li>
            </ol>
            <p className="mt-2.5 text-[13px] leading-[1.65] break-keep text-civic-body">당장 일치자가 없어도 이후 확보된 정보와 대조할 수 있어요.</p>
            <h4 className={FLOW_LABEL}>함께 알아두세요</h4>
            <ul className="mt-2 grid gap-2">
              <li className={KNOW_ITEM}>같은 날 채취할 필요는 없어요.</li>
              <li className={KNOW_ITEM}>DNA 등록이 가족 확인을 보장하지는 않아요.</li>
              <li className={KNOW_ITEM}>지문·사진을 등록하는 예방 사전등록과는 별도 절차예요.</li>
              <li className={KNOW_ITEM}>FindUs는 DNA나 신청자 정보를 수집하지 않아요.</li>
            </ul>
          </section>
          <div className="mt-[18px] rounded-[18px] bg-navy p-[18px] text-white max-sm:p-3.5">
            <p className="text-[14px] leading-[1.6] font-bold break-keep">대상 여부와 준비물은 182에서 가장 정확하게 안내받을 수 있어요.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <a href="tel:182" className={`${CALL} ${focusRing}`}><span aria-hidden="true" className="grid size-[34px] place-items-center rounded-[10px] bg-civic text-white"><PhoneIcon size={17} /></span><span><strong className="block text-[18px] font-[850]">182에 문의하기</strong><small className="block text-[11.5px] font-semibold text-civic-body">실종아동 제보·상담</small></span></a>
              <a href={OFFICIAL_DNA_URL} target="_blank" rel="noopener noreferrer" className={`${GHOST} ${focusRing}`}>안전Dream 공식 안내 <ArrowUpRightIcon size={14} /><span className="sr-only">(새 창)</span></a>
              <a href="/documents/dna-collection-guide.pdf" download className={`text-[12px] font-bold text-[#C9E5FF] underline underline-offset-3 hover:text-white ${focusRing}`}>참고용 PDF 내려받기</a>
            </div>
          </div>
          <section aria-label="실종아동 전문기관 안내" className="mt-3.5 flex items-center gap-3.5 rounded-2xl border border-coral-line bg-[#FFF8F7] px-[18px] py-4 max-md:flex-wrap">
            <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-xl bg-[#FDE8E6] text-coral-ink"><HeartIcon size={20} /></span>
            <div className="min-w-0 flex-1">
              {/* 전역 팔레트가 h3를 남색으로 칠하므로 important로 코랄을 지킨다. */}
              <h3 className="text-[15px] font-extrabold text-coral-ink!">실종아동 전문기관 안내</h3>
              <p className="mt-0.5 text-[12.5px] leading-[1.6] break-keep text-[#5E4A44]">가족 찾기와 관련된 상담·지원 정보가 필요하다면, 실종아동 전문기관의 공식 안내를 확인하세요.</p>
            </div>
            <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer" className={`${CENTER_LINK} ${focusRing}`}>
              전문기관 공식 사이트 <ArrowUpRightIcon size={14} /><span className="sr-only">(새 창)</span>
            </a>
          </section>
          <p className="mt-3 text-[11px] leading-[1.6] text-civic-faint">참고: 경찰청 안전Dream 유전자(DNA) 분석 정책 · 안내 확인일 2026. 10. 14. PDF는 참고 자료이며, 최신 대상 요건과 준비물은 182에서 확인해 주세요.</p>
          </div>
        </Modal>
      )}
    </>
  );
}

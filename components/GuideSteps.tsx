"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import DnaGuideButton from "./DnaGuideButton";
import styles from "./GuideSteps.module.css";
import { MISSING_CHILD_CENTER_URL, SAFE182_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, PhoneIcon, ScanFaceIcon } from "./Icons";

// 상황별 안내 카드는 팝업을 연다. 기존 #know, #me 링크도 같은 안내로 연결한다.
const GUIDES = [
  {
    id: "know",
    tag: "목격·제보",
    title: "이 사람을 알아요",
    summary: "어디선가 본 얼굴이라면, 기억나는 단서를 공식 제보로 연결해 주세요.",
    Icon: ScanFaceIcon,
    tone: {
      art: "bg-brand-soft text-brand",
      badge: "bg-brand text-white",
      text: "text-brand",
      ring: "hover:border-brand",
    },
    steps: [
      {
        title: "원본 정보 확인",
        text: "이름, 실종 당시 사진, 실종 지역과 특징을 다시 확인하세요.",
      },
      {
        title: "기억나는 단서 정리",
        text: "목격 장소·일시, 인상착의, 이동 방향, 동행인처럼 떠오르는 정보를 메모해 두세요.",
      },
      {
        title: "공식 기관에 제보",
        text: "경찰청 182나 안전Dream으로 전달하세요. 상세정보 화면의 '목격 제보하기'에서도 방법을 볼 수 있어요.",
      },
    ],
    actions: {
      note: "긴급하거나 확실한 정보라면 망설이지 말고 바로 알려주세요.",
      link: { href: SAFE182_URL, label: "안전Dream 공식 사이트" },
    },
  },
  {
    id: "me",
    tag: "가족 찾기",
    title: "혹시 나?",
    summary: "어린 시절 기억이 낯설게 느껴진다면, 차근차근 확인하고 상담부터 시작해 보세요.",
    Icon: HeartIcon,
    tone: {
      art: "bg-gold-soft text-gold-ink",
      badge: "bg-gold-ink text-white",
      text: "text-gold-ink",
      ring: "hover:border-gold",
    },
    steps: [
      {
        title: "어린 시절 기록 모으기",
        text: "기억나는 이름, 살던 동네, 어릴 적 사진, 보호시설 기록 등을 모아 보세요.",
      },
      {
        title: "사진과 특징 비교",
        text: "실종 당시 사진과 점·흉터 같은 신체 특징을 지금의 나와 비교해 보세요.",
      },
      {
        title: "182에 먼저 상담",
        text: "먼저 182에 검사 대상 여부와 경찰서 방문 절차를 문의해 보세요. 담당 부서와 준비물도 안내받을 수 있어요.",
      },
    ],
    actions: {
      note: "어디서부터 시작할지 모르겠다면 182에 전화해 상담을 받아 보세요.",
      link: { href: MISSING_CHILD_CENTER_URL, label: "실종아동전문기관 안내" },
    },
  },
] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export type GuidePopupId = "know" | "me";

export function GuidePopup({ guideId, onClose, returnFocusTo }: { guideId: GuidePopupId; onClose: () => void; returnFocusTo?: HTMLElement | null }) {
  const selected = GUIDES.find((guide) => guide.id === guideId)!;
  return (
    <Modal title={selected.title} eyebrow={selected.tag} accent={selected.id === "me" ? "gold" : "brand"} onClose={onClose} returnFocusTo={returnFocusTo} mobileFullscreen>
          <div className={`mb-4 flex items-center gap-3 rounded-2xl p-4 ${selected.tone.art}`}>
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/75">
              <selected.Icon size={24} strokeWidth={1.8} />
            </span>
            <p className="text-[14px] leading-relaxed font-medium break-keep text-ink">{selected.summary}</p>
          </div>
          <ol className="mt-6 flex flex-col gap-4">
            {selected.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-card p-5 max-sm:p-4">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ${selected.tone.badge}`}>{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-[16px] leading-snug font-bold break-keep">{step.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed break-keep text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {selected.id === "me" && <div className="mt-5"><DnaGuideButton /></div>}
          <div className="mt-5 rounded-2xl bg-surface p-5">
            <p className="text-[14px] leading-relaxed font-bold break-keep">{selected.actions.note}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="tel:182" className={`flex min-h-12 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark ${focusRing}`}>
                <PhoneIcon size={17} strokeWidth={2.2} />경찰청 182 전화하기
              </a>
              <a href={selected.actions.link.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-0.5 text-[14px] font-bold text-brand hover:underline ${focusRing}`}>
                {selected.actions.link.label} <ArrowUpRightIcon size={14} strokeWidth={2.2} />
              </a>
            </div>
          </div>
    </Modal>
  );
}
export default function GuideSteps({ overlap = true, compact = false }: { overlap?: boolean; compact?: boolean }) {
  const [selected, setSelected] = useState<(typeof GUIDES)[number] | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const openFromHash = () => {
      const guide = GUIDES.find((item) => `#${item.id}` === window.location.hash);
      if (guide) {
        returnFocusRef.current = cardRefs.current[guide.id];
        setSelected(guide);
      }
    };
    openFromHash();
    // Next.js의 같은 페이지 링크는 hashchange 없이 이동할 수 있다.
    const openFromLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      const guide = GUIDES.find((item) => `#${item.id}` === url.hash);
      if (!guide || url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      event.preventDefault();
      returnFocusRef.current = link;
      setSelected(guide);
    };
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", openFromLink, true);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", openFromLink, true);
    };
  }, []);

  const closeGuide = () => {
    setSelected(null);
    if (GUIDES.some((item) => `#${item.id}` === window.location.hash)) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      <div role="group" aria-label="상황 선택" className={`relative ${overlap ? "-mt-14" : ""} grid items-stretch gap-4 md:grid-cols-2 ${compact ? styles.compact : ""}`}>
        {GUIDES.map(({ id, tag, title, summary, Icon, tone }) => (
          <div key={id} className={`min-w-0 rounded-2xl border border-line bg-card shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none ${tone.ring}`}>
          <button
            id={id}
            ref={(element) => { cardRefs.current[id] = element; }}
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => {
              returnFocusRef.current = event.currentTarget;
              setSelected(GUIDES.find((item) => item.id === id) ?? null);
            }}
            className={`group flex w-full cursor-pointer items-start gap-5 rounded-2xl p-7 text-left focus-visible:outline-none max-sm:gap-4 max-sm:p-5`}
          >
            <span
              aria-hidden="true"
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 max-sm:h-13 max-sm:w-13 ${tone.art}`}
            >
              <Icon size={32} strokeWidth={1.7} className="max-sm:h-6.5 max-sm:w-6.5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={`text-[13px] font-bold ${tone.text}`}>{tag}</span>
              <span className="mt-0.5 text-[24px] leading-tight font-extrabold tracking-[-0.02em] max-sm:text-[20px]">
                {title}
              </span>
              <span className="mt-2 text-[15px] leading-relaxed break-keep text-muted max-sm:text-[14px]">
                {summary}
              </span>
              <span
                className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-sm text-[15px] font-bold group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-4 ${tone.text}`}
              >
                절차 보기
                <ArrowRightIcon
                  size={16}
                  strokeWidth={2.2}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </button>
          {id === "me" && (
            <div className="px-7 pb-7 max-sm:px-5 max-sm:pb-5">
              <DnaGuideButton variant="followup" />
            </div>
          )}
          </div>
        ))}
      </div>

      {selected && <GuidePopup guideId={selected.id} onClose={closeGuide} returnFocusTo={returnFocusRef.current} />}
    </>
  );
}

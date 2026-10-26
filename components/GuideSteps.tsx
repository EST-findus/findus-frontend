"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import DnaGuideButton from "./DnaGuideButton";
import styles from "./GuideSteps.module.css";
import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, HeartIcon, PhoneIcon, ScanFaceIcon, ShieldIcon, SparklesIcon } from "./Icons";

// 상황별 안내 카드는 팝업을 연다. 기존 #know, #me 링크도 같은 안내로 연결한다.
// 팝업은 카드를 한 번 눌러 들어온 곳이라, 단계마다 챙길 것(tips)과 알아두면 좋은 점·주의할 점까지 함께 보여준다.
const GUIDES = [
  {
    id: "know",
    tag: "목격·제보",
    title: "이 사람을 알아요",
    summary: "어디선가 본 얼굴이라면, 기억나는 단서를 공식 제보로 연결해 주세요.",
    lead: "확실하지 않아도 괜찮아요. 작은 단서 하나가 확인의 실마리가 될 수 있어요.",
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
        tips: ["이름·나이", "실종 당시 사진", "실종 지역", "점·흉터 같은 특징"],
      },
      {
        title: "기억나는 단서 정리",
        text: "목격 장소·일시, 인상착의, 이동 방향, 동행인처럼 떠오르는 정보를 메모해 두세요.",
        tips: ["언제·어디서", "옷차림·인상착의", "이동 방향", "함께 있던 사람"],
      },
      {
        title: "공식 기관에 제보",
        text: "경찰청 182나 안전Dream으로 전달하세요. 상세정보 화면의 '목격 제보하기'에서도 방법을 볼 수 있어요.",
        tips: ["경찰청 182", "안전Dream", "위급하면 112"],
      },
    ],
    goodToKnow: [
      "본 장소와 시간은 바로 메모해 두세요. 시간이 지나면 기억이 흐려지기 쉬워요.",
      "주변 간판이나 건물, 정류장 이름처럼 위치를 알 수 있는 단서도 함께 적어 두면 좋아요.",
      "FindUs는 제보를 직접 받지 않아요. 제보는 182·112 또는 안전Dream으로 해 주세요.",
    ],
    cautions: {
      title: "이것만은 주의해 주세요",
      items: [
        "직접 다가가 데려가거나 뒤쫓기보다, 먼저 신고해 주세요.",
        "확인되지 않은 정보나 사진을 SNS에 올리면 당사자와 가족에게 상처가 될 수 있어요.",
      ],
    },
    calls: ["182", "112"],
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
    lead: "혼자 고민하지 않아도 돼요. 떠오르는 기억부터 천천히 함께 정리해 봐요.",
    Icon: HeartIcon,
    tone: {
      art: "bg-[#FDE8E6] text-[#B4473F]",
      badge: "bg-[#D4675E] text-white",
      text: "text-[#B4473F]",
      ring: "hover:border-[#D4675E]",
    },
    steps: [
      {
        title: "어린 시절 기록 모으기",
        text: "기억나는 이름, 살던 동네, 어릴 적 사진, 보호시설 기록 등을 모아 보세요.",
        tips: ["기억나는 이름", "살던 동네", "어릴 적 사진", "보호시설 기록"],
      },
      {
        title: "사진과 특징 비교",
        text: "실종 당시 사진과 점·흉터 같은 신체 특징을 지금의 나와 비교해 보세요.",
        tips: ["실종 당시 사진", "점·흉터", "어릴 적 버릇·말투"],
      },
      {
        title: "182에 먼저 상담",
        text: "먼저 182에 검사 대상 여부와 경찰서 방문 절차를 문의해 보세요. 담당 부서와 준비물도 안내받을 수 있어요.",
        tips: ["검사 대상 여부", "경찰서 방문 절차", "준비물"],
      },
    ],
    goodToKnow: [
      "기억이 조각나 있어도 괜찮아요. 떠오르는 대로 적어 두면 상담할 때 큰 도움이 돼요.",
      "DNA 등록만으로 가족 확인이 바로 보장되지는 않아요. 결과와 이후 절차는 담당 기관의 안내를 따라 주세요.",
      "실종아동전문기관에서도 가족 찾기와 실종 가족 지원 상담을 받을 수 있어요.",
    ],
    cautions: {
      title: "마음이 무겁다면",
      items: [
        "낯선 기억 때문에 마음이 흔들릴 수 있어요. 서두르지 말고, 상담을 통해 한 걸음씩 시작해도 괜찮아요.",
      ],
    },
    calls: ["182", "027770182"],
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
  // 안내마다 정한 순서대로 보여주고, 첫 번호를 가장 눈에 띄게 둔다.
  const calls = selected.calls.flatMap((tel) => OFFICIAL_CALLS.filter((call) => call.tel === tel));
  return (
    <Modal title={selected.title} eyebrow={selected.tag} accent={selected.id === "me" ? "coral" : "brand"} onClose={onClose} returnFocusTo={returnFocusTo} mobileFullscreen>
      <div className={styles.popup} data-guide={selected.id}>
          <div className={styles.popupIntro}>
            <span aria-hidden="true" className={styles.popupIcon}>
              <selected.Icon size={24} strokeWidth={1.8} />
            </span>
            <div>
              <p className={styles.popupSummary}>{selected.summary}</p>
              <p className={styles.popupLead}>{selected.lead}</p>
            </div>
          </div>

          <p className={styles.popupHeading}>이렇게 진행해요</p>
          <ol className={styles.popupSteps}>
            {selected.steps.map((step, i) => (
              <li key={step.title}>
                <span aria-hidden="true" className={styles.popupNumber}>{i + 1}</span>
                <div className={styles.popupStep}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <ul aria-label="챙기면 좋은 것">
                    {step.tips.map((tip) => <li key={tip}><CheckIcon size={12} strokeWidth={2.6} />{tip}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {selected.id === "me" && <div className={styles.popupDna}><DnaGuideButton /></div>}

          <div className={styles.popupNotes}>
            <section aria-labelledby={`${selected.id}-good`} className={styles.popupGood}>
              <h3 id={`${selected.id}-good`}><SparklesIcon size={16} strokeWidth={2} />알아두면 좋아요</h3>
              <ul>{selected.goodToKnow.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section aria-labelledby={`${selected.id}-care`} className={styles.popupCare}>
              <h3 id={`${selected.id}-care`}>{selected.id === "me" ? <HeartIcon size={16} strokeWidth={2} /> : <ShieldIcon size={16} strokeWidth={2} />}{selected.cautions.title}</h3>
              <ul>{selected.cautions.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>

          <div className={styles.popupContact}>
            <p className={styles.popupContactNote}>{selected.actions.note}</p>
            <div className={styles.popupCalls}>
              {calls.map((call, i) => (
                <a key={call.tel} href={`tel:${call.tel}`} className={`${styles.popupCall} ${i === 0 ? styles.popupCallPrimary : ""} ${focusRing}`}>
                  <span aria-hidden="true"><PhoneIcon size={17} strokeWidth={2.2} /></span>
                  <span><strong>{call.number}</strong><small>{call.label}</small></span>
                </a>
              ))}
            </div>
            <a href={selected.actions.link.href} target="_blank" rel="noopener noreferrer" className={`${styles.popupLink} ${focusRing}`}>
              {selected.actions.link.label} <ArrowUpRightIcon size={14} strokeWidth={2.2} />
              <span className="sr-only">(새 창)</span>
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
        {GUIDES.map(({ id, tag, title, summary, Icon, tone, steps }) => (
          <div key={id} data-guide={id} className={`min-w-0 rounded-2xl border border-line bg-card shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none ${tone.ring}`}>
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
          {compact && (
            // 안내 탭에서는 절차 세 단계를 카드에서 바로 훑어볼 수 있게 한다.
            <ol className={styles.preview} aria-label={`${title} 절차`}>
              {steps.map((step, index) => <li key={step.title}><span aria-hidden="true">{index + 1}</span>{step.title}</li>)}
            </ol>
          )}
          {compact && id === "know" && (
            // 오른쪽 카드의 DNA 안내와 짝을 이루도록, 제보 카드 아래에는 182 바로 걸기를 둔다.
            <div className="px-7 pb-7 max-sm:px-5 max-sm:pb-5">
              <a href="tel:182" className={`${styles.callout} ${focusRing}`}>
                <span aria-hidden="true"><PhoneIcon size={18} strokeWidth={2} /></span>
                <span><small>긴급하거나 확실한 정보라면</small><strong>경찰청 182 바로 전화하기</strong><em>망설이지 말고 바로 알려주세요.</em></span>
                <ArrowRightIcon size={16} strokeWidth={2.2} />
              </a>
            </div>
          )}
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

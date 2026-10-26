"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import DnaGuideButton from "./DnaGuideButton";
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

// 안내마다 --tone 색을 정한다: 목격·제보는 공공 블루, 가족 찾기(data-guide="me")는 코랄.
const TONE_VARS = [
  "[--tone-ink:#173B70] [--tone-line:#CFDEF0] [--tone-soft:#F1F7FF] [--tone:#3978B8]",
  "data-[guide=me]:[--tone-ink:#B4473F] data-[guide=me]:[--tone-line:#F6CDC9] data-[guide=me]:[--tone-soft:#FEF4F3] data-[guide=me]:[--tone:#D4675E]",
].join(" ");

/* 이용 안내 탭의 작은 상황 카드(compact). 색 면 머리, 색 윗선, 채운 아이콘과 세 단계 미리보기로 두 카드가 또렷이 나뉜다.
   카드마다 머리·단계·아래 상자 세 줄을 subgrid로 나눠 가져, 요약이 한 줄 더 길어도 두 카드의 경계가 나란히 맞는다. */
const COMPACT_CARD = [
  TONE_VARS,
  "[--tone-ring:rgb(57_120_184/14%)] data-[guide=me]:[--tone-ring:rgb(212_103_94/16%)]",
  "group/card relative row-span-3 grid min-w-0 grid-rows-subgrid gap-y-0 overflow-hidden rounded-[20px] border border-(--tone-line) bg-white shadow-[0_10px_28px_rgb(23_59_112/8%)]",
  "before:absolute before:inset-[0_0_auto] before:h-1 before:bg-(--tone) before:content-['']",
  "[transition:translate_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease,border-color_.25s_ease] hover:[translate:0_-4px] hover:border-(--tone) hover:shadow-[0_20px_40px_rgb(23_59_112/13%)]",
  "motion-reduce:transition-none motion-reduce:hover:[translate:none]",
].join(" ");
// 가족 찾기 카드 아래의 DNA 안내 버튼(#families)을 182 전화 상자와 같은 크기로 줄인다.
const COMPACT_FAMILIES = [
  "[&_#families]:min-h-[72px] [&_#families]:gap-2.5 [&_#families]:rounded-xl [&_#families]:px-3 [&_#families]:py-2.5 [&_#families]:shadow-none",
  "[&_#families>span:first-child]:size-[34px] [&_#families>span:first-child]:rounded-[10px]",
  "[&_#families>span:nth-child(2)>span:first-child]:text-[10px]",
  "[&_#families>span:nth-child(2)>span:nth-child(2)]:mt-0.5 [&_#families>span:nth-child(2)>span:nth-child(2)]:text-[16px]",
  "[&_#families>span:nth-child(2)>span:nth-child(3)]:mt-0.5 [&_#families>span:nth-child(2)>span:nth-child(3)]:text-[11px]",
].join(" ");
// '절차 보기'는 버튼처럼 읽히게: 톤 테두리, 카드에 올리면 톤 색으로 채운다.
const COMPACT_MORE =
  "mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-(--tone) px-3.5 py-[7px] text-[13px] font-bold text-(--tone-ink) group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-4 [transition:background-color_.2s_ease,color_.2s_ease] group-hover/card:bg-(--tone) group-hover/card:text-white motion-reduce:transition-none";
const PREVIEW_ITEM =
  "flex items-center gap-2.5 rounded-xl border border-[#E7ECF2] bg-white px-3 py-2.5 text-[13.5px] font-bold text-[#25364D] [transition:border-color_.2s_ease,translate_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/card:border-(--tone-line) group-hover/card:[translate:3px_0] motion-reduce:transition-none motion-reduce:group-hover/card:[translate:none]";
// 카드에 올리면 미리보기 단계가 차례로 살짝 밀려난다.
const PREVIEW_DELAYS = ["", "group-hover/card:delay-50", "group-hover/card:delay-100"];
// 182 전화 상자. 다른 카드의 DNA 안내 상자와 같은 크기다.
// 카드 맨 아래 상자(182 전화·DNA 안내)의 여백
const COMPACT_BOX = "-mt-1.5 px-[22px] pb-[22px] max-sm:px-4 max-sm:pb-4";
const CALLOUT =
  "group/callout flex min-h-[72px] items-center gap-2.5 rounded-xl border border-[#CFDEF0] bg-[#F6FAFF] px-3 py-2.5 text-navy [transition:border-color_.2s_ease,background-color_.2s_ease] hover:border-civic hover:bg-[#EEF5FE]";

/* 상황별 안내 팝업. 카드보다 더 자세히: 조용한 타임라인 위의 단계와 단계마다 챙길 것,
   알아두면 좋은 점·주의할 점, 알맞은 전화번호까지. 모두 한 번만 차례로 떠오른다. */
const POPUP = [
  TONE_VARS,
  "[--tone-ring:rgb(57_120_184/16%)] data-[guide=me]:[--tone-ring:rgb(212_103_94/18%)]",
  "[&>*]:animate-guide-rise [&>:nth-child(2)]:[animation-delay:.06s] [&>:nth-child(3)]:[animation-delay:.1s] [&>:nth-child(4)]:[animation-delay:.5s] [&>:nth-child(5)]:[animation-delay:.58s] [&>:nth-child(6)]:[animation-delay:.66s] motion-reduce:[&>*]:animate-none",
].join(" ");
// 번호 뒤로 세로선이 위에서 아래로 자란다.
const POPUP_STEPS =
  "relative grid gap-3 before:absolute before:top-[22px] before:bottom-[22px] before:left-[19px] before:w-0.5 before:origin-top before:animate-guide-line before:rounded-[2px] before:bg-(--tone-line) before:content-[''] max-sm:before:left-4 motion-reduce:before:animate-none";
const POPUP_STEP_DELAYS = ["[animation-delay:.16s]", "[animation-delay:.26s]", "[animation-delay:.36s]"];
const POPUP_NUMBER =
  "relative z-1 mt-3 grid size-10 flex-none animate-guide-number place-items-center rounded-full border-3 border-white bg-(--tone) text-[14px] font-extrabold text-white shadow-[0_4px_12px_var(--tone-ring)] max-sm:size-[34px] max-sm:text-[13px] motion-reduce:animate-none";
const POPUP_NUMBER_DELAYS = ["[animation-delay:.24s]", "[animation-delay:.34s]", "[animation-delay:.44s]"];
const POPUP_STEP =
  "min-w-0 flex-1 rounded-2xl border border-civic-line bg-white px-[18px] py-4 [transition:border-color_.25s_ease,box-shadow_.3s_ease,translate_.3s_cubic-bezier(.2,.7,.2,1)] group-hover/step:[translate:3px_0] group-hover/step:border-(--tone-line) group-hover/step:shadow-[0_10px_24px_rgb(23_59_112/7%)] max-sm:p-3.5 motion-reduce:transition-none motion-reduce:group-hover/step:[translate:none]";
const NOTE_ITEM =
  "relative pl-3.5 text-[13px] leading-[1.6] break-keep before:absolute before:top-[.62em] before:left-0 before:size-[5px] before:rounded-full before:content-['']";
const POPUP_CALL =
  "flex min-h-14 items-center gap-2.5 rounded-[14px] border px-3.5 py-2.5 [transition:background-color_.2s_ease,border-color_.2s_ease,translate_.25s_cubic-bezier(.2,.7,.2,1)] hover:[translate:0_-2px] motion-reduce:transition-none motion-reduce:hover:[translate:none]";

export type GuidePopupId = "know" | "me";

export function GuidePopup({ guideId, onClose, returnFocusTo }: { guideId: GuidePopupId; onClose: () => void; returnFocusTo?: HTMLElement | null }) {
  const selected = GUIDES.find((guide) => guide.id === guideId)!;
  // 안내마다 정한 순서대로 보여주고, 첫 번호를 가장 눈에 띄게 둔다.
  const calls = selected.calls.flatMap((tel) => OFFICIAL_CALLS.filter((call) => call.tel === tel));
  return (
    <Modal title={selected.title} eyebrow={selected.tag} accent={selected.id === "me" ? "coral" : "brand"} onClose={onClose} returnFocusTo={returnFocusTo} mobileFullscreen>
      <div className={POPUP} data-guide={selected.id}>
          <div className="flex items-center gap-3.5 rounded-[18px] border border-(--tone-line) bg-(--tone-soft) p-[18px] max-sm:p-3.5">
            <span aria-hidden="true" className="grid size-12 flex-none animate-guide-breathe place-items-center rounded-[14px] bg-(--tone) text-white shadow-[0_8px_18px_var(--tone-ring)] motion-reduce:animate-none">
              <selected.Icon size={24} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-[15px] leading-[1.55] font-bold break-keep text-navy">{selected.summary}</p>
              <p className="mt-[3px] text-[13px] leading-[1.6] break-keep text-civic-body">{selected.lead}</p>
            </div>
          </div>

          <p className="mt-[26px] mb-3 text-[13px] font-extrabold tracking-[.02em] text-(--tone-ink)">이렇게 진행해요</p>
          <ol className={POPUP_STEPS}>
            {selected.steps.map((step, i) => (
              <li key={step.title} className={`group/step relative flex animate-guide-rise gap-3.5 max-sm:gap-2.5 motion-reduce:animate-none ${POPUP_STEP_DELAYS[i]}`}>
                <span aria-hidden="true" className={`${POPUP_NUMBER} ${POPUP_NUMBER_DELAYS[i]}`}>{i + 1}</span>
                <div className={POPUP_STEP}>
                  <h3 className="text-[16px] leading-[1.4] font-extrabold break-keep text-navy">{step.title}</h3>
                  <p className="mt-[5px] text-[14px] leading-[1.65] break-keep text-civic-body">{step.text}</p>
                  <ul aria-label="챙기면 좋은 것" className="mt-2.5 flex flex-wrap gap-1.5">
                    {step.tips.map((tip) => <li key={tip} className="inline-flex items-center gap-1 rounded-full bg-(--tone-soft) px-2.5 py-1 text-[12px] font-bold text-(--tone-ink) shadow-[inset_0_0_0_1px_var(--tone-line)]"><CheckIcon size={12} strokeWidth={2.6} className="text-(--tone)" />{tip}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {selected.id === "me" && <div className="mt-4"><DnaGuideButton /></div>}

          <div className="mt-[18px] grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-3 max-sm:grid-cols-[minmax(0,1fr)]">
            <section aria-labelledby={`${selected.id}-good`} className="rounded-2xl border border-civic-line bg-civic-panel px-[18px] py-4">
              <h3 id={`${selected.id}-good`} className="flex items-center gap-1.5 text-[14px] font-extrabold text-navy"><SparklesIcon size={16} strokeWidth={2} className="text-(--tone)" />알아두면 좋아요</h3>
              <ul className="mt-2.5 grid gap-2">{selected.goodToKnow.map((item) => <li key={item} className={`${NOTE_ITEM} text-civic-deep before:bg-(--tone)`}>{item}</li>)}</ul>
            </section>
            <section aria-labelledby={`${selected.id}-care`} className={`rounded-2xl border px-[18px] py-4 ${selected.id === "me" ? "border-coral-line bg-[#FFF8F7]" : "border-[#F6D3CF] bg-[#FFF7F6]"}`}>
              {/* 전역 팔레트가 h3를 남색으로 칠하므로 important로 코랄을 지킨다. */}
              <h3 id={`${selected.id}-care`} className="flex items-center gap-1.5 text-[14px] font-extrabold text-coral-ink!">{selected.id === "me" ? <HeartIcon size={16} strokeWidth={2} /> : <ShieldIcon size={16} strokeWidth={2} />}{selected.cautions.title}</h3>
              <ul className="mt-2.5 grid gap-2">{selected.cautions.items.map((item) => <li key={item} className={`${NOTE_ITEM} text-[#5E4A44] before:bg-coral`}>{item}</li>)}</ul>
            </section>
          </div>

          <div className="mt-[18px] rounded-[18px] bg-navy p-[18px] text-white">
            <p className="text-[14px] leading-[1.6] font-bold break-keep">{selected.actions.note}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 max-sm:grid-cols-[minmax(0,1fr)]">
              {calls.map((call, i) => (
                <a key={call.tel} href={`tel:${call.tel}`} className={`${POPUP_CALL} ${i === 0 ? "border-white bg-white text-navy hover:border-white hover:bg-[#EEF5FE]" : "border-white/22 bg-white/8 text-white hover:border-white/45 hover:bg-white/14"} ${focusRing}`}>
                  <span aria-hidden="true" className={`grid size-[34px] flex-none place-items-center rounded-[10px] ${i === 0 ? "bg-civic text-white" : "bg-white/14"}`}><PhoneIcon size={17} strokeWidth={2.2} /></span>
                  <span className="grid"><strong className="text-[18px] font-[850] tracking-[-.2px]">{call.number}</strong><small className={`text-[11.5px] font-semibold ${i === 0 ? "text-civic-body" : "text-white/75"}`}>{call.label}</small></span>
                </a>
              ))}
            </div>
            <a href={selected.actions.link.href} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-flex items-center gap-0.5 text-[13px] font-bold text-[#C9E5FF] hover:text-white hover:underline hover:underline-offset-3 ${focusRing}`}>
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
      <div role="group" aria-label="상황 선택" className={`relative ${overlap ? "-mt-14" : ""} grid items-stretch gap-4 md:grid-cols-2 ${compact ? COMPACT_FAMILIES : ""}`}>
        {GUIDES.map(({ id, tag, title, summary, Icon, tone, steps }) => (
          <div key={id} data-guide={id} className={compact ? COMPACT_CARD : `min-w-0 rounded-2xl border border-line bg-card shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none ${tone.ring}`}>
          <button
            id={id}
            ref={(element) => { cardRefs.current[id] = element; }}
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => {
              returnFocusRef.current = event.currentTarget;
              setSelected(GUIDES.find((item) => item.id === id) ?? null);
            }}
            className={`group flex w-full cursor-pointer items-start text-left focus-visible:outline-none ${compact ? "gap-4 rounded-[20px_20px_0_0] border-b border-(--tone-line) bg-(--tone-soft) px-[22px] pt-6 pb-5 max-sm:gap-3 max-sm:px-4 max-sm:pt-5 max-sm:pb-3.5" : "gap-5 rounded-2xl p-7 max-sm:gap-4 max-sm:p-5"}`}
          >
            <span
              aria-hidden="true"
              className={`flex shrink-0 items-center justify-center transition-transform group-hover:scale-105 ${compact ? "size-[52px] rounded-[14px] bg-(--tone) text-white shadow-[0_8px_18px_var(--tone-ring)] max-sm:size-11" : `h-16 w-16 rounded-2xl max-sm:h-13 max-sm:w-13 ${tone.art}`}`}
            >
              <Icon size={32} strokeWidth={1.7} className={compact ? "size-[26px]" : "max-sm:h-6.5 max-sm:w-6.5"} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={compact ? "w-fit rounded-full bg-white px-2.5 py-[3px] text-[12px] font-bold text-(--tone-ink) shadow-[inset_0_0_0_1px_var(--tone-line)]" : `text-[13px] font-bold ${tone.text}`}>{tag}</span>
              <span className={`leading-tight font-extrabold tracking-[-0.02em] max-sm:text-[20px] ${compact ? "mt-2 text-[22px] text-navy" : "mt-0.5 text-[24px]"}`}>
                {title}
              </span>
              <span className={`break-keep ${compact ? "mt-1.5 text-[13.5px] leading-[1.6] text-civic-body" : "mt-2 text-[15px] leading-relaxed text-muted max-sm:text-[14px]"}`}>
                {summary}
              </span>
              <span
                className={compact ? COMPACT_MORE : `mt-4 inline-flex w-fit items-center gap-1.5 rounded-sm text-[15px] font-bold group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-4 ${tone.text}`}
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
            <ol className="mx-[22px] mt-4 mb-[22px] grid gap-2 max-sm:mx-4 max-sm:mt-3 max-sm:mb-4" aria-label={`${title} 절차`}>
              {steps.map((step, index) => <li key={step.title} className={`${PREVIEW_ITEM} ${PREVIEW_DELAYS[index]}`}><span aria-hidden="true" className="grid size-6 flex-none place-items-center rounded-full bg-(--tone-soft) text-[12px] font-extrabold text-(--tone-ink) shadow-[inset_0_0_0_1px_var(--tone-line)]">{index + 1}</span>{step.title}</li>)}
            </ol>
          )}
          {compact && id === "know" && (
            // 오른쪽 카드의 DNA 안내와 짝을 이루도록, 제보 카드 아래에는 182 바로 걸기를 둔다.
            <div className={COMPACT_BOX}>
              <a href="tel:182" className={`${CALLOUT} ${focusRing}`}>
                <span aria-hidden="true" className="grid size-[34px] flex-none place-items-center rounded-[10px] bg-civic-soft text-civic"><PhoneIcon size={18} strokeWidth={2} /></span>
                <span className="grid min-w-0 flex-1"><small className="text-[10px] font-bold text-civic-deep">긴급하거나 확실한 정보라면</small><strong className="mt-0.5 text-[16px] font-extrabold">경찰청 182 바로 전화하기</strong><em className="mt-0.5 text-[11px] text-civic-sub not-italic">망설이지 말고 바로 알려주세요.</em></span>
                <ArrowRightIcon size={16} strokeWidth={2.2} className="flex-none text-civic [transition:translate_.25s_cubic-bezier(.2,.7,.2,1)] group-hover/callout:[translate:3px_0]" />
              </a>
            </div>
          )}
          {id === "me" && (
            <div className={compact ? COMPACT_BOX : "px-7 pb-7 max-sm:px-5 max-sm:pb-5"}>
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

import { MISSING_CHILD_CENTER_URL, SAFE182_URL } from "@/lib/links";
import { ArrowRightIcon, ArrowUpRightIcon, HeartIcon, PhoneIcon, ScanFaceIcon } from "./Icons";

// 상황별 안내. 상단의 큰 선택 카드를 누르면 해당 섹션(#know, #me)으로 스크롤한다.
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
        text: "경찰청 182나 안전Dream으로 전달하세요. 상세정보 화면의 '목격 제보하기'로도 남길 수 있어요.",
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
      art: "bg-gold-soft text-gold",
      badge: "bg-gold text-white",
      text: "text-gold",
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
        title: "가까운 경찰서에 상담",
        text: "경찰서에서 실종아동 유전자(DNA) 등록과 가족 찾기 절차를 안내받을 수 있어요.",
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

export default function GuideSteps() {
  return (
    <>
      <nav aria-label="상황 선택" className="mt-8 grid gap-5 md:grid-cols-2">
        {GUIDES.map(({ id, tag, title, summary, Icon, tone }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`group flex flex-col overflow-hidden rounded-3xl border-2 border-line bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover ${tone.ring} ${focusRing}`}
          >
            <div
              aria-hidden="true"
              className={`flex h-56 items-center justify-center max-sm:h-40 ${tone.art}`}
            >
              <span className="flex h-32 w-32 items-center justify-center rounded-full bg-card shadow-card transition-transform group-hover:scale-105 max-sm:h-24 max-sm:w-24">
                <Icon size={64} strokeWidth={1.5} className="max-sm:h-12 max-sm:w-12" />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-7 max-sm:p-5">
              <span className={`text-[13px] font-bold ${tone.text}`}>{tag}</span>
              <span className="mt-1 text-[28px] font-extrabold tracking-[-0.6px] max-sm:text-[24px]">
                {title}
              </span>
              <span className="mt-2 text-[14.5px] leading-relaxed break-keep text-muted">
                {summary}
              </span>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-bold ${tone.text}`}
              >
                절차 보기
                <ArrowRightIcon
                  size={16}
                  strokeWidth={2.2}
                  className="rotate-90 transition-transform group-hover:translate-y-0.5"
                />
              </span>
            </div>
          </a>
        ))}
      </nav>

      {GUIDES.map(({ id, tag, title, summary, Icon, tone, steps, actions }) => (
        <section
          key={id}
          id={id}
          aria-labelledby={`${id}-title`}
          className="mt-20 scroll-mt-24"
        >
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone.art}`}
            >
              <Icon size={28} strokeWidth={1.8} />
            </span>
            <div>
              <p className={`text-[13px] font-bold ${tone.text}`}>{tag}</p>
              <h2
                id={`${id}-title`}
                className="text-[28px] font-extrabold tracking-[-0.6px] max-sm:text-[24px]"
              >
                {title}
              </h2>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed break-keep text-muted">{summary}</p>

          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-line bg-card p-6 shadow-card">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-extrabold ${tone.badge}`}
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-[17px] font-bold break-keep">{step.title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed break-keep text-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-6 max-sm:p-5">
            <p className="text-[14.5px] font-bold break-keep">{actions.note}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="tel:182"
                className={`flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark ${focusRing}`}
              >
                <PhoneIcon size={17} strokeWidth={2.2} />
                경찰청 182 전화하기
              </a>
              <a
                href={actions.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[14px] font-bold text-brand hover:underline"
              >
                {actions.link.label} <ArrowUpRightIcon size={14} strokeWidth={2.2} />
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

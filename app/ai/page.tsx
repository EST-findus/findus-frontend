import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  LayersIcon,
  LockIcon,
  MinusCircleIcon,
  ScanFaceIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/Icons";
import SectionHeading from "@/components/SectionHeading";
import { getMissingPersons } from "@/lib/data";

export const metadata: Metadata = {
  title: "AI 연구 안내",
  description: "실종 당시 사진으로 현재 모습을 추정하는 AI 연령 변환의 원리와 사용 원칙을 안내합니다.",
  alternates: { canonical: "/ai" },
};

/** 히어로 비주얼에 쓰는 예시 인물 */
const SAMPLE_ID = "MC-2008-0915";

const PRINCIPLES = [
  {
    icon: ShieldIcon,
    title: "참고 자료로만 써요",
    text: "AI 예상 모습은 실제 얼굴이 아니라 기억을 떠올리기 위한 단서입니다.",
  },
  {
    icon: LockIcon,
    title: "실제 사진은 학습하지 않아요",
    text: "실제 실종아동의 사진은 AI 학습 데이터로 사용하지 않습니다.",
  },
  {
    icon: UsersIcon,
    title: "확인은 공식 기관에서",
    text: "AI 결과만으로 신원을 판단하지 않고, 반드시 경찰·전문기관을 통해 확인합니다.",
  },
];

const PROCESS = [
  {
    icon: ScanFaceIcon,
    title: "원본 사진 분석",
    text: "실종 당시 사진에서 눈·코·입의 위치와 얼굴 윤곽 비율을 읽어냅니다.",
  },
  {
    icon: ClockIcon,
    title: "연령 변환",
    text: "성장기 골격 발달과 피부 변화 패턴을 반영해 현재 나이의 얼굴을 추정합니다.",
  },
  {
    icon: LayersIcon,
    title: "스타일 변형",
    text: "안경, 헤어스타일처럼 시간이 지나며 달라질 수 있는 요소를 바꿔 여러 모습을 보여줍니다.",
  },
];

const CAN = [
  "시간이 흐른 얼굴의 대략적인 변화를 보여줘요",
  "안경·헤어처럼 달라질 수 있는 모습을 비교하게 해요",
  "흐려진 기억을 다시 떠올리는 실마리가 돼요",
];

const CANNOT = [
  "현재 얼굴을 정확하게 재현하지는 못해요",
  "신원을 확인하거나 동일인을 판별하지 않아요",
  "체중, 흉터, 생활환경에 따른 변화까지 예측하지 못해요",
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function AiPage() {
  const persons = await getMissingPersons();
  const sample = persons.find((p) => p.id === SAMPLE_ID) ?? persons[0];

  return (
    <main>
      {/* 히어로 */}
      <section className="relative overflow-hidden bg-hero">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-310 items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] max-sm:px-4 max-sm:py-12">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-card px-3 py-1 text-[12.5px] font-bold text-brand">
              <SparklesIcon size={15} />
              Responsible AI
            </p>
            <h1 className="mt-5 text-[42px] leading-[1.2] font-extrabold tracking-[-1.2px] break-keep max-sm:text-[30px]">
              시간의 변화를 돕는 AI,
              <br />
              <span className="text-brand">신중하게</span> 연구합니다.
            </h1>
            <p className="mt-5 max-w-130 text-[16px] leading-relaxed break-keep text-muted max-sm:text-[15px]">
              어린 시절 사진과 시간이 흐른 지금의 모습 사이를 AI가 잇습니다. 다만 AI의 추정은
              단서일 뿐 정답이 아니기에, 분명한 원칙 안에서만 사용합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link
                href="/"
                className={`inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
              >
                실종아동 찾아보기 <ArrowRightIcon size={17} />
              </Link>
              <a
                href="#process"
                className={`inline-flex items-center rounded-xl border border-line bg-card px-5 py-3.5 text-[15px] font-bold transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
              >
                작동 방식 보기
              </a>
            </div>
          </div>

          <figure className="rounded-3xl border border-line bg-card p-6 shadow-card-hover max-sm:p-4">
            <figcaption className="mb-5 flex items-center justify-between">
              <span className="text-[11.5px] font-bold tracking-[1.5px] text-muted uppercase">
                AI age progression
              </span>
              <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[11.5px] font-bold text-gold">
                연구 단계
              </span>
            </figcaption>

            <div className="relative grid grid-cols-2 gap-4 max-sm:gap-3">
              <div>
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface">
                  <Image
                    src={sample.photos.past}
                    alt={`${sample.name} 실종 당시 사진 (예시)`}
                    fill
                    sizes="(min-width: 1024px) 240px, 45vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="mt-2.5 text-[13.5px] font-bold">실종 당시 원본</p>
                <p className="text-[12px] text-muted">
                  만 {sample.ageAtMissing}세 · {sample.missingDate.slice(0, 4)}년
                </p>
              </div>
              <div>
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface ring-2 ring-brand/30">
                  <Image
                    src={sample.photos.aged}
                    alt={`${sample.name} AI 예상 현재 모습 (예시)`}
                    fill
                    sizes="(min-width: 1024px) 240px, 45vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="mt-2.5 text-[13.5px] font-bold text-brand">AI 예상 모습</p>
                <p className="text-[12px] text-muted">추정 {sample.currentAge}세 · 현재 기준</p>
              </div>
              <span
                aria-hidden="true"
                className="absolute top-[38%] left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-card bg-brand text-white shadow-card-hover"
              >
                <SparklesIcon size={18} />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-3">
              <div className="flex -space-x-2">
                {sample.photos.styles.map((s) => (
                  <span
                    key={s.label}
                    className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-card"
                  >
                    <Image src={s.src} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-[12.5px] break-keep text-muted">
                <span className="font-bold text-ink">스타일 변형 {sample.photos.styles.length}종</span>{" "}
                · {sample.photos.styles.map((s) => s.label).join(", ")}
              </p>
            </div>
            <p className="mt-3 text-center text-[11.5px] text-subtle">
              예시 이미지입니다. AI 예상 모습은 실제와 다를 수 있습니다.
            </p>
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-310 px-6 max-sm:px-4">
        {/* 원칙 */}
        <section aria-labelledby="principles-title" className="mt-20">
          <SectionHeading
            id="principles-title"
            eyebrow="Our principles"
            title="AI를 쓰는 세 가지 원칙"
            description="기술보다 먼저, 기다리는 가족과 실종 당사자를 생각합니다."
          />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-line bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={22} />
                </span>
                <p className="mt-4 text-[16.5px] font-bold">{title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed break-keep text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 작동 방식 */}
        <section id="process" aria-labelledby="process-title" className="mt-24 scroll-mt-40">
          <div className="text-center">
            <p className="mb-2 text-[12px] font-bold tracking-[1.5px] text-brand uppercase">
              How it works
            </p>
            <h2
              id="process-title"
              className="text-[28px] font-extrabold tracking-[-0.6px] break-keep max-sm:text-[23px]"
            >
              AI 예상 모습은 이렇게 만들어져요
            </h2>
          </div>
          <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:before:absolute md:before:top-8 md:before:right-[16.6%] md:before:left-[16.6%] md:before:border-t-2 md:before:border-dashed md:before:border-brand/25">
            {PROCESS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative text-center">
                <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-card text-brand shadow-card">
                  <Icon size={26} />
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                </span>
                <p className="mt-4 text-[16.5px] font-bold">{title}</p>
                <p className="mx-auto mt-1.5 max-w-70 text-[14px] leading-relaxed break-keep text-muted">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* 할 수 있는 것 / 없는 것 */}
        <section aria-labelledby="limits-title" className="mt-24">
          <SectionHeading
            id="limits-title"
            eyebrow="Know the limits"
            title="AI가 할 수 있는 것과 없는 것"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-brand/25 bg-brand-soft/60 p-7 max-sm:p-5">
              <p className="text-[16px] font-bold text-brand">이런 건 도울 수 있어요</p>
              <ul className="mt-4 flex flex-col gap-3">
                {CAN.map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] break-keep">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <CheckIcon size={13} strokeWidth={2.6} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-7 max-sm:p-5">
              <p className="text-[16px] font-bold">이런 건 할 수 없어요</p>
              <ul className="mt-4 flex flex-col gap-3">
                {CANNOT.map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] break-keep text-muted">
                    <MinusCircleIcon size={20} className="shrink-0 text-subtle" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-20 overflow-hidden rounded-3xl bg-brand px-10 py-10 text-white max-sm:px-6 max-sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[20px] font-extrabold break-keep max-sm:text-[18px]">
                실종 당시 사진과 AI 예상 모습을 직접 비교해 보세요.
              </p>
              <p className="mt-1.5 text-[14px] break-keep text-white/75">
                스타일 탭으로 안경·헤어 등 여러 모습을 바꿔 볼 수 있어요.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3.5 text-[15px] font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              실종아동 찾아보기 <ArrowRightIcon size={17} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

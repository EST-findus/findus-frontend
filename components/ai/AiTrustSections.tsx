import { Fragment } from "react";
import Link from "next/link";
import Reveal from "@/components/funding/Reveal";
import { ArrowRightIcon, CheckIcon, CloseIcon, ImageIcon, LockIcon, SparklesIcon } from "@/components/Icons";
import { VERIFY_STATS } from "@/lib/aiDemo";
import styles from "./AiShowcase.module.css";

export function BigHeading({ id, eyebrow, children, light = false }: { id: string; eyebrow: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Reveal>
      <p className={`text-[14px] font-bold tracking-[0.12em] uppercase ${light ? "text-white/70" : "text-brand"}`}>{eyebrow}</p>
      <h2 id={id} className={`mt-3 text-[44px] leading-[1.25] font-extrabold tracking-[-0.03em] break-keep max-md:text-[36px] max-sm:text-[28px] ${light ? "text-white" : ""}`}>{children}</h2>
    </Reveal>
  );
}

const SAFETY = [
  { title: "외부 AI 서비스를 쓰지 않아요", text: "ChatGPT 같은 외부 생성형 AI에 사진을 보내지 않아요. 공개된 연구용 모델을 FindUs 서버에 직접 설치해 돌려요." },
  { title: "사진은 서버 밖으로 나가지 않아요", text: "사진을 받는 것부터 결과를 만드는 것까지 FindUs 서버 안에서만 처리해요." },
  { title: "실제 실종아동 사진은 학습하지 않아요", text: "보정 모듈 학습에는 공개 연구 데이터(AI Hub 가족 사진 데이터)만 썼어요." },
  { title: "결과에는 항상 'AI 생성' 표시", text: "캡처되어 퍼져도 실제 사진으로 오해받지 않도록 표시를 붙여요." },
];

/** 사진이 외부로 나가지 않는다는 점을 데이터 흐름 그림과 함께 보여준다. */
export function DataSafetySection() {
  return (
    <section aria-labelledby="ai-safety-title" className="relative overflow-hidden rounded-[32px] bg-[#173B70] px-12 py-14 text-white max-md:px-7 max-md:py-10 max-sm:rounded-3xl max-sm:px-5 max-sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <BigHeading id="ai-safety-title" eyebrow="Privacy" light>사진은 밖으로<br />나가지 않습니다.</BigHeading>

      <Reveal delay={150} className="mt-10 max-sm:mt-8">
        <div aria-hidden="true" className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 max-sm:gap-2">
          <FlowNode icon={<ImageIcon size={26} />} label="사진" />
          <span className="relative h-1 rounded-full bg-white/25"><span className={`absolute -top-1 h-3 w-3 rounded-full bg-[#FFD25A] ${styles.flowDot}`} /></span>
          <FlowNode icon={<LockIcon size={28} />} label="FindUs 서버" strong />
          <span className="relative h-1 rounded-full bg-white/25"><span className={`absolute -top-1 h-3 w-3 rounded-full bg-[#FFD25A] ${styles.flowDot}`} style={{ animationDelay: "1.4s" }} /></span>
          <FlowNode icon={<SparklesIcon size={26} />} label="참고 이미지" />
        </div>
        <div aria-hidden="true" className="mt-4 flex flex-col items-center">
          <span className="h-8 w-0 border-l-2 border-dashed border-white/40" />
          <span className={`flex items-center gap-2 rounded-full border-2 border-dashed border-white/40 px-4 py-2 text-[14px] font-bold text-white/85 ${styles.blocked}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"><CloseIcon size={14} strokeWidth={3} /></span>
            외부 생성형 AI 서비스 · 연결 안 함
          </span>
        </div>
        <p className="sr-only">사진은 FindUs 서버에서만 처리되어 참고 이미지가 되고, 외부 생성형 AI 서비스로는 보내지 않습니다.</p>
      </Reveal>

      <ul className="mt-10 grid gap-4 md:grid-cols-2 max-sm:mt-8">
        {SAFETY.map((item, i) => (
          <Reveal as="li" key={item.title} delay={i * 90} className="rounded-2xl bg-white/8 p-6 ring-1 ring-white/15 max-sm:p-5">
            <p className="flex items-start gap-3 text-[20px] leading-snug font-extrabold break-keep max-sm:text-[18px]">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFD25A] text-[#173B70]"><CheckIcon size={16} strokeWidth={3} /></span>
              {item.title}
            </p>
            <p className="mt-2 pl-10 text-[16px] leading-[1.7] break-keep text-white/75 max-sm:text-[15px]">{item.text}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function FlowNode({ icon, label, strong = false }: { icon: React.ReactNode; label: string; strong?: boolean }) {
  return (
    <span className="flex flex-col items-center gap-2 text-center">
      <span className={`flex items-center justify-center rounded-2xl ${strong ? "h-20 w-20 bg-white text-[#173B70] shadow-[0_0_0_8px_rgba(255,255,255,.12)] max-sm:h-16 max-sm:w-16" : "h-16 w-16 bg-white/12 ring-1 ring-white/25 max-sm:h-12 max-sm:w-12"}`}>{icon}</span>
      <span className={`text-[14px] font-bold break-keep max-sm:text-[12px] ${strong ? "text-white" : "text-white/75"}`}>{label}</span>
    </span>
  );
}

const VERIFY_FLOW = ["AI 예상 모습 생성", "원본 사진·특징과 함께 표시", "제보는 182·112로", "신원 확인은 DNA 등 공식 절차로"];

/** 결과를 어떻게 검증했는지 실제 실험 숫자로 보여준다. */
export function VerifySection() {
  return (
    <section aria-labelledby="ai-verify-title">
      <BigHeading id="ai-verify-title" eyebrow="Verification">AI 결과만으로<br />사람을 판단하지 않습니다.</BigHeading>
      <Reveal delay={100}><p className="mt-5 max-w-180 text-[18px] leading-[1.75] break-keep text-muted max-sm:text-[16px]">AI가 그린 얼굴이 정말 그 사람에 가까워졌는지, 학습에 쓰지 않은 사람들의 실제 성인 사진과 비교해 숫자로 확인했어요.</p></Reveal>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-sm:mt-8">
        {VERIFY_STATS.map((stat, i) => (
          <Reveal as="li" key={stat.label} delay={i * 100} className="flex flex-col rounded-2xl border border-line bg-card px-5 py-6 shadow-card max-sm:p-5">
            <p className="text-[38px] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-brand tabular-nums max-sm:text-[32px]">
              {stat.value.split(" → ").map((part, j) => (
                <Fragment key={part}>
                  {j > 0 && <span className="mx-[0.06em]">→</span>}
                  {part}
                </Fragment>
              ))}
            </p>
            <p className="mt-3 text-[17px] leading-snug font-bold break-keep">{stat.label}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed break-keep text-muted">{stat.note}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={200} className="mt-6 rounded-2xl border border-gold/30 bg-gold-soft p-6 max-sm:p-5">
        <p className="text-[18px] font-extrabold text-gold-ink">솔직하게 말씀드려요</p>
        <p className="mt-2 text-[16px] leading-[1.75] break-keep text-ink/80 max-sm:text-[15px]">AI 결과는 아직 <strong>어릴 때 사진 그대로보다 같은 사람 점수가 낮아요</strong> (0.26 대 0.35). 얼굴을 정확하게 재현하는 기술이 아니라, 시간이 흐른 모습을 상상하도록 돕는 참고 이미지이기 때문이에요. 그래서 FindUs는 AI 결과를 항상 원본 사진과 함께 보여줘요.</p>
      </Reveal>

      <Reveal delay={250} className="mt-10">
        <ol className="grid gap-3 md:grid-cols-4">
          {VERIFY_FLOW.map((text, i) => (
            <li key={text} className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-extrabold text-white">{i + 1}</span>
              <span className="text-[16px] leading-snug font-bold break-keep">{text}</span>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

/** 나이 변환 체험 사이트(준비 중) 소개 */
export function RoadmapSection() {
  return (
    <section aria-labelledby="ai-roadmap-title" className="grid grid-cols-1 items-center gap-8 rounded-[32px] border border-line bg-gold-faint p-10 md:grid-cols-[1fr_auto] max-md:p-7 max-sm:rounded-3xl max-sm:p-5">
      <div>
        <p className="inline-flex rounded-full bg-gold-soft px-3 py-1 text-[13px] font-bold text-gold-ink">준비 중 · 예정</p>
        <h2 id="ai-roadmap-title" className="mt-4 text-[32px] leading-snug font-extrabold tracking-tight break-keep max-sm:text-[24px]">누구나 체험하는 나이 변환,<br />의견이 모여 AI가 자랍니다.</h2>
        <p className="mt-3 max-w-160 text-[17px] leading-[1.75] break-keep text-muted max-sm:text-[15px]">본인 사진으로 나이 변환을 체험하고 ‘닮았어요 / 안 닮았어요’ 의견을 남기는 사이트를 준비하고 있어요. <strong className="text-ink">따로 동의한 경우에만</strong> 의견을 모델 개선 학습에 쓸 예정이에요.</p>
      </div>
      <Link href="/age-lab" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-[17px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        체험 사이트 미리 보기 <ArrowRightIcon size={18} />
      </Link>
    </section>
  );
}

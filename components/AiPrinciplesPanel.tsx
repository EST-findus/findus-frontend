import { CheckIcon, ClockIcon, LayersIcon, LockIcon, CloseIcon, ScanFaceIcon, ShieldIcon, UsersIcon } from "@/components/Icons";
import SectionHeading from "@/components/SectionHeading";

const PRINCIPLES = [
  { icon: ShieldIcon, title: "참고 자료로만 써요.", text: "AI 예상 모습은 실제 얼굴이 아니라 기억을 떠올리기 위한 단서입니다." },
  { icon: LockIcon, title: "실제 사진은 학습하지 않아요.", text: "실제 실종아동의 사진은 AI 학습 데이터로 사용하지 않습니다." },
  { icon: UsersIcon, title: "확인은 공식 기관에서 해요.", text: "AI 결과만으로 신원을 판단하지 않고, 반드시 경찰·전문기관을 통해 확인합니다." },
];

const PROCESS = [
  { icon: ScanFaceIcon, title: "원본 사진 분석", text: "실종 당시 사진에서 눈·코·입의 위치와 얼굴 윤곽 비율을 읽어냅니다." },
  { icon: ClockIcon, title: "연령 변환", text: "성장기 골격 발달과 피부 변화 패턴을 반영해 현재 나이의 얼굴을 추정합니다." },
  { icon: LayersIcon, title: "스타일 변형", text: "안경, 헤어스타일처럼 시간이 지나며 달라질 수 있는 요소를 바꿔 여러 모습을 보여줍니다." },
];

const CAN = [
  "시간이 흐른 얼굴의 대략적인 변화를 보여줘요.",
  "안경·헤어처럼 달라질 수 있는 모습을 비교하게 해요.",
  "흐려진 기억을 다시 떠올리는 실마리가 돼요.",
];

const CANNOT = [
  "현재 얼굴을 정확하게 재현하지는 못해요.",
  "신원을 확인하거나 동일인을 판별하지 않아요.",
  "체중, 흉터, 생활환경에 따른 변화까지 예측하지 못해요.",
];

export default function AiPrinciplesPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-3xl bg-gold-faint ${compact ? "p-6 max-md:p-5 max-sm:p-4" : "p-10 max-lg:p-8 max-sm:p-5"}`}>
      <section aria-labelledby="principles-title">
        <SectionHeading id="principles-title" align="center" eyebrow="AI 사용 원칙" title="AI를 쓰는 세 가지 원칙" description="기술보다 먼저, 기다리는 가족과 실종 당사자를 생각합니다." />
        <ul className="mt-10 grid gap-5 md:grid-cols-3 max-sm:mt-8">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-card p-7 text-center shadow-card transition-shadow hover:shadow-card-hover motion-reduce:transition-none max-sm:p-5">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={24} /></span>
              <p className="mt-5 text-[18px] font-bold">{title}</p>
              <p className="mt-2 text-[15px] leading-[1.65] break-keep text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process-title" className="mt-16 scroll-mt-28 max-sm:mt-12">
        <SectionHeading id="process-title" align="center" eyebrow="작동 방식" title="AI 예상 모습은 이렇게 만들어져요" />
        <ol className="relative mt-8 grid gap-8 rounded-2xl border border-line bg-card p-6 shadow-card md:grid-cols-3 md:before:absolute md:before:top-14 md:before:right-[16.6%] md:before:left-[16.6%] md:before:border-t-2 md:before:border-dashed md:before:border-brand/25 max-sm:p-4">
          {PROCESS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative text-center">
              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-card text-brand shadow-card"><Icon size={26} /><span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-white">{i + 1}</span></span>
              <p className="mt-5 text-[18px] font-bold">{title}</p>
              <p className="mx-auto mt-2 max-w-72 text-[15px] leading-[1.65] break-keep text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="limits-title" className="mt-16 max-sm:mt-12">
        <SectionHeading id="limits-title" align="center" eyebrow="AI의 가능성과 한계" title="AI가 할 수 있는 것과 없는 것" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-brand/25 bg-brand-soft/60 p-6 shadow-card max-sm:p-5">
            <p className="text-center text-[18px] font-bold text-brand">이런 건 도울 수 있어요.</p>
            <ul className="mt-4 flex flex-col gap-3">{CAN.map((text) => <li key={text} className="flex gap-3 text-[14px] break-keep"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white"><CheckIcon size={13} strokeWidth={2.6} /></span>{text}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 shadow-card max-sm:p-5">
            <p className="text-center text-[18px] font-bold">이런 건 할 수 없어요.</p>
            <ul className="mt-4 flex flex-col gap-3">{CANNOT.map((text) => <li key={text} className="flex gap-3 text-[14px] break-keep text-muted"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-ink"><CloseIcon size={13} strokeWidth={2.6} /></span>{text}</li>)}</ul>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ImageIcon, LockIcon, SparklesIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "AI 나이 변환 체험 (준비 중)",
  description: "본인 사진으로 AI 나이 변환을 체험하고 의견을 남기는 서비스를 준비하고 있습니다.",
  robots: { index: false, follow: false },
};

// 목업 화면. 실제 업로드·변환·의견 저장은 구현하지 않는다.
const SAMPLE = { past: "/images/mock-persons/MC-2001-0812/past.jpg", aged: "/images/mock-persons/MC-2001-0812/aged.jpg" };
const AGES = [20, 30, 40, 50];
const FLOW = [
  { title: "사진 올리기", text: "정면 얼굴 사진 한 장을 골라요." },
  { title: "나이 고르기", text: "보고 싶은 나이를 골라 결과를 받아요." },
  { title: "의견 남기기", text: "가족·지인과 비교해 '닮았어요 / 안 닮았어요'를 남겨요." },
  { title: "동의한 경우만 학습", text: "학습 활용에 따로 동의한 의견만 모델 개선에 써요." },
];
const PROMISES = [
  "학습 활용 동의는 체험과 별개로, 따로 선택해요. 동의하지 않아도 체험할 수 있어요.",
  "동의하지 않으면 사진과 결과는 화면에 보여준 뒤 바로 지워요.",
  "실종아동 정보와 섞지 않고, 실제 실종아동 사진은 학습에 쓰지 않아요.",
  "만 14세 미만은 이용할 수 없어요.",
];
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function AgeLabPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <div role="note" className="border-b border-gold/30 bg-gold-soft">
        <p className="page-container max-w-5xl py-2.5 text-center text-[13px] font-bold text-gold-ink">미리 보기 화면이에요. 아직 실제로 동작하지 않으며, 사진을 받지 않아요.</p>
      </div>

      <section aria-labelledby="lab-title" className="page-container grid max-w-5xl items-center gap-10 pt-12 md:grid-cols-[1.1fr_1fr] max-sm:gap-8 max-sm:pt-8">
        <div>
          <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-[13px] font-bold text-brand">FindUs AI 나이 변환 체험 · 준비 중</p>
          <h1 id="lab-title" className="mt-4 text-[46px] leading-[1.2] font-extrabold tracking-[-0.035em] break-keep max-lg:text-[38px] max-sm:text-[30px]">몇 년 뒤의 나는<br /><span className="text-brand">어떤 얼굴일까요?</span></h1>
          <p className="mt-5 text-[18px] leading-[1.75] break-keep text-muted max-sm:text-[16px]">실종아동 찾기에 쓰는 것과 같은 나이 변환 AI를 직접 체험해 보세요. 남겨 주신 의견은 AI가 더 그 사람다운 얼굴을 그리도록 돕습니다.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ src: SAMPLE.past, label: "올린 사진" }, { src: SAMPLE.aged, label: "AI 30세 예상" }].map((item, i) => (
            <figure key={item.label}>
              <div className={`relative aspect-3/4 overflow-hidden rounded-2xl bg-surface ${i === 1 ? "ring-2 ring-brand/40" : ""}`}>
                <Image quality={90} src={item.src} alt="" fill sizes="(min-width: 768px) 220px, 45vw" className="object-cover" />
                {i === 1 && <span className="absolute top-2 right-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-extrabold text-brand">AI 생성</span>}
              </div>
              <figcaption className="mt-2 text-center text-[13px] font-bold">{item.label}</figcaption>
            </figure>
          ))}
          <p className="col-span-2 text-center text-[12px] text-muted">가상 인물 예시 이미지</p>
        </div>
      </section>

      <section aria-labelledby="lab-try-title" className="page-container mt-16 max-w-5xl max-sm:mt-12">
        <h2 id="lab-try-title" className="text-[30px] font-extrabold tracking-tight max-sm:text-[24px]">체험 화면 미리 보기</h2>
        <div className="mt-6 grid gap-5 rounded-3xl border border-line bg-card p-8 shadow-card md:grid-cols-2 max-sm:p-5">
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-surface p-6 text-center text-muted">
            <ImageIcon size={36} />
            <p className="text-[17px] font-bold text-ink">정면 얼굴 사진을 올려 주세요</p>
            <p className="text-[13px]">JPG·PNG · 얼굴이 잘 보이는 사진</p>
            <button type="button" disabled className="mt-2 rounded-xl bg-brand/40 px-5 py-2.5 text-[15px] font-bold text-white">사진 고르기 (준비 중)</button>
          </div>
          <div>
            <p className="text-[17px] font-bold">보고 싶은 나이</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AGES.map((age) => <button key={age} type="button" disabled className="rounded-full border border-line px-5 py-2 text-[15px] font-bold text-muted">{age}세</button>)}
            </div>
            <p className="mt-7 text-[17px] font-bold">결과가 닮았나요?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled className="rounded-xl border border-line py-3 text-[15px] font-bold text-muted">닮았어요</button>
              <button type="button" disabled className="rounded-xl border border-line py-3 text-[15px] font-bold text-muted">안 닮았어요</button>
            </div>
            <label className="mt-6 flex items-start gap-2.5 text-[14px] leading-relaxed break-keep text-muted">
              <input type="checkbox" disabled className="mt-1 h-4 w-4" />
              <span>(선택) 사진과 의견을 AI 개선 학습에 쓰는 데 동의해요. 동의하지 않아도 체험할 수 있어요.</span>
            </label>
          </div>
        </div>
      </section>

      <section aria-labelledby="lab-flow-title" className="page-container mt-16 max-w-5xl max-sm:mt-12">
        <h2 id="lab-flow-title" className="text-[30px] font-extrabold tracking-tight max-sm:text-[24px]">의견이 모여 AI가 자라는 방법</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-4">
          {FLOW.map((item, i) => (
            <li key={item.title} className="rounded-2xl bg-surface p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[15px] font-extrabold text-white">{i + 1}</span>
              <p className="mt-3 text-[18px] font-extrabold">{item.title}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed break-keep text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-2 text-[14px] leading-relaxed break-keep text-muted"><SparklesIcon size={16} className="mt-0.5 shrink-0 text-brand" />의견은 사람의 평가를 반영해 모델을 조금씩 고치는 미세조정(fine-tuning)에 쓸 예정이에요.</p>
      </section>

      <section aria-labelledby="lab-promise-title" className="page-container mt-16 max-w-5xl max-sm:mt-12">
        <div className="rounded-3xl bg-[#173B70] p-10 text-white max-sm:p-6">
          <h2 id="lab-promise-title" className="flex items-center gap-3 text-[28px] font-extrabold tracking-tight max-sm:text-[22px]"><LockIcon size={26} />개인정보 약속</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {PROMISES.map((text) => (
              <li key={text} className="flex items-start gap-3 rounded-2xl bg-white/8 p-5 text-[16px] leading-relaxed break-keep ring-1 ring-white/15">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDE8E6] text-[#B4473F]"><CheckIcon size={14} strokeWidth={3} /></span>{text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="page-container mt-12 max-w-5xl">
        <Link href="/help?tab=ai" className={`inline-flex items-center gap-1.5 text-[15px] font-bold text-brand hover:underline ${FOCUS}`}>AI 연구 안내로 돌아가기 <ArrowRightIcon size={16} /></Link>
      </div>
    </main>
  );
}

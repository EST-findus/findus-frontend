import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import AiPrinciplesPanel from "@/components/AiPrinciplesPanel";
import Reveal from "@/components/funding/Reveal";
import AgeCompareSlider from "@/components/ai/AgeCompareSlider";
import AiPipelineDemo from "@/components/ai/AiPipelineDemo";
import { BigHeading, DataSafetySection, RoadmapSection, VerifySection } from "@/components/ai/AiTrustSections";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 이용 안내의 AI 연구 안내 탭. 기술 설명은 docs/[09] AI최종모델.md 기준이다. */
export default function AiContent() {
  return (
    <div className="page-container max-w-5xl">
      <section aria-labelledby="ai-hero-title" className="grid grid-cols-1 items-center gap-10 pt-10 pb-6 md:grid-cols-[1.15fr_1fr] max-sm:gap-8 max-sm:pt-7">
        <div>
          <Reveal><p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-[13px] font-bold text-brand">책임 있는 AI 연구</p></Reveal>
          <Reveal delay={100}>
            <h2 id="ai-hero-title" className="mt-4 text-[48px] leading-[1.2] font-extrabold tracking-[-0.035em] break-keep max-lg:text-[40px] max-sm:text-[31px]">
              AI는 얼굴을<br />복원하지 않습니다.<br /><span className="text-brand">기억을 돕는 단서를</span><br /><span className="text-brand">그립니다.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 text-[18px] leading-[1.75] break-keep text-muted max-sm:text-[16px]">실종 당시 사진을 바탕으로 시간이 흐른 모습을 AI가 새로 그려요. 실제 얼굴을 정확히 재현하는 것이 아니라, 기억을 떠올리게 돕는 참고 이미지예요.</p>
          </Reveal>
          <Reveal delay={300} className="mt-7 flex flex-wrap gap-2.5">
            <a href="#ai-process-title" className={`inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}>작동 과정 보기 <ArrowRightIcon size={17} /></a>
            <a href="#ai-safety-title" className={`inline-flex h-13 items-center rounded-xl border border-line bg-card px-6 text-[16px] font-bold transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}>개인정보 보호</a>
          </Reveal>
        </div>
        <Reveal delay={200}><AgeCompareSlider /></Reveal>
      </section>

      <section aria-labelledby="ai-process-title" className="mt-24 scroll-mt-28 max-sm:mt-16">
        <BigHeading id="ai-process-title" eyebrow="How it works">사진 한 장이<br />AI 예상 모습이 되기까지</BigHeading>
        <div className="mt-10 max-sm:mt-8"><AiPipelineDemo /></div>
      </section>

      <div className="mt-24 max-sm:mt-16"><DataSafetySection /></div>
      <div className="mt-24 max-sm:mt-16"><VerifySection /></div>
      <div className="mt-24 max-sm:mt-16"><AiPrinciplesPanel showProcess={false} /></div>
      <div className="mt-16 max-sm:mt-12"><RoadmapSection /></div>

      <section className="relative mt-16 overflow-hidden rounded-3xl bg-brand px-12 py-12 text-white max-md:px-8 max-sm:mt-12 max-sm:px-6 max-sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[24px] leading-snug font-extrabold tracking-[-0.01em] break-keep max-sm:text-[19px]">실종 당시 사진과 AI 예상 모습을 직접 비교해 보세요.</p>
            <p className="mt-2 text-[15px] break-keep text-white/75">스타일 탭으로 머리 모양 등 여러 모습을 바꿔 볼 수 있어요.</p>
          </div>
          <Link href="/search" className="inline-flex h-13 items-center gap-2 rounded-xl bg-card px-6 text-[16px] font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            실종아동 찾아보기 <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}

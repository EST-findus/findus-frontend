import type { Metadata } from "next";
import GuideSteps from "@/components/GuideSteps";
import { ArrowUpRightIcon, PlusIcon } from "@/components/Icons";
import SectionHeading from "@/components/SectionHeading";
import { MISSING_CHILD_CENTER_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "제보·상담 안내",
  description: "실종아동을 알아봤거나, 내가 실종아동일지 모른다면 따라야 할 공식 절차를 안내합니다.",
  alternates: { canonical: "/guide" },
};

const FAMILY_STEPS = [
  { title: "원본 정보 확인", text: "실종 당시 이름, 사진과 기록을 확인해요." },
  { title: "정보 공유", text: "공식 등록된 정보를 바탕으로 사진과 특징을 함께 알려요." },
  { title: "공식 기관과 연결", text: "실종아동전문기관과 경찰을 통해 상담과 지원을 받아요." },
];

const FAQ = [
  {
    q: "FindUs에서 직접 실종 신고를 할 수 있나요?",
    a: "FindUs는 실종아동 정보를 찾아보고 제보 방법을 안내하는 서비스입니다. 상세정보 화면에서 목격 제보를 남길 수 있지만, 실종 신고나 긴급한 제보는 112·182로 해 주세요.",
  },
  {
    q: "AI 예상 얼굴은 실제 현재 모습인가요?",
    a: "아닙니다. 실종 당시 사진을 바탕으로 나이 변화를 추정한 참고 이미지입니다. 실제 모습과 다를 수 있으니 특징과 함께 비교해 주세요.",
  },
  {
    q: "검색 결과가 없으면 어떻게 하나요?",
    a: "검색어나 조건을 줄이거나 초기화해서 다시 찾아보세요. 경찰청 안전Dream에서도 공식 실종 정보를 확인할 수 있습니다.",
  },
  {
    q: "내 얼굴 사진을 올려서 가족을 찾을 수 있나요?",
    a: "현재는 지원하지 않습니다. 가족을 찾고 싶다면 가까운 경찰서에서 유전자(DNA) 등록 등 공식 절차를 안내받아 주세요.",
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-310 px-6 pt-14 max-sm:px-4 max-sm:pt-10">
      <section>
        <SectionHeading
          as="h1"
          eyebrow="The next step"
          title="기억이 떠올랐다면, 다음은 이렇게."
          description="상황에 맞는 공식 절차를 차근차근 안내해 드려요."
        />
        <GuideSteps />
      </section>

      <section
        id="families"
        aria-labelledby="families-title"
        className="mt-20 grid scroll-mt-40 gap-8 rounded-3xl bg-hero p-10 md:grid-cols-2 max-sm:p-6"
      >
        <div>
          <SectionHeading
            id="families-title"
            eyebrow="For families"
            title={
              <>
                기다리는 가족 곁에서,
                <br />
                찾는 여정이 이어지도록.
              </>
            }
            description="공개 정보를 확인하고, 필요한 사람에게 전달하세요. 정보 수정과 상담은 공식 기관의 안내를 따라 주세요."
          />
          <a
            href={MISSING_CHILD_CENTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-brand bg-card px-4 py-2.5 text-[14px] font-bold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            실종아동전문기관 안내 <ArrowUpRightIcon size={15} strokeWidth={2.2} />
          </a>
        </div>
        <ol className="flex flex-col justify-center gap-5">
          {FAMILY_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="text-[18px] font-extrabold text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[15.5px] font-bold">{step.title}</p>
                <p className="mt-0.5 text-[13.5px] break-keep text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="mt-20 scroll-mt-40">
        <SectionHeading id="faq-title" eyebrow="Help & answers" title="자주 묻는 질문" />
        <div className="mt-6 border-t border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15.5px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted transition group-open:rotate-45 group-open:bg-brand-soft group-open:text-brand motion-reduce:transition-none">
                  <PlusIcon size={16} strokeWidth={2.2} />
                </span>
              </summary>
              <p className="pb-5 text-[14px] leading-relaxed break-keep text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

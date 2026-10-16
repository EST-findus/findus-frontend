import GuideSteps from "@/components/GuideSteps";
import { PlusIcon } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";



const FAQ = [
  {
    q: "FindUs에서 직접 실종 신고를 할 수 있나요?",
    a: "FindUs는 실종아동 정보를 찾아보고 제보 방법을 안내하는 서비스입니다. 사이트에서 직접 신고나 제보를 받지는 않으니, 실종 신고와 목격 제보는 112·182 또는 안전Dream으로 해 주세요.",
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
    q: "부모와 자녀가 함께 DNA 검사를 받아야 하나요?",
    a: "같은 날 검체를 채취할 필요는 없습니다. 서로 다른 시점에 확보된 정보도 대조할 수 있어요. 자녀를 찾는 부모님은 자녀가 발견되기 전에도 채취 절차를 문의할 수 있습니다. 먼저 182에 대상 여부와 방문 방법을 확인해 주세요.",
  },
  {
    q: "실종 예방 사전등록과 DNA 검사는 다른가요?",
    a: "네. 사전등록은 지문·사진·보호자 정보 등을 미리 등록하는 제도이고, 실종아동 관련 DNA 검사는 유전자정보를 분석·대조하는 별도 절차입니다. 사전등록만으로 DNA 등록이 되는 것은 아닙니다.",
  },
  {
    q: "DNA를 등록하면 바로 가족을 찾을 수 있나요?",
    a: "DNA 등록만으로 가족 확인이 보장되지는 않습니다. 대조할 상대 정보가 없거나 추가 신원 확인이 필요할 수 있어요. 결과와 이후 절차는 담당 기관의 안내를 따라 주세요.",
  },
  {
    q: "내 얼굴 사진을 올려서 가족을 찾을 수 있나요?",
    a: "현재는 지원하지 않습니다. 가족을 찾고 싶다면 먼저 182에 유전자(DNA) 검사 대상 여부와 방문 절차를 문의해 주세요.",
  },
];

export default function GuideContent({ embedded = false }: { embedded?: boolean }) {
  return (
    <>
      <PageHero
        embedded={embedded}
        overlap
        eyebrow="제보·상담 안내"
        title="기억이 떠올랐다면, 다음은 이렇게."
        description="목격한 사람인지, 혹시 내가 실종아동인지에 따라 공식 절차가 달라요. 상황을 고르면 차근차근 안내해 드려요."
      />

      <div className={embedded ? "flow-root pb-4" : "flow-root bg-hero pb-8"}>
        <div className={`page-container ${embedded ? "max-w-5xl" : ""}`}>
          <GuideSteps overlap={!embedded} />
        </div>
      </div>

      <div className={`page-container ${embedded ? "max-w-5xl" : ""}`}>
      <section id="faq" aria-labelledby="faq-title" className={`${embedded ? "mt-10 max-sm:mt-8" : "mt-24 max-sm:mt-16"} scroll-mt-28`}>
        <SectionHeading id="faq-title" eyebrow="Help & answers" title="자주 묻는 질문" />
        <div className="mt-8 border-t border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5.5 text-[16px] font-bold break-keep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted transition group-open:rotate-45 group-open:bg-brand-soft group-open:text-brand motion-reduce:transition-none">
                  <PlusIcon size={16} strokeWidth={2.2} />
                </span>
              </summary>
              <p className="max-w-200 pr-12 pb-6 text-[15px] leading-[1.7] break-keep text-muted max-sm:pr-0">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}

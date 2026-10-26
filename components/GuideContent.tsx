import GuideSteps from "@/components/GuideSteps";
import { PlusIcon } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import info from "@/components/InfoPages.module.css";
import type { CSSProperties } from "react";

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
  const intro = {
    eyebrow: "FindUs 이용 안내",
    title: "실종아동 제보·가족 찾기 안내",
    description: "목격 단서를 어디에 제보하는지, 본인이나 가족을 찾을 때 어떻게 상담하는지 안내합니다. 제보와 상담은 경찰청 182 또는 안전Dream에서 진행해 주세요.",
  };
  return (
    <>
      {embedded ? (
        // 이용 안내 탭 안에서는 페이지 히어로가 이미 있으니 작은 머리말만 둔다.
        <div className={`page-container max-w-5xl pt-7 pb-5 max-sm:pt-5 ${info.rise}`}>
          <p className={info.kicker}>{intro.eyebrow}</p>
          <h2 className={info.sectionTitle}>{intro.title}</h2>
          <p className={`${info.sectionText} max-w-180`}>{intro.description}</p>
        </div>
      ) : (
        <PageHero overlap eyebrow={intro.eyebrow} title={intro.title} description={intro.description} />
      )}

      <div className={embedded ? `flow-root pb-4 ${info.rise}` : "flow-root bg-hero pb-8"} style={embedded ? ({ "--d": ".1s" } as CSSProperties) : undefined}>
        <div className={`page-container ${embedded ? "max-w-5xl" : ""}`}>
          <GuideSteps overlap={!embedded} compact={embedded} />
        </div>
      </div>

      <div className={`page-container ${embedded ? "max-w-5xl" : ""}`}>
      <section id="faq" aria-labelledby="faq-title" className={`${embedded ? "mt-10 max-sm:mt-8" : "mt-24 max-sm:mt-16"} scroll-mt-28 ${info.faq}`}>
        <div className={info.faqHead}>
          <p className={info.kicker}>HELP & ANSWERS</p>
          <h2 id="faq-title" className={info.sectionTitle}>자주 묻는 질문</h2>
          <p className={info.sectionText}>궁금한 내용을 누르면 답변이 펼쳐집니다. 더 필요한 내용은 공식 기관·정보 탭의 문의로 알려 주세요.</p>
        </div>
        <div className={info.faqList}>
          {FAQ.map((item) => (
            <details key={item.q} className={info.faqItem}>
              <summary>
                <span><span aria-hidden="true" className={info.faqQ}>Q</span>{item.q}</span>
                <span aria-hidden="true" className={info.faqToggle}><PlusIcon size={15} strokeWidth={2.4} /></span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}

/* 정보 마당·이용 안내·마이페이지가 함께 쓰는 클래스 묶음.
   홈과 /search처럼 차분한 남색 글씨, 공공 블루 하나, 연한 면. 등장 애니메이션은 backwards로만 채워 hover transform과 겹치지 않는다. */

/** 아래에서 떠오르며 나타난다. 요소의 `--d`로 지연을 준다. */
export const rise = "animate-info-rise motion-reduce:animate-none!";

/** 탭 안의 공통 머리말: 코랄 점이 붙은 작은 영문 라벨, 제목, 설명 */
export const kicker =
  "inline-flex items-center gap-2 text-[12px] font-bold tracking-[.02em] text-civic before:size-1.5 before:rounded-full before:bg-coral before:content-['']";
export const sectionTitle =
  "mt-2 text-[24px] leading-[1.35] font-extrabold tracking-[-.6px] break-keep text-navy max-sm:text-[20px]";
export const sectionText = "mt-1.5 text-[14px] leading-[1.7] break-keep text-civic-muted";

/** 둥근 버튼 묶음 탭. 흰 표시(tabIndicator)가 `--tab-index`번째 탭으로 미끄러지듯 옮겨 간다. */
export const tabs =
  "relative grid auto-cols-[minmax(0,1fr)] grid-flow-col rounded-[14px] border border-[#E7ECF2] bg-[#F4F7FB] p-[5px]";
export const tabIndicator =
  "absolute top-[5px] bottom-[5px] left-[5px] w-[calc((100%_-_10px)/var(--tab-count))] rounded-[10px] bg-white shadow-[0_2px_8px_rgba(23,59,112,.08),0_0_0_1px_rgba(23,59,112,.04)] [transform:translateX(calc(var(--tab-index)*100%))] [transition:transform_.4s_cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none";
/** 글자 크기는 쓰는 곳에서 정한다. */
export const tab =
  "relative z-1 min-h-11 cursor-pointer rounded-[10px] px-2.5 font-bold whitespace-nowrap text-civic-muted [transition:color_.2s_ease] hover:not-aria-selected:text-civic aria-selected:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic max-sm:min-h-10 max-sm:px-1";

/** 분류 칩. 누른 칩(aria-pressed)은 공공 블루로 채운다. */
export const chip =
  "min-h-9 cursor-pointer rounded-full border border-[#DCE5F0] bg-white px-[15px] text-[13.5px] font-[650] text-civic-body [transition:background-color_.2s_ease,border-color_.2s_ease,color_.2s_ease,transform_.2s_ease] hover:not-aria-pressed:border-[#B9CDE6] hover:not-aria-pressed:text-civic active:[transform:scale(.97)] aria-pressed:border-civic aria-pressed:bg-civic aria-pressed:text-white max-sm:min-h-[34px] max-sm:px-[13px] max-sm:text-[13px] motion-reduce:transition-none";

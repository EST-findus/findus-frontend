// 펀딩(F01~F06) 화면에서 여러 파일이 함께 쓰는 Tailwind 클래스 묶음.
// 색은 official palette 토큰을 쓰고, 이야기 구역만 책자의 종이·갈색 톤(--story-*)을 쓴다.

/** 펀딩 페이지 바탕. 이야기 구역이 쓰는 책자 톤 변수를 여기서 정한다. */
export const FUNDING_TOKENS = "[--story-paper:#F3F1EC] [--story-sand:#E8E0D5] [--story-brown:#8A5A44] [--story-ink:#25303B]";
export const FUNDING_PAGE = `${FUNDING_TOKENS} bg-page`;

export const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand";

/** 높이(min-h)는 쓰는 곳에서 정한다. 보통은 primaryButton을 쓴다. */
export const PRIMARY_BUTTON_BASE = `inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-[22px] text-[15px] font-extrabold text-white [transition:background-color_.2s,transform_.2s] hover:bg-navy active:[transform:scale(.98)] disabled:cursor-not-allowed disabled:bg-[#B8C4D3] aria-disabled:cursor-not-allowed aria-disabled:bg-[#B8C4D3] ${FOCUS_RING}`;
export const primaryButton = `${PRIMARY_BUTTON_BASE} min-h-12`;
export const secondaryButton = `relative inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-[18px] text-[14px] font-bold text-ink [transition:border-color_.2s,color_.2s] hover:border-brand hover:text-brand ${FOCUS_RING}`;

export const eyebrow = "text-[12px] font-extrabold tracking-[.14em] text-coral-ink";

export type StatusTone = "live" | "soon" | "done" | "fail";
const STATUS_TONE: Record<StatusTone, string> = {
  live: "bg-coral-soft text-coral-ink before:mr-1.5 before:mb-px before:inline-block before:size-[7px] before:rounded-full before:bg-coral before:content-[''] motion-safe:before:animate-funding-live",
  soon: "bg-brand-soft text-brand",
  done: "bg-[#E5F6EC] text-[#1D6B43]",
  fail: "bg-[#EEF1F5] text-muted",
};
export const statusBadge = (tone: StatusTone) => `self-start rounded-full px-[11px] py-[5px] text-[12px] font-extrabold ${STATUS_TONE[tone]}`;

const REFUND_BAND = "flex items-center justify-center gap-1.5 px-4 py-[9px] text-center text-[13px] break-keep [&_svg]:shrink-0";
/** 상세 페이지의 남색 환불 띠 */
export const refundBand = `${REFUND_BAND} bg-navy text-[#E3EEFB] [&_strong]:text-white [&_svg]:text-[#9DC6F7]`;
/** 목록 페이지의 연한 환불 띠 */
export const refundBandLight = `${REFUND_BAND} border-b border-[#E1EAF5] bg-[#F4F8FD] text-[#3D5877] [&_strong]:text-navy [&_svg]:text-[#3978B8]`;

export const footNote = "pt-2 pb-12 text-[12px] text-subtle max-lg:pb-24 max-md:pb-[88px] [&_a]:underline [&_a]:underline-offset-[3px]";

/** 리워드 카드. 링크일 때만 hover로 떠오른다. */
export const reward = `block rounded-2xl border border-line bg-white p-[18px] [transition:border-color_.2s,box-shadow_.25s,transform_.25s] data-[disabled=true]:bg-[#F7F9FC] ${FOCUS_RING}`;
export const rewardLink = `${reward} hover:border-brand hover:shadow-(--shadow-card-hover) hover:[transform:translateY(-2px)]`;
export const rewardPrice = "text-[20px] font-extrabold text-navy";
export const rewardTitle = "mt-0.5 flex items-center gap-1.5 text-[15px] font-bold";
export const rewardMetaText = "mt-2 text-[13px] leading-[1.6] text-muted";

/** 이야기 구역 본문 폭. page-container와 함께 쓴다. */
export const storyInner = "max-w-[64rem]";

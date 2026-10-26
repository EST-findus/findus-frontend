// 헤더 오른쪽의 네모난 아이콘 버튼(제보 전화, 계정 메뉴)

const BOXED_ACTION =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border p-0 text-[13px] leading-none font-bold whitespace-nowrap text-brand [transition:background-color_.18s,border-color_.18s] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3978B8] [&>svg]:shrink-0";

/** 평소 상태 */
export const HEADER_ICON_ACTION = `${BOXED_ACTION} border-[#3978B826] bg-brand-soft hover:border-[#3978B84D] hover:bg-[#DFEEFF]`;

/** 메뉴가 열려 있는 상태 */
export const HEADER_ICON_ACTION_OPEN = `${BOXED_ACTION} border-[#3978B866] bg-[#DFEEFF] hover:border-[#3978B84D]`;

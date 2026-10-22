export const SAFE182_URL = "https://www.safe182.go.kr";
export const MISSING_CHILD_CENTER_URL = "https://www.missingchild.or.kr";

/** 헤더 전화 팝업·서비스 정보에서 함께 쓰는 공식 신고·상담 전화. 첫 번째는 긴급 신고. */
export const OFFICIAL_CALLS = [
  { tel: "112", number: "112", label: "긴급 신고", description: "지금 눈앞에 있거나 위험한 상황이라면 바로 신고해 주세요." },
  { tel: "182", number: "182", label: "실종아동 제보·상담", description: "경찰청 실종아동찾기센터. 목격 제보와 장기 실종 상담" },
  { tel: "027770182", number: "02-777-0182", label: "실종아동전문기관", description: "아동권리보장원. 가족 찾기와 실종 가족 지원 상담" },
] as const;

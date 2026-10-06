import type { MissingPerson } from "./types";

type Ages = Pick<MissingPerson, "ageAtMissing" | "currentAge">;

export const formatAgeRow = (p: Ages) => `만 ${p.ageAtMissing}세 | 현재 만 ${p.currentAge}세`;

export const formatPastLabel = (p: Pick<MissingPerson, "ageAtMissing">) =>
  `만 ${p.ageAtMissing}세 실종 당시`;

/** "2001-05-20" → "2001년 05월 20일" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}년 ${m}월 ${d}일`;
}

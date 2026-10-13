import type { Gender } from "./types";

/** "2001-05-20" → "2001. 05. 20." */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}. ${m}. ${d}.`;
}

export const formatGender = (g: Gender) => (g === "남" ? "남자" : "여자");

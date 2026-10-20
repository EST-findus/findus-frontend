import type { Gender } from "./types";

/** "2001-05-20" → "2001. 05. 20." */
export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "정보 없음";
  const [y, m, d] = iso.split("-");
  return `${y}. ${m}. ${d}.`;
}

export const formatGender = (g: Gender) => (g === "남" ? "남자" : g === "여" ? "여자" : "정보 없음");

export const formatAge = (age: number | null) => age === null ? "정보 없음" : `${age}세`;

/** 백엔드 lastSeenAt은 UTC LocalDateTime이며 목격 시각이 아닌 동기화 시각이다. */
export function formatSyncTime(value?:string):string {
  if(!value) return '정보 없음';
  const date=new Date(value+'Z');
  return Number.isNaN(date.getTime()) ? '정보 없음' : new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'short',timeStyle:'short'}).format(date)+' (한국 시간)';
}

import type { FilterKey, MissingPerson, SortKey } from "./types";

export const LONG_TERM_YEARS = 10;

const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();

const pad = (n: number) => String(n).padStart(2, "0");

/** 로컬 날짜 기준 "YYYY-MM-DD" */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function matchesQuery(person: MissingPerson, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    person.name,
    person.missingLocation,
    person.features,
    `만 ${person.ageAtMissing}세`,
    `현재 만 ${person.currentAge}세`,
  ]
    .map(normalize)
    .join("|");
  return haystack.includes(q);
}

/** 실종일로부터 LONG_TERM_YEARS년 이상 지났는지 (today 기준) */
export function isLongTerm(person: MissingPerson, today: Date): boolean {
  const threshold = toIsoDate(
    new Date(today.getFullYear() - LONG_TERM_YEARS, today.getMonth(), today.getDate()),
  );
  return person.missingDate <= threshold;
}

export function matchesFilter(person: MissingPerson, filter: FilterKey, today: Date): boolean {
  switch (filter) {
    case "all":
      return true;
    case "longterm":
      return isLongTerm(person, today);
    default:
      return person.category === filter;
  }
}

export function sortPersons(persons: MissingPerson[], sort: SortKey): MissingPerson[] {
  const sorted = [...persons];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => b.missingDate.localeCompare(a.missingDate));
    case "longterm":
      return sorted.sort((a, b) => a.missingDate.localeCompare(b.missingDate));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }
}

export interface FilterOptions {
  query: string;
  filter: FilterKey;
  sort: SortKey;
  /** 장기실종 판정 기준일 (기본: 오늘) */
  today?: Date;
}

/** 검색 AND 칩 필터 → 정렬 */
export function filterPersons(
  persons: MissingPerson[],
  { query, filter, sort, today = new Date() }: FilterOptions,
): MissingPerson[] {
  const matched = persons.filter(
    (p) => matchesQuery(p, query) && matchesFilter(p, filter, today),
  );
  return sortPersons(matched, sort);
}

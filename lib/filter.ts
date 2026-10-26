import type { AgeGroupKey, MissingPerson, PeriodKey, SearchFilters, SortKey } from "./types";

export const DEFAULT_FILTERS: SearchFilters = {
  gender: "all",
  region: "all",
  period: "all",
  ageGroup: "all",
};

/** [이상, 미만) 실종 연도 */
const PERIOD_RANGES: Record<Exclude<PeriodKey, "all">, [number, number]> = {
  before2000: [0, 2000],
  "2000s": [2000, 2010],
  "2010s": [2010, 2020],
  after2020: [2020, Infinity],
};

/** [이상, 이하] 실종 당시 만 나이 */
const AGE_RANGES: Record<Exclude<AgeGroupKey, "all">, [number, number]> = {
  "0-3": [0, 3],
  "4-6": [4, 6],
  "7-9": [7, 9],
  "10+": [10, Infinity],
};

const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();

export function matchesQuery(person: MissingPerson, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [person.name, person.missingLocation, person.features, `${person.ageAtMissing}세`]
    .map(normalize)
    .join("|");
  return haystack.includes(q);
}

export function matchesFilters(person: MissingPerson, filters: SearchFilters): boolean {
  if (filters.gender !== "all" && person.gender !== filters.gender) return false;
  if (filters.region !== "all" && person.region !== filters.region) return false;
  if (filters.period !== "all") {
    const year = Number(person.missingDate.slice(0, 4));
    const [from, to] = PERIOD_RANGES[filters.period];
    if (!person.missingDate || year < from || year >= to) return false;
  }
  if (filters.ageGroup !== "all") {
    const [min, max] = AGE_RANGES[filters.ageGroup];
    if (person.ageAtMissing === null || person.ageAtMissing < min || person.ageAtMissing > max) return false;
  }
  return true;
}

const BY_SORT: Record<SortKey, (a: MissingPerson, b: MissingPerson) => number> = {
  recent: (a, b) => b.missingDate.localeCompare(a.missingDate),
  oldest: (a, b) => a.missingDate.localeCompare(b.missingDate),
  name: (a, b) => a.name.localeCompare(b.name, "ko"),
};

/** AI 예상 모습이 있는 아동을 먼저 보여주고, 그 안에서 고른 정렬을 따른다. */
export function sortPersons(persons: MissingPerson[], sort: SortKey): MissingPerson[] {
  const hasAi = (p: MissingPerson) => (p.photos.aged ? 0 : 1);
  return [...persons].sort((a, b) => hasAi(a) - hasAi(b) || BY_SORT[sort](a, b));
}

/** 데이터에 있는 시·도만 가나다순으로 */
export function listRegions(persons: MissingPerson[]): string[] {
  return [...new Set(persons.map((p) => p.region))].sort((a, b) => a.localeCompare(b, "ko"));
}

export interface FilterOptions {
  query: string;
  filters: SearchFilters;
  sort: SortKey;
}

/** 검색어 AND 드롭다운 필터 → 정렬 */
export function filterPersons(
  persons: MissingPerson[],
  { query, filters, sort }: FilterOptions,
): MissingPerson[] {
  const matched = persons.filter((p) => matchesQuery(p, query) && matchesFilters(p, filters));
  return sortPersons(matched, sort);
}

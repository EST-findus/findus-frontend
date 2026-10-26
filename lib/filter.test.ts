import { beforeAll, describe, expect, it } from "vitest";
import { getMissingPersons } from "./demoData";
import {
  DEFAULT_FILTERS,
  filterPersons,
  listRegions,
  matchesQuery,
  sortPersons,
  type FilterOptions,
} from "./filter";
import type { MissingPerson, SearchFilters } from "./types";

const names = (list: MissingPerson[]) => list.map((p) => p.name);

let persons: MissingPerson[] = [];
beforeAll(async () => {
  persons = await getMissingPersons();
});

const run = ({ filters, ...opts }: Partial<Omit<FilterOptions, "filters">> & {
  filters?: Partial<SearchFilters>;
} = {}) =>
  filterPersons(persons, {
    query: "",
    sort: "recent",
    ...opts,
    filters: { ...DEFAULT_FILTERS, ...filters },
  });

describe("검색", () => {
  it("빈 검색어는 전체를 반환한다", () => {
    expect(run()).toHaveLength(6);
  });

  it("지역으로 검색한다", () => {
    expect(names(run({ query: "부산" }))).toEqual(["이서연"]);
  });

  it("실종 당시 나이로 검색한다", () => {
    expect(names(run({ query: "9세" }))).toEqual(["박준영"]);
  });

  it("공백을 무시한다", () => {
    const minjun = persons.find((p) => p.id === "MC-2001-0812")!;
    expect(matchesQuery(minjun, "  김 민준 ")).toBe(true);
    expect(matchesQuery(minjun, "5 세")).toBe(true);
  });

  it("특징으로 검색한다", () => {
    expect(names(run({ query: "보조개" }))).toEqual(["정우진"]);
  });

  it("일치하지 않으면 빈 배열", () => {
    expect(run({ query: "없는이름" })).toEqual([]);
  });
});

describe("필터", () => {
  it("성별로 거른다", () => {
    expect(names(run({ filters: { gender: "여" } }))).toEqual(["한지민", "오하은", "이서연"]);
  });

  it("지역으로 거른다", () => {
    expect(names(run({ filters: { region: "경기" } }))).toEqual(["박준영"]);
  });

  it("실종 연도 구간으로 거른다 (경계: 2000년은 2000년대)", () => {
    expect(names(run({ filters: { period: "before2000" } }))).toEqual(["이서연", "정우진"]);
    expect(names(run({ filters: { period: "2000s" } }))).toEqual(["한지민", "오하은", "김민준"]);
    expect(run({ filters: { period: "after2020" } })).toEqual([]);
  });

  it("실종 당시 나이 구간으로 거른다", () => {
    expect(names(run({ filters: { ageGroup: "0-3" } }))).toEqual(["한지민", "오하은"]);
    expect(names(run({ filters: { ageGroup: "7-9" } }))).toEqual(["박준영", "이서연"]);
    expect(run({ filters: { ageGroup: "10+" } })).toEqual([]);
  });

  it("검색어와 필터는 AND로 적용된다", () => {
    expect(names(run({ query: "광역시", filters: { gender: "남" } }))).toEqual(["정우진"]);
    expect(run({ query: "부산", filters: { gender: "남" } })).toEqual([]);
  });

  it("지역 목록은 중복 없이 가나다순", () => {
    expect(listRegions(persons)).toEqual(["경기", "광주", "대구", "부산", "서울", "인천"]);
  });
});

describe("정렬", () => {
  it("실종 연도 최신순", () => {
    expect(names(run({ sort: "recent" }))).toEqual([
      "박준영",
      "한지민",
      "오하은",
      "김민준",
      "이서연",
      "정우진",
    ]);
  });

  it("오래된순", () => {
    expect(names(run({ sort: "oldest" }))).toEqual([
      "정우진",
      "이서연",
      "김민준",
      "오하은",
      "한지민",
      "박준영",
    ]);
  });

  it("이름순", () => {
    expect(names(run({ sort: "name" }))).toEqual([
      "김민준",
      "박준영",
      "오하은",
      "이서연",
      "정우진",
      "한지민",
    ]);
  });

  it("AI 예상 모습이 있는 아동을 먼저 두고 그 안에서 고른 정렬을 따른다", () => {
    const withoutAi = (name: string) => {
      const p = persons.find((person) => person.name === name)!;
      return { ...p, photos: { ...p.photos, aged: "" } };
    };
    const mixed = persons.map((p) => (p.name === "김민준" || p.name === "박준영" ? withoutAi(p.name) : p));
    expect(names(sortPersons(mixed, "name"))).toEqual([
      "오하은",
      "이서연",
      "정우진",
      "한지민",
      "김민준",
      "박준영",
    ]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const before = names(persons);
    sortPersons(persons, "name");
    expect(names(persons)).toEqual(before);
  });
});

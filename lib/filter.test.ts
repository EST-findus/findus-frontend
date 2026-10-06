import { beforeAll, describe, expect, it } from "vitest";
import { getMissingPersons } from "./data";
import { filterPersons, isLongTerm, matchesQuery, sortPersons, type FilterOptions } from "./filter";
import type { MissingPerson } from "./types";

const TODAY = new Date(2026, 9, 6); // 2026-10-06
const names = (list: MissingPerson[]) => list.map((p) => p.name);

let persons: MissingPerson[] = [];
beforeAll(async () => {
  persons = await getMissingPersons();
});

const run = (opts: Partial<FilterOptions> = {}) =>
  filterPersons(persons, { query: "", filter: "all", sort: "recent", today: TODAY, ...opts });

describe("검색", () => {
  it("빈 검색어는 전체를 반환한다", () => {
    expect(run()).toHaveLength(4);
  });

  it("지역으로 검색한다", () => {
    expect(names(run({ query: "부산" }))).toEqual(["이서연"]);
  });

  it("나이 문자열로 검색한다", () => {
    expect(names(run({ query: "28세" }))).toEqual(["김민준"]);
    expect(names(run({ query: "현재 만 80세" }))).toEqual(["최순자"]);
  });

  it("공백을 무시한다", () => {
    const minjun = persons.find((p) => p.id === "MP-2001-0812")!;
    expect(matchesQuery(minjun, "  김 민준 ")).toBe(true);
    expect(matchesQuery(minjun, "만5세")).toBe(true);
  });

  it("특징으로 검색한다", () => {
    expect(names(run({ query: "보행기" }))).toEqual(["최순자"]);
  });

  it("일치하지 않으면 빈 배열", () => {
    expect(run({ query: "없는이름" })).toEqual([]);
  });
});

describe("칩", () => {
  it("카테고리로 거른다", () => {
    expect(names(run({ filter: "child" }))).toEqual(["김민준", "이서연"]);
    expect(names(run({ filter: "senior" }))).toEqual(["최순자"]);
    expect(names(run({ filter: "disabled" }))).toEqual(["박준영"]);
  });

  it("장기실종은 기준일로부터 10년 이상", () => {
    expect(names(run({ filter: "longterm" }))).toEqual(["박준영", "김민준", "이서연"]);
  });

  it("장기실종 경계: 정확히 10년 전은 포함, 하루 모자라면 제외", () => {
    const base = persons[0];
    expect(isLongTerm({ ...base, missingDate: "2016-10-06" }, TODAY)).toBe(true);
    expect(isLongTerm({ ...base, missingDate: "2016-10-07" }, TODAY)).toBe(false);
  });

  it("검색과 칩은 AND로 적용된다", () => {
    expect(names(run({ filter: "longterm", query: "서울" }))).toEqual(["김민준"]);
    expect(run({ filter: "senior", query: "부산" })).toEqual([]);
  });
});

describe("정렬", () => {
  it("최근 실종순", () => {
    expect(names(run({ sort: "recent" }))).toEqual(["최순자", "박준영", "김민준", "이서연"]);
  });

  it("오래된 실종순", () => {
    expect(names(run({ sort: "longterm" }))).toEqual(["이서연", "김민준", "박준영", "최순자"]);
  });

  it("이름순", () => {
    expect(names(run({ sort: "name" }))).toEqual(["김민준", "박준영", "이서연", "최순자"]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const before = names(persons);
    sortPersons(persons, "name");
    expect(names(persons)).toEqual(before);
  });
});

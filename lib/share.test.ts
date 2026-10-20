import { beforeAll, describe, expect, it } from "vitest";
import { getMissingPersonById, getMissingPersons } from "./demoData";
import {
  missingSummary,
  personPath,
  personStoryImagePath,
  personUrl,
  shareText,
  shareTitle,
} from "./share";
import type { MissingPerson } from "./types";

let person: MissingPerson;
beforeAll(async () => {
  [person] = await getMissingPersons();
});

describe("공유 주소", () => {
  it("관리번호로 상세 페이지 경로를 만든다", () => {
    expect(personPath("MC-2001-0812")).toBe("/missing/MC-2001-0812");
    expect(personStoryImagePath("MC-2001-0812")).toBe("/missing/MC-2001-0812/story");
  });

  it("경로에 쓸 수 없는 문자는 인코딩한다", () => {
    expect(personPath("a/b c")).toBe("/missing/a%2Fb%20c");
  });

  it("오리진과 합쳐 절대 주소를 만든다 (끝 슬래시 유무 무관)", () => {
    expect(personUrl("https://findus.kr", "MC-1")).toBe("https://findus.kr/missing/MC-1");
    expect(personUrl("https://findus.kr/", "MC-1")).toBe("https://findus.kr/missing/MC-1");
  });
});

describe("공유 문구", () => {
  it("이름·현재 추정 나이를 제목에 넣는다", () => {
    expect(shareTitle(person)).toBe(`${person.name} (현재 추정 ${person.currentAge}세)를 찾습니다`);
  });

  it("실종 일자·장소·당시 나이를 요약한다", () => {
    expect(missingSummary(person)).toBe(
      `2001. 05. 20. ${person.missingLocation}에서 실종 (당시 ${person.ageAtMissing}세)`,
    );
  });

  it("본문에 제목·요약·182 안내를 담는다", () => {
    const lines = shareText(person).split("\n");
    expect(lines).toEqual([shareTitle(person), missingSummary(person), expect.stringContaining("182")]);
  });
});

describe("getMissingPersonById", () => {
  it("관리번호로 찾고, 없으면 undefined", async () => {
    expect((await getMissingPersonById(person.id))?.name).toBe(person.name);
    expect(await getMissingPersonById("없는-번호")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { canTransition, decide, emptyDraft, isVerifiedFor, toRecord, validateStep, type FamilyDraft } from "./familyVerification";

const ready: FamilyDraft = {
  ...emptyDraft(),
  identity: { name: "최○○", birth: "1968-01-01", verifiedAt: "2026-10-22T00:00:00.000Z" },
  document: { method: "pdf", fileName: "가족관계증명서.pdf", masked: true },
  childSourceId: "48993",
  childPersonId: "p-48993",
  childName: "최준원",
  relation: "mother",
  agreeAgencyCheck: true,
  agreeDestroy: true,
};
const NOW = "2026-10-22T00:00:00.000Z";

describe("가족 인증 단계 검사", () => {
  it("단계마다 앞 단계까지 모두 채워야 한다", () => {
    expect(validateStep(0, emptyDraft())).toMatch("본인확인");
    expect(validateStep(1, { ...ready, document: null })).toMatch("가족관계증명서");
    expect(validateStep(2, { ...ready, childSourceId: "" })).toMatch("아이");
    expect(validateStep(3, { ...ready, agreeDestroy: false })).toMatch("파기");
    expect(validateStep(3, ready)).toBeNull();
  });

  it("PDF는 주민번호 뒷자리를 가렸는지 확인한다", () => {
    expect(validateStep(1, { ...ready, document: { method: "pdf", fileName: "a.pdf", masked: false } })).toMatch("뒷자리");
    expect(validateStep(1, { ...ready, document: { method: "gov24", fileName: "정부24", masked: false } })).toBeNull();
  });

  it("신고 연도는 선택이지만 쓰면 네 자리여야 한다", () => {
    expect(validateStep(2, { ...ready, reportYear: "" }, 2026)).toBeNull();
    expect(validateStep(2, { ...ready, reportYear: "2000" }, 2026)).toBeNull();
    expect(validateStep(2, { ...ready, reportYear: "00" }, 2026)).toMatch("네 자리");
    expect(validateStep(2, { ...ready, reportYear: "2030" }, 2026)).toMatch("네 자리");
  });
});

describe("심사 상태", () => {
  it("정해진 순서로만 바뀐다", () => {
    expect(canTransition("reviewing", "verified")).toBe(true);
    expect(canTransition("rejected", "verified")).toBe(false);
    expect(() => decide(decide(toRecord(ready, NOW), "rejected", NOW), "verified", NOW)).toThrow();
  });

  it("확인되면 원본 서류를 파기하고 1년 뒤 재확인 날짜를 잡는다", () => {
    const verified = decide(toRecord(ready, NOW), "verified", "2026-10-25T00:00:00.000Z");
    expect(verified.document.fileName).toBeNull();
    expect(verified.document.destroyedAt).toBe("2026-10-25T00:00:00.000Z");
    expect(verified.agency).toMatch("아동권리보장원");
    expect(verified.renewBy?.slice(0, 10)).toBe("2027-10-25");
  });

  it("보완 요청 중에는 서류를 30일까지만 보관한다", () => {
    const pending = decide(toRecord(ready, NOW), "needs_more", NOW, "서류가 흐려요");
    expect(pending.document.fileName).toBe("가족관계증명서.pdf");
    expect(pending.destroyBy?.slice(0, 10)).toBe("2026-11-21");
    expect(pending.note).toBe("서류가 흐려요");
  });

  it("확인된 아이에게만, 재확인 날짜 전까지만 가족으로 본다", () => {
    const verified = decide(toRecord(ready, NOW), "verified", NOW);
    expect(isVerifiedFor(verified, "48993", new Date("2027-01-01"))).toBe(true);
    expect(isVerifiedFor(verified, "357307", new Date("2027-01-01"))).toBe(false);
    expect(isVerifiedFor(verified, "48993", new Date("2027-11-01"))).toBe(false);
    expect(isVerifiedFor(toRecord(ready, NOW), "48993")).toBe(false);
    expect(isVerifiedFor(null, "48993")).toBe(false);
  });
});

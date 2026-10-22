import { describe, expect, it } from "vitest";
import { formatInquiry, INQUIRY_MAX, validateInquiry } from "./inquiry";

const ok = { type: "오류 신고", message: "검색 결과가 두 번 나와요. 확인 부탁드려요.", email: "", agree: false };

describe("validateInquiry", () => {
  it("올바른 입력은 통과한다", () => {
    expect(validateInquiry(ok)).toBeNull();
    expect(validateInquiry({ ...ok, email: "me@example.com", agree: true })).toBeNull();
  });

  it("유형·길이·이메일을 확인한다", () => {
    expect(validateInquiry({ ...ok, type: "제보" })).toMatch("유형");
    expect(validateInquiry({ ...ok, message: "   짧아요   " })).toMatch("10자");
    expect(validateInquiry({ ...ok, message: "가".repeat(INQUIRY_MAX + 1) })).toMatch("까지");
    expect(validateInquiry({ ...ok, email: "not-mail", agree: true })).toMatch("이메일");
  });

  it("이메일을 적었으면 수집 동의가 필요하다", () => {
    expect(validateInquiry({ ...ok, email: "me@example.com", agree: false })).toMatch("동의");
  });
});

describe("formatInquiry", () => {
  it("유형·내용·이메일·화면을 한 글에 담는다", () => {
    const { content, text } = formatInquiry({ type: "기타", message: " 안녕하세요 반가워요 ", email: "", page: "/help" }, "2026-10-22 15:00");
    expect(content).toBe(text);
    expect(text).toContain("[FindUs 문의] 기타");
    expect(text).toContain("안녕하세요 반가워요");
    expect(text).toContain("답변 이메일: 없음");
    expect(text).toContain("보낸 화면: /help");
  });
});

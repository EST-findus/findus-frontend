import { describe, expect, it } from "vitest";
import { hashPassword, safeNextPath, validateLogIn, validateSignUp } from "./auth";

const valid = {
  email: " Hong@Example.com ",
  password: "findus2026",
  passwordConfirm: "findus2026",
  nickname: "길동",
};

describe("회원가입 검증", () => {
  it("올바른 입력은 통과한다", () => {
    expect(validateSignUp(valid)).toBeNull();
  });

  it("이메일 형식을 확인한다", () => {
    expect(validateSignUp({ ...valid, email: "" })).toBe("이메일을 입력해 주세요.");
    expect(validateSignUp({ ...valid, email: "hong@example" })).toBe("이메일 형식이 올바르지 않아요.");
  });

  it("비밀번호 길이·조합·확인을 확인한다", () => {
    const pw = (password: string, passwordConfirm = password) =>
      validateSignUp({ ...valid, password, passwordConfirm });
    expect(pw("abc123")).toBe("비밀번호를 8자 이상 입력해 주세요.");
    expect(pw("abcdefgh")).toBe("비밀번호에 영문과 숫자를 함께 넣어 주세요.");
    expect(pw("12345678")).toBe("비밀번호에 영문과 숫자를 함께 넣어 주세요.");
    expect(pw("findus2026", "findus2027")).toBe("비밀번호 확인이 일치하지 않아요.");
  });

  it("닉네임 길이를 확인한다", () => {
    expect(validateSignUp({ ...valid, nickname: " 가 " })).toBe("닉네임을 2자 이상 입력해 주세요.");
    expect(validateSignUp({ ...valid, nickname: "가".repeat(13) })).toBe("닉네임을 12자 이하로 입력해 주세요.");
  });
});

describe("로그인 검증", () => {
  it("빈 칸을 막는다", () => {
    expect(validateLogIn({ email: " ", password: "x" })).toBe("이메일을 입력해 주세요.");
    expect(validateLogIn({ email: "a@b.c", password: "" })).toBe("비밀번호를 입력해 주세요.");
    expect(validateLogIn({ email: "a@b.c", password: "x" })).toBeNull();
  });
});

describe("비밀번호 해시", () => {
  it("같은 입력은 같은 해시, 솔트가 다르면 다른 해시", async () => {
    const a = await hashPassword("findus2026", "salt-1");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashPassword("findus2026", "salt-1")).toBe(a);
    expect(await hashPassword("findus2026", "salt-2")).not.toBe(a);
  });
});

describe("로그인 후 이동 주소", () => {
  it("사이트 안 주소만 허용한다", () => {
    expect(safeNextPath("/community/write")).toBe("/community/write");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath(null, "/community")).toBe("/community");
  });
});

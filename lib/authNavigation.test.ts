import { describe, expect, it } from "vitest";
import { getContinuationPath, getPostLoginPath } from "./authNavigation";

describe("마이페이지 첫 화면", () => {
  it("로그인 기본 목적지는 마이페이지다", () => {
    for (const path of [undefined, null, "/", "/mypage", "/mypage/", "/login?next=/search", "/signup"]) {
      expect(getPostLoginPath(path)).toBe("/mypage");
      expect(getContinuationPath(path)).toBeNull();
    }
  });
  it("작성 중이던 화면은 마이페이지의 이어가기 주소로 유지한다", () => {
    const next = "/community/write?category=question#content";
    expect(getPostLoginPath(next)).toBe(`/mypage?next=${encodeURIComponent(next)}`);
    expect(getContinuationPath(next)).toBe(next);
  });
  it("외부 주소와 브라우저가 외부 주소로 해석하는 경로를 거부한다", () => {
    for (const path of ["https://example.com", "//example.com", "/\\example.com", "/\n/example.com"]) {
      expect(getPostLoginPath(path)).toBe("/mypage");
      expect(getContinuationPath(path)).toBeNull();
    }
  });
});

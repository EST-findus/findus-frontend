import { safeNextPath } from "./auth";

/** 로그인 후 첫 화면은 마이페이지로 통일하고, 진행 중이던 작업은 링크로 이어 준다. */
export function getContinuationPath(next?: string | null): string | null {
  const path = safeNextPath(next);
  const pathname = path.split(/[?#]/, 1)[0];
  if (["/", "/mypage", "/login", "/signup"].some((entry) => pathname === entry || pathname === `${entry}/`)) return null;
  return path;
}

export function getPostLoginPath(next?: string | null): string {
  const continuation = getContinuationPath(next);
  return continuation ? `/mypage?next=${encodeURIComponent(continuation)}` : "/mypage";
}

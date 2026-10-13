"use client";

import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeAuth, type User } from "./auth";

/** 로그인한 회원. 서버 렌더링과 첫 화면에서는 null(로그아웃 상태)로 그린다. */
export function useCurrentUser(): User | null {
  return useSyncExternalStore(subscribeAuth, getCurrentUser, () => null);
}

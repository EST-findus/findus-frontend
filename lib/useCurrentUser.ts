"use client";

import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeAuth, type User } from "./auth";

/** 로그인한 회원. 서버 렌더링과 첫 화면에서는 null(로그아웃 상태)로 그린다. */
export function useCurrentUser(): User | null {
  return useSyncExternalStore(subscribeAuth, getCurrentUser, () => null);
}

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** 저장된 로그인 상태를 읽기 전에는 다른 첫 화면을 잠깐 노출하지 않는다. */
export function useAuthReady(): boolean {
  return useSyncExternalStore(subscribeReady, clientReady, serverReady);
}

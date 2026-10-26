"use client";

import { useEffect } from "react";

/** 프로덕션에서만 서비스 워커를 등록한다. 개발 중에는 캐시가 HMR을 방해하지 않게 한다. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

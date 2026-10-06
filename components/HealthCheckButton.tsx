"use client";

import { useState } from "react";

const HEALTH_URL = "/backend/health";
const TIMEOUT_MS = 5000;

type Status = "idle" | "loading" | "ok" | "error";

const LABEL: Record<Status, string> = {
  idle: "서버 상태 확인",
  loading: "확인 중…",
  ok: "서버 정상",
  error: "서버 응답 없음",
};

const DOT: Record<Status, string> = {
  idle: "bg-subtle",
  loading: "bg-subtle animate-pulse",
  ok: "bg-emerald-500",
  error: "bg-red",
};

export default function HealthCheckButton() {
  const [status, setStatus] = useState<Status>("idle");

  async function check() {
    setStatus("loading");
    try {
      const res = await fetch(HEALTH_URL, {
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={check}
      disabled={status === "loading"}
      title={HEALTH_URL}
      className="ml-auto inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-wait"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      <span aria-live="polite">{LABEL[status]}</span>
    </button>
  );
}

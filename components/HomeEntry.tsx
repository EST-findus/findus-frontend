"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";

export default function HomeEntry({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const ready = useAuthReady();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/mypage");
  }, [ready, user, router]);

  if (!ready || user) {
    return <p role="status" className="page-container py-24 text-center text-muted">첫 화면을 준비하고 있어요.</p>;
  }
  return children;
}

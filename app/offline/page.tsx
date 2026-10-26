import type { Metadata } from "next";

export const metadata: Metadata = { title: "오프라인", robots: { index: false } };

/** 서비스 워커(public/sw.js)가 네트워크 연결이 없을 때 대신 보여주는 페이지. */
export default function OfflinePage() {
  return (
    <main className="page-container py-24 text-center">
      <h1 className="text-2xl font-bold">인터넷에 연결되어 있지 않습니다</h1>
      <p className="mt-4 text-muted">실종아동 정보는 최신 상태로만 보여 드립니다. 연결을 확인한 뒤 다시 시도해 주세요.</p>
      {/* 연결이 돌아왔는지 확인하려면 클라이언트 라우팅이 아니라 페이지를 새로 불러와야 한다. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-bold text-white">
        다시 시도
      </a>
    </main>
  );
}

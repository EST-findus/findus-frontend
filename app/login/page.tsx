import type { Metadata } from "next";
import SiteBrand from "@/components/SiteBrand";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | findus",
  description: "findus 로그인 화면",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-310 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3 max-sm:px-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy" aria-label="findus 홈으로">
            <SiteBrand />
          </Link>
          <Link href="/" className="rounded text-sm font-medium text-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
            실종자 검색으로 돌아가기
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-8 [@media(max-height:700px)]:py-3">
        <div className="w-full max-w-110">
          <div className="mb-6 text-center [@media(max-height:700px)]:mb-3">
            <p className="text-sm font-semibold text-navy">함께 찾는 희망, findus</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">로그인</h1>
            <p className="mt-2 text-sm leading-6 break-keep text-muted">
              소중한 사람을 찾는 여정에 함께해 주세요.
            </p>
          </div>
          <section aria-label="이메일 로그인" className="rounded-2xl border border-line bg-white p-6 shadow-search [@media(max-height:700px)]:p-4">
            <LoginForm />
          </section>
          <p className="mt-4 text-center [@media(max-height:700px)]:mt-2 text-sm leading-6 break-keep text-muted">
            실종자 검색과 긴급 신고는 로그인 없이 이용할 수 있습니다.
          </p>
          <div className="mt-2 text-center">
            <a href="tel:182" className="rounded text-sm font-semibold text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
              실종 신고 · 상담 182
            </a>
          </div>
        </div>
      </main>
      <footer className="shrink-0 px-4 pb-3 text-center text-xs text-muted">© 2026 findus</footer>
    </div>
  );
}

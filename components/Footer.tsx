import Link from "next/link";
import { MISSING_CHILD_CENTER_URL, SAFE182_URL } from "@/lib/links";
import { Logo } from "./Header";
import { ArrowRightIcon, ArrowUpRightIcon } from "./Icons";

const LINKS = [
  { label: "AI 연구 안내", href: "/ai" },
  { label: "경찰청 안전Dream", href: SAFE182_URL },
  { label: "실종아동전문기관", href: MISSING_CHILD_CENTER_URL },
  // TODO: 실제 페이지가 생기면 경로 연결
  { label: "개인정보처리방침", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-310 flex-wrap items-center justify-between gap-3 px-6 py-6 max-sm:px-4">
          <p className="text-[17px] font-bold break-keep">작은 관심이, 다시 만나는 시작이 됩니다.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[14px] font-semibold text-white/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            함께 찾아보기 <ArrowRightIcon size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      <div className="bg-surface">
        <div className="mx-auto max-w-310 px-6 py-9 text-[13px] text-muted max-sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo />
            <nav aria-label="관련 링크" className="flex flex-wrap gap-x-5 gap-y-1">
              {LINKS.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                    className="inline-flex items-center gap-0.5 font-semibold text-ink/80 hover:text-brand"
                  >
                    {link.label}
                    {external && <ArrowUpRightIcon size={13} strokeWidth={2.2} />}
                  </a>
                );
              })}
            </nav>
          </div>
          <p className="mt-5 break-keep">
            FindUs는 장기 실종아동 정보를 찾아보고 제보 방법을 안내하는 서비스입니다. 실종 신고와
            수사는 경찰청(112·182)을 통해 진행됩니다.
          </p>
          <p className="mt-1.5">© 2026 FindUs</p>
        </div>
      </div>
    </footer>
  );
}

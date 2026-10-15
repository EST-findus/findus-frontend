import Link from "next/link";
import { MOCK_PHOTO_LABEL } from "@/lib/attribution";
import { MISSING_CHILD_CENTER_URL, SAFE182_URL } from "@/lib/links";
import { Logo } from "./Header";
import { ArrowRightIcon, ArrowUpRightIcon } from "./Icons";

const COLUMNS = [
  {
    title: "서비스",
    links: [
      { label: "실종아동 찾기", href: "/" },
      { label: "AI 연구 안내", href: "/ai" },
      { label: "커뮤니티", href: "/community" },
      { label: "서비스 소개", href: "/about" },
    ],
  },
  {
    title: "제보·상담",
    links: [
      { label: "이 사람을 알아요", href: "/guide#know" },
      { label: "혹시 나?", href: "/guide#me" },
      { label: "자주 묻는 질문", href: "/guide#faq" },
    ],
  },
  {
    title: "공식 기관",
    links: [
      { label: "경찰청 안전Dream", href: SAFE182_URL },
      { label: "실종아동전문기관", href: MISSING_CHILD_CENTER_URL },
    ],
  },
];

const HOTLINES = [
  { number: "112", label: "긴급 신고" },
  { number: "182", label: "실종아동 찾기 상담" },
];

const LINK_CLASS =
  "inline-flex items-center gap-0.5 rounded font-medium text-ink/75 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Footer() {
  return (
    <footer className="mt-28 max-sm:mt-20">
      <div className="bg-brand text-white">
        <div className="page-container flex flex-wrap items-center justify-between gap-3 py-7">
          <p className="text-[18px] font-bold break-keep max-sm:text-[16px]">
            작은 관심이, 다시 만나는 시작이 됩니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[15px] font-semibold text-white/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            함께 찾아보기 <ArrowRightIcon size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      <div className="bg-surface text-[14px] text-muted">
        <div className="page-container py-14 max-sm:py-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] max-md:grid-cols-2 max-sm:gap-8">
            <div className="max-md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-80 leading-relaxed break-keep">
                FindUs는 장기 실종아동 정보를 찾아보고 제보 방법을 안내하는 서비스입니다.
              </p>
            </div>
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-3.5 text-[13px] font-bold text-ink">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => {
                    const external = link.href.startsWith("http");
                    return (
                      <li key={link.label}>
                        {external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={LINK_CLASS}
                          >
                            {link.label} <ArrowUpRightIcon size={13} strokeWidth={2.2} />
                          </a>
                        ) : (
                          <Link href={link.href} className={LINK_CLASS}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
            {HOTLINES.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="text-[18px] font-extrabold text-brand">{h.number}</span>
                <span className="font-semibold text-ink/80">{h.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 text-[13px] leading-relaxed break-keep">
            <p className="font-bold text-ink/80">{MOCK_PHOTO_LABEL}</p>
            <p>
              현재 목록은 시연용 예시입니다. 공식 실종 정보:{" "}
              <a
                href={SAFE182_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink/75 hover:text-brand"
              >
                경찰청 안전Dream
              </a>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px]">
            <p className="break-keep">
              실종 신고와 수사는 경찰청(112·182)을 통해 진행됩니다. © 2026 FindUs
            </p>
            {/* TODO: 실제 페이지가 생기면 경로 연결 */}
            <a href="#" className="font-bold text-ink/80 hover:text-brand">
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const LINKS = [
  { label: "경찰청 안전Dream", href: "https://www.safe182.go.kr" },
  { label: "실종아동 전문기관", href: "https://www.missingchild.or.kr" },
  // TODO: 실제 페이지가 생기면 경로 연결
  { label: "AI 몽타주 생성 알고리즘", href: "#" },
  { label: "개인정보처리방침", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-surface">
      <div className="mx-auto max-w-310 px-6 py-9 text-[13px] text-muted max-sm:px-4">
        <nav aria-label="관련 링크" className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
          {LINKS.map((link, i) => {
            const external = link.href.startsWith("http");
            return (
              <span key={link.label} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true">·</span>}
                <a
                  href={link.href}
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="font-semibold text-ink hover:underline"
                >
                  {link.label}
                </a>
              </span>
            );
          })}
        </nav>
        <p className="break-keep">
          © 2026 AI 실종자 얼굴 복원 및 수색 지원 시스템 | 긴급 신고: 112 / 182
        </p>
      </div>
    </footer>
  );
}

interface PageHeroProps {
  /** 제목 위 작은 라벨 */
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 설명 아래에 붙는 버튼·검색창 등 */
  children?: React.ReactNode;
  /** 데스크톱에서 오른쪽에 놓이는 시각 요소 */
  aside?: React.ReactNode;
  /** 검색 화면처럼 바로 아래 내용이 중요할 때 위아래 여백을 줄인다 */
  compact?: boolean;
  /** 다음 요소가 히어로 하단에 겹쳐 올라올 때 아래 여백을 더 준다 */
  overlap?: boolean;
}

/** 모든 페이지 첫 화면에 쓰는 공통 머리 영역. 제목 크기와 여백을 한곳에서 맞춘다. */
export default function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  compact = false,
  overlap = false,
}: PageHeroProps) {
  const top = compact ? "pt-14 max-sm:pt-10" : "pt-20 max-sm:pt-12";
  const bottom = overlap
    ? "pb-24 max-sm:pb-20"
    : compact
      ? "pb-12 max-sm:pb-9"
      : "pb-20 max-sm:pb-12";

  return (
    <section className="relative overflow-hidden bg-hero">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-112 w-112 rounded-full bg-brand/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        className={`page-container relative grid items-center gap-12 ${top} ${bottom} ${
          aside ? "lg:grid-cols-[1.05fr_1fr]" : ""
        }`}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-card/80 px-3 py-1 text-[13px] font-bold text-brand">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[44px] leading-[1.3] font-extrabold tracking-[-0.02em] break-keep max-sm:mt-4 max-sm:text-[30px]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-150 text-[17px] leading-[1.65] break-keep text-muted max-sm:text-[15px]">
              {description}
            </p>
          )}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

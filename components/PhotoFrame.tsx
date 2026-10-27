import FadeInImage from "./FadeInImage";

interface PhotoContentProps {
  src: string;
  alt: string;
  sizes: string;
}

/** 부모는 relative + 크기를 가져야 한다. */
export function PhotoContent({ src, alt, sizes }: PhotoContentProps) {
  return <FadeInImage quality={90} src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
}

interface PhotoFrameProps extends PhotoContentProps {
  /** 사진 하단에 겹치는 작은 배지 */
  badge: string;
  /** AI 생성 사진은 브랜드 색 배지 */
  ai?: boolean;
  ariaLabel: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function PhotoFrame({ badge, ai, ariaLabel, onClick, ...content }: PhotoFrameProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative block aspect-3/4 w-full cursor-pointer overflow-hidden rounded-lg bg-surface transition hover:ring-3 hover:ring-brand/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <PhotoContent {...content} />
      <span
        className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-white ${
          ai ? "bg-brand/85" : "bg-ink/60"
        }`}
      >
        {badge}
      </span>
    </button>
  );
}

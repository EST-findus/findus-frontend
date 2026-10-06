import Image from "next/image";

interface PhotoContentProps {
  src: string;
  alt: string;
  sizes: string;
}

/** 부모는 relative + 크기를 가져야 한다. */
export function PhotoContent({ src, alt, sizes }: PhotoContentProps) {
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
}

interface PhotoFrameProps extends PhotoContentProps {
  label: string;
  ariaLabel: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function PhotoFrame({ label, ariaLabel, onClick, ...content }: PhotoFrameProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-surface transition hover:border-navy hover:ring-3 hover:ring-navy/10 focus-visible:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      <PhotoContent {...content} />
      <span
        aria-hidden="true"
        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        🔍
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-navy/80 px-1 py-1 text-center text-[11px] leading-tight font-semibold tracking-[-0.3px] break-keep text-white">
        {label}
      </span>
    </button>
  );
}

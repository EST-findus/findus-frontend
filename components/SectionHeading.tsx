interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 페이지 최상단 제목이면 h1 */
  as?: "h1" | "h2";
  id?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  id,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : undefined}>
      <p className="mb-3 text-[13px] font-bold tracking-[0.12em] text-brand uppercase">{eyebrow}</p>
      <Tag
        id={id}
        className="text-[32px] leading-[1.3] font-extrabold tracking-[-0.02em] break-keep max-sm:text-[24px]"
      >
        {title}
      </Tag>
      {description && (
        <p
          className={`mt-3 max-w-160 text-[16px] leading-[1.65] break-keep text-muted max-sm:text-[15px] ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

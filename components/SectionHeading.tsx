interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 페이지 최상단 제목이면 h1 */
  as?: "h1" | "h2";
  id?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  id,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-bold tracking-[1.5px] text-brand uppercase">{eyebrow}</p>
      <Tag
        id={id}
        className="text-[28px] leading-snug font-extrabold tracking-[-0.6px] break-keep max-sm:text-[23px]"
      >
        {title}
      </Tag>
      {description && (
        <p className="mt-2 text-[15px] break-keep text-muted max-sm:text-[14px]">{description}</p>
      )}
    </div>
  );
}

import { CATEGORY_LABELS, type PostCategory } from "@/lib/community";

const TONE: Record<PostCategory, string> = {
  notice: "bg-brand text-white",
  info: "bg-brand-soft text-brand",
  story: "bg-gold-soft text-gold-ink",
  question: "bg-surface text-ink/75",
};

export default function CategoryBadge({ category }: { category: PostCategory }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[12px] font-bold whitespace-nowrap ${TONE[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

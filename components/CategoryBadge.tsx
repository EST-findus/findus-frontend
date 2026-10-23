import { CATEGORY_LABELS, type PostCategory } from "@/lib/community";

// 팔레트에 맞춰 분류마다 다른 색: 공지는 공공 블루, 찾기 도움말은 라이트 블루, 응원·이야기는 웜 코랄, 질문은 차분한 회청색.
const TONE: Record<PostCategory, string> = {
  notice: "bg-[#3978B8] text-white",
  info: "bg-[#EAF2F9] text-[#2F66A0] ring-1 ring-inset ring-[#CFDEF0]",
  story: "bg-[#FEF4F3] text-[#B4473F] ring-1 ring-inset ring-[#F6CDC9]",
  question: "bg-[#F4F6F9] text-[#3D5877] ring-1 ring-inset ring-[#DCE5F0]",
};

export default function CategoryBadge({ category }: { category: PostCategory }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold whitespace-nowrap ${TONE[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

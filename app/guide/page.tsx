import type { Metadata } from "next";
import GuideContent from "@/components/GuideContent";

export const metadata: Metadata = {
  title: "제보·상담 안내",
  description: "실종아동을 알아봤거나, 내가 실종아동일지 모른다면 따라야 할 공식 절차를 안내합니다.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return <main><GuideContent /></main>;
}

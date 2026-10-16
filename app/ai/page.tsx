import type { Metadata } from "next";
import AiContent from "@/components/AiContent";

export const metadata: Metadata = {
  title: "AI 연구 안내",
  description: "실종 당시 사진으로 현재 모습을 추정하는 AI 연령 변환의 원리와 사용 원칙을 안내합니다.",
  alternates: { canonical: "/ai" },
};

export default function AiPage() {
  return <main><AiContent /></main>;
}

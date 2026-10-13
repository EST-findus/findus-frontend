import type { Metadata } from "next";
import CommunityBoard from "@/components/CommunityBoard";
import PageHero from "@/components/PageHero";
import { getSeedPosts } from "@/lib/community";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "장기 실종아동을 기억하는 사람들이 정보와 응원을 나누는 정보마당입니다.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <PageHero
        compact
        overlap
        eyebrow="커뮤니티 · 정보마당"
        title="함께 기억하고, 함께 나눠요."
        description="찾는 데 도움이 되는 정보, 기다리는 가족을 향한 응원, 궁금한 점을 자유롭게 나눠 주세요."
      />
      <CommunityBoard initialPosts={getSeedPosts()} />
    </main>
  );
}

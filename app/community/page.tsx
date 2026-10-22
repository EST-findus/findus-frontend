import type { Metadata } from "next";
import CommunityBoard from "@/components/CommunityBoard";
import PageTabs from "@/components/PageTabs";
import { ReunionNewsList } from "@/components/ReunionStory";
import { getSeedPosts } from "@/lib/community";

export const metadata: Metadata = {
  title: "정보 마당",
  description: "장기 실종아동을 기억하는 사람들이 소식과 응원을 나누고, 다시 만난 가족들의 이야기를 함께 보는 정보 마당입니다.",
  alternates: { canonical: "/community" },
};

const TABS = [
  { key: "stories", label: "소식·이야기" },
  { key: "news", label: "다시 만난 이야기" },
];

export default function CommunityPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <header className="page-container max-w-5xl pt-8 pb-6 max-sm:pt-6 max-sm:pb-5">
        <p className="text-[13px] font-bold text-brand">정보 마당</p>
        <h1 className="mt-2 text-[32px] leading-snug font-extrabold tracking-tight max-sm:text-[25px]">함께 기억하고, 함께 나눠요.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted max-sm:text-[14px]">서로에게 힘이 되는 이야기와 다시 만난 가족들의 소식을 한곳에서 만나보세요.</p>
      </header>
      <PageTabs
        label="정보 마당 분야"
        tabs={TABS}
        panels={[<CommunityBoard key="stories" initialPosts={getSeedPosts()} />, <ReunionNewsList key="news" />]}
      />
    </main>
  );
}

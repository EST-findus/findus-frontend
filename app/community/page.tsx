import type { Metadata } from "next";
import CommunityBoard from "@/components/CommunityBoard";
import InfoHero from "@/components/InfoHero";
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
      <InfoHero
        eyebrow="정보 마당"
        title="함께 기억하고,"
        accent="함께 나눠요."
        description={<>서로에게 힘이 되는 이야기와 <br className="max-sm:hidden" />다시 만난 가족들의 소식을 한곳에서 만나보세요.</>}
        image="/images/home-family-together.png"
        flip
        imagePosition="center 62%"
      />
      <PageTabs
        label="정보 마당 분야"
        tabs={TABS}
        panels={[<CommunityBoard key="stories" initialPosts={getSeedPosts()} />, <ReunionNewsList key="news" />]}
      />
    </main>
  );
}

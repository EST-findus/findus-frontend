import type { Metadata } from "next";
import CommunityBoard from "@/components/CommunityBoard";
import CommunityTabs from "@/components/CommunityTabs";
import GuideContent from "@/components/GuideContent";
import AiContent from "@/components/AiContent";
import { getSeedPosts } from "@/lib/community";

export const metadata: Metadata = {
  title: "정보 마당",
  description: "장기 실종아동을 기억하는 사람들이 정보와 응원을 나누는 정보 마당입니다.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <header className="page-container max-w-5xl pt-8 pb-6 max-sm:pt-6 max-sm:pb-5">
        <p className="text-[13px] font-bold text-brand">정보 마당</p>
        <h1 className="mt-2 text-[32px] leading-snug font-extrabold tracking-tight max-sm:text-[25px]">함께 기억하고, 함께 나눠요.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted max-sm:text-[14px]">찾기에 필요한 안내부터 서로에게 힘이 되는 이야기까지, 한곳에서 만나보세요.</p>
      </header>
      <CommunityTabs
        stories={<CommunityBoard initialPosts={getSeedPosts()} />}
        guide={<GuideContent embedded />}
        ai={<AiContent embedded />}
      />
    </main>
  );
}

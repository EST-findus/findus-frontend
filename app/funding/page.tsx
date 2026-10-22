export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import FundingList from "@/components/funding/FundingList";
import { listedCampaigns } from "@/lib/funding";
import { childrenOf } from "@/lib/fundingChildren";

export const metadata: Metadata = {
  title: "후원하기 · 기억을 들고 다니는 QR 굿즈",
  description: "실종아동 한 명 한 명을 기억하는 QR 굿즈 펀딩. 굿즈를 고르고 후원하면 QR이 길 위에서 아이들의 얼굴을 다시 보게 합니다.",
  alternates: { canonical: "/funding" },
};

export default async function FundingListPage() {
  const campaigns = listedCampaigns();
  const children = await childrenOf(campaigns);
  return (
    <main className="flex-1">
      <FundingList campaigns={campaigns} childrenById={children} now={new Date().toISOString()} />
    </main>
  );
}

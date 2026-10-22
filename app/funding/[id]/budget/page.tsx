import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BudgetDetail from "@/components/funding/BudgetDetail";
import { campaignById, tierById } from "@/lib/funding";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tier?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  return {
    title: `후원금 사용 계획 · ${campaign.child.name}님을 기억하는 ${campaign.title}`,
    description: "굿즈를 만들고 보내는 곳, 원가, 홍보·기부로 가는 금액을 공개해요.",
    alternates: { canonical: `/funding/${campaign.id}/budget` },
  };
}

export default async function BudgetPage({ params, searchParams }: Props) {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  const { tier } = await searchParams;
  return (
    <main className="flex-1">
      <BudgetDetail campaignId={campaign.id} initialTier={tierById(tier, campaign)?.id ?? null} />
    </main>
  );
}

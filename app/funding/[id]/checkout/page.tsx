import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CheckoutFlow from "@/components/funding/CheckoutFlow";
import { campaignById, tierById } from "@/lib/funding";

export const metadata: Metadata = { title: "후원하기 · 리워드 선택", robots: { index: false, follow: false } };

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tier?: string }> }) {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  const { tier } = await searchParams;
  return (
    <main className="flex-1">
      <CheckoutFlow campaignId={campaign.id} initialTier={tierById(tier, campaign)?.id ?? null} />
    </main>
  );
}

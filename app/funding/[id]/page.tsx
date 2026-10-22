export const dynamic = "force-dynamic";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FundingDetail from "@/components/funding/FundingDetail";
import { campaignById, type Campaign } from "@/lib/funding";
import { childrenOf } from "@/lib/fundingChildren";
import { STORY_IMAGE_PATHS } from "@/lib/fundingStory";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  return {
    title: `후원하기 · ${campaign.child.name}님을 기억하는 ${campaign.title}`,
    description: campaign.subtitle,
    alternates: { canonical: `/funding/${campaign.id}` },
  };
}

// 개발 중에만 ?state=upcoming|closing|success|failed 로 상태별 화면을 확인한다.
function previewState(campaign: Campaign, state: string | undefined): { now: Date; raised?: number } | null {
  if (process.env.NODE_ENV === "production" || !state) return null;
  const start = new Date(campaign.startsAt).getTime();
  const end = new Date(campaign.endsAt).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (state === "upcoming") return { now: new Date(start - 3 * day) };
  if (state === "closing") return { now: new Date(end - 2 * day) };
  if (state === "success") return { now: new Date(end + day) };
  if (state === "failed") return { now: new Date(end + day), raised: Math.round(campaign.goal * 0.62) };
  return null;
}

export default async function FundingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  const { state } = await searchParams;
  const preview = previewState(campaign, state);
  const child = (await childrenOf([campaign]))[campaign.id] ?? null;
  const availableImages = campaign.hasStory ? STORY_IMAGE_PATHS.filter((src) => existsSync(path.join(process.cwd(), "public", src))) : [];
  return (
    <main className="flex-1">
      <FundingDetail
        campaignId={campaign.id}
        child={child}
        now={(preview?.now ?? new Date()).toISOString()}
        availableImages={availableImages}
        raisedOverride={preview?.raised}
      />
    </main>
  );
}

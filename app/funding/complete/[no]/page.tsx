import type { Metadata } from "next";
import PledgeComplete from "@/components/funding/PledgeComplete";

export const metadata: Metadata = { title: "후원 완료", robots: { index: false, follow: false } };

export default async function CompletePage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  return (
    <main className="flex-1">
      <PledgeComplete no={decodeURIComponent(no)} />
    </main>
  );
}

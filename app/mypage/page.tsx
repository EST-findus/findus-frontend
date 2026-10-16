import type { Metadata } from "next";
import { getMissingPersons } from "@/lib/data";
import MyPage from "@/components/MyPage";
import { getContinuationPath } from "@/lib/authNavigation";

export const metadata: Metadata = { title: "마이페이지", robots: { index: false, follow: false } };

export default async function MyPageRoute({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const persons = await getMissingPersons();
  return <main className="flex-1"><MyPage continuation={getContinuationPath(next)} persons={persons} /></main>;
}

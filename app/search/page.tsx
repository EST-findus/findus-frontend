import type { Metadata } from "next";
import MissingPersonExplorer from "@/components/MissingPersonExplorer";
import { getMissingPersons } from "@/lib/data";

export const metadata: Metadata = { title: "실종아동 찾기" };

export default async function SearchPage() {
  const persons = await getMissingPersons();
  return <main><MissingPersonExplorer persons={persons} /></main>;
}

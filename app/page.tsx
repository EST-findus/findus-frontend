export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import HomeLanding from "@/components/HomeLanding";
import { getMissingPersons } from "@/lib/data";
import type { MissingPerson } from "@/lib/types";

export const metadata: Metadata = {
  title: "FindUs | 아이들이 다시 가족의 품으로",
  description: "실종아동을 기억하는 작은 관심. FindUs에서 정보를 살펴보고, 기억나는 단서를 공식 제보로 연결해 주세요.",
};

// The hero shows one child at random. The page renders per request, so each visit (and each logo click) can show a different child.
// Only children with a photo are picked, so the small card never opens on an empty photo slot.
function pickFeatured(persons: MissingPerson[]): MissingPerson | null {
  const withPhoto = persons.filter(person => (person.source === "api" ? (person.images ?? []).length > 0 : Boolean(person.photos.past)));
  const pool = withPhoto.length ? withPhoto : persons;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

export default async function Home() {
  const persons = await getMissingPersons();
  return <main><HomeLanding persons={persons} featured={pickFeatured(persons)} /></main>;
}

import type { Metadata } from "next";
import HomeLanding from "@/components/HomeLanding";
import { getMissingPersons } from "@/lib/data";

export const metadata: Metadata = {
  title: "FindUs | 아이들이 다시 가족의 품으로",
  description: "실종아동을 기억하는 작은 관심. FindUs에서 정보를 살펴보고, 기억나는 단서를 공식 제보로 연결해 주세요.",
};

export default async function Home() {
  const persons = await getMissingPersons();
  return <main><HomeLanding persons={persons} /></main>;
}

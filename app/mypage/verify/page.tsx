export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import FamilyVerifyFlow, { type ChildOption } from "@/components/FamilyVerifyFlow";
import { getMissingPersons } from "@/lib/data";

export const metadata: Metadata = { title: "가족 인증 신청", robots: { index: false, follow: false } };

export default async function FamilyVerifyPage() {
  let options: ChildOption[] = [];
  try {
    // 검색에 필요한 최소 정보만 화면으로 넘긴다.
    options = (await getMissingPersons()).map(({ id, sourceId, name, missingDate, missingLocation, ageAtMissing, gender }) => ({ id, sourceId, name, missingDate, missingLocation, ageAtMissing, gender }));
  } catch { /* 백엔드가 꺼져 있으면 검색 결과가 비어 있고, 화면이 182 문의를 안내한다. */ }
  return (
    <main className="flex-1">
      <FamilyVerifyFlow options={options} />
    </main>
  );
}

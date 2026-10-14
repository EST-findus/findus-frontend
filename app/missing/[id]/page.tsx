import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PersonDetailBody from "@/components/PersonDetailBody";
import PersonPageActions from "@/components/PersonPageActions";
import { getMissingPersonById } from "@/lib/data";
import { missingSummary, personOgImagePath, personPath, shareTitle } from "@/lib/share";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getMissingPersonById(id);
  if (!person) return { title: "실종아동 정보" };

  const title = shareTitle(person);
  const description = `${missingSummary(person)}. ${person.features}`;
  const image = {
    url: personOgImagePath(person.id),
    width: 1200,
    height: 630,
    alt: `${person.name} 실종 당시 사진과 AI 예상 모습`,
  };
  // openGraph·twitter는 레이아웃 값과 병합되지 않고 통째로 바뀌므로 공통 항목도 다시 넣는다.
  return {
    title,
    description,
    alternates: { canonical: personPath(person.id) },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: "findus",
      url: personPath(person.id),
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function MissingPersonPage({ params }: Props) {
  const { id } = await params;
  const person = await getMissingPersonById(id);
  if (!person) notFound();

  return (
    <main className="pt-14 pb-20 max-sm:pt-8 max-sm:pb-14">
      <article aria-labelledby="person-title" className="page-container max-w-180">
        <p className="mb-2 text-[13.5px] font-bold text-gold-ink">장기 실종아동을 찾습니다</p>
        <h1 id="person-title" className="mb-6 text-[28px] font-extrabold tracking-[-0.4px] break-keep max-sm:text-[24px]">
          {person.name}
          <span className="ml-2 text-[18px] font-bold text-muted max-sm:text-[16px]">
            현재 추정 {person.currentAge}세
          </span>
        </h1>
        <PersonDetailBody person={person} />
        <PersonPageActions person={person} />
      </article>
    </main>
  );
}

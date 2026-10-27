import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, ShieldIcon } from "@/components/Icons";
import PersonDetailBody from "@/components/PersonDetailBody";
import PersonPageActions from "@/components/PersonPageActions";
import { formatAge, formatDate, formatGender } from "@/lib/format";
import { getMissingPersonById, getMissingPersonWithAiImage } from "@/lib/data";
import { missingSummary, personPath, shareTitle } from "@/lib/share";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getMissingPersonById(id);
  if (!person) notFound();

  const title = shareTitle(person);
  const description = `${missingSummary(person)}. 자료 출처: 경찰청`;
  const image = {
    url: "/images/findus-share.png",
    width: 1200,
    height: 630,
    alt: "FindUs 실종아동 정보",
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
  // 본문에만 대표 AI 사진을 합친다. 메타데이터·공유 이미지는 원본 정보만 쓴다.
  const person = await getMissingPersonWithAiImage(id);
  if (!person) notFound();

  const facts = [
    { label: "실종 일자", value: formatDate(person.missingDate) },
    { label: "실종 지역", value: person.missingLocation || "정보 없음" },
    { label: "실종 당시", value: formatAge(person.ageAtMissing) },
    { label: "성별", value: formatGender(person.gender) },
  ];

  return (
    <main className="bg-white pt-8 pb-20 max-sm:pt-5 max-sm:pb-14">
      <article aria-labelledby="person-title" className="page-container max-w-240">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 rounded-md text-[13.5px] font-semibold text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ChevronLeftIcon size={16} strokeWidth={2.2} />
          실종아동 목록
        </Link>

        <header className="mt-6 mb-8 max-sm:mt-4 max-sm:mb-6">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-coral-faint px-3 py-1 text-[12.5px] font-bold text-coral-ink">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-coral" />
            실종아동을 찾습니다
          </p>
          <h1 id="person-title" className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[34px] font-extrabold tracking-[-0.6px] break-keep max-sm:text-[26px]">
            {person.name}
            <span className="text-[17px] font-bold tracking-normal text-muted max-sm:text-[15px]">
              현재 {person.currentAge === null ? "나이 정보 없음" : `${person.currentAge}세`}
            </span>
          </h1>
          <dl className="mt-6 grid grid-cols-4 overflow-hidden rounded-2xl border border-line max-md:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0 border-line px-5 py-4 not-last:border-r max-md:px-4 max-md:py-3.5 max-md:nth-2:border-r-0 max-md:nth-[-n+2]:border-b">
                <dt className="text-[12px] font-semibold text-muted">{fact.label}</dt>
                <dd className="mt-1 truncate text-[15px] font-bold text-ink max-sm:text-[14px]" title={fact.value}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section aria-label="상세 정보" className="rounded-3xl border border-line bg-white p-7 shadow-panel [--color-surface:var(--color-civic-panel)] max-sm:rounded-2xl max-sm:p-4">
          <PersonDetailBody person={person} />
        </section>

        <aside className="mt-6 flex items-start gap-3 rounded-2xl bg-civic-panel px-5 py-4 text-[13.5px] leading-relaxed break-keep text-civic-body max-sm:px-4">
          <ShieldIcon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-brand" />
          <p>
            비슷한 아이를 보셨다면 바로 <strong className="text-ink">112</strong>나 <strong className="text-ink">182</strong>로 알려 주세요.
            작은 기억 하나가 가족을 다시 만나게 할 수 있어요.
          </p>
        </aside>

        <PersonPageActions person={person} />
      </article>
    </main>
  );
}

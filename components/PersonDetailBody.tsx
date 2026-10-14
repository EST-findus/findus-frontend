import type { MissingPerson } from "@/lib/types";
import InfoRows from "./InfoRows";
import { PhotoContent } from "./PhotoFrame";

/** 사진 비교 + 정보 목록. 상세 모달과 공유용 상세 페이지(/missing/[id])가 함께 쓴다. */
export default function PersonDetailBody({ person }: { person: MissingPerson }) {
  const columns: { title: string; src: string; alt: string; ai: boolean }[] = [
    {
      title: "실종 당시 원본",
      src: person.photos.past,
      alt: `${person.name} 실종 당시 사진`,
      ai: false,
    },
    {
      title: "AI 예상 모습",
      src: person.photos.aged,
      alt: `${person.name} AI 예상 현재 모습`,
      ai: true,
    },
    ...person.photos.styles.map((s) => ({
      title: `스타일 · ${s.label}`,
      src: s.src,
      alt: `${person.name} AI 스타일 변형 (${s.label})`,
      ai: true,
    })),
  ];

  return (
    <>
      <div className="mb-2 grid grid-cols-2 gap-3 rounded-xl bg-surface p-4 sm:grid-cols-4 max-sm:gap-2 max-sm:p-2.5">
        {columns.map((col) => (
          <figure key={col.title} className="text-center">
            <div
              className={`relative aspect-3/4 overflow-hidden rounded-lg border bg-card ${
                col.ai ? "border-brand/40" : "border-line"
              }`}
            >
              <PhotoContent src={col.src} alt={col.alt} sizes="(min-width: 680px) 150px, 45vw" />
            </div>
            <figcaption
              className={`mt-2 text-[12.5px] font-bold break-keep ${col.ai ? "text-brand" : "text-muted"}`}
            >
              {col.title}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mb-5 text-[12px] break-keep text-subtle">
        AI 예상 얼굴은 실제 모습과 다를 수 있습니다. 참고용으로만 활용해 주세요.
      </p>

      <InfoRows person={person} note={{ label: "AI 분석 안내", text: person.aiNote }} />
    </>
  );
}

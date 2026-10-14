import { SOURCE_LABEL } from "@/lib/attribution";
import type { MissingPerson } from "@/lib/types";
import InfoRows from "./InfoRows";
import { PhotoContent } from "./PhotoFrame";

const SIZES = "(min-width: 680px) 150px, 30vw";

/**
 * 사진 비교 + 정보 목록. 상세 모달과 공유용 상세 페이지(/missing/[id])가 함께 쓴다.
 * 경찰청 제공 원본 사진과 FindUs AI 생성 이미지를 영역부터 나눠 혼동하지 않게 한다.
 */
export default function PersonDetailBody({ person }: { person: MissingPerson }) {
  const aiPhotos: { title: string; src: string; alt: string }[] = [
    {
      title: "AI 예상 모습",
      src: person.photos.aged,
      alt: `${person.name} AI 예상 현재 모습`,
    },
    ...person.photos.styles.map((s) => ({
      title: `스타일 · ${s.label}`,
      src: s.src,
      alt: `${person.name} AI 스타일 변형 (${s.label})`,
    })),
  ];

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_3fr]">
        <section aria-label="실종 당시 원본 사진" className="rounded-xl bg-surface p-3 max-sm:p-2.5">
          <p className="mb-2 text-[12.5px] font-bold break-keep text-ink">실종 당시 원본 사진</p>
          <div className="grid grid-cols-3 sm:grid-cols-1">
            <figure>
              <div className="relative aspect-3/4 overflow-hidden rounded-lg border border-line bg-card">
                <PhotoContent src={person.photos.past} alt={`${person.name} 실종 당시 사진`} sizes={SIZES} />
              </div>
              <figcaption className="mt-2 text-center text-[11.5px] font-semibold text-muted">
                {SOURCE_LABEL}
              </figcaption>
            </figure>
          </div>
        </section>

        <section
          aria-label="AI 생성 추정 이미지"
          className="rounded-xl border border-dashed border-brand/40 bg-brand-soft/40 p-3 max-sm:p-2.5"
        >
          <p className="mb-2 flex flex-wrap items-baseline gap-x-2 text-[12.5px] break-keep">
            <span className="font-bold text-brand">AI 생성 추정 이미지</span>
            <span className="text-muted">실제 현재 모습과 다를 수 있습니다.</span>
          </p>
          <div className="grid grid-cols-3 gap-3 max-sm:gap-2">
            {aiPhotos.map((photo) => (
              <figure key={photo.title} className="text-center">
                <div className="relative aspect-3/4 overflow-hidden rounded-lg border border-brand/40 bg-card">
                  <PhotoContent src={photo.src} alt={photo.alt} sizes={SIZES} />
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-brand/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    AI
                  </span>
                </div>
                <figcaption className="mt-2 text-[12px] font-bold break-keep text-brand">
                  {photo.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>

      <InfoRows person={person} note={{ label: "AI 분석 안내", text: person.aiNote }} />
    </>
  );
}

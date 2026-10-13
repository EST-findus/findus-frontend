"use client";

import type { MissingPerson } from "@/lib/types";
import InfoRows from "./InfoRows";
import Modal from "./Modal";
import { PhotoContent } from "./PhotoFrame";

interface DetailModalProps {
  person: MissingPerson;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onReport: (person: MissingPerson) => void;
}

export default function DetailModal({ person, returnFocusTo, onClose, onReport }: DetailModalProps) {
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
    <Modal title={`${person.name} · 실종 당시와 AI 예상 모습 비교`} onClose={onClose} returnFocusTo={returnFocusTo}>
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

      <div className="mt-6 flex gap-2.5 text-[14px] font-bold">
        <button
          type="button"
          onClick={() => onReport(person)}
          className="flex-2 rounded-lg bg-brand px-3.5 py-3 text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          목격 제보하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-line bg-card px-3.5 py-3 transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}

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
  const columns: { title: string; src: string; alt: string }[] = [
    {
      title: "실종당시 모습",
      src: person.photos.past,
      alt: `${person.name} 실종 당시 사진`,
    },
    ...person.photos.ai.map((ai, i) => ({
      title: `AI 예상 사진 ${i === 0 ? "①" : "②"}`,
      src: ai.src,
      alt: `${person.name} ${ai.label}`,
    })),
  ];

  return (
    <Modal
      title={`${person.name} (${person.gender}) · 실종 당시 vs AI 예측 비교`}
      onClose={onClose}
      returnFocusTo={returnFocusTo}
    >
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-surface p-4 max-sm:gap-2 max-sm:p-2.5">
        {columns.map((col, i) => (
          <figure key={col.title} className="text-center">
            <div
              className={`relative aspect-3/4 overflow-hidden rounded-lg border bg-card ${
                i === 0 ? "border-line" : "border-navy/40"
              }`}
            >
              <PhotoContent src={col.src} alt={col.alt} sizes="(min-width: 680px) 200px, 30vw" />
            </div>
            <figcaption
              className={`mt-2 text-[13px] font-bold break-keep ${i === 0 ? "text-muted" : "text-navy"}`}
            >
              {col.title}
            </figcaption>
          </figure>
        ))}
      </div>

      <InfoRows person={person} note={{ label: "AI 알고리즘 분석:", text: person.aiNote }} />

      <div className="mt-6 flex gap-2.5 text-[14px] font-bold">
        <button
          type="button"
          onClick={() => onReport(person)}
          className="flex-2 rounded-lg bg-navy px-3.5 py-3 text-white transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          목격 제보하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-line bg-card px-3.5 py-3 transition-colors hover:border-navy hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}

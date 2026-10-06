"use client";

import { useState } from "react";
import { submitTip } from "@/lib/data";
import type { MissingPerson } from "@/lib/types";
import Modal from "./Modal";

interface TipModalProps {
  person: MissingPerson;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onSubmitted: () => void;
}

const LABEL = "mb-1.5 block text-[13.5px] font-bold";
const INPUT =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[14px] transition-shadow placeholder:text-subtle focus-visible:border-navy focus-visible:ring-3 focus-visible:ring-navy/15 focus-visible:outline-none aria-[invalid=true]:border-red";

export default function TipModal({ person, returnFocusTo, onClose, onSubmitted }: TipModalProps) {
  const [sighting, setSighting] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 브라우저 required 검증은 공백만 입력한 경우를 통과시키므로 한 번 더 확인한다.
    if (!sighting.trim() || !details.trim()) {
      setError("목격 장소 및 일시와 구체적 특징을 모두 입력해 주세요.");
      const firstEmpty = !sighting.trim() ? "tip-sighting" : "tip-details";
      document.getElementById(firstEmpty)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await submitTip({
        personId: person.id,
        sighting: sighting.trim(),
        details: details.trim(),
        contact: contact.trim() || undefined,
      });
      onSubmitted();
    } catch {
      setError("제보 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  const invalidSighting = error !== null && !sighting.trim();
  const invalidDetails = error !== null && !details.trim();

  return (
    <Modal title="목격 정보 제보하기" onClose={onClose} returnFocusTo={returnFocusTo}>
      <p className="mb-4 text-[13.5px] break-keep text-muted">
        작은 관심과 제보가 실종 가족에게는 가장 큰 희망입니다. 제보 내용은 즉시 전담 수사팀에
        공유됩니다.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="tip-target" className={LABEL}>
            제보 대상
          </label>
          <input
            id="tip-target"
            type="text"
            readOnly
            value={`${person.name} (관리번호: ${person.id})`}
            className={`${INPUT} bg-surface font-semibold text-muted`}
          />
        </div>

        <div>
          <label htmlFor="tip-sighting" className={LABEL}>
            목격 장소 및 일시 <span aria-hidden="true">*</span>
          </label>
          <input
            id="tip-sighting"
            type="text"
            required
            data-autofocus
            value={sighting}
            onChange={(e) => setSighting(e.target.value)}
            aria-invalid={invalidSighting}
            aria-describedby={error ? "tip-error" : undefined}
            placeholder="예: 2026년 10월 5일 오후 2시경 강남역 인근"
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="tip-details" className={LABEL}>
            목격 당시 구체적 특징 <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="tip-details"
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            aria-invalid={invalidDetails}
            aria-describedby={error ? "tip-error" : undefined}
            placeholder="착용 의상, 인상착의, 이동 방향, 동행인 여부 등을 자세히 적어주세요."
            className={`${INPUT} min-h-22.5 resize-y`}
          />
        </div>

        <div>
          <label htmlFor="tip-contact" className={LABEL}>
            제보자 연락처 (선택)
          </label>
          <input
            id="tip-contact"
            type="tel"
            autoComplete="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="010-0000-0000"
            className={INPUT}
          />
        </div>

        {error && (
          <p id="tip-error" role="alert" className="text-[13px] font-bold text-red">
            {error}
          </p>
        )}

        <div className="mt-1.5 flex gap-2.5 text-[14px] font-bold">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-navy px-3.5 py-3 text-white transition-colors hover:bg-navy-dark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            {submitting ? "전송 중…" : "제보 전송"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[0.4] rounded-lg border border-line bg-card px-3.5 py-3 transition-colors hover:border-navy hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            취소
          </button>
        </div>
      </form>
    </Modal>
  );
}

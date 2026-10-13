import { formatDate, formatGender } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";

interface InfoRowsProps {
  person: MissingPerson;
  /** 마지막 강조 행 (AI 분석 문구) */
  note?: { label: string; text: string };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-[13px] font-medium text-muted">{label}</dt>
      <dd className="font-medium break-keep text-ink">{children}</dd>
    </div>
  );
}

export default function InfoRows({ person, note }: InfoRowsProps) {
  return (
    <dl className="flex flex-col gap-1.5 text-[14px] leading-normal">
      <Row label="나이">
        <span className="font-bold text-brand">
          실종 당시 {person.ageAtMissing}세 · 현재 추정 {person.currentAge}세
        </span>
      </Row>
      <Row label="실종 일자">{formatDate(person.missingDate)}</Row>
      <Row label="실종 지역">{person.missingLocation}</Row>
      <Row label="성별">{formatGender(person.gender)}</Row>
      <Row label="특징">{person.features}</Row>
      <Row label="관리번호">{person.id}</Row>
      {note && (
        <div className="mt-2 rounded-lg bg-surface px-3.5 py-3">
          <dt className="mb-1 text-[13px] font-bold text-brand">{note.label}</dt>
          <dd className="text-[13.5px] break-keep text-muted">{note.text}</dd>
        </div>
      )}
    </dl>
  );
}

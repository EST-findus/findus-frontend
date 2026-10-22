import { formatDate, formatGender, formatAge, formatSyncTime } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";

interface InfoRowsProps {
  person: MissingPerson;
  compact?: boolean;
  /** 마지막 안내 행 (AI 분석 문구) */
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

export default function InfoRows({ person, note, compact = false }: InfoRowsProps) {
  return (
    <dl className={compact ? "flex flex-col gap-1 text-[13px] leading-[1.4] [&>div]:gap-2 [&>div>dt]:w-14 [&>div>dt]:text-[12px] [&_dd]:break-normal" : "flex flex-col gap-1.5 text-[14px] leading-normal"}>
      <Row label="나이">
        <span className="font-bold text-brand">
          {compact ? "당시" : "실종 당시"} {formatAge(person.ageAtMissing)} · 현재 {person.source === "api" ? "" : "추정 "}{formatAge(person.currentAge)}
        </span>
      </Row>
      <Row label="실종 일자">{formatDate(person.missingDate)}</Row>
      <Row label="실종 지역">{person.missingLocation}</Row>
      <Row label="성별">{formatGender(person.gender)}</Row>
      <Row label="특징">{person.features}</Row>
      <Row label="관리번호">{person.sourceId ?? person.id}</Row>
      {person.source === "api" && <><Row label="착의 사항">{person.clothing}</Row><Row label="출처">자료 출처: 경찰청</Row><Row label="마지막 동기화">{formatSyncTime(person.lastSyncedAt)}</Row></>}
      {note && (
        <div className="mt-3 border-l-2 border-brand/45 pl-3 text-[13px] leading-relaxed break-keep">
          <dt className="inline font-bold text-brand">{note.label} : </dt>
          <dd className="inline text-muted">{note.text}</dd>
        </div>
      )}
    </dl>
  );
}

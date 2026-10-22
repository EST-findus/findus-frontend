import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon } from "./Icons";

const LINK = "flex items-center justify-between rounded-lg px-3 py-3 text-[14px] font-semibold hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand";

export default function ServiceInfoContent() {
  return (
    <>
      <nav aria-label="공식 기관" className="divide-y divide-line">
        <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" className={LINK}>경찰청 안전Dream <ArrowUpRightIcon size={16} /></a>
        <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer" className={LINK}>실종아동전문기관 <ArrowUpRightIcon size={16} /></a>
      </nav>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[13px] font-bold max-sm:grid-cols-1">
        {OFFICIAL_CALLS.map((call) => (
          <a key={call.tel} href={`tel:${call.tel}`} className="rounded-xl border border-line px-3 py-3 hover:border-brand focus-visible:outline-2 focus-visible:outline-brand">
            {call.label} <span className="text-brand">{call.number}</span>
          </a>
        ))}
      </div>
      <p className="mt-5 text-[12px] leading-relaxed text-muted">아동 정보 자료 출처: 경찰청. 실종 신고·상담은 경찰청(112·182)을 이용해 주세요.</p>
      <p className="mt-3 text-[11px] text-muted">개인정보처리방침은 준비 중입니다.</p>
      <p className="mt-2 text-[11px] text-muted">© 2026 FindUs</p>
    </>
  );
}

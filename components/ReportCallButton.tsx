"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { HEADER_ICON_ACTION } from "./headerActionStyles";
import { ArrowRightIcon, ArrowUpRightIcon, MessageIcon, PhoneIcon } from "./Icons";
import InquiryForm from "./InquiryForm";
import Modal from "./Modal";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 헤더의 공식 제보 버튼. 누르면 걸 수 있는 공식 번호를 골라 바로 전화하고, 서비스 문의도 보낼 수 있다. */
export default function ReportCallButton() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"calls" | "inquiry">("calls");
  const trigger = useRef<HTMLButtonElement>(null);

  const close = () => { setOpen(false); setView("calls"); };

  return (
    <>
      <button ref={trigger} type="button" aria-label="공식 제보·신고 전화" title="공식 제보·신고 전화" aria-haspopup="dialog" onClick={() => setOpen(true)}
        className={HEADER_ICON_ACTION}>
        <PhoneIcon size={18} strokeWidth={2} className="shrink-0" />
      </button>
      {open && <Modal title={view === "calls" ? "공식 제보·신고 전화" : "서비스 문의"} size="narrow" mobileSheet onClose={close} returnFocusTo={trigger.current}>
        {view === "inquiry" ? <InquiryForm onDone={() => setView("calls")} /> : <>
          <p className="-mt-2 mb-4 text-[14px] leading-relaxed break-keep text-muted">FindUs는 제보를 직접 받지 않아요. 번호를 누르면 공식 기관으로 바로 전화가 연결돼요.</p>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {OFFICIAL_CALLS.map((call) => <li key={call.tel}>
              <a href={`tel:${call.tel}`} aria-label={`${call.label} ${call.number} 전화 걸기`}
                className={`flex min-h-18 items-center gap-3.5 bg-card px-4 py-3.5 transition-colors hover:bg-surface ${FOCUS} focus-visible:-outline-offset-2`}>
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"><PhoneIcon size={17} strokeWidth={2.2} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold">{call.label}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug break-keep text-muted">{call.description}</span>
                </span>
                <span className="shrink-0 text-[20px] font-extrabold tracking-tight whitespace-nowrap text-brand tabular-nums max-[380px]:text-[17px]">{call.number}</span>
              </a>
            </li>)}
          </ul>

          <p className="mt-3 hidden text-[12px] text-subtle pointer-fine:block">PC에서는 휴대전화로 위 번호를 눌러 걸어 주세요.</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px] font-semibold">
            <a href={SAFE182_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-0.5 text-brand hover:underline ${FOCUS}`}>안전Dream 온라인 제보 <ArrowUpRightIcon size={14} /></a>
            <a href={MISSING_CHILD_CENTER_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-0.5 text-brand hover:underline ${FOCUS}`}>실종아동전문기관 <ArrowUpRightIcon size={14} /></a>
            <Link href="/help" onClick={close} className={`ml-auto inline-flex items-center gap-0.5 text-muted hover:text-brand ${FOCUS}`}>제보 방법 자세히 <ArrowRightIcon size={14} /></Link>
          </div>

          <button type="button" onClick={() => setView("inquiry")} className={`mt-4 flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left transition-colors hover:bg-brand-soft/50 ${FOCUS}`}>
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-brand"><MessageIcon size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">서비스 문의하기</span>
              <span className="block text-[12.5px] text-muted">오류나 개선 의견을 개발팀에 보내요.</span>
            </span>
            <ArrowRightIcon size={16} className="shrink-0 text-muted" />
          </button>
        </>}
      </Modal>}
    </>
  );
}

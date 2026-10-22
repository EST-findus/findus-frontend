"use client";

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { INQUIRY_MAX, INQUIRY_TYPES, validateInquiry, type InquiryType } from "@/lib/inquiry";
import { CheckIcon } from "./Icons";

const FIELD = "w-full rounded-xl border border-line bg-card px-4 text-[15px] placeholder:text-subtle focus:border-brand focus:outline-none";
const LABEL = "text-[14px] font-bold";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** 개발자에게 보내는 서비스 문의. 실종 제보는 받지 않는다. */
export default function InquiryForm({ onDone }: { onDone?: () => void }) {
  const id = useId();
  const pathname = usePathname();
  const [type, setType] = useState<InquiryType>(INQUIRY_TYPES[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateInquiry({ type, message, email, agree });
    if (problem) { setError(problem); return; }
    setStatus("sending");
    setError(null);
    const response = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, email, agree, website, page: pathname }),
    }).catch(() => null);
    if (response?.ok) { setStatus("sent"); return; }
    const data = await response?.json().catch(() => null);
    setError(data?.error ?? "문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <div role="status" className="py-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"><CheckIcon size={24} strokeWidth={2.6} /></span>
        <p className="mt-4 text-[17px] font-bold">문의를 보냈어요.</p>
        <p className="mt-1 text-[14px] text-muted">{email ? "확인한 뒤 적어 주신 이메일로 답변드릴게요." : "보내 주신 의견은 서비스 개선에 참고할게요."}</p>
        {onDone && <button type="button" onClick={onDone} className={`mt-5 rounded-xl border border-line px-5 py-2.5 text-[14px] font-bold hover:border-brand hover:text-brand ${FOCUS}`}>돌아가기</button>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="rounded-xl bg-surface px-4 py-3 text-[13px] leading-relaxed break-keep text-muted">오류나 개선 의견을 FindUs 개발팀에 보내요. <strong className="text-ink">실종 제보는 이곳이 아닌 182·112로</strong> 해 주세요.</p>

      <fieldset>
        <legend className={LABEL}>문의 유형</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {INQUIRY_TYPES.map((item) => (
            <label key={item} className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${type === item ? "border-brand bg-brand text-white" : "border-line bg-card text-ink/75 hover:border-brand hover:text-brand"}`}>
              <input type="radio" name={`${id}-type`} value={item} checked={type === item} onChange={() => setType(item)} className="sr-only" />{item}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${id}-message`} className={LABEL}>내용</label>
          <span className="text-[12px] text-muted tabular-nums">{message.trim().length} / {INQUIRY_MAX}</span>
        </div>
        <textarea id={`${id}-message`} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={INQUIRY_MAX} rows={5} required
          placeholder="어떤 화면에서 무엇이 불편했는지 적어 주세요." className={`${FIELD} mt-2.5 resize-y py-3 leading-relaxed`} />
      </div>

      <div>
        <label htmlFor={`${id}-email`} className={LABEL}>답변 받을 이메일 <span className="font-semibold text-muted">(선택)</span></label>
        <input id={`${id}-email`} type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com" className={`${FIELD} mt-2.5 h-12`} />
        {email.trim() && (
          <label className="mt-3 flex items-start gap-2.5 text-[13px] leading-relaxed break-keep text-muted">
            <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
            <span>답변을 위해 이메일을 수집하는 데 동의해요. 답변 후 바로 지워요.</span>
          </label>
        )}
      </div>

      <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {error && <p role="alert" className="text-[14px] font-semibold text-gold-ink">{error}</p>}

      <div className="flex gap-2">
        {onDone && <button type="button" onClick={onDone} className={`h-12 rounded-xl border border-line px-5 text-[15px] font-bold hover:border-brand hover:text-brand ${FOCUS}`}>뒤로</button>}
        <button type="submit" disabled={status === "sending"} className={`h-12 flex-1 rounded-xl bg-brand text-[15px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60 ${FOCUS}`}>
          {status === "sending" ? "보내는 중…" : "문의 보내기"}
        </button>
      </div>
    </form>
  );
}

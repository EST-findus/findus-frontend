"use client";

import { useId, useRef, useState, useEffect } from "react";
import { HeartCheckIcon } from "./Icons";

const EXPLAIN = "실종아동의 가족(보호자)임을 FindUs가 아동권리보장원 실종아동전문센터를 통해 확인했어요. 확인에 쓴 서류는 보관하지 않고 파기했어요.";

/**
 * 가족 확인 배지. 누르면 어떻게 확인했는지 짧게 알려 준다.
 * label: 펀딩에서는 "가족이 함께해요", 계정에서는 "가족 확인됨"처럼 자리에 맞게 바꾼다.
 */
export default function FamilyBadge({ size = "sm", label = "가족이 함께해요", className = "", interactive = true }: { size?: "sm" | "md"; label?: string; className?: string; /** 링크 카드 안처럼 버튼을 둘 수 없는 곳에서는 false */ interactive?: boolean }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  const md = size === "md";
  const look = `inline-flex items-center gap-1 rounded-full border border-[#FFD9D2] bg-[#FDECEA] font-bold whitespace-nowrap text-[#B4473F] ${md ? "py-1 pr-3 pl-1.5 text-[13px]" : "py-0.5 pr-2 pl-1 text-[11px]"}`;
  if (!interactive) {
    return <span className={`${look} ${className}`}><HeartCheckIcon size={md ? 18 : 14} className="text-[#F28B82]" />{label}</span>;
  }
  return (
    <span ref={box} className={`relative inline-flex align-middle ${className}`}>
      <button type="button" aria-expanded={open} aria-describedby={open ? tipId : undefined} onClick={() => setOpen(!open)}
        className={`${look} transition-colors hover:bg-[#FFE3DE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}>
        <HeartCheckIcon size={md ? 18 : 14} className="text-[#F28B82]" />
        {label}
        <span className="sr-only">: 가족 확인됨. 설명 보기</span>
      </button>
      {open && (
        <span id={tipId} role="tooltip" className="absolute top-full left-0 z-30 mt-2 w-64 rounded-xl border border-line bg-white p-3 text-left text-[12px] leading-relaxed font-medium break-keep text-ink shadow-panel">
          {EXPLAIN}
        </span>
      )}
    </span>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";

// 모달 위에 모달(상세 → 공유)이 열릴 수 있어, Esc·Tab은 맨 위 모달만 처리한다.
const openStack: symbol[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  title: React.ReactNode;
  onClose: () => void;
  /** 닫힌 뒤 포커스를 돌려줄 요소. 없으면 열릴 때 포커스된 요소로 돌아간다. */
  returnFocusTo?: HTMLElement | null;
  children: React.ReactNode;
  mobileFullscreen?: boolean;
  mobileCompact?: boolean;
  size?: "default" | "wide" | "narrow";
  /** 작은 화면에서 아래에서 올라오는 시트로 연다 */
  mobileSheet?: boolean;
  accent?: "brand" | "gold";
  eyebrow?: string;
}

/**
 * 마운트되어 있는 동안 열린 상태다. 부모에서 조건부 렌더링으로 열고 닫는다.
 * 첫 포커스는 [data-autofocus] 요소, 없으면 첫 포커스 가능 요소.
 */
export default function Modal({ title, onClose, returnFocusTo, children, mobileFullscreen = false, mobileCompact = false, mobileSheet = false, size = "default", accent, eyebrow }: ModalProps) {
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const tokenRef = useRef(Symbol("modal"));

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const token = tokenRef.current;
    openStack.push(token);
    const restoreTarget = returnFocusTo ?? (document.activeElement as HTMLElement | null);

    const focusables = () => Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
    const initial = box.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? box;
    initial.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (openStack.at(-1) !== token) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !box.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !box.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openStack.splice(openStack.indexOf(token), 1);
      document.body.style.overflow = prevOverflow;
      if (restoreTarget?.isConnected) restoreTarget.focus();
    };
  }, [returnFocusTo]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex animate-fade-in items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px] motion-reduce:animate-none ${mobileCompact ? "max-md:p-0" : mobileFullscreen ? "max-sm:p-0" : mobileSheet ? "max-sm:items-end max-sm:p-0" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full animate-modal-in overflow-y-auto rounded-2xl border border-line bg-card p-7 shadow-modal outline-none motion-reduce:animate-none ${mobileCompact ? "max-md:flex max-md:h-dvh max-md:max-h-dvh max-md:flex-col max-md:overflow-hidden max-md:rounded-none max-md:border-0 max-md:p-0" : "max-sm:px-5"} ${size === "wide" ? "max-w-240" : size === "narrow" ? "max-w-110" : "max-w-170"} ${mobileFullscreen ? "max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0" : ""} ${mobileSheet ? "max-sm:max-h-[88dvh] max-sm:animate-sheet-in max-sm:motion-reduce:animate-none max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:px-5 max-sm:pt-8 max-sm:pb-[max(20px,env(safe-area-inset-bottom))]" : ""}`}
      >
        {mobileSheet && <span aria-hidden="true" className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-line sm:hidden" />}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className={`absolute top-5 right-5 ${mobileCompact ? "z-10 max-md:top-3 max-md:right-4" : ""} flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
        >
          <CloseIcon size={20} />
        </button>
        {eyebrow && <p className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${accent === "gold" ? "bg-gold-soft text-gold-ink" : "bg-brand-soft text-brand"}`}>{eyebrow}</p>}
        <h2 id={titleId} className={`mb-5 pr-10 text-[20px] font-extrabold tracking-[-0.3px] break-keep text-ink ${mobileCompact ? "max-md:mb-0 max-md:shrink-0 max-md:border-b max-md:border-line max-md:px-5 max-md:py-4 max-md:pr-16" : ""}`}>
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

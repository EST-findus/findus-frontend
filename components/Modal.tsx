"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  title: React.ReactNode;
  onClose: () => void;
  /** 닫힌 뒤 포커스를 돌려줄 요소. 없으면 열릴 때 포커스된 요소로 돌아간다. */
  returnFocusTo?: HTMLElement | null;
  children: React.ReactNode;
}

/**
 * 마운트되어 있는 동안 열린 상태다. 부모에서 조건부 렌더링으로 열고 닫는다.
 * 첫 포커스는 [data-autofocus] 요소, 없으면 첫 포커스 가능 요소.
 */
export default function Modal({ title, onClose, returnFocusTo, children }: ModalProps) {
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const restoreTarget = returnFocusTo ?? (document.activeElement as HTMLElement | null);

    const focusables = () => Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE));
    const initial = box.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? box;
    initial.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
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
      document.body.style.overflow = prevOverflow;
      if (restoreTarget?.isConnected) restoreTarget.focus();
    };
  }, [returnFocusTo]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex animate-fade-in items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px] motion-reduce:animate-none"
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
        className="relative max-h-[90vh] w-full max-w-170 animate-modal-in overflow-y-auto rounded-2xl border border-line bg-card p-7 shadow-modal outline-none motion-reduce:animate-none max-sm:px-5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-[22px] leading-none text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          ×
        </button>
        <h2 id={titleId} className="mb-5 pr-10 text-[20px] font-extrabold tracking-[-0.3px] break-keep">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

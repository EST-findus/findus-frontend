"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const TABS = ["소식·이야기", "제보·상담 안내", "AI 연구 안내"];

export default function CommunityTabs({ stories, guide, ai }: { stories: ReactNode; guide: ReactNode; ai: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = [stories, guide, ai];

  useEffect(() => {
    if (window.location.hash === "#ai") setSelected(2);
  }, []);

  return (
    <>
      <div className="border-b border-line">
        <div role="tablist" aria-label="정보 마당 분야" className="page-container flex max-w-5xl">
          {TABS.map((label, index) => (
            <button
              key={label}
              ref={(element) => { buttons.current[index] = element; }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                if (event.ctrlKey || event.metaKey || event.altKey) return;
                const next = event.key === "ArrowRight" ? (index + 1) % TABS.length
                  : event.key === "ArrowLeft" ? (index + TABS.length - 1) % TABS.length
                  : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : null;
                if (next === null) return;
                event.preventDefault();
                setSelected(next);
                buttons.current[next]?.focus();
              }}
              className={`flex flex-1 items-center justify-center border-b-2 px-3 py-3.5 text-[15px] font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand max-sm:px-1 max-sm:text-[13px] ${selected === index ? "border-brand text-brand" : "border-transparent text-muted hover:bg-surface hover:text-brand"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {panels.map((content, index) => (
        <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={selected !== index} tabIndex={0} className="focus-visible:outline-2 focus-visible:outline-brand">
          {content}
        </div>
      ))}
    </>
  );
}

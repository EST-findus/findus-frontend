"use client";

import { useInView } from "@/lib/useMotion";

const REVEAL = "opacity-0 [translate:0_22px] [transition:opacity_.7s_ease_var(--delay,0ms),translate_.8s_cubic-bezier(.2,.8,.2,1)_var(--delay,0ms)] data-[visible=true]:opacity-100 data-[visible=true]:[translate:0_0] motion-reduce:opacity-100 motion-reduce:[translate:none] motion-reduce:[transition:none]";

/** 화면에 들어오면 아래에서 떠오르며 나타난다. delay(ms)로 차례대로 보여줄 수 있다. */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" | "figure" }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  return (
    <Tag ref={ref as never} data-visible={inView} className={`${REVEAL} ${className}`} style={{ "--delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

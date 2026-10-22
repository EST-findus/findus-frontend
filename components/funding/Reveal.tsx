"use client";

import { useInView } from "@/lib/useMotion";
import styles from "./Funding.module.css";

/** 화면에 들어오면 아래에서 떠오르며 나타난다. delay(ms)로 차례대로 보여줄 수 있다. */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" | "figure" }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  return (
    <Tag ref={ref as never} data-visible={inView} className={`${styles.reveal} ${className}`} style={{ "--delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1100;

// Counts up to `value` once, the first time it scrolls into view. Later changes (a search, a filter)
// show the new number straight away, and reduced-motion viewers always see the final number.
export default function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (started.current || !element) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      started.current = true;
      setShown(0);
      setPhase("running");
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        setShown(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else setPhase("done");
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      if (started.current) setPhase("done");
    };
  }, [value]);

  return <span ref={ref}>{phase === "running" ? shown : value}</span>;
}

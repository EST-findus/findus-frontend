"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/** 동작 줄이기 설정. 서버에서는 애니메이션이 있는 쪽으로 그린다. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia(QUERY).matches, () => false);
}

/** 요소가 한 번이라도 화면에 들어오면 true. 다시 나가도 false로 돌아가지 않는다. */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

/**
 * 숫자를 from에서 to까지 부드럽게 올린다. start가 false인 동안은 from에 머문다.
 * 동작 줄이기를 켜면 바로 to를 보여준다.
 */
export function useCountUp(to: number, { start = true, from = 0, duration = 1400 }: { start?: boolean; from?: number; duration?: number } = {}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(from);
  const current = useRef(from);
  useEffect(() => {
    if (!start) return;
    if (reduced) { current.current = to; setValue(to); return; }
    const begin = current.current;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      current.current = begin + (to - begin) * eased;
      setValue(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, start, duration, reduced]);
  return reduced && start ? to : value;
}

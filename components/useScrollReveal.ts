"use client";

import { useEffect, useRef } from "react";

const SELECTOR = "[data-reveal], [data-reveal-items] > *";

// Marks `[data-reveal]` blocks, and each child of a `[data-reveal-items]` list, with data-revealed="in"
// as they scroll into view, so page CSS can fade them up. Blocks already on screen at load are marked
// "static" and stay put. Children added later (a new results page) are picked up and revealed in turn.
// Sets data-motion="on" on the root only when motion is allowed, so nothing is hidden without JavaScript.
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        if (element.parentElement?.hasAttribute("data-reveal-items")) element.style.setProperty("--reveal-delay", `${Math.min(order++, 6) * 70}ms`);
        element.dataset.revealed = "in";
        observer.unobserve(element);
      }
    }, { threshold: 0 });
    const track = (element: HTMLElement) => { if (!element.dataset.revealed) observer.observe(element); };
    for (const element of root.querySelectorAll<HTMLElement>(SELECTOR)) {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) element.dataset.revealed = "static";
      else track(element);
    }
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(SELECTOR)) track(node);
          node.querySelectorAll<HTMLElement>(SELECTOR).forEach(track);
        }
      }
    });
    mutations.observe(root, { childList: true, subtree: true });
    root.dataset.motion = "on";
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
  return ref;
}

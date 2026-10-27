import type { CSSProperties } from "react";

/** 사진 자리의 사람 실루엣. 불러오는 중(PhotoSkeleton)과 못 불러온 사진(StoredPhoto)이 같은 모양을 써서 자연스럽게 이어진다. */
export function PersonSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={`h-[78%] max-h-64 w-auto ${className}`}>
      <circle cx="50" cy="38" r="20" fill="currentColor" />
      <path d="M8 100c0-24 18.8-38 42-38s42 14 42 38Z" fill="currentColor" />
    </svg>
  );
}

// AI 사진 자리의 반짝이: 자리·크기·색·지연
const SPARKLES = [
  { style: { top: "14%", left: "16%", "--d": "0s" }, size: 16, tone: "text-brand/70" },
  { style: { top: "24%", right: "14%", "--d": ".6s" }, size: 11, tone: "text-coral" },
  { style: { top: "46%", left: "10%", "--d": "1.2s" }, size: 9, tone: "text-coral" },
  { style: { top: "40%", right: "20%", "--d": ".3s" }, size: 7, tone: "text-brand/60" },
];

/**
 * 사진을 받는 동안의 자리표시. 사람 실루엣이 숨 쉬듯 깜빡이고 빛 띠가 비스듬히 지나간다.
 * ai면 블루·코랄 톤 바탕에 반짝이가 차례로 빛난다. 작은 썸네일에서는 반짝이를 숨긴다.
 */
export default function PhotoSkeleton({ ai = false }: { ai?: boolean }) {
  return (
    <span aria-hidden="true" className={`@container absolute inset-0 flex items-end justify-center overflow-hidden bg-linear-to-b ${ai ? "from-brand-soft via-white to-coral-faint" : "from-surface to-brand-soft"}`}>
      <PersonSilhouette className={`motion-safe:animate-photo-breathe ${ai ? "text-brand/20" : "text-brand/25"}`} />
      <span className="absolute inset-y-0 left-0 hidden w-2/3 -skew-x-12 bg-linear-to-r from-transparent via-white/70 to-transparent motion-safe:block motion-safe:animate-photo-sweep" />
      {ai && SPARKLES.map(({ style, size, tone }) => (
        <svg key={style["--d"]} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={style as CSSProperties} className={`absolute ${tone} motion-safe:animate-photo-twinkle @max-[5rem]:hidden`}>
          <path d="M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0Z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

import type { CSSProperties } from "react";

// SVG 안의 하트·막대가 자기 상자 기준으로 변형되도록 한다.
const part = "[transform-box:fill-box]";

/**
 * FindUs 로고(LogoMark)가 움직이는 로딩 표시. 하트(i의 점)가 통통 뛰어오르고, 착지할 때 막대가 꾹 눌리며,
 * 타일은 살랑 흔들린다. 아래에 "로딩 중" 과 차례로 튀는 점 세 개를 둔다. 동작 줄이기 설정이면 멈춘 로고만 보인다.
 */
export default function CuteLoader({ size = 72, label = "로딩 중", className = "" }: { size?: number; label?: string; className?: string }) {
  const small = size < 48;
  return (
    <div role="status" aria-live="polite" className={`flex items-center ${small ? "gap-2.5" : "flex-col gap-4"} ${className}`}>
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true" focusable="false" className="overflow-visible motion-safe:animate-loader-wobble">
        {/* 타일은 반투명하게 깔아 하트·막대만 또렷하게 떠 보이게 한다 */}
        <rect width="72" height="72" rx="18" fill="#3978B8" fillOpacity="0.15" />
        <ellipse cx="36" cy="30.6" rx="6" ry="1.4" fill="#173B70" opacity="0.22" className={`${part} origin-center motion-safe:animate-loader-shadow`} />
        <rect x="31" y="32" width="10" height="26" rx="2" fill="#173B70" className={`${part} origin-bottom motion-safe:animate-loader-squish`} />
        <path d="M36 27.5S25.5 21.3 25.5 14.7C25.5 9.7 32.2 8.3 36 12.9 39.8 8.3 46.5 9.7 46.5 14.7 46.5 21.3 36 27.5 36 27.5z" fill="#F28B82" className={`${part} origin-bottom motion-safe:animate-loader-hop`} />
      </svg>
      <p className={`flex items-baseline font-bold text-navy ${small ? "text-[13px]" : "text-[15px]"}`}>
        {label}
        <span aria-hidden="true" className="ml-1 inline-flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[5px] rounded-full bg-coral motion-safe:animate-loader-dot" style={{ "--i": i } as CSSProperties} />
          ))}
        </span>
      </p>
    </div>
  );
}

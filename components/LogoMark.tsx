import { useId } from "react";

/** FindUs 심볼: 돋보기 안의 사람. public/images/findus-mark.svg와 같은 그림이다. */
export default function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="#22594a" />
      <defs>
        <clipPath id={clipId}>
          <circle cx="28" cy="28" r="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} fill="#e2b45c">
        <circle cx="28" cy="25" r="4.6" />
        <path d="M18.5 41c0-6 4.3-9.6 9.5-9.6s9.5 3.6 9.5 9.6z" />
      </g>
      <circle cx="28" cy="28" r="13.5" stroke="#fff" strokeWidth="5" />
      <path d="M38.5 38.5 47 47" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

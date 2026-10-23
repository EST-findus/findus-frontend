/** FindUs 심볼: 돋보기 안의 사람과 가족을 향한 마음을 담은 하트. */
export default function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M47 47 63 63" stroke="#3978B8" strokeWidth="9" strokeLinecap="round" />
      <circle cx="30" cy="30" r="24" stroke="#3978B8" strokeWidth="7" />
      <circle cx="30" cy="23" r="8" fill="#173B70" />
      <path d="M18 43c0-7 5.4-11 12-11s12 4 12 11v1a22 22 0 0 1-24 0z" fill="#173B70" />
      <path d="M30 46s-7-4.7-7-8.4c0-3.6 4.6-4.7 7-1.3 2.4-3.4 7-2.3 7 1.3C37 41.3 30 46 30 46z" fill="#F28B82" />
    </svg>
  );
}
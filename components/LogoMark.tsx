/** FindUs 심볼: 글자 로고의 하트 i를 떼어 낸 정사각형 타일. 파비콘·앱 아이콘(public/images/findus-mark.svg)과 같은 그림. */
export default function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true" focusable="false" className={className}>
      <rect width="72" height="72" rx="18" fill="#EAF2F9" />
      <rect x="31" y="32" width="10" height="26" rx="2" fill="#173B70" />
      <path d="M36 27.5S25.5 21.3 25.5 14.7C25.5 9.7 32.2 8.3 36 12.9 39.8 8.3 46.5 9.7 46.5 14.7 46.5 21.3 36 27.5 36 27.5z" fill="#F28B82" />
    </svg>
  );
}

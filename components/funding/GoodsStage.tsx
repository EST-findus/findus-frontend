import type { GoodsKind } from "@/lib/funding";
import styles from "./GoodsStage.module.css";

// 굿즈 일러스트. 원칙: 아이 얼굴은 넣지 않고 QR만 넣는다.
// 모든 굿즈를 항상 그려 두고 data-on으로 들어오고 나가는 전환을 준다.

const NAVY = "#173B70";
const BRAND = "#3978B8";
const CORAL = "#F28B82";

/** 장식용 QR 무늬 (실제로 읽히는 코드가 아님) */
function Qr({ x, y, size, color = NAVY }: { x: number; y: number; size: number; color?: string }) {
  const cell = size / 7;
  const bits = [
    "1110111", "1010101", "1110111", "0001000", "1011101", "0101010", "1110011",
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} rx={cell * 0.6} fill="#fff" />
      {bits.flatMap((row, r) => [...row].map((bit, c) => bit === "1" ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell + 0.2} height={cell + 0.2} fill={color} /> : null))}
    </g>
  );
}

function Keyring({ variant = "main" }: { variant?: "main" | "mini" }) {
  return (
    <g className={styles.swing}>
      <circle cx="0" cy="8" r="8" fill="none" stroke="#9AA9BC" strokeWidth="3" />
      <path d="M0 16v10" stroke="#9AA9BC" strokeWidth="3" />
      <rect x="-22" y="26" width="44" height="56" rx="11" fill={variant === "main" ? "#EAF2F9" : "#FDECEA"} stroke={variant === "main" ? BRAND : CORAL} strokeWidth="2.5" />
      <circle cx="0" cy="33" r="2.5" fill="#fff" stroke="#9AA9BC" />
      <Qr x={-14} y={42} size={28} color={variant === "main" ? NAVY : "#B4473F"} />
    </g>
  );
}

const TEE = "M50 0 L20 10 L0 50 L28 64 L36 50 L36 170 L134 170 L134 50 L142 64 L170 50 L150 10 L120 0 C112 16 58 16 50 0 Z";

function Tee({ fill = "#F7F9FC", shimmerId }: { fill?: string; shimmerId?: string }) {
  return (
    <g>
      <path d={TEE} fill={fill} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 0 C58 16 112 16 120 0" fill="none" stroke={NAVY} strokeWidth="2" />
      <Qr x={66} y={66} size={38} />
      {shimmerId && (
        <>
          <clipPath id={shimmerId}><rect x={66} y={66} width={38} height={38} /></clipPath>
          <g clipPath={`url(#${shimmerId})`}><rect className={styles.shimmer} x={40} y={60} width={14} height={60} fill="#fff" opacity=".75" transform="skewX(-20)" /></g>
        </>
      )}
      <text x="85" y="122" textAnchor="middle" fontSize="9" fontWeight="700" fill={BRAND}>반사 QR</text>
    </g>
  );
}

function Hoodie() {
  return (
    <g>
      <path d="M58 14 C56 -34 124 -34 122 14" fill="#DCE5F0" stroke={NAVY} strokeWidth="2.5" />
      <path d="M55 8 L18 22 L0 122 L26 128 L36 72 L36 182 L144 182 L144 72 L154 128 L180 122 L162 22 L125 8 C115 34 65 34 55 8 Z" fill="#E6EEF8" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M80 26 v26 M100 26 v26" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M58 128 H122 L130 162 H50 Z" fill="none" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
      <path className={styles.stitch} pathLength={1} d="M90 108 C78 100 70 92 70 84 a9 9 0 0 1 20 -5 a9 9 0 0 1 20 5 c0 8 -8 16 -20 24 Z" fill="none" stroke={CORAL} strokeWidth="2.6" strokeLinejoin="round" />
      <Qr x={146} y={86} size={20} />
    </g>
  );
}

function EcoBag() {
  return (
    <g>
      <path d="M28 4 C28 -62 62 -62 62 4 M88 4 C88 -62 122 -62 122 4" fill="none" stroke="#C9B79C" strokeWidth="7" strokeLinecap="round" />
      <rect x="0" y="0" width="150" height="180" rx="8" fill="#F3EDE3" stroke="#B9A385" strokeWidth="2.5" />
      <Qr x={62} y={64} size={56} />
      <text x="90" y="142" textAnchor="middle" fontSize="13" fontWeight="800" fill={NAVY}>Find<tspan fill={BRAND}>Us</tspan></text>
    </g>
  );
}

function ThanksCard() {
  return (
    <g transform="rotate(-6 46 62)">
      <rect width="92" height="124" rx="9" fill="#fff" stroke="#DCE5F0" strokeWidth="2.5" />
      <path d="M46 44 C36 38 30 32 30 26 a7.5 7.5 0 0 1 16 -4 a7.5 7.5 0 0 1 16 4 c0 6 -6 12 -16 18 Z" fill={CORAL} />
      <text x="46" y="66" textAnchor="middle" fontSize="11" fontWeight="800" fill={NAVY}>고맙습니다</text>
      <path d="M20 82 H72 M20 94 H64 M20 106 H56" stroke="#DCE5F0" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function NumberedCard() {
  return (
    <g transform="rotate(8 36 23)">
      <rect width="72" height="46" rx="7" fill={NAVY} />
      <text x="36" y="20" textAnchor="middle" fontSize="8" fontWeight="700" fill="#B9D9FC">LIMITED</text>
      <text x="36" y="35" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">No.017</text>
    </g>
  );
}

interface Props {
  kinds: GoodsKind[];
  /** 새로 들어온 굿즈. 들어올 때 살짝 튀어 오른다. */
  highlight?: GoodsKind[];
  label: string;
  className?: string;
  /** 리워드 카드처럼 작은 곳에서는 반짝임 등 반복 애니메이션을 끈다. */
  still?: boolean;
  idPrefix: string;
}

export default function GoodsStage({ kinds, highlight = [], label, className = "", still = false, idPrefix }: Props) {
  const on = (kind: GoodsKind) => kinds.includes(kind);
  const hasBag = on("ecobag");
  const crowded = on("hoodie") && on("tshirt");
  const part = (kind: GoodsKind, transform: string, child: React.ReactNode) => (
    <g className={styles.slot} style={{ transform }}>
      <g className={`${styles.goods} ${styles[kind]} ${highlight.includes(kind) ? styles.fresh : ""}`} data-on={on(kind)}>{child}</g>
    </g>
  );

  return (
    <svg viewBox="0 0 560 340" role="img" aria-label={label} className={`${styles.stage} ${still ? styles.still : ""} ${className}`}>
      <ellipse cx="280" cy="318" rx="250" ry="14" fill="#173B70" opacity=".07" />
      {part("card", "translate(30px, 182px)", <ThanksCard />)}
      {part("numbered", "translate(92px, 262px)", <NumberedCard />)}
      {part("ecobag", "translate(168px, 128px)", <EcoBag />)}
      {part("hoodie", "translate(352px, 120px)", <Hoodie />)}
      {part("tshirt", crowded ? "translate(300px, 196px) scale(.66)" : "translate(360px, 140px)", <Tee shimmerId={`${idPrefix}-shimmer`} />)}
      {part("extras", "translate(0px, 0px)", (
        <g>
          <g transform="translate(470 222) scale(.5)"><Tee fill="#FDECEA" /></g>
          <g transform="translate(70 22)"><Keyring variant="mini" /></g>
          <g transform="translate(118 36)"><Keyring variant="mini" /></g>
        </g>
      ))}
      {part("keyring", hasBag ? "translate(204px, 110px)" : "translate(262px, 70px) scale(1.5)", <Keyring />)}
    </svg>
  );
}

import Image from "next/image";
import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon } from "./Icons";
import styles from "./InfoPages.module.css";

const AGENCIES = [
  { href: SAFE182_URL, name: "경찰청 안전Dream", text: "공식 실종 정보 확인과 온라인 제보", logo: "/images/agencies/safety-dream.gif", width: 209, height: 36 },
  { href: MISSING_CHILD_CENTER_URL, name: "실종아동전문기관", text: "아동권리보장원 · 가족 찾기와 실종 가족 지원", logo: "/images/agencies/ncrc.png", width: 244, height: 24 },
];

export default function ServiceInfoContent() {
  return (
    <>
      <nav aria-label="공식 기관" className={styles.agencies}>
        {AGENCIES.map((agency) => (
          <a key={agency.href} href={agency.href} target="_blank" rel="noopener noreferrer" className={styles.agency}>
            <span className={styles.agencyLogo}><Image src={agency.logo} alt="" width={agency.width} height={agency.height} unoptimized /></span>
            <span className={styles.agencyText}><strong>{agency.name}</strong><span>{agency.text}</span></span>
            <ArrowUpRightIcon size={17} />
            <span className="sr-only">(새 창)</span>
          </a>
        ))}
      </nav>
      <div className={styles.calls}>
        {OFFICIAL_CALLS.map((call) => (
          <a key={call.tel} href={`tel:${call.tel}`} className={styles.call}>
            <span className={styles.callNumber}>{call.number}</span>
            <strong>{call.label}</strong>
            <span>{call.description}</span>
          </a>
        ))}
      </div>
      <p className={styles.finePrint}>아동 정보 자료 출처: 경찰청. 실종 신고·상담은 경찰청(112·182)을 이용해 주세요.<br />개인정보처리방침은 준비 중입니다. © 2026 FindUs</p>
    </>
  );
}

import Image from "next/image";
import type { CSSProperties } from "react";
import { MISSING_CHILD_CENTER_URL, OFFICIAL_CALLS, SAFE182_URL } from "@/lib/links";
import { ArrowUpRightIcon, PhoneIcon, ShieldIcon } from "./Icons";
import styles from "./InfoPages.module.css";

const AGENCIES = [
  { href: SAFE182_URL, name: "경찰청 안전Dream", text: "공식 실종 정보 확인과 온라인 제보", logo: "/images/agencies/safety-dream.gif", width: 209, height: 36 },
  { href: MISSING_CHILD_CENTER_URL, name: "실종아동전문기관", text: "아동권리보장원 · 가족 찾기와 실종 가족 지원", logo: "/images/agencies/ncrc.png", width: 244, height: 24 },
];

// 긴급 신고는 코랄, 실종아동 제보·상담은 공공 블루, 전문기관은 라이트 블루로 구분한다.
const CALL_TONE: Record<string, string> = { "112": "urgent", "182": "primary", "027770182": "soft" };

/** 공식 전화번호 세 개. 이용 안내의 공식 기관·정보 탭 맨 위에 크게 보여준다. */
export function OfficialCalls() {
  return (
    <ul className={styles.callGrid} aria-label="공식 신고·상담 전화">
      {OFFICIAL_CALLS.map((call, index) => (
        <li key={call.tel} className={styles.rise} style={{ "--d": `${0.08 + index * 0.06}s` } as CSSProperties}>
          <a href={`tel:${call.tel}`} className={styles.callCard} data-tone={CALL_TONE[call.tel]}>
            <span className={styles.callTop}>
              <span aria-hidden="true" className={styles.callIcon}><PhoneIcon size={18} strokeWidth={2} /></span>
              <span className={styles.callLabel}>{call.label}</span>
            </span>
            <strong className={styles.callNumber}>{call.number}</strong>
            <span className={styles.callText}>{call.description}</span>
            <span className={styles.callGo}>전화 걸기 <span aria-hidden="true">→</span></span>
          </a>
        </li>
      ))}
    </ul>
  );
}

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
      <p className={styles.infoNotice}><ShieldIcon size={16} strokeWidth={2} /><span><strong>FindUs는 제보를 직접 받지 않아요.</strong> 실종 신고와 목격 제보는 112·182 또는 안전Dream으로 해 주세요.</span></p>
      <p className={styles.finePrint}>아동 정보 자료 출처: 경찰청. 실종 신고·상담은 경찰청(112·182)을 이용해 주세요.<br />개인정보처리방침은 준비 중입니다. © 2026 FindUs</p>
    </>
  );
}

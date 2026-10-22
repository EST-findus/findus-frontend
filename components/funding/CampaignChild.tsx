import Link from "next/link";
import type { Campaign } from "@/lib/funding";
import { formatAge, formatDate } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon } from "../Icons";
import StoredPhoto from "../StoredPhoto";
import styles from "./FundingList.module.css";

// 펀딩이 함께 기억하는 아이의 공식 사진·정보. 사진은 실종아동 DB(경찰청 공개 사진)에서만 가져오고,
// 굿즈에는 쓰지 않는다. (굿즈에는 QR만: 문서 [03] 1-2 원칙 2)

/**
 * 아이의 첫 번째 공식 사진. DB에 없으면 이름 첫 글자로 자리를 채운다.
 * DB는 실종 당시 사진과 경찰이 공개한 나이 변환 사진을 구분하지 않아, 첫 장이 성인 얼굴일 수 있다.
 */
export function ChildPhoto({ campaign, child, sizes }: { campaign: Campaign; child: MissingPerson | null; sizes: string }) {
  const urls = child?.images?.map((image) => image.url) ?? [];
  return (
    <div className={styles.childPhoto}>
      {urls.length > 0 ? (
        <StoredPhoto urls={urls.slice(0, 1)} alt={`${campaign.child.name} 경찰청 공개 사진`} sizes={sizes} fit="cover" />
      ) : (
        <div className={styles.childPhotoEmpty} role="img" aria-label={`${campaign.child.name} 사진 없음`}>
          <span aria-hidden="true">{campaign.child.name.slice(0, 1)}</span>
        </div>
      )}
      {urls.length > 0 && <span className={styles.childPhotoCredit}>사진 출처: 경찰청</span>}
      {campaign.example && <span className={styles.exampleBadge}>예시 · 가족 동의 전</span>}
    </div>
  );
}

/** "실종 당시 4세 · 2000. 04. 04. · 중랑구 망우1동" */
export function childLine(child: MissingPerson | null): string | null {
  if (!child) return null;
  return [`실종 당시 ${formatAge(child.ageAtMissing)}`, formatDate(child.missingDate), child.missingLocation].filter((part) => part && part !== "정보 없음").join(" · ");
}

/** 상세 화면 상단의 "이 펀딩이 함께 기억하는 아이" 카드 */
export function ChildCard({ campaign, child }: { campaign: Campaign; child: MissingPerson | null }) {
  return (
    <div className={styles.childCard}>
      <ChildPhoto campaign={campaign} child={child} sizes="96px" />
      <div className={styles.childCardText}>
        <p className={styles.childCardEyebrow}>이 펀딩이 함께 기억하는 아이</p>
        <p className={styles.childCardName}>{campaign.child.name}{child && <span>현재 {formatAge(child.currentAge)}</span>}</p>
        {child ? <p className={styles.childCardLine}>{childLine(child)}</p> : <p className={styles.childCardLine}>실종 정보를 불러오지 못했어요.</p>}
        {child && <Link href={`/missing/${child.id}`} className={styles.childCardLink}>공식 실종 정보 보기 <ArrowRightIcon size={14} /></Link>}
      </div>
    </div>
  );
}

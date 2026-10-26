import Link from "next/link";
import type { Campaign } from "@/lib/funding";
import { formatAge, formatDate } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon } from "../Icons";
import StoredPhoto from "../StoredPhoto";

// 사진 틀·출처·예시 표시는 놓이는 자리(목록 카드의 액자, 상세 상단 카드)에 따라 크기가 다르다.
const PHOTO_LOOK = {
  frame: {
    root: "aspect-[3/4] rounded-[3px] [&_img]:[transition:transform_.6s_cubic-bezier(.2,.7,.2,1)] group-hover/card:[&_img]:[transform:scale(1.05)] motion-reduce:[&_img]:[transition:none] motion-reduce:group-hover/card:[&_img]:[transform:none]",
    credit: "right-1 bottom-1 rounded-[4px] px-[5px] py-px text-[9px]",
    badge: "hidden",
  },
  card: {
    root: "w-[84px] shrink-0 aspect-[3/4] rounded-[10px]",
    credit: "right-1 bottom-1 rounded-[6px] px-1 py-px text-[9px]",
    badge: "top-1 left-1 px-1.5 py-0.5 text-[9px]",
  },
} as const;

// 펀딩이 함께 기억하는 아이의 공식 사진·정보. 사진은 실종아동 DB(경찰청 공개 사진)에서만 가져오고,
// 굿즈에는 쓰지 않는다. (굿즈에는 QR만: 문서 [03] 1-2 원칙 2)

/**
 * 아이의 첫 번째 공식 사진. DB에 없으면 이름 첫 글자로 자리를 채운다.
 * DB는 실종 당시 사진과 경찰이 공개한 나이 변환 사진을 구분하지 않아, 첫 장이 성인 얼굴일 수 있다.
 */
export function ChildPhoto({ campaign, child, sizes, look }: { campaign: Campaign; child: MissingPerson | null; sizes: string; look: keyof typeof PHOTO_LOOK }) {
  const style = PHOTO_LOOK[look];
  const urls = child?.images?.map((image) => image.url) ?? [];
  return (
    <div className={`relative overflow-hidden bg-surface ${style.root}`}>
      {urls.length > 0 ? (
        <StoredPhoto urls={urls.slice(0, 1)} alt={`${campaign.child.name} 경찰청 공개 사진`} sizes={sizes} fit="cover" />
      ) : (
        <div className="flex size-full min-h-24 items-center justify-center bg-[linear-gradient(135deg,#EAF1FA,#F6F8FB)]" role="img" aria-label={`${campaign.child.name} 사진 없음`}>
          <span aria-hidden="true" className="text-[40px] font-extrabold text-[#9FB3CC]">{campaign.child.name.slice(0, 1)}</span>
        </div>
      )}
      {urls.length > 0 && <span className={`absolute bg-[rgb(23_33_48/62%)] font-semibold text-white ${style.credit}`}>사진 출처: 경찰청</span>}
      {campaign.example && <span className={`absolute rounded-full bg-[#FEF4F3] font-extrabold text-coral-ink shadow-[0_1px_3px_rgb(0_0_0/12%)] ${style.badge}`}>예시 · 가족 동의 전</span>}
    </div>
  );
}

/** "실종 당시 4세 · 2000. 04. 04. · 중랑구 망우1동" */
export function childLine(child: MissingPerson | null): string | null {
  if (!child) return null;
  return [`실종 당시 ${formatAge(child.ageAtMissing)}`, formatDate(child.missingDate), child.missingLocation].filter((part) => part && part !== "정보 없음").join(" · ");
}

const CHILD_CARD_LINE = "mt-0.5 text-[13px] leading-[1.5] break-keep text-muted";

/** 상세 화면 상단의 "이 펀딩이 함께 기억하는 아이" 카드 */
export function ChildCard({ campaign, child }: { campaign: Campaign; child: MissingPerson | null }) {
  return (
    <div className="mb-[18px] flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3">
      <ChildPhoto campaign={campaign} child={child} sizes="96px" look="card" />
      <div className="min-w-0">
        <p className="text-[12px] font-extrabold text-coral-ink">이 펀딩이 함께 기억하는 아이</p>
        <p className="mt-0.5 flex items-baseline gap-2 text-[20px] font-extrabold text-navy">{campaign.child.name}{child && <span className="text-[13px] font-bold text-muted">현재 {formatAge(child.currentAge)}</span>}</p>
        {child ? <p className={CHILD_CARD_LINE}>{childLine(child)}</p> : <p className={CHILD_CARD_LINE}>실종 정보를 불러오지 못했어요.</p>}
        {child && <Link href={`/missing/${child.id}`} className="mt-1.5 inline-flex items-center gap-0.5 text-[13px] font-bold text-brand hover:underline hover:underline-offset-[3px] focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">공식 실종 정보 보기 <ArrowRightIcon size={14} /></Link>}
      </div>
    </div>
  );
}

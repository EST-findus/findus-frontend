"use client";

import Link from "next/link";
import { campaignStatus, daysLeft, formatManWon, progressRate, type Campaign, type CampaignStatus } from "@/lib/funding";
import { useFunding } from "@/lib/useFunding";
import { useCampaignFamilies } from "@/lib/useFamily";
import FamilyBadge from "../FamilyBadge";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon, QrIcon, ShieldIcon } from "../Icons";
import { formatAge, formatDate } from "@/lib/format";
import { ChildPhoto } from "./CampaignChild";
import { FUNDING_TOKENS, footNote, refundBandLight, statusBadge, type StatusTone } from "./styles";

// 목록 페이지 톤: 홈·/search·정보 마당과 같은 느낌. 흰 바탕, 남색 글씨, 브랜드 블루 하나, 차가운 연한 면, 짧고 작은 움직임.
const GROUP = "page-container pt-8 pb-2";
const GROUP_TITLE = "flex items-center gap-2 text-[20px] font-extrabold tracking-[-.4px] text-navy";
const GROUP_COUNT = "rounded-full bg-[#EAF2F9] px-[9px] py-0.5 text-[13px] font-bold text-[#3978B8]";
// 카드는 차례로 떠오른다.
const GRID = "mt-[18px] grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 motion-safe:[&>li]:animate-funding-list-rise-card motion-safe:[&>li:nth-child(2)]:[animation-delay:.28s] motion-safe:[&>li:nth-child(3)]:[animation-delay:.36s] motion-safe:[&>li:nth-child(n+4)]:[animation-delay:.44s]";
// 머리말 줄들도 차례로 떠오른다.
const INTRO = "page-container pt-12 pb-2 max-sm:pt-8 motion-safe:[&>*]:animate-funding-list-rise motion-safe:[&>:nth-child(2)]:[animation-delay:.08s] motion-safe:[&>:nth-child(3)]:[animation-delay:.16s] motion-safe:[&>:nth-child(4)]:[animation-delay:.24s]";

const STATUS: Record<CampaignStatus, { badge: string; tone: StatusTone }> = {
  upcoming: { badge: "오픈 예정", tone: "soon" },
  open: { badge: "진행 중", tone: "live" },
  closing: { badge: "마감 임박", tone: "live" },
  success: { badge: "펀딩 성공", tone: "done" },
  failed: { badge: "펀딩 종료", tone: "fail" },
};

const dateOf = (iso: string) => iso.slice(0, 10).replaceAll("-", ". ") + ".";

/** 실종일부터 지금까지 지난 햇수. 날짜를 모르면 null */
function yearsWaiting(missingDate: string, now: Date): number | null {
  const date = new Date(missingDate);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / (365.2425 * 24 * 60 * 60 * 1000)));
}

/** 카드 윗부분: 경찰청 사진을 액자처럼 작게 두고, 옆에 실종 당시와 지금의 나이를 나란히 보여준다. */
function CardCover({ campaign, child, now }: { campaign: Campaign; child: MissingPerson | null; now: Date }) {
  const years = child ? yearsWaiting(child.missingDate, now) : null;
  return (
    <div className="relative flex items-center gap-[18px] overflow-hidden [background:radial-gradient(circle_at_88%_12%,rgb(230_138_120/10%),transparent_55%),radial-gradient(circle_at_8%_100%,rgb(57_120_184/8%),transparent_50%),#F4F8FD] px-[22px] pt-6 pb-[22px] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#E3EAF3] after:content-['']">
      <figure className="w-[clamp(118px,42%,168px)] shrink-0 rounded-[6px] bg-white px-[7px] pt-[7px] shadow-[0_1px_2px_rgb(37_48_59/10%),0_10px_22px_rgb(37_48_59/12%)] [rotate:-2.5deg] [transition:rotate_.35s_cubic-bezier(.2,.8,.2,1),translate_.35s_cubic-bezier(.2,.8,.2,1)] group-hover/card:[rotate:0deg] group-hover/card:[translate:0_-2px] motion-reduce:[transition:none] motion-reduce:group-hover/card:[translate:none]">
        <ChildPhoto campaign={campaign} child={child} sizes="180px" look="frame" />
        <figcaption className="px-0.5 pt-[7px] pb-2 text-center text-[13px] font-extrabold tracking-[.02em] text-navy">{campaign.child.name}</figcaption>
      </figure>
      {child && (
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <dl className="flex flex-col gap-2.5">
            <div><dt className={AGE_TERM}>실종 당시</dt><dd className={`${AGE_VALUE} text-navy`}>{formatAge(child.ageAtMissing)}</dd></div>
            <div className="relative border-t border-dashed border-[#C7D8EC] pt-2.5"><dt className={AGE_TERM}>지금은</dt><dd className={`${AGE_VALUE} text-coral-ink`}>{formatAge(child.currentAge)}</dd></div>
          </dl>
          {years !== null && years > 0 && <p className="self-start rounded-full border border-[rgb(57_120_184/12%)] bg-[rgb(255_255_255/80%)] px-2.5 py-1 text-[12px] font-extrabold text-[#25508F]">{years}년째 기다리는 중</p>}
        </div>
      )}
      {campaign.example && <span className="absolute top-2.5 right-2.5 rounded-full bg-[#FEF4F3] px-[9px] py-1 text-[11px] font-extrabold text-coral-ink shadow-[0_1px_3px_rgb(0_0_0/12%)]">예시 · 가족 동의 전</span>}
    </div>
  );
}

const AGE_TERM = "text-[12px] font-bold text-muted";
const AGE_VALUE = "mt-px text-[22px] font-extrabold tracking-[-.4px] tabular-nums";

function FundingCard({ campaign, child, now, approved }: { campaign: Campaign; child: MissingPerson | null; now: Date; approved: boolean }) {
  const funding = useFunding(campaign);
  const status = campaignStatus(campaign, funding.raised, now);
  const rate = progressRate(funding.raised, campaign.goal);
  const left = daysLeft(campaign.endsAt, now);
  const copy = STATUS[status];
  const line = child ? [formatDate(child.missingDate), child.missingLocation].filter((part) => part && part !== "정보 없음").join(" · ") : null;

  return (
    <li>
      <Link href={`/funding/${campaign.id}`} className="group/card flex h-full flex-col overflow-hidden rounded-[18px] border border-[#E3EAF3] bg-white shadow-[0_2px_8px_rgb(23_59_112/4%)] [transition:border-color_.25s_ease,box-shadow_.35s_ease,translate_.35s_cubic-bezier(.2,.7,.2,1)] hover:border-[#C9DAEE] hover:shadow-[0_18px_36px_rgb(23_59_112/10%)] hover:[translate:0_-4px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand motion-reduce:[transition:none] motion-reduce:hover:[translate:none]" aria-label={`${campaign.child.name}님을 기억하는 ${campaign.title}, ${copy.badge}${status === "upcoming" ? "" : `, ${rate}% 달성`}`}>
        <CardCover campaign={campaign} child={child} now={now} />
        <div className="flex flex-1 flex-col px-5 pt-[18px] pb-5">
          <p className={statusBadge(copy.tone)} data-tone={copy.tone}>
            {copy.badge}{status === "closing" && ` · D-${left}`}
          </p>
          <p className="mt-3 text-[13px] font-extrabold text-coral-ink">{campaign.child.name}님을 기억하는{approved && <FamilyBadge interactive={false} className="ml-1.5" />}</p>
          <h3 className="mt-1 text-[19px] leading-[1.4] font-extrabold tracking-[-.3px] break-keep text-navy">{campaign.title}</h3>
          {line && <p className="mt-1.5 text-[13px] leading-[1.55] break-keep text-muted">{line}</p>}
          <div className="relative mt-[18px] h-1.5 overflow-hidden rounded-full bg-[#E3EAF3]" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 origin-left rounded-[inherit] bg-[linear-gradient(90deg,var(--color-brand),#6A9BD0)] motion-safe:animate-funding-list-fill" style={{ width: `${Math.min(100, rate)}%` }} />
          </div>
          <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[13px] text-muted tabular-nums">
            {status === "upcoming" ? (
              <span>{dateOf(campaign.startsAt)} 오픈 · 목표 {formatManWon(campaign.goal)} 원</span>
            ) : (
              <>
                <strong className="text-[17px] font-extrabold text-coral">{rate.toLocaleString("ko-KR")}%</strong>
                <span>{formatManWon(funding.raised)} 원</span>
                <span>{funding.backers.toLocaleString("ko-KR")}명</span>
                <span className="ml-auto font-bold text-navy">{status === "open" || status === "closing" ? `${left}일 남음` : "마감"}</span>
              </>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function FundingList({ campaigns: all, childrenById, now }: { campaigns: Campaign[]; childrenById: Record<string, MissingPerson>; now: string }) {
  const date = new Date(now);
  const families = useCampaignFamilies();
  // 가족이 비공개를 요청한 펀딩은 목록에서 뺀다.
  const campaigns = all.filter((campaign) => !families[campaign.id]?.paused);
  // 지난 펀딩은 목표 달성 여부와 관계없이 마감일로 나눈다. (기준값만 보면 되므로 로컬 후원은 고려하지 않는다)
  const current = campaigns.filter((campaign) => date <= new Date(campaign.endsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = campaigns.filter((campaign) => date > new Date(campaign.endsAt)).sort((a, b) => b.endsAt.localeCompare(a.endsAt));
  const hasExample = campaigns.some((campaign) => campaign.example);

  return (
    <div className={`${FUNDING_TOKENS} bg-white`}>
      <p className={refundBandLight}><ShieldIcon size={16} /><span>모든 펀딩은 목표에 닿지 못하면 <strong>전액 환불</strong>해요</span></p>

      <header className={INTRO}>
        <p className="inline-flex items-center gap-2 rounded-full border border-[rgb(57_120_184/14%)] bg-[#F4F8FD] px-3 py-[5px] text-[12px] font-extrabold tracking-[.08em] text-[#3978B8]"><span aria-hidden="true" className="size-1.5 rounded-full bg-coral motion-safe:animate-funding-list-dot" />FINDUS REWARD FUNDING</p>
        <h1 className="mt-3.5 text-[36px] leading-[1.3] font-[850] tracking-[-1.1px] break-keep text-navy max-sm:text-[27px]">한 아이를 기억하는<br />QR 굿즈를 함께 만들어요</h1>
        <p className="mt-3.5 max-w-[620px] text-[16px] leading-[1.75] break-keep text-[#5C6F86] max-sm:text-[15px]">펀딩마다 함께 기억하는 아이가 있어요. 후원하면 키링·에코백·옷이 만들어지고, 그 위의 QR이 길 위에서 아이들의 얼굴을 다시 한 번 보게 합니다.</p>
        <p className="mt-[18px] inline-block rounded-xl border border-[#E7ECF2] bg-[#F9FAFC] px-[15px] py-2.5 text-[13px] leading-[1.5] break-keep text-navy"><QrIcon size={16} className="mr-1.5 inline-block align-[-3px] text-brand" />굿즈에는 아이 얼굴을 넣지 않고 <strong>QR만</strong> 넣어요. 얼굴은 이 페이지와 공식 실종 정보에서만 보여드려요.</p>
      </header>

      <section className={GROUP} aria-labelledby="funding-current">
        <h2 id="funding-current" className={GROUP_TITLE}>지금 함께할 수 있는 펀딩 <span className={GROUP_COUNT}>{current.length}</span></h2>
        {current.length > 0 ? (
          <ul className={GRID}>
            {current.map((campaign) => <FundingCard key={campaign.id} campaign={campaign} child={childrenById[campaign.id] ?? null} now={date} approved={!!families[campaign.id]?.approved} />)}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-[#D4E1F0] bg-[#F9FAFC] p-8 text-center text-muted">지금 열려 있는 펀딩이 없어요. 다음 펀딩을 준비하고 있어요.</p>
        )}
      </section>

      {past.length > 0 && (
        <section className={GROUP} aria-labelledby="funding-past">
          <h2 id="funding-past" className={GROUP_TITLE}>지난 펀딩 <span className={GROUP_COUNT}>{past.length}</span></h2>
          <ul className={GRID}>
            {past.map((campaign) => <FundingCard key={campaign.id} campaign={campaign} child={childrenById[campaign.id] ?? null} now={date} approved={!!families[campaign.id]?.approved} />)}
          </ul>
        </section>
      )}

      <p className={`page-container ${footNote}`}>
        결제 연동 전 데모 화면이에요. 모인 금액과 후원자 수는 예시 값에 이 브라우저에서 한 후원을 더한 값이에요.
        {hasExample && " ‘예시’ 표시가 붙은 펀딩은 화면 확인용으로 실제 실종아동 정보를 연결한 것이며, 가족 동의 전이라 개발 환경에서만 보여요."}{" "}
        <Link href="/">FindUs 소개 <ArrowRightIcon size={12} /></Link>
      </p>
    </div>
  );
}

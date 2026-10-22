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
import detail from "./Funding.module.css";
import styles from "./FundingList.module.css";

const STATUS: Record<CampaignStatus, { badge: string; tone: "live" | "soon" | "done" | "fail" }> = {
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
    <div className={styles.cardCover}>
      <figure className={styles.cardFrame}>
        <ChildPhoto campaign={campaign} child={child} sizes="180px" />
        <figcaption className={styles.cardFrameName}>{campaign.child.name}</figcaption>
      </figure>
      {child && (
        <div className={styles.cardAges}>
          <dl>
            <div><dt>실종 당시</dt><dd>{formatAge(child.ageAtMissing)}</dd></div>
            <div className={styles.cardAgesNow}><dt>지금은</dt><dd>{formatAge(child.currentAge)}</dd></div>
          </dl>
          {years !== null && years > 0 && <p className={styles.cardWaiting}>{years}년째 기다리는 중</p>}
        </div>
      )}
      {campaign.example && <span className={styles.cardExample}>예시 · 가족 동의 전</span>}
    </div>
  );
}

function FundingCard({ campaign, child, now, approved }: { campaign: Campaign; child: MissingPerson | null; now: Date; approved: boolean }) {
  const funding = useFunding(campaign);
  const status = campaignStatus(campaign, funding.raised, now);
  const rate = progressRate(funding.raised, campaign.goal);
  const left = daysLeft(campaign.endsAt, now);
  const copy = STATUS[status];
  const line = child ? [formatDate(child.missingDate), child.missingLocation].filter((part) => part && part !== "정보 없음").join(" · ") : null;

  return (
    <li>
      <Link href={`/funding/${campaign.id}`} className={styles.card} aria-label={`${campaign.child.name}님을 기억하는 ${campaign.title}, ${copy.badge}${status === "upcoming" ? "" : `, ${rate}% 달성`}`}>
        <CardCover campaign={campaign} child={child} now={now} />
        <div className={styles.cardBody}>
          <p className={detail.statusBadge} data-tone={copy.tone}>
            {copy.badge}{status === "closing" && ` · D-${left}`}
          </p>
          <p className={styles.cardChild}>{campaign.child.name}님을 기억하는{approved && <FamilyBadge interactive={false} className="ml-1.5" />}</p>
          <h3 className={styles.cardTitle}>{campaign.title}</h3>
          {line && <p className={styles.cardLine}>{line}</p>}
          <div className={styles.cardProgress} aria-hidden="true">
            <span style={{ width: `${Math.min(100, rate)}%` }} />
          </div>
          <p className={styles.cardStats}>
            {status === "upcoming" ? (
              <span>{dateOf(campaign.startsAt)} 오픈 · 목표 {formatManWon(campaign.goal)} 원</span>
            ) : (
              <>
                <strong>{rate.toLocaleString("ko-KR")}%</strong>
                <span>{formatManWon(funding.raised)} 원</span>
                <span>{funding.backers.toLocaleString("ko-KR")}명</span>
                <span className={styles.cardLeft}>{status === "open" || status === "closing" ? `${left}일 남음` : "마감"}</span>
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
    <div className={detail.page}>
      <p className={detail.refundBand}><ShieldIcon size={16} /><span>모든 펀딩은 목표에 닿지 못하면 <strong>전액 환불</strong>해요</span></p>

      <header className={`page-container ${styles.intro}`}>
        <p className={detail.eyebrow}>FINDUS REWARD FUNDING</p>
        <h1 className={styles.introTitle}>한 아이를 기억하는<br />QR 굿즈를 함께 만들어요</h1>
        <p className={styles.introLead}>펀딩마다 함께 기억하는 아이가 있어요. 후원하면 키링·에코백·옷이 만들어지고, 그 위의 QR이 길 위에서 아이들의 얼굴을 다시 한 번 보게 합니다.</p>
        <p className={styles.introNote}><QrIcon size={16} />굿즈에는 아이 얼굴을 넣지 않고 <strong>QR만</strong> 넣어요. 얼굴은 이 페이지와 공식 실종 정보에서만 보여드려요.</p>
      </header>

      <section className={`page-container ${styles.group}`} aria-labelledby="funding-current">
        <h2 id="funding-current" className={styles.groupTitle}>지금 함께할 수 있는 펀딩 <span>{current.length}</span></h2>
        {current.length > 0 ? (
          <ul className={styles.grid}>
            {current.map((campaign) => <FundingCard key={campaign.id} campaign={campaign} child={childrenById[campaign.id] ?? null} now={date} approved={!!families[campaign.id]?.approved} />)}
          </ul>
        ) : (
          <p className={styles.empty}>지금 열려 있는 펀딩이 없어요. 다음 펀딩을 준비하고 있어요.</p>
        )}
      </section>

      {past.length > 0 && (
        <section className={`page-container ${styles.group}`} aria-labelledby="funding-past">
          <h2 id="funding-past" className={styles.groupTitle}>지난 펀딩 <span>{past.length}</span></h2>
          <ul className={styles.grid}>
            {past.map((campaign) => <FundingCard key={campaign.id} campaign={campaign} child={childrenById[campaign.id] ?? null} now={date} approved={!!families[campaign.id]?.approved} />)}
          </ul>
        </section>
      )}

      <p className={`page-container ${detail.footNote}`}>
        결제 연동 전 데모 화면이에요. 모인 금액과 후원자 수는 예시 값에 이 브라우저에서 한 후원을 더한 값이에요.
        {hasExample && " ‘예시’ 표시가 붙은 펀딩은 화면 확인용으로 실제 실종아동 정보를 연결한 것이며, 가족 동의 전이라 개발 환경에서만 보여요."}{" "}
        <Link href="/about">FindUs 소개 <ArrowRightIcon size={12} /></Link>
      </p>
    </div>
  );
}

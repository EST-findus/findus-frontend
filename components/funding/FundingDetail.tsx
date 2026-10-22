"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAMPAIGN, CAMPAIGNS, campaignStatus, canBack as canBackIn, daysLeft, formatManWon, formatWon, nextGoal, progressRate, type Campaign, type CampaignStatus } from "@/lib/funding";
import { MOCK_WALL_NAMES, pledgeCampaignId } from "@/lib/fundingStore";
import type { MissingPerson } from "@/lib/types";
import { useFunding } from "@/lib/useFunding";
import { useCampaignFamilies } from "@/lib/useFamily";
import FamilyBadge from "../FamilyBadge";
import { useCountUp, useReducedMotion } from "@/lib/useMotion";
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, HeartIcon, PhoneIcon, ShareIcon, ShieldIcon } from "../Icons";
import PersonDetailBody from "../PersonDetailBody";
import { ChildCard } from "./CampaignChild";
import FundingStory from "./FundingStory";
import FundsFlow from "./FundsFlow";
import GoodsEvolution from "./GoodsEvolution";
import RewardCard from "./RewardCard";
import Reveal from "./Reveal";
import StretchGoalTrack from "./StretchGoalTrack";
import styles from "./Funding.module.css";
import listStyles from "./FundingList.module.css";

const TABS = [
  { id: "story", label: "이야기" },
  { id: "goods", label: "굿즈" },
  { id: "stretch", label: "스트레치 골" },
  { id: "rewards", label: "리워드" },
  { id: "plan", label: "일정·정책" },
  { id: "backers", label: "후원자" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const TAB_IDS: TabId[] = TABS.map((tab) => tab.id);

const STATUS_COPY: Record<CampaignStatus, { badge: string; tone: "live" | "soon" | "done" | "fail" }> = {
  upcoming: { badge: "오픈 예정", tone: "soon" },
  open: { badge: "펀딩 진행 중", tone: "live" },
  closing: { badge: "마감 임박", tone: "live" },
  success: { badge: "펀딩 성공", tone: "done" },
  failed: { badge: "펀딩 종료", tone: "fail" },
};

/** 넓은 화면에서는 리워드가 오른쪽에 붙어 따라오므로 스크롤 위치로 고르지 않는다. */
const SIDEBAR_QUERY = "(min-width: 64rem)";

/**
 * 앵커 탭. 지금 보고 있는 구역을 표시하고, 누르면 고정된 머리글·탭에 가리지 않게 그 구역으로 옮긴다.
 * - 기준선(탭 바로 아래)을 지난 마지막 구역을 현재 구역으로 본다. 좁은 화면은 리워드가 본문 사이에 끼므로 화면 순서로 비교한다.
 * - 맨 아래까지 내리면 마지막 구역이 기준선에 닿지 못해도 마지막 탭을 켠다.
 * - 탭을 누른 뒤 부드럽게 움직이는 동안에는 누른 탭을 유지하고, 사용자가 직접 스크롤하면 다시 위치로 계산한다.
 */
function useSectionTabs() {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<TabId>(TAB_IDS[0]);
  const locked = useRef(false);
  const reduced = useReducedMotion();

  const navBottom = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return 0;
    return (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight;
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (locked.current) return;
      const sidebar = window.matchMedia(SIDEBAR_QUERY).matches;
      const line = navBottom() + 24;
      const nodes = TAB_IDS.filter((id) => !(sidebar && id === "rewards"))
        .map((id) => document.getElementById(id))
        .filter((node): node is HTMLElement => !!node)
        .map((node) => ({ id: node.id as TabId, top: node.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top);
      if (!nodes.length) return;
      let current = nodes[0].id;
      for (const node of nodes) if (node.top <= line) current = node.id;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && window.scrollY > 0) current = nodes.at(-1)!.id;
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const release = () => {
      if (!locked.current) return;
      locked.current = false;
      schedule();
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const manual = ["wheel", "touchstart", "keydown"] as const;
    manual.forEach((type) => window.addEventListener(type, release, { passive: true }));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      manual.forEach((type) => window.removeEventListener(type, release));
    };
  }, [navBottom]);

  // 좁은 화면에서 탭 줄이 가로로 넘치면 켜진 탭이 보이도록 가운데로 옮긴다.
  useEffect(() => {
    const row = navRef.current?.firstElementChild as HTMLElement | null;
    const link = row?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    row.scrollBy({ left: linkBox.left - rowBox.left - (rowBox.width - linkBox.width) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const go = useCallback((event: React.MouseEvent, id: TabId) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    locked.current = true;
    setActive(id);
    const top = target.getBoundingClientRect().top + window.scrollY - navBottom() - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    // 움직이는 동안 위쪽 구역 높이가 바뀌면(굿즈 소개 애니메이션 등) 도착 위치가 어긋나므로, 멈춘 뒤 한 번 맞춘다.
    let corrected = false;
    const correct = () => {
      if (corrected || !locked.current) return;
      corrected = true;
      window.removeEventListener("scrollend", correct);
      const drift = target.getBoundingClientRect().top - navBottom() - 8;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (Math.abs(drift) > 2 && !(drift > 0 && atBottom)) window.scrollBy({ top: drift, behavior: "auto" });
    };
    window.addEventListener("scrollend", correct);
    window.setTimeout(correct, 1200);
    window.history.replaceState(window.history.state, "", `#${id}`);
    // 화면 읽기 프로그램과 키보드 사용자가 옮겨 간 곳에서 이어 읽도록 포커스도 옮긴다.
    target.focus({ preventScroll: true });
    // 넓은 화면의 리워드처럼 거의 움직이지 않는 구역은 잠깐 강조해 어디인지 알려준다.
    target.dataset.flash = "true";
    window.setTimeout(() => { delete target.dataset.flash; }, 1400);
  }, [navBottom, reduced]);

  return { navRef, active, go };
}

function ShareButton({ campaign }: { campaign: Campaign }) {
  const [status, setStatus] = useState("");
  const share = async () => {
    const url = window.location.href.split(/[?#]/)[0];
    const text = `${campaign.child.name}님을 기억하는 ${campaign.title} · FindUs 리워드 펀딩`;
    try {
      if (navigator.share) { await navigator.share({ title: text, url }); return; }
      await navigator.clipboard.writeText(url);
      setStatus("링크를 복사했어요");
    } catch {
      setStatus("");
    }
  };
  return (
    <button type="button" onClick={share} className={styles.secondaryButton}>
      <ShareIcon size={17} />공유<span className="sr-only" role="status">{status}</span>
      {status && <span aria-hidden="true" className={styles.shareToast}>{status}</span>}
    </button>
  );
}

/** 책자 기반 이야기가 없는 캠페인은 공식 실종 정보로 이야기 구역을 채운다. */
function ChildStory({ campaign, child }: { campaign: Campaign; child: MissingPerson | null }) {
  return (
    <section className={listStyles.childStory} aria-labelledby="child-story-title">
      <div className={`page-container ${styles.storyInner}`}>
        <Reveal><p className={styles.eyebrow}>REMEMBER</p></Reveal>
        <Reveal delay={80}><h2 id="child-story-title" className={listStyles.childStoryTitle}>{campaign.child.name}님을 찾습니다</h2></Reveal>
        <Reveal delay={160}><p className={listStyles.childStoryLead}>{campaign.subtitle} 아래는 경찰청에 공개된 실종 정보예요. 비슷한 사람을 봤다면 온라인에서 지목하지 말고 182로 직접 전해 주세요.</p></Reveal>
        <div className={listStyles.childStoryBody}>
          {child ? <PersonDetailBody person={child} /> : <p className="text-muted">실종 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
        </div>
        <div className={listStyles.childStoryCalls}>
          <a href="tel:182" className={styles.primaryButton}><PhoneIcon size={16} />실종 관련 제보 182</a>
          {child && <Link href={`/missing/${child.id}`} className={styles.secondaryButton}>공식 실종 정보 페이지 <ArrowRightIcon size={15} /></Link>}
        </div>
      </div>
    </section>
  );
}

interface Props {
  campaignId: string;
  child: MissingPerson | null;
  now: string;
  availableImages: string[];
  raisedOverride?: number;
}

export default function FundingDetail({ campaignId, child, now, availableImages, raisedOverride }: Props) {
  // 상세 주소는 서버에서 이미 확인했다. 예시 캠페인도 개발 환경에서는 열리므로 전체에서 찾는다.
  const campaign = CAMPAIGNS.find((item) => item.id === campaignId) ?? CAMPAIGN;
  const funding = useFunding(campaign);
  const raised = raisedOverride ?? funding.raised;
  const family = useCampaignFamilies()[campaign.id];
  const status = campaignStatus(campaign, raised, new Date(now));
  // 가족이 비공개를 요청하면 후원을 멈춘다.
  const canBack = canBackIn(status) && !family?.paused;
  const rate = progressRate(raised, campaign.goal);
  const left = daysLeft(campaign.endsAt, new Date(now));
  const next = nextGoal(raised, campaign);
  const shownRaised = useCountUp(raised, { duration: 1600 });
  const shownRate = useCountUp(rate, { duration: 1600 });
  const { navRef, active, go } = useSectionTabs();
  const copy = STATUS_COPY[status];
  const campaignPledges = funding.pledges.filter((pledge) => pledgeCampaignId(pledge) === campaign.id);
  const wall = [...campaignPledges.filter((pledge) => pledge.showOnWall && pledge.status === "paid").map((pledge) => pledge.name).reverse(), ...(campaign.baseBackers > 0 ? MOCK_WALL_NAMES : [])];
  const popular = Object.entries(funding.sold).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0];
  const childPhotoUrl = child?.images?.[0]?.url ?? null;

  const backLabel = status === "upcoming" ? "오픈 알림은 준비 중이에요" : status === "success" ? "펀딩이 끝났어요 · 제작 중" : status === "failed" ? "목표에 닿지 못해 전액 환불했어요" : "후원하기";
  const toRewards = (event: React.MouseEvent) => go(event, "rewards");
  const order = (value: number) => ({ "--order": value }) as React.CSSProperties;

  if (family?.paused) {
    return (
      <div className={`page-container ${styles.paused}`}>
        <ShieldIcon size={28} />
        <h1>가족의 요청으로 공개를 잠시 멈췄어요</h1>
        <p>이 펀딩은 아이 가족의 요청에 따라 지금은 볼 수 없어요. 이미 후원하셨다면 운영팀이 따로 연락드려요.</p>
        <Link href="/funding" className={styles.primaryButton}>다른 펀딩 보기</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.refundBand}><ShieldIcon size={16} /><span>목표 {formatManWon(campaign.goal)} 원에 닿지 못하면 <strong>전액 환불</strong>해요 · 결제는 바로 되고, 실패하면 마감 다음 날 일괄 취소해요</span></p>

      <div className="page-container">
        <Link href="/funding" className={styles.backLink}><ChevronLeftIcon size={16} />펀딩 목록</Link>
      </div>

      {/* 히어로 */}
      <section className={`page-container ${styles.hero}`} aria-labelledby="funding-title">
        <div className={styles.cover}>
          <Image src="/images/support-children-background.png" alt="" fill priority sizes="(min-width: 1024px) 640px, 100vw" />
          <div className={styles.coverShade} />
          <div className={styles.coverText}>
            <p>FindUs 리워드 펀딩 · {campaign.child.name}님을 기억하는</p>
            <h1 id="funding-title" className="text-white">{campaign.title}</h1>
            <span>{campaign.subtitle}</span>
          </div>
          <span className={styles.coverCredit}>AI로 제작한 캠페인 이미지</span>
        </div>

        <div className={styles.summary}>
          <ChildCard campaign={campaign} child={child} />
          {family?.approved && <FamilyBadge size="md" className={styles.familyBadge} />}
          <p className={styles.statusBadge} data-tone={copy.tone}>{copy.badge}{status === "closing" && ` · D-${left}`}</p>
          <p className={styles.summaryLabel}>모인 금액</p>
          <p className={styles.summaryAmount}>
            {Math.round(shownRaised).toLocaleString("ko-KR")}<small>원</small>
            <span className={styles.summaryRate}>{Math.round(shownRate)}%</span>
          </p>
          <div className={styles.progress} role="progressbar" aria-label="목표 달성률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(rate, 100)} aria-valuetext={`${rate}% 달성`}>
            <span style={{ width: `${Math.min(100, (shownRaised / campaign.goal) * 100)}%` }} />
          </div>
          <dl className={styles.summaryStats}>
            <div><dt>후원자</dt><dd>{funding.backers.toLocaleString("ko-KR")}<small>명</small></dd></div>
            <div><dt>{status === "upcoming" ? "오픈까지" : "남은 기간"}</dt><dd>{canBack ? <>{left}<small>일</small></> : status === "upcoming" ? <>{daysLeft(campaign.startsAt, new Date(now))}<small>일</small></> : "마감"}</dd></div>
            <div><dt>목표 금액</dt><dd>{formatManWon(campaign.goal)}<small>원</small></dd></div>
          </dl>
          {raised >= campaign.goal && <p className={styles.successNote}><CheckIcon size={16} strokeWidth={2.4} />목표를 넘어 펀딩 성공이 확정됐어요</p>}
          {next && canBack && (
            <p className={styles.nextGoal}>다음 스트레치 골 <strong>{formatManWon(next.amount)} 원</strong>까지 {formatWon(next.amount - raised)} · {next.title}</p>
          )}
          <div className={styles.summaryActions}>
            {canBack ? <a href="#rewards" onClick={toRewards} className={styles.primaryButton}><HeartIcon size={18} />후원하기</a> : <p className={styles.closedButton}>{backLabel}</p>}
            <ShareButton campaign={campaign} />
          </div>
          <p className={styles.summaryNote}>펀딩 기간 {campaign.startsAt.slice(0, 10).replaceAll("-", ". ")}. ~ {campaign.endsAt.slice(0, 10).replaceAll("-", ". ")}. · {campaign.deliveryNote}</p>
        </div>
      </section>

      {/* 앵커 탭 */}
      <nav ref={navRef} className={styles.tabs} aria-label="펀딩 내용">
        <div className="page-container">
          {TABS.map((tab) => (
            <a key={tab.id} href={`#${tab.id}`} onClick={(event) => go(event, tab.id)} aria-current={active === tab.id ? "location" : undefined}>{tab.label}</a>
          ))}
        </div>
      </nav>

      {/* 이야기: 아이 정보 구역에는 리워드·기업 정보를 두지 않는다. */}
      <div id="story" tabIndex={-1} className={styles.anchor}>
        {family?.approved && family.message && (
          <section className={styles.familyWord} aria-labelledby="family-word-title">
            <div className="page-container">
              <Reveal>
                <p id="family-word-title" className={styles.familyWordLabel}><FamilyBadge label="가족의 한마디" /></p>
                <blockquote>{family.message}</blockquote>
                <p className={styles.familyWordFrom}>— {campaign.child.name}님의 가족</p>
              </Reveal>
            </div>
          </section>
        )}
        {campaign.hasStory ? <FundingStory availableImages={availableImages} childPhotoUrl={childPhotoUrl} /> : <ChildStory campaign={campaign} child={child} />}
      </div>

      <div className={`page-container ${styles.body}`}>
        <div className={styles.main}>
          <section id="goods" tabIndex={-1} style={order(1)} className={`${styles.section} ${styles.anchor}`} aria-labelledby="goods-title">
            <Reveal><p className={styles.eyebrow}>MY REWARD</p></Reveal>
            <Reveal delay={80}><h2 id="goods-title" className={styles.sectionTitle}>후원 금액이 커질수록<br />기억을 들고 다니는 굿즈가 늘어나요</h2></Reveal>
            <Reveal delay={160}><p className={styles.sectionLead}>금액을 움직여 보세요. 굿즈에는 {campaign.child.name}님의 얼굴 대신 <strong>QR만</strong> 들어갑니다. QR은 항상 최신 장기 실종아동 목록으로 연결돼요.</p></Reveal>
            <GoodsEvolution campaign={campaign} raised={raised} canBack={canBack} />
          </section>

          <section id="stretch" tabIndex={-1} style={order(2)} className={`${styles.section} ${styles.anchor}`} aria-labelledby="stretch-title">
            <Reveal><p className={styles.eyebrow}>TOGETHER</p></Reveal>
            <Reveal delay={80}><h2 id="stretch-title" className={styles.sectionTitle}>다 같이 모일수록<br />모든 후원자의 굿즈가 좋아져요</h2></Reveal>
            <Reveal delay={160}><p className={styles.sectionLead}>스트레치 골을 넘을 때마다 보너스가 열려요. 골을 눌러 무엇이 달라지는지 확인해 보세요.</p></Reveal>
            <StretchGoalTrack campaign={campaign} raised={raised} />
          </section>

          <section style={order(4)} className={styles.section} aria-labelledby="why-title">
            <Reveal><p className={styles.eyebrow}>WHY QR</p></Reveal>
            <Reveal delay={80}><h2 id="why-title" className={styles.sectionTitle}>왜 굿즈에 얼굴 대신<br />QR만 넣나요</h2></Reveal>
            <div className={styles.why}>
              {[
                ["회수할 수 없는 사진", "옷에 인쇄한 사진은 아이가 발견돼도 거둬들일 수 없어요. 가족 동의와 초상권 문제도 생겨요."],
                ["항상 최신 목록", "QR은 FindUs의 최신 장기 실종아동 목록으로 연결돼요. 발견된 아이는 목록에서 빠져요."],
                ["몇 년 동안 길 위에", "키링·에코백·옷은 오래 쓰여요. 그만큼 오래, 많은 사람에게 한 번 더 보게 해요."],
              ].map(([title, text], index) => (
                <Reveal key={title} delay={index * 120} className={styles.whyItem}><strong>{title}</strong><p>{text}</p></Reveal>
              ))}
            </div>
            <FundsFlow campaign={campaign} raised={raised} />
          </section>

          <section id="plan" tabIndex={-1} style={order(5)} className={`${styles.section} ${styles.anchor}`} aria-labelledby="plan-title">
            <Reveal><p className={styles.eyebrow}>SCHEDULE · POLICY</p></Reveal>
            <Reveal delay={80}><h2 id="plan-title" className={styles.sectionTitle}>일정과 환불 정책</h2></Reveal>
            <ol className={styles.schedule}>
              {[
                ["펀딩 마감", campaign.endsAt.slice(5, 10).replace("-", "월 ").replace(/^0/, "") + "일"],
                ["성공 확정 · 제작 주문", "마감 후 3일"],
                ["제작", "약 3주"],
                ["배송", "약 1주"],
                ["결과 · 사용 내역 공개", "배송 후 3일"],
              ].map(([title, when], index) => (
                <Reveal as="li" key={title} delay={index * 120}><strong>{title}</strong><span>{when}</span></Reveal>
              ))}
            </ol>
            <dl className={styles.policy}>
              <div><dt>목표 미달 시</dt><dd>마감 다음 날 모든 결제를 일괄 취소하고 이메일·문자로 알려드려요.</dd></div>
              <div><dt>마감 전 취소</dt><dd>마감 전까지는 언제든 전액 취소할 수 있어요. 로그인했다면 마이페이지 &gt; 내 후원에서 바로 취소해요.</dd></div>
              <div><dt>마감 후 취소</dt><dd>주문 제작 상품이라 마감 후에는 단순 변심 취소가 어려워요. 후원할 때 따로 안내하고 동의를 받아요.</dd></div>
              <div><dt>불량 · 오배송</dt><dd>받은 날부터 7일 안에 알려 주시면 교환하거나 환불해요.</dd></div>
              <div><dt>개인정보</dt><dd>배송에 필요한 만큼만 받고, 배송이 끝나면 파기해요.</dd></div>
            </dl>
          </section>

          <section id="backers" tabIndex={-1} style={order(6)} className={`${styles.section} ${styles.anchor}`} aria-labelledby="backers-title">
            <Reveal><p className={styles.eyebrow}>BACKERS</p></Reveal>
            <Reveal delay={80}><h2 id="backers-title" className={styles.sectionTitle}>{funding.backers > 0 ? `${funding.backers.toLocaleString("ko-KR")}명이 함께 기억하고 있어요` : "첫 후원자를 기다리고 있어요"}</h2></Reveal>
            {wall.length > 0 && (
              <>
                <p className="sr-only">이름 공개에 동의한 후원자: {wall.slice(0, 12).join(", ")} 외</p>
                <div className={styles.wall} aria-hidden="true">
                  {[0, 1].map((row) => {
                    const names = wall.filter((_, index) => index % 2 === row);
                    return (
                      <div key={row} className={styles.wallRow} data-reverse={row === 1}>
                        {names.map((name, index) => <span key={`a-${index}`}>{name}</span>)}
                        {names.map((name, index) => <span key={`b-${index}`} data-copy="true">{name}</span>)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        <aside id="rewards" tabIndex={-1} className={`${styles.aside} ${styles.anchor}`} aria-labelledby="rewards-title">
          <div className={styles.asideInner}>
            <h2 id="rewards-title" className={styles.asideTitle}>리워드 선택</h2>
            <p className={styles.asideLead}>한 번에 한 가지만 고를 수 있어요. 더 원하면 한 번 더 후원해 주세요.</p>
            <div className={styles.rewardList}>
              {campaign.tiers.map((tier) => <RewardCard key={tier.id} campaign={campaign} tier={tier} sold={funding.sold[tier.id] ?? 0} canBack={canBack} popular={tier.id === popular} />)}
              <div className={styles.reward} data-disabled="true">
                <p className={styles.rewardPrice}>별도 견적</p>
                <h3 className={styles.rewardTitle}>기업 단체 세트</h3>
                <p className={styles.rewardMetaText}>50세트부터 임직원 프로그램과 묶어 제안해요. 기업 후원 문의 창구는 준비 중이에요.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {canBack && (
        <div className={styles.mobileBar}>
          <p><strong>{rate}%</strong> 달성 · {left}일 남음</p>
          <a href="#rewards" onClick={toRewards} className={styles.primaryButton}>후원하기 <ArrowRightIcon size={16} /></a>
        </div>
      )}
      <p className={`page-container ${styles.footNote}`}>
        결제 연동 전 데모 화면이에요. 모인 금액과 후원자 수는 예시 값에 이 브라우저에서 한 후원을 더한 값이에요.
        {campaign.example && " 이 펀딩은 화면 확인용 예시로, 실제 실종아동 정보를 연결했지만 가족 동의 전이라 개발 환경에서만 보여요."}{" "}
        <Link href="/about">FindUs 소개</Link>
      </p>
    </div>
  );
}

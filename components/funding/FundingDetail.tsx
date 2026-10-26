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
import { FUNDING_PAGE, PRIMARY_BUTTON_BASE, eyebrow, footNote, primaryButton, refundBand, reward, rewardMetaText, rewardPrice, rewardTitle, secondaryButton, statusBadge, storyInner, type StatusTone } from "./styles";

// 머리글 64px + 탭 줄 높이만큼 비워 둔다. 탭을 누르면 스크립트가 같은 값으로 옮긴다(주소로 바로 들어올 때 대비).
// 탭으로 옮겨 간 구역은 data-flash 동안 잠깐 강조한다.
const ANCHOR = "scroll-mt-[128px] focus:outline-none motion-safe:[&[data-flash=true]>h2:first-of-type]:animate-funding-flash";
const SECTION = "border-t border-line py-14 first:border-t-0 first:pt-10";
const SECTION_TITLE = "mt-2 text-[28px] leading-[1.35] font-extrabold tracking-[-.6px] break-keep max-sm:text-[23px]";
const SECTION_LEAD = "mt-3 text-[15px] leading-[1.75] break-keep text-muted";
const TAB = "relative shrink-0 px-3.5 py-[15px] text-[15px] font-bold whitespace-nowrap text-muted [transition:color_.2s] after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:rounded-t-[3px] after:bg-navy after:[transform:scaleX(0)] after:[transition:transform_.3s_ease] after:content-[''] hover:text-navy focus-visible:rounded-[8px] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand aria-[current=location]:text-navy aria-[current=location]:after:[transform:scaleX(1)]";
const SUMMARY_STATS = "mt-[22px] grid grid-cols-[repeat(3,1fr)] border-y border-line py-4 [&_dd]:mt-1 [&_dd]:text-[21px] [&_dd]:font-extrabold [&_dd]:text-ink [&_dd]:tabular-nums [&_dt]:text-[13px] [&_dt]:text-muted [&_small]:ml-px [&_small]:text-[14px] [&_small]:font-bold [&>div+div]:border-l [&>div+div]:border-line [&>div+div]:pl-4";
const SCHEDULE_ITEM = "relative pt-[22px] pr-2.5 before:absolute before:inset-x-0 before:top-1 before:h-0.5 before:bg-line before:content-[''] after:absolute after:top-0 after:left-0 after:size-2.5 after:rounded-full after:bg-brand after:content-[''] first:after:bg-coral first:after:shadow-[0_0_0_5px_rgb(242_139_130/20%)] max-md:pt-0 max-md:pr-0 max-md:pb-[18px] max-md:pl-6 max-md:before:top-0 max-md:before:right-auto max-md:before:bottom-0 max-md:before:left-1 max-md:before:h-auto max-md:before:w-0.5";
const POLICY = "mt-8 border-t border-line [&_dd]:break-keep [&_dd]:text-muted [&_dt]:font-extrabold [&>div]:grid [&>div]:grid-cols-[140px_minmax(0,1fr)] [&>div]:gap-4 [&>div]:border-b [&>div]:border-line [&>div]:py-3.5 [&>div]:text-[14px] [&>div]:leading-[1.7] max-md:[&>div]:grid-cols-1 max-md:[&>div]:gap-1";
const WALL_NAME = "rounded-full border px-[15px] py-[9px] text-[14px] font-semibold whitespace-nowrap text-ink motion-reduce:data-[copy=true]:hidden";
/** 후원자 이름표 색. CSS의 :nth-child(3n+1)·(5n+2)와 같은 순서로 고른다(겹치면 5n+2가 이긴다). */
const wallTone = (position: number) => position % 5 === 1 ? "border-transparent bg-coral-soft" : position % 3 === 0 ? "border-transparent bg-brand-soft" : "border-line bg-white";

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

const STATUS_COPY: Record<CampaignStatus, { badge: string; tone: StatusTone }> = {
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
    <button type="button" onClick={share} className={secondaryButton}>
      <ShareIcon size={17} />공유<span className="sr-only" role="status">{status}</span>
      {status && <span aria-hidden="true" className="absolute bottom-[calc(100%+8px)] left-1/2 rounded-[8px] bg-navy px-2.5 py-1.5 text-[12px] whitespace-nowrap text-white [translate:-50%_0] motion-safe:animate-funding-toast">{status}</span>}
    </button>
  );
}

/** 책자 기반 이야기가 없는 캠페인은 공식 실종 정보로 이야기 구역을 채운다. */
function ChildStory({ campaign, child }: { campaign: Campaign; child: MissingPerson | null }) {
  return (
    <section className="bg-(--story-paper) py-14" aria-labelledby="child-story-title">
      <div className={`page-container ${storyInner}`}>
        <Reveal><p className={eyebrow}>REMEMBER</p></Reveal>
        <Reveal delay={80}><h2 id="child-story-title" className={SECTION_TITLE}>{campaign.child.name}님을 찾습니다</h2></Reveal>
        <Reveal delay={160}><p className="mt-3 max-w-[640px] text-[15px] leading-[1.75] break-keep text-muted">{campaign.subtitle} 아래는 경찰청에 공개된 실종 정보예요. 비슷한 사람을 봤다면 온라인에서 지목하지 말고 182로 직접 전해 주세요.</p></Reveal>
        <div className="mt-7 rounded-[18px] bg-white p-5">
          {child ? <PersonDetailBody person={child} /> : <p className="text-muted">실종 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a href="tel:182" className={primaryButton}><PhoneIcon size={16} />실종 관련 제보 182</a>
          {child && <Link href={`/missing/${child.id}`} className={secondaryButton}>공식 실종 정보 페이지 <ArrowRightIcon size={15} /></Link>}
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
      <div className="page-container flex flex-col items-center gap-3.5 py-[110px] text-center text-muted">
        <ShieldIcon size={28} />
        <h1 className="text-[24px] font-extrabold text-navy">가족의 요청으로 공개를 잠시 멈췄어요</h1>
        <p className="max-w-[28rem] leading-[1.7] break-keep">이 펀딩은 아이 가족의 요청에 따라 지금은 볼 수 없어요. 이미 후원하셨다면 운영팀이 따로 연락드려요.</p>
        <Link href="/funding" className={primaryButton}>다른 펀딩 보기</Link>
      </div>
    );
  }

  return (
    <div className={FUNDING_PAGE}>
      <p className={refundBand}><ShieldIcon size={16} /><span>목표 {formatManWon(campaign.goal)} 원에 닿지 못하면 <strong>전액 환불</strong>해요 · 결제는 바로 되고, 실패하면 마감 다음 날 일괄 취소해요</span></p>

      <div className="page-container">
        <Link href="/funding" className="mt-5 inline-flex items-center gap-0.5 text-[14px] font-bold text-muted hover:text-brand focus-visible:rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><ChevronLeftIcon size={16} />펀딩 목록</Link>
      </div>

      {/* 히어로 */}
      <section className="page-container grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-10 pt-4 pb-10 max-lg:grid-cols-1 max-lg:gap-6" aria-labelledby="funding-title">
        <div className="relative min-h-[420px] overflow-hidden rounded-[20px] bg-navy max-lg:min-h-[300px]">
          <Image src="/images/support-children-background.png" alt="" fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover object-[center_55%] [transform:scale(1.06)] motion-safe:animate-funding-cover-in motion-reduce:[transform:none]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_59_112/5%)_30%,rgb(23_59_112/88%))]" />
          <div className="absolute inset-x-7 bottom-[30px] text-white">
            <p className="text-[13px] font-bold text-[#B9D9FC]">FindUs 리워드 펀딩 · {campaign.child.name}님을 기억하는</p>
            <h1 id="funding-title" className="mt-2 text-[34px] leading-[1.3] font-extrabold tracking-[-.8px] break-keep text-white max-sm:text-[26px]">{campaign.title}</h1>
            <span className="mt-2.5 block max-w-[440px] text-[15px] leading-[1.65] break-keep text-[#DCE8F6]">{campaign.subtitle}</span>
          </div>
          <span className="absolute top-3 right-3.5 text-[10px] text-white opacity-80">AI로 제작한 캠페인 이미지</span>
        </div>

        <div className="flex flex-col self-center">
          <ChildCard campaign={campaign} child={child} />
          {family?.approved && <FamilyBadge size="md" className="mt-2.5 self-start" />}
          <p className={statusBadge(copy.tone)} data-tone={copy.tone}>{copy.badge}{status === "closing" && ` · D-${left}`}</p>
          <p className="mt-[18px] text-[14px] font-semibold text-muted">모인 금액</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[40px] font-extrabold tracking-[-1px] text-navy tabular-nums max-sm:text-[32px]">
            {Math.round(shownRaised).toLocaleString("ko-KR")}<small className="text-[20px] font-bold">원</small>
            <span className="ml-1.5 text-[24px] text-coral">{Math.round(shownRate)}%</span>
          </p>
          <div className="relative mt-3.5 h-2.5 overflow-hidden rounded-full bg-[#E3EAF3]" role="progressbar" aria-label="목표 달성률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(rate, 100)} aria-valuetext={`${rate}% 달성`}>
            <span className="absolute inset-y-0 left-0 rounded-[inherit] bg-[linear-gradient(90deg,var(--color-brand),#6A9BD0)]" style={{ width: `${Math.min(100, (shownRaised / campaign.goal) * 100)}%` }} />
          </div>
          <dl className={SUMMARY_STATS}>
            <div><dt>후원자</dt><dd>{funding.backers.toLocaleString("ko-KR")}<small>명</small></dd></div>
            <div><dt>{status === "upcoming" ? "오픈까지" : "남은 기간"}</dt><dd>{canBack ? <>{left}<small>일</small></> : status === "upcoming" ? <>{daysLeft(campaign.startsAt, new Date(now))}<small>일</small></> : "마감"}</dd></div>
            <div><dt>목표 금액</dt><dd>{formatManWon(campaign.goal)}<small>원</small></dd></div>
          </dl>
          {raised >= campaign.goal && <p className="mt-3.5 flex items-center gap-1.5 text-[14px] font-bold text-[#1D6B43]"><CheckIcon size={16} strokeWidth={2.4} />목표를 넘어 펀딩 성공이 확정됐어요</p>}
          {next && canBack && (
            <p className="mt-2.5 rounded-[10px] bg-brand-soft px-3.5 py-[11px] text-[13px] leading-[1.6] break-keep text-navy">다음 스트레치 골 <strong>{formatManWon(next.amount)} 원</strong>까지 {formatWon(next.amount - raised)} · {next.title}</p>
          )}
          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2.5">
            {canBack ? <a href="#rewards" onClick={toRewards} className={primaryButton}><HeartIcon size={18} />후원하기</a> : <p className="flex min-h-12 items-center justify-center rounded-xl bg-[#EEF1F5] px-4 text-center text-[14px] font-bold text-muted">{backLabel}</p>}
            <ShareButton campaign={campaign} />
          </div>
          <p className="mt-3 text-[12px] text-subtle">펀딩 기간 {campaign.startsAt.slice(0, 10).replaceAll("-", ". ")}. ~ {campaign.endsAt.slice(0, 10).replaceAll("-", ". ")}. · {campaign.deliveryNote}</p>
        </div>
      </section>

      {/* 앵커 탭 */}
      <nav ref={navRef} className="sticky top-16 z-40 border-y border-line bg-[rgb(255_255_255/94%)] backdrop-blur-[8px]" aria-label="펀딩 내용">
        <div className="page-container flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <a key={tab.id} href={`#${tab.id}`} onClick={(event) => go(event, tab.id)} aria-current={active === tab.id ? "location" : undefined} className={TAB}>{tab.label}</a>
          ))}
        </div>
      </nav>

      {/* 이야기: 아이 정보 구역에는 리워드·기업 정보를 두지 않는다. */}
      <div id="story" tabIndex={-1} className={ANCHOR}>
        {family?.approved && family.message && (
          <section className="bg-white pt-14 pb-2" aria-labelledby="family-word-title">
            <div className="page-container">
              <Reveal>
                <p id="family-word-title" className="flex"><FamilyBadge label="가족의 한마디" /></p>
                <blockquote className="relative mt-4 max-w-[44rem] border-l-4 border-coral pl-[22px] text-[22px] leading-[1.7] font-bold tracking-[-.3px] whitespace-pre-line break-keep text-navy max-md:text-[18px]">{family.message}</blockquote>
                <p className="mt-3 pl-[26px] text-[14px] text-muted">— {campaign.child.name}님의 가족</p>
              </Reveal>
            </div>
          </section>
        )}
        {campaign.hasStory ? <FundingStory availableImages={availableImages} childPhotoUrl={childPhotoUrl} /> : <ChildStory campaign={campaign} child={child} />}
      </div>

      <div className="page-container grid grid-cols-[minmax(0,1fr)_360px] gap-12 max-lg:grid-cols-1 max-lg:gap-0">
        {/* 좁은 화면은 탭 순서(굿즈 → 스트레치 골 → 리워드 → 일정 → 후원자)대로 리워드를 본문 사이에 끼운다. 구역이 바로 그리드 칸이 되므로 옆으로 긴 내용이 칸을 넓히지 않게 막는다. */}
        <div className="min-w-0 max-lg:contents max-lg:[&>*]:order-[var(--order,0)] max-lg:[&>*]:min-w-0">
          <section id="goods" tabIndex={-1} style={order(1)} className={`${SECTION} ${ANCHOR}`} aria-labelledby="goods-title">
            <Reveal><p className={eyebrow}>MY REWARD</p></Reveal>
            <Reveal delay={80}><h2 id="goods-title" className={SECTION_TITLE}>후원 금액이 커질수록<br />기억을 들고 다니는 굿즈가 늘어나요</h2></Reveal>
            <Reveal delay={160}><p className={SECTION_LEAD}>금액을 움직여 보세요. 굿즈에는 {campaign.child.name}님의 얼굴 대신 <strong>QR만</strong> 들어갑니다. QR은 항상 최신 장기 실종아동 목록으로 연결돼요.</p></Reveal>
            <GoodsEvolution campaign={campaign} raised={raised} canBack={canBack} />
          </section>

          <section id="stretch" tabIndex={-1} style={order(2)} className={`${SECTION} ${ANCHOR}`} aria-labelledby="stretch-title">
            <Reveal><p className={eyebrow}>TOGETHER</p></Reveal>
            <Reveal delay={80}><h2 id="stretch-title" className={SECTION_TITLE}>다 같이 모일수록<br />모든 후원자의 굿즈가 좋아져요</h2></Reveal>
            <Reveal delay={160}><p className={SECTION_LEAD}>스트레치 골을 넘을 때마다 보너스가 열려요. 골을 눌러 무엇이 달라지는지 확인해 보세요.</p></Reveal>
            <StretchGoalTrack campaign={campaign} raised={raised} />
          </section>

          <section style={order(4)} className={SECTION} aria-labelledby="why-title">
            <Reveal><p className={eyebrow}>WHY QR</p></Reveal>
            <Reveal delay={80}><h2 id="why-title" className={SECTION_TITLE}>왜 굿즈에 얼굴 대신<br />QR만 넣나요</h2></Reveal>
            <div className="mt-6 grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
              {[
                ["회수할 수 없는 사진", "옷에 인쇄한 사진은 아이가 발견돼도 거둬들일 수 없어요. 가족 동의와 초상권 문제도 생겨요."],
                ["항상 최신 목록", "QR은 FindUs의 최신 장기 실종아동 목록으로 연결돼요. 발견된 아이는 목록에서 빠져요."],
                ["몇 년 동안 길 위에", "키링·에코백·옷은 오래 쓰여요. 그만큼 오래, 많은 사람에게 한 번 더 보게 해요."],
              ].map(([title, text], index) => (
                <Reveal key={title} delay={index * 120} className="rounded-2xl border border-line bg-white p-5"><strong className="text-[16px]">{title}</strong><p className="mt-2 text-[14px] leading-[1.7] break-keep text-muted">{text}</p></Reveal>
              ))}
            </div>
            <FundsFlow campaign={campaign} raised={raised} />
          </section>

          <section id="plan" tabIndex={-1} style={order(5)} className={`${SECTION} ${ANCHOR}`} aria-labelledby="plan-title">
            <Reveal><p className={eyebrow}>SCHEDULE · POLICY</p></Reveal>
            <Reveal delay={80}><h2 id="plan-title" className={SECTION_TITLE}>일정과 환불 정책</h2></Reveal>
            <ol className="mt-7 grid grid-cols-5 max-md:grid-cols-1 max-md:gap-0">
              {[
                ["펀딩 마감", campaign.endsAt.slice(5, 10).replace("-", "월 ").replace(/^0/, "") + "일"],
                ["성공 확정 · 제작 주문", "마감 후 3일"],
                ["제작", "약 3주"],
                ["배송", "약 1주"],
                ["결과 · 사용 내역 공개", "배송 후 3일"],
              ].map(([title, when], index) => (
                <Reveal as="li" key={title} delay={index * 120} className={SCHEDULE_ITEM}><strong className="block text-[14px] break-keep">{title}</strong><span className="mt-1 block text-[13px] text-muted">{when}</span></Reveal>
              ))}
            </ol>
            <dl className={POLICY}>
              <div><dt>목표 미달 시</dt><dd>마감 다음 날 모든 결제를 일괄 취소하고 이메일·문자로 알려드려요.</dd></div>
              <div><dt>마감 전 취소</dt><dd>마감 전까지는 언제든 전액 취소할 수 있어요. 로그인했다면 마이페이지 &gt; 내 후원에서 바로 취소해요.</dd></div>
              <div><dt>마감 후 취소</dt><dd>주문 제작 상품이라 마감 후에는 단순 변심 취소가 어려워요. 후원할 때 따로 안내하고 동의를 받아요.</dd></div>
              <div><dt>불량 · 오배송</dt><dd>받은 날부터 7일 안에 알려 주시면 교환하거나 환불해요.</dd></div>
              <div><dt>개인정보</dt><dd>배송에 필요한 만큼만 받고, 배송이 끝나면 파기해요.</dd></div>
            </dl>
          </section>

          <section id="backers" tabIndex={-1} style={order(6)} className={`${SECTION} ${ANCHOR}`} aria-labelledby="backers-title">
            <Reveal><p className={eyebrow}>BACKERS</p></Reveal>
            <Reveal delay={80}><h2 id="backers-title" className={SECTION_TITLE}>{funding.backers > 0 ? `${funding.backers.toLocaleString("ko-KR")}명이 함께 기억하고 있어요` : "첫 후원자를 기다리고 있어요"}</h2></Reveal>
            {wall.length > 0 && (
              <>
                <p className="sr-only">이름 공개에 동의한 후원자: {wall.slice(0, 12).join(", ")} 외</p>
                <div className="group/wall mt-6 flex flex-col gap-2.5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none]" aria-hidden="true">
                  {[0, 1].map((row) => {
                    const names = wall.filter((_, index) => index % 2 === row);
                    return (
                      <div key={row} className="flex w-max gap-2.5 group-hover/wall:[animation-play-state:paused] motion-safe:animate-funding-marquee data-[reverse=true]:[animation-direction:reverse] data-[reverse=true]:[animation-duration:54s] motion-reduce:w-auto motion-reduce:flex-wrap" data-reverse={row === 1}>
                        {names.map((name, index) => <span key={`a-${index}`} className={`${WALL_NAME} ${wallTone(index)}`}>{name}</span>)}
                        {names.map((name, index) => <span key={`b-${index}`} data-copy="true" className={`${WALL_NAME} ${wallTone(names.length + index)}`}>{name}</span>)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        <aside id="rewards" tabIndex={-1} className={`pt-10 pb-14 max-lg:order-3 max-lg:min-w-0 max-lg:border-t max-lg:border-line max-lg:py-14 ${ANCHOR}`} aria-labelledby="rewards-title">
          <div className="sticky top-[132px] max-h-[calc(100dvh-148px)] overflow-y-auto rounded-[14px] pr-1 [scrollbar-width:thin] max-lg:static max-lg:max-h-none max-lg:overflow-visible max-lg:p-0 motion-safe:[[data-flash=true]_&]:animate-funding-flash">
            <h2 id="rewards-title" className="text-[20px] font-extrabold">리워드 선택</h2>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-muted">한 번에 한 가지만 고를 수 있어요. 더 원하면 한 번 더 후원해 주세요.</p>
            <div className="mt-4 flex flex-col gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
              {campaign.tiers.map((tier) => <RewardCard key={tier.id} campaign={campaign} tier={tier} sold={funding.sold[tier.id] ?? 0} canBack={canBack} popular={tier.id === popular} />)}
              <div className={reward} data-disabled="true">
                <p className={rewardPrice}>별도 견적</p>
                <h3 className={rewardTitle}>기업 단체 세트</h3>
                <p className={rewardMetaText}>50세트부터 임직원 프로그램과 묶어 제안해요. 기업 후원 문의 창구는 준비 중이에요.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {canBack && (
        <div className="fixed inset-x-0 bottom-0 z-50 hidden items-center justify-between gap-3 border-t border-line bg-[rgb(255_255_255/96%)] px-5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] text-[14px] backdrop-blur-[8px] motion-safe:animate-funding-bar-in max-lg:flex max-md:bottom-[calc(64px+env(safe-area-inset-bottom))] max-md:pb-2.5">
          <p><strong className="text-[17px] text-coral">{rate}%</strong> 달성 · {left}일 남음</p>
          <a href="#rewards" onClick={toRewards} className={`${PRIMARY_BUTTON_BASE} min-h-[44px]`}>후원하기 <ArrowRightIcon size={16} /></a>
        </div>
      )}
      <p className={`page-container ${footNote}`}>
        결제 연동 전 데모 화면이에요. 모인 금액과 후원자 수는 예시 값에 이 브라우저에서 한 후원을 더한 값이에요.
        {campaign.example && " 이 펀딩은 화면 확인용 예시로, 실제 실종아동 정보를 연결했지만 가족 동의 전이라 개발 환경에서만 보여요."}{" "}
        <Link href="/">FindUs 소개</Link>
      </p>
    </div>
  );
}

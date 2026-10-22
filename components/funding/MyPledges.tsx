"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { KEYRING_DESIGNS, bonusesFor, formatManWon, formatWon, needsKeyringChoice, progressRate, tierById, type Campaign } from "@/lib/funding";
import { campaignOf, cancelPledge, chooseKeyringDesign, summarize, type Pledge } from "@/lib/fundingStore";
import { usePledges } from "@/lib/useFunding";
import { ArrowRightIcon, HeartIcon, SparklesIcon } from "../Icons";
import Modal from "../Modal";
import GoodsStage from "./GoodsStage";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const DELIVERY_STEPS = ["제작 중", "발송", "배송 완료"];

function PledgeCard({ pledge, raised, userId }: { pledge: Pledge; raised: number; userId: string }) {
  const campaign = campaignOf(pledge);
  const tier = tierById(pledge.tierId, campaign)!;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const paid = pledge.status === "paid";
  const ended = new Date() > new Date(campaign.endsAt);
  const bonuses = paid ? bonusesFor(pledge.tierId, raised, campaign) : [];

  const run = async (action: () => Promise<void>) => {
    try { await action(); setError(null); } catch (problem) { setError(problem instanceof Error ? problem.message : "처리하지 못했어요."); }
  };

  return (
    <li className={`rounded-2xl border border-line bg-card p-5 ${paid ? "" : "opacity-70"}`}>
      <div className="flex gap-4 max-sm:flex-col">
        <GoodsStage kinds={tier.stage} label="" idPrefix={`my-${pledge.no}`} still className="w-28 shrink-0 rounded-xl bg-surface p-1 max-sm:w-32" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${paid ? "bg-brand-soft text-brand" : "bg-surface text-muted"}`}>{paid ? (ended ? "제작 준비" : "결제 완료") : "취소됨"}</span>
            <span className="text-[12px] text-muted">{pledge.no} · {new Date(pledge.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
          <Link href={`/funding/${campaign.id}`} className={`mt-2 inline-block text-[13px] font-bold text-[#963D32] hover:underline ${FOCUS}`}>{campaign.child.name}님을 기억하는 {campaign.title}</Link>
          <p className="mt-1 text-[18px] font-extrabold">{tier.title} <span className="text-brand">{formatWon(pledge.amount)}</span></p>
          {pledge.sizes.length > 0 && <p className="mt-1 text-[13px] text-muted">사이즈 {pledge.sizes.join(", ")}</p>}
          {bonuses.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="열린 보너스">
              {bonuses.map((bonus) => <li key={bonus} className="inline-flex items-center gap-1 rounded-full bg-[#FFF0ED] px-2.5 py-1 text-[12px] font-bold text-[#963D32]"><SparklesIcon size={13} />{bonus}</li>)}
            </ul>
          )}
        </div>
      </div>

      {paid && needsKeyringChoice(pledge.tierId, raised, campaign) && (
        <fieldset className="mt-4 rounded-xl bg-surface p-4">
          <legend className="float-left mb-2 w-full text-[14px] font-bold">
            키링 디자인을 골라 주세요 {!pledge.keyringDesign && <span className="ml-1 text-[12px] font-bold text-[#963D32]">선택 필요</span>}
          </legend>
          <div className="clear-both flex flex-wrap gap-2">
            {KEYRING_DESIGNS.map((design) => (
              <label key={design.id} className={`cursor-pointer rounded-lg border px-3 py-2 text-[14px] font-semibold has-focus-visible:outline-2 has-focus-visible:outline-brand ${pledge.keyringDesign === design.id ? "border-[#173B70] bg-white text-[#173B70]" : "border-line bg-white text-muted"}`}>
                <input type="radio" name={`design-${pledge.no}`} className="sr-only" checked={pledge.keyringDesign === design.id} onChange={() => run(() => chooseKeyringDesign(pledge.no, userId, design.id))} />
                {design.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted">500만 원 돌파로 열린 보너스예요. 마감 전까지 바꿀 수 있어요.</p>
        </fieldset>
      )}

      {paid && ended && tier.needsShipping && (
        <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]" aria-label="배송 진행">
          {DELIVERY_STEPS.map((step, index) => <li key={step} className={`rounded-lg py-2 font-bold ${index === 0 ? "bg-brand text-white" : "bg-surface text-muted"}`}>{step}</li>)}
        </ol>
      )}

      {error && <p role="alert" className="mt-3 text-[13px] font-semibold text-red">{error}</p>}

      {paid && !ended && (
        <div className="mt-4 flex justify-end border-t border-line pt-3">
          <button ref={cancelRef} type="button" onClick={() => setConfirming(true)} className={`rounded-lg px-3 py-2 text-[13px] font-bold text-muted hover:bg-surface hover:text-red ${FOCUS}`}>후원 취소</button>
        </div>
      )}

      {confirming && (
        <Modal title="후원을 취소할까요?" onClose={() => setConfirming(false)} returnFocusTo={cancelRef.current}>
          <p className="text-[15px] leading-relaxed">{tier.title} {formatWon(pledge.amount)} 후원을 전액 취소해요. 결제는 바로 취소되고, 후원자 벽에서도 빠져요.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" data-autofocus onClick={() => setConfirming(false)} className={`rounded-xl border border-line px-4 py-2.5 text-[14px] font-bold ${FOCUS}`}>계속 후원하기</button>
            <button type="button" onClick={() => { setConfirming(false); run(() => cancelPledge(pledge.no, userId)); }} className={`rounded-xl bg-red px-4 py-2.5 text-[14px] font-bold text-white hover:bg-red-dark ${FOCUS}`}>전액 취소</button>
          </div>
        </Modal>
      )}
    </li>
  );
}

/** 내가 후원한 캠페인의 진행률. 내 후원 금액을 막대 끝에 따로 표시한다. */
function CampaignProgress({ campaign, raised, myTotal }: { campaign: Campaign; raised: number; myTotal: number }) {
  const rate = progressRate(raised, campaign.goal);
  const mine = Math.max(1.5, (myTotal / campaign.goal) * 100);
  return (
    <div className="rounded-2xl bg-surface p-5">
      <p className="text-[13px] font-semibold text-muted">{campaign.child.name}님을 기억하는 {campaign.title}</p>
      <p className="mt-1 text-[20px] font-extrabold text-[#173B70]">{formatWon(raised)} <span className="text-[15px] text-[#FF7867]">{rate}%</span></p>
      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${Math.min(100, rate)}%` }} />
        {myTotal > 0 && <span className="absolute inset-y-0 rounded-full bg-[#FF7867]" style={{ left: `${Math.max(0, Math.min(100, rate) - mine)}%`, width: `${mine}%` }} />}
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {myTotal > 0 ? <>이 중 <strong className="text-[#963D32]">{formatWon(myTotal)}</strong>이 내 후원이에요.</> : "결제가 취소된 후원만 있어요."} 목표 {formatManWon(campaign.goal)} 원
      </p>
    </div>
  );
}

export default function MyPledges({ userId }: { userId: string }) {
  const pledges = usePledges();
  const mine = pledges.filter((pledge) => pledge.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // 후원한 캠페인마다 모금액을 따로 계산한다. (최근 후원한 캠페인부터)
  const campaigns = [...new Map(mine.map((pledge) => [campaignOf(pledge).id, campaignOf(pledge)])).values()];
  const raisedOf = new Map(campaigns.map((campaign) => [campaign.id, summarize(pledges, campaign).raised]));
  const myTotalOf = (campaign: Campaign) => mine.filter((pledge) => pledge.status === "paid" && campaignOf(pledge).id === campaign.id).reduce((sum, pledge) => sum + pledge.amount, 0);
  const pendingChoice = mine.some((pledge) => pledge.status === "paid" && needsKeyringChoice(pledge.tierId, raisedOf.get(campaignOf(pledge).id) ?? 0, campaignOf(pledge)) && !pledge.keyringDesign);

  return (
    <section aria-labelledby="mypage-funding" className="min-w-0 rounded-3xl border border-line bg-card p-8 max-sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="mypage-funding" className="flex items-center gap-2 text-[23px] font-extrabold"><HeartIcon className="text-[#FF7867]" />내 후원</h2>
        <Link href="/funding" className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[14px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>펀딩 보기 <ArrowRightIcon size={16} /></Link>
      </div>

      {campaigns.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {campaigns.map((campaign) => <CampaignProgress key={campaign.id} campaign={campaign} raised={raisedOf.get(campaign.id) ?? 0} myTotal={myTotalOf(campaign)} />)}
        </div>
      )}

      {pendingChoice && <p role="status" className="mt-4 rounded-xl border border-[#FFD0C8] bg-[#FFF0ED] px-4 py-3 text-[14px] font-semibold text-[#963D32]">골라야 할 보너스가 있어요. 아래에서 키링 디자인을 선택해 주세요.</p>}

      {mine.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-bold">아직 후원 내역이 없어요.</p>
          <p className="mt-2 text-[14px] text-muted">로그인한 상태로 후원하면 여기에서 내역을 보고 취소할 수 있어요.</p>
          <Link href="/funding" className={`mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>펀딩 둘러보기 <ArrowRightIcon size={16} /></Link>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {mine.map((pledge) => <PledgeCard key={pledge.no} pledge={pledge} raised={raisedOf.get(campaignOf(pledge).id) ?? 0} userId={userId} />)}
        </ul>
      )}
      <p className="mt-5 text-[12px] text-muted">결제 연동 전 데모예요. 후원 내역은 이 브라우저에만 저장돼요. 로그인하지 않고 한 후원은 후원번호로 확인해요.</p>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { formatWon, tierById } from "@/lib/funding";
import { campaignOf, findPledge } from "@/lib/fundingStore";
import { useFunding } from "@/lib/useFunding";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowRightIcon, ShareIcon } from "../Icons";
import GoodsStage from "./GoodsStage";
import styles from "./Checkout.module.css";

export default function PledgeComplete({ no }: { no: string }) {
  const ready = useAuthReady();
  const user = useCurrentUser();
  // 후원이 바뀌면(취소 등) 다시 읽도록 스냅숏을 구독한다.
  useFunding();
  const pledge = ready ? findPledge(no) : null;
  const [status, setStatus] = useState("");

  if (!ready) return <p role="status" className="page-container py-24 text-center text-muted">후원 내역을 확인하고 있어요.</p>;

  if (!pledge) {
    return (
      <div className={`page-container ${styles.closed}`}>
        <h1>후원 내역을 찾지 못했어요</h1>
        <p>후원번호를 확인해 주세요. 후원 완료 메일에도 후원번호가 적혀 있어요.</p>
        <Link href="/funding" className={styles.primary}>펀딩 페이지로</Link>
      </div>
    );
  }

  const campaign = campaignOf(pledge);
  const tier = tierById(pledge.tierId, campaign)!;
  const share = async () => {
    const url = `${window.location.origin}/funding/${campaign.id}`;
    try {
      if (navigator.share) { await navigator.share({ title: `${campaign.child.name}님을 기억하는 ${campaign.title} · FindUs`, text: "실종아동을 기억하는 QR 굿즈 펀딩에 함께해 주세요.", url }); return; }
      await navigator.clipboard.writeText(url);
      setStatus("펀딩 링크를 복사했어요");
    } catch { /* 공유 창을 닫은 경우 */ }
  };

  return (
    <div className={`page-container ${styles.complete}`}>
      <div className={styles.box} aria-hidden="true">
        <div className={styles.boxGoods}><GoodsStage kinds={tier.stage} label="" idPrefix="complete" still /></div>
        <div className={styles.boxBody}>
          <span className={styles.boxFlap} />
          <span className={styles.boxFlap} />
          <span className={styles.boxTape} />
          <span className={styles.boxStamp}>후원 완료</span>
        </div>
      </div>

      <h1 className={styles.completeTitle}>{pledge.name}님, 함께해 주셔서 고맙습니다</h1>
      <p className={styles.completeLead}>
        {tier.needsShipping ? `${tier.title}는 펀딩이 성공하면 만들어 보내드려요. ${campaign.deliveryNote}.` : "감사 카드를 이메일로 보내드렸어요."}
        <br />목표에 닿지 못하면 마감 다음 날 전액 취소돼요.
      </p>

      <div className={styles.completeCard}>
        <dl>
          <div><dt>후원번호</dt><dd className={styles.pledgeNo}>{pledge.no}</dd></div>
          <div><dt>펀딩</dt><dd>{campaign.child.name}님을 기억하는 {campaign.title}</dd></div>
          <div><dt>리워드</dt><dd>{tier.title}{pledge.sizes.length > 0 && ` · ${pledge.sizes.join(", ")}`}</dd></div>
          <div><dt>후원 금액</dt><dd>{formatWon(pledge.amount)}</dd></div>
          <div><dt>상태</dt><dd>{pledge.status === "paid" ? "결제 완료" : "취소됨"}</dd></div>
        </dl>
      </div>

      <div className={styles.completeActions}>
        <button type="button" onClick={share} className={styles.secondary}><ShareIcon size={16} /> 펀딩 공유하기</button>
        {user && pledge.userId === user.id
          ? <Link href="/mypage?tab=funding" className={styles.primary}>내 후원 보기 <ArrowRightIcon size={16} /></Link>
          : <Link href={`/funding/${campaign.id}`} className={styles.primary}>펀딩 페이지로 <ArrowRightIcon size={16} /></Link>}
      </div>
      <p role="status" className={styles.completeNote}>{status}</p>
      {!pledge.userId && (
        <p className={styles.completeNote}>
          후원번호를 꼭 보관해 주세요. 다음 후원부터는 <Link href="/login?next=%2Ffunding">로그인</Link>하고 후원하면 마이페이지에서 내역을 보고 취소할 수 있어요.
        </p>
      )}
    </div>
  );
}

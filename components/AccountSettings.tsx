"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { logOut, type User } from "@/lib/auth";
import { formatPostDate } from "@/lib/community";
import { listedCampaigns } from "@/lib/funding";
import {
  KEPT_INFO, MESSAGE_MAX, NOT_KEPT_INFO, RELATIONS, STATUS_LABEL, canTransition, devSetFamilyStatus, sendFamilyRequest, updateCampaignFamily, withdrawFamily,
  type FamilyRecord, type FamilyStatus,
} from "@/lib/familyVerification";
import { useCampaignFamilies, useFamilyRecord } from "@/lib/useFamily";
import AddressBook from "./AddressBook";
import FamilyBadge from "./FamilyBadge";
import { ArrowRightIcon, CheckIcon, ClockIcon, HomeIcon, MinusCircleIcon, ShieldIcon, UserIcon } from "./Icons";
import Modal from "./Modal";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const CARD = "min-w-0 rounded-3xl border border-line bg-card p-8 max-sm:p-5";
const IS_DEV = process.env.NODE_ENV !== "production";
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("ko-KR") : "—");

function CardTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return <h2 id={id} className="flex items-center gap-2 text-[21px] font-extrabold max-sm:text-[19px]">{icon}{children}</h2>;
}

/** 개발 환경 전용: 관리자 심사(A10)를 대신해 결과를 바꿔 본다. */
function DevReviewControls({ userId, record }: { userId: string; record: FamilyRecord }) {
  const [error, setError] = useState<string | null>(null);
  const options: [FamilyStatus, string, string | null][] = [
    ["verified", "확인됨으로", null],
    ["needs_more", "보완 요청으로", "가족관계증명서의 이름이 흐려 확인하기 어려워요. 다시 발급받아 제출해 주세요."],
    ["rejected", "반려로", "기관 확인 결과, 신고된 보호자 정보와 일치하지 않았어요."],
    ["reviewing", "확인 중으로", null],
  ];
  return (
    <div className="mt-5 rounded-xl border border-dashed border-[#F2BDB8] bg-[#FFF8F7] p-4">
      <p className="text-[12px] font-bold text-[#B4473F]">데모 · 개발 환경에서만 보여요</p>
      <p className="mt-1 text-[12px] text-muted">실제로는 관리자가 기관 확인 결과를 보고 바꿔요 (관리자 화면 A10).</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.filter(([to]) => canTransition(record.status, to)).map(([to, label, note]) => (
          <button key={to} type="button" onClick={() => { try { devSetFamilyStatus(userId, to, note); setError(null); } catch (problem) { setError(problem instanceof Error ? problem.message : "바꾸지 못했어요."); } }}
            className={`rounded-lg border border-[#F6CDC9] bg-white px-3 py-1.5 text-[12px] font-bold ${FOCUS}`}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-[12px] text-red">{error}</p>}
    </div>
  );
}

export function KeptTable() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] max-sm:grid-cols-1">
      <div className="rounded-xl bg-surface p-4">
        <p className="flex items-center gap-1.5 font-bold text-[#173B70]"><CheckIcon size={15} />보관하는 정보</p>
        <ul className="mt-2 space-y-1 text-muted">{KEPT_INFO.map((item) => <li key={item}>· {item}</li>)}</ul>
      </div>
      <div className="rounded-xl bg-[#FFF5F3] p-4">
        <p className="flex items-center gap-1.5 font-bold text-[#B4473F]"><MinusCircleIcon size={15} />보관하지 않는 정보</p>
        <ul className="mt-2 space-y-1 text-muted">{NOT_KEPT_INFO.map((item) => <li key={item}>· {item}</li>)}</ul>
      </div>
    </div>
  );
}

/** 인증된 가족: 아이 캠페인 승인·가족의 한마디·정정·비공개 요청 */
function OurChild({ userId, record }: { userId: string; record: FamilyRecord }) {
  const campaigns = listedCampaigns().filter((campaign) => campaign.child.sourceId === record.childSourceId);
  const families = useCampaignFamilies();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [correction, setCorrection] = useState("");
  const [confirmPrivate, setConfirmPrivate] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const privateRef = useRef<HTMLButtonElement>(null);
  const ids = campaigns.map((campaign) => campaign.id);

  const run = (action: () => void, done: string) => {
    try { action(); setError(null); setStatus(done); } catch (problem) { setError(problem instanceof Error ? problem.message : "처리하지 못했어요."); setStatus(null); }
  };

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h3 className="text-[17px] font-extrabold">우리 아이 관리 · {record.childName}</h3>
      {campaigns.length === 0 ? (
        <p className="mt-2 text-[14px] text-muted">아직 {record.childName}님을 기억하는 펀딩이 없어요. 펀딩을 열고 싶다면 운영팀에 알려 주세요.</p>
      ) : campaigns.map((campaign) => {
        const state = families[campaign.id];
        const message = drafts[campaign.id] ?? state?.message ?? "";
        return (
          <div key={campaign.id} className="mt-3 rounded-2xl border border-line p-5 max-sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/funding/${campaign.id}`} className={`font-bold hover:text-brand ${FOCUS}`}>{campaign.child.name}님을 기억하는 {campaign.title}</Link>
              <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${state?.paused ? "bg-surface text-muted" : state?.approved ? "bg-[#FDECEA] text-[#B4473F]" : "bg-brand-soft text-brand"}`}>
                {state?.paused ? "공개 일시 중지" : state?.approved ? "가족 승인됨" : "가족 승인 전"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!state?.approved ? (
                <button type="button" onClick={() => run(() => updateCampaignFamily(userId, campaign.id, record.childSourceId, { approved: true, paused: false }), "공개를 승인했어요. 펀딩 페이지에 '가족이 함께해요'가 표시돼요.")}
                  className={`rounded-xl bg-brand px-4 py-2.5 text-[14px] font-bold text-white hover:bg-brand-dark ${FOCUS}`}>공개 승인</button>
              ) : (
                <button type="button" onClick={() => run(() => updateCampaignFamily(userId, campaign.id, record.childSourceId, { approved: false }), "승인을 보류했어요.")}
                  className={`rounded-xl border border-line px-4 py-2.5 text-[14px] font-bold ${FOCUS}`}>승인 보류</button>
              )}
            </div>
            <label className="mt-4 block text-[13px] font-bold">가족의 한마디 <span className="font-medium text-muted">펀딩 페이지 이야기 위에 실려요</span>
              <textarea value={message} maxLength={MESSAGE_MAX} rows={3} onChange={(event) => setDrafts({ ...drafts, [campaign.id]: event.target.value })}
                placeholder="예: 우리 준원이를 아직 기다리고 있습니다. 작은 관심이 큰 힘이 됩니다."
                className="mt-1.5 w-full rounded-xl border border-line p-3 text-[14px] leading-relaxed font-normal focus:border-brand focus:outline-none" />
            </label>
            <div className="mt-1 flex items-center justify-between text-[12px] text-muted">
              <span>{message.length}/{MESSAGE_MAX}</span>
              <button type="button" onClick={() => run(() => updateCampaignFamily(userId, campaign.id, record.childSourceId, { message: message.trim() }), "가족의 한마디를 저장했어요.")}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>한마디 저장</button>
            </div>
          </div>
        );
      })}

      <div className="mt-5 rounded-2xl bg-surface p-5 max-sm:p-4">
        <p className="flex items-center gap-1.5 text-[14px] font-bold"><ShieldIcon size={16} className="text-brand" />가족 요청 · 우선 처리</p>
        <p className="mt-1 text-[13px] text-muted">확인된 가족의 요청은 다른 문의보다 먼저 처리해요. 공식 실종 정보 자체의 정정은 182·안전Dream에도 함께 알려 주세요.</p>
        <label className="mt-3 block text-[13px] font-bold">아이 정보 정정 요청
          <textarea value={correction} onChange={(event) => setCorrection(event.target.value)} rows={2} placeholder="예: 실종 당시 옷차림이 다르게 적혀 있어요."
            className="mt-1.5 w-full rounded-xl border border-line bg-white p-3 text-[14px] font-normal focus:border-brand focus:outline-none" />
        </label>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button ref={privateRef} type="button" onClick={() => setConfirmPrivate(true)} className={`rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-bold text-muted hover:text-red ${FOCUS}`}>비공개 요청</button>
          <button type="button" onClick={() => run(() => { sendFamilyRequest(userId, "correction", correction, ids); setCorrection(""); }, "정정 요청을 접수했어요. 우선 처리해 드릴게요.")}
            className={`rounded-xl bg-[#173B70] px-4 py-2 text-[13px] font-bold text-white ${FOCUS}`}>정정 요청 보내기</button>
        </div>
        {record.requests.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[12px] text-muted">
            {record.requests.slice(0, 3).map((item) => <li key={item.at}>{date(item.at)} · {item.type === "private" ? "비공개 요청 (바로 반영)" : `정정 요청: ${item.text}`}</li>)}
          </ul>
        )}
      </div>
      {status && <p role="status" className="mt-3 text-[13px] font-semibold text-brand">{status}</p>}
      {error && <p role="alert" className="mt-3 text-[13px] font-semibold text-red">{error}</p>}

      {confirmPrivate && (
        <Modal title="공개를 멈출까요?" onClose={() => setConfirmPrivate(false)} returnFocusTo={privateRef.current}>
          <p className="text-[15px] leading-relaxed break-keep">{record.childName}님을 기억하는 펀딩과 카드의 공개를 바로 멈춰요. 진행 중인 후원은 운영팀이 연락드려 환불 여부를 함께 정해요.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" data-autofocus onClick={() => setConfirmPrivate(false)} className={`rounded-xl border border-line px-4 py-2.5 text-[14px] font-bold ${FOCUS}`}>취소</button>
            <button type="button" onClick={() => { setConfirmPrivate(false); run(() => sendFamilyRequest(userId, "private", "", ids), "공개를 멈췄어요. 운영팀이 곧 연락드릴게요."); }} className={`rounded-xl bg-red px-4 py-2.5 text-[14px] font-bold text-white ${FOCUS}`}>공개 멈추기</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FamilyCard({ user }: { user: User }) {
  const record = useFamilyRecord(user.id);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const withdrawRef = useRef<HTMLButtonElement>(null);
  const status = record?.status ?? "none";
  const relation = RELATIONS.find((item) => item.id === record?.relation)?.label;
  const campaignIds = record ? listedCampaigns().filter((campaign) => campaign.child.sourceId === record.childSourceId).map((campaign) => campaign.id) : [];

  return (
    <section aria-labelledby="account-family" className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle id="account-family" icon={<ShieldIcon className="text-[#F28B82]" />}>가족 인증</CardTitle>
        {status === "verified" ? <FamilyBadge size="md" label="가족 확인됨" /> : <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-muted">{STATUS_LABEL[status]}</span>}
      </div>

      {!record && (
        <>
          <p className="mt-3 text-[15px] leading-relaxed break-keep">실종아동의 부모·보호자라면 가족 인증을 신청할 수 있어요. 확인되면 <strong>아이 펀딩의 공개를 승인</strong>하고 <strong>가족의 한마디</strong>를 남길 수 있으며, 정보 정정·비공개 요청을 우선 처리해 드려요.</p>
          <ol className="mt-4 grid grid-cols-4 gap-2 text-center text-[12px] font-bold text-muted max-sm:grid-cols-2">
            {["휴대폰 본인확인", "가족관계증명서", "찾는 아이 선택", "기관 확인"].map((step, index) => <li key={step} className="rounded-xl bg-surface px-2 py-3"><span className="block text-[#173B70]">{index + 1}</span>{step}</li>)}
          </ol>
          <KeptTable />
          <Link href="/mypage/verify" className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-[15px] font-bold text-white hover:bg-brand-dark ${FOCUS}`}>가족 인증 신청 <ArrowRightIcon size={16} /></Link>
        </>
      )}

      {record && (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] max-sm:grid-cols-1">
            <div><dt className="text-muted">찾는 아이</dt><dd className="mt-0.5 font-semibold">{record.childName} <Link href={`/missing/${encodeURIComponent(record.childPersonId)}`} className="ml-1 text-[12px] font-bold text-brand hover:underline">공식 정보</Link></dd></div>
            <div><dt className="text-muted">관계</dt><dd className="mt-0.5 font-semibold">{relation}</dd></div>
            <div><dt className="text-muted">신청일</dt><dd className="mt-0.5 font-semibold">{date(record.requestedAt)}</dd></div>
            {status === "verified" ? (
              <>
                <div><dt className="text-muted">확인한 기관 · 확인일</dt><dd className="mt-0.5 font-semibold">{record.agency} · {date(record.decidedAt)}</dd></div>
                <div><dt className="text-muted">다시 확인할 날</dt><dd className="mt-0.5 font-semibold">{date(record.renewBy)}</dd></div>
                <div><dt className="text-muted">제출 서류</dt><dd className="mt-0.5 font-semibold text-[#1D6B43]">{date(record.document.destroyedAt)} 파기 완료</dd></div>
              </>
            ) : (
              <div><dt className="text-muted">제출 서류</dt><dd className="mt-0.5 font-semibold">{record.document.fileName ?? "파기됨"} {record.destroyBy && <span className="text-[12px] font-medium text-muted">({date(record.destroyBy)}까지 보관 후 파기)</span>}</dd></div>
            )}
          </dl>

          {status === "reviewing" && <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-soft p-4 text-[14px] text-[#173B70]"><ClockIcon size={18} className="mt-0.5 shrink-0" />아동권리보장원 실종아동전문센터와 관할 경찰서에 확인하고 있어요. 보통 5~10일(영업일) 걸려요. [가정]</p>}
          {status === "needs_more" && (
            <div className="mt-4 rounded-xl bg-[#FFF5F3] p-4 text-[14px]">
              <p className="font-bold text-[#B4473F]">보완이 필요해요</p>
              <p className="mt-1 break-keep">{record.note}</p>
              <Link href="/mypage/verify" className={`mt-3 inline-flex items-center gap-1 font-bold text-brand ${FOCUS}`}>다시 제출하기 <ArrowRightIcon size={15} /></Link>
            </div>
          )}
          {status === "rejected" && (
            <div className="mt-4 rounded-xl bg-surface p-4 text-[14px]">
              <p className="font-bold">확인되지 않았어요</p>
              <p className="mt-1 break-keep text-muted">{record.note} 제출한 서류는 바로 파기했어요. 궁금한 점은 182(실종아동 상담)나 아동권리보장원(02-777-0182)에 문의해 주세요.</p>
            </div>
          )}

          {status === "verified" && <OurChild userId={user.id} record={record} />}
          {IS_DEV && <DevReviewControls userId={user.id} record={record} />}

          <div className="mt-5 flex justify-end">
            <button ref={withdrawRef} type="button" onClick={() => setConfirmWithdraw(true)} className={`rounded-lg px-3 py-2 text-[13px] font-bold text-muted hover:bg-surface hover:text-red ${FOCUS}`}>
              {status === "verified" ? "가족 인증 해지" : "신청 취소"}
            </button>
          </div>
        </>
      )}

      {confirmWithdraw && (
        <Modal title={status === "verified" ? "가족 인증을 해지할까요?" : "신청을 취소할까요?"} onClose={() => setConfirmWithdraw(false)} returnFocusTo={withdrawRef.current}>
          <p className="text-[15px] leading-relaxed break-keep">인증 기록과 남아 있는 서류를 모두 지워요. 가족이 승인한 펀딩은 &lsquo;가족 승인 전&rsquo;으로 돌아가요.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" data-autofocus onClick={() => setConfirmWithdraw(false)} className={`rounded-xl border border-line px-4 py-2.5 text-[14px] font-bold ${FOCUS}`}>돌아가기</button>
            <button type="button" onClick={() => { setConfirmWithdraw(false); withdrawFamily(user.id, campaignIds); }} className={`rounded-xl bg-red px-4 py-2.5 text-[14px] font-bold text-white ${FOCUS}`}>{status === "verified" ? "해지" : "신청 취소"}</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default function AccountSettings({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="account-profile" className={CARD}>
        <CardTitle id="account-profile" icon={<UserIcon className="text-brand" />}>회원 정보</CardTitle>
        <dl className="mt-5 grid grid-cols-3 gap-4 text-[14px] max-sm:grid-cols-1">
          <div><dt className="text-muted">닉네임</dt><dd className="mt-1 font-semibold break-all">{user.nickname}</dd></div>
          <div><dt className="text-muted">이메일</dt><dd className="mt-1 font-semibold break-all">{user.email}</dd></div>
          <div><dt className="text-muted">가입일</dt><dd className="mt-1 font-semibold">{formatPostDate(user.createdAt)}</dd></div>
        </dl>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={() => { logOut(); router.replace("/"); }} className={`rounded-xl border border-line px-4 py-2.5 text-[14px] font-bold text-muted hover:bg-surface ${FOCUS}`}>로그아웃</button>
        </div>
      </section>

      <section aria-labelledby="account-address" className={CARD}>
        <CardTitle id="account-address" icon={<HomeIcon className="text-brand" />}>배송지 관리</CardTitle>
        <p className="mt-2 mb-4 text-[14px] text-muted break-keep">저장한 배송지는 후원할 때 자동으로 채워져요. 기본 배송지가 먼저 선택돼요. 저장한 배송지는 언제든 지울 수 있어요.</p>
        <AddressBook userId={user.id} mode="manage" />
      </section>

      <FamilyCard user={user} />
    </div>
  );
}

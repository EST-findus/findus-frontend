"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "@/lib/auth";
import { formatPostDate } from "@/lib/community";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Modal from "./Modal";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function AccountButton() {
  const user = useCurrentUser();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  if (!user) return null;
  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setProfileOpen(true)} className={`mt-1 rounded-lg px-2 py-2 text-[13px] font-semibold text-muted hover:bg-surface hover:text-brand ${FOCUS_RING}`}>회원 정보</button>
        {profileOpen && <Modal title="내 회원 정보" onClose={() => setProfileOpen(false)}>
          <p className="text-[18px] font-bold">{user.nickname}님</p>
          <dl className="mt-5 space-y-4 text-[14px]">
            <div><dt className="text-muted">닉네임</dt><dd className="mt-1 font-semibold break-all">{user.nickname}</dd></div>
            <div><dt className="text-muted">이메일</dt><dd className="mt-1 font-semibold break-all">{user.email}</dd></div>
            <div><dt className="text-muted">가입일</dt><dd className="mt-1 font-semibold">{formatPostDate(user.createdAt)}</dd></div>
          </dl>
          <div className="mt-7 flex gap-3 text-[14px] font-bold">
            <Link href="/mypage" onClick={() => setProfileOpen(false)} className={`flex flex-1 items-center justify-center rounded-xl bg-brand px-4 py-3 text-white hover:bg-brand-dark ${FOCUS_RING}`}>마이페이지</Link>
            <button type="button" onClick={() => { setProfileOpen(false); logOut(); router.replace("/"); }} className={`flex-1 rounded-xl border border-line px-4 py-3 text-muted hover:bg-surface ${FOCUS_RING}`}>로그아웃</button>
          </div>
        </Modal>}
    </>
  );
}

"use client";

import { useState } from "react";
import type { MissingPerson } from "@/lib/types";
import { ShareIcon } from "./Icons";
import ShareModal from "./ShareModal";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const SECONDARY_ACTION = `flex flex-1 h-12 items-center justify-center rounded-xl border border-line bg-card px-3.5 transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`;

interface PersonActionsProps {
  person: MissingPerson;
  onReport: () => void;
  /** 오른쪽 끝 보조 버튼 (모달은 "닫기", 상세 페이지는 "목록으로") */
  secondary: React.ReactNode;
}

/** 상세정보 하단 버튼 줄: 목격 제보하기 · 공유하기(공유 모달) · 보조 버튼 */
export default function PersonActions({ person, onReport, secondary }: PersonActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex gap-2.5 text-[14px] font-bold max-sm:flex-wrap">
        <button
          type="button"
          onClick={onReport}
          className={`flex-2 h-12 rounded-xl max-sm:basis-full bg-brand px-3.5 text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
        >
          목격 제보하기
        </button>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-haspopup="dialog"
          className={`${SECONDARY_ACTION} gap-1.5`}
        >
          <ShareIcon size={17} strokeWidth={2.1} />
          공유하기
        </button>
        {secondary}
      </div>
      {shareOpen && <ShareModal person={person} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

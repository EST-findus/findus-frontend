"use client";

import { SAFE182_URL } from "@/lib/links";
import type { MissingPerson } from "@/lib/types";
import { ArrowUpRightIcon, PhoneIcon } from "./Icons";
import Modal from "./Modal";

interface ReportGuideModalProps {
  person: MissingPerson;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
}

// 목격 제보는 이 서비스가 아닌 공식 기관(112·182, 안전Dream)으로 하도록 안내한다.
const STEPS = [
  {
    title: "관리번호와 특징 확인",
    text: "아래 관리번호와 실종 당시 특징을 확인해 두세요. 제보할 때 함께 알려주면 빠르게 연결돼요.",
  },
  {
    title: "기억나는 단서 정리",
    text: "목격 장소와 일시, 착용 의상·인상착의, 이동 방향, 동행인 여부를 떠오르는 대로 메모하세요.",
  },
  {
    title: "공식 기관에 제보",
    text: "경찰청 182에 전화하거나 안전Dream 사이트로 제보하세요. 지금 눈앞에 있다면 112에 바로 신고해 주세요.",
  },
] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function ReportGuideModal({ person, returnFocusTo, onClose }: ReportGuideModalProps) {
  return (
    <Modal title="목격 제보 방법 안내" onClose={onClose} returnFocusTo={returnFocusTo}>
      <p className="mb-4 text-[13.5px] break-keep text-muted">
        작은 관심과 제보가 실종 가족에게는 가장 큰 희망입니다. 아래 순서대로 공식 기관에 알려주세요.
      </p>

      <div className="mb-5 rounded-xl bg-surface px-4 py-3 text-[14px]">
        <p className="font-bold">
          {person.name} <span className="font-semibold text-muted">· 관리번호 {person.id}</span>
        </p>
        <p className="mt-1 text-[13.5px] break-keep text-muted">{person.features}</p>
      </div>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-extrabold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-[15px] leading-snug font-bold break-keep">{step.title}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed break-keep text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex gap-2.5 text-[14px] font-bold max-sm:flex-col">
        <a
          href="tel:182"
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-3.5 text-white transition-colors hover:bg-brand-dark ${focusRing}`}
        >
          <PhoneIcon size={17} strokeWidth={2.2} />
          경찰청 182 전화하기
        </a>
        <a
          href={SAFE182_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-line bg-card px-3.5 transition-colors hover:border-brand hover:text-brand ${focusRing}`}
        >
          안전Dream에서 제보 <ArrowUpRightIcon size={14} strokeWidth={2.2} />
        </a>
      </div>
    </Modal>
  );
}

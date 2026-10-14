"use client";

import { useRef, useState } from "react";
import { ArrowRightIcon, ArrowUpRightIcon, PhoneIcon } from "./Icons";
import Modal from "./Modal";

type Audience = "self" | "parent";
const OFFICIAL_DNA_URL = "https://www.safe182.go.kr/cont/homeLogContents.do?contentsNm=report_info_dna";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const routes = {
  self: {
    label: "본인·친가족을 찾고 있어요",
    heading: "어릴 때 헤어진 가족을 찾고 싶다면",
    description: "실종·보호시설·입양 이력 등 본인의 상황을 설명하고, 유전자검사 대상에 해당하는지 먼저 확인해 주세요. 성인이 되어 친가족을 찾는다는 이유만으로 모두 등록할 수 있는 것은 아닙니다.",
    steps: [
      ["182에 사전 문의", "본인의 상황을 설명하고 검사 대상 여부를 문의해요."],
      ["방문 절차 확인", "담당 부서, 방문 장소와 필요한 기록·준비물을 안내받아요."],
      ["확인·동의 후 검체 채취", "대상 여부를 확인하고 동의한 뒤, 경찰서에서 구강세포 등의 검체를 채취해요."],
      ["분석·대조", "관련 기관에서 유전자정보를 분석하고 등록된 가족 정보와 대조해요."],
      ["결과 확인", "일치 가능성이 발견되면 추가 신원 확인 절차를 안내받아요."],
    ],
  },
  parent: {
    label: "실종 자녀를 찾고 있어요",
    heading: "자녀를 기다리는 부모님이라면",
    description: "자녀가 아직 발견되지 않았더라도 DNA 채취 절차를 문의할 수 있어요. 기존 실종신고 내역과 가족관계 확인에 필요한 준비물을 먼저 안내받아 주세요.",
    steps: [
      ["182에 문의·신고 내역 확인", "실종아동의 부모임을 알리고, 기존 신고가 없으면 신고 절차도 문의해요."],
      ["방문 절차 확인", "채취 장소, 담당 부서와 가족관계 확인에 필요한 준비물을 안내받아요."],
      ["확인·동의 후 검체 채취", "대상 여부와 가족관계를 확인하고 동의한 뒤 구강세포 등의 검체를 채취해요."],
      ["분석·등록 및 대조", "관련 기관에서 분석하고 신원이 확인되지 않은 대상자 등의 정보와 대조해요."],
      ["추후 확인", "당장 일치자가 없어도 이후 확보된 검사정보와 대조할 수 있어요."],
    ],
  },
} as const;

export default function DnaGuideButton({ initialAudience = "self" }: { initialAudience?: Audience }) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>(initialAudience);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const route = routes[audience];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => { setAudience(initialAudience); setOpen(true); }}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-card px-5 py-3 text-[15px] font-bold text-brand transition-colors hover:bg-brand-soft ${focusRing}`}
      >
        {initialAudience === "parent" ? "부모님을 위한 DNA 채취 안내" : "DNA 검사·가족 찾기 안내"}
        <ArrowRightIcon size={16} strokeWidth={2.2} />
      </button>
      {open && (
        <Modal title="DNA 검사로 가족을 찾는 방법" onClose={() => setOpen(false)} returnFocusTo={triggerRef.current} mobileFullscreen>
          <p className="text-[14px] leading-relaxed break-keep text-muted">본인 또는 실종아동을 찾는 부모님을 위한 절차 안내입니다. 먼저 182에서 대상 여부와 방문 방법을 확인해 주세요.</p>
          <fieldset className="mt-5">
            <legend className="mb-2 text-[13px] font-bold text-muted">어떤 상황인가요?</legend>
            <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              {(Object.keys(routes) as Audience[]).map((key) => (
                <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold transition-colors ${audience === key ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-muted"}`}>
                  <input type="radio" name="dna-audience" value={key} checked={audience === key} onChange={() => setAudience(key)} className="h-4 w-4 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" />
                  {routes[key].label}
                </label>
              ))}
            </div>
          </fieldset>
          <section aria-label={route.heading} className="mt-5">
            <h3 className="text-[17px] font-extrabold">{route.heading}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed break-keep text-muted">{route.description}</p>
            <ol className="mt-5 flex flex-col gap-3.5">
              {route.steps.map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-extrabold text-brand">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed break-keep text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <aside className="mt-5 rounded-xl bg-surface p-4">
            <h3 className="text-[14px] font-bold">알아두세요</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] leading-relaxed break-keep text-muted">
              <li>부모와 자녀가 같은 날 검체를 채취할 필요는 없어요.</li>
              <li>DNA 등록만으로 가족 확인이 보장되지는 않아요.</li>
              <li>지문·사진 등을 등록하는 실종 예방 사전등록과 DNA 검사는 달라요.</li>
              <li>FindUs는 DNA나 신청자 정보를 수집하지 않아요. 실제 절차는 공식 기관의 안내를 따라 주세요.</li>
            </ul>
          </aside>
          <div className="mt-5 grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
            <a href="tel:182" className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-[14px] font-bold text-white hover:bg-brand-dark ${focusRing}`}>
              <PhoneIcon size={17} />182에 전화하기
            </a>
            <a href={OFFICIAL_DNA_URL} target="_blank" rel="noopener noreferrer" className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border border-line px-4 py-3 text-[14px] font-bold text-brand hover:bg-brand-soft ${focusRing}`}>
              안전Dream 공식 안내 <ArrowUpRightIcon size={14} />
            </a>
          </div>
          <div className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-muted">
            <p>참고: 경찰청 안전Dream 유전자(DNA) 분석 정책 · 공식 안내 확인일 2026. 10. 14.</p>
            <a href="/documents/dna-collection-guide.pdf" download className={`mt-1 inline-block font-bold text-brand underline underline-offset-2 ${focusRing}`}>참고용 안내 자료 PDF 내려받기</a>
            <p className="mt-1">PDF는 참고 자료입니다. 대상 요건과 준비물 등 최신 절차는 182에서 확인해 주세요.</p>
          </div>
        </Modal>
      )}
    </>
  );
}

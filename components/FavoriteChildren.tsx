"use client";

import Link from "next/link";
import { useState } from "react";
import { selectFavoritePersons, setOwnChild } from "@/lib/favorites";
import { useFavorites } from "@/lib/useFavorites";
import { isVerifiedFor } from "@/lib/familyVerification";
import { useFamilyRecord } from "@/lib/useFamily";
import FamilyBadge from "./FamilyBadge";
import type { MissingPerson } from "@/lib/types";
import { ArrowRightIcon, HeartIcon } from "./Icons";
import FavoriteButton from "./FavoriteButton";
import MobilePersonDetail from "./MobilePersonDetail";
import ReportGuideModal from "./ReportGuideModal";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function FavoriteChildren({ userId, persons }: { userId: string; persons: MissingPerson[] }) {
  const favorites = useFavorites(userId);
  const family = useFamilyRecord(userId);
  const saved = selectFavoritePersons(persons, favorites);
  const [report, setReport] = useState<{ person: MissingPerson; trigger: HTMLElement } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pin = (id: string | null) => {
    try { setOwnChild(userId, id); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : "다시 시도해 주세요."); }
  };

  return (
    <section aria-labelledby="favorite-children" className="mb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex items-center gap-2">
          <h2 id="favorite-children" className="flex items-center gap-2 text-[21px] font-extrabold max-md:text-[18px]"><HeartIcon className="text-brand" size={22} />관심 아동 <span className="text-[14px] text-brand">{saved.length}명</span></h2>
          <details className="static">
            <summary aria-label="관심 아동 이용 안내" className={`flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full text-[18px] text-muted hover:bg-white/70 ${FOCUS} [&::-webkit-details-marker]:hidden`}>ⓘ</summary>
            <p className="absolute top-full left-0 z-10 mt-2 w-56 max-w-[calc(100vw-80px)] rounded-xl border border-line bg-card p-4 text-[13px] leading-relaxed text-muted shadow-panel">관심 목록은 이 브라우저에만 저장됩니다. 관심 등록한 아동을 바로 확인하세요. 카드의 ‘내 아이’를 누르면 맨 앞에 고정됩니다.</p>
          </details>
        </div>
        <Link href="/search" aria-label="관심 아동 추가하기" className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-[13px] font-bold text-brand hover:bg-white/60 ${FOCUS}`}><span className="max-sm:hidden">아동</span> 추가 <ArrowRightIcon size={16} className="max-sm:hidden" /></Link>
      </div>
      {error && <p role="alert" className="mt-4 text-[14px] text-red">{error}</p>}
      {saved.length === 0 ? (
        <div data-favorite-empty className="mt-6 rounded-2xl border border-line bg-card px-5 py-12 text-center">
          <span aria-hidden="true" data-favorite-empty-icon className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF4F3] text-[#D4675E]"><HeartIcon size={30} /></span>
          <p className="mt-4 font-bold">아직 관심 등록한 아동이 없어요.</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">실종아동 카드의 하트 버튼을 눌러 관심 아동에 추가해 보세요.</p>
          <Link href="/search" className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-[14px] font-bold text-white hover:bg-brand-dark ${FOCUS}`}>실종아동 찾아보기 <ArrowRightIcon size={16} /></Link>
        </div>
      ) : (
        <>
          <p data-mock-label className="mt-3 text-[12px] text-muted max-md:sr-only">자료 출처: 경찰청 · 관심 목록은 이 브라우저에만 저장됩니다.</p>
          <div data-favorite-grid className="mt-3 grid grid-cols-1 gap-5 max-md:mt-2">
            {saved.map((person) => {
              const own = favorites.ownChildId === person.id;
              // 가족으로 확인된 아이는 '내 아이' 대신 가족 배지를 단다. '내 아이'는 화면 정렬용일 뿐 인증이 아니다.
              const verified = !!person.sourceId && isVerifiedFor(family, person.sourceId);
              return (
                <article data-favorite-card key={person.id} aria-labelledby={`favorite-person-${person.id}`} className="flex min-w-0 flex-col rounded-2xl border border-line bg-card p-6 max-md:p-3">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <h3 id={`favorite-person-${person.id}`} className="text-[21px] font-extrabold max-md:text-[18px]">{person.name}</h3>
                    <div className="ml-auto flex items-center gap-1.5">
                  {verified ? <FamilyBadge label="가족 확인됨" /> : <button
                    type="button"
                    aria-pressed={own}
                    aria-label={`${person.name} 내 아이`}
                    title={own ? "내 아이 우선 표시 해제" : "내 아이로 지정하여 맨 앞에 표시"}
                    onClick={() => pin(own ? null : person.id)}
                    className={`inline-flex items-center rounded-full px-3 py-2 text-[12px] font-bold transition-colors ${FOCUS} ${own ? "bg-brand text-white hover:bg-brand-dark" : "bg-brand-soft text-brand hover:bg-brand/15"}`}
                  >내 아이</button>}
                      <FavoriteButton personId={person.id} name={person.name} />
                    </div>
                  </header>
                  <MobilePersonDetail embedded person={person} onReport={(trigger) => setReport({ person, trigger })} />
                </article>
              );
            })}
          </div>
        </>
      )}
      {report && <ReportGuideModal person={report.person} returnFocusTo={report.trigger} onClose={() => setReport(null)} />}
    </section>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { DEMO_PHOTOS } from "@/lib/aiDemo";

/** 원본과 AI 예상 모습을 손잡이로 끌어 비교한다. 키보드 방향키로도 움직인다. */
export default function AgeCompareSlider() {
  const [pos, setPos] = useState(50);

  return (
    <figure className="mx-auto w-full max-w-105">
      <div className="relative aspect-[543/724] touch-pan-y overflow-hidden rounded-3xl bg-[#e9ecea] has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-brand">
        <Image src={DEMO_PHOTOS.past} alt="" fill sizes="420px" className="object-cover" />
        <Image src={DEMO_PHOTOS.aged} alt="" fill sizes="420px" className="object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.15)]" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-1/2 items-center justify-center rounded-full bg-white text-[18px] font-extrabold text-brand shadow-lg">↔</span>
        </span>
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[12px] font-bold text-white">{DEMO_PHOTOS.ageFrom}세 · 원본</span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-brand px-3 py-1 text-[12px] font-bold text-white">{DEMO_PHOTOS.ageTo}세 · AI 생성</span>
        <input type="range" className="absolute inset-0 m-0 size-full cursor-ew-resize opacity-0" min={0} max={100} value={pos} onChange={(event) => setPos(Number(event.target.value))}
          aria-label="원본 사진과 AI 예상 모습 비교" aria-valuetext={`AI 예상 모습 ${100 - pos}% 보기`} />
      </div>
      <figcaption className="mt-3 text-center text-[13px] text-muted">손잡이를 좌우로 끌어 비교해 보세요. (가상 인물 예시)</figcaption>
    </figure>
  );
}

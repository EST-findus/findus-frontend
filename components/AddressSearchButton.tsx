"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "./Icons";
import Modal from "./Modal";

// 카카오(다음) 우편번호 서비스. 무료이며 키가 필요 없다. 버튼을 처음 누를 때만 스크립트를 불러온다.
// 팝업 창은 스크립트를 불러오는 사이 차단될 수 있어, 모달 안에 검색 화면을 넣어(embed) 쓴다.
const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

interface PostcodeData { zonecode: string; roadAddress: string; jibunAddress: string; buildingName: string; apartment: "Y" | "N" }
interface PostcodeApi { new (options: { oncomplete: (data: PostcodeData) => void; width: string; height: string }): { embed: (element: HTMLElement) => void } }
declare global { interface Window { daum?: { Postcode: PostcodeApi } } }

let loading: Promise<PostcodeApi> | null = null;
function loadPostcode(): Promise<PostcodeApi> {
  if (window.daum?.Postcode) return Promise.resolve(window.daum.Postcode);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.daum?.Postcode ? resolve(window.daum.Postcode) : reject(new Error("postcode")));
    script.onerror = () => { loading = null; script.remove(); reject(new Error("postcode")); };
    document.head.appendChild(script);
  });
  return loading;
}

export interface FoundAddress { zipcode: string; address: string }

export default function AddressSearchButton({ onSelect, className = "" }: { onSelect: (found: FoundAddress) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    loadPostcode().then((Postcode) => {
      if (!active || !box.current) return;
      new Postcode({
        width: "100%",
        height: "100%",
        oncomplete: (data) => {
          // 도로명 주소에 아파트·건물 이름을 붙인다. 도로명이 없으면 지번 주소를 쓴다.
          const base = data.roadAddress || data.jibunAddress;
          const building = data.buildingName && data.apartment === "Y" ? ` (${data.buildingName})` : "";
          onSelectRef.current({ zipcode: data.zonecode, address: `${base}${building}` });
          setOpen(false);
        },
      }).embed(box.current);
    }).catch(() => { if (active) { setFailed(true); setOpen(false); } });
    return () => { active = false; };
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)} disabled={failed}
        className={`inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[14px] font-bold text-brand hover:border-brand disabled:cursor-not-allowed disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}>
        <SearchIcon size={16} />주소 검색
      </button>
      {failed && <span role="status" className="text-[12px] text-muted">주소 검색을 불러오지 못했어요. 직접 입력해 주세요.</span>}
      {open && (
        <Modal title="주소 검색" onClose={() => setOpen(false)} returnFocusTo={trigger.current} mobileFullscreen>
          <div ref={box} className="h-[470px] w-full overflow-hidden rounded-xl border border-line max-sm:h-[calc(100dvh-120px)]" />
        </Modal>
      )}
    </>
  );
}

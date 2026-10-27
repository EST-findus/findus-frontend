"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CuteLoader from "./CuteLoader";

// 이동이 끝나지 않으면(오류 등) 이 시간 뒤에 막을 걷는다.
const GIVE_UP_MS = 12000;

/** 같은 사이트의 다른 페이지로 가는 일반 클릭인지. 새 탭·다운로드·같은 주소·외부 링크는 빼낸다. */
function isPageLink(event: MouseEvent): boolean {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return false;
  const next = new URL(anchor.href, location.href);
  if (next.origin !== location.origin) return false;
  return next.pathname !== location.pathname || next.search !== location.search;
}

/**
 * 페이지를 옮기는 동안 지금 페이지를 그대로 둔 채 반투명한 막과 로고 로더를 띄운다.
 * 링크를 누르면 켜지고, 주소가 바뀌어 새 페이지가 그려지면 꺼진다.
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => { if (isPageLink(event)) setPending(true); };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => setPending(false), [pathname, search]);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  if (!pending) return null;
  return (
    // 막은 살짝 투명하게 두어 뒤 페이지가 은은히 비치되, 살짝 흐려 "로딩 중" 글씨가 묻히지 않게 한다.
    <div className="fixed inset-0 z-100 grid place-items-center bg-white/75 backdrop-blur-[2px] motion-safe:animate-loader-overlay">
      <CuteLoader />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { toggleFavorite } from "@/lib/favorites";
import { useFavorites } from "@/lib/useFavorites";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { HeartIcon } from "./Icons";
import coralStyles from "./CoralAction.module.css";

const BUTTON = "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
// 사진 위에 얹는 동그란 하트 버튼 (홈 아동 카드)
const ICON_BUTTON = "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#D4675E] shadow-[0_4px_12px_rgba(23,59,112,.16)] transition-[background-color,transform] hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:hover:scale-100";

export default function FavoriteButton({ personId, name, variant = "pill" }: { personId: string; name: string; variant?: "pill" | "icon" }) {
  const icon = variant === "icon";
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const selected = favorites.ids.includes(personId);

  if (!user) return (
    <Link href={`/login?next=${encodeURIComponent(pathname === "/" ? "/search" : pathname)}`} aria-label={`${name} 관심 아동 등록하려면 로그인`} title={icon ? "관심 등록" : undefined} className={icon ? ICON_BUTTON : `${BUTTON} ${coralStyles.soft}`}><HeartIcon size={icon ? 19 : 16} />{!icon && "관심 등록"}</Link>
  );

  return (
    <div>
      <button type="button" title="관심 목록은 이 브라우저에만 저장됩니다" aria-label={`${name} 관심 아동 ${selected ? "해제" : "등록"}`} aria-pressed={selected} onClick={() => {
        try { toggleFavorite(user.id, personId); setError(null); }
        catch (err) { setError(err instanceof Error ? err.message : "다시 시도해 주세요."); }
      }} className={icon ? ICON_BUTTON : `${BUTTON} ${coralStyles.soft}`}><HeartIcon size={icon ? 19 : 16} fill={selected ? "currentColor" : "none"} />{!icon && (selected ? "관심 아동" : "관심 등록")}</button>
      {error && <p role="alert" className="mt-2 max-w-48 text-[12px] text-red">{error}</p>}
    </div>
  );
}

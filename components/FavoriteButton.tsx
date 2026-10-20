"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { toggleFavorite } from "@/lib/favorites";
import { useFavorites } from "@/lib/useFavorites";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { HeartIcon } from "./Icons";

const BUTTON = "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function FavoriteButton({ personId, name }: { personId: string; name: string }) {
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const selected = favorites.ids.includes(personId);

  if (!user) return (
    <Link href={`/login?next=${encodeURIComponent(pathname === "/" ? "/search" : pathname)}`} aria-label={`${name} 관심 아동 등록하려면 로그인`} className={`${BUTTON} bg-surface text-muted hover:bg-red-soft hover:text-red-dark`}><HeartIcon size={16} />관심 등록</Link>
  );

  return (
    <div>
      <button type="button" title="관심 목록은 이 브라우저에만 저장됩니다" aria-label={`${name} 관심 아동 ${selected ? "해제" : "등록"}`} aria-pressed={selected} onClick={() => {
        try { toggleFavorite(user.id, personId); setError(null); }
        catch (err) { setError(err instanceof Error ? err.message : "다시 시도해 주세요."); }
      }} className={`${BUTTON} ${selected ? "bg-red-soft text-red-dark hover:bg-red-100" : "bg-surface text-muted hover:bg-red-soft hover:text-red-dark"}`}><HeartIcon size={16} fill={selected ? "currentColor" : "none"} />{selected ? "관심 아동" : "관심 등록"}</button>
      {error && <p role="alert" className="mt-2 max-w-48 text-[12px] text-red">{error}</p>}
    </div>
  );
}

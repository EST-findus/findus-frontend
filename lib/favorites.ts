import type { MissingPerson } from "./types";

export interface Favorites {
  ids: string[];
  ownChildId: string | null;
}

const EMPTY: Favorites = { ids: [], ownChildId: null };
const CHANGE = "findus:favorites-change";
const cache = new Map<string, { raw: string | null; value: Favorites }>();
const keyFor = (userId: string) => `findus:favorites:${userId}`;

export function getFavorites(userId: string | undefined): Favorites {
  if (!userId || typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try { raw = window.localStorage.getItem(keyFor(userId)); } catch { return EMPTY; }
  const previous = cache.get(userId);
  if (previous?.raw === raw) return previous.value;
  let value = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.ids)) {
      const ids = [...new Set<string>(parsed.ids.filter((id: unknown) => typeof id === "string" && id.length > 0))];
      value = { ids, ownChildId: typeof parsed.ownChildId === "string" && ids.includes(parsed.ownChildId) ? parsed.ownChildId : null };
    }
  } catch { /* 손상된 저장값은 빈 관심 목록으로 복원한다. */ }
  cache.set(userId, { raw, value });
  return value;
}

function save(userId: string, value: Favorites) {
  try { window.localStorage.setItem(keyFor(userId), JSON.stringify(value)); }
  catch { throw new Error("관심 아동을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); }
  window.dispatchEvent(new Event(CHANGE));
}

export function toggleFavorite(userId: string, personId: string) {
  const current = getFavorites(userId);
  const removing = current.ids.includes(personId);
  save(userId, {
    ids: removing ? current.ids.filter((id) => id !== personId) : [...current.ids, personId],
    ownChildId: removing && current.ownChildId === personId ? null : current.ownChildId,
  });
}

/** 본인 화면의 표시 순서 설정이며 가족관계 인증 정보로 사용하지 않는다. */
export function setOwnChild(userId: string, personId: string | null) {
  const current = getFavorites(userId);
  save(userId, {
    ids: personId && !current.ids.includes(personId) ? [...current.ids, personId] : current.ids,
    ownChildId: personId,
  });
}

export function selectFavoritePersons(persons: MissingPerson[], favorites: Favorites): MissingPerson[] {
  const byId = new Map(persons.map((person) => [person.id, person]));
  const ids = favorites.ownChildId
    ? [favorites.ownChildId, ...favorites.ids.filter((id) => id !== favorites.ownChildId)]
    : favorites.ids;
  return ids.flatMap((id) => { const person = byId.get(id); return person ? [person] : []; });
}

export const getServerFavorites = () => EMPTY;
export function subscribeFavorites(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

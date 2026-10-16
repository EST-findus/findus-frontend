import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMissingPersons } from "./data";
import { getFavorites, selectFavoritePersons, setOwnChild, subscribeFavorites, toggleFavorite } from "./favorites";

let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map();
  const events = new EventTarget();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
    dispatchEvent: events.dispatchEvent.bind(events),
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("관심 아동", () => {
  it("계정별로 분리하고 같은 아동은 중복 저장하지 않는다", () => {
    toggleFavorite("parent", "child-a");
    toggleFavorite("citizen", "child-b");
    expect(getFavorites("parent").ids).toEqual(["child-a"]);
    expect(getFavorites("citizen").ids).toEqual(["child-b"]);
    toggleFavorite("parent", "child-a");
    expect(getFavorites("parent").ids).toEqual([]);
    expect(getFavorites(undefined).ids).toEqual([]);
  });
  it("새로고침 후에도 관심 목록과 내 아이 우선 설정을 복원한다", async () => {
    toggleFavorite("parent", "child-a");
    setOwnChild("parent", "child-b");
    vi.resetModules();
    const refreshed = await import("./favorites");
    expect(refreshed.getFavorites("parent")).toEqual({ ids: ["child-a", "child-b"], ownChildId: "child-b" });
  });
  it("내 아이를 먼저 표시하고 해제하면 등록 순서로 돌아간다", async () => {
    const persons = await getMissingPersons();
    const a = persons[0].id;
    const b = persons[1].id;
    toggleFavorite("parent", a);
    toggleFavorite("parent", b);
    setOwnChild("parent", b);
    expect(selectFavoritePersons(persons, getFavorites("parent")).map((p) => p.id)).toEqual([b, a]);
    setOwnChild("parent", null);
    expect(selectFavoritePersons(persons, getFavorites("parent")).map((p) => p.id)).toEqual([a, b]);
  });
  it("내 아이를 관심 해제하면 우선 표시 설정도 지운다", () => {
    setOwnChild("parent", "child-a");
    toggleFavorite("parent", "child-a");
    expect(getFavorites("parent")).toEqual({ ids: [], ownChildId: null });
  });
  it("손상된 저장값을 복구하고 제공되지 않는 아동은 표시하지 않는다", async () => {
    storage.set("findus:favorites:parent", "broken");
    expect(getFavorites("parent").ids).toEqual([]);
    storage.set("findus:favorites:parent", JSON.stringify({ ids: ["missing", "missing", null], ownChildId: "other" }));
    expect(getFavorites("parent")).toEqual({ ids: ["missing"], ownChildId: null });
    expect(selectFavoritePersons(await getMissingPersons(), getFavorites("parent"))).toEqual([]);
  });
  it("같은 저장값은 안정적인 스냅샷을 주고 변경 시 화면 갱신을 알린다", () => {
    const changed = vi.fn();
    const stop = subscribeFavorites(changed);
    toggleFavorite("parent", "child-a");
    expect(changed).toHaveBeenCalledOnce();
    expect(getFavorites("parent")).toBe(getFavorites("parent"));
    stop();
    toggleFavorite("parent", "child-b");
    expect(changed).toHaveBeenCalledOnce();
  });
});

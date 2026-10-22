"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getFavorites, getServerFavorites, subscribeFavorites } from "./favorites";

export function useFavorites(userId: string | undefined) {
  const snapshot = useCallback(() => getFavorites(userId), [userId]);
  return useSyncExternalStore(subscribeFavorites, snapshot, getServerFavorites);
}

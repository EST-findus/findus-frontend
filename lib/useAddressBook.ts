"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getAddressBook, getServerAddressBook, subscribeAddressBook } from "./addressBook";

export function useAddressBook(userId: string | undefined) {
  const snapshot = useCallback(() => getAddressBook(userId), [userId]);
  return useSyncExternalStore(subscribeAddressBook, snapshot, getServerAddressBook);
}

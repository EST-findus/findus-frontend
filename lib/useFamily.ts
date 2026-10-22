"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getCampaignFamilies, getFamilyRecord, getServerCampaignFamilies, subscribeFamily } from "./familyVerification";

/** 로그인한 회원의 가족 인증 기록. 신청 전이면 null */
export function useFamilyRecord(userId: string | undefined) {
  const snapshot = useCallback(() => getFamilyRecord(userId), [userId]);
  return useSyncExternalStore(subscribeFamily, snapshot, () => null);
}

/** 캠페인 id → 가족 승인·한마디·공개 중지 상태 */
export function useCampaignFamilies() {
  return useSyncExternalStore(subscribeFamily, getCampaignFamilies, getServerCampaignFamilies);
}

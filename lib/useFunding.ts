"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CAMPAIGN, type Campaign } from "./funding";
import { getPledgesSnapshot, getServerPledgesSnapshot, subscribeFunding, summarize, type FundingSnapshot } from "./fundingStore";

/** 이 브라우저에 저장된 모든 캠페인의 후원. 서버 렌더링과 첫 화면에서는 빈 목록이다. */
export function usePledges() {
  return useSyncExternalStore(subscribeFunding, getPledgesSnapshot, getServerPledgesSnapshot);
}

/** 캠페인의 목업 기준값 + 이 브라우저의 후원. pledges에는 모든 캠페인의 후원이 들어 있다. */
export function useFunding(campaign: Campaign = CAMPAIGN): FundingSnapshot {
  const pledges = usePledges();
  return useMemo(() => ({ ...summarize(pledges, campaign), pledges }), [pledges, campaign]);
}

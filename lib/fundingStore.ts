// 후원 데이터 접근은 이 파일에만 둔다.
// 백엔드 펀딩 API·PG 결제가 준비되면 아래 "저장소" 영역의 함수 내부만 fetch로 교체한다.
// 지금은 브라우저 localStorage에 후원 내역을 저장하는 목업이며, 실제로 결제되지 않는다.

import { CAMPAIGN, CAMPAIGNS, pledgeTotal, tierById, validatePledge, type Campaign, type KeyringDesign, type PledgeInput, type Size, type TierId } from "./funding";

export type PledgeStatus = "paid" | "canceled";

export interface Pledge {
  no: string;
  /** 어느 캠페인 후원인지. 여러 캠페인을 열기 전에 저장된 후원은 없을 수 있어 대표 캠페인으로 본다. */
  campaignId?: string;
  round: number;
  tierId: TierId;
  sizes: Size[];
  extra: number;
  amount: number;
  userId: string | null;
  name: string;
  email: string;
  showOnWall: boolean;
  status: PledgeStatus;
  keyringDesign: KeyringDesign | null;
  createdAt: string;
}

export interface FundingSnapshot {
  raised: number;
  backers: number;
  sold: Partial<Record<TierId, number>>;
  pledges: Pledge[];
}

export const pledgeCampaignId = (pledge: Pledge) => pledge.campaignId ?? CAMPAIGN.id;

/** 후원이 속한 캠페인. 예시 캠페인도 찾아야 하므로 환경과 관계없이 전체에서 찾는다. */
export const campaignOf = (pledge: Pledge) => CAMPAIGNS.find((campaign) => campaign.id === pledgeCampaignId(pledge)) ?? CAMPAIGN;

/** 후원자 벽 목업 이름 (공개 동의한 것으로 가정) */
export const MOCK_WALL_NAMES = [
  "기억하는 사람", "망우동 이웃", "김○○", "오래 기억할게요", "박○○", "작은 관심", "이○○", "QR 지킴이",
  "최○○", "다시 만나요", "정○○", "오늘도 한 번 더", "한○○", "길 위의 기억", "윤○○", "함께 찾아요",
];

/** "FU-2610-7K3Q" 형식. 회차 시작 연월 + 임의 4자리 */
export function makePledgeNo(random: () => number = Math.random, startsAt = CAMPAIGN.startsAt): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const code = Array.from({ length: 4 }, () => chars[Math.floor(random() * chars.length)]).join("");
  return `FU-${startsAt.slice(2, 4)}${startsAt.slice(5, 7)}-${code}`;
}

/** 목업 기준값에 로컬 후원을 더한다. 취소된 후원은 빼고 계산한다. */
export function summarize(pledges: Pledge[], campaign: Campaign = CAMPAIGN): Omit<FundingSnapshot, "pledges"> {
  const active = pledges.filter((pledge) => pledge.status === "paid" && pledgeCampaignId(pledge) === campaign.id);
  const sold: Partial<Record<TierId, number>> = { ...campaign.baseSold };
  for (const pledge of active) sold[pledge.tierId] = (sold[pledge.tierId] ?? 0) + 1;
  return {
    raised: campaign.baseRaised + active.reduce((sum, pledge) => sum + pledge.amount, 0),
    backers: campaign.baseBackers + active.length,
    sold,
  };
}

// ───────────────────────── 저장소 ─────────────────────────

const PLEDGES_KEY = "findus:pledges";
const CHANGE_EVENT = "findus:funding-change";

function readPledges(): Pledge[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PLEDGES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePledges(pledges: Pledge[]) {
  try {
    window.localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
  } catch {
    throw new Error("저장 공간에 접근할 수 없어 처리하지 못했어요.");
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export async function createPledge(input: PledgeInput, userId: string | null, campaign: Campaign = CAMPAIGN): Promise<Pledge> {
  const error = validatePledge(input, campaign);
  if (error) throw new Error(error);
  const tier = tierById(input.tierId, campaign)!;
  const pledges = readPledges();
  const sold = summarize(pledges, campaign).sold[tier.id] ?? 0;
  if (tier.limit !== null && sold >= tier.limit) throw new Error("이 리워드는 마감됐어요. 다른 리워드를 골라 주세요.");
  let no = makePledgeNo(Math.random, campaign.startsAt);
  while (pledges.some((pledge) => pledge.no === no)) no = makePledgeNo(Math.random, campaign.startsAt);
  // 배송지·연락처는 결제 대행사와 백엔드로만 보내고 브라우저에는 남기지 않는다.
  const pledge: Pledge = {
    no,
    campaignId: campaign.id,
    round: campaign.round,
    tierId: tier.id,
    sizes: input.sizes.slice(0, tier.sizeCount),
    extra: Math.max(0, Math.floor(input.extra)),
    amount: pledgeTotal(tier, input.extra),
    userId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    showOnWall: input.showOnWall,
    status: "paid",
    keyringDesign: null,
    createdAt: new Date().toISOString(),
  };
  savePledges([...pledges, pledge]);
  return pledge;
}

function updatePledge(no: string, userId: string, change: (pledge: Pledge) => Pledge) {
  const pledges = readPledges();
  const target = pledges.find((pledge) => pledge.no === no && pledge.userId === userId);
  if (!target) throw new Error("후원 내역을 찾지 못했어요.");
  savePledges(pledges.map((pledge) => (pledge === target ? change(pledge) : pledge)));
}

/** 마감 전에만 전액 취소할 수 있다. */
export async function cancelPledge(no: string, userId: string, now = new Date()) {
  updatePledge(no, userId, (pledge) => {
    if (now > new Date(campaignOf(pledge).endsAt)) throw new Error("마감 후에는 제작이 시작돼 취소할 수 없어요.");
    return { ...pledge, status: "canceled" };
  });
}

export async function chooseKeyringDesign(no: string, userId: string, design: KeyringDesign) {
  updatePledge(no, userId, (pledge) => ({ ...pledge, keyringDesign: design }));
}

/** 완료 화면용. 같은 브라우저에서 만든 후원만 찾는다. */
export const findPledge = (no: string) => readPledges().find((pledge) => pledge.no === no) ?? null;

// useSyncExternalStore용. 같은 값이면 같은 배열을 돌려줘야 다시 그리지 않는다.
// 캠페인별 집계는 useFunding(campaign)에서 이 목록으로 계산한다.
let cachedRaw: string | null | undefined;
let cachedPledges: Pledge[] = [];
const SERVER_PLEDGES: Pledge[] = [];

export function getPledgesSnapshot(): Pledge[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PLEDGES_KEY);
  } catch {
    return SERVER_PLEDGES;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPledges = readPledges();
  }
  return cachedPledges;
}

export const getServerPledgesSnapshot = () => SERVER_PLEDGES;

export function subscribeFunding(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// 리워드 펀딩의 회차 정보와 계산 규칙. 브라우저/서버 어디서든 쓸 수 있게 순수 함수로 둔다.
// 기준 문서: docs/[03] 펀딩_계획_화면흐름.md (1-3 리워드, 1-4 스트레치 골, 1-5 목표·환불, 2-4 상태)
// 백엔드가 준비되면 CAMPAIGN은 API 응답으로 바뀌고, 아래 함수는 그대로 쓴다.

export type TierId = "cheer" | "keyring" | "ecobag" | "tshirt" | "hoodie" | "family";
/** 굿즈 진화 무대에 올라가는 것. extras = 패밀리 세트의 추가 티셔츠·키링, numbered = 한정 넘버링 카드 */
export type GoodsKind = "card" | "keyring" | "ecobag" | "tshirt" | "hoodie" | "extras" | "numbered";
export type Size = "S" | "M" | "L" | "XL";

export interface RewardTier {
  id: TierId;
  price: number;
  title: string;
  summary: string;
  items: string[];
  /** 굿즈 진화 무대에 올라가는 이 단계의 실제 구성 */
  stage: GoodsKind[];
  needsShipping: boolean;
  /** 사이즈를 고를 옷 수. 0이면 사이즈 없음 */
  sizeCount: number;
  /** 수량 제한. null이면 제한 없음 */
  limit: number | null;
}

export interface StretchGoal {
  amount: number;
  title: string;
  description: string;
  /** 키링 디자인처럼 후원자가 따로 골라야 하는 보너스 */
  needsChoice?: boolean;
}

/** 펀딩이 함께 기억하는 아이. 경찰청 관리번호로 실종아동 DB와 연결해 공식 사진·정보를 가져온다. */
export interface CampaignChild {
  /** 경찰청 관리번호 (MissingPerson.sourceId) */
  sourceId: string;
  /** DB 연결이 안 될 때 보여줄 이름 */
  name: string;
}

/**
 * 모인 돈이 가는 곳. 아이를 내건 펀딩은 실종아동법 제15조(신상정보 목적 외 이용 금지)에 따라
 * 찾기 목적에만 쓴다. FindUs 운영비는 넣지 않는다(운영비는 기업 후원으로 충당).
 * 굿즈 제작·배송은 실제 원가만큼 쓰고(fundingBudget), 남은 돈을 share 비율로 홍보·기부에 나눈다.
 */
export interface FundsBucket {
  id: "goods" | "search" | "family";
  /** 원가를 뺀 나머지를 나누는 비율. goods는 실제 원가라 0 */
  share: number;
  title: string;
  description: string;
}

export interface Campaign {
  /** 주소에 쓰는 이름 (/funding/[id]) */
  id: string;
  round: number;
  title: string;
  subtitle: string;
  child: CampaignChild;
  /** 이야기 구역에 책자 기반 긴 이야기(fundingStory)가 있는지. 없으면 공식 실종 정보로 대신한다. */
  hasStory: boolean;
  /**
   * 화면 확인용 예시 캠페인. 가족 동의를 받지 않은 실제 아동이라 개발 환경에서만 보이고,
   * 배포(production)에서는 목록에서 빠지고 상세 주소도 열리지 않는다.
   */
  example: boolean;
  goal: number;
  startsAt: string;
  endsAt: string;
  /** 목업 기준 모금액·후원자 수. 로컬 후원은 fundingStore에서 더한다. [가정] */
  baseRaised: number;
  baseBackers: number;
  /** 리워드별 이미 팔린 수량(목업) */
  baseSold: Partial<Record<TierId, number>>;
  deliveryNote: string;
  tiers: RewardTier[];
  stretchGoals: StretchGoal[];
  fundsPlan: FundsBucket[];
}

export const SIZES: Size[] = ["S", "M", "L", "XL"];
export const KEYRING_DESIGNS = [
  { id: "classic", label: "A · 하트 돋보기" },
  { id: "light", label: "B · 길을 비추는 등불" },
] as const;
export type KeyringDesign = (typeof KEYRING_DESIGNS)[number]["id"];

// 리워드 단계와 스트레치 골은 모든 캠페인이 같이 쓴다. (bonusesFor가 골 금액을 기준으로 보너스를 붙인다)
const TIERS: RewardTier[] = [
  { id: "cheer", price: 5_000, title: "응원", summary: "후원자 벽에 이름 + 디지털 감사 카드", items: ["후원자 벽에 이름", "디지털 감사 카드"], stage: ["card"], needsShipping: false, sizeCount: 0, limit: null },
  { id: "keyring", price: 15_000, title: "QR 키링", summary: "아크릴 키링 + QR 스티커 + 안내 카드", items: ["아크릴 키링(QR 각인)", "QR 스티커", "안내 카드"], stage: ["card", "keyring"], needsShipping: true, sizeCount: 0, limit: null },
  { id: "ecobag", price: 29_000, title: "에코백 세트", summary: "키링 구성 + 캔버스 에코백", items: ["키링 구성 전체", "캔버스 에코백(QR 인쇄)"], stage: ["card", "keyring", "ecobag"], needsShipping: true, sizeCount: 0, limit: null },
  { id: "tshirt", price: 49_000, title: "티셔츠 세트", summary: "에코백 세트 + 고중량 면 티셔츠", items: ["에코백 세트 전체", "고중량 면 티셔츠(등판 반사 QR)"], stage: ["card", "keyring", "ecobag", "tshirt"], needsShipping: true, sizeCount: 1, limit: null },
  { id: "hoodie", price: 89_000, title: "후드 세트", summary: "에코백 세트 + 기모 후드", items: ["에코백 세트 전체", "기모 후드(자수 로고 + 반사 QR)"], stage: ["card", "keyring", "ecobag", "hoodie"], needsShipping: true, sizeCount: 1, limit: null },
  { id: "family", price: 149_000, title: "패밀리 세트", summary: "후드 1 + 티셔츠 2 + 키링 3 + 에코백", items: ["후드 1", "티셔츠 2", "키링 3", "에코백 1", "한정 넘버링 카드"], stage: ["card", "keyring", "ecobag", "hoodie", "tshirt", "extras", "numbered"], needsShipping: true, sizeCount: 3, limit: 50 },
];

const STRETCH_GOALS: StretchGoal[] = [
  { amount: 3_000_000, title: "펀딩 성공", description: "각자 고른 세트 제작을 시작해요." },
  { amount: 5_000_000, title: "키링 디자인 2종", description: "키링이 들어간 세트는 두 가지 디자인 중 고를 수 있어요.", needsChoice: true },
  { amount: 10_000_000, title: "키링 세트에 에코백 추가", description: "QR 키링 후원자에게도 에코백을 무료로 보내요." },
  { amount: 20_000_000, title: "엽서·스티커팩", description: "모든 배송 세트에 엽서와 스티커팩을 넣어요." },
  { amount: 30_000_000, title: "실종아동의 날 캠페인", description: "5월 25일 캠페인을 열고 후원자를 초대해요." },
];

const DELIVERY_NOTE = "마감 후 4~6주 안에 받아요";

// 남은 돈의 배분 비율 [가정 · 팀 결정 필요]. 예전 고정 비율(홍보 25% : 기부 15%)과 같은 5:3. 문서 docs/[04] 4장 참고.
const FUNDS_PLAN: FundsBucket[] = [
  { id: "goods", share: 0, title: "굿즈 제작·배송", description: "QR 굿즈를 만들고 보내는 비용과 결제 수수료 (실제 원가만큼)" },
  { id: "search", share: 5, title: "아이 찾기 홍보", description: "QR 포스터 추가 인쇄, 실종 지역 옥외·온라인 광고" },
  { id: "family", share: 3, title: "실종아동 가족 지원 기부", description: "실종아동 가족 지원 기관에 기부 (기부처 결정 전)" },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "choi-junwon",
    round: 1,
    title: "기억을 들고 다니는 QR 굿즈",
    subtitle: "가방과 옷에 남은 작은 QR이, 오래된 실종아동의 얼굴을 다시 한 번 보게 합니다.",
    child: { sourceId: "48993", name: "최준원" },
    hasStory: true,
    // 이야기(fundingStory)가 가족·권리자 동의를 전제로 쓰였으므로 공개 캠페인으로 둔다. [가정]
    example: false,
    goal: 3_000_000,
    // 데모 화면을 위한 기간 [가정]. 실제 1회차 일정은 문서 1-8 참고.
    startsAt: "2026-10-12T00:00:00+09:00",
    endsAt: "2026-11-11T23:59:59+09:00",
    // 문서 1-3의 단계별 비율 가정(응원 15% · 키링 30% · 에코백 25% · 티셔츠 18% · 후드 9% · 패밀리 3%)으로 나눈 값
    baseRaised: 7_440_000,
    baseBackers: 218,
    baseSold: { cheer: 33, keyring: 65, ecobag: 54, tshirt: 39, hoodie: 20, family: 7 },
    deliveryNote: DELIVERY_NOTE,
    tiers: TIERS,
    stretchGoals: STRETCH_GOALS,
    fundsPlan: FUNDS_PLAN,
  },
  // ↓ 화면 확인용 예시. 실제 실종아동 DB의 아이와 연결하지만 가족 동의 전이라 개발 환경에서만 보인다.
  {
    id: "yoon-jihyun",
    round: 1,
    title: "오산의 봄을 기억하는 QR 굿즈",
    subtitle: "1999년 4월, 오산에서 사라진 일곱 살 아이를 다시 한 번 떠올리게 합니다.",
    child: { sourceId: "357307", name: "윤지현" },
    hasStory: false,
    example: true,
    goal: 3_000_000,
    startsAt: "2026-09-25T00:00:00+09:00",
    endsAt: "2026-10-24T23:59:59+09:00",
    baseRaised: 3_820_000,
    baseBackers: 131,
    baseSold: { cheer: 20, keyring: 40, ecobag: 33, tshirt: 24, hoodie: 11, family: 3 },
    deliveryNote: DELIVERY_NOTE,
    tiers: TIERS,
    stretchGoals: STRETCH_GOALS,
    fundsPlan: FUNDS_PLAN,
  },
  {
    id: "yoo-junho",
    round: 1,
    title: "집 앞에서 멈춘 시간을 잇는 QR 굿즈",
    subtitle: "1999년 3월, 집 앞에서 사라진 두 살 아이를 길 위에서 기억합니다.",
    child: { sourceId: "73244", name: "유준호" },
    hasStory: false,
    example: true,
    goal: 3_000_000,
    startsAt: "2026-11-16T00:00:00+09:00",
    endsAt: "2026-12-15T23:59:59+09:00",
    baseRaised: 0,
    baseBackers: 0,
    baseSold: {},
    deliveryNote: DELIVERY_NOTE,
    tiers: TIERS,
    stretchGoals: STRETCH_GOALS,
    fundsPlan: FUNDS_PLAN,
  },
  {
    id: "jo-haneul",
    round: 1,
    title: "구로의 유치원복을 기억하는 QR 굿즈",
    subtitle: "1995년 6월, 빨간 유치원복을 입고 사라진 네 살 아이를 기억합니다.",
    child: { sourceId: "86085", name: "조하늘" },
    hasStory: false,
    example: true,
    goal: 3_000_000,
    startsAt: "2026-08-01T00:00:00+09:00",
    endsAt: "2026-08-31T23:59:59+09:00",
    baseRaised: 11_350_000,
    baseBackers: 342,
    baseSold: { cheer: 51, keyring: 103, ecobag: 86, tshirt: 62, hoodie: 31, family: 9 },
    deliveryNote: DELIVERY_NOTE,
    tiers: TIERS,
    stretchGoals: STRETCH_GOALS,
    fundsPlan: FUNDS_PLAN,
  },
];

/** 대표 캠페인. 캠페인을 따로 넘기지 않는 계산 함수의 기본값이다. */
export const CAMPAIGN: Campaign = CAMPAIGNS[0];

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** 이 환경에서 보여줄 캠페인. 예시 캠페인은 배포 환경에서 뺀다. */
export const listedCampaigns = (production = IS_PRODUCTION) => CAMPAIGNS.filter((campaign) => !production || !campaign.example);

export const campaignById = (id: string | null | undefined, production = IS_PRODUCTION) =>
  listedCampaigns(production).find((campaign) => campaign.id === id) ?? null;

export const tierById = (id: string | null | undefined, campaign: Campaign = CAMPAIGN) =>
  campaign.tiers.find((tier) => tier.id === id) ?? null;

// ───────────────────────── 금액·기간 ─────────────────────────

export const formatWon = (amount: number) => `${Math.round(amount).toLocaleString("ko-KR")}원`;

/** 3,000,000 → "300만", 30,000,000 → "3,000만", 149,000 → "14.9만" */
export function formatManWon(amount: number): string {
  const man = amount / 10_000;
  if (man >= 10_000) return `${+(man / 10_000).toFixed(1)}억`;
  if (man >= 1) return `${(man < 100 ? +man.toFixed(1) : Math.round(man)).toLocaleString("ko-KR")}만`;
  return amount.toLocaleString("ko-KR");
}

/** 달성률(%). 목표를 넘으면 100을 넘는다. */
export const progressRate = (raised: number, goal: number) => (goal > 0 ? Math.floor((raised / goal) * 100) : 0);

const DAY = 24 * 60 * 60 * 1000;

/** 마감까지 남은 날. 마감일 당일은 1, 지났으면 0 */
export function daysLeft(endsAt: string, now: Date): number {
  const diff = new Date(endsAt).getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / DAY);
}

export type CampaignStatus = "upcoming" | "open" | "closing" | "success" | "failed";

export function campaignStatus(campaign: Pick<Campaign, "startsAt" | "endsAt" | "goal">, raised: number, now: Date): CampaignStatus {
  if (now < new Date(campaign.startsAt)) return "upcoming";
  if (now > new Date(campaign.endsAt)) return raised >= campaign.goal ? "success" : "failed";
  return daysLeft(campaign.endsAt, now) <= 3 ? "closing" : "open";
}

export const canBack = (status: CampaignStatus) => status === "open" || status === "closing";

// ───────────────────────── 리워드·스트레치 골 ─────────────────────────

/** 이 금액으로 받을 수 있는 가장 높은 리워드. 최소 금액보다 작으면 null */
export function tierForAmount(amount: number, campaign: Campaign = CAMPAIGN): RewardTier | null {
  return campaign.tiers.reduce<RewardTier | null>((best, tier) => (tier.price <= amount ? tier : best), null);
}

/** 바로 아래 단계와 비교해 이 단계에서 새로 들어온 굿즈 */
export function newGoods(tierId: TierId, campaign: Campaign = CAMPAIGN): GoodsKind[] {
  const index = campaign.tiers.findIndex((tier) => tier.id === tierId);
  if (index < 0) return [];
  const previous = campaign.tiers[index - 1]?.stage ?? [];
  return campaign.tiers[index].stage.filter((kind) => !previous.includes(kind));
}

export const unlockedGoals = (raised: number, campaign: Campaign = CAMPAIGN) =>
  campaign.stretchGoals.filter((goal) => raised >= goal.amount);

export const nextGoal = (raised: number, campaign: Campaign = CAMPAIGN) =>
  campaign.stretchGoals.find((goal) => raised < goal.amount) ?? null;

/**
 * 스트레치 골 트랙에서의 위치(0~1). 골 사이 금액 차이가 커서 골을 같은 간격으로 놓고,
 * 각 구간 안에서만 금액에 비례해 채운다. 첫 골까지가 첫 구간이다.
 */
export function trackPosition(raised: number, campaign: Campaign = CAMPAIGN): number {
  const amounts = [0, ...campaign.stretchGoals.map((goal) => goal.amount)];
  const segments = amounts.length - 1;
  for (let i = 1; i <= segments; i++) {
    if (raised < amounts[i]) return (i - 1 + Math.max(0, raised - amounts[i - 1]) / (amounts[i] - amounts[i - 1])) / segments;
  }
  return 1;
}

export function remainingStock(tier: RewardTier, sold: number): number | null {
  return tier.limit === null ? null : Math.max(0, tier.limit - sold);
}

/** 이 후원이 받는 스트레치 골 보너스 문구 */
export function bonusesFor(tierId: TierId, raised: number, campaign: Campaign = CAMPAIGN): string[] {
  const tier = tierById(tierId, campaign);
  if (!tier?.needsShipping) return [];
  const hasKeyring = tier.stage.includes("keyring");
  return unlockedGoals(raised, campaign).flatMap((goal) => {
    if (goal.amount === 5_000_000) return hasKeyring ? ["키링 디자인 선택"] : [];
    if (goal.amount === 10_000_000) return tierId === "keyring" ? ["에코백 무료 추가"] : [];
    if (goal.amount === 20_000_000) return ["엽서·스티커팩"];
    if (goal.amount === 30_000_000) return ["실종아동의 날 캠페인 초대"];
    return [];
  });
}

/** 키링 디자인을 골라야 하는 후원인지 */
export const needsKeyringChoice = (tierId: TierId, raised: number, campaign: Campaign = CAMPAIGN) =>
  bonusesFor(tierId, raised, campaign).includes("키링 디자인 선택");

// ───────────────────────── 후원 입력 ─────────────────────────

export interface PledgeInput {
  tierId: TierId;
  sizes: Size[];
  extra: number;
  name: string;
  phone: string;
  email: string;
  /** 받는 분. 비어 있으면 후원자 이름으로 보낸다. */
  recipient: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  memo: string;
  showOnWall: boolean;
  agreePrivacy: boolean;
  agreeMadeToOrder: boolean;
  agreeNews: boolean;
}

export const EXTRA_MAX = 1_000_000;

export const pledgeTotal = (tier: RewardTier, extra: number) => tier.price + Math.max(0, Math.floor(extra || 0));

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

/** 리워드 단계(F03) 검사. 문제가 없으면 null */
export function validateReward(input: Pick<PledgeInput, "tierId" | "sizes" | "extra">, campaign: Campaign = CAMPAIGN): string | null {
  const tier = tierById(input.tierId, campaign);
  if (!tier) return "리워드를 골라 주세요.";
  if (input.sizes.length < tier.sizeCount || input.sizes.slice(0, tier.sizeCount).some((size) => !SIZES.includes(size)))
    return "사이즈를 골라 주세요.";
  if (!Number.isFinite(input.extra) || input.extra < 0) return "추가 후원금은 0원 이상으로 입력해 주세요.";
  if (input.extra > EXTRA_MAX) return `추가 후원금은 ${formatWon(EXTRA_MAX)}까지 입력할 수 있어요.`;
  return null;
}

/** 후원 정보 단계(F04) 검사. 응원 단계는 배송 정보를 묻지 않는다. */
export function validatePledge(input: PledgeInput, campaign: Campaign = CAMPAIGN): string | null {
  const rewardError = validateReward(input, campaign);
  if (rewardError) return rewardError;
  const tier = tierById(input.tierId, campaign)!;
  if (!input.name.trim()) return "이름을 입력해 주세요.";
  if (!EMAIL_RE.test(input.email.trim())) return "이메일 형식이 올바르지 않아요.";
  if (tier.needsShipping) {
    if (!PHONE_RE.test(input.phone.trim())) return "휴대폰 번호를 확인해 주세요.";
    if (!input.address.trim()) return "배송지를 입력해 주세요.";
  }
  if (!input.agreePrivacy) return "개인정보 수집·이용에 동의해 주세요.";
  if (tier.needsShipping && !input.agreeMadeToOrder) return "주문 제작 상품의 취소 제한 안내에 동의해 주세요.";
  return null;
}

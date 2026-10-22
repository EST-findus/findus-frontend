// 굿즈 원가와 협력 기업. 후원금에서 실제 원가를 먼저 빼고, 남은 돈을 홍보·기부로 나눈다.
// 기준: docs/[03] 1-3 단가 가정, docs/[05] 기업 실종아동 캠페인 사례.
// 단가는 모두 [가정 · 견적으로 교체], 기업은 모두 스폰서십 협약 전 제안 대상이다.

import { CAMPAIGN, type Campaign, type FundsBucket, type RewardTier, type TierId } from "./funding";

/** 공개 단계. 펀딩 중에는 견적 기준 예상 → 마감 후 발주 확정 → 배송 후 영수증으로 바꾼다. */
export type CostStatus = "estimate" | "confirmed" | "paid";
export const COST_STATUS_LABEL: Record<CostStatus, string> = {
  estimate: "예상 · 견적 기준",
  confirmed: "확정 · 발주",
  paid: "집행 · 영수증",
};

// ───────────────────────── 협력 기업 ─────────────────────────

export type PartnerRole = "making" | "shipping" | "payment" | "promotion" | "donation" | "sponsor";

export const PARTNER_ROLES: { id: PartnerRole; title: string; description: string }[] = [
  { id: "making", title: "만드는 곳", description: "QR 굿즈를 만들어요. 키링·에코백 제작사는 견적을 받고 있어요." },
  { id: "shipping", title: "보내는 곳", description: "굿즈를 포장해 보내요. 배송을 위해 받는 분 이름·연락처·주소를 맡기고(개인정보 처리위탁), 배송이 끝나면 파기해요." },
  { id: "payment", title: "결제 · 정산", description: "후원금을 결제받고, 모금 계좌에서 쓴 내역을 그대로 공개해요." },
  { id: "promotion", title: "찾기 홍보", description: "실종 지역을 중심으로 아이의 정보와 제보 QR을 보여줘요." },
  { id: "donation", title: "기부처 후보", description: "실종아동 가족 지원 기부금을 받을 곳이에요. 펀딩 공개 전에 한 곳을 정해요." },
  { id: "sponsor", title: "회차 스폰서", description: "디자인·샘플 같은 고정비와 FindUs 운영비를 맡아요. 후원금에는 운영비를 넣지 않아요." },
];

export interface PartnerSource {
  label: string;
  url: string;
}

export interface Partner {
  id: string;
  name: string;
  role: PartnerRole;
  /** proposal = 제안 대상(협약 전), signed = 스폰서십·업무 협약 완료 */
  status: "proposal" | "signed";
  /** FindUs가 맡기려는 일 */
  ask: string;
  /** 고른 이유. 기업의 실종아동 캠페인 이력(docs/[05]) */
  why: string;
  sources: PartnerSource[];
  /** 공식 사이트에서 받은 로고 (public/images/partners, 출처는 sources.json). 없으면 이름 첫 글자로 대신한다. */
  logo?: { src: string; width: number; height: number };
}

// 출처는 docs/[05] 출처 목록의 번호를 그대로 쓴다.
const SOURCES = {
  K3: { label: "파이낸셜뉴스 2025.2", url: "https://www.fnnews.com/news/202502201644376892" },
  K4: { label: "데일리안", url: "https://www.dailian.co.kr/news/view/947357/" },
  K5: { label: "사이언스타임즈 2020", url: "https://www.sciencetimes.co.kr/news/62%EB%A7%8C%EA%B0%9C-%ED%83%9D%EB%B0%B0%EC%83%81%EC%9E%90%EC%97%90-%EC%8B%A4%EC%A2%85%EC%95%84%EB%8F%99-%EC%A0%95%EB%B3%B4-%EB%8B%B4%EB%8A%94%EB%8B%A4/?cat=16935" },
  K6: { label: "뉴데일리 2021.11", url: "https://biz.newdaily.co.kr/site/data/html/2021/11/09/2021110900210.amp.html" },
  K8: { label: "스마트투데이 2025.5", url: "https://www.smarttoday.co.kr/ko-kr/articles/81635" },
  K11: { label: "메트로신문 2021.12", url: "https://www.metroseoul.co.kr/article/20211208500077" },
  K12: { label: "헤럴드경제 2026.5", url: "https://www.heraldk.com/article/2026051915473364446" },
  K17: { label: "뉴시스 2025.9", url: "https://mobile.newsis.com/view/NISX20250922_0003339031" },
  K18: { label: "토스피드 2026.6", url: "https://toss.im/tossfeed/article/50621" },
  K20: { label: "헤럴드경제 2025.10", url: "https://www.heraldk.com/article/2025101523265327578" },
  K26: { label: "OSEN 2016.6", url: "https://osen.co.kr/article/G1110468312" },
  K27: { label: "더나은미래", url: "https://futurechosun.com/?p=22740" },
  A1: { label: "다자비 · 제20회 실종아동의 날 포상", url: "https://dazabi.com/insurance_magazine/article.php?id=21657" },
} satisfies Record<string, PartnerSource>;

// 모두 [가정 · 스폰서십 협약 전]. 협약을 맺으면 status를 signed로 바꾼다.
// 로고는 각 기관 공식 사이트에서 받았다(출처: public/images/partners/sources.json). 협약 때 기업의 브랜드 가이드에 맞는 파일로 바꾼다.
export const PARTNERS: Partner[] = [
  {
    id: "blackyak", name: "블랙야크강태선나눔재단", role: "making", status: "proposal",
    ask: "후드·티셔츠 제작 협력 또는 원단 후원",
    why: "2021년부터 등산 배낭 홍보택으로 실종아동을 알렸고, 2026년 실종아동의 날 보건복지부 장관 표창을 받았어요.",
    sources: [SOURCES.K12, SOURCES.A1],
    logo: { src: "/images/partners/blackyak.svg", width: 160, height: 42 },
  },
  {
    id: "hanjin", name: "한진", role: "shipping", status: "proposal",
    ask: "굿즈 택배 운송, 상자에 호프테이프 사용",
    why: "2020년부터 나이변환 몽타주와 QR이 들어간 '호프테이프'를 택배 상자에 붙여 누적 약 93만 개를 보냈고, 2021년 경찰청장 감사장을 받았어요.",
    sources: [SOURCES.K5, SOURCES.K6],
    logo: { src: "/images/partners/hanjin.png", width: 193, height: 42 },
  },
  {
    id: "epost", name: "우정사업본부 (우체국택배)", role: "shipping", status: "proposal",
    ask: "대체 운송사 · 도서산간 배송",
    why: "경찰청·한진·제일기획과 함께 호프테이프 캠페인을 시작한 기관이에요.",
    sources: [SOURCES.K5],
    logo: { src: "/images/partners/epost.png", width: 274, height: 44 },
  },
  {
    id: "toss", name: "토스", role: "payment", status: "proposal",
    ask: "결제(PG) 수수료 감면",
    why: "2026년 대전경찰청과 함께 실종경보를 토스 프론트 결제 단말기에 띄웠어요.",
    sources: [SOURCES.K18],
    logo: { src: "/images/partners/toss.png", width: 158, height: 48 },
  },
  {
    id: "nh", name: "NH농협은행", role: "payment", status: "proposal",
    ask: "모금 전용 계좌와 입출금 내역 공개",
    why: "2016년부터 인터넷뱅킹 이체 화면에 실종아동 정보를 띄웠고, 2025년 보건복지부 장관 표창을 받았어요.",
    sources: [SOURCES.K8],
    logo: { src: "/images/partners/nh.png", width: 215, height: 29 },
  },
  {
    id: "cu", name: "BGF리테일 (CU)", role: "promotion", status: "proposal",
    ask: "실종 지역 점포 결제단말기에 아이 정보와 제보 QR 송출",
    why: "결제단말기에 장기 실종아동 정보를 띄워, 화면에서 어릴 적 사진을 본 사람이 20년 만에 부모를 찾았어요. 편의점 신고 서비스 '아이CU'로는 200명이 귀가했어요.",
    sources: [SOURCES.K3, SOURCES.K4],
    logo: { src: "/images/partners/cu.png", width: 133, height: 82 },
  },
  {
    id: "daangn", name: "당근", role: "promotion", status: "proposal",
    ask: "실종 지역 동네생활 타깃 홍보",
    why: "2025년부터 경찰청 안전Dream의 실종 정보를 동네생활 게시판에 실시간으로 공유해요.",
    sources: [SOURCES.K17],
    logo: { src: "/images/partners/daangn.svg", width: 203, height: 114 },
  },
  {
    id: "ncrc", name: "아동권리보장원", role: "donation", status: "proposal",
    ask: "실종아동 가족 지원 기부처",
    why: "CU 결제단말기 송출, '런웨이 투 홈' 등 장기 실종아동 캠페인을 함께해 온 공공기관이에요.",
    sources: [SOURCES.K4, SOURCES.K20],
    logo: { src: "/images/agencies/ncrc.png", width: 244, height: 24 },
  },
  {
    id: "childfund", name: "초록우산", role: "donation", status: "proposal",
    ask: "실종아동 가족 지원 기부처",
    why: "SK와이번스 유니폼, 선거 홍보물 등으로 장기 실종아동을 알려 왔어요.",
    sources: [SOURCES.K26, SOURCES.K27],
    logo: { src: "/images/partners/childfund.png", width: 143, height: 43 },
  },
  {
    id: "kb", name: "KB국민은행", role: "sponsor", status: "proposal",
    ask: "회차 스폰서 (고정비 · 운영비)",
    why: "2026년 실종아동의 날에 경찰청장 감사장을 받았어요.",
    sources: [SOURCES.A1],
    logo: { src: "/images/partners/kb.png", width: 150, height: 28 },
  },
  {
    id: "tirtir", name: "티르티르", role: "sponsor", status: "proposal",
    ask: "회차 스폰서, 자사 택배 상자에 FindUs QR 라벨",
    why: "2021년 택배 상자 안쪽에 실종아동 라벨과 QR을 붙였어요.",
    sources: [SOURCES.K11],
    logo: { src: "/images/partners/tirtir.svg", width: 370, height: 68 },
  },
];

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * 이 환경에서 보여줄 협력 기업. 협약 전 기업 이름을 배포 화면에 내걸면 협력하는 것처럼 보이므로,
 * 제안 대상은 개발 환경에서만 보이고 배포에서는 협약한 곳만 보인다.
 */
export const listedPartners = (production = IS_PRODUCTION) => PARTNERS.filter((partner) => !production || partner.status === "signed");

export const partnerById = (id: string | null | undefined, production = IS_PRODUCTION) =>
  listedPartners(production).find((partner) => partner.id === id) ?? null;

// ───────────────────────── 원가 ─────────────────────────

type ItemId = "keyring" | "ecobag" | "tshirt" | "hoodie" | "postcard" | "shipping";

interface UnitCost {
  label: string;
  amount: number;
  /** 맡길 곳. null이면 견적을 받는 중 */
  partnerId: string | null;
}

// 단가 [가정 · 견적으로 교체]. docs/[03] 1-3, 1-4
export const UNIT_COSTS: Record<ItemId, UnitCost> = {
  keyring: { label: "QR 아크릴 키링 · 스티커 · 안내 카드", amount: 1_500, partnerId: null },
  ecobag: { label: "캔버스 에코백 (QR 인쇄)", amount: 2_530, partnerId: null },
  tshirt: { label: "고중량 면 티셔츠 (반사 QR)", amount: 12_000, partnerId: "blackyak" },
  hoodie: { label: "기모 후드 (자수 로고 + 반사 QR)", amount: 32_000, partnerId: "blackyak" },
  postcard: { label: "엽서 · 스티커팩", amount: 800, partnerId: null },
  shipping: { label: "택배 · 포장", amount: 3_500, partnerId: "hanjin" },
};

/** 카드 결제 수수료 3.4% + 부가세 [가정] */
export const PAYMENT_FEE_RATE = 0.034 * 1.1;

const TIER_ITEMS: Record<TierId, Partial<Record<ItemId, number>>> = {
  cheer: {},
  keyring: { keyring: 1 },
  ecobag: { keyring: 1, ecobag: 1 },
  tshirt: { keyring: 1, ecobag: 1, tshirt: 1 },
  hoodie: { keyring: 1, ecobag: 1, hoodie: 1 },
  family: { hoodie: 1, tshirt: 2, keyring: 3, ecobag: 1 },
};

export interface CostLine {
  id: ItemId | "fee";
  label: string;
  quantity: number;
  unit: number;
  amount: number;
  partnerId: string | null;
  status: CostStatus;
  /** 스트레치 골로 더해진 보너스 */
  bonus: boolean;
}

export interface BucketAmount {
  id: FundsBucket["id"];
  amount: number;
  /** 후원금에서 차지하는 몫(0~1) */
  ratio: number;
}

export interface Breakdown {
  total: number;
  lines: CostLine[];
  buckets: BucketAmount[];
}

/** 스트레치 골 보너스로 더 보내는 굿즈. funding.ts의 bonusesFor와 같은 골 금액을 쓴다. */
function bonusItems(tier: RewardTier, raised: number): Partial<Record<ItemId, number>> {
  if (!tier.needsShipping) return {};
  return {
    ...(raised >= 10_000_000 && tier.id === "keyring" ? { ecobag: 1 } : {}),
    ...(raised >= 20_000_000 ? { postcard: 1 } : {}),
  };
}

function line(id: ItemId, quantity: number, bonus: boolean): CostLine {
  const cost = UNIT_COSTS[id];
  return { id, label: cost.label, quantity, unit: cost.amount, amount: cost.amount * quantity, partnerId: cost.partnerId, status: "estimate", bonus };
}

/** 원가를 뺀 나머지를 share 비율로 홍보·기부에 원 단위로 나눈다. 반올림 차이는 첫 갈래에 더해 합계가 늘 total과 같다. */
function splitRest(total: number, goods: number, campaign: Campaign): BucketAmount[] {
  const capped = Math.min(total, goods);
  const rest = total - capped;
  const others = campaign.fundsPlan.filter((bucket) => bucket.id !== "goods");
  const shares = others.reduce((sum, bucket) => sum + bucket.share, 0);
  if (shares <= 0) throw new Error("홍보·기부 배분 비율이 필요해요.");
  const parts = others.map((bucket) => ({ id: bucket.id, amount: Math.floor((rest * bucket.share) / shares) }));
  if (parts[0]) parts[0].amount += rest - parts.reduce((sum, part) => sum + part.amount, 0);
  return [{ id: "goods" as const, amount: capped }, ...parts].map((part) => ({ ...part, ratio: total > 0 ? part.amount / total : 0 }));
}

const feeLine = (amount: number): CostLine => ({
  id: "fee", label: "카드 결제 수수료 (3.4% + 부가세)", quantity: 1, unit: amount, amount, partnerId: "toss", status: "estimate", bonus: false,
});

/** 결제 수수료를 뺀 굿즈·배송 원가 줄 */
function goodsLines(tier: RewardTier, raised: number): CostLine[] {
  const items = Object.entries(TIER_ITEMS[tier.id]) as [ItemId, number][];
  const bonus = Object.entries(bonusItems(tier, raised)) as [ItemId, number][];
  return [
    ...items.map(([id, quantity]) => line(id, quantity, false)),
    ...bonus.map(([id, quantity]) => line(id, quantity, true)),
    ...(tier.needsShipping ? [line("shipping", 1, false)] : []),
  ];
}

/**
 * 리워드 하나의 후원금이 어디에 얼마나 쓰이는지. 굿즈·배송·결제 수수료를 원가대로 먼저 빼고,
 * 남은 돈을 share 비율로 홍보·기부에 나눈다.
 */
export function tierBreakdown(tier: RewardTier, raised = 0, campaign: Campaign = CAMPAIGN): Breakdown {
  const total = tier.price;
  const lines = [...goodsLines(tier, raised), feeLine(Math.round(total * PAYMENT_FEE_RATE))];
  return { total, lines, buckets: splitRest(total, lines.reduce((sum, item) => sum + item.amount, 0), campaign) };
}

export interface ItemTotal {
  id: CostLine["id"];
  label: string;
  quantity: number;
  unit: number;
  amount: number;
  partnerId: string | null;
  status: CostStatus;
}

export interface CampaignBudget {
  total: number;
  /** 리워드 없이 더 낸 금액. 굿즈 없이 수수료만 빼고 홍보·기부로 간다. */
  extra: number;
  /** 품목별로 모은 원가. 보너스 굿즈도 같은 품목에 더한다. */
  items: ItemTotal[];
  buckets: BucketAmount[];
}

/**
 * 회차 전체 예산. 리워드별 판매 수량만큼 원가를 더하고, 결제 수수료는 모인 금액 전체에 매긴다.
 * 모인 금액에서 리워드 가격 합을 뺀 나머지는 추가 후원금으로 본다.
 */
export function campaignBudget(sold: Partial<Record<TierId, number>>, raised: number, campaign: Campaign = CAMPAIGN): CampaignBudget {
  const items = new Map<CostLine["id"], ItemTotal>();
  let rewards = 0;
  for (const tier of campaign.tiers) {
    const count = sold[tier.id] ?? 0;
    if (count <= 0) continue;
    rewards += tier.price * count;
    for (const item of goodsLines(tier, raised)) {
      const sum = items.get(item.id) ?? { id: item.id, label: item.label, quantity: 0, unit: item.unit, amount: 0, partnerId: item.partnerId, status: item.status };
      sum.quantity += item.quantity * count;
      sum.amount += item.amount * count;
      items.set(item.id, sum);
    }
  }
  const fee = feeLine(Math.round(raised * PAYMENT_FEE_RATE));
  const order = Object.keys(UNIT_COSTS);
  const list = [...[...items.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)), { ...fee, quantity: 1 }];
  return {
    total: raised,
    extra: Math.max(0, raised - rewards),
    items: list,
    buckets: splitRest(raised, list.reduce((sum, item) => sum + item.amount, 0), campaign),
  };
}

/** 한 번만 드는 비용. 후원금이 아니라 회차 스폰서가 맡는 것을 원칙으로 한다. [가정 · 결정 필요] */
export const FIXED_COSTS: { label: string; amount: number; note: string }[] = [
  { label: "디자인 · 샘플 · 포장 디자인 등 고정비", amount: 1_000_000, note: "회차 스폰서가 맡아요. 협약 전이면 굿즈 원가에 나눠 넣고 공개해요." },
  { label: "키링 디자인 2종 금형", amount: 300_000, note: "500만 원 스트레치 골을 넘으면 생겨요." },
];

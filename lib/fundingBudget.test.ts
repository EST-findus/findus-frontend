import { describe, expect, it } from "vitest";
import { CAMPAIGN, tierById } from "./funding";
import { campaignBudget, listedPartners, PARTNERS, partnerById, tierBreakdown, UNIT_COSTS } from "./fundingBudget";

const tier = (id: Parameters<typeof tierById>[0]) => tierById(id)!;
const amounts = (id: Parameters<typeof tierById>[0], raised = 0) =>
  Object.fromEntries(tierBreakdown(tier(id), raised).buckets.map((bucket) => [bucket.id, bucket.amount]));

describe("후원금 배분", () => {
  it("운영비 없이 찾기 목적에만 나눈다", () => {
    expect(CAMPAIGN.fundsPlan.map((bucket) => bucket.id)).toEqual(["goods", "search", "family"]);
  });

  it("굿즈 원가를 먼저 빼고 남은 돈을 홍보 5 : 기부 3으로 나눈다", () => {
    // 키링 1,500 + 에코백 2,530 + 티셔츠 12,000 + 택배 3,500 + 수수료 1,833
    expect(amounts("tshirt")).toEqual({ goods: 21_363, search: 17_274, family: 10_363 });
  });

  it("배송 없는 응원은 결제 수수료만 원가로 친다", () => {
    const breakdown = tierBreakdown(tier("cheer"));
    expect(breakdown.lines.map((item) => item.id)).toEqual(["fee"]);
    expect(breakdown.buckets[0].amount).toBe(187);
  });

  it("모든 리워드에서 합계가 후원금과 같다", () => {
    for (const item of CAMPAIGN.tiers) {
      for (const raised of [0, 10_000_000, 30_000_000]) {
        const breakdown = tierBreakdown(item, raised);
        expect(breakdown.buckets.reduce((sum, bucket) => sum + bucket.amount, 0)).toBe(item.price);
        expect(breakdown.buckets.reduce((sum, bucket) => sum + bucket.ratio, 0)).toBeCloseTo(1);
      }
    }
  });

  it("스트레치 골 보너스 굿즈도 원가에 넣는다", () => {
    const lines = tierBreakdown(tier("keyring"), 20_000_000).lines.filter((item) => item.bonus);
    expect(lines.map((item) => item.id)).toEqual(["ecobag", "postcard"]);
    expect(amounts("keyring", 20_000_000).goods - amounts("keyring").goods).toBe(UNIT_COSTS.ecobag.amount + UNIT_COSTS.postcard.amount);
  });

  it("패밀리 세트는 구성 수량만큼 곱한다", () => {
    const lines = tierBreakdown(tier("family")).lines;
    expect(lines.find((item) => item.id === "tshirt")).toMatchObject({ quantity: 2, amount: 24_000 });
    expect(lines.find((item) => item.id === "keyring")).toMatchObject({ quantity: 3, amount: 4_500 });
  });
});

describe("회차 전체 예산", () => {
  const budget = campaignBudget(CAMPAIGN.baseSold, CAMPAIGN.baseRaised);
  const item = (id: string) => budget.items.find((entry) => entry.id === id);

  it("판매 수량만큼 품목 수량을 더한다", () => {
    // 키링 65 + 에코백 세트 54 + 티셔츠 39 + 후드 20 + 패밀리 7×3
    expect(item("keyring")).toMatchObject({ quantity: 199, amount: 199 * 1_500 });
    expect(item("tshirt")?.quantity).toBe(39 + 7 * 2);
    expect(item("shipping")?.quantity).toBe(65 + 54 + 39 + 20 + 7);
  });

  it("목업 기준 모금액은 리워드 가격 합과 같아 추가 후원금이 없다", () => {
    expect(budget.extra).toBe(0);
    expect(budget.buckets.reduce((sum, bucket) => sum + bucket.amount, 0)).toBe(CAMPAIGN.baseRaised);
  });

  it("추가 후원금은 굿즈 없이 홍보·기부로 간다", () => {
    const more = campaignBudget(CAMPAIGN.baseSold, CAMPAIGN.baseRaised + 100_000);
    expect(more.extra).toBe(100_000);
    expect(more.buckets[0].amount - budget.buckets[0].amount).toBe(Math.round(100_000 * 0.0374));
  });

  it("아무도 후원하지 않으면 모두 0원", () => {
    expect(campaignBudget({}, 0).buckets.every((bucket) => bucket.amount === 0)).toBe(true);
  });
});

describe("협력 기업", () => {
  it("협약 전 제안 대상은 배포 환경에서 보이지 않는다", () => {
    expect(PARTNERS.every((partner) => partner.status === "proposal")).toBe(true);
    expect(listedPartners(true)).toEqual([]);
    expect(listedPartners(false)).toHaveLength(PARTNERS.length);
    expect(partnerById("hanjin", true)).toBeNull();
    expect(partnerById("hanjin", false)?.name).toBe("한진");
  });

  it("원가 항목이 가리키는 기업은 모두 목록에 있다", () => {
    const ids = new Set(PARTNERS.map((partner) => partner.id));
    for (const cost of Object.values(UNIT_COSTS)) if (cost.partnerId) expect(ids.has(cost.partnerId)).toBe(true);
  });
});

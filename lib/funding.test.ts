import { describe, expect, it } from "vitest";
import {
  CAMPAIGN,
  CAMPAIGNS,
  campaignById,
  listedCampaigns,
  bonusesFor,
  campaignStatus,
  daysLeft,
  formatManWon,
  newGoods,
  nextGoal,
  pledgeTotal,
  progressRate,
  remainingStock,
  tierById,
  tierForAmount,
  trackPosition,
  unlockedGoals,
  validatePledge,
  validateReward,
  type PledgeInput,
} from "./funding";
import { campaignOf, makePledgeNo, summarize, type Pledge } from "./fundingStore";

const base: PledgeInput = {
  tierId: "ecobag", sizes: [], extra: 0,
  name: "홍길동", phone: "010-1234-5678", email: "a@b.co",
  recipient: "", zipcode: "", address: "서울 중랑구", addressDetail: "", memo: "", showOnWall: true,
  agreePrivacy: true, agreeMadeToOrder: true, agreeNews: false,
};

describe("금액·기간", () => {
  it("달성률은 내림하고 목표를 넘으면 100을 넘는다", () => {
    expect(progressRate(2_999_999, 3_000_000)).toBe(99);
    expect(progressRate(7_420_000, 3_000_000)).toBe(247);
    expect(progressRate(100, 0)).toBe(0);
  });

  it("만 원 단위로 줄여 쓴다", () => {
    expect(formatManWon(3_000_000)).toBe("300만");
    expect(formatManWon(15_000)).toBe("1.5만");
    expect(formatManWon(149_000)).toBe("14.9만");
    expect(formatManWon(30_000_000)).toBe("3,000만");
  });

  it("남은 날은 마감 당일 1, 지나면 0", () => {
    const end = "2026-11-11T23:59:59+09:00";
    expect(daysLeft(end, new Date("2026-11-11T10:00:00+09:00"))).toBe(1);
    expect(daysLeft(end, new Date("2026-11-12T00:00:00+09:00"))).toBe(0);
    expect(daysLeft(end, new Date("2026-11-01T23:59:59+09:00"))).toBe(10);
  });

  it("상태는 기간과 목표로 정해진다", () => {
    const c = { startsAt: "2026-10-12T00:00:00+09:00", endsAt: "2026-11-11T23:59:59+09:00", goal: 3_000_000 };
    expect(campaignStatus(c, 0, new Date("2026-10-01T00:00:00+09:00"))).toBe("upcoming");
    expect(campaignStatus(c, 0, new Date("2026-10-20T00:00:00+09:00"))).toBe("open");
    expect(campaignStatus(c, 0, new Date("2026-11-09T00:00:00+09:00"))).toBe("closing");
    expect(campaignStatus(c, 3_000_000, new Date("2026-11-12T01:00:00+09:00"))).toBe("success");
    expect(campaignStatus(c, 2_999_999, new Date("2026-11-12T01:00:00+09:00"))).toBe("failed");
  });
});

describe("리워드·스트레치 골", () => {
  it("금액으로 받을 수 있는 가장 높은 단계를 고른다", () => {
    expect(tierForAmount(4_999)).toBeNull();
    expect(tierForAmount(5_000)?.id).toBe("cheer");
    expect(tierForAmount(48_999)?.id).toBe("ecobag");
    expect(tierForAmount(1_000_000)?.id).toBe("family");
  });

  it("단계마다 새로 들어온 굿즈만 고른다", () => {
    expect(newGoods("cheer")).toEqual(["card"]);
    expect(newGoods("tshirt")).toEqual(["tshirt"]);
    // 후드 세트는 티셔츠 대신 후드가 들어간다.
    expect(newGoods("hoodie")).toEqual(["hoodie"]);
    expect(newGoods("family")).toEqual(["tshirt", "extras", "numbered"]);
  });

  it("트랙 위치는 골 사이를 같은 간격으로 나눈다", () => {
    expect(trackPosition(0)).toBe(0);
    expect(trackPosition(1_500_000)).toBeCloseTo(0.1);
    expect(trackPosition(3_000_000)).toBeCloseTo(0.2);
    expect(trackPosition(7_500_000)).toBeCloseTo(0.5);
    expect(trackPosition(99_000_000)).toBe(1);
  });

  it("스트레치 골은 정확히 그 금액에서 열린다", () => {
    expect(unlockedGoals(2_999_999)).toHaveLength(0);
    expect(unlockedGoals(3_000_000)).toHaveLength(1);
    expect(nextGoal(3_000_000)?.amount).toBe(5_000_000);
    expect(nextGoal(30_000_000)).toBeNull();
  });

  it("보너스는 리워드 구성에 맞게 붙는다", () => {
    expect(bonusesFor("cheer", 30_000_000)).toEqual([]);
    expect(bonusesFor("keyring", 10_000_000)).toEqual(["키링 디자인 선택", "에코백 무료 추가"]);
    expect(bonusesFor("ecobag", 10_000_000)).toEqual(["키링 디자인 선택"]);
    expect(bonusesFor("keyring", 4_999_999)).toEqual([]);
  });

  it("남은 수량은 제한이 있을 때만 계산한다", () => {
    expect(remainingStock(tierById("family")!, 22)).toBe(28);
    expect(remainingStock(tierById("family")!, 60)).toBe(0);
    expect(remainingStock(tierById("keyring")!, 999)).toBeNull();
  });

  it("추가 후원금을 더한다", () => {
    expect(pledgeTotal(tierById("keyring")!, 5_000)).toBe(20_000);
    expect(pledgeTotal(tierById("keyring")!, -10)).toBe(15_000);
  });
});

describe("후원 입력 검사", () => {
  it("응원 단계는 배송 정보와 주문 제작 동의 없이 통과한다", () => {
    expect(validatePledge({ ...base, tierId: "cheer", phone: "", address: "", agreeMadeToOrder: false })).toBeNull();
  });

  it("배송 단계는 주문 제작 동의가 따로 필요하다", () => {
    expect(validatePledge({ ...base, agreeMadeToOrder: false })).toMatch("주문 제작");
    expect(validatePledge({ ...base, address: " " })).toMatch("배송지");
    expect(validatePledge({ ...base, agreePrivacy: false })).toMatch("개인정보");
  });

  it("옷이 들어간 단계는 사이즈를 옷 수만큼 고른다", () => {
    expect(validateReward({ tierId: "tshirt", sizes: [], extra: 0 })).toMatch("사이즈");
    expect(validateReward({ tierId: "family", sizes: ["M", "L"], extra: 0 })).toMatch("사이즈");
    expect(validateReward({ tierId: "family", sizes: ["M", "L", "S"], extra: 0 })).toBeNull();
    expect(validateReward({ tierId: "keyring", sizes: [], extra: -1 })).toMatch("0원 이상");
  });
});

describe("후원 집계", () => {
  const pledge = (over: Partial<Pledge>): Pledge => ({
    no: "FU-2610-AAAA", round: CAMPAIGN.round, tierId: "keyring", sizes: [], extra: 0, amount: 15_000,
    userId: null, name: "a", email: "a@b.co", showOnWall: true, status: "paid", keyringDesign: null, createdAt: "",
    ...over,
  });

  it("목업 기준값에 결제 완료 후원만 더한다", () => {
    const result = summarize([pledge({}), pledge({ status: "canceled", amount: 99_000 }), pledge({ tierId: "family", amount: 149_000 })]);
    expect(result.raised).toBe(CAMPAIGN.baseRaised + 164_000);
    expect(result.backers).toBe(CAMPAIGN.baseBackers + 2);
    expect(result.sold.family).toBe((CAMPAIGN.baseSold.family ?? 0) + 1);
    expect(result.sold.keyring).toBe((CAMPAIGN.baseSold.keyring ?? 0) + 1);
  });

  it("후원번호는 회차 시작 연월을 담는다", () => {
    expect(makePledgeNo(() => 0, "2026-10-12T00:00:00+09:00")).toBe("FU-2610-2222");
  });
});

describe("여러 캠페인", () => {
  const pledge = (over: Partial<Pledge>): Pledge => ({
    no: "FU-2610-BBBB", round: 1, tierId: "keyring", sizes: [], extra: 0, amount: 15_000,
    userId: null, name: "a", email: "a@b.co", showOnWall: true, status: "paid", keyringDesign: null, createdAt: "",
    ...over,
  });
  const other = CAMPAIGNS.find((campaign) => campaign.id !== CAMPAIGN.id)!;

  it("캠페인 id와 아이 관리번호는 겹치지 않는다", () => {
    expect(new Set(CAMPAIGNS.map((campaign) => campaign.id)).size).toBe(CAMPAIGNS.length);
    expect(new Set(CAMPAIGNS.map((campaign) => campaign.child.sourceId)).size).toBe(CAMPAIGNS.length);
  });

  it("예시 캠페인은 배포 환경에서 목록과 상세 모두에서 빠진다", () => {
    const example = CAMPAIGNS.find((campaign) => campaign.example)!;
    expect(listedCampaigns(true).some((campaign) => campaign.example)).toBe(false);
    expect(campaignById(example.id, true)).toBeNull();
    expect(campaignById(example.id, false)).toBe(example);
    expect(campaignById(CAMPAIGN.id, true)).toBe(CAMPAIGN);
  });

  it("후원은 자기 캠페인 모금액에만 더한다", () => {
    const pledges = [pledge({ campaignId: other.id, amount: 29_000, tierId: "ecobag" }), pledge({ campaignId: CAMPAIGN.id })];
    expect(summarize(pledges, other).raised).toBe(other.baseRaised + 29_000);
    expect(summarize(pledges, CAMPAIGN).raised).toBe(CAMPAIGN.baseRaised + 15_000);
  });

  it("캠페인 정보가 없는 예전 후원은 대표 캠페인 후원으로 본다", () => {
    expect(campaignOf(pledge({}))).toBe(CAMPAIGN);
    expect(summarize([pledge({})], CAMPAIGN).backers).toBe(CAMPAIGN.baseBackers + 1);
    expect(summarize([pledge({})], other).backers).toBe(other.baseBackers);
  });
});

import { describe, expect, it } from "vitest";
import { MAX_ADDRESSES, defaultAddress, emptyAddress, formatAddress, makeDefault, normalizeBook, remove, upsert, validateAddress, type Address, type AddressInput } from "./addressBook";

const input = (over: Partial<AddressInput> = {}): AddressInput => ({
  ...emptyAddress(), recipient: "홍길동", phone: "010-1234-5678", address: "서울 중랑구 망우로 1", ...over,
});
const NOW = "2026-10-22T00:00:00.000Z";
const fill = (count: number) => Array.from({ length: count }).reduce<Address[]>((book, _, index) => upsert(book, input(), `a${index}`, NOW), []);

describe("배송지 검사", () => {
  it("받는 분·휴대폰·주소가 필요하다", () => {
    expect(validateAddress(input())).toBeNull();
    expect(validateAddress(input({ recipient: " " }))).toMatch("받는 분");
    expect(validateAddress(input({ phone: "02-123-4567" }))).toMatch("휴대폰");
    expect(validateAddress(input({ address: "" }))).toMatch("주소");
    expect(validateAddress(input({ label: "아주아주긴배송지이름입니다" }))).toMatch("10자");
  });
});

describe("주소록", () => {
  it("첫 주소는 자동으로 기본 배송지가 된다", () => {
    const book = upsert([], input(), "a", NOW);
    expect(book[0].isDefault).toBe(true);
  });

  it(`최대 ${MAX_ADDRESSES}개까지 저장하고, 고치기는 개수와 상관없다`, () => {
    const full = fill(MAX_ADDRESSES);
    expect(() => upsert(full, input(), "new", NOW)).toThrow(`${MAX_ADDRESSES}개`);
    expect(upsert(full, input({ label: "회사" }), "a2", NOW).find((item) => item.id === "a2")?.label).toBe("회사");
  });

  it("기본 배송지는 항상 하나다", () => {
    const book = upsert(fill(3), input({ isDefault: true }), "b", NOW);
    expect(book.filter((item) => item.isDefault).map((item) => item.id)).toEqual(["b"]);
    expect(makeDefault(book, "a1").filter((item) => item.isDefault).map((item) => item.id)).toEqual(["a1"]);
    expect(makeDefault(book, "없음")).toBe(book);
  });

  it("기본 배송지를 고칠 때 기본 표시를 잃지 않는다", () => {
    const book = upsert(fill(2), input({ label: "본가" }), "a0", NOW);
    expect(defaultAddress(book)?.id).toBe("a0");
  });

  it("기본 배송지를 지우면 남은 첫 주소가 기본이 된다", () => {
    const book = remove(fill(3), "a0");
    expect(book.map((item) => item.id)).toEqual(["a1", "a2"]);
    expect(defaultAddress(book)?.id).toBe("a1");
    expect(defaultAddress(remove(book.slice(0, 1), "a1"))).toBeNull();
  });

  it("손상된 저장값은 버리고 기본 표시를 바로잡는다", () => {
    expect(normalizeBook("깨진 값")).toEqual([]);
    const fixed = normalizeBook([{ id: "x", address: "서울", isDefault: false }, null, { id: 1 }, { id: "y", address: "부산", isDefault: false }]);
    expect(fixed.map((item) => [item.id, item.isDefault])).toEqual([["x", true], ["y", false]]);
  });

  it("주소를 한 줄로 보여준다", () => {
    expect(formatAddress({ zipcode: "02830", address: "서울 중랑구 망우로 1", detail: "101동" })).toBe("(02830) 서울 중랑구 망우로 1, 101동");
    expect(formatAddress({ zipcode: "", address: "서울", detail: "" })).toBe("서울");
  });
});

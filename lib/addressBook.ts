// 회원이 저장해 둔 배송지(주소록). 데이터 접근은 이 파일에만 둔다.
// 지금은 브라우저 localStorage에 저장하는 목업이다. 백엔드가 준비되면 서버에 암호화해 저장하고 아래 "저장소" 함수 내부만 바꾼다.
// 주소록은 회원이 직접 저장을 고른 계정 정보다. 후원 건마다 결제 대행사로 넘기고 배송 후 파기하는 배송 정보와는 따로 관리한다.

import { PHONE_RE } from "./funding";

export interface Address {
  id: string;
  /** 집 · 회사 · 직접 입력 */
  label: string;
  recipient: string;
  phone: string;
  zipcode: string;
  address: string;
  detail: string;
  memo: string;
  isDefault: boolean;
  updatedAt: string;
}

export type AddressInput = Omit<Address, "id" | "isDefault" | "updatedAt"> & { id?: string; isDefault?: boolean };

export const MAX_ADDRESSES = 5;
export const ADDRESS_LABELS = ["집", "회사", "부모님 댁"] as const;

export const emptyAddress = (): AddressInput => ({ label: "집", recipient: "", phone: "", zipcode: "", address: "", detail: "", memo: "" });

// ───────────────────────── 순수 함수 ─────────────────────────

/** 문제가 없으면 null, 있으면 첫 번째 오류 문구 */
export function validateAddress(input: AddressInput): string | null {
  if (!input.label.trim()) return "배송지 이름을 입력해 주세요.";
  if (input.label.trim().length > 10) return "배송지 이름은 10자까지 쓸 수 있어요.";
  if (!input.recipient.trim()) return "받는 분 이름을 입력해 주세요.";
  if (!PHONE_RE.test(input.phone.trim())) return "받는 분 휴대폰 번호를 확인해 주세요.";
  if (!input.address.trim()) return "주소를 입력해 주세요.";
  if (input.memo.length > 50) return "배송 메모는 50자까지 쓸 수 있어요.";
  return null;
}

/** 저장값을 정리한다. 형식이 틀린 항목은 버리고, 최대 개수를 넘으면 자르고, 기본 배송지는 항상 하나로 맞춘다. */
export function normalizeBook(value: unknown): Address[] {
  if (!Array.isArray(value)) return [];
  const book = value
    .filter((item): item is Address => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.address === "string")
    .slice(0, MAX_ADDRESSES);
  const defaultIndex = Math.max(0, book.findIndex((item) => item.isDefault));
  return book.map((item, index) => ({ ...item, isDefault: index === defaultIndex }));
}

/** 추가하거나 고친 뒤의 주소록. 기본으로 지정하면 다른 주소의 기본 표시를 푼다. */
export function upsert(book: Address[], input: AddressInput, id: string, now: string): Address[] {
  const exists = book.some((item) => item.id === id);
  if (!exists && book.length >= MAX_ADDRESSES) throw new Error(`배송지는 ${MAX_ADDRESSES}개까지 저장할 수 있어요.`);
  const next: Address = {
    id,
    label: input.label.trim(),
    recipient: input.recipient.trim(),
    phone: input.phone.trim(),
    zipcode: input.zipcode.trim(),
    address: input.address.trim(),
    detail: input.detail.trim(),
    memo: input.memo.trim(),
    isDefault: input.isDefault ?? false,
    updatedAt: now,
  };
  const merged = exists ? book.map((item) => (item.id === id ? { ...next, isDefault: next.isDefault || item.isDefault } : item)) : [...book, next];
  const defaultId = merged.find((item) => item.id === id && item.isDefault) ? id : (merged.find((item) => item.isDefault)?.id ?? merged[0]?.id);
  return merged.map((item) => ({ ...item, isDefault: item.id === defaultId }));
}

/** 지운 뒤의 주소록. 기본 배송지를 지우면 남은 첫 주소가 기본이 된다. */
export function remove(book: Address[], id: string): Address[] {
  return normalizeBook(book.filter((item) => item.id !== id));
}

export const makeDefault = (book: Address[], id: string): Address[] =>
  book.some((item) => item.id === id) ? book.map((item) => ({ ...item, isDefault: item.id === id })) : book;

export const defaultAddress = (book: Address[]) => book.find((item) => item.isDefault) ?? book[0] ?? null;

/** "(02830) 서울 중랑구 망우로 1, 101동 202호" */
export const formatAddress = (item: Pick<Address, "zipcode" | "address" | "detail">) =>
  `${item.zipcode ? `(${item.zipcode}) ` : ""}${item.address}${item.detail ? `, ${item.detail}` : ""}`;

// ───────────────────────── 저장소 ─────────────────────────

const CHANGE = "findus:addresses-change";
const keyFor = (userId: string) => `findus:addresses:${userId}`;
const EMPTY: Address[] = [];
const cache = new Map<string, { raw: string | null; value: Address[] }>();

export function getAddressBook(userId: string | undefined): Address[] {
  if (!userId || typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try { raw = window.localStorage.getItem(keyFor(userId)); } catch { return EMPTY; }
  const previous = cache.get(userId);
  if (previous?.raw === raw) return previous.value;
  let value = EMPTY;
  try { value = raw ? normalizeBook(JSON.parse(raw)) : EMPTY; } catch { /* 손상된 저장값은 빈 주소록으로 복원한다. */ }
  cache.set(userId, { raw, value });
  return value;
}

function save(userId: string, book: Address[]) {
  try {
    if (book.length === 0) window.localStorage.removeItem(keyFor(userId));
    else window.localStorage.setItem(keyFor(userId), JSON.stringify(book));
  } catch {
    throw new Error("배송지를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** 새 배송지면 id를 만들어 추가하고, 있으면 고친다. 저장한 배송지를 돌려준다. */
export function saveAddress(userId: string, input: AddressInput): Address {
  const error = validateAddress(input);
  if (error) throw new Error(error);
  const id = input.id ?? crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  const book = upsert(getAddressBook(userId), input, id, new Date().toISOString());
  save(userId, book);
  return book.find((item) => item.id === id)!;
}

export const removeAddress = (userId: string, id: string) => save(userId, remove(getAddressBook(userId), id));
export const setDefaultAddress = (userId: string, id: string) => save(userId, makeDefault(getAddressBook(userId), id));
export const clearAddressBook = (userId: string) => save(userId, []);

export const getServerAddressBook = () => EMPTY;
export function subscribeAddressBook(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

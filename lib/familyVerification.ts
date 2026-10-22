// 실종아동 가족(보호자) 인증. 데이터 접근은 이 파일에만 둔다.
// 지금은 브라우저 localStorage에 저장하는 목업이다. 실제 서비스에서는 아래 원칙을 그대로 서버에서 지킨다.
// - 서류는 확인에만 쓰고 보관하지 않는다. 확인이 끝나면 원본을 파기하고 "누가 · 어떤 기관을 통해 · 언제 확인했는지"만 남긴다.
// - 최종 확인은 아동권리보장원 실종아동전문센터나 관할 경찰서를 통해 한다. FindUs가 혼자 판단하지 않는다.
// - DNA·유전정보(실종아동법 제11·12조)와 주민등록번호 전체(개인정보 보호법 제24조의2)는 어떤 경우에도 받지 않는다.
// 기준 문서: docs/[04] 가족인증_펀딩관리_경찰협력.md

/** 실종아동법 제2조의 보호자: 친권자, 후견인, 그 밖에 법률에 따라 보호·부양 의무가 있는 사람 */
export const RELATIONS = [
  { id: "mother", label: "어머니" },
  { id: "father", label: "아버지" },
  { id: "guardian", label: "법정 후견인" },
  { id: "other", label: "그 밖의 보호자" },
] as const;
export type Relation = (typeof RELATIONS)[number]["id"];

export type FamilyStatus = "reviewing" | "needs_more" | "verified" | "rejected";

export const STATUS_LABEL: Record<FamilyStatus | "none", string> = {
  none: "신청 전",
  reviewing: "기관 확인 중",
  needs_more: "보완 요청",
  verified: "가족 확인됨",
  rejected: "확인되지 않음",
};

export interface FamilyDraft {
  /** ① 휴대폰 본인확인 결과. 실제로는 CI 해시만 보관한다. */
  identity: { name: string; birth: string; verifiedAt: string } | null;
  /** ② 관계 증명. 정부24 전자증명서 또는 주민번호 뒷자리를 가린 PDF */
  document: { method: "gov24" | "pdf"; fileName: string; masked: boolean } | null;
  /** ③ 실종 사실. sourceId = 경찰청 관리번호, personId = FindUs 상세 화면 주소의 id */
  childSourceId: string;
  childPersonId: string;
  childName: string;
  relation: Relation | "";
  reportOffice: string;
  reportYear: string;
  /** ④ 동의 */
  agreeAgencyCheck: boolean;
  agreeDestroy: boolean;
  agreeContact: boolean;
}

export interface FamilyRequestLog {
  type: "correction" | "private";
  text: string;
  at: string;
}

export interface FamilyRecord {
  childSourceId: string;
  childPersonId: string;
  childName: string;
  relation: Relation;
  identityName: string;
  status: FamilyStatus;
  requestedAt: string;
  decidedAt: string | null;
  /** 확인한 기관 */
  agency: string | null;
  /** 보완 요청·반려 사유 */
  note: string | null;
  /** 원본 서류. 확인이 끝나면 fileName을 지우고 파기 일시만 남긴다. */
  document: { method: "gov24" | "pdf"; fileName: string | null; destroyedAt: string | null };
  /** 확인 후 30일 안에 원본을 파기한다. */
  destroyBy: string | null;
  /** 다시 확인할 날 (1년) [가정] */
  renewBy: string | null;
  requests: FamilyRequestLog[];
}

export const emptyDraft = (): FamilyDraft => ({
  identity: null, document: null, childSourceId: "", childPersonId: "", childName: "", relation: "",
  reportOffice: "", reportYear: "", agreeAgencyCheck: false, agreeDestroy: false, agreeContact: false,
});

export const VERIFY_STEPS = ["본인확인", "관계 증명", "실종 사실", "동의"] as const;

const DAY = 24 * 60 * 60 * 1000;
const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * DAY).toISOString();

// ───────────────────────── 순수 함수 ─────────────────────────

/** 단계별 검사. 문제가 없으면 null */
export function validateStep(step: number, draft: FamilyDraft, nowYear = new Date().getFullYear()): string | null {
  if (step >= 0 && !draft.identity) return "휴대폰 본인확인을 먼저 해 주세요.";
  if (step >= 1) {
    if (!draft.document) return "가족관계증명서를 제출해 주세요.";
    if (draft.document.method === "pdf" && !draft.document.masked) return "주민등록번호 뒷자리를 가린 서류인지 확인해 주세요.";
  }
  if (step >= 2) {
    if (!draft.childSourceId) return "찾고 있는 아이를 골라 주세요.";
    if (!draft.relation) return "아이와의 관계를 골라 주세요.";
    if (draft.reportYear && (!/^\d{4}$/.test(draft.reportYear) || +draft.reportYear < 1950 || +draft.reportYear > nowYear)) return "신고 연도를 네 자리로 입력해 주세요.";
  }
  if (step >= 3) {
    if (!draft.agreeAgencyCheck) return "기관 확인 문의에 동의해 주세요.";
    if (!draft.agreeDestroy) return "서류 파기 안내를 확인해 주세요.";
  }
  return null;
}

const TRANSITIONS: Record<FamilyStatus, FamilyStatus[]> = {
  reviewing: ["verified", "needs_more", "rejected"],
  needs_more: ["reviewing", "rejected"],
  verified: ["reviewing"], // 1년 재확인
  rejected: [],
};

export const canTransition = (from: FamilyStatus, to: FamilyStatus) => TRANSITIONS[from].includes(to);

export function toRecord(draft: FamilyDraft, now: string): FamilyRecord {
  const error = validateStep(3, draft);
  if (error) throw new Error(error);
  return {
    childSourceId: draft.childSourceId,
    childPersonId: draft.childPersonId,
    childName: draft.childName,
    relation: draft.relation as Relation,
    identityName: draft.identity!.name,
    status: "reviewing",
    requestedAt: now,
    decidedAt: null,
    agency: null,
    note: null,
    document: { method: draft.document!.method, fileName: draft.document!.fileName, destroyedAt: null },
    destroyBy: null,
    renewBy: null,
    requests: [],
  };
}

/** 심사 결과를 반영한다. 확인되면 원본 서류를 파기하고 재확인 날짜를 잡는다. */
export function decide(record: FamilyRecord, to: FamilyStatus, now: string, note: string | null = null): FamilyRecord {
  if (!canTransition(record.status, to)) throw new Error(`${STATUS_LABEL[record.status]} 상태에서는 ${STATUS_LABEL[to]}(으)로 바꿀 수 없어요.`);
  const closed = to === "verified" || to === "rejected";
  return {
    ...record,
    status: to,
    decidedAt: closed ? now : record.decidedAt,
    agency: to === "verified" ? "아동권리보장원 실종아동전문센터" : record.agency,
    note: to === "verified" ? null : note,
    document: closed ? { ...record.document, fileName: null, destroyedAt: now } : record.document,
    destroyBy: closed ? now : addDays(record.requestedAt, 30),
    renewBy: to === "verified" ? addDays(now, 365) : record.renewBy,
  };
}

export const isVerifiedFor = (record: FamilyRecord | null, sourceId: string, now = new Date()) =>
  !!record && record.status === "verified" && record.childSourceId === sourceId && (!record.renewBy || new Date(record.renewBy) > now);

/** 화면의 "보관하는 정보 / 보관하지 않는 정보" 표 */
export const KEPT_INFO = ["찾고 있는 아이의 경찰청 관리번호", "아이와의 관계", "확인한 기관과 확인일", "본인확인 결과(실제 서비스에서는 연계정보 해시)"];
export const NOT_KEPT_INFO = ["가족관계증명서 원본 (확인 후 30일 안에 파기)", "주민등록번호 (받지 않음)", "DNA·유전정보 (받지 않음)", "아이의 사진·추가 신상 정보 (받지 않음)"];

// ───────────────────────── 캠페인 가족 승인 ─────────────────────────

export interface CampaignFamily {
  /** 가족이 캠페인 공개를 승인했는지 */
  approved: boolean;
  /** 가족의 한마디 */
  message: string;
  /** 가족이 비공개를 요청해 공개를 멈췄는지 */
  paused: boolean;
  updatedAt: string;
}

export const MESSAGE_MAX = 300;

// ───────────────────────── 저장소 ─────────────────────────

const CHANGE = "findus:family-change";
const familyKey = (userId: string) => `findus:family:${userId}`;
const CAMPAIGN_KEY = "findus:campaign-family";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("저장 공간에 접근할 수 없어 처리하지 못했어요.");
  }
  window.dispatchEvent(new Event(CHANGE));
}

// useSyncExternalStore용 캐시. 같은 값이면 같은 객체를 돌려준다.
const recordCache = new Map<string, { raw: string | null; value: FamilyRecord | null }>();
export function getFamilyRecord(userId: string | undefined): FamilyRecord | null {
  if (!userId || typeof window === "undefined") return null;
  let raw: string | null;
  try { raw = window.localStorage.getItem(familyKey(userId)); } catch { return null; }
  const previous = recordCache.get(userId);
  if (previous?.raw === raw) return previous.value;
  let value: FamilyRecord | null = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    value = parsed && typeof parsed.childSourceId === "string" && parsed.status in TRANSITIONS ? parsed : null;
  } catch { /* 손상된 값은 신청 전으로 본다. */ }
  recordCache.set(userId, { raw, value });
  return value;
}

export async function submitFamilyRequest(userId: string, draft: FamilyDraft): Promise<FamilyRecord> {
  const current = getFamilyRecord(userId);
  if (current && current.status !== "rejected" && current.status !== "needs_more") throw new Error("이미 신청한 가족 인증이 있어요.");
  const record = toRecord(draft, new Date().toISOString());
  write(familyKey(userId), { ...record, destroyBy: addDays(record.requestedAt, 30), requests: current?.requests ?? [] });
  return record;
}

/** 신청을 거둬들이면 기록을 모두 지우고, 이 아이 캠페인의 가족 승인도 함께 거둔다. */
export function withdrawFamily(userId: string, campaignIds: string[]) {
  write(familyKey(userId), null);
  const map = read<Record<string, CampaignFamily>>(CAMPAIGN_KEY, {});
  for (const id of campaignIds) delete map[id];
  write(CAMPAIGN_KEY, map);
}

/** 개발 환경 전용: 심사 결과를 바꿔 본다. 실제 서비스에서는 관리자 화면(A10)에서만 바꾼다. */
export function devSetFamilyStatus(userId: string, to: FamilyStatus, note: string | null = null) {
  if (process.env.NODE_ENV === "production") throw new Error("데모 기능은 배포 환경에서 쓸 수 없어요.");
  const record = getFamilyRecord(userId);
  if (!record) throw new Error("신청 내역이 없어요.");
  write(familyKey(userId), decide(record, to, new Date().toISOString(), note));
}

/** 인증 가족의 정정·비공개 요청. 비공개 요청은 바로 공개를 멈춘다. */
export function sendFamilyRequest(userId: string, type: FamilyRequestLog["type"], text: string, campaignIds: string[]) {
  const record = getFamilyRecord(userId);
  if (!record || record.status !== "verified") throw new Error("가족 확인이 끝난 뒤에 요청할 수 있어요.");
  if (type === "correction" && !text.trim()) throw new Error("고칠 내용을 적어 주세요.");
  write(familyKey(userId), { ...record, requests: [{ type, text: text.trim(), at: new Date().toISOString() }, ...record.requests] });
  if (type === "private") for (const id of campaignIds) updateCampaignFamily(userId, id, record.childSourceId, { paused: true, approved: false });
}

let campaignRaw: string | null | undefined;
let campaignCache: Record<string, CampaignFamily> = {};
const EMPTY_CAMPAIGNS: Record<string, CampaignFamily> = {};
export function getCampaignFamilies(): Record<string, CampaignFamily> {
  if (typeof window === "undefined") return EMPTY_CAMPAIGNS;
  let raw: string | null;
  try { raw = window.localStorage.getItem(CAMPAIGN_KEY); } catch { return EMPTY_CAMPAIGNS; }
  if (raw !== campaignRaw) {
    campaignRaw = raw;
    campaignCache = read<Record<string, CampaignFamily>>(CAMPAIGN_KEY, {});
  }
  return campaignCache;
}
export const getServerCampaignFamilies = () => EMPTY_CAMPAIGNS;

/** 캠페인 아이의 가족으로 확인된 사람만 승인·한마디를 바꿀 수 있다. */
export function updateCampaignFamily(userId: string, campaignId: string, childSourceId: string, patch: Partial<Omit<CampaignFamily, "updatedAt">>) {
  if (!isVerifiedFor(getFamilyRecord(userId), childSourceId)) throw new Error("이 아이의 가족으로 확인된 계정만 바꿀 수 있어요.");
  if (patch.message !== undefined && patch.message.length > MESSAGE_MAX) throw new Error(`가족의 한마디는 ${MESSAGE_MAX}자까지 쓸 수 있어요.`);
  const map = read<Record<string, CampaignFamily>>(CAMPAIGN_KEY, {});
  const current = map[campaignId] ?? { approved: false, message: "", paused: false, updatedAt: "" };
  map[campaignId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  write(CAMPAIGN_KEY, map);
}

export function subscribeFamily(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

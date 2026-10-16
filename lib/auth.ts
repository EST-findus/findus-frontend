// 회원가입·로그인 데이터 접근은 이 파일에만 둔다.
// 백엔드 인증 API가 준비되면 아래 "저장소" 영역의 함수 내부만 fetch로 교체한다.
// 지금은 브라우저 localStorage에 회원 목록과 로그인 상태를 저장하는 목업이다.
// (비밀번호는 해시로 저장하지만, 브라우저 저장소이므로 실제 보안 수단이 아니다.)

export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

interface StoredUser extends User {
  salt: string;
  passwordHash: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

export const AUTH_LIMITS = {
  password: { min: 8, max: 64 },
  nickname: { min: 2, max: 12 },
} as const;

// ───────────────────────── 순수 함수 ─────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** 문제가 없으면 null, 있으면 첫 번째 오류 문구 */
export function validateSignUp(input: SignUpInput): string | null {
  const email = normalizeEmail(input.email);
  const nickname = input.nickname.trim();
  const { password } = input;

  if (!email) return "이메일을 입력해 주세요.";
  if (!EMAIL_RE.test(email)) return "이메일 형식이 올바르지 않아요.";
  if (password.length < AUTH_LIMITS.password.min)
    return `비밀번호를 ${AUTH_LIMITS.password.min}자 이상 입력해 주세요.`;
  if (password.length > AUTH_LIMITS.password.max)
    return `비밀번호를 ${AUTH_LIMITS.password.max}자 이하로 입력해 주세요.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "비밀번호에 영문과 숫자를 함께 넣어 주세요.";
  if (password !== input.passwordConfirm) return "비밀번호 확인이 일치하지 않아요.";
  if (nickname.length < AUTH_LIMITS.nickname.min)
    return `닉네임을 ${AUTH_LIMITS.nickname.min}자 이상 입력해 주세요.`;
  if (nickname.length > AUTH_LIMITS.nickname.max)
    return `닉네임을 ${AUTH_LIMITS.nickname.max}자 이하로 입력해 주세요.`;
  return null;
}

export function validateLogIn(input: LogInInput): string | null {
  if (!input.email.trim()) return "이메일을 입력해 주세요.";
  if (!input.password) return "비밀번호를 입력해 주세요.";
  return null;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 로그인 후 돌아갈 주소. 외부 주소로의 이동은 막는다. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !/[\\\x00-\x20]/.test(next) ? next : fallback;
}

// ───────────────────────── 저장소 ─────────────────────────

const USERS_KEY = "findus:users";
const SESSION_KEY = "findus:session";
const CHANGE_EVENT = "findus:auth-change";

const randomId = () => crypto.randomUUID().replaceAll("-", "");

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setItem(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    throw new Error("저장 공간에 접근할 수 없어 처리하지 못했어요.");
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const toPublic = ({ id, email, nickname, createdAt }: StoredUser): User => ({
  id,
  email,
  nickname,
  createdAt,
});

export async function signUp(input: SignUpInput): Promise<User> {
  const error = validateSignUp(input);
  if (error) throw new Error(error);
  const email = normalizeEmail(input.email);
  const nickname = input.nickname.trim();
  const users = readUsers();
  if (users.some((u) => u.email === email)) throw new Error("이미 가입된 이메일이에요.");
  if (users.some((u) => u.nickname === nickname)) throw new Error("이미 사용 중인 닉네임이에요.");

  const salt = randomId();
  const stored: StoredUser = {
    id: randomId(),
    email,
    nickname,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(input.password, salt),
  };
  setItem(USERS_KEY, JSON.stringify([...users, stored]));
  const user = toPublic(stored);
  setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function logIn(input: LogInInput): Promise<User> {
  const error = validateLogIn(input);
  if (error) throw new Error(error);
  const found = readUsers().find((u) => u.email === normalizeEmail(input.email));
  // 이메일과 비밀번호 중 무엇이 틀렸는지는 알려주지 않는다.
  if (!found || (await hashPassword(input.password, found.salt)) !== found.passwordHash) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않아요.");
  }
  const user = toPublic(found);
  setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logOut() {
  setItem(SESSION_KEY, null);
}

// useSyncExternalStore용. 같은 값이면 같은 객체를 돌려줘야 다시 그리지 않는다.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

export function getCurrentUser(): User | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

export function subscribeAuth(onChange: () => void) {
  // storage 이벤트는 다른 탭에서 로그인·로그아웃했을 때 들어온다.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

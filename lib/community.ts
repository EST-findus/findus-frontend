// 커뮤니티(정보마당) 데이터 접근은 이 파일에만 둔다.
// 백엔드 API가 준비되면 아래 "저장소" 영역의 함수 내부만 fetch로 교체한다.
// 지금은 목업 글 위에 브라우저 localStorage에 저장한 글·댓글을 덧붙여 보여준다.

export type PostCategory = "notice" | "info" | "story" | "question";
export type CategoryFilter = "all" | PostCategory;

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  notice: "공지",
  info: "정보공유",
  story: "응원·이야기",
  question: "질문",
};

/** 사용자가 글을 쓸 때 고를 수 있는 분류 (공지는 운영자 전용) */
export const WRITABLE_CATEGORIES: Exclude<PostCategory, "notice">[] = ["info", "story", "question"];

export const CATEGORY_TABS: CategoryFilter[] = ["all", "notice", ...WRITABLE_CATEGORIES];

export interface Comment {
  id: string;
  author: string;
  /** 회원 id. 목업 글·댓글에는 없다. */
  authorId?: string;
  content: string;
  /** KST ISO 문자열 "YYYY-MM-DDTHH:mm:ss+09:00" */
  createdAt: string;
}

export interface Post {
  id: string;
  category: PostCategory;
  title: string;
  author: string;
  /** 회원 id. 목업 글·댓글에는 없다. */
  authorId?: string;
  content: string;
  /** KST ISO 문자열 "YYYY-MM-DDTHH:mm:ss+09:00" */
  createdAt: string;
  views: number;
  comments: Comment[];
}

export interface PostInput {
  category: PostCategory;
  title: string;
  author: string;
  authorId?: string;
  content: string;
}

export interface CommentInput {
  author: string;
  authorId?: string;
  content: string;
}

export const LIMITS = {
  title: { min: 2, max: 60 },
  author: { min: 1, max: 20 },
  content: { min: 5, max: 3000 },
  comment: { min: 1, max: 500 },
} as const;

export const PAGE_SIZE = 10;

// ───────────────────────── 목업 ─────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    category: "notice",
    title: "FindUs 커뮤니티 이용 안내",
    author: "FindUs 운영팀",
    createdAt: "2026-09-01T10:00:00+09:00",
    views: 1284,
    content:
      "FindUs 커뮤니티는 장기 실종아동을 기억하고 서로의 정보를 나누는 공간입니다.\n\n" +
      "· 실종아동과 가족의 연락처, 주소 등 개인정보는 올리지 말아 주세요.\n" +
      "· 확인되지 않은 목격담이나 추측성 글은 혼란을 줄 수 있어요.\n" +
      "· 서로를 존중하는 말로 대화해 주세요.\n\n" +
      "규칙에 어긋나는 글과 댓글은 예고 없이 숨김 처리될 수 있습니다.",
    comments: [],
  },
  {
    id: "2",
    category: "notice",
    title: "목격 제보는 커뮤니티보다 112·182로 먼저 해 주세요",
    author: "FindUs 운영팀",
    createdAt: "2026-09-02T09:30:00+09:00",
    views: 962,
    content:
      "실종아동으로 보이는 사람을 봤다면 커뮤니티에 글을 쓰기 전에 112(경찰) 또는 182(실종아동찾기센터)로 바로 알려 주세요.\n\n" +
      "커뮤니티 글은 공식 기관에 전달되지 않습니다. 빠른 신고가 가장 큰 도움이 됩니다.",
    comments: [
      {
        id: "c2-1",
        author: "초록우산",
        content: "꼭 필요한 공지네요. 저도 예전에 어디에 먼저 알려야 할지 몰라 헤맸어요.",
        createdAt: "2026-09-02T12:14:00+09:00",
      },
    ],
  },
  {
    id: "3",
    category: "info",
    title: "장기 실종아동 가족 유전자(DNA) 등록 절차 정리",
    author: "기억하는사람",
    createdAt: "2026-09-18T21:05:00+09:00",
    views: 538,
    content:
      "가족을 찾고 싶은 분들이 많이 물어보셔서 정리해 봤어요.\n\n" +
      "1. 가까운 경찰서 민원실이나 여성청소년계를 방문합니다.\n" +
      "2. 신분증을 챙기고, 실종 당시 정보를 최대한 기억해 가면 좋아요.\n" +
      "3. 구강 세포를 채취해 유전자 정보를 등록합니다. 비용은 들지 않아요.\n\n" +
      "해외에 계신 경우에는 재외공관을 통해서도 등록할 수 있다고 합니다. 정확한 내용은 182로 문의해 보세요.",
    comments: [
      {
        id: "c3-1",
        author: "해바라기",
        content: "정리 감사합니다. 부모님 모시고 다음 주에 다녀오려고요.",
        createdAt: "2026-09-19T08:40:00+09:00",
      },
      {
        id: "c3-2",
        author: "기억하는사람",
        content: "좋은 소식 있으시길 바랄게요!",
        createdAt: "2026-09-19T10:02:00+09:00",
      },
    ],
  },
  {
    id: "4",
    category: "info",
    title: "실종아동 정보를 SNS에 공유할 때 주의할 점",
    author: "공유하는마음",
    createdAt: "2026-09-25T14:22:00+09:00",
    views: 417,
    content:
      "공유는 큰 힘이 되지만 몇 가지만 지켜 주세요.\n\n" +
      "· 공식 기관에 등록된 정보와 사진만 공유해 주세요.\n" +
      "· 가족 연락처 대신 112·182 번호를 함께 적어 주세요.\n" +
      "· 해결된 사례는 원글을 내려 주는 것이 가족에게 도움이 됩니다.",
    comments: [],
  },
  {
    id: "5",
    category: "story",
    title: "20년 만에 가족을 찾았다는 뉴스를 보고",
    author: "오늘도기다림",
    createdAt: "2026-10-02T23:48:00+09:00",
    views: 691,
    content:
      "오래 걸려도 결국 만나는 가족이 있다는 게 큰 위로가 됐어요.\n" +
      "여기 계신 모든 분들께도 그런 날이 오기를 진심으로 바랍니다.",
    comments: [
      {
        id: "c5-1",
        author: "봄날",
        content: "저도 그 기사 보고 한참 울었어요. 함께 기다릴게요.",
        createdAt: "2026-10-03T07:15:00+09:00",
      },
    ],
  },
  {
    id: "6",
    category: "question",
    title: "AI 예상 얼굴은 어떻게 활용하면 좋을까요?",
    author: "궁금한시민",
    createdAt: "2026-10-07T19:30:00+09:00",
    views: 254,
    content:
      "상세정보에서 AI 예상 얼굴을 봤는데, 실제 모습과 많이 다를 수도 있다고 해서요.\n" +
      "주변에서 닮은 사람을 보면 어떤 점을 같이 확인하면 좋을까요?",
    comments: [
      {
        id: "c6-1",
        author: "FindUs 운영팀",
        content:
          "AI 예상 얼굴은 참고용이에요. 흉터, 점, 걸음걸이처럼 나이가 들어도 잘 변하지 않는 특징을 함께 확인하시고, 비슷하다고 느껴지면 182로 알려 주세요.",
        createdAt: "2026-10-08T10:12:00+09:00",
      },
    ],
  },
  {
    id: "7",
    category: "question",
    title: "해외로 입양된 경우에도 가족을 찾을 수 있나요?",
    author: "멀리서",
    createdAt: "2026-10-10T08:05:00+09:00",
    views: 133,
    content: "어릴 때 해외로 입양됐는데 혹시 실종아동이었을 가능성도 있을까 싶어서 여쭤봅니다.",
    comments: [],
  },
  {
    id: "8",
    category: "story",
    title: "매년 이맘때면 아이 생각이 더 납니다",
    author: "기다리는엄마",
    createdAt: "2026-10-12T22:10:00+09:00",
    views: 88,
    content:
      "가을 바람이 불면 그날 생각이 나요.\n이곳에서 같은 마음인 분들을 만나 조금은 덜 외롭습니다. 다들 건강하세요.",
    comments: [],
  },
];

// ───────────────────────── 순수 함수 ─────────────────────────

/** "2026-10-13T09:05:00+09:00" → "2026.10.13" */
export function formatPostDate(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** "2026-10-13T09:05:00+09:00" → "2026.10.13 09:05" */
export function formatPostDateTime(iso: string): string {
  return `${formatPostDate(iso)} ${iso.slice(11, 16)}`;
}

/** 현재 시각을 KST ISO 문자열로. 서버·브라우저 시간대와 관계없이 같은 형식을 쓴다. */
export function nowKst(now = Date.now()): string {
  return `${new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)}+09:00`;
}

const byNewest = (a: Post, b: Post) => b.createdAt.localeCompare(a.createdAt);

/** 분류·검색어로 거른다. 공지는 항상 맨 위, 나머지는 최신순. */
export function filterPosts(
  posts: Post[],
  { category, query }: { category: CategoryFilter; query: string },
): Post[] {
  const q = query.trim().toLowerCase();
  const matches = posts.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!q || [p.title, p.content, p.author].some((s) => s.toLowerCase().includes(q))),
  );
  const notices = matches.filter((p) => p.category === "notice").sort(byNewest);
  const others = matches.filter((p) => p.category !== "notice").sort(byNewest);
  return [...notices, ...others];
}

export function paginate<T>(list: T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: list.slice((current - 1) * size, current * size),
    page: current,
    totalPages,
  };
}

/** label은 목적격 조사까지 붙여서 받는다 (예: "제목을") */
function checkLength(label: string, value: string, { min, max }: { min: number; max: number }) {
  const len = value.trim().length;
  if (len === 0) return `${label} 입력해 주세요.`;
  if (len < min) return `${label} ${min}자 이상 입력해 주세요.`;
  if (len > max) return `${label} ${max}자 이하로 입력해 주세요.`;
  return null;
}

/** 문제가 없으면 null, 있으면 첫 번째 오류 문구 */
export function validatePost(input: PostInput): string | null {
  if (input.category === "notice") return "공지는 운영자만 작성할 수 있어요.";
  return (
    checkLength("제목을", input.title, LIMITS.title) ??
    checkLength("작성자 이름을", input.author, LIMITS.author) ??
    checkLength("내용을", input.content, LIMITS.content)
  );
}

export function validateComment(input: CommentInput): string | null {
  return (
    checkLength("작성자 이름을", input.author, LIMITS.author) ??
    checkLength("댓글을", input.content, LIMITS.comment)
  );
}

// ───────────────────────── 저장소 ─────────────────────────

const STORAGE_KEY = "findus:community";

interface LocalStore {
  posts: Post[];
  /** 목업 글에 단 댓글 (postId → 댓글) */
  comments: Record<string, Comment[]>;
}

function readStore(): LocalStore {
  const empty: LocalStore = { posts: [], comments: {} };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function writeStore(store: LocalStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error("저장 공간에 접근할 수 없어 저장하지 못했어요.");
  }
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function withLocalComments(post: Post, store: LocalStore): Post {
  const extra = store.comments[post.id];
  return extra?.length ? { ...post, comments: [...post.comments, ...extra] } : post;
}

/** 서버 렌더링에서도 쓸 수 있는 목업 글 (브라우저 저장분 제외) */
export function getSeedPosts(): Post[] {
  return MOCK_POSTS;
}

export async function getPosts(): Promise<Post[]> {
  const store = readStore();
  return [...store.posts, ...MOCK_POSTS.map((p) => withLocalComments(p, store))];
}

export async function getPost(id: string): Promise<Post | null> {
  return (await getPosts()).find((p) => p.id === id) ?? null;
}

export async function createPost(input: PostInput): Promise<Post> {
  const error = validatePost(input);
  if (error) throw new Error(error);
  const post: Post = {
    id: newId(),
    category: input.category,
    title: input.title.trim(),
    author: input.author.trim(),
    authorId: input.authorId,
    content: input.content.trim(),
    createdAt: nowKst(),
    views: 0,
    comments: [],
  };
  const store = readStore();
  writeStore({ ...store, posts: [post, ...store.posts] });
  return post;
}

export async function addComment(postId: string, input: CommentInput): Promise<Comment> {
  const error = validateComment(input);
  if (error) throw new Error(error);
  const comment: Comment = {
    id: newId(),
    author: input.author.trim(),
    authorId: input.authorId,
    content: input.content.trim(),
    createdAt: nowKst(),
  };
  const store = readStore();
  const own = store.posts.find((p) => p.id === postId);
  if (own) {
    own.comments = [...own.comments, comment];
  } else if (MOCK_POSTS.some((p) => p.id === postId)) {
    store.comments[postId] = [...(store.comments[postId] ?? []), comment];
  } else {
    throw new Error("글을 찾을 수 없어요.");
  }
  writeStore(store);
  return comment;
}

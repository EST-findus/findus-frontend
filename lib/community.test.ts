import { describe, expect, it } from "vitest";
import {
  filterPosts,
  formatPostDate,
  formatPostDateTime,
  getSeedPosts,
  nowKst,
  paginate,
  validateComment,
  validatePost,
  type Post,
} from "./community";

const posts = getSeedPosts();
const ids = (list: Post[]) => list.map((p) => p.id);

describe("게시글 목록", () => {
  it("전체 보기에서는 공지가 맨 위, 나머지는 최신순", () => {
    const list = filterPosts(posts, { category: "all", query: "" });
    const firstNormal = list.findIndex((p) => p.category !== "notice");
    expect(list.slice(0, firstNormal).every((p) => p.category === "notice")).toBe(true);
    const rest = list.slice(firstNormal);
    expect(rest.map((p) => p.createdAt)).toEqual(rest.map((p) => p.createdAt).sort().reverse());
  });

  it("분류로 거른다", () => {
    const list = filterPosts(posts, { category: "question", query: "" });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.category === "question")).toBe(true);
  });

  it("제목·내용·작성자에서 대소문자 없이 검색한다", () => {
    expect(ids(filterPosts(posts, { category: "all", query: "  dna " }))).toEqual(["3"]);
    expect(ids(filterPosts(posts, { category: "all", query: "멀리서" }))).toEqual(["7"]);
    expect(filterPosts(posts, { category: "all", query: "없는검색어" })).toEqual([]);
  });
});

describe("페이지 나누기", () => {
  const list = Array.from({ length: 23 }, (_, i) => i);

  it("페이지 크기만큼 자른다", () => {
    expect(paginate(list, 3, 10)).toEqual({ items: [20, 21, 22], page: 3, totalPages: 3 });
  });

  it("범위를 벗어난 페이지는 가까운 끝으로 맞춘다", () => {
    expect(paginate(list, 99, 10).page).toBe(3);
    expect(paginate(list, 0, 10).page).toBe(1);
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, totalPages: 1 });
  });
});

describe("입력 검증", () => {
  const valid = { category: "info" as const, title: "제목입니다", author: "홍길동", content: "내용을 적어요" };

  it("올바른 글은 통과한다", () => {
    expect(validatePost(valid)).toBeNull();
  });

  it("공지 분류와 빈 칸, 너무 긴 제목을 막는다", () => {
    expect(validatePost({ ...valid, category: "notice" })).toMatch("운영자");
    expect(validatePost({ ...valid, title: "   " })).toBe("제목을 입력해 주세요.");
    expect(validatePost({ ...valid, title: "가" })).toBe("제목을 2자 이상 입력해 주세요.");
    expect(validatePost({ ...valid, title: "가".repeat(61) })).toBe("제목을 60자 이하로 입력해 주세요.");
  });

  it("댓글은 작성자와 내용이 필요하다", () => {
    expect(validateComment({ author: "", content: "응원합니다" })).toBe("작성자 이름을 입력해 주세요.");
    expect(validateComment({ author: "봄날", content: "" })).toBe("댓글을 입력해 주세요.");
    expect(validateComment({ author: "봄날", content: "응원합니다" })).toBeNull();
  });
});

describe("날짜", () => {
  it("KST 기준 문자열을 만들고 표시한다", () => {
    const iso = nowKst(Date.UTC(2026, 9, 12, 16, 5));
    expect(iso).toBe("2026-10-13T01:05:00+09:00");
    expect(formatPostDate(iso)).toBe("2026.10.13");
    expect(formatPostDateTime(iso)).toBe("2026.10.13 01:05");
  });
});

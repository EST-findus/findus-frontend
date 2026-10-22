import { describe, expect, it } from "vitest";
import { NEWS_SUMMARY_COUNT, REUNION_NEWS } from "./reunionStories";

describe("REUNION_NEWS", () => {
  it("모든 기사에 제목·출처·날짜와 https 원문 링크가 있다", () => {
    for (const story of REUNION_NEWS) {
      expect(story.title).not.toBe("");
      expect(story.source).not.toBe("");
      expect(story.date).not.toBe("");
      expect(story.href).toMatch(/^https:\/\//);
    }
  });

  it("원문 링크가 겹치지 않는다", () => {
    expect(new Set(REUNION_NEWS.map((story) => story.href)).size).toBe(REUNION_NEWS.length);
  });

  it("요약보다 기사가 많아야 자세히 보기가 의미 있다", () => {
    expect(REUNION_NEWS.length).toBeGreaterThan(NEWS_SUMMARY_COUNT);
  });
});

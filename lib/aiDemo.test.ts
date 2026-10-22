import { describe, expect, it } from "vitest";
import { DEMO_IMAGE, DEMO_STEPS, FACE_BOX, FEATURE_LINES, FEATURE_POINTS, FIVE_POINTS } from "./aiDemo";

const inside = ([x, y]: readonly [number, number]) => x >= 0 && x <= DEMO_IMAGE.width && y >= 0 && y <= DEMO_IMAGE.height;

describe("aiDemo", () => {
  it("모든 점이 예시 사진 안에 있다", () => {
    expect([...FIVE_POINTS, ...FEATURE_POINTS].every(inside)).toBe(true);
  });

  it("다섯 점은 얼굴 상자 안에 있다", () => {
    const [x, y, w, h] = FACE_BOX;
    for (const [px, py] of FIVE_POINTS) {
      expect(px).toBeGreaterThan(x);
      expect(px).toBeLessThan(x + w);
      expect(py).toBeGreaterThan(y);
      expect(py).toBeLessThan(y + h);
    }
  });

  it("연결선이 있는 점만 가리킨다", () => {
    for (const [from, to] of FEATURE_LINES) {
      expect(from).toBeLessThan(to);
      expect(to).toBeLessThan(FEATURE_POINTS.length);
    }
  });

  it("단계마다 제목·모델·설명이 있고 키가 겹치지 않는다", () => {
    for (const step of DEMO_STEPS) {
      expect(step.title && step.model && step.text).toBeTruthy();
    }
    expect(new Set(DEMO_STEPS.map((step) => step.key)).size).toBe(DEMO_STEPS.length);
  });
});

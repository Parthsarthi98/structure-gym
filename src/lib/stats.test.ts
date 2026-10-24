import { describe, expect, it } from "vitest";
import { reviewQueue, streak, recommendation, applyHintPenalty, type Attempt } from "./stats";
import { FLAWS, scoreFlawSelection } from "@/data/flaws";
import { CASES } from "@/data/cases";
import { MODES } from "@/data/taxonomy";

const mk = (p: Partial<Attempt>): Attempt => ({
  id: Math.random().toString(), mode: "build", case_id: "c01", case_title: "", case_prompt: null, industry: "retail",
  framework: "profitability", difficulty: "Beginner", score: 5, rubric: null, error_types: [], time_taken_seconds: null,
  time_limit_seconds: null, user_answer: null, feedback: null, created_at: "2026-10-01T10:00:00Z", ...p,
});

describe("review queue", () => {
  it("includes a case scored below 6", () => {
    expect(reviewQueue([mk({ score: 5 })]).length).toBe(1);
  });
  it("excludes a case scored exactly 6", () => {
    expect(reviewQueue([mk({ score: 6 })]).length).toBe(0);
  });
  it("keeps the case after a retry scoring 6", () => {
    expect(reviewQueue([mk({ score: 4 }), mk({ score: 6, created_at: "2026-10-02T10:00:00Z" })]).length).toBe(1);
  });
  it("removes the case once a retry scores 7", () => {
    expect(reviewQueue([mk({ score: 4 }), mk({ score: 7, created_at: "2026-10-02T10:00:00Z" })]).length).toBe(0);
  });
});

describe("streak", () => {
  it("counts consecutive days ending today", () => {
    const a = ["2026-10-21", "2026-10-22", "2026-10-23"].map((d) => mk({ created_at: `${d}T09:00:00Z` }));
    expect(streak(a, new Date("2026-10-23T20:00:00Z"))).toBe(3);
  });
});

describe("content bank", () => {
  it("has at least 200 cases and 100 flaw items", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(200);
    expect(FLAWS.length).toBeGreaterThanOrEqual(100);
  });
  it("flaw scoring gives full 8 points for correct node and type", () => {
    const f = FLAWS[0]!;
    expect(scoreFlawSelection(f, f.flaws.map((k) => ({ nodeId: k.nodeId, type: k.type }))).points).toBe(8);
  });
});

describe("hint penalty", () => {
  it("takes 0.5 off per hint", () => {
    expect(applyHintPenalty(8, 3)).toBe(6.5);
  });
  it("never goes below zero", () => {
    expect(applyHintPenalty(1, 3)).toBe(0);
  });
});

describe("self-paced practice", () => {
  it("offers only self-paced exercise modes", () => {
    expect(MODES.map((mode) => mode.id)).toEqual(["build", "flaw", "framework"]);
  });
  it("makes low-scoring cases immediately available without review-day scheduling", () => {
    const attempt = mk({ score: 5, created_at: "2026-10-24T03:39:00Z" });
    expect(reviewQueue([attempt]).map((a) => a.id)).toEqual([attempt.id]);
  });
  it("keeps the next-drill recommendation based on weak areas", () => {
    expect(recommendation([mk({ industry: "retail", framework: "profitability", rubric: { tailoring: 0, relevance: 2 } })])).toEqual({ industry: "retail", framework: "profitability", criterion: "tailoring" });
  });
});

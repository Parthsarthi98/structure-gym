import { describe, expect, it } from "vitest";
import { floorScore, frameworkOptions, generationDifficulty, optionName, practiceDifficulty, scoreFrameworkChoice, showHints, strictRubric } from "./practice-rules";
import { FRAMEWORK_LIST, type FrameworkId } from "@/data/taxonomy";
import { FLAWS, scoreFlawSelection } from "@/data/flaws";
import { CASES } from "@/data/cases";
import { BANK, BANK_DRILLS, BANK_QUICK } from "@/data/bank";
import type { TreeNode } from "@/data/frameworks";

const full = { mutuallyExclusive: 2, collectivelyExhaustive: 2, relevance: 2, tailoring: 2, depth: 2 };
const total = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

describe("strict grading", () => {
  it("caps tailoring at 1 for a textbook framework with the industry name swapped in", () => {
    const r = strictRubric(full, { genericIndustrySwap: true, missesPromptBranch: false, interviewerExcellent: true });
    expect(r["tailoring"]).toBe(1);
    expect(total(r)).toBeLessThanOrEqual(9);
  });

  it("caps relevance at 1 when the branch the prompt points at is missing", () => {
    const r = strictRubric(full, { genericIndustrySwap: false, missesPromptBranch: true, interviewerExcellent: true });
    expect(r["relevance"]).toBe(1);
  });

  it("never lets a non-excellent tree reach 9 or 10", () => {
    const r = strictRubric(full, { genericIndustrySwap: false, missesPromptBranch: false, interviewerExcellent: false });
    expect(total(r)).toBe(8);
  });

  it("leaves an excellent tree at 10", () => {
    const r = strictRubric(full, { genericIndustrySwap: false, missesPromptBranch: false, interviewerExcellent: true });
    expect(total(r)).toBe(10);
  });

  it("never rounds a score upward", () => {
    expect(floorScore(8.999)).toBe(8.9);
    expect(floorScore(9.96)).toBe(9.9);
    expect(floorScore(7)).toBe(7);
  });
});

describe("practice settings", () => {
  it("defaults to Intermediate and serves only Advanced in hard mode", () => {
    expect(practiceDifficulty(undefined)).toBe("Intermediate");
    expect(practiceDifficulty("")).toBe("Intermediate");
    // "All difficulties" is an explicit choice, so it is honoured.
    expect(practiceDifficulty("all")).toBeUndefined();
    expect(practiceDifficulty("Beginner")).toBe("Beginner");
    expect(practiceDifficulty("Beginner", true)).toBe("Advanced");
    expect(practiceDifficulty(undefined, true)).toBe("Advanced");
  });

  it("never generates a Beginner case", () => {
    expect(generationDifficulty(undefined)).toBe("Intermediate");
    expect(generationDifficulty("Beginner")).toBe("Intermediate");
    expect(generationDifficulty("Advanced")).toBe("Advanced");
    expect(generationDifficulty("Beginner", true)).toBe("Advanced");
  });

  it("hides hints in hard mode", () => {
    expect(showHints(false)).toBe(true);
    expect(showHints(true)).toBe(false);
  });
});

describe("framework choice", () => {
  it("scores an exact pick at 8 and never rounds up", () => {
    expect(scoreFrameworkChoice(["profitability"], ["profitability"])).toBe(8);
    expect(scoreFrameworkChoice(["profitability", "pricing"], ["profitability"])).toBe(4);
    expect(scoreFrameworkChoice(["profitability"], ["profitability", "pricing", "growth"])).toBe(2.6);
  });

  it("always offers five shuffled options including every correct framework", () => {
    const opts = frameworkOptions(["profitability"], ["growth", "pricing", "ma"], () => 0);
    expect(opts).toHaveLength(5);
    expect(new Set(opts).size).toBe(5);
    expect(opts).toContain("profitability");
    expect(opts).toContain("growth");
  });

  it("ignores distractor ids that are not real frameworks", () => {
    const opts = frameworkOptions(["profitability"], ["nonsense", "growth"] as unknown as FrameworkId[], () => 0);
    expect(opts).not.toContain("nonsense");
    expect(opts).toHaveLength(5);
  });

  it("uses compact labels so the right answer is never the longest one", () => {
    for (const f of FRAMEWORK_LIST) {
      expect(optionName(f.id).length).toBeLessThanOrEqual(9);
      expect(optionName(f.id)).not.toBe(f.id);
    }
    expect(new Set(FRAMEWORK_LIST.map((f) => optionName(f.id))).size).toBe(FRAMEWORK_LIST.length);
  });
});

describe("flaw decoys", () => {
  const withDecoy = FLAWS.find((f) => f.flaws.length === 1 && (f.decoys ?? []).length > 0)!;
  it("counts a flagged decoy as a false positive and explains why it was fine", () => {
    const key = withDecoy.flaws[0]!;
    const decoy = withDecoy.decoys![0]!;
    const clean = scoreFlawSelection(withDecoy, [{ nodeId: key.nodeId, type: key.type }]);
    const flagged = scoreFlawSelection(withDecoy, [{ nodeId: key.nodeId, type: key.type }, { nodeId: decoy.nodeId, type: "overlap" }]);
    expect(clean.points).toBe(8);
    expect(clean.decoyFlags).toHaveLength(0);
    expect(flagged.points).toBe(6.5);
    expect(flagged.decoyFlags).toEqual([{ nodeId: decoy.nodeId, why: expect.any(String) }]);
  });

  it("gives every decoy node a real place in its tree and never lists it as a flaw", () => {
    for (const item of FLAWS) {
      for (const d of item.decoys ?? []) {
        expect(findNode(item.tree, d.nodeId)?.label).toBeTruthy();
        expect(item.flaws.some((f) => f.nodeId === d.nodeId)).toBe(false);
      }
    }
  });
});

describe("reviewed bank", () => {
  it("loads 204 cases, 119 flaw drills, 136 quick checks and 102 chain drills across 17 chains", () => {
    expect(CASES.length).toBe(204);
    expect(FLAWS.length).toBe(119);
    expect(BANK_QUICK.length).toBe(136);
    expect(BANK_DRILLS.length).toBe(102);
    expect(BANK.length).toBe(17);
  });
  it("every quick check has exactly one correct option", () => {
    for (const q of BANK_QUICK) expect(q.options.filter((o) => o.correct)).toHaveLength(1);
  });
  it("every framework pick's correct answers are among its four options", () => {
    for (const c of CASES) {
      expect(c.frameworkPick!.options).toHaveLength(4);
      for (const x of c.frameworkPick!.correct) expect(c.frameworkPick!.options).toContain(x);
    }
  });
});

function findNode(n: TreeNode, id: string): TreeNode | null {
  if (n.id === id) return n;
  for (const c of n.children) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}

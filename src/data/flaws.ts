import { floorScore } from "@/lib/practice-rules";
import type { Difficulty, FrameworkId, IndustryId } from "./taxonomy";
import type { TreeNode } from "./frameworks";
import { BANK_FLAWS, type BankNode } from "./bank";

export type FlawType = "overlap" | "gap" | "mixed-levels" | "not-a-driver";
export const FLAW_TYPES: { id: FlawType; name: string; hint: string }[] = [
  { id: "overlap", name: "Overlap", hint: "Two branches cover the same thing" },
  { id: "gap", name: "Gap", hint: "A branch is missing; children don't cover the parent" },
  { id: "mixed-levels", name: "Mixed levels", hint: "Branches sit at different levels of abstraction" },
  { id: "not-a-driver", name: "Not a driver", hint: "Branch doesn't drive the question" },
];

export type FlawKey = { nodeId: string; type: FlawType; explanation: string; fix: string };
export type FlawItem = {
  id: string;
  title: string;
  industry: IndustryId;
  framework: FrameworkId;
  difficulty: Difficulty;
  tree: TreeNode;
  flaws: FlawKey[];
  correctedTree?: TreeNode | undefined;
  /** Nodes that look wrong but are fine. */
  decoys?: { nodeId: string; why: string }[] | undefined;
};

const toTree = (n: BankNode): TreeNode => ({ id: n.id, label: n.label, children: (n.children ?? []).map(toTree) });

export const FLAWS: FlawItem[] = BANK_FLAWS.map((f) => ({
  id: f.id,
  title: f.title,
  industry: f.industry,
  framework: f.framework,
  difficulty: f.difficulty,
  tree: toTree(f.tree),
  correctedTree: toTree(f.correctedTree),
  flaws: f.flaws,
  decoys: f.decoys?.map((d) => ({ nodeId: d.nodeId, why: d.whyFine })),
}));

export const getFlaw = (id: string) => FLAWS.find((f) => f.id === id);

/** Deterministic scoring of a flaw attempt. Returns 0-10 for node/type identification. */
export function scoreFlawSelection(item: FlawItem, picks: { nodeId: string; type: FlawType }[]) {
  const keyIds = new Set(item.flaws.map((f) => f.nodeId));
  let nodeHits = 0;
  let typeHits = 0;
  for (const k of item.flaws) {
    const p = picks.find((x) => x.nodeId === k.nodeId);
    if (p) {
      nodeHits++;
      if (p.type === k.type) typeHits++;
    }
  }
  const falsePositives = picks.filter((p) => !keyIds.has(p.nodeId)).length;
  // Nodes that look wrong but are fine: flagging one is a false positive, and the
  // learner is told why it was fine.
  const decoyFlags = (item.decoys ?? []).filter((d) => picks.some((p) => p.nodeId === d.nodeId));
  const total = item.flaws.length;
  const raw = (nodeHits / total) * 5 + (typeHits / total) * 3 - falsePositives * 1.5;
  return { nodeHits, typeHits, falsePositives, total, points: floorScore(Math.max(0, raw)), decoyFlags };
}

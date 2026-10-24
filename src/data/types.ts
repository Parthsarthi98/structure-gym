import type { Difficulty, FrameworkId, IndustryId } from "./taxonomy";

/** Generic diagram node. `status` drives colouring in TreeDiagram. */
export type NodeStatus = "overlap" | "gap" | "mixed" | "good" | "missing" | "driver";
export type DNode = { id?: string; label: string; children?: DNode[]; status?: NodeStatus; note?: string };

// ---------- Lessons ----------
export type LessonSection =
  | { kind: "text"; heading?: string; body: string }
  | { kind: "timeline"; heading?: string; steps: { title: string; body: string; time?: string }[] }
  | { kind: "venn"; heading?: string; caption: string; a: string; b: string; overlap: string }
  | { kind: "pie"; heading?: string; caption: string; slices: string[]; missing: string }
  | { kind: "tree"; heading?: string; caption: string; tree: DNode }
  | { kind: "compare"; heading?: string; bad: { title: string; tree: DNode }; good: { title: string; tree: DNode }; why: string }
  | { kind: "beforeAfter"; heading?: string; mistake: string; before: DNode; after: DNode; explanation: string }
  | { kind: "morph"; heading?: string; steps: { caption: string; tree: DNode }[] }
  | { kind: "example"; heading?: string; title: string; prompt: string; tree: DNode; note: string }
  | { kind: "tip"; body: string };

export type QuizQuestion = { q: string; options: string[]; answer: number; explanation: string; wrongWhy?: string[] };
export type Lesson = { id: string; number: number; title: string; summary: string; minutes: number; sections: LessonSection[]; quiz: QuizQuestion[] };

// ---------- Framework extras ----------
export type KeyNumber = { name: string; formula: string; note?: string };
export type FrameworkExample = {
  title: string;
  industry: IndustryId;
  region: "India" | "Global";
  prompt: string;
  tree: DNode;
  hypotheses: string[];
  keyNumbers: KeyNumber[];
};
export type FrameworkExtra = {
  id: FrameworkId;
  triggers: string[];
  fullTree: DNode; // 3 levels below root
  examples: FrameworkExample[];
  mistake: { bad: DNode; fixed: DNode; explanation: string };
};

// ---------- Industry cheat sheets ----------
export type IndustrySheet = {
  industry: IndustryId;
  revenueDrivers: string[];
  costDrivers: string[];
  kpis: { name: string; meaning: string }[];
  watchOuts: string[];
};

// ---------- Glossary ----------
export type GlossaryTerm = { term: string; meaning: string; formula?: string; example: string; tags: string[] };

// ---------- Hints ----------
export type CaseHints = { splitType: string; l1: string[]; fullBranch: DNode };

export type CaseAnswer = {
  modelTree: DNode;
  explanation: string;
  hypotheses: string[];
  keyMetrics: { name: string; formula: string }[];
  hints?: CaseHints | undefined;
  /** A fact in the prompt that looks important but must not drive the structure. */
  redHerring?: string | undefined;
  /** The calculation an interviewer expects the candidate to set up. */
  quantitativeStep?: string | undefined;
  /** Frameworks that look plausible for the prompt but are not the best fit. */
  distractors?: FrameworkId[] | undefined;
};

export type { Difficulty, FrameworkId, IndustryId };

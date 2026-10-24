import { createServerFn } from "@tanstack/react-start";
import { callJson, AiError } from "./ai.server";
import { strictRubric } from "./practice-rules";

/** Public endpoints (no sign-in needed): reject oversized payloads before calling the AI. */
function capInput<T>(d: T): T {
  if (JSON.stringify(d ?? null).length > 20000) throw new Error("Input too long.");
  return d;
}

export type SimpleNode = { label: string; children: SimpleNode[] };

export type TreeGrade = {
  rubric: { mutuallyExclusive: number; collectivelyExhaustive: number; relevance: number; tailoring: number; depth: number };
  rubricNotes: { mutuallyExclusive: string; collectivelyExhaustive: string; relevance: string; tailoring: string; depth: string };
  overlaps: string[];
  gaps: string[];
  errorTypes: string[];
  fixes: string[];
  modelTree: SimpleNode;
  summary: string;
  annotations?: { label: string; status: "overlap" | "mixed" | "good" | "not-a-driver" }[];
  missing?: { parentLabel: string; label: string }[];
  interviewerExcellent: boolean;
  genericIndustrySwap: boolean;
  missesPromptBranch: boolean;
};

const leaf = { type: "object", additionalProperties: false, required: ["label"], properties: { label: { type: "string" } } };
const lvl = (child: object) => ({ type: "object", additionalProperties: false, required: ["label", "children"], properties: { label: { type: "string" }, children: { type: "array", items: child } } });
const modelTreeSchema = lvl(lvl(lvl(leaf)));

const score = { type: "integer", minimum: 0, maximum: 2 };
const keys = ["mutuallyExclusive", "collectivelyExhaustive", "relevance", "tailoring", "depth"];

export const treeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["rubric", "rubricNotes", "overlaps", "gaps", "errorTypes", "fixes", "modelTree", "summary", "annotations", "missing", "interviewerExcellent", "genericIndustrySwap", "missesPromptBranch"],
  properties: {
    rubric: { type: "object", additionalProperties: false, required: keys, properties: Object.fromEntries(keys.map((k) => [k, score])) },
    rubricNotes: { type: "object", additionalProperties: false, required: keys, properties: Object.fromEntries(keys.map((k) => [k, { type: "string" }])) },
    overlaps: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    errorTypes: { type: "array", items: { type: "string", enum: ["overlap", "gap", "mixed-levels", "not-a-driver", "generic"] } },
    fixes: { type: "array", items: { type: "string" } },
    modelTree: modelTreeSchema,
    summary: { type: "string" },
    annotations: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "status"], properties: { label: { type: "string" }, status: { type: "string", enum: ["overlap", "mixed", "good", "not-a-driver"] } } } },
    missing: { type: "array", items: { type: "object", additionalProperties: false, required: ["parentLabel", "label"], properties: { parentLabel: { type: "string" }, label: { type: "string" } } } },
    interviewerExcellent: { type: "boolean" },
    genericIndustrySwap: { type: "boolean" },
    missesPromptBranch: { type: "boolean" },
  },
};

const SYSTEM_TREE = `You are a strict MBB case interview coach grading a candidate's issue tree. Use British spelling. Plain, direct, specific. No praise padding, no filler.
Grade the way a strict interviewer would: when the evidence is mixed, give the lower score. Never round a judgement upward.
Score each criterion 0-2 (integers):
- mutuallyExclusive: 2 = no overlaps; 1 = minor overlap; 0 = major overlaps.
- collectivelyExhaustive: 2 = no gaps; 1 = one notable gap; 0 = several gaps.
- relevance: does it answer the actual question and point to hypotheses? 2 = the branch the prompt clearly points at is present and tested; 1 = present but shallow, or the prompt-signalled branch is weak; 0 = it answers a different question.
- tailoring: 2 = the tree could not be written for another industry without editing it; 1 = a textbook framework with the industry name swapped in; 0 = irrelevant.
- depth: 2+ levels where needed, consistent levels of abstraction. 2/1/0.
A textbook framework with the industry name swapped in is never worth 2 on tailoring. If the prompt names a constraint, symptom or fact and the tree has no branch for it, relevance is never 2.
Report three flags:
- genericIndustrySwap: true if the tree is a textbook framework with only the industry name changed — no case-specific branches, numbers or constraints.
- missesPromptBranch: true if a branch the prompt clearly points at (a named constraint, symptom or fact) is absent from the tree.
- interviewerExcellent: true only if you would call this tree excellent in a real interview — MECE, tailored to these facts, hypothesis-led, and a partner would stop probing. Most trees are not.
In rubricNotes give one short sentence per criterion explaining the score. In overlaps and gaps, name the candidate's nodes in quotes. errorTypes: list which apply ("generic" if tailoring <= 1). Give 1-2 concrete fixes. modelTree: a strong tailored answer, 3 levels deep, 2-4 branches per level, short labels. summary: one sentence. annotations: for nodes in the candidate's tree, copy the exact label and mark "overlap" (overlaps another branch), "mixed" (wrong level of abstraction), "not-a-driver", or "good" (a strong, well-tailored node; mark 1-4 of these). missing: branches that should exist, with parentLabel = exact label of the candidate node they belong under (use the root label for first-level gaps) and a short label. If the candidate used hints, note it is fine. An empty or near-empty tree scores 0s.`;

function treeToText(node: SimpleNode, depth = 0): string {
  const pad = "  ".repeat(depth);
  const line = `${pad}- ${node.label || "(blank)"}`;
  return [line, ...node.children.map((c) => treeToText(c, depth + 1))].join("\n");
}

function handleErr(e: unknown): never {
  if (e instanceof AiError) throw new Error(e.message);
  console.error(e);
  throw new Error("Grading failed. Try again.");
}

export const gradeTree = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string; industry: string; framework: string; tree: SimpleNode }) => capInput(d))
  .handler(async ({ data }) => {
    try {
      const g = await callJson<TreeGrade>({
        system: SYSTEM_TREE,
        schemaName: "tree_grade",
        schema: treeSchema,
        user: `Case (${data.industry}; expected framework family: ${data.framework}):\n${data.prompt}\n\nCandidate's issue tree:\n${treeToText(data.tree)}`,
      });
      // The caps are enforced here, not left to the model's discretion.
      return {
        ...g,
        rubric: strictRubric(g.rubric, {
          genericIndustrySwap: !!g.genericIndustrySwap,
          missesPromptBranch: !!g.missesPromptBranch,
          interviewerExcellent: !!g.interviewerExcellent,
        }) as TreeGrade["rubric"],
      };
    } catch (e) {
      handleErr(e);
    }
  });

export type TextGrade = { score: number; feedback: string; modelAnswer: string };
const textSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "feedback", "modelAnswer"],
  properties: { score: { type: "integer", minimum: 0, maximum: 2 }, feedback: { type: "string" }, modelAnswer: { type: "string" } },
};

export const gradeFlawFix = createServerFn({ method: "POST" })
  .inputValidator((d: { tree: SimpleNode; key: string; fix: string }) => capInput(d))
  .handler(async ({ data }) => {
    try {
      return await callJson<TextGrade>({
        system: "You grade a consulting candidate's proposed fix to a flawed issue tree. British spelling. Plain and specific, no praise padding. Score 0-2: 2 = fix resolves the flaw(s) cleanly; 1 = partly; 0 = doesn't. Never round up. feedback: max 2 sentences. modelAnswer: one sentence ideal fix.",
        schemaName: "fix_grade",
        schema: textSchema,
        user: `Tree:\n${treeToText(data.tree)}\n\nAnswer key (flaws and ideal fixes):\n${data.key}\n\nCandidate's fix:\n${data.fix || "(blank)"}`,
      });
    } catch (e) {
      handleErr(e);
    }
  });

export const gradeJustification = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string; correct: string; chosen: string; justification: string }) => capInput(d))
  .handler(async ({ data }) => {
    try {
      return await callJson<TextGrade>({
        system: "You grade a consulting candidate's 1-2 sentence justification for choosing a framework and how they'd tailor it. British spelling. Plain and specific, no praise padding. Score 0-2: 2 = sound reasoning tied to the case plus a specific tailoring; 1 = generic; 0 = wrong or blank. Never round up. feedback: max 2 sentences. modelAnswer: an ideal 2-sentence justification.",
        schemaName: "just_grade",
        schema: textSchema,
        user: `Case:\n${data.prompt}\n\nBest-fit framework(s): ${data.correct}\nCandidate chose: ${data.chosen}\nCandidate's justification: ${data.justification || "(blank)"}`,
      });
    } catch (e) {
      handleErr(e);
    }
  });

const answerProps = {
  modelTree: modelTreeSchema,
  explanation: { type: "string" },
  hypotheses: { type: "array", items: { type: "string" } },
  keyMetrics: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "formula"], properties: { name: { type: "string" }, formula: { type: "string" } } } },
};
const ANSWER_RULES = "modelTree: a strong tailored answer, root = the key question, 3 levels deep, 2-4 branches per level, short labels, MECE. explanation: 3-5 plain sentences on why this split, which branch to test first and the main trap to avoid. hypotheses: the 2-3 hypotheses an interviewer expects you to test first. keyMetrics: 2-4 formulas or numbers to know (name + formula).";

export type ModelAnswer = { modelTree: SimpleNode; explanation: string; hypotheses: string[]; keyMetrics: { name: string; formula: string }[] };

export const revealAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string; industry: string; framework: string; skeleton?: string | undefined }) => capInput(d))
  .handler(async ({ data }) => {
    try {
      return await callJson<ModelAnswer>({
        system: `You are an MBB case coach writing the model answer for a structuring exercise. British spelling, plain and specific. ${ANSWER_RULES}`,
        schemaName: "model_answer",
        schema: { type: "object", additionalProperties: false, required: Object.keys(answerProps), properties: answerProps },
        user: `Case (${data.industry}; framework family: ${data.framework}):\n${data.prompt}${data.skeleton ? `\n\nUse these first-level branches so the answer matches the hints: ${data.skeleton}` : ""}`,
      });
    } catch (e) {
      handleErr(e);
    }
  });

export type GeneratedCase = {
  title: string;
  prompt: string;
  secondary: string[];
  region: "India" | "Global";
  redHerring: string;
  quantitativeStep: string;
  distractors: string[];
} & ModelAnswer & { hints: { splitType: string; l1: string[]; fullBranch: SimpleNode } };

export const generateCase = createServerFn({ method: "POST" })
  .inputValidator((d: { industry: string; framework: string; difficulty: string; frameworkIds: string[] }) => capInput(d))
  .handler(async ({ data }) => {
    const difficulty = data.difficulty === "Advanced" ? "Advanced" : "Intermediate";
    try {
      return await callJson<GeneratedCase>({
        system: `You write realistic MBB-style case interview prompts with full answers. British spelling. Plain, concrete, no hype.
Never write a Beginner case: difficulty is Intermediate or Advanced.
prompt: 2-4 sentences, concrete numbers, a clear question at the end. Mix Indian and global settings. title: max 6 words.
Every prompt contains one red herring: a fact that sounds important but must not drive the structure. Say what it is in redHerring. It must be plausible, not obviously silly.
Intermediate: one framework family, some ambiguity, one red herring. secondary is empty.
Advanced: combine two framework families (secondary lists the second one), include one quantitative step (quantitativeStep = the calculation an interviewer expects the candidate to set up, with the numbers to use), and the red herring must be a fact that changes the obvious structure — a constraint, a one-off event, a channel shift or a regulatory cap that makes the textbook split wrong.
The structure you call for must be unambiguous: exactly one first-level split is clearly the best one, and a well-prepared candidate would find it. Do not design a prompt where two different splits are equally defensible.
distractors: 3 framework ids that look plausible for this prompt but are not the best fit. They must be genuinely tempting, not obviously wrong.
secondary: other framework ids combined (empty unless Advanced).
${ANSWER_RULES}
hints: splitType = one sentence naming the type of first-level split (no branch names); l1 = the model tree's first-level labels; fullBranch = one first-level branch of the model tree with its children.`,
        schemaName: "new_case",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["title", "prompt", "secondary", "region", "redHerring", "quantitativeStep", "distractors", ...Object.keys(answerProps), "hints"],
          properties: {
            title: { type: "string" },
            prompt: { type: "string" },
            secondary: { type: "array", items: { type: "string", enum: data.frameworkIds } },
            region: { type: "string", enum: ["India", "Global"] },
            redHerring: { type: "string" },
            quantitativeStep: { type: "string" },
            distractors: { type: "array", minItems: 3, maxItems: 3, items: { type: "string", enum: data.frameworkIds } },
            ...answerProps,
            hints: { type: "object", additionalProperties: false, required: ["splitType", "l1", "fullBranch"], properties: { splitType: { type: "string" }, l1: { type: "array", items: { type: "string" } }, fullBranch: lvl(lvl(leaf)) } },
          },
        },
        user: `Industry: ${data.industry}\nPrimary framework: ${data.framework}\nDifficulty: ${difficulty}`,
      });
    } catch (e) {
      handleErr(e);
    }
  });

import type { Difficulty, FrameworkId, IndustryId } from "./taxonomy";
import type { CaseAnswer, DNode } from "./types";
import { BANK_CASES, type BankCase, type BankNode } from "./bank";

export type CaseItem = {
  id: string;
  title: string;
  industry: IndustryId;
  framework: FrameworkId;
  secondary: FrameworkId[];
  difficulty: Difficulty;
  region: "India" | "Global";
  prompt: string;
  generated?: boolean;
  answer?: CaseAnswer | undefined;
  distractors?: FrameworkId[] | undefined;
  redHerring?: string | undefined;
  quantitativeStep?: string | undefined;
  /** Bank-only fields */
  clarifyingFacts?: string[] | undefined;
  hintList?: string[] | undefined;
  commonMistakes?: string[] | undefined;
  frameworkPick?: BankCase["frameworkPick"] | undefined;
};

export const toDNode = (n: BankNode): DNode => ({ id: n.id, label: n.label, children: (n.children ?? []).map(toDNode) });

const fromBank = (b: BankCase): CaseItem => ({
  id: b.id,
  title: b.title,
  industry: b.industry,
  framework: b.framework,
  secondary: b.secondary ?? [],
  difficulty: b.difficulty,
  region: b.region,
  prompt: b.prompt,
  clarifyingFacts: b.clarifyingFacts,
  hintList: b.hints,
  commonMistakes: b.commonMistakes,
  frameworkPick: b.frameworkPick,
  answer: {
    modelTree: toDNode(b.modelTree),
    explanation: b.frameworkPick.why,
    hypotheses: b.hypotheses,
    keyMetrics: b.keyMetrics,
  },
});

export const CASES: CaseItem[] = BANK_CASES.map(fromBank);

export const getCase = (id: string) => CASES.find((x) => x.id === id);

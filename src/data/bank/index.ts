// Reviewed exercise bank: one JSON file per industry, loaded verbatim. Do not edit the JSON.
import type { Difficulty, FrameworkId, IndustryId } from "../taxonomy";
import retail from "./retail.json";
import fmcg from "./fmcg.json";
import banking from "./banking.json";
import insurance from "./insurance.json";
import telecom from "./telecom.json";
import airlines from "./airlines.json";
import healthcare from "./healthcare.json";
import tech from "./tech.json";
import ecommerce from "./ecommerce.json";
import energy from "./energy.json";
import auto from "./auto.json";
import manufacturing from "./manufacturing.json";
import media from "./media.json";
import hospitality from "./hospitality.json";
import education from "./education.json";
import logistics from "./logistics.json";
import publicSector from "./public.json";

export type BankNode = { id: string; label: string; children?: BankNode[] };
export type BankCase = {
  id: string; title: string; industry: IndustryId; framework: FrameworkId; secondary: FrameworkId[];
  difficulty: Difficulty; region: "India" | "Global"; prompt: string; clarifyingFacts: string[];
  modelTree: BankNode; hypotheses: string[]; hints: string[]; keyMetrics: { name: string; formula: string }[];
  commonMistakes: string[];
  frameworkPick: { options: FrameworkId[]; correct: FrameworkId[]; why: string; distractorWhyNot: Record<string, string> };
};
export type BankFlawType = "overlap" | "gap" | "mixed-levels" | "not-a-driver";
export type BankFlaw = {
  id: string; title: string; industry: IndustryId; framework: FrameworkId; difficulty: Difficulty;
  tree: BankNode; flaws: { nodeId: string; type: BankFlawType; explanation: string; fix: string }[];
  correctedTree: BankNode; decoys?: { nodeId: string; whyFine: string }[];
};
export type BankQuick = {
  id: string; industry: IndustryId; difficulty: Difficulty; question: string; parent: string;
  options: { split: string[]; correct: boolean; why: string }[];
};
export type BankChainDrill = {
  id: string; industry: IndustryId; difficulty: Difficulty; type: "locate" | "order" | "assign";
  prompt: string; why: string; options?: string[]; answer?: string[]; items?: { item: string; stage: string }[];
};
export type BankStage = {
  id: string; name: string; activities: string[]; players: string[]; revenueDrivers: string[]; costDrivers: string[];
  kpis: { name: string; formula: string; benchmark: string }[]; marginNote: string;
};
export type BankValueChain = {
  summary: string; stages: BankStage[]; profitPools: string;
  unitEconomics: { unit: string; lines: { item: string; value: string }[]; result: string };
  india: string; workedExample: { problem: string; trace: string[]; lesson: string };
};
export type BankFile = { industry: IndustryId; valueChain: BankValueChain; cases: BankCase[]; flaws: BankFlaw[]; quick: BankQuick[]; chainDrills: BankChainDrill[] };

export const BANK = [
  retail, fmcg, banking, insurance, telecom, airlines, healthcare, tech, ecommerce, energy, auto,
  manufacturing, media, hospitality, education, logistics, publicSector,
] as unknown as BankFile[];

export const BANK_CASES = BANK.flatMap((b) => b.cases);
export const BANK_FLAWS = BANK.flatMap((b) => b.flaws);
export const BANK_QUICK = BANK.flatMap((b) => b.quick);
export const BANK_DRILLS = BANK.flatMap((b) => b.chainDrills);
export const getBankFile = (industry: string) => BANK.find((b) => b.industry === industry);

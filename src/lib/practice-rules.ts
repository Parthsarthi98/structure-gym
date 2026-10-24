import { FRAMEWORK_LIST, type Difficulty, type FrameworkId } from "@/data/taxonomy";

export const floorScore = (score: number) => Math.floor(score * 10) / 10;
export const practiceDifficulty = (difficulty?: string, hard = false): Difficulty | undefined => hard ? "Advanced" : difficulty === "all" ? undefined : difficulty === "Beginner" || difficulty === "Advanced" ? difficulty : "Intermediate";
export const generationDifficulty = (difficulty?: string, hard = false): "Intermediate" | "Advanced" => hard || difficulty === "Advanced" ? "Advanced" : "Intermediate";
export const showHints = (hard: boolean) => !hard;

export type GradingChecks = { genericIndustrySwap: boolean; missesPromptBranch: boolean; interviewerExcellent: boolean };
export function strictRubric(rubric: Record<string, number>, checks: GradingChecks) {
  const result = Object.fromEntries(Object.entries(rubric).map(([key, value]) => [key, Math.max(0, Math.min(2, Math.floor(value)))]));
  if (checks.genericIndustrySwap) result["tailoring"] = Math.min(result["tailoring"] ?? 0, 1);
  if (checks.missesPromptBranch) result["relevance"] = Math.min(result["relevance"] ?? 0, 1);
  if (!checks.interviewerExcellent) {
    while (Object.values(result).reduce((a, b) => a + b, 0) > 8) {
      const key = ["tailoring", "relevance", "depth", "collectivelyExhaustive", "mutuallyExclusive"].find((k) => (result[k] ?? 0) > 0);
      if (!key) break;
      result[key] = (result[key] ?? 0) - 1;
    }
  }
  return result;
}
export function scoreFrameworkChoice(correct: string[], chosen: string[]) {
  const picks = [...new Set(chosen)];
  const union = new Set([...correct, ...picks]).size;
  return union ? floorScore(picks.filter((id) => correct.includes(id)).length / union * 8) : 0;
}
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
// Compact canonical labels avoid long textbook names signalling the answer.
export const optionName = (id: string) => ({ profitability: "Profit", "market-entry": "Entry", ma: "M&A", pricing: "Price", growth: "Growth", "product-launch": "Launch", "market-sizing": "Sizing", operations: "Costs", "competitive-response": "Response", "pe-dd": "Diligence", turnaround: "Recovery", segmentation: "Segments" })[id as "profitability"] ?? id;
export function frameworkOptions(correct: FrameworkId[], distractors: FrameworkId[] = [], random = Math.random): FrameworkId[] {
  const valid = distractors.filter((id) => FRAMEWORK_LIST.some((f) => f.id === id) && !correct.includes(id));
  const pool = [...new Set([...valid, ...shuffled(FRAMEWORK_LIST.map((f) => f.id).filter((id) => !correct.includes(id)), random)])];
  return shuffled([...correct, ...pool.slice(0, Math.max(3, 5 - correct.length))], random);
}
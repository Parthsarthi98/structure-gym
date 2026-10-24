import { RUBRIC, type RubricKey } from "@/data/taxonomy";

export type Attempt = {
  id: string;
  mode: string;
  case_id: string;
  case_title: string;
  case_prompt: string | null;
  industry: string;
  framework: string;
  difficulty: string;
  score: number;
  rubric: Partial<Record<RubricKey, number>> | null;
  error_types: string[];
  time_taken_seconds: number | null;
  time_limit_seconds: number | null;
  user_answer: unknown;
  feedback: unknown;
  created_at: string;
  hints_used?: number;
};

export const HINT_PENALTY = 0.5;
/** Each hint used costs 0.5 points, never below zero. */
export const applyHintPenalty = (score: number, hints: number) => Math.max(0, score - hints * HINT_PENALTY);

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Average per rubric criterion (0-2) across attempts that have a rubric. */
export function rubricAverages(attempts: Attempt[]) {
  return RUBRIC.map((r) => {
    const vals = attempts.map((a) => a.rubric?.[r.key]).filter((v): v is number => typeof v === "number");
    return { key: r.key, name: r.name, avg: avg(vals), n: vals.length };
  });
}

export function weakestCriterion(attempts: Attempt[]): RubricKey | null {
  const withData = rubricAverages(attempts).filter((r) => r.avg !== null);
  if (!withData.length) return null;
  return withData.sort((a, b) => (a.avg as number) - (b.avg as number))[0]!.key;
}

export function groupAvg(attempts: Attempt[], key: "industry" | "framework") {
  const m = new Map<string, number[]>();
  for (const a of attempts) m.set(a[key], [...(m.get(a[key]) ?? []), Number(a.score)]);
  return [...m.entries()].map(([id, xs]) => ({ id, avg: avg(xs) as number, n: xs.length }));
}

export function heatmap(attempts: Attempt[]) {
  const m = new Map<string, number[]>();
  for (const a of attempts) {
    const k = `${a.industry}|${a.framework}`;
    m.set(k, [...(m.get(k) ?? []), Number(a.score)]);
  }
  return m;
}

export function errorCounts(attempts: Attempt[]) {
  const m = new Map<string, number>();
  for (const a of attempts) for (const e of a.error_types ?? []) m.set(e, (m.get(e) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Consecutive days (ending today or yesterday) with at least one attempt. */
export function streak(attempts: Attempt[], now = new Date()) {
  const days = new Set(attempts.map((a) => a.created_at.slice(0, 10)));
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const key = () => d.toISOString().slice(0, 10);
  if (!days.has(key())) d.setUTCDate(d.getUTCDate() - 1);
  let s = 0;
  while (days.has(key())) {
    s++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return s;
}

export const REVIEW_THRESHOLD = 6;
export const MASTERED_SCORE = 7;

/**
 * Review queue: cases whose first low attempt scored below 6 and which haven't
 * since been scored 7+. Ordered by the weakest criterion score, then lowest score.
 */
export function reviewQueue(attempts: Attempt[]) {
  const byCase = new Map<string, Attempt[]>();
  for (const a of attempts) byCase.set(`${a.mode === "timed" ? "build" : a.mode}|${a.case_id}`, [...(byCase.get(`${a.mode === "timed" ? "build" : a.mode}|${a.case_id}`) ?? []), a]);
  const weak = weakestCriterion(attempts);
  const out: { attempt: Attempt; weakScore: number }[] = [];
  for (const list of byCase.values()) {
    const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const firstLowIdx = sorted.findIndex((a) => Number(a.score) < REVIEW_THRESHOLD);
    if (firstLowIdx === -1) continue;
    const later = sorted.slice(firstLowIdx);
    if (later.some((a) => Number(a.score) >= MASTERED_SCORE)) continue;
    const latest = later[later.length - 1]!;
    const weakScore = weak && latest.rubric?.[weak] !== undefined ? (latest.rubric[weak] as number) : 3;
    out.push({ attempt: latest, weakScore });
  }
  return out.sort((a, b) => a.weakScore - b.weakScore || Number(a.attempt.score) - Number(b.attempt.score)).map((x) => x.attempt);
}

export function recommendation(attempts: Attempt[]) {
  if (!attempts.length) return null;
  const ind = groupAvg(attempts, "industry").sort((a, b) => a.avg - b.avg)[0];
  const fw = groupAvg(attempts, "framework").sort((a, b) => a.avg - b.avg)[0];
  return { industry: ind?.id, framework: fw?.id, criterion: weakestCriterion(attempts) };
}

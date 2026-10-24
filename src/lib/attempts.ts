import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Attempt } from "./stats";
import { CASES, getCase, type CaseItem } from "@/data/cases";
import type { Difficulty, FrameworkId, IndustryId } from "@/data/taxonomy";
import type { Json } from "@/integrations/supabase/types";
import { addLocalAttempt, addLocalGenerated, clearLocal, localAttempts, localGenerated, localLessons } from "./local-store";

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Signed in: the account's attempts. Signed out: attempts saved in this browser. */
export const attemptsQuery = queryOptions({
  queryKey: ["attempts"],
  queryFn: async (): Promise<Attempt[]> => {
    if (!(await currentUserId())) return localAttempts();
    const { data, error } = await supabase.from("attempts").select("*").order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return (data ?? []) as unknown as Attempt[];
  },
});

export type NewAttempt = Omit<Attempt, "id" | "created_at" | "user_answer" | "feedback" | "rubric" | "hints_used"> & {
  user_answer: unknown;
  feedback: unknown;
  rubric: Record<string, number> | null;
  hints_used?: number;
};

export async function saveAttempt(a: NewAttempt) {
  const uid = await currentUserId();
  if (!uid) {
    addLocalAttempt({ ...a, rubric: a.rubric, hints_used: a.hints_used ?? 0 });
    return;
  }
  const { error } = await supabase.from("attempts").insert({
    ...a,
    user_id: uid,
    user_answer: a.user_answer as Json,
    feedback: a.feedback as Json,
    rubric: a.rubric as Json,
  });
  if (error) throw error;
}

type GeneratedInput = Omit<CaseItem, "id" | "generated">;

/** Stores an AI-generated case (account if signed in, otherwise this browser) and returns its id. */
export async function saveGeneratedCase(c: GeneratedInput): Promise<string> {
  const uid = await currentUserId();
  if (!uid) return addLocalGenerated(c).id;
  const { data, error } = await supabase
    .from("generated_cases")
    .insert({ user_id: uid, title: c.title, prompt: c.prompt, industry: c.industry, framework: c.framework, secondary_frameworks: c.secondary, difficulty: c.difficulty, region: c.region, answer: (c.answer ?? null) as Json })
    .select("id")
    .single();
  if (error) throw error;
  return `g-${data.id}`;
}

export async function resolveCase(id: string): Promise<CaseItem | null> {
  if (id.startsWith("gl-")) return localGenerated().find((c) => c.id === id) ?? null;
  if (!id.startsWith("g-")) return getCase(id) ?? null;
  const { data } = await supabase.from("generated_cases").select("*").eq("id", id.slice(2)).maybeSingle();
  if (!data) return null;
  const answer = (data.answer as unknown as CaseItem["answer"]) ?? undefined;
  return {
    id,
    title: data.title,
    prompt: data.prompt,
    industry: data.industry as IndustryId,
    framework: data.framework as FrameworkId,
    secondary: data.secondary_frameworks as FrameworkId[],
    difficulty: data.difficulty as Difficulty,
    region: data.region as "India" | "Global",
    generated: true,
    answer,
    distractors: answer?.distractors,
    redHerring: answer?.redHerring,
    quantitativeStep: answer?.quantitativeStep,
  };
}

let syncing: Promise<number> | null = null;
/**
 * First sign-in on a device: copy attempts, lesson progress and generated cases
 * saved in this browser into the account, then clear the browser copy.
 * Returns the number of attempts moved.
 */
export function syncLocalToAccount(): Promise<number> {
  syncing ??= (async () => {
    try {
      const uid = await currentUserId();
      if (!uid) return 0;
      const gens = localGenerated();
      const idMap = new Map<string, string>();
      for (const g of gens) {
        const { id: oldId, generated: _g, ...rest } = g;
        idMap.set(oldId, await saveGeneratedCase(rest));
      }
      const atts = localAttempts();
      if (atts.length) {
        const rows = atts.map(({ id: _id, ...a }) => ({
          ...a,
          user_id: uid,
          case_id: idMap.get(a.case_id) ?? a.case_id,
          rubric: a.rubric as Json,
          user_answer: a.user_answer as Json,
          feedback: a.feedback as Json,
        }));
        const { error } = await supabase.from("attempts").insert(rows);
        if (error) throw error;
      }
      const lessons = localLessons();
      if (lessons.length) {
        const { error } = await supabase.from("lesson_progress").upsert(lessons.map((l) => ({ ...l, user_id: uid })));
        if (error) throw error;
      }
      clearLocal();
      return atts.length;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

export function filterCases(f: { industry?: string | undefined; framework?: string | undefined; difficulty?: string | undefined }) {
  return CASES.filter(
    (c) =>
      (!f.industry || c.industry === f.industry) &&
      (!f.framework || c.framework === f.framework || c.secondary.includes(f.framework as FrameworkId)) &&
      (!f.difficulty || c.difficulty === f.difficulty),
  );
}

export const pickRandom = <T,>(xs: T[]): T | undefined => xs[Math.floor(Math.random() * xs.length)];

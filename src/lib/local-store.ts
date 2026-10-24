// Browser storage for signed-out use. Attempts, lesson progress and generated cases
// live here until the user signs in; then syncLocalToAccount moves them to the account.
import type { Attempt } from "./stats";
import type { LessonProgress } from "./lessons";
import type { CaseItem } from "@/data/cases";

const K = { attempts: "sg-attempts", lessons: "sg-lessons", generated: "sg-generated-cases" } as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}
function write<T>(key: string, v: T[]) {
  localStorage.setItem(key, JSON.stringify(v));
}

export const localAttempts = () => read<Attempt>(K.attempts).sort((a, b) => b.created_at.localeCompare(a.created_at));
export function addLocalAttempt(a: Omit<Attempt, "id" | "created_at">) {
  const full: Attempt = { ...a, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  write(K.attempts, [...read<Attempt>(K.attempts), full]);
  return full;
}

export const localLessons = () => read<LessonProgress>(K.lessons);
export function setLocalLesson(p: LessonProgress) {
  write(K.lessons, [...read<LessonProgress>(K.lessons).filter((x) => x.lesson_id !== p.lesson_id), p]);
}

/** Locally generated cases use ids starting "gl-". */
export const localGenerated = () => read<CaseItem>(K.generated);
export function addLocalGenerated(c: Omit<CaseItem, "id">) {
  const full = { ...c, id: `gl-${crypto.randomUUID()}`, generated: true } as CaseItem;
  write(K.generated, [...read<CaseItem>(K.generated), full]);
  return full;
}

export function clearLocal() {
  for (const k of Object.values(K)) localStorage.removeItem(k);
}
export const hasLocalData = () => localAttempts().length + localLessons().length + localGenerated().length > 0;

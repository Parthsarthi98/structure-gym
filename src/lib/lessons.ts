import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localLessons, setLocalLesson } from "./local-store";

export type LessonProgress = { lesson_id: string; quiz_score: number; completed_at: string };

export const progressQuery = queryOptions({
  queryKey: ["lesson_progress"],
  queryFn: async (): Promise<LessonProgress[]> => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return localLessons();
    const { data, error } = await supabase.from("lesson_progress").select("lesson_id, quiz_score, completed_at");
    if (error) throw error;
    return data ?? [];
  },
});

export async function markLessonComplete(lessonId: string, score: number) {
  const row = { lesson_id: lessonId, quiz_score: score, completed_at: new Date().toISOString() };
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) {
    setLocalLesson(row);
    return true;
  }
  const { error } = await supabase.from("lesson_progress").upsert({ ...row, user_id: s.session.user.id });
  if (error) throw error;
  return true;
}

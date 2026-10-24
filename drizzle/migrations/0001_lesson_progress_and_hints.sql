CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  lesson_id text NOT NULL,
  quiz_score integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lp select" ON public.lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own lp insert" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own lp update" ON public.lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own lp delete" ON public.lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER TABLE public.attempts ADD COLUMN hints_used integer NOT NULL DEFAULT 0;
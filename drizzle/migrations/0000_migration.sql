CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  mode text NOT NULL,
  case_id text NOT NULL,
  case_title text NOT NULL,
  case_prompt text,
  industry text NOT NULL,
  framework text NOT NULL,
  difficulty text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  rubric jsonb,
  error_types text[] NOT NULL DEFAULT '{}',
  time_taken_seconds integer,
  time_limit_seconds integer,
  user_answer jsonb,
  feedback jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts select" ON public.attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own attempts insert" ON public.attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own attempts delete" ON public.attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX attempts_user_created ON public.attempts(user_id, created_at DESC);

CREATE TABLE public.generated_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  prompt text NOT NULL,
  industry text NOT NULL,
  framework text NOT NULL,
  secondary_frameworks text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL,
  region text NOT NULL DEFAULT 'Global',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.generated_cases TO authenticated;
GRANT ALL ON public.generated_cases TO service_role;
ALTER TABLE public.generated_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gen select" ON public.generated_cases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own gen insert" ON public.generated_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own gen delete" ON public.generated_cases FOR DELETE TO authenticated USING (auth.uid() = user_id);
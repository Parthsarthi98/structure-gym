import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TreeEditor, newNode, toSimple, countNodes, type EditNode } from "@/components/TreeEditor";
import { RubricKey, ScoreBadge, TreeGradeView, treeTotal } from "@/components/GradeResult";
import { TreeDiagram } from "@/components/TreeDiagram";
import { AskInterviewer, HintsPanel, SimilarExample } from "@/components/PracticeHelpers";
import { AnswerPanel } from "@/components/AnswerPanel";
import { Opener } from "@/components/AppHeader";
import { FRAMEWORKS } from "@/data/frameworks";
import { frameworkName, industryName, type FrameworkId } from "@/data/taxonomy";
import { resolveCase, saveAttempt } from "@/lib/attempts";
import { applyHintPenalty } from "@/lib/stats";
import { floorScore, frameworkOptions, shuffled, optionName, scoreFrameworkChoice, showHints } from "@/lib/practice-rules";
import { useHardMode } from "@/lib/hard-mode";
import { gradeJustification, gradeTree, type TreeGrade, type TextGrade, type SimpleNode } from "@/lib/grading.functions";
import type { CaseItem } from "@/data/cases";

export const Route = createFileRoute("/drill/$mode/$caseId")({
  beforeLoad: ({ params }) => {
    if (params.mode === "timed") throw redirect({ to: "/drill/$mode/$caseId", params: { mode: "build", caseId: params.caseId }, replace: true });
    if (!["build", "framework"].includes(params.mode)) throw notFound();
  },
  head: () => ({ meta: [{ title: "Drill — Structure Gym" }, { name: "description", content: "Structure a consulting case." }, { property: "og:title", content: "Drill — Structure Gym" }, { property: "og:description", content: "Structure a consulting case." }] }),
  component: Drill,
});

function Drill() {
  const { mode, caseId } = Route.useParams();
  const { data: c, isLoading } = useQuery({ queryKey: ["case", caseId], queryFn: () => resolveCase(caseId) });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading case…</p>;
  if (!c) return <p>Case not found. <Link to="/practice" className="text-primary underline">Back to practice</Link></p>;
  return (
    <div className="space-y-6">
      <CaseHeader c={c} hideFramework={mode === "framework"} />
      {mode === "framework" ? <FrameworkMode key={c.id} c={c} /> : <TreeMode key={c.id + mode} c={c} />}
    </div>
  );
}

function CaseHeader({ c, hideFramework }: { c: CaseItem; hideFramework?: boolean }) {
  const meta = [industryName(c.industry), !hideFramework ? [c.framework, ...c.secondary].map(frameworkName).join(" + ") : null, c.difficulty, c.region, c.generated ? "AI-generated" : null].filter(Boolean).join(" · ");
  return (
    <div>
      <Link to="/practice" className="text-sm italic text-muted-foreground hover:text-destructive">← Back to practice</Link>
      <div className="mt-3"><Opener kicker={meta} title={c.title} /></div>
      <p className="dropcap max-w-3xl text-xl leading-relaxed">{c.prompt}</p>
      {c.clarifyingFacts && <div className="mt-5"><AskInterviewer facts={c.clarifyingFacts} /></div>}
    </div>
  );
}

function TreeMode({ c }: { c: CaseItem }) {
  const qc = useQueryClient();
  const [hard] = useHardMode();
  const grade = useServerFn(gradeTree);
  const [tree, setTree] = useState<EditNode>(() => newNode(""));
  const [result, setResult] = useState<{ grade: TreeGrade; userTree: SimpleNode } | null>(null);
  const [view, setView] = useState<"split" | "outline" | "diagram">("split");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  revealedRef.current = revealed;
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const submittedRef = useRef(false);
  const treeRef = useRef(tree);
  treeRef.current = tree;
  const hintsRef = useRef(hintsUsed);
  hintsRef.current = hintsUsed;

  const submit = async () => {
    if (submittedRef.current) return;
    const t = treeRef.current;
    if (countNodes(t) < 3) {
      toast.error("Add at least two branches before submitting.");
      return;
    }
    submittedRef.current = true;
    setLocked(true);
    setBusy(true);
    try {
      const simple = toSimple(t);
      const g = await grade({ data: { prompt: c.prompt, industry: industryName(c.industry), framework: [c.framework, ...c.secondary].map(frameworkName).join(" + "), tree: simple } });
      setResult({ grade: g, userTree: simple });
      await saveAttempt({
        mode: "build", case_id: c.id, case_title: c.title, case_prompt: c.prompt, industry: c.industry, framework: c.framework, difficulty: c.difficulty,
        score: floorScore(applyHintPenalty(treeTotal(g), hintsRef.current)), rubric: g.rubric, error_types: g.errorTypes, time_taken_seconds: null, time_limit_seconds: null,
        user_answer: simple, feedback: { ...g, revealed: revealedRef.current }, hints_used: hintsRef.current,
      });
      qc.invalidateQueries({ queryKey: ["attempts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Grading failed.");
      submittedRef.current = false;
      setLocked(false);
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    setTree(newNode(""));
    setResult(null);
    setHintsUsed(0);
    setRevealed(false);
    setLocked(false);
    submittedRef.current = false;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-md border bg-card p-0.5 text-sm">
              {(["split", "outline", "diagram"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded px-3 py-1 capitalize ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{v === "split" ? "Both" : v}</button>
              ))}
            </div>
          </div>
          <div className={view === "split" ? "grid gap-4 xl:grid-cols-2" : ""}>
            {view !== "diagram" && (
              <div className="min-w-0">
                <TreeEditor value={tree} onChange={setTree} locked={locked} />
                <p className="mt-2 text-xs text-muted-foreground">Press Enter in a box to add a sub-branch. Up to 4 levels below the key question.</p>
              </div>
            )}
            {view !== "outline" && (
              <div className="min-w-0 rounded-md border bg-background p-3">
                <div className="mb-2 text-xs text-muted-foreground">Live diagram</div>
                <TreeDiagram tree={toSimple(tree)} />
              </div>
            )}
          </div>
          {!result && (
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => submit()} disabled={busy}>{busy ? "Grading… (about 20 seconds)" : "Submit for grading"}</Button>
              {revealed && <span className="stamp text-sm">Revealed</span>}
            </div>
          )}
          {!result && <AnswerPanel c={c} onReveal={() => setRevealed(true)} />}
        </div>
        <aside className="space-y-4">
          {!result && showHints(hard) && <HintsPanel caseItem={c} used={hintsUsed} onUse={setHintsUsed} disabled={locked} />}
          <SimilarExample caseItem={c} />
          <RubricKey />
        </aside>
      </div>
      {result && (
        <div className="rounded-md border bg-card p-5">
          <TreeGradeView grade={result.grade} userTree={result.userTree} hintsUsed={hintsUsed} />
          <div className="mt-6"><AnswerPanel c={c} open submitted /></div>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={retry}>Try again</Button>
            <Button asChild><Link to="/practice" search={{ mode: "build" }}>Next case</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}


function FrameworkMode({ c }: { c: CaseItem }) {
  const qc = useQueryClient();
  const gradeJ = useServerFn(gradeJustification);
  const pick = c.frameworkPick;
  const correct = useMemo(() => (pick ? pick.correct : [c.framework, ...c.secondary]) as FrameworkId[], [c, pick]);
  // Bank cases carry their own four options; generated cases use their distractors.
  // Either way the order is shuffled so the right answer is never in a predictable slot.
  const options = useMemo(
    () => (pick ? shuffled(pick.options) : frameworkOptions(correct, c.distractors ?? [])),
    [c, correct, pick],
  );
  const [chosen, setChosen] = useState<string[]>([]);
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ choice: number; j: TextGrade } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = async () => {
    if (!chosen.length) { toast.error("Pick at least one framework."); return; }
    setBusy(true);
    try {
      const choice = scoreFrameworkChoice(correct, chosen);
      const j = await gradeJ({ data: { prompt: c.prompt, correct: correct.map(frameworkName).join(" + "), chosen: chosen.map(frameworkName).join(" + "), justification: why } });
      setRes({ choice, j });
      const exact = choice === 8;
      await saveAttempt({
        mode: "framework", case_id: c.id, case_title: c.title, case_prompt: c.prompt, industry: c.industry, framework: c.framework, difficulty: c.difficulty,
        score: floorScore(choice + j.score), rubric: null, error_types: [...(exact ? [] : ["wrong-framework"]), ...(j.score <= 1 ? ["generic"] : [])],
        time_taken_seconds: null, time_limit_seconds: null, user_answer: { chosen, justification: why }, feedback: { correct, choice, ...j, revealed },
      });
      qc.invalidateQueries({ queryKey: ["attempts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Grading failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="font-semibold">Which framework fits best?</h2>
        <p className="text-sm text-muted-foreground">Select more than one if a hybrid is needed.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((id) => {
            const on = chosen.includes(id);
            const state = res ? (correct.includes(id) ? "border-success bg-success/10" : on ? "border-destructive bg-destructive/10" : "") : on ? "border-primary bg-primary/10" : "";
            return (
              <button key={id} disabled={!!res} onClick={() => setChosen(on ? chosen.filter((x) => x !== id) : [...chosen, id])} className={`rounded-md border bg-card p-3 text-left text-sm ${state}`}>
                {optionName(id)}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="why">Why, and what would you tailor? (1–2 sentences)</label>
        <Textarea id="why" disabled={!!res} value={why} onChange={(e) => setWhy(e.target.value)} className="mt-2 bg-card" rows={3} />
      </div>
      {!res ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={busy}>{busy ? "Grading…" : "Submit"}</Button>
          {!revealed ? (
            <button className="border border-destructive px-3 py-1 smallcaps text-destructive" onClick={() => { if (confirm("Reveal the answer? This attempt will be marked as revealed.")) setRevealed(true); }}>Reveal answer</button>
          ) : <span className="stamp text-sm">Revealed</span>}
        </div>
      ) : (
        <div className="space-y-3 rounded-md border bg-card p-5">
          <ScoreBadge score={res.choice + res.j.score} />
          <p className="text-sm"><b>Choice:</b> {res.choice}/8. Best fit: {correct.map(frameworkName).join(" + ")}.</p>
          <p className="text-sm"><b>Justification:</b> {res.j.score}/2. {res.j.feedback}</p>
          <p className="text-sm text-muted-foreground"><b>Model answer:</b> {res.j.modelAnswer}</p>
          <Button asChild><Link to="/practice" search={{ mode: "framework" }}>Next case</Link></Button>
        </div>
      )}
      {(revealed || res) && <OptionExplainer correct={correct} options={options} why={pick?.why} whyNot={pick?.distractorWhyNot} />}
      {(revealed || res) && <AnswerPanel c={c} open submitted />}
    </div>
  );
}

function OptionExplainer({ correct, options, why, whyNot }: { correct: string[]; options: string[]; why?: string | undefined; whyNot?: Record<string, string> | undefined }) {
  const ref = (id: string) => FRAMEWORKS.find((f) => f.id === id);
  const caseNeeds = correct.map((id) => ref(id)?.whenToUse[0]?.toLowerCase()).filter(Boolean).join("; and ");
  return (
    <section className="border border-foreground bg-card p-5">
      <h3 className="font-display text-2xl font-semibold">Every option, explained</h3>
      <ul className="mt-3 divide-y divide-hairline">
        {options.map((id) => {
          const ok = correct.includes(id);
          const f = ref(id);
          return (
            <li key={id} className="grid gap-1 py-2.5 sm:grid-cols-[13rem_1fr]">
              <span className={`font-semibold ${ok ? "text-success" : "text-destructive"}`}>{ok ? "✓" : "✗"} {frameworkName(id)}</span>
              <span className="text-sm">
                {ok && why
                  ? `Right. ${why}`
                  : !ok && whyNot?.[id]
                  ? `Not the best fit. ${whyNot[id]}`
                  : ok
                  ? `Right. ${f?.summary ?? ""} It fits because the prompt is about: ${f?.whenToUse.join("; ").toLowerCase()}.`
                  : `Not the best fit. It is for: ${f?.whenToUse.join("; ").toLowerCase()}. This case is about: ${caseNeeds}.`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

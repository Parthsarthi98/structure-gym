import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { DNode } from "@/data/types";
import { TreeDiagram, DiagramLegend } from "@/components/TreeDiagram";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBadge } from "@/components/GradeResult";
import { FLAW_TYPES, getFlaw, scoreFlawSelection, type FlawType, type FlawItem } from "@/data/flaws";
import type { TreeNode } from "@/data/frameworks";
import { frameworkName, industryName } from "@/data/taxonomy";
import { gradeFlawFix, type TextGrade } from "@/lib/grading.functions";
import { saveAttempt } from "@/lib/attempts";

export const Route = createFileRoute("/flaw/$flawId")({
  loader: ({ params }) => {
    const f = getFlaw(params.flawId);
    if (!f) throw notFound();
    return f;
  },
  head: () => ({ meta: [{ title: "Spot the MECE flaw — Structure Gym" }, { name: "description", content: "Find the flaw in a case breakdown." }, { property: "og:title", content: "Spot the MECE flaw — Structure Gym" }, { property: "og:description", content: "Find the flaw in a case breakdown." }] }),
  component: FlawPage,
});

type Plain = { label: string; children: Plain[] };
const strip = (n: TreeNode): Plain => ({ label: n.label, children: n.children.map(strip) });

function FlawPage() {
  const item = Route.useLoaderData();
  return <FlawExercise key={item.id} item={item} />;
}

function FlawExercise({ item }: { item: FlawItem }) {
  const qc = useQueryClient();
  const gradeFix = useServerFn(gradeFlawFix);
  const [picks, setPicks] = useState<Record<string, FlawType | "">>({});
  const [fix, setFix] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ points: number; ai: TextGrade; decoyFlags: { nodeId: string; why: string }[] } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const toggle = (id: string) => {
    if (res) return;
    const p = { ...picks };
    if (id in p) delete p[id];
    else p[id] = "";
    setPicks(p);
  };

  const submit = async () => {
    const list = Object.entries(picks);
    if (!list.length) { toast.error("Click at least one flawed node."); return; }
    if (list.some(([, t]) => !t)) { toast.error("Pick a flaw type for each selected node."); return; }
    setBusy(true);
    try {
      const sel = list.map(([nodeId, type]) => ({ nodeId, type: type as FlawType }));
      const s = scoreFlawSelection(item, sel);
      const key = item.flaws.map((f) => `- Node "${findLabel(item.tree, f.nodeId)}": ${f.type}. ${f.explanation} Fix: ${f.fix}`).join("\n");
      const ai = await gradeFix({ data: { tree: strip(item.tree), key, fix } });
      setRes({ points: s.points, ai, decoyFlags: s.decoyFlags });
      const missed = item.flaws.filter((f) => !sel.some((p) => p.nodeId === f.nodeId && p.type === f.type)).map((f) => f.type);
      await saveAttempt({
        mode: "flaw", case_id: item.id, case_title: item.title, case_prompt: item.tree.label, industry: item.industry, framework: item.framework, difficulty: item.difficulty,
        score: Math.min(10, s.points + ai.score), rubric: null, error_types: [...new Set(missed)], time_taken_seconds: null, time_limit_seconds: null,
        user_answer: { picks: sel, fix }, feedback: { ...s, ai, revealed },
      });
      qc.invalidateQueries({ queryKey: ["attempts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Grading failed.");
    } finally {
      setBusy(false);
    }
  };

  const keyMap = new Map(item.flaws.map((f) => [f.nodeId, f.type]));
  const toD = (n: TreeNode): DNode => {
    const k = keyMap.get(n.id);
    const status = (res || revealed) && k ? (k === "overlap" ? "overlap" : k === "gap" ? "gap" : "mixed") : undefined;
    const d: DNode = { id: n.id, label: n.label, children: n.children.map(toD) };
    if (status) d.status = status;
    return d;
  };
  const selected = new Set(Object.keys(picks));

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Link to="/practice" search={{ mode: "flaw" }} className="text-sm text-muted-foreground hover:underline">← Spot the flaw</Link>
        <div className="mt-2 flex gap-2 text-xs"><span className="rounded bg-secondary px-2 py-0.5">{industryName(item.industry)}</span><span className="rounded bg-secondary px-2 py-0.5">{frameworkName(item.framework)}</span><span className="rounded bg-secondary px-2 py-0.5 nums uppercase">{item.difficulty}</span></div>
        <h1 className="mt-2 font-display text-5xl font-semibold">{item.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Click each flawed box in the diagram and pick the flaw type. For a gap, click the parent whose branches are incomplete. Then write a short fix.</p>
      </div>
      <div className="rounded-md border bg-card p-4">
        <TreeDiagram tree={toD(item.tree)} onNodeClick={toggle} selected={res ? undefined : selected} />
        {(res || revealed) && <div className="mt-3"><DiagramLegend /></div>}
      </div>
      {Object.keys(picks).length > 0 && (
        <div className="max-w-3xl space-y-2">
          {Object.keys(picks).map((id) => (
            <div key={id} className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium">{findLabel(item.tree, id)}</span>
              <select disabled={!!res} value={picks[id]} onChange={(e) => setPicks({ ...picks, [id]: e.target.value as FlawType })} className="rounded-md border bg-background px-2 py-1 text-xs">
                <option value="">Flaw type…</option>
                {FLAW_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {!res && <button onClick={() => toggle(id)} className="text-xs text-muted-foreground underline">remove</button>}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">{FLAW_TYPES.map((t) => <span key={t.id}><b className="text-foreground">{t.name}:</b> {t.hint}</span>)}</div>
      <div>
        <label htmlFor="fix" className="text-sm font-semibold">Your fix</label>
        <Textarea id="fix" disabled={!!res} value={fix} onChange={(e) => setFix(e.target.value)} rows={3} className="mt-2 bg-card" />
      </div>
      {!res && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={busy}>{busy ? "Checking…" : "Submit"}</Button>
          {!revealed ? (
            <button className="border border-destructive px-3 py-1 smallcaps text-destructive" onClick={() => { if (confirm("Reveal the answer? This attempt will be marked as revealed.")) setRevealed(true); }}>Reveal answer</button>
          ) : <span className="stamp text-sm">Revealed</span>}
        </div>
      )}
      {revealed && !res && (
        <div className="space-y-2 border border-foreground bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">The answer</h3>
          {item.flaws.map((f, i) => (
            <p key={i} className="border-t border-hairline pt-2 text-sm"><b>"{findLabel(item.tree, f.nodeId)}" — {FLAW_TYPES.find((t) => t.id === f.type)?.name}.</b> {f.explanation} <i>Fix: {f.fix}</i></p>
          ))}
          {(item.decoys ?? []).length > 0 && (
            <p className="border-t border-hairline pt-2 text-sm text-muted-foreground">
              <b className="text-foreground">Not flaws:</b> {(item.decoys ?? []).map((d) => `"${findLabel(item.tree, d.nodeId)}" — ${d.why}`).join(" ")}
            </p>
          )}
        </div>
      )}
      {(res || revealed) && item.correctedTree && (
        <div className="border border-foreground bg-card p-4">
          <h3 className="mb-2 smallcaps text-sm text-success">The corrected tree</h3>
          <TreeDiagram tree={item.correctedTree} />
        </div>
      )}
      {!res ? null : (
        <div className="space-y-3 rounded-md border bg-card p-5">
          <ScoreBadge score={Math.min(10, res.points + res.ai.score)} />
          <p className="text-sm"><b>Identification:</b> {res.points}/8 (node 5, flaw type 3, −1.5 for every node you flagged that was not flawed)</p>
          <div className="space-y-2">
            {item.flaws.map((f, i) => (
              <div key={i} className="rounded-md bg-secondary p-3 text-sm">
                <b>"{findLabel(item.tree, f.nodeId)}" — {FLAW_TYPES.find((t) => t.id === f.type)?.name}.</b> {f.explanation} <span className="text-muted-foreground">Fix: {f.fix}</span>
              </div>
            ))}
          </div>
          {res.decoyFlags.length > 0 && (
            <div className="space-y-2">
              <p className="smallcaps text-destructive">You flagged {res.decoyFlags.length} node{res.decoyFlags.length > 1 ? "s" : ""} that {res.decoyFlags.length > 1 ? "were" : "was"} fine</p>
              {res.decoyFlags.map((d) => (
                <p key={d.nodeId} className="rounded-md border border-destructive bg-destructive/5 p-3 text-sm">
                  <b>"{findLabel(item.tree, d.nodeId)}"</b> — {d.why}
                </p>
              ))}
            </div>
          )}
          <p className="text-sm"><b>Your fix:</b> {res.ai.score}/2. {res.ai.feedback}</p>
          <Button asChild><Link to="/practice" search={{ mode: "flaw" }}>Next item</Link></Button>
        </div>
      )}
    </div>
  );
}

function findLabel(n: TreeNode, id: string): string {
  if (n.id === id) return n.label;
  for (const c of n.children) {
    const r = findLabel(c, id);
    if (r) return r;
  }
  return "";
}

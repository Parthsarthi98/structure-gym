import { useEffect, useState } from "react";
import { RUBRIC } from "@/data/taxonomy";
import type { TreeGrade, SimpleNode } from "@/lib/grading.functions";
import type { DNode } from "@/data/types";
import { TreeDiagram, DiagramLegend } from "./TreeDiagram";

export function ScoreBadge({ score, max = 10 }: { score: number; max?: number }) {
  const pct = score / max;
  const tone = pct >= 0.7 ? "bg-success text-primary-foreground" : pct >= 0.5 ? "bg-warning text-accent-foreground" : "bg-destructive text-destructive-foreground";
  return <span className={`inline-flex items-baseline gap-0.5 rounded-md px-2.5 py-1 nums text-lg font-semibold ${tone}`}>{Math.round(score * 10) / 10}<span className="text-xs opacity-80">/{max}</span></span>;
}

export function ScoreRing({ score, max = 10, size = 96 }: { score: number; max?: number; size?: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  const color = pct >= 0.7 ? "var(--olive)" : pct >= 0.5 ? "var(--mustard)" : "var(--red)";
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(pct), 60); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--hairline)" strokeWidth={8} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={8} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset 1.1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="nums text-2xl font-semibold">{Math.round(score * 10) / 10}</span>
        <span className="text-[10px] text-muted-foreground">out of {max}</span>
      </div>
    </div>
  );
}

export const treeTotal = (g: TreeGrade) => Object.values(g.rubric).reduce((a, b) => a + b, 0);

export function RubricKey() {
  return (
    <div className="rounded-md border bg-card p-4 text-sm">
      <div className="mb-2 font-semibold">How you're scored (out of 10)</div>
      <ul className="space-y-1 text-muted-foreground">
        {RUBRIC.map((r) => (
          <li key={r.key}><span className="text-foreground">{r.name}</span> (0–2): {r.hint}</li>
        ))}
      </ul>
    </div>
  );
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Overlay grader annotations onto the user's tree: statuses by label, ghost boxes for gaps. */
export function annotateTree(tree: SimpleNode, g: TreeGrade): DNode {
  const ann = new Map((g.annotations ?? []).map((a) => [norm(a.label), a.status]));
  const missing = g.missing ?? [];
  const placedMissing = new Set<number>();
  const walk = (n: SimpleNode, depth: number): DNode => {
    const st = ann.get(norm(n.label));
    const status = st === "overlap" ? "overlap" : st === "mixed" || st === "not-a-driver" ? "mixed" : st === "good" ? "good" : undefined;
    const ghosts: DNode[] = [];
    missing.forEach((m, i) => {
      if (!placedMissing.has(i) && norm(m.parentLabel) === norm(n.label)) {
        placedMissing.add(i);
        ghosts.push({ label: m.label, status: "missing" });
      }
    });
    const out: DNode = { label: n.label, children: [...n.children.map((c) => walk(c, depth + 1)), ...ghosts] };
    if (status) out.status = status;
    return out;
  };
  const root = walk(tree, 0);
  missing.forEach((m, i) => {
    if (!placedMissing.has(i)) root.children = [...(root.children ?? []), { label: m.label, status: "missing" }];
  });
  return root;
}

export function RubricBars({ rubric }: { rubric: Record<string, number> }) {
  return (
    <div className="flex-1 space-y-2">
      {RUBRIC.map((r) => {
        const v = rubric[r.key] ?? 0;
        return (
          <div key={r.key} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-2 text-sm">
            <span className="truncate">{r.name}</span>
            <div className="flex gap-1">
              {[0, 1].map((i) => (
                <div key={i} className="h-3 flex-1 border border-foreground bg-card"><div className={`grow-in h-full ${i < v ? (v === 2 ? "bg-success" : "bg-warning") : ""}`} style={{ width: i < v ? "100%" : 0, animationDelay: `${i * 0.2}s` }} /></div>
              ))}
            </div>
            <span className="nums text-xs">{v}/2</span>
          </div>
        );
      })}
    </div>
  );
}

export function TreeGradeView({ grade, userTree, hintsUsed }: { grade: TreeGrade; userTree?: SimpleNode | undefined; hintsUsed?: number | undefined }) {
  const raw = treeTotal(grade);
  const penalty = hintsUsed ? hintsUsed * 0.5 : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={Math.max(0, raw - penalty)} />
        <RubricBars rubric={grade.rubric} />
      </div>
      <p className="text-sm">{grade.summary}{penalty ? ` (Rubric ${raw}/10, minus ${penalty} for ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"}.)` : ""}</p>
      <div className="grid gap-2">
        {RUBRIC.map((r) => (
          <div key={r.key} className="grid grid-cols-[8.5rem_1fr] gap-2 text-sm sm:grid-cols-[11rem_1fr]">
            <span className="font-medium">{r.name}</span>
            <span className="text-muted-foreground">{grade.rubricNotes[r.key]}</span>
          </div>
        ))}
      </div>
      {userTree && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">Your tree, marked up</h4><DiagramLegend /></div>
          <div className="rounded-md border bg-background p-3"><TreeDiagram tree={annotateTree(userTree, grade)} /></div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <List title="Overlaps" items={grade.overlaps} empty="None found." />
        <List title="Gaps" items={grade.gaps} empty="None found." />
      </div>
      <List title="Fixes" items={grade.fixes} empty="" />
      <div>
        <h4 className="mb-2 text-sm font-semibold">Model answer</h4>
        <div className="border border-foreground bg-background p-3"><TreeDiagram tree={grade.modelTree as DNode} animate /></div>
      </div>
    </div>
  );
}

function List({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      {items.length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

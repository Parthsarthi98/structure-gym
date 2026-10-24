import { useState } from "react";
import { Lightbulb, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TreeDiagram } from "./TreeDiagram";
import { FRAMEWORK_EXTRAS } from "@/data/framework-extras";
import { industryName } from "@/data/taxonomy";
import type { CaseItem } from "@/data/cases";

export function HintsPanel({ caseItem, used, onUse, disabled }: { caseItem: CaseItem; used: number; onUse: (n: number) => void; disabled?: boolean }) {
  const g = caseItem.answer?.hints;
  const list: string[] = caseItem.hintList ?? (g ? [g.splitType, `First-level branches: ${g.l1.join("; ")}.`, ""] : []);
  if (!list.length) return null;
  return (
    <div className="rounded-md border bg-card p-4 text-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-warning" /> Hints <span className="ml-auto text-xs font-normal text-muted-foreground">−0.5 each</span></div>
      <div className="space-y-3">
        {list.slice(0, used).map((h, i) => (
          <div key={i}>
            <div className="text-xs smallcaps text-muted-foreground">Hint {i + 1}</div>
            {i === 2 && !caseItem.hintList && g ? <TreeDiagram tree={g.fullBranch} vertical /> : <p>{h}</p>}
          </div>
        ))}
        {used < list.length && (
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onUse(used + 1)}>Show hint {used + 1} of {list.length}</Button>
        )}
      </div>
    </div>
  );
}

/** Clarifying facts are hidden until the candidate asks, as in a real interview. */
export function AskInterviewer({ facts }: { facts: string[] }) {
  const [shown, setShown] = useState(0);
  if (!facts.length) return null;
  const split = (f: string) => {
    const m = f.match(/^Q:\s*(.*?)\s*A:\s*(.*)$/s);
    return m ? { q: m[1]!, a: m[2]! } : { q: f, a: "" };
  };
  return (
    <section className="max-w-3xl border border-foreground bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="smallcaps text-sm">Facts on request</h3>
        {shown < facts.length && (
          <Button size="sm" variant="outline" onClick={() => setShown(shown + 1)}>Ask the interviewer{shown ? " another question" : ""}</Button>
        )}
      </div>
      {shown === 0 ? (
        <p className="mt-1 text-sm italic text-muted-foreground">Clarify before you structure. {facts.length} answers are available.</p>
      ) : (
        <dl className="mt-2 divide-y divide-hairline">
          {facts.slice(0, shown).map((f, i) => {
            const { q, a } = split(f);
            return (
              <div key={i} className="grow-in py-2">
                <dt className="font-semibold">{q}</dt>
                {a && <dd className="italic">{a}</dd>}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

export function SimilarExample({ caseItem }: { caseItem: CaseItem }) {
  const extra = FRAMEWORK_EXTRAS.find((f) => f.id === caseItem.framework);
  const pool = extra?.examples ?? [];
  const ex = pool.find((e) => e.industry !== caseItem.industry) ?? pool[0];
  const [open, setOpen] = useState(false);
  if (!ex) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full"><BookOpen /> Show a similar worked example</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{ex.title}</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">{industryName(ex.industry)} · {ex.region}</p>
        <p className="text-sm italic">{ex.prompt}</p>
        <div className="rounded-md border bg-background p-3"><TreeDiagram tree={ex.tree} /></div>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div><h4 className="mb-1 font-semibold">Test these first</h4><ul className="list-disc pl-5">{ex.hypotheses.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h4 className="mb-1 font-semibold">Numbers to know</h4><ul className="space-y-1">{ex.keyNumbers.map((k) => <li key={k.name}><b>{k.name}</b>: <span className="nums text-xs">{k.formula}</span></li>)}</ul></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

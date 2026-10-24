import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { StepReveal } from "./TreeDiagram";
import { revealAnswer, type ModelAnswer } from "@/lib/grading.functions";
import { frameworkName, industryName } from "@/data/taxonomy";
import type { CaseItem } from "@/data/cases";
import type { DNode } from "@/data/types";

/** Full model answer for a case: from the case itself if stored, otherwise written by the AI coach on demand. */
export function useCaseAnswer(c: CaseItem, enabled: boolean) {
  const fn = useServerFn(revealAnswer);
  return useQuery({
    queryKey: ["answer", c.id],
    enabled: enabled && !c.answer,
    staleTime: Infinity,
    queryFn: async (): Promise<ModelAnswer> => {
      return fn({ data: { prompt: c.prompt, industry: industryName(c.industry), framework: [c.framework, ...c.secondary].map(frameworkName).join(" + ") } });
    },
  });
}

export function AnswerBody({ a, mistakes }: { a: { modelTree: DNode; explanation: string; hypotheses: string[]; keyMetrics: { name: string; formula: string }[] }; mistakes?: string[] | undefined }) {
  return (
    <div className="space-y-5">
      <StepReveal tree={a.modelTree} title="Model answer" />
      <div className="grid gap-6 border-t border-hairline pt-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="smallcaps text-sm">Why this structure</div>
          <p className="mt-1 leading-relaxed">{a.explanation}</p>
        </div>
        <div>
          <div className="smallcaps text-sm">Test these first</div>
          <ol className="mt-1 list-decimal space-y-1 pl-5">{a.hypotheses.map((h) => <li key={h}>{h}</li>)}</ol>
        </div>
        <div>
          <div className="smallcaps text-sm">Numbers to know</div>
          <ul className="mt-1 space-y-1">{a.keyMetrics.map((k) => <li key={k.name}><b>{k.name}</b> <span className="nums italic">= {k.formula}</span></li>)}</ul>
        </div>
      </div>
      {mistakes && mistakes.length > 0 && (
        <div className="border-t border-hairline pt-4">
          <div className="smallcaps text-sm text-destructive">Common mistakes on this case</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">{mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export function AnswerPanel({ c, open, onReveal, submitted }: { c: CaseItem; open?: boolean | undefined; onReveal?: (() => void) | undefined; submitted?: boolean | undefined }) {
  const [shown, setShown] = useState(false);
  const visible = shown || !!open;
  const q = useCaseAnswer(c, visible);
  const a = c.answer ?? q.data;
  return (
    <section className="border border-foreground bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-2xl font-semibold">The answer</h3>
        {!visible && (
          <button
            className="border border-destructive px-3 py-1 smallcaps text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => {
              if (!submitted && !confirm("Reveal the full answer? This attempt will be marked as revealed.")) return;
              setShown(true);
              onReveal?.();
            }}
          >
            Reveal answer
          </button>
        )}
      </div>
      {!visible && <p className="mt-1 text-sm italic text-muted-foreground">Have a go first. Revealing marks this attempt as revealed.</p>}
      {visible && (
        <div className="mt-4">
          {a ? <AnswerBody a={a} mistakes={c.commonMistakes} /> : q.isError ? <p className="text-destructive">Could not load the answer. {q.error instanceof Error ? q.error.message : ""}</p> : <p className="italic text-muted-foreground">Writing the model answer… (about 15 seconds)</p>}
        </div>
      )}
    </section>
  );
}

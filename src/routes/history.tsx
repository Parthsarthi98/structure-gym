import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { attemptsQuery } from "@/lib/attempts";
import { frameworkName, industryName, modeName } from "@/data/taxonomy";
import { ScoreBadge, TreeGradeView } from "@/components/GradeResult";
import type { TreeGrade, SimpleNode } from "@/lib/grading.functions";

export const Route = createFileRoute("/history")({
  ssr: false,
  loader: ({ context }) => context.queryClient.ensureQueryData(attemptsQuery),
  head: () => ({ meta: [{ title: "History — Structure Gym" }, { name: "description", content: "All your past attempts." }, { property: "og:title", content: "History — Structure Gym" }, { property: "og:description", content: "All your past attempts." }] }),
  component: History,
});

function History() {
  const { data } = useSuspenseQuery(attemptsQuery);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <h1 className="font-display text-4xl">History</h1>
      {!data.length && <p className="mt-4 text-sm text-muted-foreground">No attempts yet.</p>}
      <div className="mt-6 divide-y rounded-md border bg-card">
        {data.map((a) => (
          <div key={a.id}>
            <button onClick={() => setOpen(open === a.id ? null : a.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-secondary">
              <span className="w-24 nums text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-GB")}</span>
              <span className="min-w-[12rem] flex-1 font-medium">{a.case_title}</span>
              <span className="text-xs text-muted-foreground">{modeName(a.mode)}</span>
              <span className="text-xs text-muted-foreground">{industryName(a.industry)} · {frameworkName(a.framework)}</span>
              <span className="text-sm"><ScoreBadge score={Number(a.score)} /></span>
            </button>
            {open === a.id && (
              <div className="space-y-4 border-t bg-background px-4 py-4">
                {a.case_prompt && <p className="text-sm italic">{a.case_prompt}</p>}
                {(a.mode === "build" || a.mode === "timed") && a.feedback ? (
                  <>
                    <TreeGradeView grade={a.feedback as TreeGrade} userTree={a.user_answer as SimpleNode} hintsUsed={a.hints_used ?? 0} />
                  </>
                ) : (
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{summarise(a.feedback)}</pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function summarise(f: unknown) {
  const x = f as { feedback?: string; ai?: { feedback?: string }; modelAnswer?: string } | null;
  return [x?.feedback, x?.ai?.feedback, x?.modelAnswer && `Model answer: ${x.modelAnswer}`].filter(Boolean).join("\n");
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { attemptsQuery } from "@/lib/attempts";
import { reviewQueue, weakestCriterion } from "@/lib/stats";
import { RUBRIC, frameworkName, industryName, modeName } from "@/data/taxonomy";
import { ScoreBadge } from "@/components/GradeResult";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/review")({
  ssr: false,
  loader: ({ context }) => context.queryClient.ensureQueryData(attemptsQuery),
  head: () => ({ meta: [{ title: "Review mistakes — Structure Gym" }, { name: "description", content: "Retry cases you scored below 6 until you reach 7+." }, { property: "og:title", content: "Review mistakes — Structure Gym" }, { property: "og:description", content: "Retry weak cases until you master them." }] }),
  component: Review,
});

function Review() {
  const { data } = useSuspenseQuery(attemptsQuery);
  const queue = reviewQueue(data);
  const weak = weakestCriterion(data);
  const weakName = RUBRIC.find((r) => r.key === weak)?.name;
  const link = (a: (typeof queue)[number]) =>
    a.mode === "chain" ? { to: "/value-chains/$id" as const, params: { id: a.industry } } :
    a.mode === "flaw" ? { to: "/flaw/$flawId" as const, params: { flawId: a.case_id } } : { to: "/drill/$mode/$caseId" as const, params: { mode: a.mode === "timed" ? "build" : a.mode, caseId: a.case_id } };
  return (
    <div>
      <h1 className="font-display text-4xl">Review mistakes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cases you scored below 6. They stay here until you score 7 or more.{weakName && <> Ordered by your weakest criterion: <b className="text-foreground">{weakName}</b>.</>}</p>
      {!queue.length ? (
        <p className="mt-6 rounded-md border bg-card p-4 text-sm">Nothing to review. <Link to="/practice" className="text-primary underline">Practise more cases</Link>.</p>
      ) : (
        <div className="mt-6 divide-y rounded-md border bg-card">
          {queue.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <ScoreBadge score={Number(a.score)} />
              <div className="min-w-[12rem] flex-1">
                <div className="font-medium">{a.case_title}</div>
                <div className="text-xs text-muted-foreground">{modeName(a.mode)} · {industryName(a.industry)} · {frameworkName(a.framework)}{weak && a.rubric?.[weak] !== undefined ? ` · ${weakName} ${a.rubric[weak]}/2` : ""}</div>
              </div>
              <Button size="sm" asChild><Link {...link(a)}>Retry</Link></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

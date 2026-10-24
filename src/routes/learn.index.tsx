import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { progressQuery } from "@/lib/lessons";
import { Progress } from "@/components/ui/progress";
import { useSessionEmail, Opener, issueNo } from "@/components/AppHeader";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn case structuring — Structure Gym" },
      { name: "description", content: "A six-lesson visual course on case interviews, MECE thinking and issue trees for complete beginners." },
      { property: "og:title", content: "Learn case structuring — Structure Gym" },
      { property: "og:description", content: "Six visual lessons: case flow, MECE, splits, issue trees, common mistakes, tailoring." },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const email = useSessionEmail();
  const { data: progress = [] } = useQuery({ ...progressQuery, enabled: email !== undefined });
  const done = new Set(progress.map((p) => p.lesson_id));
  return (
    <div className="space-y-6">
      <Opener no="I" kicker="The course" title="Learn to structure" standfirst="Start here if you're new to case interviews. Six short lessons, each with diagrams, worked examples and a three-question check." />
      <div className="max-w-md">
        <div className="mb-1 flex justify-between text-sm"><span>Progress</span><span className="nums">{done.size}/{LESSONS.length}</span></div>
        <Progress value={(done.size / LESSONS.length) * 100} />
        {!email && <p className="mt-2 text-xs text-muted-foreground">Progress is saved in this browser. <Link to="/auth" className="underline">Sign in</Link> to sync it across devices.</p>}
      </div>
      <ol className="grid gap-x-10 md:grid-cols-2">
        {LESSONS.map((l) => (
          <li key={l.id} className="border-t border-foreground py-4">
            <Link to="/learn/$lessonId" params={{ lessonId: l.id }} className="group grid grid-cols-[auto_1fr] gap-4">
              <span className="nums font-display text-6xl font-bold leading-none text-destructive">{String(l.number).padStart(2, "0")}</span>
              <span>
                <span className="flex items-center gap-2 text-xs smallcaps text-muted-foreground">{issueNo(l.number)} · {l.minutes} min {done.has(l.id) ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}</span>
                <span className="block font-display text-2xl font-semibold leading-tight group-hover:text-destructive">{l.title}</span>
                <span className="mt-1 block italic text-muted-foreground">{l.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

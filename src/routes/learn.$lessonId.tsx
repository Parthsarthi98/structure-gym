import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LESSONS } from "@/data/lessons";
import { SectionBlock, Quiz } from "@/components/LessonBlocks";
import { markLessonComplete } from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { Opener, issueNo } from "@/components/AppHeader";

export const Route = createFileRoute("/learn/$lessonId")({
  loader: ({ params }) => {
    const l = LESSONS.find((x) => x.id === params.lessonId);
    if (!l) throw notFound();
    return l;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData ? `Lesson ${loaderData.number}: ${loaderData.title}` : "Lesson"} — Structure Gym` },
      { name: "description", content: loaderData?.summary ?? "Case interview lesson." },
      { property: "og:title", content: `${loaderData?.title ?? "Lesson"} — Structure Gym` },
      { property: "og:description", content: loaderData?.summary ?? "Case interview lesson." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const l = Route.useLoaderData();
  const qc = useQueryClient();
  const next = LESSONS.find((x) => x.number === l.number + 1);
  const onDone = async (score: number) => {
    try {
      const saved = await markLessonComplete(l.id, score);
      if (saved) qc.invalidateQueries({ queryKey: ["lesson_progress"] });
      else toast("Progress saved in this browser.");
    } catch {
      toast.error("Couldn't save progress.");
    }
  };
  return (
    <article className="space-y-8">
      <div>
        <Link to="/learn" className="text-sm text-muted-foreground hover:underline">← All lessons</Link>
        <div className="mt-3"><Opener no={l.number} kicker={`${issueNo(l.number)} · Lesson ${l.number} of ${LESSONS.length} · ${l.minutes} min read`} title={l.title} /></div>
        <p className="dropcap max-w-3xl text-xl leading-relaxed">{l.summary}</p>
      </div>
      {l.sections.find((s) => s.kind === "tip") && <p className="pullquote mx-auto max-w-3xl">{(l.sections.find((s) => s.kind === "tip") as { body: string }).body}</p>}
      {l.sections.map((s, i) => <SectionBlock key={i} s={s} />)}
      <Quiz key={l.id} questions={l.quiz} onDone={onDone} />
      <div className="flex justify-between">
        <Button variant="outline" asChild><Link to="/learn">All lessons</Link></Button>
        {next ? <Button asChild><Link to="/learn/$lessonId" params={{ lessonId: next.id }}>Next: {next.title}</Link></Button> : <Button asChild><Link to="/practice">Start practising</Link></Button>}
      </div>
    </article>
  );
}

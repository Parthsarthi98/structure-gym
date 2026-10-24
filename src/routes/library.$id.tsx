import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { XCircle, CheckCircle2, Quote } from "lucide-react";
import { getFramework } from "@/data/frameworks";
import { getExtra } from "@/data/framework-extras";
import { industryName } from "@/data/taxonomy";
import { TreeDiagram, DiagramLegend, StepReveal } from "@/components/TreeDiagram";
import { Opener, issueNo } from "@/components/AppHeader";
import { FRAMEWORKS } from "@/data/frameworks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/library/$id")({
  loader: ({ params }) => {
    const f = getFramework(params.id);
    const x = getExtra(params.id);
    if (!f || !x) throw notFound();
    return { f, x };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.f.name ?? "Framework"} framework — Structure Gym` },
      { name: "description", content: loaderData?.f.summary ?? "Consulting framework reference." },
      { property: "og:title", content: `${loaderData?.f.name ?? "Framework"} framework — Structure Gym` },
      { property: "og:description", content: loaderData?.f.summary ?? "Consulting framework reference." },
    ],
  }),
  component: FrameworkPage,
});

function FrameworkPage() {
  const { f, x } = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <div>
        <Link to="/library" className="text-sm text-muted-foreground hover:underline">← Framework library</Link>
        <div className="mt-3"><Opener no={FRAMEWORKS.findIndex((y) => y.id === f.id) + 1} kicker={`${issueNo(FRAMEWORKS.findIndex((y) => y.id === f.id) + 1)} · Framework`} title={f.name} standfirst={f.whenToUse[0]} /></div>
        <p className="dropcap max-w-3xl text-xl leading-relaxed">{f.summary} {f.whenToUse.slice(1).join(". ")}{f.whenToUse.length > 1 ? "." : ""}</p>
      </div>
      <p className="pullquote mx-auto max-w-3xl">“{x.triggers[0]}”<span className="mt-2 block text-sm not-italic smallcaps">— the phrase that should make you reach for this</span></p>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="min-w-0 rounded-md border bg-card p-5">
          <h2 className="mb-3 font-semibold">Standard tree</h2>
          <TreeDiagram tree={x.fullTree} />
        </section>
        <aside className="space-y-4">
          <section className="rounded-md border-l-4 border-accent bg-card p-4">
            <h2 className="mb-2 font-semibold">When to use it</h2>
            <p className="mb-2 text-xs text-muted-foreground">If the prompt says…</p>
            <ul className="space-y-1.5 text-sm">{x.triggers.map((t) => <li key={t} className="flex gap-1.5"><Quote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />{t}</li>)}</ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{f.whenToUse.map((w) => <li key={w}>{w}</li>)}</ul>
          </section>
          <section className="rounded-md border bg-card p-4 text-sm">
            <h2 className="mb-2 font-semibold">Common mistakes</h2>
            <ul className="list-disc space-y-1 pl-5">{f.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
          </section>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="border-b-[3px] border-double border-foreground pb-1 font-display text-4xl font-semibold">Worked examples</h2>
        {x.examples.map((e, i) => (
          <div key={i} className="rounded-md border bg-card p-5">
            <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-secondary px-2 py-0.5">{industryName(e.industry)}</span><span className="rounded bg-secondary px-2 py-0.5">{e.region}</span></div>
            <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
            <p className="mt-2 border-l-4 border-primary pl-3 text-sm italic">{e.prompt}</p>
            <div className="mt-4 border-t border-hairline pt-3"><StepReveal tree={e.tree} title="Walk through it" /><p className="mt-2 text-xs italic text-muted-foreground">Shaded boxes are the likely drivers.</p></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><h4 className="mb-1 text-sm font-semibold">Hypotheses to test first</h4><ol className="list-decimal space-y-1 pl-5 text-sm">{e.hypotheses.map((h) => <li key={h}>{h}</li>)}</ol></div>
              <div><h4 className="mb-1 text-sm font-semibold">Numbers and formulas</h4><ul className="space-y-1.5 text-sm">{e.keyNumbers.map((k) => <li key={k.name}><b>{k.name}</b> <span className="nums ml-1 italic">= {k.formula}</span>{k.note && <span className="block text-xs text-muted-foreground">{k.note}</span>}</li>)}</ul></div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-md border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-3xl">Mistake and fix</h2><DiagramLegend /></div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 rounded-md border bg-background p-3"><div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-destructive"><XCircle className="h-4 w-4" />Weak</div><TreeDiagram tree={x.mistake.bad} /></div>
          <div className="min-w-0 rounded-md border bg-background p-3"><div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />Fixed</div><TreeDiagram tree={x.mistake.fixed} /></div>
        </div>
        <p className="mt-3 text-sm">{x.mistake.explanation}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild><Link to="/practice" search={{ framework: f.id }}>Practise {f.name} cases</Link></Button>
        <Button variant="outline" asChild><Link to="/library/industries">Industry cheat sheets</Link></Button>
      </div>
    </div>
  );
}

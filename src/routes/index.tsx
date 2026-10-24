import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CASES } from "@/data/cases";
import { industryName, frameworkName } from "@/data/taxonomy";
import { PullQuote } from "@/components/AppHeader";
import { TreeDiagram } from "@/components/TreeDiagram";
import type { DNode } from "@/data/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Structure Gym — the case interview issue" },
      { name: "description", content: "A daily structuring drill for consulting interviews: MECE issue trees, frameworks and value chains, graded and explained." },
      { property: "og:title", content: "Structure Gym — the case interview issue" },
      { property: "og:description", content: "Structure the problem. Leave no gaps. Daily case drills with a coach that names every overlap." },
    ],
  }),
  component: Home,
});

const CONTENTS = [
  { to: "/learn", t: "Learn", d: "Six lessons from zero: the case flow, MECE, ways to split, issue trees, mistakes, tailoring." },
  { to: "/practice", t: "Practice", d: "Build a tree, spot the flaw, or pick the framework." },
  { to: "/quick", t: "Quick checks", d: "Which split is MECE? Fast cards and a streak to keep." },
  { to: "/library", t: "Frameworks", d: "Twelve starting points, each walked through step by step." },
  { to: "/value-chains", t: "Value chains", d: "Follow the money, stage by stage, and trace a symptom to its cause." },
  { to: "/dashboard", t: "The ledger", d: "Your scores, your weakest criterion, and your next drill." },
] as const;

const FIG: DNode = {
  label: "Why have profits fallen?",
  children: [
    { label: "Revenue", children: [{ label: "Price per unit" }, { label: "Units sold" }] },
    { label: "Costs", children: [{ label: "Fixed" }, { label: "Variable" }] },
  ],
};

function useToday() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const day = Math.floor(Date.now() / 86400000);
    setI(day % CASES.length);
  }, []);
  return { c: CASES[i] ?? CASES[0] };
}

function Home() {
  const { c } = useToday();
  if (!c) return null;
  return (
    <div>
      <section className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <div className="kicker text-[16px]">Cover story</div>
          <h1 className="headline mt-2 font-display">Structure the problem.<br /><i className="font-medium text-destructive">Leave no gaps.</i></h1>
          <p className="mt-5 max-w-[50ch] text-[clamp(21px,2vw,26px)] italic leading-snug text-muted-foreground">Practise a case at your own pace, graded on five plain criteria.</p>
          <p className="dropcap measure mt-6">Every case interview opens the same way: a messy question to break into pieces that do not overlap and leave nothing out. That skill can be drilled. Start with the first lesson if you are new; otherwise, take today's case.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><Link to="/drill/$mode/$caseId" params={{ mode: "build", caseId: c.id }}>Begin today's drill</Link></Button>
            <Button variant="outline" asChild><Link to="/learn/$lessonId" params={{ lessonId: "l2" }}>Start with MECE, lesson one</Link></Button>
          </div>
        </div>
        <figure className="relative">
          <div aria-hidden className="halftone absolute -right-4 -top-6 h-56 w-56 opacity-30" style={{ borderRadius: "50%", clipPath: "circle(50%)" }} />
          <div aria-hidden className="halftone absolute -bottom-8 left-6 h-40 w-40 opacity-20" style={{ clipPath: "circle(50%)" }} />
          <div className="relative border-[1.5px] border-foreground bg-card p-4">
            <div className="mb-2 text-[15px] smallcaps">Fig. 1 · Profitability</div>
            <TreeDiagram tree={FIG} bare className="border-0 p-0" />
          </div>
          <figcaption className="mt-3 text-[17px] italic text-muted-foreground">Fig. 1 — One question, two drivers, four parts. Every rupee of lost profit sits in exactly one box.</figcaption>
        </figure>
      </section>

      <section className="ink-band -mx-5 mt-16 px-5 py-12 sm:mx-0 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[15px] smallcaps text-red-on-ink">Today's drill · {industryName(c.industry)} · {frameworkName(c.framework)} · {c.difficulty}</div>
            <h2 className="mt-2 font-display text-[clamp(36px,4.4vw,62px)] font-semibold leading-[0.98]">{c.title}</h2>
            <p className="mt-4 max-w-[60ch] text-xl italic opacity-90">{c.prompt}</p>
          </div>
          <div className="text-center">
            <Button className="mt-4" asChild><Link to="/drill/$mode/$caseId" params={{ mode: "build", caseId: c.id }}>Begin the drill</Link></Button>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="border-t-[3px] border-foreground" /><div className="border-t border-foreground" style={{ marginTop: 3 }} />
        <h2 className="mt-3 text-[17px] smallcaps">Contents</h2>
        <ol>
          {CONTENTS.map((x, i) => (
            <li key={x.to} className="border-b border-foreground">
              <Link to={x.to} className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 py-4 sm:grid-cols-[5rem_16rem_1fr]">
                <span className="nums font-display text-[48px] font-semibold leading-none text-destructive">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[28px] font-bold leading-tight group-hover:text-destructive">{x.t}</span>
                <span className="col-start-2 italic text-muted-foreground sm:col-start-3">{x.d}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <PullQuote>If one rupee can sit in two branches, your tree overlaps. If a rupee can slip past every branch, it has a gap.</PullQuote>

    </div>
  );
}

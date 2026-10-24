import { useState, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { LessonSection, QuizQuestion } from "@/data/types";
import { TreeDiagram, DiagramLegend } from "./TreeDiagram";
import { Button } from "@/components/ui/button";

function H({ children }: { children?: string | undefined }) {
  return children ? <h2 className="mb-3 font-display text-2xl">{children}</h2> : null;
}

const Card = ({ children }: { children: ReactNode }) => <section className="rounded-md border bg-card p-5">{children}</section>;

export function Venn({ a, b, overlap }: { a: string; b: string; overlap: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full max-w-sm">
      <circle cx="120" cy="90" r="70" fill="var(--branch-2)" fillOpacity="0.25" stroke="var(--branch-2)" />
      <circle cx="200" cy="90" r="70" fill="var(--branch-3)" fillOpacity="0.25" stroke="var(--branch-3)" />
      <path d="M160 32 A70 70 0 0 1 160 148 A70 70 0 0 1 160 32" fill="var(--destructive)" fillOpacity="0.35" />
      <text x="90" y="94" textAnchor="middle" fontSize="12" fill="var(--foreground)">{a}</text>
      <text x="230" y="94" textAnchor="middle" fontSize="12" fill="var(--foreground)">{b}</text>
      <text x="160" y="190" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--destructive)">{overlap}</text>
    </svg>
  );
}

export function Pie({ slices, missing }: { slices: string[]; missing: string }) {
  const all = [...slices, missing];
  const n = all.length;
  const cx = 100, cy = 100, r = 80;
  const pt = (i: number) => [cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)] as const;
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[220px]">
      {all.map((label, i) => {
        const [x1, y1] = pt(i), [x2, y2] = pt(i + 1);
        const mid = pt(i + 0.5);
        const isMissing = i === n - 1;
        return (
          <g key={i}>
            <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${n <= 2 ? 1 : 0} 1 ${x2},${y2} Z`} fill={isMissing ? "var(--background)" : `var(--branch-${(i % 6) + 1})`} fillOpacity={isMissing ? 1 : 0.55} stroke={isMissing ? "var(--destructive)" : "var(--card)"} strokeDasharray={isMissing ? "4 3" : undefined} strokeWidth={isMissing ? 2 : 1} />
            <text x={(cx + mid[0]) / 2 + (mid[0] - cx) * 0.15} y={(cy + mid[1]) / 2 + (mid[1] - cy) * 0.15} textAnchor="middle" fontSize="9" fill={isMissing ? "var(--destructive)" : "var(--foreground)"} fontWeight={isMissing ? 600 : 400}>{isMissing ? `? ${label}` : label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function SectionBlock({ s }: { s: LessonSection }) {
  switch (s.kind) {
    case "text":
      return <section><H>{s.heading}</H><p className="max-w-3xl whitespace-pre-line leading-relaxed">{s.body}</p></section>;
    case "tip":
      return <div className="flex gap-3 rounded-md border-l-4 border-accent bg-accent/15 p-4 text-sm"><Lightbulb className="h-4 w-4 shrink-0 text-warning" /><p>{s.body}</p></div>;
    case "timeline":
      return (
        <Card>
          <H>{s.heading}</H>
          <ol className="grid gap-3 md:grid-flow-col md:auto-cols-fr">
            {s.steps.map((st, i) => (
              <li key={i} className="relative rounded-md border bg-background p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary nums text-xs text-primary-foreground">{i + 1}</span>
                  <span className="font-semibold">{st.title}</span>
                  {i < s.steps.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-muted-foreground md:block" />}
                </div>
                {st.time && <div className="mt-1 nums text-[11px] text-muted-foreground">{st.time}</div>}
                <p className="mt-2 text-sm text-muted-foreground">{st.body}</p>
              </li>
            ))}
          </ol>
        </Card>
      );
    case "venn":
      return <Card><H>{s.heading}</H><div className="flex flex-col items-center gap-4 sm:flex-row"><Venn a={s.a} b={s.b} overlap={s.overlap} /><p className="text-sm"><b className="text-destructive">Not mutually exclusive.</b> {s.caption}</p></div></Card>;
    case "pie":
      return <Card><H>{s.heading}</H><div className="flex flex-col items-center gap-4 sm:flex-row"><Pie slices={s.slices} missing={s.missing} /><p className="text-sm"><b className="text-destructive">Not collectively exhaustive.</b> {s.caption}</p></div></Card>;
    case "tree":
      return <Card><H>{s.heading}</H><TreeDiagram tree={s.tree} /><p className="mt-3 text-sm text-muted-foreground">{s.caption}</p></Card>;
    case "compare":
      return (
        <Card>
          <H>{s.heading}</H>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-destructive/40 bg-background p-3"><div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-destructive"><XCircle className="h-4 w-4" />{s.bad.title}</div><TreeDiagram tree={s.bad.tree} /></div>
            <div className="rounded-md border border-success/40 bg-background p-3"><div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />{s.good.title}</div><TreeDiagram tree={s.good.tree} /></div>
          </div>
          <p className="mt-3 text-sm">{s.why}</p>
        </Card>
      );
    case "beforeAfter":
      return (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><H>{s.heading ?? s.mistake}</H><DiagramLegend /></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border bg-background p-3"><div className="mb-2 text-xs font-semibold uppercase text-destructive">Before</div><TreeDiagram tree={s.before} /></div>
            <div className="rounded-md border bg-background p-3"><div className="mb-2 text-xs font-semibold uppercase text-success">After</div><TreeDiagram tree={s.after} /></div>
          </div>
          <p className="mt-3 text-sm">{s.explanation}</p>
        </Card>
      );
    case "morph":
      return <Morph heading={s.heading} steps={s.steps} />;
    case "example":
      return (
        <Card>
          <div className="nums text-[11px] uppercase text-muted-foreground">Worked example</div>
          <h3 className="mt-1 font-semibold">{s.title}</h3>
          <p className="mt-2 border-l-4 border-primary pl-3 text-sm italic">{s.prompt}</p>
          <div className="mt-4"><TreeDiagram tree={s.tree} /></div>
          <p className="mt-3 text-sm text-muted-foreground">{s.note}</p>
        </Card>
      );
  }
}

function Morph({ heading, steps }: { heading?: string | undefined; steps: { caption: string; tree: import("@/data/types").DNode }[] }) {
  const [i, setI] = useState(0);
  const st = steps[i]!;
  return (
    <Card>
      <H>{heading}</H>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {steps.map((_, j) => (
          <button key={j} onClick={() => setI(j)} className={`rounded-full px-3 py-1 text-xs ${j === i ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Step {j + 1}</button>
        ))}
      </div>
      <p className="mb-3 text-sm">{st.caption}</p>
      <div key={i} className="animate-in fade-in duration-500"><TreeDiagram tree={st.tree} /></div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button size="sm" disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>Next step</Button>
      </div>
    </Card>
  );
}

export function Quiz({ questions, onDone }: { questions: QuizQuestion[]; onDone: (score: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const score = answers.filter((a, i) => a === questions[i]!.answer).length;
  return (
    <Card>
      <h2 className="mb-4 font-display text-2xl">Check your understanding</h2>
      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium">{qi + 1}. {q.q}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const chosen = answers[qi] === oi;
                const show = submitted || revealed.has(qi);
                const tone = show ? (oi === q.answer ? "border-success bg-success/10" : chosen ? "border-destructive bg-destructive/10" : "") : chosen ? "border-primary bg-primary/10" : "";
                return <button key={oi} disabled={submitted} onClick={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))} className={`rounded-md border bg-background p-2.5 text-left text-sm ${tone}`}>{o}</button>;
              })}
            </div>
            {!submitted && !revealed.has(qi) && <button className="mt-2 text-xs italic text-destructive underline" onClick={() => setRevealed(new Set([...revealed, qi]))}>Reveal answer</button>}
            {(submitted || revealed.has(qi)) && (
              <div className="mt-2 border-l-2 border-destructive pl-3 text-sm">
                {submitted && (answers[qi] === q.answer ? <span className="stamp mr-2 text-xs">Correct</span> : <i className="mr-2 text-destructive">Try again —</i>)}
                {revealed.has(qi) && !submitted && <span className="mr-2 text-xs smallcaps text-destructive">Revealed</span>}
                <span>{q.explanation}</span>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {q.options.map((o, oi) => oi === q.answer ? null : <li key={oi} className="italic">“{o}” — {q.wrongWhy?.[oi] || "does not match the idea above."}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      {!submitted ? (
        <Button className="mt-5" disabled={answers.some((a) => a === null)} onClick={() => { setSubmitted(true); onDone(score); }}>Check answers</Button>
      ) : (
        <p className="mt-5 font-semibold">You got {score} of {questions.length}.{score === questions.length ? " Lesson complete." : " Lesson marked complete — re-read the sections you missed."}{revealed.size ? ` (${revealed.size} revealed before answering.)` : ""}</p>
      )}
    </Card>
  );
}

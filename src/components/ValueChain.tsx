import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { BankChainDrill, BankStage, BankValueChain } from "@/data/bank";
import { shuffled } from "@/lib/practice-rules";

const COLORS = ["var(--red)", "var(--teal)", "var(--navy)", "var(--mustard)", "var(--olive)", "var(--red)", "var(--teal)"];

/** Stage cards in a row. Clicking a stage inverts it and fills the detail panel. */
export function ChainFlow({ chain }: { chain: BankValueChain }) {
  const [open, setOpen] = useState<string>(chain.stages[0]!.id);
  const idx = Math.max(0, chain.stages.findIndex((s) => s.id === open));
  const stage = chain.stages[idx]!;
  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch">
          {chain.stages.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setOpen(s.id)}
                className={`w-44 self-stretch border-[1.5px] border-foreground px-3 py-3 text-left transition-colors ${open === s.id ? "bg-foreground text-background" : "bg-card hover:bg-accent"}`}
              >
                <span className="nums block font-display text-4xl font-semibold leading-none text-destructive">{i + 1}</span>
                <span className="mt-1 block font-semibold leading-tight">{s.name}</span>
                <span className="mt-1 block text-sm italic opacity-80">{s.players.slice(0, 2).join(", ")}</span>
              </button>
              {i < chain.stages.length - 1 && (
                <svg width="30" height="20" className="shrink-0" aria-hidden><path d="M2 10 H22 M16 4 L24 10 L16 16" stroke="var(--ink)" fill="none" strokeWidth="1.5" /></svg>
              )}
            </div>
          ))}
        </div>
      </div>
      <StageDetail key={stage.id} stage={stage} color={COLORS[idx % COLORS.length]!} n={idx + 1} />
    </TooltipProvider>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="smallcaps text-sm">{title}</div>
      <ul className="mt-1 space-y-1">{items.map((d) => <li key={d} className="border-b border-hairline pb-1">{d}</li>)}</ul>
    </div>
  );
}

function StageDetail({ stage, color, n }: { stage: BankStage; color: string; n: number }) {
  return (
    <div className="grow-in mt-4 border-t-[3px] border-foreground pt-4">
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="nums font-display text-5xl font-bold leading-none" style={{ color }}>{String(n).padStart(2, "0")}</span>
        <h3 className="font-display text-3xl font-semibold">{stage.name}</h3>
        <p className="italic text-muted-foreground">{stage.players.join(" · ")}</p>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <List title="What happens" items={stage.activities} />
        <div className="space-y-4">
          <List title="Revenue drivers" items={stage.revenueDrivers} />
          <List title="Cost drivers" items={stage.costDrivers} />
        </div>
        <div>
          <div className="smallcaps text-sm">KPIs <span className="text-xs italic normal-case text-muted-foreground">(hover or tap for formula)</span></div>
          <div className="mt-1 flex flex-wrap gap-2">
            {stage.kpis.map((k) => (
              <Tooltip key={k.name}>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-help border border-foreground px-2 py-0.5 text-sm underline decoration-dotted underline-offset-2">{k.name}</span>
                </TooltipTrigger>
                <TooltipContent className="nums max-w-xs border border-foreground bg-card text-foreground">
                  <i>{k.formula}</i>
                  <div className="mt-1 text-xs">Benchmark: {k.benchmark}</div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <p className="mt-4 border-l-2 pl-2 italic" style={{ borderColor: color }}>{stage.marginNote}</p>
        </div>
      </div>
    </div>
  );
}

/** Parses "₹5,200", "-₹1.44 lakh", "≈₹12.80" into a signed number; null when not a money figure. */
export function parseMoney(v: string): number | null {
  const neg = /^\s*[-−]/.test(v);
  const m = v.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m || !/[₹$£€]/.test(v)) return null;
  return (neg ? -1 : 1) * Number(m[1]);
}

/** Animated waterfall: revenue lines in ink, costs in red stepping down, subtotals and result in teal. */
export function Waterfall({ ue }: { ue: BankValueChain["unitEconomics"] }) {
  const rows = useMemo(() => {
    let run = 0;
    return ue.lines.map((l) => {
      const v = parseMoney(l.value);
      if (v === null) return { ...l, kind: "note" as const, from: 0, to: 0 };
      // A positive line equal to the running total is a subtotal, not new revenue.
      if (v > 0 && run > 0 && Math.abs(v - run) <= Math.max(0.011 * run, 0.01)) return { ...l, kind: "sub" as const, from: 0, to: v };
      const from = run;
      run += v;
      return { ...l, kind: v >= 0 ? ("rev" as const) : ("cost" as const), from, to: run };
    });
  }, [ue]);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const iv = setInterval(() => setShown((x) => (x >= rows.length ? x : x + 1)), 260);
    return () => clearInterval(iv);
  }, [rows]);
  const max = Math.max(1, ...rows.map((r) => Math.max(r.from, r.to)));
  const min = Math.min(0, ...rows.map((r) => Math.min(r.from, r.to)));
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const fill = { rev: "var(--ink)", cost: "var(--red)", sub: "var(--teal)", note: "transparent" };
  return (
    <div>
      <p className="mb-3 text-sm smallcaps text-muted-foreground">{ue.unit}</p>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3 sm:grid-cols-[minmax(0,15rem)_1fr_6.5rem]" style={{ opacity: i < shown ? 1 : 0, transition: "opacity .3s" }}>
            <span className="text-sm leading-tight">{r.item}</span>
            <span className="relative hidden h-5 sm:block">
              {min < 0 && <span className="absolute inset-y-0 border-l border-foreground" style={{ left: `${pct(0)}%` }} />}
              {r.kind !== "note" && (
                <span
                  className="absolute inset-y-0"
                  style={{ left: `${pct(Math.min(r.from, r.to))}%`, width: i < shown ? `${Math.max(0.5, pct(Math.max(r.from, r.to)) - pct(Math.min(r.from, r.to)))}%` : 0, background: fill[r.kind], transition: "width .4s ease-out" }}
                />
              )}
            </span>
            <span className={`nums text-right ${r.kind === "cost" ? "text-destructive" : ""}`}>{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t-[3px] border-foreground pt-2 font-semibold" style={{ color: "var(--teal)" }}>{ue.result}</p>
      <p className="mt-1 text-xs italic text-muted-foreground">Approximate figures for illustration. Check any number before quoting it in an interview.</p>
    </div>
  );
}

/** "Trace a symptom": the next numbered step lights up on each click. */
export function TraceSymptom({ ex }: { ex: BankValueChain["workedExample"] }) {
  const [step, setStep] = useState(0);
  return (
    <div>
      <p className="font-display text-3xl italic leading-tight">{ex.problem}</p>
      <ol className="mt-5 space-y-3">
        {ex.trace.map((t, i) => (
          <li key={i} className={`grid grid-cols-[3rem_1fr] gap-3 transition-opacity ${i < step ? "opacity-100" : "opacity-25"}`}>
            <span className="nums font-display text-4xl font-semibold leading-none" style={{ color: i < step ? "var(--red-on-ink)" : undefined }}>{i + 1}</span>
            <span>{i < step ? t : "…"}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {step < ex.trace.length ? (
          <button className="min-h-12 border-[1.5px] border-background px-5 hover:bg-background hover:text-foreground" onClick={() => setStep(step + 1)}>Next step</button>
        ) : (
          <p className="italic"><span className="smallcaps not-italic">Lesson:</span> {ex.lesson}</p>
        )}
        {step > 0 && <button className="text-sm underline" onClick={() => setStep(0)}>Start again</button>}
      </div>
    </div>
  );
}

// ---------- Chain drills ----------

export function ChainDrillCard({ drill, stages, onResult }: { drill: BankChainDrill; stages: BankStage[]; onResult?: ((score: number) => void) | undefined }) {
  const name = (id: string) => stages.find((s) => s.id === id)?.name ?? id;
  return (
    <div className="border border-foreground bg-card p-4">
      <div className="text-xs smallcaps text-muted-foreground">{drill.type === "locate" ? "Locate the stage" : drill.type === "order" ? "Put in order" : "Assign to stages"} · {drill.difficulty}</div>
      <p className="mt-1 text-lg font-semibold leading-snug">{drill.prompt}</p>
      <div className="mt-3">
        {drill.type === "locate" && <LocateDrill drill={drill} name={name} onResult={onResult} />}
        {drill.type === "order" && <OrderDrill drill={drill} name={name} onResult={onResult} />}
        {drill.type === "assign" && <AssignDrill drill={drill} stages={stages} onResult={onResult} />}
      </div>
    </div>
  );
}

function Why({ text }: { text: string }) {
  return <p className="mt-3 border-t border-hairline pt-2 italic">{text}</p>;
}

function LocateDrill({ drill, name, onResult }: { drill: BankChainDrill; name: (id: string) => string; onResult?: ((s: number) => void) | undefined }) {
  const [pick, setPick] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answer = drill.answer?.[0];
  const done = pick !== null || revealed;
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {(drill.options ?? []).map((id) => {
          const tone = !done ? "hover:bg-foreground hover:text-background" : id === answer ? "bg-foreground text-background" : id === pick ? "border-destructive bg-red-pale" : "opacity-60";
          return (
            <button key={id} disabled={done} onClick={() => { setPick(id); onResult?.(id === answer ? 10 : 0); }} className={`min-h-12 border-[1.5px] border-foreground px-3 text-left ${tone}`}>
              {name(id)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {pick !== null && (pick === answer ? <span className="stamp text-success">Correct</span> : <i className="text-destructive">Not quite.</i>)}
        {!done && <button className="text-sm italic text-destructive underline" onClick={() => setRevealed(true)}>Reveal answer</button>}
      </div>
      {done && <Why text={drill.why} />}
    </div>
  );
}

function OrderDrill({ drill, name, onResult }: { drill: BankChainDrill; name: (id: string) => string; onResult?: ((s: number) => void) | undefined }) {
  const correct = drill.answer ?? [];
  const [order, setOrder] = useState(drill.options ?? []);
  useEffect(() => setOrder(shuffled(drill.options ?? [])), [drill]);
  const [drag, setDrag] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const right = order.every((id, i) => id === correct[i]);
  const move = (from: number, to: number) => { const o = [...order]; const [x] = o.splice(from, 1); o.splice(to, 0, x!); setOrder(o); setChecked(false); };
  return (
    <div>
      <p className="mb-2 text-sm italic text-muted-foreground">Drag into flow order, first to last. On a phone, use the arrows.</p>
      <ol className="space-y-1.5">
        {order.map((id, i) => (
          <li
            key={id}
            draggable={!revealed}
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            className={`flex min-h-11 cursor-grab items-center gap-2 border border-foreground bg-background px-2 ${checked ? (id === correct[i] ? "outline outline-2 outline-success" : "outline outline-2 outline-destructive") : ""}`}
          >
            <span className="nums w-6 text-muted-foreground">{i + 1}</span>
            <span className="flex-1">{name(id)}</span>
            <button aria-label="Move up" className="h-11 w-11 disabled:opacity-30" disabled={i === 0 || revealed} onClick={() => move(i, i - 1)}>↑</button>
            <button aria-label="Move down" className="h-11 w-11 disabled:opacity-30" disabled={i === order.length - 1 || revealed} onClick={() => move(i, i + 1)}>↓</button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!revealed && <button className="min-h-11 border-[1.5px] border-foreground bg-foreground px-4 text-background" onClick={() => { setChecked(true); onResult?.(right ? 10 : 0); }}>Check</button>}
        {!revealed && <button className="text-sm italic text-destructive underline" onClick={() => { setRevealed(true); setOrder(correct); setChecked(true); }}>Reveal answer</button>}
        {checked && !revealed && (right ? <span className="stamp text-success">Correct</span> : <i className="text-destructive">Red boxes are out of place.</i>)}
      </div>
      {(revealed || (checked && right)) && <Why text={drill.why} />}
    </div>
  );
}

function AssignDrill({ drill, stages, onResult }: { drill: BankChainDrill; stages: BankStage[]; onResult?: ((s: number) => void) | undefined }) {
  const items = drill.items ?? [];
  const [pool, setPool] = useState(items);
  useEffect(() => setPool(shuffled(items)), [drill]); // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const place = (item: string, stageId: string) => { if (!item) return; setPlaced({ ...placed, [item]: stageId }); setHeld(null); setChecked(false); };
  const left = pool.filter((it) => !placed[it.item]);
  const score = items.filter((it) => placed[it.item] === it.stage).length;
  return (
    <div>
      <p className="mb-2 text-sm italic text-muted-foreground">Drag each item onto its stage, or tap an item and then a stage.</p>
      <div className="mb-3 flex min-h-11 flex-wrap gap-2 border border-dashed border-foreground p-2">
        {left.length ? left.map((it) => (
          <button key={it.item} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", it.item)} onClick={() => setHeld(held === it.item ? null : it.item)}
            className={`min-h-10 cursor-grab border border-foreground px-2 text-sm ${held === it.item ? "bg-foreground text-background" : "bg-background"}`}>{it.item}</button>
        )) : <span className="text-sm italic text-muted-foreground">All placed.</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {stages.map((s, i) => (
          <div key={s.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => place(e.dataTransfer.getData("text/plain"), s.id)} onClick={() => held && place(held, s.id)}
            className={`min-h-20 border border-foreground bg-background p-2 ${held ? "cursor-pointer hover:bg-accent" : ""}`} style={{ borderTop: `4px solid ${COLORS[i % COLORS.length]}` }}>
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {items.filter((it) => placed[it.item] === s.id).map((it) => (
                <button key={it.item} onClick={(e) => { e.stopPropagation(); if (revealed) return; const p = { ...placed }; delete p[it.item]; setPlaced(p); }}
                  className={`border px-1.5 py-0.5 text-xs ${checked ? (it.stage === s.id ? "border-success bg-success/15" : "border-destructive bg-destructive/15") : "border-foreground"}`}>{it.item}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!revealed && <button className="min-h-11 border-[1.5px] border-foreground bg-foreground px-4 text-background disabled:opacity-40" disabled={left.length > 0} onClick={() => { setChecked(true); onResult?.(Math.floor((score / items.length) * 100) / 10); }}>Check</button>}
        {!revealed && <button className="text-sm italic text-destructive underline" onClick={() => { setRevealed(true); setPlaced(Object.fromEntries(items.map((it) => [it.item, it.stage]))); setChecked(true); }}>Reveal answer</button>}
        {checked && !revealed && (score === items.length ? <span className="stamp text-success">Correct</span> : <i className="nums text-destructive">{score} of {items.length} right. Tap a red item to send it back.</i>)}
      </div>
      {checked && <Why text={drill.why} />}
    </div>
  );
}

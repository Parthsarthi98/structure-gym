import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BANK_QUICK, type BankQuick } from "@/data/bank";
import { DIFFICULTIES, INDUSTRIES, industryName } from "@/data/taxonomy";
import { Opener } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { shuffled } from "@/lib/practice-rules";

export const Route = createFileRoute("/quick")({
  head: () => ({
    meta: [
      { title: "Quick MECE checks — Structure Gym" },
      { name: "description", content: "136 fast cards across 17 industries: pick the one split that is MECE. Instant feedback and a streak counter." },
      { property: "og:title", content: "Quick MECE checks — Structure Gym" },
      { property: "og:description", content: "Train your MECE eye, one card at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quick,
});

const LETTERS = ["A", "B", "C", "D"];

function Quick() {
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const pool = useMemo(
    () => BANK_QUICK.filter((q) => (!industry || q.industry === industry) && (!difficulty || q.difficulty === difficulty)),
    [industry, difficulty],
  );
  const [deck, setDeck] = useState<BankQuick[]>(pool);
  const [i, setI] = useState(0);
  useEffect(() => { setDeck(shuffled(pool)); setI(0); }, [pool]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [right, setRight] = useState(0);
  const card = deck[i];
  return (
    <div>
      <Opener no="QC" kicker="Warm-up" title="Quick MECE checks" standfirst="A parent and four ways to split it. Exactly one is MECE and relevant. Find it." />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select aria-label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="min-h-11 border border-foreground bg-card px-2">
          <option value="">All industries</option>
          {INDUSTRIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="min-h-11 border border-foreground bg-card px-2">
          <option value="">All levels</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="nums text-sm italic text-muted-foreground">{pool.length} cards</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_14rem]">
        {card ? (
          <Card
            key={card.id + i}
            card={card}
            n={i + 1}
            of={deck.length}
            onAnswer={(ok) => {
              if (ok) { setStreak(streak + 1); setBest(Math.max(best, streak + 1)); setRight(right + 1); } else setStreak(0);
            }}
            onNext={() => { if (i + 1 >= deck.length) { setDeck(shuffled(pool)); setI(0); } else setI(i + 1); }}
          />
        ) : <p className="italic text-muted-foreground">No cards match. Clear a filter.</p>}
        <aside className="nums border-t-[3px] border-foreground pt-3">
          <div className="smallcaps text-sm">Streak</div>
          <div className="font-display font-medium leading-none text-destructive" style={{ fontSize: "clamp(80px, 10vw, 140px)" }}>{streak}</div>
          <div className="mt-3 grid grid-cols-2 border-t border-foreground pt-2">
            <div><div className="font-display text-3xl">{best}</div><div className="text-xs smallcaps">Best</div></div>
            <div><div className="font-display text-3xl">{right}</div><div className="text-xs smallcaps">Right</div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ card, n, of, onAnswer, onNext }: { card: BankQuick; n: number; of: number; onAnswer: (ok: boolean) => void; onNext: () => void }) {
  const [options, setOptions] = useState(card.options);
  useEffect(() => setOptions(shuffled(card.options)), [card]);
  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const done = pick !== null || revealed;
  const ok = pick !== null && options[pick]!.correct;
  const parts = card.question.split(card.parent);
  return (
    <div className="grow-in min-w-0">
      <div className="nums text-sm smallcaps text-muted-foreground">Card {n} of {of} · {industryName(card.industry)} · {card.difficulty}</div>
      <h2 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {parts.length === 2 ? <>{parts[0]}<i className="text-destructive">{card.parent}</i>{parts[1]}</> : card.question}
      </h2>
      <div className="mt-5 space-y-2">
        {options.map((o, k) => {
          const chosen = pick === k;
          const tone = !done ? "bg-card hover:bg-foreground hover:text-background" : o.correct ? "bg-foreground text-background" : chosen ? "border-destructive bg-destructive/10" : "bg-card opacity-70";
          return (
            <button
              key={k}
              disabled={done}
              onClick={() => { setPick(k); onAnswer(o.correct); }}
              className={`grid w-full grid-cols-[2.5rem_1fr] gap-3 border-[1.5px] border-foreground p-3 text-left transition-colors ${tone}`}
            >
              <span className="font-display text-3xl font-semibold leading-none">{LETTERS[k]}</span>
              <span>
                <span className="block text-lg">{o.split.join(" · ")}</span>
                {done && (o.correct || chosen) && <span className="mt-1 block italic">{o.why}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {pick !== null && (ok ? <span className="stamp text-success">Correct</span> : <span className="stamp">Not quite</span>)}
        {revealed && pick === null && <span className="text-sm smallcaps text-destructive">Revealed</span>}
        {done ? (
          <Button onClick={onNext}>Next card</Button>
        ) : (
          <button className="text-sm italic text-destructive underline" onClick={() => { setRevealed(true); onAnswer(false); }}>Reveal answer</button>
        )}
      </div>
    </div>
  );
}

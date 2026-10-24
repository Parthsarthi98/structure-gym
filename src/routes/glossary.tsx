import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GLOSSARY } from "@/data/glossary";
import { FlipCard } from "@/components/FlipCard";
import { Opener } from "@/components/AppHeader";
import type { GlossaryTerm } from "@/data/types";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Case interview glossary — Structure Gym" },
      { name: "description", content: "Flip cards for case interview terms like MECE, ARPU, CAC, RevPAR and EBITDA, with formulas, examples and a shuffle drill." },
      { property: "og:title", content: "Case interview glossary — Structure Gym" },
      { property: "og:description", content: "Flip-card glossary of case interview terms and formulas, with a drill mode." },
    ],
  }),
  component: Glossary,
});

const Front = ({ g }: { g: GlossaryTerm }) => (
  <>
    <div className="text-xs smallcaps text-muted-foreground">{g.tags.join(" · ")}</div>
    <div className="flex flex-1 items-center justify-center text-center font-display text-3xl font-semibold leading-tight">{g.term}</div>
    <div className="text-center text-xs italic text-muted-foreground">Tap to turn over</div>
  </>
);
const Back = ({ g }: { g: GlossaryTerm }) => (
  <>
    <div className="font-semibold">{g.term}</div>
    <p className="mt-1 text-sm leading-snug">{g.meaning}</p>
    {g.formula && <p className="nums mt-2 border-y border-hairline py-1 text-sm italic">{g.formula}</p>}
    <p className="mt-2 text-sm text-muted-foreground"><span className="smallcaps text-foreground">e.g.</span> {g.example}</p>
  </>
);

function Glossary() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [drill, setDrill] = useState<GlossaryTerm[] | null>(null);
  const tags = useMemo(() => [...new Set(GLOSSARY.flatMap((g) => g.tags))].sort(), []);
  const s = q.trim().toLowerCase();
  const list = GLOSSARY.filter((g) => (!tag || g.tags.includes(tag)) && (!s || g.term.toLowerCase().includes(s) || g.meaning.toLowerCase().includes(s)));
  const startDrill = () => setDrill([...list].sort(() => Math.random() - 0.5));
  return (
    <div>
      <Opener no="A–Z" kicker="Reference" title="The Glossary" standfirst="Every term you will hear in a case, on a card. Read the front, say the meaning out loud, then turn it over." />
      {drill ? (
        <Drill deck={drill} onExit={() => setDrill(null)} />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms, e.g. RevPAR" className="bg-card pl-9" />
            </div>
            <Button onClick={startDrill} disabled={!list.length}><Shuffle /> Drill me ({list.length})</Button>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-y border-hairline py-2 text-sm">
            <button onClick={() => setTag(null)} className={`smallcaps ${!tag ? "text-destructive underline" : ""}`}>All</button>
            {tags.map((t) => <button key={t} onClick={() => setTag(t)} className={`smallcaps ${tag === t ? "text-destructive underline" : ""}`}>{t}</button>)}
          </div>
          <p className="nums text-sm italic text-muted-foreground">{list.length} terms</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((g) => <FlipCard key={g.term} front={<Front g={g} />} back={<Back g={g} />} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Drill({ deck, onExit }: { deck: GlossaryTerm[]; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState<GlossaryTerm[]>([]);
  const g = deck[i];
  const next = (knew: boolean) => {
    if (knew) setKnown(known + 1);
    else setAgain([...again, g!]);
    setFlipped(false);
    setI(i + 1);
  };
  if (!g) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="font-display text-3xl">Deck finished.</p>
        <p className="nums">You knew {known} of {deck.length}.</p>
        <div className="flex gap-2">
          {again.length > 0 && <Button onClick={() => { setI(0); setKnown(0); setAgain([]); deck.splice(0, deck.length, ...again); }}>Drill the {again.length} I missed</Button>}
          <Button variant="outline" onClick={onExit}>Back to all cards</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="nums flex justify-between text-sm italic text-muted-foreground"><span>Card {i + 1} of {deck.length}</span><span>Known: {known}</span></div>
      <FlipCard height={300} flipped={flipped} onFlip={setFlipped} front={<Front g={g} />} back={<Back g={g} />} />
      {flipped ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => next(false)}>Not yet</Button>
          <Button onClick={() => next(true)}>I knew it</Button>
        </div>
      ) : (
        <Button className="w-full" variant="outline" onClick={() => setFlipped(true)}>Turn over</Button>
      )}
      <button onClick={onExit} className="block w-full text-center text-sm italic underline">Stop drilling</button>
    </div>
  );
}

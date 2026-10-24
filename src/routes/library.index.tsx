import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Factory } from "lucide-react";
import { FRAMEWORKS } from "@/data/frameworks";
import { getExtra } from "@/data/framework-extras";
import { Opener, issueNo } from "@/components/AppHeader";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "Framework library — Structure Gym" },
      { name: "description", content: "Twelve consulting frameworks with full tree diagrams, trigger phrases, worked examples and common mistakes." },
      { property: "og:title", content: "Framework library — Structure Gym" },
      { property: "og:description", content: "Profitability, market entry, M&A, pricing and more — with worked examples." },
    ],
  }),
  component: Library,
});

function Library() {
  return (
    <div>
      <Opener no="XII" kicker="Reference" title="The framework library" standfirst="Twelve starting points, not answers. Always tailor to the case." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link to="/chooser" className="flex items-center gap-3 rounded-md border border-primary bg-primary p-4 text-primary-foreground"><Compass className="h-6 w-6" /><div><div className="font-semibold">Which framework? Decision guide</div><div className="text-sm opacity-80">From the question in the prompt to the right framework</div></div></Link>
        <Link to="/value-chains" className="flex items-center gap-3 border border-foreground bg-card p-4 hover:bg-accent sm:col-span-2"><Factory className="h-6 w-6 text-destructive" /><div><div className="font-semibold">Value chains</div><div className="text-sm italic text-muted-foreground">Stage-by-stage flows, unit economics and drills for all 17 industries</div></div></Link>
        <Link to="/library/industries" className="flex items-center gap-3 rounded-md border bg-card p-4 hover:border-primary"><Factory className="h-6 w-6 text-primary" /><div><div className="font-semibold">Industry cheat sheets</div><div className="text-sm text-muted-foreground">Drivers and KPIs for 17 industries</div></div></Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORKS.map((f, i) => (
          <Link key={f.id} to="/library/$id" params={{ id: f.id }} className="group border-t border-foreground pt-3">
            <div className="nums text-xs smallcaps text-destructive">{issueNo(i + 1)}</div>
            <h2 className="font-display text-2xl font-semibold group-hover:text-destructive">{f.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.summary}</p>
            <p className="mt-3 text-xs italic text-muted-foreground">"{getExtra(f.id)?.triggers[0]}"</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

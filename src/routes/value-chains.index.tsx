import { createFileRoute, Link } from "@tanstack/react-router";
import { BANK } from "@/data/bank";
import { industryName } from "@/data/taxonomy";
import { Opener, issueNo } from "@/components/AppHeader";

export const Route = createFileRoute("/value-chains/")({
  head: () => ({
    meta: [
      { title: "Value chains — Structure Gym" },
      { name: "description", content: "Seventeen industry value chains: stages, drivers, KPIs, unit economics and 102 drills to locate, order and assign." },
      { property: "og:title", content: "Value chains — Structure Gym" },
      { property: "og:description", content: "See how money moves through 17 industries, stage by stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <Opener no="VC" kicker="Explainer" title="Value chains" standfirst="A process split is one of the cleanest ways to be MECE. Follow the money from first step to last, stage by stage." />
      <p className="pullquote mx-auto mb-10 max-w-3xl">If you can draw the chain, you can find where the margin leaks.</p>
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        {BANK.map((b, i) => (
          <Link key={b.industry} to="/value-chains/$id" params={{ id: b.industry }} className="group grid grid-cols-[auto_1fr] gap-4 border-t border-foreground pt-3">
            <span className="nums font-display text-4xl font-bold text-destructive">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block text-xs smallcaps text-muted-foreground">{issueNo(i + 1)} · {b.chainDrills.length} drills</span>
              <span className="block font-display text-2xl font-semibold group-hover:text-destructive">{industryName(b.industry)}</span>
              <span className="block text-sm italic text-muted-foreground">{b.valueChain.stages.map((s) => s.name).join(" → ")}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

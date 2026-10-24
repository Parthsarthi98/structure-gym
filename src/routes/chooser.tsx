import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/chooser")({
  head: () => ({
    meta: [
      { title: "Which framework? Decision guide — Structure Gym" },
      { name: "description", content: "A visual decision tree from the question in a case prompt to the right consulting framework, plus how to combine two." },
      { property: "og:title", content: "Which framework? Decision guide — Structure Gym" },
      { property: "og:description", content: "From the case question to the right framework." },
    ],
  }),
  component: Chooser,
});

type Branch = { q: string; examples: string; options: { cond: string; fw: string; name: string }[] };
const BRANCHES: Branch[] = [
  { q: "Why is something falling or rising?", examples: "\"Profits have fallen\", \"margins are shrinking\", \"costs are up\"", options: [
    { cond: "Profit or margin moved", fw: "profitability", name: "Profitability" },
    { cond: "Need to cut costs / fix a process", fw: "operations", name: "Operations / cost reduction" },
    { cond: "Losses plus cash crisis", fw: "turnaround", name: "Turnaround" },
  ] },
  { q: "Should we do something new?", examples: "\"Should we enter India?\", \"Should we launch X?\"", options: [
    { cond: "New country or segment", fw: "market-entry", name: "Market entry" },
    { cond: "New product or service", fw: "product-launch", name: "New product launch" },
  ] },
  { q: "Should we buy or invest?", examples: "\"Should we acquire…?\", \"Should the fund invest?\"", options: [
    { cond: "Corporate buyer, synergies matter", fw: "ma", name: "M&A / acquisition" },
    { cond: "Financial investor, exit matters", fw: "pe-dd", name: "PE due diligence" },
  ] },
  { q: "How do we grow or win?", examples: "\"Double revenue\", \"a competitor cut prices\"", options: [
    { cond: "Grow revenue", fw: "growth", name: "Growth" },
    { cond: "Respond to a rival's move", fw: "competitive-response", name: "Competitive response" },
    { cond: "Who to target", fw: "segmentation", name: "Customer segmentation" },
  ] },
  { q: "What number?", examples: "\"How should we price?\", \"How big is the market?\"", options: [
    { cond: "Set a price", fw: "pricing", name: "Pricing" },
    { cond: "Estimate a size", fw: "market-sizing", name: "Market sizing" },
  ] },
];

const HYBRIDS = [
  { a: "Market entry", b: "Market sizing", how: "Size the market as the first branch of 'Is the market attractive?'" },
  { a: "Market entry", b: "Pricing", how: "Put pricing under 'Economics': price sets volume and payback." },
  { a: "Profitability", b: "Competitive response", how: "If the diagnosis finds a rival's move, the second half becomes response options." },
  { a: "M&A", b: "PE due diligence", how: "Use M&A for strategic fit; add exit and valuation from PE." },
  { a: "Turnaround", b: "Operations", how: "Stabilise cash first, then use the cost-reduction tree for the 'Fix' branch." },
  { a: "Product launch", b: "Pricing", how: "Price is a sub-branch of launch economics; use cost / competitor / value lenses." },
];

function Chooser() {
  return (
    <div className="space-y-8">
      <div>
        <Link to="/library" className="text-sm text-muted-foreground hover:underline">← Framework library</Link>
        <h1 className="mt-2 font-display text-5xl">Which framework?</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">Read the last sentence of the prompt — the actual question. Follow it right to a starting framework, then tailor.</p>
      </div>
      <div className="flex justify-center"><div className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">What is the client asking?</div></div>
      <div className="flex justify-center"><ArrowDown className="text-muted-foreground" /></div>
      <div className="space-y-3">
        {BRANCHES.map((b, i) => (
          <div key={b.q} className="grid items-center gap-3 rounded-md border bg-card p-4 md:grid-cols-[16rem_auto_1fr]" style={{ borderLeft: `5px solid var(--branch-${i + 1})` }}>
            <div><div className="font-semibold">{b.q}</div><div className="mt-1 text-xs italic text-muted-foreground">{b.examples}</div></div>
            <ArrowRight className="hidden text-muted-foreground md:block" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {b.options.map((o) => (
                <Link key={o.fw} to="/library/$id" params={{ id: o.fw }} className="rounded-md border bg-background p-3 text-sm hover:border-primary">
                  <div className="text-xs text-muted-foreground">{o.cond}</div>
                  <div className="font-semibold" style={{ color: `var(--branch-${i + 1})` }}>{o.name} →</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <section>
        <h2 className="font-display text-3xl">Hybrid cases: combining two</h2>
        <p className="mt-1 text-sm text-muted-foreground">Advanced cases often need one framework nested inside another. Pick the one that answers the main question as the spine.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {HYBRIDS.map((h) => (
            <div key={h.a + h.b} className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">{h.a}</span>+<span className="rounded bg-accent px-2 py-0.5 text-accent-foreground">{h.b}</span></div>
              <p className="mt-2 text-sm">{h.how}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { INDUSTRY_SHEETS } from "@/data/industry-sheets";
import { industryName } from "@/data/taxonomy";

export const Route = createFileRoute("/library/industries")({
  head: () => ({
    meta: [
      { title: "Industry cheat sheets — Structure Gym" },
      { name: "description", content: "Revenue drivers, cost drivers and KPIs for 17 industries used in case interviews." },
      { property: "og:title", content: "Industry cheat sheets — Structure Gym" },
      { property: "og:description", content: "Key drivers and KPIs for 17 industries." },
    ],
  }),
  component: Sheets,
});

function Sheets() {
  const [active, setActive] = useState<string | null>(null);
  const list = active ? INDUSTRY_SHEETS.filter((s) => s.industry === active) : INDUSTRY_SHEETS;
  return (
    <div className="space-y-6">
      <div>
        <Link to="/library" className="text-sm text-muted-foreground hover:underline">← Framework library</Link>
        <h1 className="mt-2 font-display text-5xl">Industry cheat sheets</h1>
        <p className="mt-1 text-muted-foreground">Use these to tailor branches: swap generic "revenue" and "costs" for the drivers that matter in the industry.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setActive(null)} className={`rounded-full px-3 py-1 text-xs ${!active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>All</button>
        {INDUSTRY_SHEETS.map((s) => <button key={s.industry} onClick={() => setActive(s.industry)} className={`rounded-full px-3 py-1 text-xs ${active === s.industry ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{industryName(s.industry)}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((s) => (
          <section key={s.industry} className="rounded-md border bg-card p-5">
            <h2 className="font-display text-2xl">{industryName(s.industry)}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border-t-4 border-success bg-background p-3"><div className="mb-1 text-xs font-semibold uppercase text-success">Revenue drivers</div><ul className="space-y-1 text-sm">{s.revenueDrivers.map((d) => <li key={d}>+ {d}</li>)}</ul></div>
              <div className="rounded-md border-t-4 border-destructive bg-background p-3"><div className="mb-1 text-xs font-semibold uppercase text-destructive">Cost drivers</div><ul className="space-y-1 text-sm">{s.costDrivers.map((d) => <li key={d}>− {d}</li>)}</ul></div>
            </div>
            <div className="mt-3"><div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">KPIs</div><div className="grid gap-1.5 sm:grid-cols-2">{s.kpis.map((k) => <div key={k.name} className="rounded bg-secondary px-2.5 py-1.5 text-xs"><b>{k.name}</b>: {k.meaning}</div>)}</div></div>
            <div className="mt-3 rounded-md bg-accent/15 p-3 text-xs"><b>Watch out:</b><ul className="mt-1 list-disc pl-4">{s.watchOuts.map((w) => <li key={w}>{w}</li>)}</ul></div>
          </section>
        ))}
      </div>
    </div>
  );
}

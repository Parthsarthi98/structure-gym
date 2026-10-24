import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BANK, getBankFile, type BankChainDrill, type BankFile } from "@/data/bank";
import { industryName } from "@/data/taxonomy";
import { Opener } from "@/components/AppHeader";
import { ChainDrillCard, ChainFlow, TraceSymptom, Waterfall } from "@/components/ValueChain";
import { saveAttempt } from "@/lib/attempts";

export const Route = createFileRoute("/value-chains/$id")({
  loader: ({ params }) => {
    const b = getBankFile(params.id);
    if (!b) throw notFound();
    return b;
  },
  head: ({ loaderData }) => {
    const t = `${loaderData ? industryName(loaderData.industry) : "Industry"} value chain — Structure Gym`;
    const d = loaderData?.valueChain.summary ?? "Interactive industry value chain.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Page,
});

function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 border-b border-t-[3px] border-foreground py-1 font-display text-3xl font-semibold">{children}</h2>;
}

function Page() {
  const b = Route.useLoaderData();
  const vc = b.valueChain;
  return (
    <div className="space-y-14">
      <div>
        <Link to="/value-chains" className="text-sm italic text-muted-foreground hover:text-destructive">← All value chains</Link>
        <div className="mt-3 flex flex-wrap gap-2">
          {BANK.map((x) => (
            <Link key={x.industry} to="/value-chains/$id" params={{ id: x.industry }} className={`border border-foreground px-2 py-0.5 text-sm ${x.industry === b.industry ? "bg-foreground text-background" : "hover:bg-accent"}`}>
              {industryName(x.industry)}
            </Link>
          ))}
        </div>
        <div className="mt-6"><Opener kicker="Value chain" title={industryName(b.industry)} /></div>
        <p className="max-w-[50ch] text-2xl italic">{vc.summary}</p>
      </div>
      <section>
        <SectionHead>The chain</SectionHead>
        <p className="mb-3 text-sm italic text-muted-foreground">Click a stage to open its drivers, KPIs and margin.</p>
        <ChainFlow key={b.industry} chain={vc} />
      </section>
      <section>
        <SectionHead>Unit economics</SectionHead>
        <Waterfall key={b.industry} ue={vc.unitEconomics} />
      </section>
      <section className="bg-foreground p-6 text-background sm:p-10">
        <div className="smallcaps text-sm text-red-on-ink">Trace a symptom</div>
        <div className="mt-3"><TraceSymptom key={b.industry} ex={vc.workedExample} /></div>
      </section>
      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <SectionHead>Where the profit sits</SectionHead>
          <p className="dropcap text-lg leading-relaxed">{vc.profitPools}</p>
        </div>
        <div>
          <SectionHead>In India</SectionHead>
          <p className="text-lg leading-relaxed">{vc.india}</p>
        </div>
      </section>
      <section>
        <SectionHead>Chain drills</SectionHead>
        <Drills key={b.industry} b={b} />
      </section>
    </div>
  );
}

function Drills({ b }: { b: BankFile }) {
  const qc = useQueryClient();
  const record = (d: BankChainDrill) => async (score: number) => {
    try {
      await saveAttempt({
        mode: "chain", case_id: d.id, case_title: `${industryName(b.industry)} chain: ${d.type}`, case_prompt: d.prompt, industry: b.industry, framework: "operations",
        difficulty: d.difficulty, score, rubric: null, error_types: score >= 10 ? [] : ["chain-" + d.type], time_taken_seconds: null, time_limit_seconds: null,
        user_answer: null, feedback: null,
      });
      qc.invalidateQueries({ queryKey: ["attempts"] });
    } catch { /* recording is best-effort; the drill still works */ }
  };
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {b.chainDrills.map((d) => <ChainDrillCard key={d.id} drill={d} stages={b.valueChain.stages} onResult={record(d)} />)}
    </div>
  );
}

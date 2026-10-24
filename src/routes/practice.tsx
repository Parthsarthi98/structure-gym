import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DIFFICULTIES, FRAMEWORK_LIST, INDUSTRIES, MODES, frameworkName, industryName, type FrameworkId, type IndustryId, type ModeId } from "@/data/taxonomy";
import { FLAWS } from "@/data/flaws";
import { filterCases, pickRandom, saveGeneratedCase } from "@/lib/attempts";
import { generateCase } from "@/lib/grading.functions";
import { generationDifficulty, practiceDifficulty } from "@/lib/practice-rules";
import { useHardMode } from "@/lib/hard-mode";

type Search = { mode?: ModeId | undefined; industry?: string | undefined; framework?: string | undefined; difficulty?: string | undefined };

export const Route = createFileRoute("/practice")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: (MODES.some((m) => m.id === s['mode']) ? s['mode'] : undefined) as ModeId | undefined,
    industry: typeof s['industry'] === "string" ? s['industry'] : undefined,
    framework: typeof s['framework'] === "string" ? s['framework'] : undefined,
    difficulty: typeof s['difficulty'] === "string" ? s['difficulty'] : undefined,
  }),
  head: () => ({ meta: [{ title: "Practice — Structure Gym" }, { name: "description", content: "Choose a mode, industry, framework and difficulty." }, { property: "og:title", content: "Practice — Structure Gym" }, { property: "og:description", content: "Choose your structuring drill." }] }),
  component: Practice,
});

const ALL = "__all";

function Practice() {
  const s = Route.useSearch();
  const mode: ModeId = s.mode ?? "build";
  const navigate = useNavigate({ from: "/practice" });
  const gen = useServerFn(generateCase);
  const [generating, setGenerating] = useState(false);
  const [hard, setHard] = useHardMode();

  const set = (k: keyof Search, v: string) => navigate({ search: (p: Search) => ({ ...p, [k]: v === ALL ? undefined : v }) });

  // Practice defaults to Intermediate; Hard mode serves Advanced items only.
  const difficulty = practiceDifficulty(s.difficulty, hard);

  const cases = filterCases({ industry: s.industry, framework: s.framework, difficulty });
  const flaws = FLAWS.filter((f) => (!s.industry || f.industry === s.industry) && (!s.framework || f.framework === s.framework) && (!difficulty || f.difficulty === difficulty));

  const open = (id: string) => {
    if (mode === "flaw") navigate({ to: "/flaw/$flawId", params: { flawId: id } });
    else navigate({ to: "/drill/$mode/$caseId", params: { mode, caseId: id } });
  };

  const surprise = () => {
    const pool = mode === "flaw" ? (flaws.length ? flaws : FLAWS.filter((f) => f.difficulty === difficulty)) : cases.length ? cases : filterCases({ difficulty });
    const p = pickRandom(pool as { id: string }[]);
    if (p) open(p.id);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const industry = s.industry ?? pickRandom([...INDUSTRIES])!.id;
      const framework = s.framework ?? pickRandom([...FRAMEWORK_LIST])!.id;
      const difficulty = generationDifficulty(s.difficulty, hard);
      const r = await gen({ data: { industry: industryName(industry), framework: frameworkName(framework), difficulty, frameworkIds: FRAMEWORK_LIST.map((f) => f.id) } });
      const caseId = await saveGeneratedCase({
        title: r.title, prompt: r.prompt, industry: industry as IndustryId, framework: framework as FrameworkId, secondary: r.secondary.filter((x) => x !== framework) as FrameworkId[], difficulty, region: r.region,
        answer: { modelTree: r.modelTree, explanation: r.explanation, hypotheses: r.hypotheses, keyMetrics: r.keyMetrics, hints: r.hints, redHerring: r.redHerring, quantitativeStep: r.quantitativeStep, distractors: r.distractors as FrameworkId[] },
        distractors: r.distractors as FrameworkId[], redHerring: r.redHerring, quantitativeStep: r.quantitativeStep,
      });
      navigate({ to: "/drill/$mode/$caseId", params: { mode: mode === "flaw" ? "build" : mode, caseId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate a case.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Practice</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => set("mode", m.id)} className={`rounded-md border p-3 text-left text-sm transition-colors ${mode === m.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
            <span className="font-medium">{m.name}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Filter label="Industry" value={s.industry} onChange={(v) => set("industry", v)} options={INDUSTRIES.map((i) => ({ v: i.id, l: i.name }))} />
        <Filter label="Framework" value={s.framework} onChange={(v) => set("framework", v)} options={FRAMEWORK_LIST.map((i) => ({ v: i.id, l: i.name }))} />
        <Filter label="Difficulty" value={hard ? "Advanced" : difficulty} onChange={(v) => set("difficulty", v)} options={DIFFICULTIES.map((d) => ({ v: d, l: d }))} disabled={hard} />
        <label className="flex items-center gap-2 text-sm">
          <Switch id="hard-mode" checked={hard} onCheckedChange={setHard} />
          <span className="font-medium">Hard mode</span>
          <span className="text-xs text-muted-foreground">Advanced items only, no hints</span>
        </label>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={surprise}><Shuffle /> Surprise me</Button>
          {mode !== "flaw" && <Button onClick={generate} disabled={generating}><Sparkles /> {generating ? "Generating…" : "Generate new case"}</Button>}
        </div>
      </div>

      {mode === "flaw" ? (
        <List items={flaws.map((f) => ({ id: f.id, title: f.title, industry: f.industry, framework: f.framework, difficulty: f.difficulty, sub: f.tree.label }))} onOpen={open} />
      ) : (
        <List items={cases.map((c) => ({ id: c.id, title: c.title, industry: c.industry, framework: c.framework, difficulty: c.difficulty, sub: c.region === "India" ? "India" : "Global", hide: mode === "framework" }))} onOpen={open} />
      )}
    </div>
  );
}

function Filter({ label, value, onChange, options, disabled }: { label: string; value?: string | undefined; onChange: (v: string) => void; options: { v: string; l: string }[]; disabled?: boolean | undefined }) {
  return (
    <Select value={value ?? ALL} onValueChange={onChange} disabled={disabled ?? false}>
      <SelectTrigger className="w-[190px] bg-card"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}s</SelectItem>
        {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function List({ items, onOpen }: { items: { id: string; title: string; industry: string; framework: string; difficulty: string; sub: string; hide?: boolean }[]; onOpen: (id: string) => void }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No items match. Clear a filter or generate a new case.</p>;
  return (
    <div className="divide-y rounded-md border bg-card">
      {items.map((x) => (
        <button key={x.id} onClick={() => onOpen(x.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-secondary">
          <span className="min-w-[14rem] flex-1 font-medium">{x.title}</span>
          <span className="text-xs text-muted-foreground">{industryName(x.industry)}</span>
          {!x.hide && <span className="text-xs text-muted-foreground">{frameworkName(x.framework)}</span>}
          <span className="rounded bg-secondary px-1.5 py-0.5 nums text-[10px] uppercase">{x.difficulty}</span>
          <span className="w-12 text-right text-xs text-muted-foreground">{x.sub.length < 10 ? x.sub : ""}</span>
        </button>
      ))}
    </div>
  );
}

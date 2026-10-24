import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Flame } from "lucide-react";
import { type ReactNode } from "react";
import { attemptsQuery } from "@/lib/attempts";
import { progressQuery } from "@/lib/lessons";
import { errorCounts, heatmap, recommendation, reviewQueue, rubricAverages, streak, type Attempt } from "@/lib/stats";
import { ERROR_TYPES, FRAMEWORK_LIST, INDUSTRIES, RUBRIC, frameworkName, industryName, type ErrorType } from "@/data/taxonomy";
import { LESSONS } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  loader: ({ context }) => context.queryClient.ensureQueryData(attemptsQuery),
  head: () => ({ meta: [{ title: "Dashboard — Structure Gym" }, { name: "description", content: "Your structuring scores, weak spots and next drill." }, { property: "og:title", content: "Dashboard — Structure Gym" }, { property: "og:description", content: "Your structuring scores and weak spots." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useSuspenseQuery(attemptsQuery);
  const { data: progress = [] } = useQuery(progressQuery);
  const done = new Set(progress.map((p) => p.lesson_id));
  const chrono = [...data].reverse();
  const trend = chrono.map((a, i) => {
    const w = chrono.slice(Math.max(0, i - 4), i + 1);
    return { n: i + 1, score: Number(a.score), avg: Math.round((w.reduce((s, x) => s + Number(x.score), 0) / w.length) * 10) / 10 };
  });
  const overall = data.length ? data.reduce((s, a) => s + Number(a.score), 0) / data.length : 0;
  const rub = rubricAverages(data);
  const heat = heatmap(data);
  const errs = errorCounts(data).map(([k, v]) => ({ name: ERROR_TYPES[k as ErrorType] ?? k, count: v }));
  const rec = recommendation(data);
  const st = streak(data);
  const reviewCount = reviewQueue(data).length;
  const usedInd = INDUSTRIES.filter((i) => data.some((a) => a.industry === i.id));
  const usedFw = FRAMEWORK_LIST.filter((f) => data.some((a) => a.framework === f.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-6xl font-semibold leading-none">The Dashboard</h1><p className="standfirst mt-2">Your scores, weak spots and your next drill.</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <Stat label="Average" value={data.length ? `${overall.toFixed(1)}/10` : "—"} />
          <Stat label="Attempts" value={String(data.length)} />
          <Stat label="Streak" value={<span className="inline-flex items-center gap-1"><Flame className="h-4 w-4 text-warning" />{st} day{st === 1 ? "" : "s"}</span>} />
          <Stat label="To review" value={<Link to="/review" className="underline">{reviewCount}</Link>} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-md border bg-card p-4">
          <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">Lessons</span><span className="font-mono">{done.size}/{LESSONS.length}</span></div>
          <Progress value={(done.size / LESSONS.length) * 100} />
          <Link to="/learn" className="mt-2 inline-block text-sm text-primary underline">{done.size < LESSONS.length ? "Continue learning" : "Revisit lessons"}</Link>
        </section>
        {rec ? (
          <section className="flex flex-wrap items-center gap-4 rounded-md border-l-4 border-accent bg-card p-4">
            <div className="flex-1 text-sm">
              <div className="nums text-xs uppercase text-muted-foreground">Your next drill</div>
              <div className="mt-1"><b>{frameworkName(rec.framework ?? "")}</b> in <b>{industryName(rec.industry ?? "")}</b>{rec.criterion && <> · focus on <b>{RUBRIC.find((r) => r.key === rec.criterion)?.name.toLowerCase()}</b></>}</div>
            </div>
            <Button asChild><Link to="/practice" search={{ mode: "build", industry: rec.industry, framework: rec.framework }}>Go</Link></Button>
          </section>
        ) : (
          <section className="rounded-md border-l-4 border-accent bg-card p-4 text-sm">No attempts yet. <Link to="/practice" className="text-primary underline">Start your first drill</Link> — charts fill in as you practise.</section>
        )}
      </div>

      {data.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Score trend (line = 5-attempt average)">
              <div className="h-60">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid stroke="var(--hairline)" vertical={false} />
                    <XAxis dataKey="n" fontSize={11} stroke="var(--ink)" strokeWidth={0.75} tickLine={false} />
                    <YAxis domain={[0, 10]} fontSize={11} stroke="var(--ink)" strokeWidth={0.75} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--ink)", borderRadius: 0, fontStyle: "italic" }} />
                    <Line dataKey="score" name="Score" stroke="var(--navy)" dot={{ r: 2, fill: "var(--navy)" }} strokeWidth={1} isAnimationActive />
                    <Line dataKey="avg" name="Average" stroke="var(--red)" dot={false} strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Rubric radar (tree drills, out of 2)">
              <div className="h-60">
                <ResponsiveContainer>
                  <RadarChart data={rub.map((r) => ({ name: r.name, v: r.avg ?? 0 }))} outerRadius="72%">
                    <PolarGrid stroke="var(--hairline)" />
                    <PolarAngleAxis dataKey="name" fontSize={11} tick={{ fill: "var(--foreground)" }} />
                    <PolarRadiusAxis domain={[0, 2]} tickCount={3} fontSize={9} />
                    <Radar dataKey="v" stroke="var(--red)" fill="var(--red)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card title="Industry × framework (average score)">
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <thead><tr><th />{usedFw.map((f) => <th key={f.id} className="px-1 pb-1 text-left font-normal text-muted-foreground"><div className="w-16 truncate" title={f.name}>{f.name}</div></th>)}</tr></thead>
                  <tbody>
                    {usedInd.map((i) => (
                      <tr key={i.id}>
                        <td className="pr-2 text-muted-foreground"><div className="w-36 truncate">{i.name}</div></td>
                        {usedFw.map((f) => {
                          const xs = heat.get(`${i.id}|${f.id}`);
                          const v = xs ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
                          const bg = v === null ? "bg-heat-0" : v < 5 ? "bg-heat-1" : v < 7 ? "bg-heat-2" : "bg-heat-3";
                          return <td key={f.id} className="p-0.5"><div className={`flex h-8 w-16 items-center justify-center rounded-sm nums ${bg}`}>{v === null ? "" : v.toFixed(1)}</div></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded-sm bg-heat-1" />below 5</span><span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded-sm bg-heat-2" />5–7</span><span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded-sm bg-heat-3" />7+</span></div>
            </Card>
            <Card title="Most common errors">
              {errs.length ? (
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={errs} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" allowDecimals={false} fontSize={11} stroke="var(--ink)" strokeWidth={0.75} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={110} fontSize={11} stroke="var(--ink)" strokeWidth={0.75} tickLine={false} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--ink)", borderRadius: 0, fontStyle: "italic" }} />
                      <Bar dataKey="count" fill="var(--red)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-muted-foreground">None recorded yet.</p>}
            </Card>
          </div>
        </>
      )}

    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div><div className="nums text-[10px] uppercase text-muted-foreground">{label}</div><div className="text-lg font-semibold">{value}</div></div>;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-md border bg-card p-5"><h2 className="mb-4 border-b border-foreground pb-1 text-sm smallcaps">{title}</h2>{children}</section>;
}

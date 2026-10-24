import { useState, type ReactNode } from "react";
import type { DNode, NodeStatus } from "@/data/types";

export const BRANCH = ["#C8102E", "#1F6F78", "#22335C", "#C9A227", "#6B7A2E"];
const LEVELS = ["L0 Question", "L1 Driver", "L2 Component", "L3 Test", "L4 Detail"];

const statusClass = (s?: NodeStatus) =>
  s === "overlap" ? "s-overlap" : s === "missing" || s === "gap" ? "s-gap" : s === "mixed" ? "s-mixed" : s === "good" ? "s-good" : s === "driver" ? "s-hyp" : "";
const defaultReason = (s?: NodeStatus) => (s === "missing" || s === "gap" ? "missing" : s === "overlap" ? "overlap" : s === "mixed" ? "wrong level" : s === "good" ? "strong" : "");

type Props = {
  tree: DNode;
  className?: string | undefined;
  vertical?: boolean | undefined;
  onNodeClick?: ((id: string) => void) | undefined;
  selected?: Set<string> | undefined;
  /** Each level fades in from the left, 0.45s apart. */
  animate?: boolean | undefined;
  /** Hide the L0/L1/L2 strip. */
  bare?: boolean | undefined;
};

const depthOf = (n: DNode): number => 1 + Math.max(0, ...(n.children ?? []).map(depthOf));

/** Every issue tree in the app: flex connector layout inside a bordered panel. Click a parent to fold it. */
export function TreeDiagram({ tree, className, vertical, onNodeClick, selected, animate, bare }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  if (vertical) return <VerticalTree tree={tree} />;
  const toggle = (k: string) => setCollapsed((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const levels = depthOf(tree);

  const render = (n: DNode, key: string, depth: number, color: string): ReactNode => {
    const kids = n.children ?? [];
    const isCol = collapsed.has(key) && kids.length > 0;
    const click = onNodeClick ? (n.id ? () => onNodeClick(n.id!) : undefined) : kids.length ? () => toggle(key) : undefined;
    const reason = n.note ?? (n.status && n.status !== "driver" ? defaultReason(n.status) : "");
    const box = (
      <div
        role={click ? "button" : undefined}
        tabIndex={click ? 0 : undefined}
        onClick={click}
        onKeyDown={click ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); click(); } } : undefined}
        title={!onNodeClick && kids.length ? (isCol ? "Click to unfold" : "Click to fold") : undefined}
        className={`tbox ${depth === 0 ? "root" : ""} ${statusClass(n.status)} ${n.id && selected?.has(n.id) ? "sel" : ""} ${click ? "cursor-pointer" : ""} ${animate ? "tlvl" : ""}`}
        style={animate ? { animationDelay: `${depth * 0.45}s` } : undefined}
      >
        <span className="flex items-start gap-2">
          {depth > 0 && <span className="mt-[0.4em] inline-block h-[9px] w-[9px] shrink-0" style={{ background: color }} />}
          <span>
            {n.label || <i className="opacity-60">(blank)</i>}
            {isCol && <i className="nums ml-1 text-sm text-destructive">+{kids.length}</i>}
            {reason && <span className="block text-[13px] smallcaps opacity-80" style={{ color: n.status === "good" ? "#2F6B3A" : n.status === "mixed" ? "#8a6508" : "var(--red)" }}>{reason}</span>}
          </span>
        </span>
      </div>
    );
    if (!kids.length || isCol) return box;
    return (
      <div className="tr">
        {box}
        <div className="tk">
          {kids.map((c, i) => (
            <div className="tn" key={i}>{render(c, `${key}.${i}`, depth + 1, depth === 0 ? BRANCH[i % BRANCH.length]! : color)}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`overflow-x-auto border border-foreground bg-card p-4 ${className ?? ""}`}>
      {!bare && (
        <div className="mb-3 flex gap-6 border-b border-hairline pb-1 text-[13px] smallcaps text-muted-foreground">
          {LEVELS.slice(0, Math.max(2, levels)).map((l) => <span key={l} className="whitespace-nowrap">{l}</span>)}
        </div>
      )}
      <div className="w-max">{render(tree, "0", 0, "var(--ink)")}</div>
    </div>
  );
}

function VerticalTree({ tree }: { tree: DNode }) {
  const render = (n: DNode, key: string, depth: number, color: string): ReactNode => (
    <div key={key} className={depth > 0 ? "ml-3 border-l-[1.5px] border-foreground pl-3" : ""}>
      <div className={`tbox my-1 ${depth === 0 ? "root" : ""} ${statusClass(n.status)}`} style={{ maxWidth: "none" }}>
        <span className="flex items-start gap-2">{depth > 0 && <span className="mt-[0.4em] inline-block h-[9px] w-[9px] shrink-0" style={{ background: color }} />}{n.label}</span>
      </div>
      {(n.children ?? []).map((c, i) => render(c, `${key}.${i}`, depth + 1, depth === 0 ? BRANCH[i % BRANCH.length]! : color))}
    </div>
  );
  return <div>{render(tree, "0", 0, "var(--ink)")}</div>;
}

export function DiagramLegend() {
  const items: [string, string][] = [
    ["s-overlap", "Overlap"],
    ["s-gap", "Missing (gap)"],
    ["s-mixed", "Wrong level / not a driver"],
    ["s-good", "Strong"],
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] italic">
      {items.map(([c, l]) => (
        <span key={l} className="inline-flex items-center gap-2"><span className={`tbox ${c} inline-block !min-w-0 !p-0`} style={{ width: 26, height: 16 }} />{l}</span>
      ))}
    </div>
  );
}

/** Walks through a tree one layer at a time. Final step highlights hypothesis nodes (status "driver"). */
export function StepReveal({ tree, title, steps }: { tree: DNode; title?: string | undefined; steps?: { title: string; body: string }[] | undefined }) {
  const layers = depthOf(tree);
  const hasHyp = JSON.stringify(tree).includes('"driver"');
  const total = layers + (hasHyp ? 1 : 0) - 0;
  const [step, setStep] = useState(1);
  const showLayers = Math.min(step, layers);
  const highlight = hasHyp && step > layers - 0 && step === total;
  const cut = (n: DNode, d: number): DNode => {
    const out: DNode = { ...n, children: d + 1 >= showLayers ? [] : (n.children ?? []).map((c) => cut(c, d + 1)) };
    if (!highlight && out.status === "driver") delete out.status;
    return out;
  };
  const info = steps?.[step - 1];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {title && <span className="mr-2 text-[15px] smallcaps">{title}</span>}
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setStep(i + 1)} className={`nums h-11 w-11 border-[1.5px] border-foreground ${i < step ? "bg-foreground text-paper" : ""}`}>{i + 1}</button>
          ))}
          <Next disabled={step >= total} onClick={() => setStep(step + 1)} />
        </div>
        <TreeDiagram key={step} tree={cut(tree, 0)} animate />
      </div>
      <aside className="border-t-[3px] border-foreground pt-2">
        <div className="text-[15px] smallcaps text-destructive">Step {step} · {info?.title ?? defaultStepTitle(step, layers, hasHyp)}</div>
        <p className="mt-1 italic">{info?.body ?? defaultStepBody(step, layers, hasHyp)}</p>
      </aside>
    </div>
  );
}

const Next = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <button disabled={disabled} onClick={onClick} className="min-h-11 border-[1.5px] border-foreground px-4 hover:bg-foreground hover:text-paper disabled:opacity-40">Next step →</button>
);

function defaultStepTitle(step: number, layers: number, hyp: boolean) {
  if (hyp && step > layers) return "Hypotheses";
  return ["The question", "The first split", "Components", "Tests", "Detail"][step - 1] ?? "Detail";
}
function defaultStepBody(step: number, layers: number, hyp: boolean) {
  if (hyp && step > layers) return "The red boxes are where you would look first. Say them out loud as hypotheses before you ask for data.";
  return [
    "Start by restating the question you are answering. Everything below must help answer it.",
    "Split the question into drivers that do not overlap and leave nothing out.",
    "Break each driver into components you could measure.",
    "Turn each component into something you can test with data.",
    "Go deeper only where the numbers point.",
  ][step - 1] ?? "";
}

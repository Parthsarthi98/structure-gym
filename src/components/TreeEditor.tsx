import { useRef, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { SimpleNode } from "@/lib/grading.functions";

export type EditNode = { id: string; label: string; children: EditNode[] };
export const MAX_DEPTH = 4;

let counter = 0;
export const newNode = (label = ""): EditNode => ({ id: `n${Date.now()}${counter++}`, label, children: [] });
export const toSimple = (n: EditNode): SimpleNode => ({ label: n.label.trim(), children: n.children.map(toSimple) });
export const countNodes = (n: EditNode): number => 1 + n.children.reduce((s, c) => s + countNodes(c), 0);
const height = (n: EditNode): number => (n.children.length ? 1 + Math.max(...n.children.map(height)) : 0);

// ---------- pure tree operations (exported for tests) ----------
const clone = (n: EditNode): EditNode => ({ ...n, children: n.children.map(clone) });

function locate(root: EditNode, id: string, depth = 0, parent: EditNode | null = null): { node: EditNode; parent: EditNode | null; index: number; depth: number } | null {
  if (root.id === id) return { node: root, parent, index: parent ? parent.children.indexOf(root) : 0, depth };
  for (const c of root.children) {
    const r = locate(c, id, depth + 1, root);
    if (r) return r;
  }
  return null;
}
const contains = (n: EditNode, id: string): boolean => n.id === id || n.children.some((c) => contains(c, id));

export function addSibling(tree: EditNode, id: string, node: EditNode): EditNode {
  const t = clone(tree);
  const l = locate(t, id);
  if (!l) return tree;
  if (!l.parent) l.node.children.push(node);
  else l.parent.children.splice(l.index + 1, 0, node);
  return t;
}

export function indent(tree: EditNode, id: string): EditNode {
  const t = clone(tree);
  const l = locate(t, id);
  if (!l?.parent || l.index === 0) return tree;
  if (l.depth + 1 + height(l.node) > MAX_DEPTH) return tree;
  const prev = l.parent.children[l.index - 1]!;
  l.parent.children.splice(l.index, 1);
  prev.children.push(l.node);
  return t;
}

export function outdent(tree: EditNode, id: string): EditNode {
  const t = clone(tree);
  const l = locate(t, id);
  if (!l?.parent) return tree;
  const gp = locate(t, l.parent.id);
  if (!gp?.parent) return tree;
  l.parent.children.splice(l.index, 1);
  gp.parent.children.splice(gp.index + 1, 0, l.node);
  return t;
}

export function removeNode(tree: EditNode, id: string): EditNode {
  const t = clone(tree);
  const l = locate(t, id);
  if (!l?.parent) return tree;
  l.parent.children.splice(l.index, 1);
  return t;
}

/** Move `id` before `targetId` (as sibling) or inside it (as last child). */
export function moveNode(tree: EditNode, id: string, targetId: string, where: "before" | "inside"): EditNode {
  if (id === targetId) return tree;
  const t = clone(tree);
  const src = locate(t, id);
  if (!src?.parent || contains(src.node, targetId)) return tree;
  const tgt = locate(t, targetId);
  if (!tgt) return tree;
  const newDepth = where === "inside" ? tgt.depth + 1 : tgt.depth;
  if (newDepth === 0 || newDepth + height(src.node) > MAX_DEPTH) return tree;
  src.parent.children.splice(src.index, 1);
  const tgt2 = locate(t, targetId)!;
  if (where === "inside") tgt2.node.children.push(src.node);
  else tgt2.parent!.children.splice(tgt2.parent!.children.indexOf(tgt2.node), 0, src.node);
  return t;
}

function flatIds(n: EditNode): string[] {
  return [n.id, ...n.children.flatMap(flatIds)];
}

export function TreeEditor({ value, onChange, locked }: { value: EditNode; onChange: (v: EditNode) => void; locked?: boolean }) {
  const refs = useRef(new Map<string, HTMLInputElement>());
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string; where: "before" | "inside" } | null>(null);
  const focus = (id: string | undefined) => id && setTimeout(() => refs.current.get(id)?.focus(), 0);
  const setLabel = (id: string, label: string) => {
    const t = clone(value);
    const l = locate(t, id);
    if (l) { l.node.label = label; onChange(t); }
  };
  const addChild = (id: string) => {
    const c = newNode();
    const t = clone(value);
    locate(t, id)!.node.children.push(c);
    onChange(t);
    focus(c.id);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, node: EditNode, depth: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const n = newNode();
      onChange(depth === 0 ? addSibling(value, node.id, n) : addSibling(value, node.id, n));
      focus(n.id);
    } else if (e.key === "Tab") {
      e.preventDefault();
      onChange(e.shiftKey ? outdent(value, node.id) : indent(value, node.id));
      focus(node.id);
    } else if (e.key === "Backspace" && node.label === "" && depth > 0) {
      e.preventDefault();
      const ids = flatIds(value);
      const prev = ids[ids.indexOf(node.id) - 1];
      onChange(removeNode(value, node.id));
      focus(prev);
    }
  };

  const render = (node: EditNode, depth: number) => (
    <div key={node.id} className={depth > 0 ? "ml-3 border-l border-hairline pl-4 sm:ml-5" : ""}>
      <div
        className={`group flex items-center gap-1.5 py-0.5 ${over?.id === node.id ? (over.where === "before" ? "border-t-2 border-destructive" : "bg-destructive/10") : ""} ${drag === node.id ? "opacity-40" : ""}`}
        onDragOver={(e) => {
          if (!drag || drag === node.id) return;
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          const where = depth === 0 || e.clientY - r.top > r.height / 2 ? "inside" : "before";
          if (over?.id !== node.id || over.where !== where) setOver({ id: node.id, where });
        }}
        onDragLeave={() => setOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          if (drag && over) onChange(moveNode(value, drag, over.id, over.where));
          setDrag(null);
          setOver(null);
        }}
      >
        {depth > 0 && !locked ? (
          <span
            draggable
            onDragStart={(e) => { setDrag(node.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", node.id); }}
            onDragEnd={() => { setDrag(null); setOver(null); }}
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            title="Drag to move. Drop on the top half of a row to place before it, the bottom half to nest inside."
          >
            <GripVertical className="h-4 w-4" />
          </span>
        ) : <span className="w-4" />}
        <span className="nums w-5 shrink-0 text-[11px] smallcaps text-muted-foreground">L{depth}</span>
        <input
          ref={(el) => { if (el) refs.current.set(node.id, el); }}
          disabled={locked}
          value={node.label}
          placeholder={depth === 0 ? "Key question" : "Branch"}
          onChange={(e) => setLabel(node.id, e.target.value)}
          onKeyDown={(e) => onKey(e, node, depth)}
          className={`min-w-0 flex-1 border-b border-transparent bg-transparent px-1.5 py-1 outline-none hover:border-hairline focus:border-destructive disabled:opacity-80 ${depth === 0 ? "text-lg font-semibold" : ""}`}
        />
        {!locked && (
          <div className="flex shrink-0 gap-0.5 opacity-50 group-hover:opacity-100 group-focus-within:opacity-100">
            {depth < MAX_DEPTH && (
              <button type="button" onClick={() => addChild(node.id)} aria-label="Add sub-branch" title="Add sub-branch" className="p-1 hover:text-destructive">
                <Plus className="h-4 w-4" />
              </button>
            )}
            {depth > 0 && (
              <button type="button" onClick={() => onChange(removeNode(value, node.id))} aria-label="Delete branch" title="Delete" className="p-1 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      {node.children.map((c) => render(c, depth + 1))}
    </div>
  );

  return (
    <div className="border border-foreground bg-card p-3">
      {render(value, 0)}
      {!locked && (
        <p className="mt-3 border-t border-hairline pt-2 text-xs italic text-muted-foreground">
          Enter: new branch below · Tab: indent · Shift+Tab: outdent · Backspace on an empty box: delete · drag the handle to move
        </p>
      )}
    </div>
  );
}

export function TreeView({ node, depth = 0, highlight }: { node: SimpleNode | { label: string; children?: SimpleNode[] }; depth?: number; highlight?: ((label: string) => boolean) | undefined }) {
  return (
    <div className={depth > 0 ? "ml-3 border-l border-hairline pl-4" : ""}>
      <div className={`py-0.5 text-sm ${depth === 0 ? "font-semibold" : ""} ${highlight?.(node.label) ? "text-destructive" : ""}`}>{node.label}</div>
      {(node.children ?? []).map((c, i) => (
        <TreeView key={i} node={c} depth={depth + 1} highlight={highlight} />
      ))}
    </div>
  );
}

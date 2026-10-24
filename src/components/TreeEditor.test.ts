import { describe, expect, it } from "vitest";
import { addSibling, indent, outdent, moveNode, removeNode, type EditNode } from "./TreeEditor";

const n = (id: string, children: EditNode[] = []): EditNode => ({ id, label: id, children });
const tree = () => n("root", [n("a", [n("a1")]), n("b")]);
const ids = (t: EditNode): string => `${t.id}(${t.children.map(ids).join(",")})`;

describe("tree editor operations", () => {
  it("Enter adds a sibling directly after", () => expect(ids(addSibling(tree(), "a", n("x")))).toBe("root(a(a1()),x(),b())"));
  it("Tab nests under the previous sibling", () => expect(ids(indent(tree(), "b"))).toBe("root(a(a1(),b()))"));
  it("Tab does nothing on a first child", () => expect(ids(indent(tree(), "a"))).toBe(ids(tree())));
  it("Shift+Tab moves up a level, after its parent", () => expect(ids(outdent(tree(), "a1"))).toBe("root(a(),a1(),b())"));
  it("cannot outdent a first-level branch", () => expect(ids(outdent(tree(), "a"))).toBe(ids(tree())));
  it("delete removes the branch", () => expect(ids(removeNode(tree(), "a"))).toBe("root(b())"));
  it("drag re-parents inside a target", () => expect(ids(moveNode(tree(), "b", "a", "inside"))).toBe("root(a(a1(),b()))"));
  it("drag reorders before a target", () => expect(ids(moveNode(tree(), "b", "a", "before"))).toBe("root(b(),a(a1()))"));
  it("cannot drop a node into its own child", () => expect(ids(moveNode(tree(), "a", "a1", "inside"))).toBe(ids(tree())));
  it("blocks moves deeper than 4 levels", () => {
    const deep = n("root", [n("l1", [n("l2", [n("l3", [n("l4")])])]), n("x", [n("y")])]);
    expect(ids(moveNode(deep, "x", "l3", "inside"))).toBe(ids(deep));
  });
});

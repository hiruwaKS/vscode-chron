// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyCard } from "../src/Provider/utils/doc";
import { Nodes } from "../src/Provider/services/treeview/treeRender/nodes";

void test("update returns the changed current node", () => {
  const nodes = new Nodes();
  const card = emptyCard("2020-1");

  assert.deepEqual(
    nodes.update({ current: { data: card, bookmarked: false } }),
    [nodes.currentNode],
  );
});

void test("update returns no nodes when bookmarks are unchanged", () => {
  const card = emptyCard("2020-1");
  const nodes = new Nodes({ bookmarks: [{ data: card, grey: false }] });

  assert.deepEqual(
    nodes.update({ bookmarks: [{ data: card, grey: false }] }),
    [],
  );
});

void test("update returns the bookmarks node when its size changes", () => {
  const card = emptyCard("2020-1");
  const nodes = new Nodes({ bookmarks: [{ data: card, grey: false }] });

  assert.deepEqual(nodes.update({ bookmarks: [] }), [nodes.bookmarks]);
});

void test("update returns the changed history child", () => {
  const card = emptyCard("2020-1");
  const nodes = new Nodes({ history: [card] });
  const child = nodes.history.children.getAt(0);

  assert.deepEqual(
    nodes.update({ history: [{ ...card, title: "new title" }] }),
    [child],
  );
});

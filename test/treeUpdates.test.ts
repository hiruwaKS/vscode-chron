// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyCard } from "../src/Provider/utils/doc";
import { Nodes } from "../src/Provider/services/treeview/treeRender/nodes";
import type { CurrentNode } from "../src/Provider/services/treeview/treeRender/nodes/CurrentNode";
import { Search } from "../src/Provider/services/treeview/treeRender/nodes/Search";
import type { AttachmentNode } from "../src/Provider/services/treeview/treeRender/nodes/AttachmentNode";

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

void test("current node refreshes its title for the same docid", () => {
  const nodes = new Nodes();
  const card = emptyCard("2020-1");

  nodes.update({
    current: { data: { ...card, title: "fresh title" }, bookmarked: false },
  });
  assert.equal((nodes.currentNode as CurrentNode).data.title, "fresh title");

  nodes.update({
    current: { data: { ...card, title: "newer title" }, bookmarked: false },
  });
  assert.equal((nodes.currentNode as CurrentNode).data.title, "newer title");
});

void test("current node shows not found for a missing document", () => {
  const nodes = new Nodes();
  const card = emptyCard("2020-1");

  nodes.update({
    current: {
      data: { ...card, title: "not found", exists: false },
      bookmarked: false,
    },
  });
  assert.equal((nodes.currentNode as CurrentNode).description, "not found");
});

void test("search, add, delete, and attachments sit above toolkit", () => {
  const nodes = new Nodes();

  assert.equal(nodes.children.getAt(2), nodes.history);
  assert.equal(nodes.children.getAt(3), nodes.search);
  assert.equal(nodes.children.getAt(4), nodes.add);
  assert.equal(nodes.children.getAt(5), nodes.delete);
  assert.equal(nodes.children.getAt(6), nodes.attachments);
  assert.equal(nodes.children.getAt(7), nodes.toolkit);
});

void test("attachments list suffixes without the document extension", () => {
  const nodes = new Nodes({
    attachments: [
      { suffix: ".pdf", fsPath: "/repo/2020-1.pdf" },
      { suffix: ".private.md", fsPath: "/repo/2020-1.private.md" },
    ],
  });

  assert.equal(nodes.attachments.children.getSize(), 2);
  assert.equal(nodes.attachments.children.getAt(0).label, ".pdf");
  assert.equal(
    (nodes.attachments.children.getAt(1) as AttachmentNode).openPath,
    "/repo/2020-1.private.md",
  );
});

void test("search shows a hint until a query is entered", () => {
  const nodes = new Nodes();

  assert.equal(nodes.search.description, Search.NO_QUERY_HINT);
  nodes.update({ search: { query: "fuzz" } });
  assert.equal(nodes.search.description, "fuzz");
  nodes.update({ search: { query: "" } });
  assert.equal(nodes.search.description, Search.NO_QUERY_HINT);
});

void test("search results sit before settings and settings start folded", () => {
  const nodes = new Nodes();
  const search = nodes.search;

  assert.equal(search.children.getAt(0), search.searchResults);
  assert.equal(search.children.getAt(1), search.searchSettings);
  assert.equal(search.searchSettings.foldedDefault, true);
});

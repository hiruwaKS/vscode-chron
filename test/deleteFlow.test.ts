// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { History } from "../src/Provider/services/History";
import { DataSource } from "../src/Provider/services/treeview/DataSource";
import type { UpdateData } from "../src/Provider/services/treeview/DataSource";

void test("history keeps one extra slot and finds the previous docid", () => {
  const history = new History();
  history.items = ["2020-0", "2020-1"];
  history.currentDocid = "2020-1";

  assert.equal(History.MAX_ITEMS, 5);
  assert.equal(history.getPreviousDocid(), "2020-0");
});

void test("history returns no previous docid when current is the only entry", () => {
  const history = new History();
  history.items = ["2020-1"];
  history.currentDocid = "2020-1";

  assert.equal(history.getPreviousDocid(), null);
});

void test("history display hides the first card", () => {
  const source = new DataSource();
  const updates: UpdateData[] = [];
  source.bind((data) => {
    updates.push(data);
  });

  source.onPushHistory({
    items: ["2020-0", "2020-1", "2020-2"],
    cards: new Map(),
  });

  const update = updates[0];
  assert.ok(update);
  assert.ok(update.history);
  assert.deepEqual(
    update.history.map((card) => card.docid),
    ["2020-1", "2020-0"],
  );
});

void test("attachments follow the current document", () => {
  const source = new DataSource();
  const updates: UpdateData[] = [];
  source.bind((data) => {
    updates.push(data);
  });

  source.onPushDocument({
    card: {
      docid: "2020-1",
      title: "Paper",
      type: "L",
      author: "Alice",
      openPath: "/repo/2020-1.md",
      exists: true,
    },
    attachments: [{ suffix: ".pdf", fsPath: "/repo/2020-1.pdf" }],
  });
  assert.deepEqual(updates.at(-1)?.attachments, [
    { suffix: ".pdf", fsPath: "/repo/2020-1.pdf" },
  ]);

  source.onPushNoDoc();
  assert.deepEqual(updates.at(-1)?.attachments, []);
});

void test("missing documents become a not-found current card", () => {
  const source = new DataSource();
  const updates: UpdateData[] = [];
  source.bind((data) => {
    updates.push(data);
  });

  source.onPushMissingDoc("2020-1");

  const card = updates[0]?.current?.data;
  assert.ok(card);
  assert.equal(card.title, "not found");
  assert.equal(card.exists, false);
});

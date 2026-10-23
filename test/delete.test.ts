// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import { Delete } from "../src/Provider/services/Delete";
import { emptyCard } from "../src/Provider/utils/doc";

void test("delete removes documents and opens the previous one", async () => {
  const service = new Delete();
  const deleted: string[] = [];
  let opened: string | null = null;
  const card = { ...emptyCard("2020-1"), exists: true };

  service.bind(
    () => Promise.resolve("yes"),
    () => card,
    () => "/repo",
    () => Promise.resolve(true),
    (fsPath) => {
      deleted.push(fsPath);
      return Promise.resolve("ok");
    },
    () => Promise.resolve("ok"),
    (docid) => {
      opened = docid;
      return Promise.resolve("ok");
    },
    () => "2020-0",
    () => "ok",
  );

  assert.equal(await service.onDeleteAsync(), "ok");
  assert.deepEqual(deleted, [
    join("/repo", "chronicle", "2020", "2020-1.md"),
    join("/repo", "chronicle", "2020", "2020-1.pdf"),
    join("/repo", "chronicle", "2020", "2020-1.txt"),
  ]);
  assert.equal(opened, "2020-0");
});

void test("delete does nothing without yes", async () => {
  const service = new Delete();
  const deleted: string[] = [];

  service.bind(
    () => Promise.resolve("no"),
    () => emptyCard("2020-1"),
    () => "/repo",
    () => Promise.resolve(true),
    (fsPath) => {
      deleted.push(fsPath);
      return Promise.resolve("ok");
    },
    () => Promise.resolve("ok"),
    () => Promise.resolve("ok"),
    () => null,
    () => "ok",
  );

  assert.equal(await service.onDeleteAsync(), "ok");
  assert.deepEqual(deleted, []);
});

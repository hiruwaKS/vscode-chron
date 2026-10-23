// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { addTemplate, nextDocid } from "../src/Provider/services/Add";

void test("nextDocid picks the first free slot", () => {
  assert.equal(
    nextDocid("2000", [
      ["2000-0.md", 1],
      ["2000-2.md", 1],
      ["2000-3.md", 1],
    ]),
    "2000-1",
  );
});

void test("nextDocid starts at zero and ignores other years", () => {
  assert.equal(
    nextDocid("2001", [
      ["2000-0.md", 1],
      ["2001-0.pdf", 1],
      ["2001-1.txt", 1],
    ]),
    "2001-2",
  );
});

void test("add templates start with the title placeholder", () => {
  for (const kind of ["L", "N", "E"] as const) {
    assert.match(addTemplate(kind), /^# the title\n/);
  }
});

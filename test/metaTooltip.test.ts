// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Meta } from "../src/Provider/utils/doc";
import { formatMetaTooltip } from "../src/Provider/utils/metaTooltip";

const meta: Meta = {
  title: "Paper",
  type: "L",
  authors: "Alice",
  venue: "ICSE",
  at: "2020-01-02",
  doi: "10.1000/xyz",
  kp: "fuzzing",
};

void test("formatMetaTooltip keeps metadata on one line", () => {
  assert.equal(
    formatMetaTooltip(meta),
    "Paper | type: L | authors: Alice | venue: ICSE | at: 2020-01-02 | doi: 10.1000/xyz | kp: fuzzing",
  );
});

void test("formatMetaTooltip omits empty fields", () => {
  const empty: Meta = {
    title: "",
    type: "",
    authors: "",
    venue: "",
    at: "",
    doi: "",
    kp: "",
  };

  assert.equal(formatMetaTooltip(empty), "");
});

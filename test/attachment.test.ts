// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { getAttachmentInfo } from "../src/Provider/utils/attachment";

void test("getAttachmentInfo lists suffixes and counts non-md files", () => {
  assert.deepEqual(
    getAttachmentInfo("2020-12", [
      ["2020-12.md", 1],
      ["2020-12.pdf", 1],
      ["2020-12.txt", 1],
      ["2020-12.private.md", 1],
      ["2020-13.md", 1],
    ]),
    {
      attachments: 3,
      pdf: true,
      txt: true,
      suffixes: [".md", ".pdf", ".private.md", ".txt"],
    },
  );
});

void test("getAttachmentInfo handles a document with no siblings", () => {
  assert.deepEqual(getAttachmentInfo("2020-12", [["2020-13.md", 1]]), {
    attachments: 0,
    pdf: false,
    txt: false,
    suffixes: [],
  });
});

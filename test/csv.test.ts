// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, stringifyCsv } from "../src/Provider/utils/csv";

void test("parseCsv parses simple rows", () => {
  assert.deepEqual(parseCsv("a,b\n1,2\n"), [
    ["a", "b"],
    ["1", "2"],
  ]);
  assert.deepEqual(parseCsv(""), []);
});

void test("parseCsv handles quotes and escaped quotes", () => {
  assert.deepEqual(parseCsv('a,"b,c"\n"d""e",f\n'), [
    ["a", "b,c"],
    ['d"e', "f"],
  ]);
});

void test("parseCsv handles embedded newlines and CRLF", () => {
  assert.deepEqual(parseCsv('a,"line1\nline2"\r\n'), [["a", "line1\nline2"]]);
});

void test("parseCsv removes a BOM and skips blank lines", () => {
  assert.deepEqual(parseCsv("\uFEFFa,b\r\n\r\nc,d\r\n"), [
    ["a", "b"],
    ["c", "d"],
  ]);
});

void test("stringifyCsv quotes only when needed", () => {
  assert.equal(
    stringifyCsv([
      ["a", "b"],
      ["1", "2"],
    ]),
    "a,b\n1,2\n",
  );
  assert.equal(stringifyCsv([["a,b", 'c"d', "e\nf"]]), '"a,b","c""d","e\nf"\n');
});

void test("csv round-trips cells with separators, quotes, and newlines", () => {
  const rows = [
    ["docid", "title"],
    ["2020-12", 'Comma, quote " and newline\nhere'],
  ];

  assert.deepEqual(parseCsv(stringifyCsv(rows)), rows);
});

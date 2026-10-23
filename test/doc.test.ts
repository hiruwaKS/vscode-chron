// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { findReverseDocIds } from "../src/Provider/utils/refs";
import { join } from "node:path";
import { test } from "node:test";
import {
  DOCID_PATTERN,
  cardFromMeta,
  findDocIds,
  findHeaderSeparator,
  getDocPath,
  parseDocPath,
  parseHeader,
  parseMeta,
  type Meta,
} from "../src/Provider/utils/doc";
import { getMetaSearchText } from "../src/Provider/utils/searchText";

void test("findDocIds finds standalone document ids", () => {
  const matches = findDocIds("see @2020-12 and @2021-3 mail a@2020-9");

  assert.deepEqual(matches, [
    { docid: "2020-12", start: 4, end: 12 },
    { docid: "2021-3", start: 17, end: 24 },
  ]);
});

void test("findDocIds allows punctuation delimiters", () => {
  const matches = findDocIds(
    " @2020-1) @2020-2] @2020-3} @2020-4\n @2020-5\n@2020-6 @2020-7, @2020-8; @2020-9: @2020-10.",
  );

  assert.deepEqual(
    matches.map(({ docid }) => docid),
    [
      "2020-1",
      "2020-2",
      "2020-3",
      "2020-4",
      "2020-5",
      "2020-7",
      "2020-8",
      "2020-9",
    ],
  );
});

void test("findDocIds rejects ids attached to a word", () => {
  assert.deepEqual(findDocIds("x@2020-12 @@2021-3 @2022-4."), []);
});

void test("findDocIds rejects adjacent document ids", () => {
  assert.deepEqual(
    findDocIds("@2025-13@2025-14@2025-15@2025-16@2025-17@2026-21@2026-22"),
    [],
  );
});

void test("findDocIds still rejects ids attached to a word", () => {
  assert.deepEqual(findDocIds("a@2025-13@2025-14"), []);
});

void test("findReverseDocIds finds reverse references", () => {
  assert.deepEqual(findReverseDocIds(" @R2025-13 @R2025-14"), [
    { docid: "2025-13", start: 1, end: 10 },
    { docid: "2025-14", start: 11, end: 20 },
  ]);
});

void test("findReverseDocIds allows punctuation delimiters", () => {
  const matches = findReverseDocIds(
    " @R2020-1) @R2020-2] @R2020-3} @R2020-4\n @R2020-5\n@R2020-6 @R2020-7, @R2020-8; @R2020-9: @R2020-10.",
  );

  assert.deepEqual(
    matches.map(({ docid }) => docid),
    [
      "2020-1",
      "2020-2",
      "2020-3",
      "2020-4",
      "2020-5",
      "2020-7",
      "2020-8",
      "2020-9",
    ],
  );
});

void test("parseDocPath extracts the docid and year", () => {
  assert.deepEqual(parseDocPath("notes/2020-12.md"), {
    docid: "2020-12",
    year: "2020",
  });
  assert.deepEqual(parseDocPath("2020-12"), {
    docid: "2020-12",
    year: "2020",
  });
  assert.equal(parseDocPath("notes/2020-12.tar.md"), null);
  assert.equal(parseDocPath("notes/index.md"), null);
  assert.equal(parseDocPath(null), null);
  assert.equal(parseDocPath(""), null);
  assert.equal(DOCID_PATTERN.test("2020-12"), true);
});

void test("getDocPath builds the chronicle path", () => {
  assert.equal(
    getDocPath("repo", "2020-12"),
    join("repo", "chronicle", "2020", "2020-12.md"),
  );
});

void test("parseHeader accepts a complete header", () => {
  const header = parseHeader("# Paper\r\nL\r\nAlice\r\n---\r\nbody");

  assert.ok(header);
  assert.equal(header.separatorLine, 3);
  assert.deepEqual(header.lines.slice(0, 4), ["# Paper", "L", "Alice", "---"]);
});

void test("parseHeader rejects incomplete or malformed headers", () => {
  assert.equal(parseHeader("# Paper\nX\nAlice\n---\n"), null);
  assert.equal(parseHeader("Paper\nL\nAlice\n---\n"), null);
  assert.equal(parseHeader("# Paper\nL\nAlice\n"), null);
});

void test("findHeaderSeparator points at the last non-empty header line", () => {
  assert.deepEqual(findHeaderSeparator("# Paper\nL\nAlice\n\n---\n"), {
    line: 2,
    character: 5,
  });
  assert.deepEqual(findHeaderSeparator("# Paper\nL\n---\n"), {
    line: 1,
    character: 1,
  });
  assert.equal(findHeaderSeparator("not a header"), null);
});

void test("parseMeta reads article fields", () => {
  const meta = parseMeta(
    [
      "# Paper",
      "L",
      "Alice",
      "ICSE",
      "at: 2020-01-02",
      "doi: 10.1000/xyz",
      "kp: greybox fuzzing",
      "---",
      "at: ignored",
    ].join("\n"),
  );

  assert.deepEqual(meta, {
    title: "Paper",
    type: "L",
    authors: "Alice",
    venue: "ICSE",
    at: "2020-01-02",
    doi: "10.1000/xyz",
    kp: "greybox fuzzing",
  });
});

void test("parseMeta reads event participants as authors", () => {
  const meta = parseMeta(
    [
      "# Conference",
      "E",
      "ignored author",
      "ignored venue",
      "participants: Bob",
      "---",
    ].join("\n"),
  );

  assert.deepEqual(meta, {
    title: "Conference",
    type: "E",
    authors: "Bob",
    venue: "",
    at: "",
    doi: "",
    kp: "",
  });
});

void test("parseMeta stops at the separator", () => {
  assert.deepEqual(parseMeta("# Paper\nL\nAlice\nICSE\n---\nat: no\n"), {
    title: "Paper",
    type: "L",
    authors: "Alice",
    venue: "ICSE",
    at: "",
    doi: "",
    kp: "",
  });
});

void test("getMetaSearchText covers metadata values but not type or body", () => {
  const text = [
    "# Paper",
    "L",
    "Alice",
    "ICSE",
    "at: 2020-01-02",
    "doi: 10.1000/xyz",
    "kp: greybox fuzzing",
    "ref: @2020-1",
    "---",
    "body secret",
  ].join("\n");

  assert.equal(
    getMetaSearchText(text),
    "Paper\nAlice\nICSE\n2020-01-02\n10.1000/xyz\ngreybox fuzzing\n@2020-1",
  );
});

void test("cardFromMeta normalizes missing fields", () => {
  const meta: Meta = {
    title: "",
    type: "",
    authors: "",
    venue: "",
    at: "",
    doi: "",
    kp: "",
  };

  assert.deepEqual(cardFromMeta(meta, "2020-12", "repo"), {
    docid: "2020-12",
    title: "",
    type: "?",
    author: "",
    openPath: getDocPath("repo", "2020-12"),
    exists: true,
  });
});

void test("cardFromMeta uses venue for N and authors otherwise", () => {
  const meta: Meta = {
    title: "Conference",
    type: "N",
    authors: "ignored",
    venue: "ICSE",
    at: "",
    doi: "",
    kp: "",
  };

  assert.equal(cardFromMeta(meta, "2020-12", "repo").author, "ICSE");
  assert.equal(
    cardFromMeta({ ...meta, type: "E", authors: "Bob" }, "2020-12", "repo")
      .author,
    "Bob",
  );
});

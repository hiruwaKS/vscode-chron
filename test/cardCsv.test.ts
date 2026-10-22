// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CARD_HEADER,
  cardFromCells,
  cardToCells,
  compareDocid,
  emptyCard,
  headerIndexes,
  normalizeCard,
  sameCard,
  type Card,
} from "../src/Provider/utils/cardCsv";
import { parseCsv, stringifyCsv } from "../src/Provider/utils/csv";

const card: Card = {
  docid: "2020-12",
  title: "Paper",
  type: "L",
  author: "Alice",
  openPath: "notes/2020-12.md",
  exists: true,
};

void test("compareDocid compares numeric docids by value", () => {
  assert.ok(compareDocid("2020-2", "2020-10") < 0);
  assert.ok(compareDocid("2020-10", "2020-2") > 0);
  assert.equal(compareDocid("2020-1", "2020-1"), 0);
  assert.ok(compareDocid("a", "b") < 0);
});

void test("normalizeCard copies a card and rejects empty docids", () => {
  const normalized = normalizeCard(card);

  assert.notStrictEqual(normalized, card);
  assert.deepEqual(normalized, card);
  assert.equal(normalizeCard(null), null);
  assert.equal(normalizeCard({ ...card, docid: "" }), null);
});

void test("sameCard compares fields but not the docid", () => {
  assert.equal(sameCard(card, { ...card }), true);
  assert.equal(sameCard(null, card), false);
  assert.equal(sameCard(card, null), false);
  assert.equal(sameCard(card, { ...card, title: "Other" }), false);
});

void test("headerIndexes lowercases header names", () => {
  const indexes = headerIndexes(["DOCID", "Title", "OpenPath"]);

  assert.equal(indexes.get("docid"), 0);
  assert.equal(indexes.get("title"), 1);
  assert.equal(indexes.get("openpath"), 2);
});

void test("cardFromCells reads and normalizes card fields", () => {
  const indexes = headerIndexes([...CARD_HEADER]);
  const cells = ["2020-12", "Paper", "L", "Alice", "notes/2020-12.md", "1"];

  assert.deepEqual(cardFromCells(cells, indexes), card);
});

void test("cardFromCells handles missing optional fields", () => {
  const indexes = headerIndexes([...CARD_HEADER]);

  assert.deepEqual(cardFromCells(["2020-12", "Only title"], indexes), {
    docid: "2020-12",
    title: "Only title",
    type: "?",
    author: "",
    openPath: null,
    exists: null,
  });
  assert.equal(cardFromCells(["2020-12", "", "", "", "", ""], indexes), null);
  assert.equal(cardFromCells(["", "Title"], indexes), null);
});

void test("cardToCells serializes empty and missing cards", () => {
  assert.deepEqual(cardToCells("2020-12", null), [
    "2020-12",
    "",
    "?",
    "",
    "",
    "",
  ]);
  assert.deepEqual(
    cardToCells("2020-12", { ...emptyCard("2020-12"), exists: false }),
    ["2020-12", "", "?", "", "", "0"],
  );
});

void test("cardCsv round-trips through headerIndexes and cardFromCells", () => {
  const rows = [CARD_HEADER, cardToCells(card.docid, card)];
  const parsed = parseCsv(stringifyCsv(rows));
  const header = parsed[0];
  const cells = parsed[1];

  assert.ok(header);
  assert.ok(cells);
  assert.deepEqual(cardFromCells(cells, headerIndexes(header)), card);
});

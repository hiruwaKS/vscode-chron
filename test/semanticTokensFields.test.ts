// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addFieldTokens,
  addToken,
  collectHeaderTokens,
  type HeaderToken,
} from "../src/Provider/services/SemanticTokens/fields";
import { createTokenIndexes } from "../src/Provider/services/SemanticTokens/tokens";

const tokenTypes = createTokenIndexes();

void test("addToken ignores empty ranges", () => {
  const tokens: HeaderToken[] = [];

  addToken(tokens, 1, 5, 5, tokenTypes.string);
  assert.deepEqual(tokens, []);

  addToken(tokens, 1, 5, 8, tokenTypes.string);
  assert.deepEqual(tokens, [
    { line: 1, start: 5, length: 3, type: tokenTypes.string },
  ]);
});

void test("addFieldTokens finds DOIs, docids, and dates", () => {
  const tokens: HeaderToken[] = [];
  const value = " 10.1000/xyz @2020-123 2021-05-06";

  addFieldTokens(tokens, 2, value, 4, tokenTypes);

  assert.deepEqual(tokens, [
    { line: 2, start: 5, length: 11, type: tokenTypes.string },
    { line: 2, start: 17, length: 9, type: tokenTypes.variable },
    { line: 2, start: 27, length: 10, type: tokenTypes.number },
  ]);
});

void test("collectHeaderTokens tokenizes a complete header", () => {
  const text = [
    "# Paper",
    "L",
    "at: 2020-01-02",
    "doi: 10.1000/xyz",
    "kp: greybox fuzzing",
    "ref: @2020-123",
    "endtime: 2021-05-06",
    "participants: Alice",
    "---",
    "body",
  ].join("\n");

  assert.deepEqual(collectHeaderTokens(text, tokenTypes), [
    { line: 0, start: 0, length: 7, type: tokenTypes.type },
    { line: 1, start: 0, length: 1, type: tokenTypes.keyword },
    { line: 2, start: 0, length: 2, type: tokenTypes.property },
    { line: 2, start: 4, length: 10, type: tokenTypes.number },
    { line: 3, start: 0, length: 3, type: tokenTypes.property },
    { line: 3, start: 5, length: 11, type: tokenTypes.string },
    { line: 4, start: 0, length: 2, type: tokenTypes.property },
    { line: 5, start: 0, length: 3, type: tokenTypes.property },
    { line: 5, start: 5, length: 9, type: tokenTypes.variable },
    { line: 6, start: 0, length: 7, type: tokenTypes.property },
    { line: 6, start: 9, length: 10, type: tokenTypes.number },
    { line: 7, start: 0, length: 12, type: tokenTypes.property },
    { line: 8, start: 0, length: 3, type: tokenTypes.comment },
  ]);
});

void test("collectHeaderTokens returns no tokens without a header", () => {
  assert.deepEqual(collectHeaderTokens("body", tokenTypes), []);
  assert.deepEqual(collectHeaderTokens("# Paper\nX\n---\n", tokenTypes), []);
});

void test("collectHeaderTokens tokenizes positional L and N fields", () => {
  assert.deepEqual(
    collectHeaderTokens("# Paper\nL\nAlice\nICSE\n---\n", tokenTypes),
    [
      { line: 0, start: 0, length: 7, type: tokenTypes.type },
      { line: 1, start: 0, length: 1, type: tokenTypes.keyword },
      { line: 2, start: 0, length: 5, type: tokenTypes.string },
      { line: 3, start: 0, length: 4, type: tokenTypes.string },
      { line: 4, start: 0, length: 3, type: tokenTypes.comment },
    ],
  );

  assert.deepEqual(
    collectHeaderTokens("# Note\nN\n2026-10-09\nAlice\n---\n", tokenTypes),
    [
      { line: 0, start: 0, length: 6, type: tokenTypes.type },
      { line: 1, start: 0, length: 1, type: tokenTypes.keyword },
      { line: 2, start: 0, length: 10, type: tokenTypes.number },
      { line: 3, start: 0, length: 5, type: tokenTypes.string },
      { line: 4, start: 0, length: 3, type: tokenTypes.comment },
    ],
  );
});

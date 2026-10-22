// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { findDocIds, parseHeader } from "../utils/doc";
import type { TokenIndexes } from "./tokens";

export interface HeaderToken {
  line: number;
  start: number;
  length: number;
  type: number;
}

export const FIELD_PATTERN = /^(at|doi|ref|endtime|participants):/;
export const DOI_PATTERN = /\b10\.\d{4,9}\/[-._;()/:a-z0-9]+/gi;
export const DATE_PATTERN = /\b\d{4}-\d{2}-\d{2}\b/g;

export function addToken(
  tokens: HeaderToken[],
  line: number,
  start: number,
  end: number,
  type: number,
): void {
  if (end > start) {
    tokens.push({ line, start, length: end - start, type });
  }
}

export function addFieldTokens(
  tokens: HeaderToken[],
  line: number,
  value: string,
  offset: number,
  tokenTypes: TokenIndexes,
): void {
  for (const match of value.matchAll(DOI_PATTERN)) {
    addToken(
      tokens,
      line,
      offset + match.index,
      offset + match.index + match[0].length,
      tokenTypes.string,
    );
  }
  for (const { start, end } of findDocIds(value)) {
    addToken(tokens, line, offset + start, offset + end, tokenTypes.variable);
  }
  for (const match of value.matchAll(DATE_PATTERN)) {
    addToken(
      tokens,
      line,
      offset + match.index,
      offset + match.index + match[0].length,
      tokenTypes.number,
    );
  }
}

export function collectHeaderTokens(
  text: string,
  tokenTypes: TokenIndexes,
): HeaderToken[] {
  const header = parseHeader(text);
  if (header === null) {
    return [];
  }

  const { lines, separatorLine } = header;
  const tokens: HeaderToken[] = [];
  const firstLine = lines[0] ?? "";
  addToken(tokens, 0, 0, firstLine.length, tokenTypes.type);

  const secondLine = lines[1] ?? "";
  const type = secondLine.trim();
  const typeStart = secondLine.length - secondLine.trimStart().length;
  addToken(tokens, 1, typeStart, typeStart + type.length, tokenTypes.keyword);

  for (let line = 2; line < separatorLine; line += 1) {
    const lineText = lines[line] ?? "";
    const field = FIELD_PATTERN.exec(lineText);
    if (field) {
      const keyEnd = field[0].length - 1;
      addToken(tokens, line, 0, keyEnd, tokenTypes.property);
      addFieldTokens(
        tokens,
        line,
        lineText.slice(field[0].length),
        field[0].length,
        tokenTypes,
      );
      continue;
    }

    if (line !== 2 && line !== 3) {
      continue;
    }

    const value = lineText.trim();
    if (value === "") {
      continue;
    }
    const start = lineText.length - lineText.trimStart().length;
    addToken(
      tokens,
      line,
      start,
      start + value.length,
      line === 2 && type === "N" ? tokenTypes.number : tokenTypes.string,
    );
  }

  const separatorText = lines[separatorLine] ?? "";
  addToken(tokens, separatorLine, 0, separatorText.length, tokenTypes.comment);

  tokens.sort((a, b) => a.line - b.line || a.start - b.start);
  const result: HeaderToken[] = [];
  for (const token of tokens) {
    const previous = result[result.length - 1];
    if (
      previous?.line === token.line &&
      previous.start + previous.length > token.start
    ) {
      continue;
    }
    result.push(token);
  }
  return result;
}

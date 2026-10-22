// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import {
  DOCID_FIELD,
  cardFromCells,
  headerIndexes,
  normalizeCard,
  sameCard,
} from "../utils/cardCsv";
import type { Card } from "../utils/cardCsv";
import { DOCID_PATTERN } from "../utils/doc";
import { parseCsv, stringifyCsv } from "../utils/csv";
import { path } from "../utils/lang";
import type {
  FileExists,
  GetRepoRoot,
  ReadTextFile,
  WriteTextFile,
} from "./types";

export function updateCard(cards: Map<string, Card>, data: Card): boolean {
  const card = normalizeCard(data);
  if (card === null || sameCard(cards.get(card.docid) ?? null, card)) {
    return false;
  }
  cards.set(card.docid, card);
  return true;
}

export function parseCards(
  content: string,
  visit: (docid: string, card: Card | null) => void,
): void {
  let indexes: Map<string, number> | null = null;

  for (const cells of parseCsv(content)) {
    const first = cells[0] ?? "";
    if (first.toLowerCase() === DOCID_FIELD) {
      indexes = headerIndexes(cells);
      continue;
    }
    const index = indexes?.get(DOCID_FIELD);
    const docid = index === undefined ? first : (cells[index] ?? first);
    if (!DOCID_PATTERN.test(docid)) {
      continue;
    }
    visit(docid, indexes === null ? null : cardFromCells(cells, indexes));
  }
}

export function resolveDumpPath(
  getRepoRoot: GetRepoRoot,
  fileName: string,
): string | null {
  const root = getRepoRoot();
  return root ? path.join(root, "tmp", fileName) : null;
}

export async function loadCardsFileAsync(
  fsPath: string | null,
  fileExists: FileExists,
  readTextFile: ReadTextFile,
): Promise<string | null> {
  if (fsPath === null || !(await fileExists(fsPath))) {
    return null;
  }
  return readTextFile(fsPath);
}

export async function dumpCardsFileAsync(
  fsPath: string | null,
  writeTextFile: WriteTextFile,
  rows: (readonly string[])[],
): Promise<void> {
  if (fsPath === null) {
    return;
  }
  await writeTextFile(fsPath, stringifyCsv(rows));
}

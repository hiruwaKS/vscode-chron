// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { DocCard, emptyCard } from "./doc";
import type { Card } from "./doc";

export function buildHistoryCards(
  items: readonly string[],
  cards: ReadonlyMap<string, Card>,
  bookmarkCards: ReadonlyMap<string, Card>,
  currentCards: ReadonlyMap<string, Card>,
): Card[] {
  return items
    .slice()
    .reverse()
    .slice(1)
    .map(
      (docid) =>
        currentCards.get(docid) ??
        cards.get(docid) ??
        bookmarkCards.get(docid) ??
        new DocCard({ ...emptyCard(docid), exists: false }),
    );
}

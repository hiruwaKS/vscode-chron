// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { DocCard } from "../utils/doc";
import { emptyCard } from "../utils/cardCsv";
import { assert } from "../utils/lang";
import type { Card } from "../utils/cardCsv";

export type BookmarkItem = [docid: string, grey: boolean];

export interface BookmarkData {
  items: BookmarkItem[];
  cards: Map<string, Card>;
}

export interface HistoryData {
  items: string[];
  cards: Map<string, Card>;
}

export interface DocumentPayload {
  card: Card;
}

export interface CurrentNode {
  data: Card | null;
  bookmarked: boolean;
}

export interface BookmarkNode {
  data: Card;
  grey: boolean;
}

export interface UpdateData {
  current?: CurrentNode;
  bookmarks?: BookmarkNode[];
  history?: Card[];
  toolkit?: {
    update: boolean;
  };
}

export type UpdateRoot = (data: UpdateData) => void;

export class DataSource extends Service {
  private updateRoot: UpdateRoot | null = null;
  currentCard: Card | null = null;
  cards = new Map<string, Card>();
  bookmarkData: BookmarkData | null = null;
  historyData: HistoryData | null = null;
  logging = false;

  onPushDocument(payload: DocumentPayload | null): UpdateData | string {
    this.log?.("TRACE", "DataSource.onPushDocument");
    const card = payload?.card;
    if (card === undefined || card.docid === "") {
      return "ok";
    }

    this.currentCard = card;
    this.cards = new Map([[card.docid, new DocCard(card)]]);
    const bookmarked = (this.bookmarkData?.items ?? []).some(
      ([docid, grey]) => docid === card.docid && !grey,
    );
    const data: UpdateData = { current: { data: card, bookmarked } };
    this.requireBound(this.updateRoot, "DataSource.updateRoot")(data);
    return data;
  }

  onPushNoDoc(): string {
    this.log?.("TRACE", "DataSource.onPushNoDoc");
    this.currentCard = null;
    this.cards.clear();
    this.requireBound(
      this.updateRoot,
      "DataSource.updateRoot",
    )({ current: { data: null, bookmarked: false } });
    return "ok";
  }

  onPushBookmarks(bookmarkData: BookmarkData | null): BookmarkNode[] {
    this.log?.("TRACE", "DataSource.onPushBookmarks");
    this.bookmarkData = bookmarkData;
    const items = bookmarkData?.items ?? [];
    const bookmarkCards = bookmarkData?.cards ?? new Map<string, Card>();
    const bookmarks = items.map(([docid, grey]) => ({
      data:
        this.cards.get(docid) ??
        bookmarkCards.get(docid) ??
        new DocCard({ ...emptyCard(docid), exists: false }),
      grey,
    }));
    const data: UpdateData = { bookmarks };
    if (this.currentCard !== null) {
      const docid = this.currentCard.docid;
      data.current = {
        data: this.currentCard,
        bookmarked: items.some(([id, grey]) => id === docid && !grey),
      };
    }
    this.requireBound(this.updateRoot, "DataSource.updateRoot")(data);
    return bookmarks;
  }

  onPushLoggingState(logging: boolean): boolean {
    this.log?.("TRACE", "DataSource.onPushLoggingState");
    this.logging = logging;
    this.requireBound(
      this.updateRoot,
      "DataSource.updateRoot",
    )({ toolkit: { update: this.logging } });
    return this.logging;
  }

  onPushHistory(historyData: HistoryData | null): Card[] {
    this.log?.("TRACE", "DataSource.onPushHistory");
    this.historyData = historyData;
    const items = historyData?.items ?? [];
    const historyCards = historyData?.cards ?? new Map<string, Card>();
    const bookmarkCards = this.bookmarkData?.cards ?? new Map<string, Card>();
    const history = items
      .slice()
      .reverse()
      .map(
        (docid) =>
          this.cards.get(docid) ??
          historyCards.get(docid) ??
          bookmarkCards.get(docid) ??
          new DocCard({ ...emptyCard(docid), exists: false }),
      );
    this.requireBound(this.updateRoot, "DataSource.updateRoot")({ history });
    return history;
  }

  bind(updateRoot: UpdateRoot): void {
    assert.ok(this.updateRoot === null, "DataSource is already bound");
    this.updateRoot = updateRoot;
  }
}

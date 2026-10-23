// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { DOCID_PATTERN, DocCard } from "../utils/doc";
import { emptyCard } from "../utils/cardCsv";
import { buildHistoryCards } from "../utils/historyCards";
import { assert } from "../utils/lang";
import type { Card } from "../utils/cardCsv";
import type { AttachmentFile } from "../utils/doc";

export type {
  BookmarkData,
  BookmarkNode,
  DocumentPayload,
  HistoryData,
  SearchState,
  UpdateData,
  UpdateRoot,
} from "./dataSourceTypes";
import type {
  BookmarkData,
  BookmarkNode,
  DocumentPayload,
  HistoryData,
  SearchState,
  UpdateData,
  UpdateRoot,
} from "./dataSourceTypes";

export class DataSource extends Service {
  private updateRoot: UpdateRoot | null = null;
  currentCard: Card | null = null;
  cards = new Map<string, Card>();
  attachments: AttachmentFile[] = [];
  bookmarkData: BookmarkData | null = null;
  historyData: HistoryData | null = null;
  logging = false;
  searchState: SearchState = {
    query: "",
    caseSensitive: false,
    results: [],
  };

  onPushDocument(payload: DocumentPayload | null): UpdateData | string {
    this.log?.("TRACE", "DataSource.onPushDocument");
    const card = payload?.card;
    if (card === undefined || card.docid === "") {
      return "ok";
    }

    const attachments = payload?.attachments ?? [];
    this.currentCard = card;
    this.cards = new Map([[card.docid, new DocCard(card)]]);
    this.attachments = attachments;
    const bookmarked = (this.bookmarkData?.items ?? []).some(
      ([docid, grey]) => docid === card.docid && !grey,
    );
    const data: UpdateData = {
      current: { data: card, bookmarked },
      attachments,
    };
    this.requireBound(this.updateRoot, "DataSource.updateRoot")(data);
    return data;
  }

  onPushNoDoc(): string {
    this.log?.("TRACE", "DataSource.onPushNoDoc");
    this.currentCard = null;
    this.cards.clear();
    this.attachments = [];
    this.requireBound(
      this.updateRoot,
      "DataSource.updateRoot",
    )({ current: { data: null, bookmarked: false }, attachments: [] });
    return "ok";
  }

  onPushMissingDoc(docid: string): UpdateData | string {
    this.log?.("TRACE", "DataSource.onPushMissingDoc", docid);
    if (!DOCID_PATTERN.test(docid)) {
      return "ok";
    }
    return this.onPushDocument({
      card: { ...emptyCard(docid), title: "not found", exists: false },
      attachments: [],
    });
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

  onPushSearchState(update: Partial<SearchState>): SearchState {
    this.log?.("TRACE", "DataSource.onPushSearchState");
    this.searchState = { ...this.searchState, ...update };
    this.requireBound(
      this.updateRoot,
      "DataSource.updateRoot",
    )({ search: this.searchState });
    return this.searchState;
  }

  onPushSearchResults(results: Card[]): Card[] {
    this.log?.("TRACE", "DataSource.onPushSearchResults");
    this.searchState = { ...this.searchState, results };
    this.requireBound(
      this.updateRoot,
      "DataSource.updateRoot",
    )({ search: this.searchState });
    return results;
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
    const history = buildHistoryCards(
      items,
      historyCards,
      bookmarkCards,
      this.cards,
    );
    this.requireBound(this.updateRoot, "DataSource.updateRoot")({ history });
    return history;
  }

  bind(updateRoot: UpdateRoot): void {
    assert.ok(this.updateRoot === null, "DataSource is already bound");
    this.updateRoot = updateRoot;
  }
}

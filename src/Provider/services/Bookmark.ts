// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { assert, fireAndForget } from "../utils/lang";
import {
  CARD_HEADER,
  cardToCells,
  compareDocid,
  emptyCard,
} from "../utils/cardCsv";
import type { Card } from "../utils/cardCsv";
import {
  dumpCardsFileAsync,
  loadCardsFileAsync,
  parseCards,
  resolveDumpPath,
  updateCard,
} from "./bookmarksAndHistory";
import type {
  BookmarkItem,
  FileExists,
  GetRepoRoot,
  PushBookmarks,
  ReadTextFile,
  WriteTextFile,
} from "./types";

export class Bookmark extends Service {
  dumpPath: string | null;
  items: BookmarkItem[] = [];
  cards = new Map<string, Card>();
  private readTextFile: ReadTextFile | null = null;
  private writeTextFile: WriteTextFile | null = null;
  private fileExists: FileExists | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private pushBookmarks: PushBookmarks | null = null;
  private loadPromise: Promise<string | Error> | null = null;

  constructor(dumpPath: string | null = null) {
    super();
    this.dumpPath = dumpPath;
  }

  init(): string {
    this.log?.("TRACE", "Bookmark.init");
    const load = this.loadAsync();
    fireAndForget(() => load);
    return "ok";
  }

  async onToggleBookmarkAsync(
    docid: string,
    card: Card | null = null,
  ): Promise<string> {
    this.log?.("TRACE", "Bookmark.onToggleBookmarkAsync", docid);
    await this.loadPromise;
    const index = this.items.findIndex(([id]) => id === docid);
    if (index >= 0) {
      this.items.splice(index, 1);
    } else {
      this.items.push([docid, false]);
      this.items.sort((a, b) => compareDocid(a[0], b[0]));
      this.setCard(card ?? emptyCard(docid));
    }
    await Promise.all([this.emitBookmarksAsync(), this.dumpAsync()]);
    return "ok";
  }

  async loadAsync(): Promise<string | Error> {
    if (this.loadPromise !== null) {
      return await this.loadPromise;
    }
    const promise = this.loadContentAsync();
    this.loadPromise = promise;
    try {
      return await promise;
    } finally {
      if (this.loadPromise === promise) {
        this.loadPromise = null;
      }
    }
  }

  private async loadContentAsync(): Promise<string | Error> {
    this.items = [];
    this.cards.clear();
    const fsPath = this.getDumpPath();
    try {
      const content = await loadCardsFileAsync(
        fsPath,
        this.requireBound(this.fileExists, "Bookmark.fileExists"),
        this.requireBound(this.readTextFile, "Bookmark.readTextFile"),
      );
      if (content === null) {
        return "ok";
      }
      this.parse(content);
      return "ok";
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    } finally {
      await this.emitBookmarksAsync();
    }
  }

  getDumpPath(): string | null {
    if (this.dumpPath !== null && this.dumpPath !== "") {
      return this.dumpPath;
    }
    return resolveDumpPath(
      this.requireBound(this.getRepoRoot, "Bookmark.getRepoRoot"),
      "bookmarks.csv",
    );
  }

  setCard(data: Card): boolean {
    return updateCard(this.cards, data);
  }

  async emitBookmarksAsync(): Promise<void> {
    await this.requireBound(
      this.pushBookmarks,
      "Bookmark.pushBookmarks",
    )({ items: this.items, cards: this.cards });
  }

  parse(content: string): string {
    const seen = new Set<string>();
    parseCards(content, (docid, card) => {
      if (seen.has(docid)) {
        return;
      }
      seen.add(docid);
      this.items.push([docid, false]);
      if (card !== null) {
        this.cards.set(docid, card);
      }
    });

    this.items.sort((a, b) => compareDocid(a[0], b[0]));
    return "ok";
  }

  async dumpAsync(): Promise<string | Error> {
    const fsPath = this.getDumpPath();
    const rows: (readonly string[])[] = [CARD_HEADER];
    for (const [docid, isGrey] of this.items) {
      if (isGrey) {
        continue;
      }
      rows.push(cardToCells(docid, this.cards.get(docid) ?? null));
    }
    try {
      await dumpCardsFileAsync(
        fsPath,
        this.requireBound(this.writeTextFile, "Bookmark.writeTextFile"),
        rows,
      );
      return "ok";
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  bind(
    readTextFile: ReadTextFile,
    writeTextFile: WriteTextFile,
    fileExists: FileExists,
    getRepoRoot: GetRepoRoot,
    pushBookmarks: PushBookmarks,
  ): void {
    assert.ok(
      this.readTextFile === null &&
        this.writeTextFile === null &&
        this.fileExists === null &&
        this.getRepoRoot === null &&
        this.pushBookmarks === null,
      "Bookmark is already bound",
    );
    this.readTextFile = readTextFile;
    this.writeTextFile = writeTextFile;
    this.fileExists = fileExists;
    this.getRepoRoot = getRepoRoot;
    this.pushBookmarks = pushBookmarks;
  }
}

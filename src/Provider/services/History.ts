// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { assert, fireAndForget } from "../utils/lang";
import { CARD_HEADER, cardToCells, emptyCard } from "../utils/cardCsv";
import type { Card } from "../utils/cardCsv";
import { DOCID_PATTERN } from "../utils/doc";
import {
  dumpCardsFileAsync,
  loadCardsFileAsync,
  parseCards,
  resolveDumpPath,
  updateCard,
} from "./bookmarksAndHistory";
import type {
  FileExists,
  GetRepoRoot,
  PushHistory,
  ReadTextFile,
  UseDocumentPayload,
  WriteTextFile,
} from "./types";

export class History extends Service {
  static MAX_ITEMS = 5;

  items: string[] = [];
  cards = new Map<string, Card>();
  private readTextFile: ReadTextFile | null = null;
  private writeTextFile: WriteTextFile | null = null;
  private fileExists: FileExists | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private pushHistory: PushHistory | null = null;
  currentDocid: string | null = null;
  currentCard: Card | null = null;
  private loadPromise: Promise<string | Error> | null = null;

  init(): string {
    this.log?.("TRACE", "History.init");
    const load = this.loadAsync();
    fireAndForget(() => load);
    return "ok";
  }

  async onUseDocumentAsync(
    payload: UseDocumentPayload | null,
  ): Promise<string> {
    this.log?.("TRACE", "History.onUseDocumentAsync");
    if (payload === null || payload.card.docid === "") {
      return "ok";
    }
    await this.loadPromise;

    this.currentDocid = payload.card.docid;
    this.currentCard = payload.card;
    this.push(payload.card.docid);
    this.setCard(payload.card);
    const [dumpResult] = await Promise.all([
      this.dumpAsync(),
      this.emitHistoryAsync(),
    ]);
    return typeof dumpResult === "string" ? dumpResult : "ok";
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
        this.requireBound(this.fileExists, "History.fileExists"),
        this.requireBound(this.readTextFile, "History.readTextFile"),
      );
      if (content === null) {
        return "ok";
      }
      this.parse(content);
      return "ok";
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    } finally {
      this.restoreCurrent();
      await this.emitHistoryAsync();
    }
  }

  restoreCurrent(): void {
    if (this.currentDocid === null) {
      return;
    }
    this.push(this.currentDocid);
    this.setCard(this.currentCard ?? emptyCard(this.currentDocid));
  }

  getPreviousDocid(): string | null {
    return (
      this.items
        .slice()
        .reverse()
        .find((docid) => docid !== this.currentDocid) ?? null
    );
  }

  getDumpPath(): string | null {
    return resolveDumpPath(
      this.requireBound(this.getRepoRoot, "History.getRepoRoot"),
      "history.csv",
    );
  }

  push(docid: string): boolean {
    if (!DOCID_PATTERN.test(docid)) {
      return false;
    }
    const index = this.items.indexOf(docid);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    this.items.push(docid);
    while (this.items.length > History.MAX_ITEMS) {
      const removed = this.items.shift();
      if (removed !== undefined) {
        this.cards.delete(removed);
      }
    }
    return true;
  }

  setCard(data: Card): boolean {
    return updateCard(this.cards, data);
  }

  parse(content: string): void {
    parseCards(content, (docid, card) => {
      this.push(docid);
      if (card !== null) {
        this.cards.set(docid, card);
      }
    });
  }

  async dumpAsync(): Promise<string | Error> {
    const fsPath = this.getDumpPath();
    const rows: (readonly string[])[] = [CARD_HEADER];
    for (const docid of this.items) {
      rows.push(cardToCells(docid, this.cards.get(docid) ?? null));
    }
    try {
      await dumpCardsFileAsync(
        fsPath,
        this.requireBound(this.writeTextFile, "History.writeTextFile"),
        rows,
      );
      return "ok";
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  async emitHistoryAsync(): Promise<void> {
    await this.requireBound(
      this.pushHistory,
      "History.pushHistory",
    )({ items: this.items, cards: this.cards });
  }

  bind(
    readTextFile: ReadTextFile,
    writeTextFile: WriteTextFile,
    fileExists: FileExists,
    getRepoRoot: GetRepoRoot,
    pushHistory: PushHistory,
  ): void {
    assert.ok(
      this.readTextFile === null &&
        this.writeTextFile === null &&
        this.fileExists === null &&
        this.getRepoRoot === null &&
        this.pushHistory === null,
      "History is already bound",
    );
    this.readTextFile = readTextFile;
    this.writeTextFile = writeTextFile;
    this.fileExists = fileExists;
    this.getRepoRoot = getRepoRoot;
    this.pushHistory = pushHistory;
  }
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { Card } from "../utils/cardCsv";

export interface HistoryState {
  items: string[];
  cards: Map<string, Card>;
}
export interface UseDocumentPayload {
  card: Card;
}
export type PushHistory = (state: HistoryState) => unknown;
export type BookmarkItem = [docid: string, isGrey: boolean];
export interface BookmarkState {
  items: BookmarkItem[];
  cards: Map<string, Card>;
}
export type ReadTextFile = (fsPath: string) => Promise<string>;
export type WriteTextFile = (
  fsPath: string,
  content: string,
) => Promise<string>;
export type FileExists = (fsPath: string) => Promise<boolean>;
export type GetRepoRoot = () => string;
export type PushBookmarks = (state: BookmarkState) => unknown;

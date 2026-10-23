// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { AttachmentFile, Card } from "../utils/doc";

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
  attachments: AttachmentFile[];
}

export interface CurrentNode {
  data: Card | null;
  bookmarked: boolean;
}

export interface BookmarkNode {
  data: Card;
  grey: boolean;
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  results: Card[];
}

export interface UpdateData {
  current?: CurrentNode;
  bookmarks?: BookmarkNode[];
  history?: Card[];
  toolkit?: {
    update: boolean;
  };
  search?: Partial<SearchState>;
  attachments?: AttachmentFile[];
}

export type UpdateRoot = (data: UpdateData) => void;

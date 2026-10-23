// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { AttachmentFile, Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import { Add } from "./Add";
import { Attachments } from "./Attachments";
import type { BookmarkEntry } from "./Bookmarks";
import { Bookmarks } from "./Bookmarks";
import { CurrentNode } from "./CurrentNode";
import { Delete } from "./Delete";
import { History } from "./History";
import { Search } from "./Search";
import type { SearchNodeState } from "./Search";
import { Toolkit } from "./toolkit";

export interface CurrentState {
  data: Card | null;
  bookmarked: boolean;
}

export interface ToolkitState {
  update?: boolean;
}

export interface NodesOptions {
  current?: CurrentState;
  bookmarks?: BookmarkEntry[] | null;
  history?: Card[] | null;
  logging?: boolean;
  toolkit?: ToolkitState;
  search?: SearchNodeState;
  attachments?: AttachmentFile[] | null;
}

export interface NodesUpdate {
  current?: CurrentState;
  bookmarks?: BookmarkEntry[] | null;
  history?: Card[] | null;
  toolkit?: ToolkitState;
  search?: SearchNodeState;
  attachments?: AttachmentFile[] | null;
}

export class Nodes extends TreeNode {
  currentNode: TreeNode;
  bookmarks: TreeNode;
  history: TreeNode;
  search: Search;
  add: Add;
  delete: Delete;
  attachments: Attachments;
  toolkit: TreeNode;

  constructor(options: NodesOptions = {}) {
    const current = options.current ?? { data: null, bookmarked: false };
    const logging = options.logging ?? options.toolkit?.update ?? false;

    super({
      label: "chronicle",
      tooltip: "the doc you open",
      iconId: "folder-opened",
      childrenSize: 8,
      collapsible: true,
    });

    this.currentNode = this.children.getAt(0);
    this.bookmarks = this.children.getAt(1);
    this.history = this.children.getAt(2);
    this.search = this.children.getAt(3) as Search;
    this.add = this.children.getAt(4) as Add;
    this.delete = this.children.getAt(5) as Delete;
    this.attachments = this.children.getAt(6) as Attachments;
    this.toolkit = this.children.getAt(7);

    this.currentNode.update({
      data: current.data,
      bookmarked: current.bookmarked,
    });
    this.bookmarks.update(options.bookmarks ?? null);
    this.history.update(options.history ?? null);
    this.search.update(options.search ?? {});
    this.attachments.update(options.attachments ?? null);
    this.toolkit.update({ update: logging });
  }

  override createChild(index: number): TreeNode {
    switch (index) {
      case 0:
        return new CurrentNode();
      case 1:
        return new Bookmarks();
      case 2:
        return new History();
      case 3:
        return new Search();
      case 4:
        return new Add();
      case 5:
        return new Delete();
      case 6:
        return new Attachments();
      case 7:
        return new Toolkit();
      default:
        throw new Error(`unknown child index: ${String(index)}`);
    }
  }

  override update(data: NodesUpdate): TreeNode[] {
    const changed = new Set<TreeNode>();
    if (data.current !== undefined) {
      for (const node of this.currentNode.update({
        data: data.current.data,
        bookmarked: data.current.bookmarked,
      })) {
        changed.add(node);
      }
    }
    if (data.bookmarks !== undefined) {
      for (const node of this.bookmarks.update(data.bookmarks)) {
        changed.add(node);
      }
    }
    if (data.history !== undefined) {
      for (const node of this.history.update(data.history)) {
        changed.add(node);
      }
    }
    if (data.search !== undefined) {
      for (const node of this.search.update(data.search)) {
        changed.add(node);
      }
    }
    if (data.attachments !== undefined) {
      for (const node of this.attachments.update(data.attachments)) {
        changed.add(node);
      }
    }
    if (data.toolkit !== undefined) {
      for (const node of this.toolkit.update(data.toolkit)) {
        changed.add(node);
      }
    }
    return [...changed];
  }
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import { DocNode } from "./DocNode";

export interface BookmarkEntry {
  data: Card;
  grey: boolean;
}

export interface BookmarksOptions {
  data?: BookmarkEntry[] | null;
}

export class Bookmarks extends TreeNode {
  constructor(options: BookmarksOptions = {}) {
    const items = options.data ?? [];

    super({
      label: "bookmarks",
      description: String(items.length),
      tooltip: `bookmarks (${String(items.length)})`,
      iconId: "bookmark",
      childrenSize: items.length,
      collapsible: true,
      foldedDefault: items.length >= 5,
    });

    this.update(items);
  }

  override createChild(_index: number): DocNode {
    return new DocNode();
  }

  override update(data: BookmarkEntry[] | null): TreeNode[] {
    const items = data ?? [];
    const previousSize = this.children.getSize();
    const previousFolded = this.foldedDefault;

    this.updateChildrenSize(items.length);
    const changed: TreeNode[] = [];
    items.forEach(({ data: card, grey }, index) => {
      const child = this.children.getAt(index);
      changed.push(
        ...child.update(
          grey
            ? { data: card, iconId: "bookmark", color: "disabledForeground" }
            : { data: card, color: null },
        ),
      );
    });
    this.description = String(items.length);
    this.tooltip = `bookmarks (${String(items.length)})`;
    this.foldedDefault = items.length >= 5;
    if (
      previousSize !== items.length ||
      previousFolded !== this.foldedDefault
    ) {
      return [this];
    }
    return changed;
  }
}

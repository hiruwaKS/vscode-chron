// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import { DocNode } from "./DocNode";

export interface HistoryOptions {
  data?: Card[] | null;
}

export class History extends TreeNode {
  constructor(options: HistoryOptions = {}) {
    const cards = options.data ?? [];

    super({
      label: "history",
      description: String(cards.length),
      tooltip: `history (${String(cards.length)})`,
      iconId: "folder",
      childrenSize: cards.length,
      collapsible: true,
      foldedDefault: cards.length >= 5,
    });

    this.update(cards);
  }

  override createChild(_index: number): DocNode {
    return new DocNode();
  }

  override update(data: Card[] | null): TreeNode[] {
    const cards = data ?? [];
    const previousSize = this.children.getSize();
    const previousFolded = this.foldedDefault;

    this.updateChildrenSize(cards.length);
    const changed: TreeNode[] = [];
    cards.forEach((card, index) => {
      changed.push(...this.children.getAt(index).update(card));
    });
    this.description = String(cards.length);
    this.tooltip = `history (${String(cards.length)})`;
    this.foldedDefault = cards.length >= 5;
    if (
      previousSize !== cards.length ||
      previousFolded !== this.foldedDefault
    ) {
      return [this];
    }
    return changed;
  }
}

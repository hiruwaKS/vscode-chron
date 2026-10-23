// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import { DocNode } from "./DocNode";

export interface SearchResultsOptions {
  data?: Card[] | null;
}

export class SearchResults extends TreeNode {
  constructor(options: SearchResultsOptions = {}) {
    const cards = options.data ?? [];

    super({
      label: "results",
      description: String(cards.length),
      tooltip: `results (${String(cards.length)})`,
      iconId: "search",
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
    this.tooltip = `results (${String(cards.length)})`;
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

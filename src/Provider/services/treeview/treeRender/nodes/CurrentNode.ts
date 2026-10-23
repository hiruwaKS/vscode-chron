// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { DocCard, emptyCard } from "../utils/doc";
import { TOGGLE_BOOKMARK } from "../utils/actions";
import { DocNode } from "./DocNode";
import type { TreeNode } from "../utils/TreeNode";
import type { DocNodeInput, DocNodeOptions } from "./DocNode";
import { cardDataFromInput, isDocNodeUpdate } from "./DocNode";

export interface CurrentNodeOptions extends DocNodeOptions {
  bookmarked?: boolean;
}

export class CurrentNode extends DocNode {
  static NO_DOC_LABEL = "No document open";

  bookmarked: boolean;

  constructor(options: CurrentNodeOptions = {}) {
    const card = options.data ?? options.card ?? emptyCard("");
    const data = card instanceof DocCard ? card : new DocCard(card);

    super({
      ...options,
      data,
      contextValue: "currentDoc",
      bookmarkable: data.docid !== "",
      action: TOGGLE_BOOKMARK,
    });

    this.bookmarked = options.bookmarked ?? false;
    if (data.docid === "") {
      this.showNoDoc();
    }
  }

  showNoDoc(): void {
    this.label = CurrentNode.NO_DOC_LABEL;
    this.description = null;
    this.tooltip = null;
    this.iconId = null;
    this.bookmarkable = false;
    this.color = null;
  }

  override update(input: DocNodeInput): TreeNode[] {
    const options = isDocNodeUpdate(input) ? input : null;
    const card = cardDataFromInput(input);
    const next =
      card instanceof DocCard ? card : new DocCard(card ?? emptyCard(""));
    this.data = next;
    if (next.docid !== "") {
      super.update(next);
      this.bookmarkable = true;
    } else {
      this.showNoDoc();
    }
    if (options?.bookmarked !== undefined) {
      this.bookmarked = options.bookmarked;
    }
    if (this.data.docid === "") {
      this.color = null;
    }
    return [this];
  }
}

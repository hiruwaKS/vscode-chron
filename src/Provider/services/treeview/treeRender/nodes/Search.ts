// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { OPEN_SEARCH } from "../utils/actions";
import type { Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import { SearchResults } from "./SearchResults";
import { SearchSettings } from "./SearchSettings";

export interface SearchNodeState {
  query?: string;
  caseSensitive?: boolean;
  results?: Card[];
}

export class Search extends TreeNode {
  static NO_QUERY_HINT = "clicked here";

  searchSettings: SearchSettings;
  searchResults: SearchResults;
  query = "";

  constructor(options: SearchNodeState = {}) {
    super({
      label: "search",
      tooltip: "click to search",
      description: Search.NO_QUERY_HINT,
      iconId: "search",
      childrenSize: 2,
      collapsible: true,
      action: OPEN_SEARCH,
    });

    this.searchResults = this.children.getAt(0) as SearchResults;
    this.searchSettings = this.children.getAt(1) as SearchSettings;
    this.update(options);
  }

  override createChild(index: number): TreeNode {
    switch (index) {
      case 0:
        return new SearchResults();
      case 1:
        return new SearchSettings();
      default:
        throw new Error(`unknown child index: ${String(index)}`);
    }
  }

  override update(data: SearchNodeState): TreeNode[] {
    const changed = new Set<TreeNode>();
    if (data.query !== undefined) {
      this.query = data.query;
      this.description = data.query === "" ? Search.NO_QUERY_HINT : data.query;
      this.tooltip =
        data.query === "" ? "click to search" : `search: ${data.query}`;
      changed.add(this);
    }
    if (data.results !== undefined) {
      for (const node of this.searchResults.update(data.results)) {
        changed.add(node);
      }
    }
    if (data.caseSensitive !== undefined) {
      for (const node of this.searchSettings.update(data.caseSensitive)) {
        changed.add(node);
      }
    }
    return [...changed];
  }
}

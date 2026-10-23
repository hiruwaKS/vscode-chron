// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TreeNode } from "../utils/TreeNode";
import { CaseSensitive } from "./CaseSensitive";

export interface SearchSettingsOptions {
  caseSensitive?: boolean;
}

export class SearchSettings extends TreeNode {
  caseSensitiveNode: CaseSensitive;

  constructor(options: SearchSettingsOptions = {}) {
    super({
      label: "settings",
      iconId: "settings-gear",
      childrenSize: 1,
      collapsible: true,
      foldedDefault: true,
    });

    this.caseSensitiveNode = this.children.getAt(0) as CaseSensitive;
    this.caseSensitiveNode.update(options.caseSensitive ?? false);
  }

  override createChild(_index: number): CaseSensitive {
    return new CaseSensitive();
  }

  override update(caseSensitive: boolean): TreeNode[] {
    return this.caseSensitiveNode.update(caseSensitive);
  }
}

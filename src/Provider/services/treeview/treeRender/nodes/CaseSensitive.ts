// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TOGGLE_CASE_SENSITIVE } from "../utils/actions";
import { TreeNode } from "../utils/TreeNode";

export interface CaseSensitiveOptions {
  caseSensitive?: boolean;
}

export class CaseSensitive extends TreeNode {
  caseSensitive: boolean;

  constructor(options: CaseSensitiveOptions = {}) {
    super({
      label: "cs",
      iconId: "case-sensitive",
      action: TOGGLE_CASE_SENSITIVE,
    });
    this.caseSensitive = options.caseSensitive ?? false;
    this.applyPresentation();
  }

  override update(caseSensitive: boolean): TreeNode[] {
    if (this.caseSensitive === caseSensitive) {
      return [];
    }
    this.caseSensitive = caseSensitive;
    this.applyPresentation();
    return [this];
  }

  private applyPresentation(): void {
    this.description = this.caseSensitive ? "on" : "off";
    this.tooltip = `Case sensitive: ${this.caseSensitive ? "on" : "off"}`;
    this.color = this.caseSensitive ? "charts.green" : null;
  }
}

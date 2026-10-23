// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TreeNode } from "../utils/TreeNode";

export class AddTarget extends TreeNode {
  constructor(label: string, iconId: string, action: string) {
    super({
      label,
      tooltip: `add ${label}`,
      iconId,
      action,
    });
  }

  override update(): TreeNode[] {
    return [];
  }
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { DELETE_DOC } from "../utils/actions";
import { TreeNode } from "../utils/TreeNode";

export class Delete extends TreeNode {
  constructor() {
    super({
      label: "delete",
      tooltip: "delete the current document",
      iconId: "remove",
      color: "charts.red",
      action: DELETE_DOC,
    });
  }

  override update(): TreeNode[] {
    return [];
  }
}

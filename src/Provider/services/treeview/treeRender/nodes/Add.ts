// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { ADD_EVENT, ADD_LITERATURE, ADD_NOTE } from "../utils/actions";
import { TreeNode } from "../utils/TreeNode";
import { AddTarget } from "./AddTarget";

export class Add extends TreeNode {
  literature: TreeNode;
  note: TreeNode;
  event: TreeNode;

  constructor() {
    super({
      label: "add",
      tooltip: "add a document",
      iconId: "add",
      childrenSize: 3,
      collapsible: true,
    });

    this.literature = this.children.getAt(0);
    this.note = this.children.getAt(1);
    this.event = this.children.getAt(2);
  }

  override createChild(index: number): TreeNode {
    switch (index) {
      case 0:
        return new AddTarget("literature", "L", ADD_LITERATURE);
      case 1:
        return new AddTarget("note", "N", ADD_NOTE);
      case 2:
        return new AddTarget("event", "E", ADD_EVENT);
      default:
        throw new Error(`unknown child index: ${String(index)}`);
    }
  }

  override update(): TreeNode[] {
    return [];
  }
}

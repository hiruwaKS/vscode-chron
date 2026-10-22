// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../../utils/lang";
import type { TreeNode } from "./TreeNode";

export class LazyTreeNodeList<TNode extends TreeNode = TreeNode> {
  createNode: (index: number) => TNode;
  items: TNode[] = [];
  size = 0;

  constructor(createNode: (index: number) => TNode) {
    assert.ok(
      typeof createNode === "function",
      "createNode must be a function",
    );
    this.createNode = createNode;
  }

  getSize(): number {
    return this.size;
  }

  setSize(size: number): this {
    assert.ok(
      Number.isInteger(size) && size >= 0,
      "size must be a non-negative integer",
    );

    while (this.items.length < size) {
      const node = this.createNode(this.items.length);
      assert.ok(typeof node === "object", "createNode must return a node");
      this.items.push(node);
    }

    this.size = size;
    return this;
  }

  updateAt(index: number, data: unknown): this {
    this.getAt(index).update(data);
    return this;
  }

  getAt(index: number): TNode {
    assert.ok(Number.isInteger(index), "index must be an integer");
    assert.ok(index >= 0 && index < this.size, "index out of bounds");
    const node = this.items[index];
    assert.ok(node !== undefined, "node is missing");
    return node;
  }

  getView(): TNode[] {
    return this.items.slice(0, this.size);
  }
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../../utils/lang";
import { LazyTreeNodeList } from "./LazyTreeNodeList";

export interface TreeNodeOptions {
  label?: string | number;
  tooltip?: string | null;
  iconId?: string | null;
  description?: string | null;
  color?: string | null;
  contextValue?: string;
  childrenSize?: number;
  collapsible?: boolean;
  foldedDefault?: boolean;
  bookmarkable?: boolean;
  action?: string | null;
}

export class TreeNode<TData = unknown> {
  static treeNodeIdCnt = 0;

  id: number;
  label: string;
  tooltip: string | null;
  iconId: string | null;
  description: string | null;
  color: string | null;
  contextValue: string;
  collapsible: boolean;
  foldedDefault: boolean;
  bookmarkable: boolean;
  action: string | null;
  children: LazyTreeNodeList;

  constructor(options: TreeNodeOptions = {}) {
    const {
      label = "",
      tooltip = null,
      iconId = null,
      description = null,
      color = null,
      contextValue = "chronicleNode",
      childrenSize = 0,
      collapsible = false,
      foldedDefault = false,
      bookmarkable = false,
      action = null,
    } = options;

    this.id = TreeNode.treeNodeIdCnt;
    TreeNode.treeNodeIdCnt += 1;
    this.label = String(label);
    this.tooltip = tooltip === "" || tooltip === null ? null : tooltip;
    this.iconId = iconId === "" || iconId === null ? null : iconId;
    this.description =
      description === "" || description === null ? null : description;
    this.color = color === "" || color === null ? null : color;
    this.contextValue = contextValue;
    this.collapsible = collapsible;
    this.foldedDefault = foldedDefault;
    this.bookmarkable = bookmarkable;
    this.action = action === "" || action === null ? null : action;

    this.children = new LazyTreeNodeList((index) => this.createChild(index));
    this.updateChildrenSize(childrenSize);
    assert.ok(
      this.collapsible || !this.foldedDefault,
      "non-collapsible nodes cannot have foldedDefault",
    );
  }

  getId(): number {
    return this.id;
  }

  createChild(_index: number): TreeNode {
    throw new Error("createChild() must be implemented");
  }

  updateChildrenSize(size: number): this {
    assert.ok(
      this.collapsible || size === 0,
      "non-collapsible nodes must have no children",
    );
    this.children.setSize(size);
    return this;
  }

  updateChildrenAt(index: number, data: unknown): this {
    this.children.updateAt(index, data);
    return this;
  }

  update(_data: TData): TreeNode[] {
    throw new Error("update() must be implemented");
  }
}

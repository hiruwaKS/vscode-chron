// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../utils/lang";
import * as vscode from "../utils/vscode";
import { Service } from "../utils/Service";
import { LazyAsset } from "./LazyAsset";
import { Icons } from "./Icons";
import { Nodes } from "./nodes";
import type { NodesUpdate } from "./nodes";
import { BOOKMARK_ENABLED, DECORATION_SCHEME } from "./constants";
import type { TreeNode } from "./utils/TreeNode";

export type { TreeNode } from "./utils/TreeNode";

export interface TreeRenderOptions {
  extensionUri?: vscode.Uri;
  leftClickCommand?: string | null;
}

export class TreeRender extends Service {
  changeEmitter = new vscode.EventEmitter<TreeNode | TreeNode[] | undefined>();
  leftClickCommand: string | null;
  root: Nodes | null = null;
  decorationCache = new Map<string, vscode.FileDecoration>();
  onDidChangeTreeData = this.changeEmitter.event;

  constructor(options: TreeRenderOptions = {}) {
    super();
    if (options.extensionUri !== undefined) {
      LazyAsset.setExtensionUri(options.extensionUri);
    }
    this.leftClickCommand = options.leftClickCommand ?? null;
  }

  refresh(element?: TreeNode | TreeNode[]): void {
    this.changeEmitter.fire(element);
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }

  onChildren(node: TreeNode | null): TreeNode[] {
    if (node !== null) {
      return node.children.getView();
    }
    if (this.root === null) {
      return [];
    }
    assert.ok(!Array.isArray(this.root), "root must not be an array");
    return this.root.collapsible ? this.root.children.getView() : [this.root];
  }

  onTreeItem(node: TreeNode): vscode.TreeItem {
    let collapsibleState: vscode.TreeItemCollapsibleState =
      vscode.TreeItemCollapsibleState.None;

    if (node.collapsible) {
      collapsibleState = node.foldedDefault
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.Expanded;
    }

    const item = new vscode.TreeItem(node.label, collapsibleState);
    item.id = String(node.id);
    item.contextValue = node.bookmarkable
      ? `${node.contextValue}.${BOOKMARK_ENABLED}`
      : node.contextValue;
    if (node.tooltip !== null) {
      item.tooltip = node.tooltip;
    }
    if (node.description !== null) {
      item.description = node.description;
    }
    if (node.iconId !== null) {
      const icon = Icons.getIcon(node.iconId);
      if (icon !== null) {
        item.iconPath = icon;
      }
    }
    if (node.color !== null) {
      item.resourceUri = vscode.Uri.parse(
        `${DECORATION_SCHEME}://node/${encodeURIComponent(
          String(node.id),
        )}?color=${encodeURIComponent(node.color)}`,
      );
    }
    if (!node.collapsible && this.leftClickCommand !== null) {
      item.command = {
        command: this.leftClickCommand,
        title: "leftclick",
        arguments: [node],
      };
    }
    return item;
  }

  onFileDecoration(
    uri: vscode.Uri | undefined,
  ): vscode.FileDecoration | undefined {
    if (uri?.scheme !== DECORATION_SCHEME) {
      return undefined;
    }
    const color = new URLSearchParams(uri.query).get("color");
    if (color === null) {
      return undefined;
    }
    let decoration = this.decorationCache.get(color);
    if (decoration === undefined) {
      decoration = new vscode.FileDecoration(
        undefined,
        undefined,
        new vscode.ThemeColor(color),
      );
      this.decorationCache.set(color, decoration);
    }
    return decoration;
  }

  onUpdateRoot(data: NodesUpdate): string {
    this.log?.("TRACE", "TreeRender.onUpdateRoot");
    const root = this.root;
    if (!(root instanceof Nodes)) {
      this.root = new Nodes(data);
      this.refresh();
      return "ok";
    }
    const changed = root.update(data);
    if (changed.length > 0) {
      this.refresh(changed);
    }
    return "ok";
  }
}

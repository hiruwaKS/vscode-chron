// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type * as vscode from "../utils/vscode";
import type { TreeRender } from "./services";
import type { TreeNode } from "./services";

export class TreeViewAdapter
  implements vscode.TreeDataProvider<TreeNode>, vscode.FileDecorationProvider
{
  treeRender: TreeRender;
  onDidChangeTreeData: TreeRender["onDidChangeTreeData"];

  constructor(treeRender: TreeRender) {
    this.treeRender = treeRender;
    this.onDidChangeTreeData = treeRender.onDidChangeTreeData;
  }

  getChildren(node?: TreeNode): TreeNode[] {
    return this.treeRender.onChildren(node ?? null);
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    return this.treeRender.onTreeItem(node);
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    return this.treeRender.onFileDecoration(uri);
  }
}

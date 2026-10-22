// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TreeNode } from "../common";
import { LoggingState } from "./LoggingState";

export interface ToolkitOptions {
  logging?: boolean;
}

export interface ToolkitUpdate {
  update?: boolean;
}

export class Toolkit extends TreeNode {
  loggingState: TreeNode;

  constructor(options: ToolkitOptions = {}) {
    super({
      label: "toolkit",
      tooltip: "toolkit",
      iconId: "tools",
      color: "charts.purple",
      childrenSize: 1,
      collapsible: true,
    });

    this.loggingState = this.children.getAt(0);
    this.loggingState.update(options.logging ?? false);
  }

  override createChild(_index: number): LoggingState {
    return new LoggingState();
  }

  override update(data: ToolkitUpdate): TreeNode[] {
    return this.loggingState.update(data.update === true);
  }
}

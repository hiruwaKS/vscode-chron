// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { OPEN_ATTACHMENT } from "../utils/actions";
import { TreeNode } from "../utils/TreeNode";
import type { AttachmentFile } from "../utils/doc";

export class AttachmentNode extends TreeNode {
  openPath: string | null = null;

  constructor() {
    super({
      iconId: "file",
      contextValue: "attachmentFile",
      action: OPEN_ATTACHMENT,
    });
  }

  override update(file: AttachmentFile): TreeNode[] {
    const changed = this.label !== file.suffix || this.openPath !== file.fsPath;
    this.label = file.suffix;
    this.tooltip = file.suffix;
    this.openPath = file.fsPath;
    return changed ? [this] : [];
  }
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TreeNode } from "../utils/TreeNode";
import type { AttachmentFile } from "../utils/doc";
import { AttachmentNode } from "./AttachmentNode";

export interface AttachmentsOptions {
  data?: AttachmentFile[] | null;
}

export class Attachments extends TreeNode {
  constructor(options: AttachmentsOptions = {}) {
    const items = options.data ?? [];

    super({
      label: "attachments",
      description: String(items.length),
      tooltip: `attachments (${String(items.length)})`,
      iconId: "paperclip",
      childrenSize: items.length,
      collapsible: true,
    });

    this.update(items);
  }

  override createChild(_index: number): AttachmentNode {
    return new AttachmentNode();
  }

  override update(data: AttachmentFile[] | null): TreeNode[] {
    const items = data ?? [];
    const previousSize = this.children.getSize();

    this.updateChildrenSize(items.length);
    const changed: TreeNode[] = [];
    items.forEach((file, index) => {
      changed.push(...this.children.getAt(index).update(file));
    });
    this.description = String(items.length);
    this.tooltip = `attachments (${String(items.length)})`;
    if (previousSize !== items.length) {
      return [this];
    }
    return changed;
  }
}

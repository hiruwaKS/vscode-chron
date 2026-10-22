// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { DocCard, emptyCard, sameCard } from "../utils/doc";
import type { Card } from "../utils/doc";
import { TreeNode } from "../utils/TreeNode";
import type { TreeNodeOptions } from "../utils/TreeNode";

export interface DocNodeOptions extends TreeNodeOptions {
  data?: Card | DocCard | null;
  card?: Card | DocCard | null;
}

export interface DocNodeUpdate {
  data: Card | DocCard | null;
  iconId?: string | null;
  color?: string | null;
  bookmarked?: boolean;
}

export type DocNodeInput = Card | DocCard | DocNodeUpdate | null;

export function isDocNodeUpdate(input: DocNodeInput): input is DocNodeUpdate {
  return (
    input !== null &&
    !(input instanceof DocCard) &&
    Object.prototype.hasOwnProperty.call(input, "data")
  );
}

export function cardDataFromInput(input: DocNodeInput): Card | DocCard | null {
  if (input === null) {
    return null;
  }
  if (input instanceof DocCard) {
    return input;
  }
  if ("data" in input) {
    return input.data;
  }
  return input;
}

export class DocNode extends TreeNode {
  static TYPE_ICONS = new Set(["L", "E", "N"]);

  data: DocCard;

  constructor(options: DocNodeOptions = {}) {
    const card = options.data ?? options.card ?? emptyCard("");
    const data = card instanceof DocCard ? card : new DocCard(card);

    super({
      ...options,
      label: data.docid,
      description: data.title === "" ? null : data.title,
      tooltip: [data.docid, data.title, data.author].filter(Boolean).join("\n"),
      iconId: options.iconId ?? DocNode.getIconId(data),
      bookmarkable: options.bookmarkable ?? true,
      collapsible: false,
    });

    this.data = data;
  }

  override update(input: DocNodeInput): TreeNode[] {
    const options = isDocNodeUpdate(input) ? input : null;
    const card = cardDataFromInput(input);
    const next =
      card instanceof DocCard ? card : new DocCard(card ?? emptyCard(""));
    const iconId = options?.iconId ?? DocNode.getIconId(next);
    const color = options?.color ?? null;
    const changed =
      this.data.docid !== next.docid ||
      !sameCard(this.data, next) ||
      this.iconId !== iconId ||
      this.color !== color;

    this.data = next;
    this.label = next.docid;
    this.description = next.title === "" ? null : next.title;
    this.tooltip = [next.docid, next.title, next.author]
      .filter(Boolean)
      .join("\n");
    this.iconId = iconId;
    this.color = color;
    return changed ? [this] : [];
  }

  static getIconId(data: Card): string {
    return data.exists === false
      ? "warning"
      : DocNode.TYPE_ICONS.has(data.type)
        ? data.type
        : "note";
  }
}

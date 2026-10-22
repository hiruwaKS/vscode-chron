// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../utils/vscode";
import { findHeaderSeparator, parseDocPath } from "../utils/doc";
import { Service } from "../utils/Service";
import { assert } from "../utils/lang";
import type { AttachmentInfo } from "../utils/attachment";

export type GetHeaderInfo = (docid: string) => Promise<AttachmentInfo | null>;

export class InlayHints extends Service {
  private getHeaderInfo: GetHeaderInfo | null = null;

  async onProvideInlayHintsAsync(
    document: vscode.TextDocument,
    range: vscode.Range,
    token?: vscode.CancellationToken,
  ): Promise<vscode.InlayHint[]> {
    this.log?.("TRACE", "InlayHints.onProvideInlayHintsAsync");
    const header = findHeaderSeparator(document.getText());
    if (header === null) {
      return [];
    }

    const position = new vscode.Position(header.line, header.character);
    if (!range.contains(position)) {
      return [];
    }

    const parsed = parseDocPath(document.uri.fsPath);
    if (parsed === null) {
      return [];
    }

    const info = await this.requireBound(
      this.getHeaderInfo,
      "InlayHints.getHeaderInfo",
    )(parsed.docid);
    if (token?.isCancellationRequested || info === null) {
      return [];
    }
    return [InlayHints.makeHeaderHint(position, info)];
  }

  static makeHeaderHint(
    position: vscode.Position,
    info: AttachmentInfo,
  ): vscode.InlayHint {
    const label =
      `attachments: ${String(info.attachments)} | ` +
      `pdf: ${info.pdf ? "yes" : "no"} | ` +
      `txt: ${info.txt ? "yes" : "no"}`;
    const hint = new vscode.InlayHint(position, label);
    hint.paddingLeft = true;
    hint.tooltip = info.suffixes.join(", ");
    return hint;
  }

  bind(getHeaderInfo: GetHeaderInfo): void {
    assert.ok(this.getHeaderInfo === null, "InlayHints is already bound");
    this.getHeaderInfo = getHeaderInfo;
  }
}

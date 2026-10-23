// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert, fireAndForget, path } from "../utils/lang";
import * as vscode from "../utils/vscode";
import { Service } from "../utils/Service";
import {
  DOCID_PATTERN,
  findDocIds,
  getDocPath,
  parseDocPath,
  parseMeta,
} from "../utils/doc";
import type { Meta } from "../utils/doc";
import { formatMetaTooltip } from "../utils/metaTooltip";
import { findReverseDocIds } from "../utils/refs";
import { getAttachmentInfo } from "../utils/attachment";
import { References } from "./References";
import type { DocReference } from "./References";
import type { AttachmentInfo, DirectoryEntry } from "../utils/attachment";

export type GetRepoRoot = () => string;
export type ReadDirectory = (
  fsPath: string,
) => Promise<readonly DirectoryEntry[]>;
export type ReadTextFile = (fsPath: string) => Promise<string>;
export type FileExists = (fsPath: string) => Promise<boolean>;

export interface DocTarget {
  path: string | null;
  exists: boolean;
  meta: Meta | null;
}

export class DocInfo extends Service {
  private getRepoRoot: GetRepoRoot | null = null;
  private readDirectory: ReadDirectory | null = null;
  private readTextFile: ReadTextFile | null = null;
  private fileExists: FileExists | null = null;
  private references = new References();

  async onGetDocTargetAsync(docid: string): Promise<DocTarget> {
    this.log?.("TRACE", "DocInfo.onGetDocTargetAsync", docid);
    const repoRoot = this.requireBound(
      this.getRepoRoot,
      "DocInfo.getRepoRoot",
    )();
    if (repoRoot === "" || !DOCID_PATTERN.test(docid)) {
      return { path: null, exists: false, meta: null };
    }

    const targetPath = getDocPath(repoRoot, docid);
    const fileExists = this.requireBound(this.fileExists, "DocInfo.fileExists");
    const exists = await fileExists(targetPath);
    if (!exists) {
      return { path: targetPath, exists, meta: null };
    }

    try {
      const content = await this.requireBound(
        this.readTextFile,
        "DocInfo.readTextFile",
      )(targetPath);
      return { path: targetPath, exists, meta: parseMeta(content) };
    } catch {
      return { path: targetPath, exists, meta: null };
    }
  }

  async onGetHeaderInfoAsync(docid: string): Promise<AttachmentInfo | null> {
    this.log?.("TRACE", "DocInfo.onGetHeaderInfoAsync", docid);
    const repoRoot = this.requireBound(
      this.getRepoRoot,
      "DocInfo.getRepoRoot",
    )();
    if (repoRoot === "" || !DOCID_PATTERN.test(docid)) {
      return null;
    }

    const targetPath = getDocPath(repoRoot, docid);
    const entries = await this.requireBound(
      this.readDirectory,
      "DocInfo.readDirectory",
    )(path.dirname(targetPath));
    return getAttachmentInfo(docid, entries);
  }

  async onProvideDocumentLinksAsync(
    document: vscode.TextDocument,
    token?: vscode.CancellationToken,
  ): Promise<vscode.DocumentLink[]> {
    this.log?.("TRACE", "DocInfo.onProvideDocumentLinksAsync");
    if (parseDocPath(document.uri.fsPath) === null) {
      this.references.clear(document.uri);
      return [];
    }
    const text = document.getText();
    const references: DocReference[] = [
      ...findDocIds(text).map((match) => ({ ...match, reverse: false })),
      ...findReverseDocIds(text).map((match) => ({ ...match, reverse: true })),
    ].sort((left, right) => left.start - right.start);
    if (token?.isCancellationRequested) {
      return [];
    }

    fireAndForget(() =>
      this.references.validateAsync(document, references, token),
    );

    const docids = [...new Set(references.map(({ docid }) => docid))];
    const targets = new Map<string, DocTarget>();
    const resolveTargetAsync = async (docid: string): Promise<void> => {
      if (token?.isCancellationRequested) {
        return;
      }
      targets.set(docid, await this.onGetDocTargetAsync(docid));
    };
    await Promise.all(docids.map(resolveTargetAsync));
    if (token?.isCancellationRequested) {
      return [];
    }

    const links: vscode.DocumentLink[] = [];
    for (const { docid, start, end } of references) {
      const target = targets.get(docid);
      if (target?.exists === true && target.path !== null) {
        const tooltip =
          target.meta === null ? undefined : formatMetaTooltip(target.meta);
        links.push(
          DocInfo.makeDocumentLink(document, start, end, target.path, tooltip),
        );
      }
    }
    return links;
  }

  static makeDocumentLink(
    document: vscode.TextDocument,
    start: number,
    end: number,
    targetPath: string,
    tooltip: string | undefined,
  ): vscode.DocumentLink {
    const link = new vscode.DocumentLink(
      new vscode.Range(document.positionAt(start), document.positionAt(end)),
      vscode.Uri.file(targetPath),
    );
    if (tooltip !== undefined && tooltip !== "") {
      link.tooltip = tooltip;
    }
    return link;
  }

  dispose(): void {
    this.references.dispose();
  }

  bind(
    getRepoRoot: GetRepoRoot,
    readDirectory: ReadDirectory,
    readTextFile: ReadTextFile,
    fileExists: FileExists,
  ): void {
    assert.ok(
      this.getRepoRoot === null &&
        this.readDirectory === null &&
        this.readTextFile === null &&
        this.fileExists === null,
      "DocInfo is already bound",
    );
    this.getRepoRoot = getRepoRoot;
    this.readDirectory = readDirectory;
    this.readTextFile = readTextFile;
    this.fileExists = fileExists;
    this.references.bind(getRepoRoot, readTextFile);
  }
}

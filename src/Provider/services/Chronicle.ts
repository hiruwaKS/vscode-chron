// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { assert, fireAndForget, path } from "../utils/lang";
import { cardFromMeta, getDocPath, parseMeta } from "../utils/doc";
import type { AttachmentFile, Meta } from "../utils/doc";
import { getAttachmentInfo, getFileInfo } from "../utils/attachment";
import type { Card } from "../utils/cardCsv";

export type GetCurrentFile = () => string | null;
export type GetRepoRoot = () => string;
export type ReadTextFile = (fsPath: string) => Promise<string>;
export type ReadDirectory = (
  fsPath: string,
) => Promise<readonly [string, number][]>;
export interface DocumentPayload {
  card: Card;
  attachments: AttachmentFile[];
}
export type PushDocument = (payload: DocumentPayload) => void;
export type PushNoDoc = () => void;
export type UseDocument = (payload: DocumentPayload) => unknown;

export class Chronicle extends Service {
  private getCurrentFile: GetCurrentFile | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private readTextFile: ReadTextFile | null = null;
  private readDirectory: ReadDirectory | null = null;
  private pushDocument: PushDocument | null = null;
  private pushNoDoc: PushNoDoc | null = null;
  private useDocument: UseDocument | null = null;
  requestId = 0;

  init(): string {
    this.log?.("TRACE", "Chronicle.init");
    fireAndForget(() => this.loadCurrentAsync());
    return "ok";
  }

  async onLoadCurrentAsync(): Promise<string> {
    this.log?.("TRACE", "Chronicle.onLoadCurrentAsync");
    return await this.loadCurrentAsync();
  }

  async loadCurrentAsync(): Promise<string> {
    const requestId = this.requestId + 1;
    this.requestId = requestId;
    const getCurrentFile = this.requireBound(
      this.getCurrentFile,
      "Chronicle.getCurrentFile",
    );
    const fileInfo = getFileInfo(getCurrentFile() ?? null);
    if (fileInfo?.docid == null) {
      this.requireBound(this.pushNoDoc, "Chronicle.pushNoDoc")();
      return "ok";
    }
    return await this.loadByIdAsync(fileInfo.docid, requestId);
  }

  async loadByIdAsync(docid: string, requestId: number): Promise<string> {
    const repoRoot = this.requireBound(
      this.getRepoRoot,
      "Chronicle.getRepoRoot",
    )();
    const meta = await this.fetchMetaAsync(docid, repoRoot);
    if (requestId !== this.requestId) {
      return "ok";
    }
    if (meta === null) {
      this.requireBound(this.pushNoDoc, "Chronicle.pushNoDoc")();
      return "ok";
    }

    const payload: DocumentPayload = {
      card: cardFromMeta(meta, docid, repoRoot),
      attachments: await this.fetchAttachmentsAsync(docid, repoRoot),
    };
    this.requireBound(this.pushDocument, "Chronicle.pushDocument")(payload);
    await this.requireBound(this.useDocument, "Chronicle.useDocument")(payload);
    return "ok";
  }

  async fetchMetaAsync(docid: string, repoRoot: string): Promise<Meta | null> {
    const readTextFile = this.requireBound(
      this.readTextFile,
      "Chronicle.readTextFile",
    );
    try {
      const content = await readTextFile(getDocPath(repoRoot, docid));
      return parseMeta(content);
    } catch {
      return null;
    }
  }

  async fetchAttachmentsAsync(
    docid: string,
    repoRoot: string,
  ): Promise<AttachmentFile[]> {
    const docPath = getDocPath(repoRoot, docid);
    const entries = await this.requireBound(
      this.readDirectory,
      "Chronicle.readDirectory",
    )(path.dirname(docPath));
    const basePath = docPath.slice(0, -3);
    return getAttachmentInfo(docid, entries)
      .suffixes.filter((suffix) => suffix !== ".md")
      .map((suffix) => ({ suffix, fsPath: `${basePath}${suffix}` }));
  }

  bind(
    getCurrentFile: GetCurrentFile,
    getRepoRoot: GetRepoRoot,
    readTextFile: ReadTextFile,
    readDirectory: ReadDirectory,
    pushDocument: PushDocument,
    pushNoDoc: PushNoDoc,
    useDocument: UseDocument,
  ): void {
    assert.ok(
      this.getCurrentFile === null &&
        this.getRepoRoot === null &&
        this.readTextFile === null &&
        this.readDirectory === null &&
        this.pushDocument === null &&
        this.pushNoDoc === null &&
        this.useDocument === null,
      "Chronicle is already bound",
    );
    this.getCurrentFile = getCurrentFile;
    this.getRepoRoot = getRepoRoot;
    this.readTextFile = readTextFile;
    this.readDirectory = readDirectory;
    this.pushDocument = pushDocument;
    this.pushNoDoc = pushNoDoc;
    this.useDocument = useDocument;
  }
}

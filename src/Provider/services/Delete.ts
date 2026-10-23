// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert, path } from "../utils/lang";
import { Service } from "../utils/Service";
import { getDocPath } from "../utils/doc";
import type { Card } from "../utils/cardCsv";

export type ShowInputBox = (
  prompt: string,
  value: string,
) => Promise<string | undefined>;
export type GetCurrentCard = () => Card | null;
export type GetRepoRoot = () => string;
export type FileExists = (fsPath: string) => Promise<boolean>;
export type DeleteFile = (fsPath: string) => Promise<string>;
export type CloseActiveEditor = () => Promise<string>;
export type OpenDocument = (docid: string) => Promise<unknown>;
export type GetPreviousDocid = () => string | null;
export type ResetCurrent = () => unknown;

export class Delete extends Service {
  private showInputBox: ShowInputBox | null = null;
  private getCurrentCard: GetCurrentCard | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private fileExists: FileExists | null = null;
  private deleteFile: DeleteFile | null = null;
  private closeActiveEditor: CloseActiveEditor | null = null;
  private openDocument: OpenDocument | null = null;
  private getPreviousDocid: GetPreviousDocid | null = null;
  private resetCurrent: ResetCurrent | null = null;

  async onDeleteAsync(): Promise<string> {
    this.log?.("TRACE", "Delete.onDeleteAsync");
    const card = this.requireBound(
      this.getCurrentCard,
      "Delete.getCurrentCard",
    )();
    if (card === null || card.docid === "") {
      return "ok";
    }

    const value = await this.requireBound(
      this.showInputBox,
      "Delete.showInputBox",
    )(`Type yes to delete ${card.docid}`, "");
    if (value?.trim().toLowerCase() !== "yes") {
      return "ok";
    }

    const repoRoot = this.requireBound(
      this.getRepoRoot,
      "Delete.getRepoRoot",
    )();
    if (repoRoot === "") {
      return "ok";
    }

    const mdPath = getDocPath(repoRoot, card.docid);
    if (
      !(await this.requireBound(this.fileExists, "Delete.fileExists")(mdPath))
    ) {
      return "ok";
    }

    try {
      await this.deleteFilesAsync(repoRoot, card.docid);
      await this.requireBound(
        this.closeActiveEditor,
        "Delete.closeActiveEditor",
      )();
      const previous = this.requireBound(
        this.getPreviousDocid,
        "Delete.getPreviousDocid",
      )();
      if (previous === null) {
        await this.requireBound(this.resetCurrent, "Delete.resetCurrent")();
        return "ok";
      }
      await this.requireBound(
        this.openDocument,
        "Delete.openDocument",
      )(previous);
      return "ok";
    } catch (error) {
      this.log?.("ERROR", "Delete.onDeleteAsync", String(error));
      return error instanceof Error ? error.message : String(error);
    }
  }

  private async deleteFilesAsync(
    repoRoot: string,
    docid: string,
  ): Promise<void> {
    const fileExists = this.requireBound(this.fileExists, "Delete.fileExists");
    const deleteFile = this.requireBound(this.deleteFile, "Delete.deleteFile");
    const directory = path.dirname(getDocPath(repoRoot, docid));
    for (const extension of ["md", "pdf", "txt"]) {
      const fsPath = path.join(directory, `${docid}.${extension}`);
      if (await fileExists(fsPath)) {
        await deleteFile(fsPath);
      }
    }
  }

  bind(
    showInputBox: ShowInputBox,
    getCurrentCard: GetCurrentCard,
    getRepoRoot: GetRepoRoot,
    fileExists: FileExists,
    deleteFile: DeleteFile,
    closeActiveEditor: CloseActiveEditor,
    openDocument: OpenDocument,
    getPreviousDocid: GetPreviousDocid,
    resetCurrent: ResetCurrent,
  ): void {
    assert.ok(
      this.showInputBox === null &&
        this.getCurrentCard === null &&
        this.getRepoRoot === null &&
        this.fileExists === null &&
        this.deleteFile === null &&
        this.closeActiveEditor === null &&
        this.openDocument === null &&
        this.getPreviousDocid === null &&
        this.resetCurrent === null,
      "Delete is already bound",
    );
    this.showInputBox = showInputBox;
    this.getCurrentCard = getCurrentCard;
    this.getRepoRoot = getRepoRoot;
    this.fileExists = fileExists;
    this.deleteFile = deleteFile;
    this.closeActiveEditor = closeActiveEditor;
    this.openDocument = openDocument;
    this.getPreviousDocid = getPreviousDocid;
    this.resetCurrent = resetCurrent;
  }
}

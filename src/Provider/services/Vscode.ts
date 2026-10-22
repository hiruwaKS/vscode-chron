// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { path } from "../utils/lang";
import * as vscodeApi from "../utils/vscode";
import { Service } from "../utils/Service";
import { getDocPath } from "../utils/doc";

export interface TreeNodeLike {
  data?: {
    docid?: string;
  };
}

export class Vscode extends Service {
  onGetCurrentFile(): string | null {
    this.log?.("TRACE", "Vscode.onGetCurrentFile");
    const document = vscodeApi.window.activeTextEditor?.document;
    return document ? document.uri.fsPath : null;
  }

  onGetRepoRoot(): string {
    this.log?.("TRACE", "Vscode.onGetRepoRoot");
    return this.getRepoRoot();
  }

  async onReadTextFileAsync(fsPath: string, silent = false): Promise<string> {
    if (!silent) {
      this.log?.("TRACE", "Vscode.onReadTextFileAsync", fsPath);
    }
    const data = await vscodeApi.workspace.fs.readFile(
      vscodeApi.Uri.file(fsPath),
    );
    return new TextDecoder().decode(data);
  }

  async onWriteTextFileAsync(
    fsPath: string,
    content: string,
    silent = false,
  ): Promise<string> {
    if (!silent) {
      this.log?.("TRACE", "Vscode.onWriteTextFileAsync", fsPath);
    }
    const uri = vscodeApi.Uri.file(fsPath);
    const folder = vscodeApi.Uri.file(path.dirname(fsPath));
    await vscodeApi.workspace.fs.createDirectory(folder);
    await vscodeApi.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
    return "ok";
  }

  async onFileExistsAsync(fsPath: string, silent = false): Promise<boolean> {
    if (!silent) {
      this.log?.("TRACE", "Vscode.onFileExistsAsync", fsPath);
    }
    try {
      await vscodeApi.workspace.fs.stat(vscodeApi.Uri.file(fsPath));
      return true;
    } catch {
      return false;
    }
  }

  async onReadDirectoryAsync(
    fsPath: string,
    silent = false,
  ): Promise<[string, vscodeApi.FileType][]> {
    if (!silent) {
      this.log?.("TRACE", "Vscode.onReadDirectoryAsync", fsPath);
    }
    try {
      return await vscodeApi.workspace.fs.readDirectory(
        vscodeApi.Uri.file(fsPath),
      );
    } catch {
      return [];
    }
  }

  async onLogFileExistsAsync(): Promise<boolean> {
    return await this.onFileExistsAsync(this.getLogPath(), true);
  }

  async onReadLogFileAsync(): Promise<string> {
    return await this.onReadTextFileAsync(this.getLogPath(), true);
  }

  async onWriteLogFileAsync(content: string): Promise<string> {
    return await this.onWriteTextFileAsync(this.getLogPath(), content, true);
  }

  async onOpenDocAsync(node: TreeNodeLike | null): Promise<string | null> {
    this.log?.("TRACE", "Vscode.onOpenDocAsync");
    const docid = node?.data?.docid;
    if (docid === undefined || docid === "") {
      return null;
    }

    const uri = vscodeApi.Uri.file(getDocPath(this.getRepoRoot(), docid));
    await vscodeApi.commands.executeCommand("vscode.open", uri);
    return "ok";
  }

  getRepoRoot(): string {
    const notesPath = vscodeApi.workspace
      .getConfiguration("chron")
      .get("notesPath", "");
    if (notesPath.trim() !== "") {
      return notesPath.trim();
    }
    const legacyPath = vscodeApi.workspace
      .getConfiguration("vsextchronicle")
      .get("notesPath", "");
    return legacyPath.trim();
  }

  // ========== LOG PATH START ==========
  // Hardcoded: change the log file path here.
  getLogPath(): string {
    return path.join(this.getRepoRoot(), "tmp", "log.txt");
  }
  // ========== LOG PATH END ==========
}

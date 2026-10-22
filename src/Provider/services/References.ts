// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../utils/lang";
import * as vscode from "../utils/vscode";
import { findDocIds, getDocPath, parseDocPath } from "../utils/doc";
import { findReverseDocIds } from "../utils/refs";

export interface DocReference {
  docid: string;
  start: number;
  end: number;
  reverse: boolean;
}

export type GetRepoRoot = () => string;
export type ReadTextFile = (fsPath: string) => Promise<string>;

export class References {
  private getRepoRoot: GetRepoRoot | null = null;
  private readTextFile: ReadTextFile | null = null;
  private diagnostics =
    vscode.languages.createDiagnosticCollection("chron-references");
  private validationIds = new Map<string, number>();

  async validateAsync(
    document: vscode.TextDocument,
    references: readonly DocReference[],
    token?: vscode.CancellationToken,
  ): Promise<void> {
    const getRepoRoot = this.getRepoRoot;
    const readTextFile = this.readTextFile;
    assert.ok(getRepoRoot !== null, "References.getRepoRoot is not bound");
    assert.ok(readTextFile !== null, "References.readTextFile is not bound");

    const key = document.uri.toString();
    const version = document.version;
    const validationId = (this.validationIds.get(key) ?? 0) + 1;
    this.validationIds.set(key, validationId);
    const repoRoot = getRepoRoot();
    const currentDocid = parseDocPath(document.uri.fsPath)?.docid ?? null;
    if (repoRoot === "" || currentDocid === null) {
      this.diagnostics.delete(document.uri);
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const checks = references.map((reference) => {
      const targetPath = getDocPath(repoRoot, reference.docid);
      return readTextFile(targetPath)
        .then((content) => {
          const found = reference.reverse
            ? findDocIds(content).some(({ docid }) => docid === currentDocid)
            : findReverseDocIds(content).some(
                ({ docid }) => docid === currentDocid,
              );
          if (!found) {
            diagnostics.push(References.makeDiagnostic(document, reference));
          }
        })
        .catch(() => undefined);
    });
    await Promise.all(checks);
    if (
      token?.isCancellationRequested ||
      document.version !== version ||
      this.validationIds.get(key) !== validationId
    ) {
      return;
    }
    this.diagnostics.set(document.uri, diagnostics);
  }

  clear(uri: vscode.Uri): void {
    this.diagnostics.delete(uri);
  }

  dispose(): void {
    this.diagnostics.dispose();
  }

  bind(getRepoRoot: GetRepoRoot, readTextFile: ReadTextFile): void {
    assert.ok(
      this.getRepoRoot === null && this.readTextFile === null,
      "References is already bound",
    );
    this.getRepoRoot = getRepoRoot;
    this.readTextFile = readTextFile;
  }

  static makeDiagnostic(
    document: vscode.TextDocument,
    reference: DocReference,
  ): vscode.Diagnostic {
    const range = new vscode.Range(
      document.positionAt(reference.start),
      document.positionAt(reference.end),
    );
    const message = reference.reverse
      ? `Referenced document ${reference.docid} does not cite this document`
      : `Referenced document ${reference.docid} has no reverse reference`;
    return new vscode.Diagnostic(
      range,
      message,
      vscode.DiagnosticSeverity.Error,
    );
  }
}

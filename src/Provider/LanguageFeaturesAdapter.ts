// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type * as vscode from "../utils/vscode";
import type { DocInfo, InlayHints, SemanticTokens } from "./services";

export class LanguageFeaturesAdapter
  implements
    vscode.DocumentLinkProvider,
    vscode.DocumentSemanticTokensProvider,
    vscode.InlayHintsProvider
{
  documentInfo: DocInfo;
  semanticTokens: SemanticTokens;
  inlayHints: InlayHints;

  constructor(
    documentInfo: DocInfo,
    semanticTokens: SemanticTokens,
    inlayHints: InlayHints,
  ) {
    this.documentInfo = documentInfo;
    this.semanticTokens = semanticTokens;
    this.inlayHints = inlayHints;
  }

  provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken,
  ): Promise<vscode.DocumentLink[]> {
    return this.documentInfo.onProvideDocumentLinksAsync(document, token);
  }

  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken,
  ): vscode.SemanticTokens {
    return this.semanticTokens.onProvideDocumentSemanticTokens(document, token);
  }

  provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    token: vscode.CancellationToken,
  ): Promise<vscode.InlayHint[]> {
    return this.inlayHints.onProvideInlayHintsAsync(document, range, token);
  }
}

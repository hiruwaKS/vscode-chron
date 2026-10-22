// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../utils/vscode";
import { Service } from "../utils/Service";
import { createTokenIndexes } from "./tokens";
import { collectHeaderTokens } from "./fields";
import { parseDocPath } from "../utils/doc";

export class SemanticTokens extends Service {
  legend: vscode.SemanticTokensLegend | null = null;
  tokenTypes = createTokenIndexes();

  init(legend: vscode.SemanticTokensLegend): string {
    this.log?.("TRACE", "SemanticTokens.init");
    this.legend = legend;
    return "ok";
  }

  onProvideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token?: vscode.CancellationToken,
  ): vscode.SemanticTokens {
    this.log?.("TRACE", "SemanticTokens.onProvideDocumentSemanticTokens");
    const legend = this.legend;
    if (legend === null || parseDocPath(document.uri.fsPath) === null) {
      return new vscode.SemanticTokens(new Uint32Array(), "");
    }
    const builder = new vscode.SemanticTokensBuilder(legend);

    for (const { line, start, length, type } of collectHeaderTokens(
      document.getText(),
      this.tokenTypes,
    )) {
      if (token?.isCancellationRequested) {
        break;
      }
      builder.push(line, start, length, type, 0);
    }

    return builder.build();
  }
}

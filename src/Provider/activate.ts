// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../utils/vscode";
import { fireAndCatch } from "../utils/lang";
import { TOKEN_MODIFIERS, TOKEN_TYPES } from "../utils/defs";
import { ExtensionServices } from "./ExtensionServices";
import { wireUp } from "./wireUp";
import { TreeViewAdapter } from "./TreeViewAdapter";
import { LanguageFeaturesAdapter } from "./LanguageFeaturesAdapter";
import { createCommands } from "./commands";

export function createSemanticTokensLegend(): vscode.SemanticTokensLegend {
  return new vscode.SemanticTokensLegend([...TOKEN_TYPES], TOKEN_MODIFIERS);
}

export function activateProvider(
  context: vscode.ExtensionContext,
): vscode.Disposable[] {
  const services = new ExtensionServices(context);
  wireUp(services);

  const treeView = new TreeViewAdapter(services.treeRender);
  const languageFeatures = new LanguageFeaturesAdapter(
    services.documentInfo,
    services.semanticTokens,
    services.inlayHints,
  );
  const legend = createSemanticTokensLegend();

  const subscriptions = registerVscode(
    services,
    treeView,
    languageFeatures,
    legend,
  );

  fireAndCatch(
    () => services.startAsync(legend),
    (error) => {
      services.log("ERROR", "activate.start", String(error));
    },
  );

  return subscriptions;
}

export function registerVscode(
  services: ExtensionServices,
  treeView: TreeViewAdapter,
  languageFeatures: LanguageFeaturesAdapter,
  legend: vscode.SemanticTokensLegend,
): vscode.Disposable[] {
  const view = vscode.window.createTreeView("unifiedTreeView", {
    treeDataProvider: treeView,
  });
  const commands = createCommands(services.treeEventDispatcher).map(
    ([id, handler]) => vscode.commands.registerCommand(id, handler),
  );
  const subscriptions: vscode.Disposable[] = [view, services];

  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor === undefined) {
        return;
      }
      services.chronicle.onLoadCurrentAsync().catch((error: unknown) => {
        services.log("ERROR", "activate.activeEditor", String(error));
      });
    }),
  );

  subscriptions.push(vscode.window.registerFileDecorationProvider(treeView));
  subscriptions.push(...commands);
  subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: "markdown" },
      languageFeatures,
    ),
  );
  subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: "markdown" },
      languageFeatures,
      legend,
    ),
  );
  subscriptions.push(
    vscode.languages.registerInlayHintsProvider(
      { language: "markdown" },
      languageFeatures,
    ),
  );

  return subscriptions;
}

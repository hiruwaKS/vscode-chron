// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { activateProvider } from "./Provider";
import type { ExtensionContext } from "vscode";

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(...activateProvider(context));
}

export function deactivate(): void {}

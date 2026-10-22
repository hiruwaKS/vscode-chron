// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../utils/vscode";
import {
  BOOKMARK_ENABLED,
  LEFT_CLICK_COMMAND,
  TEST_ENABLED_1,
  TEST_ENABLED_2,
} from "../utils/defs";
import {
  Bookmark,
  Chronicle,
  DataSource,
  DocInfo,
  History,
  InlayHints,
  Logger,
  SemanticTokens,
  TreeEventDispatcher,
  TreeRender,
  Vscode,
} from "./services";
import type { Log } from "./services";

export class ExtensionServices implements vscode.Disposable {
  readonly context: vscode.ExtensionContext;
  readonly vscodeService: Vscode;
  readonly logger: Logger;
  readonly bookmarks: Bookmark;
  readonly history: History;
  readonly chronicle: Chronicle;
  readonly dataSourceService: DataSource;
  readonly documentInfo: DocInfo;
  readonly inlayHints: InlayHints;
  readonly semanticTokens: SemanticTokens;
  readonly treeEventDispatcher: TreeEventDispatcher;
  readonly treeRender: TreeRender;
  readonly enables: Set<string>;
  readonly log: Log;
  private startPromise: Promise<void> | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.vscodeService = new Vscode();
    this.logger = new Logger();
    this.bookmarks = new Bookmark();
    this.history = new History();
    this.chronicle = new Chronicle();
    this.dataSourceService = new DataSource();
    this.documentInfo = new DocInfo();
    this.inlayHints = new InlayHints();
    this.semanticTokens = new SemanticTokens();
    this.treeEventDispatcher = new TreeEventDispatcher();
    this.treeRender = new TreeRender({
      leftClickCommand: LEFT_CLICK_COMMAND,
      extensionUri: context.extensionUri,
    });
    this.enables = new Set([BOOKMARK_ENABLED, TEST_ENABLED_1, TEST_ENABLED_2]);
    this.log = (level, ...args) => this.logger.onLog(level, ...args);
  }

  startAsync(legend: vscode.SemanticTokensLegend): Promise<void> {
    if (this.startPromise !== null) {
      return this.startPromise;
    }
    const promise = this.startInternalAsync(legend);
    this.startPromise = promise;
    return promise;
  }

  private async startInternalAsync(
    legend: vscode.SemanticTokensLegend,
  ): Promise<void> {
    this.logger.init();
    this.bookmarks.init();
    this.history.init();
    this.chronicle.init();
    this.semanticTokens.init(legend);

    await Promise.all(
      [TEST_ENABLED_1, TEST_ENABLED_2].map((name) =>
        this.setContextAsync(name, true),
      ),
    );
  }

  async setContextAsync(name: string, value: boolean): Promise<string> {
    if (!this.enables.has(name)) {
      return "ok";
    }
    try {
      await vscode.commands.executeCommand("setContext", name, value);
    } catch (error) {
      this.log("ERROR", "ExtensionServices.setContextAsync", String(error));
    }
    return "ok";
  }

  dispose(): void {
    this.treeRender.dispose();
    this.documentInfo.dispose();
  }
}

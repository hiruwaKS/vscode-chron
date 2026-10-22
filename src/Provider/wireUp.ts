// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { ExtensionServices } from "./ExtensionServices";
import type { Log } from "./services";

export function wireUp(services: ExtensionServices): void {
  const {
    vscodeService,
    logger,
    bookmarks,
    history,
    chronicle,
    dataSourceService,
    documentInfo,
    inlayHints,
    semanticTokens,
    treeEventDispatcher,
    treeRender,
  } = services;

  const log: Log = (level, ...args) => logger.onLog(level, ...args);

  logger.bind(
    () => vscodeService.onLogFileExistsAsync(),
    () => vscodeService.onReadLogFileAsync(),
    (content) => vscodeService.onWriteLogFileAsync(content),
    (logging) => dataSourceService.onPushLoggingState(logging),
  );

  for (const service of [
    vscodeService,
    bookmarks,
    history,
    chronicle,
    dataSourceService,
    documentInfo,
    inlayHints,
    semanticTokens,
    treeEventDispatcher,
    treeRender,
  ]) {
    service.bindLog(log);
  }

  bookmarks.bind(
    (fsPath) => vscodeService.onReadTextFileAsync(fsPath),
    (fsPath, content) => vscodeService.onWriteTextFileAsync(fsPath, content),
    (fsPath) => vscodeService.onFileExistsAsync(fsPath),
    () => vscodeService.onGetRepoRoot(),
    (bookmarkData) => dataSourceService.onPushBookmarks(bookmarkData),
  );

  history.bind(
    (fsPath) => vscodeService.onReadTextFileAsync(fsPath),
    (fsPath, content) => vscodeService.onWriteTextFileAsync(fsPath, content),
    (fsPath) => vscodeService.onFileExistsAsync(fsPath),
    () => vscodeService.onGetRepoRoot(),
    (historyData) => dataSourceService.onPushHistory(historyData),
  );

  chronicle.bind(
    () => vscodeService.onGetCurrentFile(),
    () => vscodeService.onGetRepoRoot(),
    (fsPath) => vscodeService.onReadTextFileAsync(fsPath),
    (payload) => dataSourceService.onPushDocument(payload),
    () => dataSourceService.onPushNoDoc(),
    (payload) => history.onUseDocumentAsync(payload),
  );

  dataSourceService.bind((data) => treeRender.onUpdateRoot(data));

  documentInfo.bind(
    () => vscodeService.onGetRepoRoot(),
    (fsPath) => vscodeService.onReadDirectoryAsync(fsPath),
    (fsPath) => vscodeService.onReadTextFileAsync(fsPath),
    (fsPath) => vscodeService.onFileExistsAsync(fsPath),
  );

  inlayHints.bind((docid) => documentInfo.onGetHeaderInfoAsync(docid));

  treeEventDispatcher.bind(
    (node) => vscodeService.onOpenDocAsync(node),
    (docid, card) => bookmarks.onToggleBookmarkAsync(docid, card),
    () => logger.onToggleLogging(),
  );
}

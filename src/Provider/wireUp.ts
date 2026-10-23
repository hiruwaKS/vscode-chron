// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { ExtensionServices } from "./ExtensionServices";
import type { Log } from "./services";

export function wireUp(services: ExtensionServices): void {
  const {
    vscodeService,
    logger,
    search,
    add,
    delete: deleteService,
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

  vscodeService.bind((docid) => dataSourceService.onPushMissingDoc(docid));

  for (const service of [
    vscodeService,
    search,
    add,
    deleteService,
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

  search.bind(
    (prompt, value) => vscodeService.onShowInputBoxAsync(prompt, value),
    (basePath) => vscodeService.onFindMarkdownFilesAsync(basePath),
    (fsPath) => vscodeService.onReadTextFileAsync(fsPath, true),
    () => vscodeService.onGetRepoRoot(),
    (state) => dataSourceService.onPushSearchState(state),
    (results) => dataSourceService.onPushSearchResults(results),
  );

  add.bind(
    (prompt, value) => vscodeService.onShowInputBoxAsync(prompt, value),
    () => vscodeService.onGetRepoRoot(),
    (fsPath) => vscodeService.onReadDirectoryAsync(fsPath),
    (fsPath, content) => vscodeService.onWriteTextFileAsync(fsPath, content),
    (fsPath) => vscodeService.onOpenPathAsync(fsPath),
  );

  deleteService.bind(
    (prompt, value) => vscodeService.onShowInputBoxAsync(prompt, value),
    () => dataSourceService.currentCard,
    () => vscodeService.onGetRepoRoot(),
    (fsPath) => vscodeService.onFileExistsAsync(fsPath, true),
    (fsPath) => vscodeService.onDeleteFileAsync(fsPath),
    () => vscodeService.onCloseActiveEditorAsync(),
    (docid) => vscodeService.onOpenDocAsync({ data: { docid } }),
    () => history.getPreviousDocid(),
    () => dataSourceService.onPushNoDoc(),
  );

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
    (fsPath) => vscodeService.onReadDirectoryAsync(fsPath),
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
    () => {
      search.onSearchNodeClicked();
    },
    () => {
      search.onCsToggled();
    },
    (kind) => add.onAddAsync(kind),
    () => deleteService.onDeleteAsync(),
    (fsPath) => vscodeService.onOpenPathAsync(fsPath),
    (text) => vscodeService.onCopyTextAsync(text),
  );
}

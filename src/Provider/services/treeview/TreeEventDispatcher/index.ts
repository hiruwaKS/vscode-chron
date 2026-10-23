// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import {
  ADD_EVENT,
  ADD_LITERATURE,
  ADD_NOTE,
  DELETE_DOC,
  OPEN_ATTACHMENT,
  OPEN_DOC,
  OPEN_SEARCH,
  TOGGLE_BOOKMARK,
  TOGGLE_CASE_SENSITIVE,
  TOGGLE_LOGGING,
} from "../utils/actions";
import { assert, fireAndForget } from "../utils/lang";
import { Service } from "../utils/Service";
import type { Card } from "../utils/doc";

export type AddKind = "L" | "N" | "E";

export interface TreeNodeLike {
  action?: string;
  data?: Card;
  openPath?: string;
}

export type OpenDoc = (node: TreeNodeLike) => Promise<unknown>;
export type ToggleBookmark = (docid: string, card: Card) => Promise<unknown>;
export type ToggleLogging = () => unknown;
export type OpenSearch = () => unknown;
export type ToggleCaseSensitive = () => unknown;
export type AddDocument = (kind: AddKind) => Promise<unknown>;
export type DeleteDocument = () => Promise<unknown>;
export type OpenAttachment = (fsPath: string) => Promise<unknown>;
export type CopyText = (text: string) => Promise<unknown>;

export class TreeEventDispatcher extends Service {
  private openDoc: OpenDoc | null = null;
  private toggleBookmark: ToggleBookmark | null = null;
  private toggleLogging: ToggleLogging | null = null;
  private openSearch: OpenSearch | null = null;
  private toggleCaseSensitive: ToggleCaseSensitive | null = null;
  private addDocument: AddDocument | null = null;
  private deleteDocument: DeleteDocument | null = null;
  private openAttachment: OpenAttachment | null = null;
  private copyText: CopyText | null = null;

  onClick(node: TreeNodeLike | null): void {
    this.log?.("TRACE", "TreeEventDispatcher.onClick");

    const action = node?.action ?? OPEN_DOC;

    switch (action) {
      case OPEN_DOC: {
        const openDoc = this.requireBound(
          this.openDoc,
          "TreeEventDispatcher.openDoc",
        );
        if (node !== null) {
          fireAndForget(async function openDocAsync() {
            await openDoc(node);
          });
        }
        break;
      }
      case TOGGLE_BOOKMARK: {
        this.onBookmarkToggled(node);
        break;
      }
      case OPEN_SEARCH: {
        const openSearch = this.requireBound(
          this.openSearch,
          "TreeEventDispatcher.openSearch",
        );
        fireAndForget(async function openSearchAsync() {
          await openSearch();
        });
        break;
      }
      case TOGGLE_CASE_SENSITIVE: {
        const toggleCaseSensitive = this.requireBound(
          this.toggleCaseSensitive,
          "TreeEventDispatcher.toggleCaseSensitive",
        );
        fireAndForget(async function toggleCaseSensitiveAsync() {
          await toggleCaseSensitive();
        });
        break;
      }
      case ADD_LITERATURE:
        this.onAdd("L");
        break;
      case ADD_NOTE:
        this.onAdd("N");
        break;
      case ADD_EVENT:
        this.onAdd("E");
        break;
      case OPEN_ATTACHMENT: {
        const openPath = node?.openPath;
        const openAttachment = this.requireBound(
          this.openAttachment,
          "TreeEventDispatcher.openAttachment",
        );
        if (openPath !== undefined && openPath !== "") {
          fireAndForget(async function openAttachmentAsync() {
            await openAttachment(openPath);
          });
        }
        break;
      }
      case DELETE_DOC: {
        const deleteDocument = this.requireBound(
          this.deleteDocument,
          "TreeEventDispatcher.deleteDocument",
        );
        fireAndForget(async function deleteDocumentAsync() {
          await deleteDocument();
        });
        break;
      }
      case TOGGLE_LOGGING: {
        const toggleLogging = this.requireBound(
          this.toggleLogging,
          "TreeEventDispatcher.toggleLogging",
        );
        fireAndForget(async function toggleLoggingAsync() {
          await toggleLogging();
        });
        break;
      }
      default:
        break;
    }
  }

  onBookmarkToggled(node: TreeNodeLike | null): void {
    this.log?.("TRACE", "TreeEventDispatcher.onBookmarkToggled");
    const docid = node?.data?.docid;
    const card = node?.data;
    const toggleBookmark = this.requireBound(
      this.toggleBookmark,
      "TreeEventDispatcher.toggleBookmark",
    );
    if (docid !== undefined && docid !== "" && card !== undefined) {
      fireAndForget(async function toggleBookmarkAsync() {
        await toggleBookmark(docid, card);
      });
    }
  }

  onCopyPath(node: TreeNodeLike | null): void {
    this.log?.("TRACE", "TreeEventDispatcher.onCopyPath");
    const openPath = node?.openPath ?? node?.data?.openPath ?? null;
    const copyText = this.requireBound(
      this.copyText,
      "TreeEventDispatcher.copyText",
    );
    if (openPath !== null && openPath !== "") {
      fireAndForget(async function copyTextAsync() {
        await copyText(openPath);
      });
    }
  }

  onAdd(kind: AddKind): void {
    this.log?.("TRACE", "TreeEventDispatcher.onAdd", kind);
    const addDocument = this.requireBound(
      this.addDocument,
      "TreeEventDispatcher.addDocument",
    );
    fireAndForget(async function addDocumentAsync() {
      await addDocument(kind);
    });
  }

  onTest1(_node: TreeNodeLike | null): string {
    this.log?.("TRACE", "TreeEventDispatcher.onTest1");
    return "ok";
  }

  onTest2(_node: TreeNodeLike | null): string {
    this.log?.("TRACE", "TreeEventDispatcher.onTest2");
    return "ok";
  }

  bind(
    openDoc: OpenDoc,
    toggleBookmark: ToggleBookmark,
    toggleLogging: ToggleLogging,
    openSearch: OpenSearch,
    toggleCaseSensitive: ToggleCaseSensitive,
    addDocument: AddDocument,
    deleteDocument: DeleteDocument,
    openAttachment: OpenAttachment,
    copyText: CopyText,
  ): void {
    assert.ok(
      this.openDoc === null &&
        this.toggleBookmark === null &&
        this.toggleLogging === null &&
        this.openSearch === null &&
        this.toggleCaseSensitive === null &&
        this.addDocument === null &&
        this.deleteDocument === null &&
        this.openAttachment === null &&
        this.copyText === null,
      "TreeEventDispatcher is already bound",
    );
    this.openDoc = openDoc;
    this.toggleBookmark = toggleBookmark;
    this.toggleLogging = toggleLogging;
    this.openSearch = openSearch;
    this.toggleCaseSensitive = toggleCaseSensitive;
    this.addDocument = addDocument;
    this.deleteDocument = deleteDocument;
    this.openAttachment = openAttachment;
    this.copyText = copyText;
  }
}

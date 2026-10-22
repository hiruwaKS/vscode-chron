// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { OPEN_DOC, TOGGLE_BOOKMARK, TOGGLE_LOGGING } from "../utils/actions";
import { assert, fireAndForget } from "../utils/lang";
import { Service } from "../utils/Service";
import type { Card } from "../utils/doc";

export interface TreeNodeLike {
  action?: string;
  data?: Card;
}

export type OpenDoc = (node: TreeNodeLike) => Promise<unknown>;
export type ToggleBookmark = (docid: string, card: Card) => Promise<unknown>;
export type ToggleLogging = () => unknown;

export class TreeEventDispatcher extends Service {
  private openDoc: OpenDoc | null = null;
  private toggleBookmark: ToggleBookmark | null = null;
  private toggleLogging: ToggleLogging | null = null;

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
  ): void {
    assert.ok(
      this.openDoc === null &&
        this.toggleBookmark === null &&
        this.toggleLogging === null,
      "TreeEventDispatcher is already bound",
    );
    this.openDoc = openDoc;
    this.toggleBookmark = toggleBookmark;
    this.toggleLogging = toggleLogging;
  }
}

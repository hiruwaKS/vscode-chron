// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import {
  BOOKMARK_MENU_COMMAND,
  COPY_PATH_COMMAND,
  LEFT_CLICK_COMMAND,
  TEST_MENU_COMMAND_1,
  TEST_MENU_COMMAND_2,
} from "../utils/defs";
import type { TreeEventDispatcher, TreeNodeLike } from "./services";

export type CommandHandler = (...args: unknown[]) => unknown;
export type CommandPair = [id: string, handler: CommandHandler];

export function createCommands(dispatcher: TreeEventDispatcher): CommandPair[] {
  return [
    [
      LEFT_CLICK_COMMAND,
      (node) => {
        dispatcher.onClick(node as TreeNodeLike | null);
      },
    ],
    [
      BOOKMARK_MENU_COMMAND,
      (node) => {
        dispatcher.onBookmarkToggled(node as TreeNodeLike | null);
      },
    ],
    [
      COPY_PATH_COMMAND,
      (node) => {
        dispatcher.onCopyPath(node as TreeNodeLike | null);
      },
    ],
    [
      TEST_MENU_COMMAND_1,
      (node) => dispatcher.onTest1(node as TreeNodeLike | null),
    ],
    [
      TEST_MENU_COMMAND_2,
      (node) => dispatcher.onTest2(node as TreeNodeLike | null),
    ],
  ];
}

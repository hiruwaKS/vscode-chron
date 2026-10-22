// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
const PREFIX = "chron";

export const LEFT_CLICK_COMMAND = `${PREFIX}.leftclick`;
export const BOOKMARK_MENU_COMMAND = `${PREFIX}.bookmark`;
export const TEST_MENU_COMMAND_1 = `${PREFIX}.test1`;
export const TEST_MENU_COMMAND_2 = `${PREFIX}.test2`;

// ========== Context values (Extendable) START ==========
export const BOOKMARK_ENABLED = "contextMenu.bookmarkEnabled";
export const TEST_ENABLED_1 = "contextMenu.test1Enabled";
export const TEST_ENABLED_2 = "contextMenu.test2Enabled";
// ========== Context values (Extendable) END ==========

// ========== Semantic tokens (Extendable) START ==========
export const TOKEN_TYPES = [
  "type",
  "keyword",
  "property",
  "string",
  "variable",
  "number",
  "comment",
] as const;

export const TOKEN_MODIFIERS: string[] = [];
// ========== Semantic tokens (Extendable) END ==========

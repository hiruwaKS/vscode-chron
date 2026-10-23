// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../utils/vscode";
import { LazyAsset } from "./LazyAsset";

export class Icons {
  static symbolIconIds = [
    "property",
    "method",
    "function",
    "variable",
    "constant",
    "class",
    "interface",
    "struct",
    "enum",
    "enumMember",
    "namespace",
    "module",
    "parameter",
    "key",
    "keyword",
    "operator",
    "string",
    "number",
    "boolean",
    "array",
    "object",
  ];

  static standaloneIconIds = [
    "file",
    "folder",
    "folder-opened",
    "note",
    "tag",
    "bookmark",
    "paperclip",
    "warning",
    "info",
    "circle-filled",
    "play",
    "tools",
    "add",
    "remove",
  ];

  static toKebabCase(id: string): string {
    return id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  static toCamelCase(id: string): string {
    return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  }

  static themeIcons = Object.freeze({
    ...Object.fromEntries(
      Icons.symbolIconIds.map((id) => [
        id,
        new vscode.ThemeIcon(`symbol-${Icons.toKebabCase(id)}`),
      ]),
    ),
    ...Object.fromEntries(
      Icons.standaloneIconIds.map((id) => [
        Icons.toCamelCase(id),
        new vscode.ThemeIcon(id),
      ]),
    ),
  });

  static lazyAssets = {
    L: new LazyAsset().init("svg/L.svg"),
    E: new LazyAsset().init("svg/E.svg"),
    N: new LazyAsset().init("svg/N.svg"),
  };

  static iconMap: Map<string, vscode.ThemeIcon | LazyAsset> = new Map<
    string,
    vscode.ThemeIcon | LazyAsset
  >([...Object.entries(Icons.themeIcons), ...Object.entries(Icons.lazyAssets)]);

  static getIcon(iconId: string) {
    const icon = Icons.iconMap.get(iconId);
    if (icon == null) {
      return null;
    }
    if (icon instanceof LazyAsset) {
      return icon.get();
    }
    return icon;
  }
}

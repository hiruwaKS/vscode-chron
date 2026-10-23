// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { parseHeader } from "./doc";

export function getMetaSearchText(text: string): string {
  const header = parseHeader(text);
  if (header === null) {
    return "";
  }

  const parts: string[] = [];
  header.lines.slice(0, header.separatorLine).forEach((line, index): void => {
    if (index === 1) {
      return;
    }
    if (index === 0 && line.startsWith("# ")) {
      parts.push(line.slice(2).trim());
      return;
    }
    const field = /^[A-Za-z][A-Za-z0-9_-]*:\s*(.*)$/.exec(line);
    parts.push(field === null ? line.trim() : (field[1] ?? "").trim());
  });
  return parts.join("\n");
}

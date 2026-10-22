// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { DocIdMatch } from "./doc";

export function findReverseDocIds(text: string): DocIdMatch[] {
  const found: DocIdMatch[] = [];
  const pattern = /@R(\d{4}-\d+)(?=[)\]}\s]|$)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const docid = match[1];
    const start = match.index;
    if (start === 0 || text[start - 1] !== " ") {
      continue;
    }
    if (typeof docid === "string") {
      found.push({
        docid,
        start,
        end: start + match[0].length,
      });
    }
  }

  return found;
}

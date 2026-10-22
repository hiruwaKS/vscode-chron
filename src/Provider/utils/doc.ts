// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { path } from "../../utils/lang";
import type { Card } from "./cardCsv";

export { emptyCard, sameCard } from "./cardCsv";
export type { Card } from "./cardCsv";

export interface DocPath {
  docid: string;
  year: string;
}

export interface DocIdMatch {
  docid: string;
  start: number;
  end: number;
}

export interface HeaderSeparatorPosition {
  line: number;
  character: number;
}

export interface Meta {
  title: string;
  type: string;
  authors: string;
  venue: string;
  at: string;
  doi: string;
}

export const DOCID_PATTERN = /^\d{4}-\d+$/;

export function findDocIds(text: string): DocIdMatch[] {
  const found: DocIdMatch[] = [];
  const pattern = /@(\d{4}-\d+)(?=[)\]}\s]|$)/g;
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

export function parseDocPath(filePath: string | null): DocPath | null {
  if (filePath === null || filePath === "") {
    return null;
  }

  const docid = path.basename(filePath, path.extname(filePath));
  if (!DOCID_PATTERN.test(docid)) {
    return null;
  }

  return { docid, year: docid.slice(0, 4) };
}

export function getDocPath(repoRoot: string, docid: string): string {
  return path.join(repoRoot, "chronicle", docid.slice(0, 4), `${docid}.md`);
}

export function cardFromMeta(
  meta: Meta,
  docid: string,
  repoRoot: string,
): Card {
  return {
    docid,
    title: meta.title === "" ? "" : meta.title,
    type: meta.type === "" ? "?" : meta.type,
    author: meta.type === "N" ? meta.venue : meta.authors,
    openPath: getDocPath(repoRoot, docid),
    exists: true,
  };
}

export function parseHeader(
  text: string,
): { lines: string[]; separatorLine: number } | null {
  const lines = text.split(/\r?\n/);
  const first = lines[0] ?? "";
  const second = lines[1] ?? "";

  if (!first.startsWith("# ") || !/^[LEN]$/.test(second.trim())) {
    return null;
  }

  const separatorLine = lines.findIndex((line) => line === "---");
  if (separatorLine < 0) {
    return null;
  }

  return { lines, separatorLine };
}

export function findHeaderSeparator(
  text: string,
): HeaderSeparatorPosition | null {
  const header = parseHeader(text);
  if (header === null) {
    return null;
  }

  let line = header.separatorLine - 1;
  while (line > 1 && (header.lines[line] ?? "").trim() === "") {
    line -= 1;
  }

  return { line, character: (header.lines[line] ?? "").length };
}

export function parseMeta(text: string): Meta {
  const meta: Meta = {
    title: "",
    type: "",
    authors: "",
    venue: "",
    at: "",
    doi: "",
  };
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line === "---") {
      break;
    }

    if (index === 0 && line.startsWith("# ")) {
      meta.title = line.slice(2).trim();
    } else if (line.startsWith("at: ")) {
      meta.at = line.slice(4).trim();
    } else if (line.startsWith("doi: ")) {
      meta.doi = line.slice(5).trim();
    } else if (line.startsWith("participants: ") && meta.type === "E") {
      meta.authors = line.slice(14).trim();
    } else if (index === 1) {
      meta.type = line.trim();
    } else if (index === 2) {
      if (meta.type !== "E") {
        meta.authors = line.trim();
      }
    } else if (index === 3) {
      if (meta.type !== "E") {
        meta.venue = line.trim();
      }
    }
  }

  return meta;
}

export class DocCard implements Card {
  docid: string;
  title: string;
  type: string;
  author: string;
  openPath: string | null;
  exists: boolean | null;

  constructor(card: Card) {
    this.docid = card.docid;
    this.title = card.title;
    this.type = card.type;
    this.author = card.author;
    this.openPath = card.openPath;
    this.exists = card.exists;
  }
}

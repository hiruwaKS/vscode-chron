// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { path } from "../../utils/lang";
import { parseDocPath } from "./doc";

export interface AttachmentInfo {
  attachments: number;
  pdf: boolean;
  txt: boolean;
  suffixes: string[];
}

export interface FileInfo {
  type: string | null;
  docid: string | null;
}

export type DirectoryEntry = [name: string, type: number];

export const DOC_TYPES: readonly string[] = ["md", "pdf", "txt"];

export function getFileInfo(filePath: string | null): FileInfo | null {
  if (filePath === null || filePath === "") {
    return null;
  }

  const extension = path.extname(filePath);
  const type = extension.slice(1).toLowerCase();
  let docid: string | null = null;

  if (type !== "" && DOC_TYPES.includes(type)) {
    docid = parseDocPath(filePath)?.docid ?? null;
  }

  return { type: type === "" ? null : type, docid };
}

export function getAttachmentInfo(
  docid: string,
  entries: readonly DirectoryEntry[],
): AttachmentInfo {
  const names = new Set(entries.map(([name]) => name));
  const prefix = `${docid}.`;
  const suffixes: string[] = [];
  let attachments = 0;

  for (const name of names) {
    if (!name.startsWith(prefix)) {
      continue;
    }
    suffixes.push(`.${name.slice(prefix.length)}`);
    if (name !== `${docid}.md`) {
      attachments += 1;
    }
  }

  return {
    attachments,
    pdf: names.has(`${docid}.pdf`),
    txt: names.has(`${docid}.txt`),
    suffixes: suffixes.sort(),
  };
}

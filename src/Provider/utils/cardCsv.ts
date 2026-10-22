// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
export interface Card {
  docid: string;
  title: string;
  type: string;
  author: string;
  openPath: string | null;
  exists: boolean | null;
}

export const DOCID_FIELD = "docid";
export const CARD_HEADER: readonly string[] = [
  "docid",
  "title",
  "type",
  "author",
  "openPath",
  "exists",
];

function toNumericParts(value: string): number[] | null {
  const parts = value.split("-").map((part) => Number(part));
  return parts.every((part) => Number.isFinite(part)) ? parts : null;
}

export function compareDocid(a: string, b: string): number {
  const left = toNumericParts(a);
  const right = toNumericParts(b);

  if (left !== null && right !== null) {
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      const first = left[index] ?? 0;
      const second = right[index] ?? 0;
      if (first !== second) {
        return first - second;
      }
    }
    return 0;
  }

  return a.localeCompare(b, "en", { numeric: true });
}

export function normalizeCard(data: Card | null): Card | null {
  if (data === null || data.docid === "") {
    return null;
  }

  return {
    docid: data.docid,
    title: data.title,
    type: data.type,
    author: data.author,
    openPath: data.openPath,
    exists: data.exists,
  };
}

export function sameCard(current: Card | null, card: Card | null): boolean {
  return (
    current !== null &&
    card !== null &&
    current.title === card.title &&
    current.type === card.type &&
    current.author === card.author &&
    current.openPath === card.openPath &&
    current.exists === card.exists
  );
}

export function headerIndexes(cells: string[]): Map<string, number> {
  return new Map(cells.map((name, index) => [name.toLowerCase(), index]));
}

export function cardFromCells(
  cells: string[],
  indexes: Map<string, number>,
): Card | null {
  const read = (name: string): string => {
    const index = indexes.get(name.toLowerCase());
    if (typeof index === "number") {
      return cells[index] ?? "";
    }
    return "";
  };

  const docid = read("docid");
  const title = read("title");
  const type = read("type");
  const author = read("author");
  const openPath = read("openPath");
  const exists = read("exists");

  if (
    docid === "" ||
    (title === "" &&
      type === "" &&
      author === "" &&
      openPath === "" &&
      exists === "")
  ) {
    return null;
  }

  return {
    docid,
    title,
    type: type === "" ? "?" : type,
    author,
    openPath: openPath === "" ? null : openPath,
    exists: exists === "" ? null : exists === "1",
  };
}

export function cardToCells(docid: string, card: Card | null): string[] {
  const value = card ?? emptyCard(docid);
  const exists = value.exists === null ? "" : value.exists ? "1" : "0";
  return [
    docid,
    value.title,
    value.type,
    value.author,
    value.openPath ?? "",
    exists,
  ];
}

export function emptyCard(docid: string): Card {
  return {
    docid,
    title: "",
    type: "?",
    author: "",
    openPath: null,
    exists: null,
  };
}

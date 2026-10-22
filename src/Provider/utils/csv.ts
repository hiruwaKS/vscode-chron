// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const cells: string[] = [];
    let cell = "";
    let quoted = false;
    let endOfRow = false;
    let hasCell = false;

    while (cursor < source.length && !endOfRow) {
      const char = source[cursor] ?? "";
      cursor += 1;
      hasCell = true;

      if (quoted) {
        if (char === '"') {
          if (source[cursor] === '"') {
            cell += '"';
            cursor += 1;
          } else {
            quoted = false;
          }
        } else {
          cell += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        cells.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        if (source[cursor] === "\n") {
          cursor += 1;
        }
        endOfRow = true;
      } else if (char === "\n") {
        endOfRow = true;
      } else {
        cell += char;
      }
    }

    if (hasCell) {
      cells.push(cell.trim());
    }

    if (cells.length > 1 || cells[0] !== "") {
      rows.push(cells);
    }
  }

  return rows;
}

export function stringifyCsv(rows: readonly (readonly string[])[]): string {
  const escapeCell = (value: string): string =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const lines = rows.map((cells) => cells.map(escapeCell).join(","));
  return `${lines.join("\n")}\n`;
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert, path } from "../utils/lang";
import { Service } from "../utils/Service";
import type { DirectoryEntry } from "../utils/attachment";
import type { AddKind } from "./types";

export type ShowInputBox = (
  prompt: string,
  value: string,
) => Promise<string | undefined>;
export type ReadDirectory = (
  fsPath: string,
) => Promise<readonly DirectoryEntry[]>;
export type WriteTextFile = (
  fsPath: string,
  content: string,
) => Promise<string>;
export type GetRepoRoot = () => string;
export type OpenFile = (fsPath: string) => Promise<string>;

export function addTemplate(kind: AddKind): string {
  switch (kind) {
    case "L":
      return "# the title\nL\n<authors>\n<venue>\n---\n";
    case "N":
      return "# the title\nN\n<date>\n<your name>\n---\n";
    case "E":
      return "# the title\nE\nat: <at>\nendtime: <endtime>\nparticipants: <participants>\n---\n";
  }
}

export function nextDocid(
  year: string,
  entries: readonly DirectoryEntry[],
): string {
  const prefix = `${year}-`;
  const used = new Set<number>();

  for (const [name] of entries) {
    if (!name.startsWith(prefix)) {
      continue;
    }
    const rest = name.slice(prefix.length);
    const dot = rest.indexOf(".");
    if (dot <= 0) {
      continue;
    }
    const index = rest.slice(0, dot);
    if (/^\d+$/.test(index)) {
      used.add(Number(index));
    }
  }

  let index = 0;
  while (used.has(index)) {
    index += 1;
  }
  return `${year}-${String(index)}`;
}

export class Add extends Service {
  private showInputBox: ShowInputBox | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private readDirectory: ReadDirectory | null = null;
  private writeTextFile: WriteTextFile | null = null;
  private openFile: OpenFile | null = null;

  async onAddAsync(kind: AddKind): Promise<string> {
    this.log?.("TRACE", "Add.onAddAsync", kind);
    const yearValue = await this.requireBound(
      this.showInputBox,
      "Add.showInputBox",
    )("Year (YYYY)", String(new Date().getFullYear()));
    if (yearValue === undefined) {
      return "ok";
    }

    const year = yearValue.trim();
    if (!/^\d{4}$/.test(year)) {
      this.log?.("ERROR", "Add.onAddAsync", `invalid year: ${year}`);
      return "ok";
    }

    const repoRoot = this.requireBound(this.getRepoRoot, "Add.getRepoRoot")();
    if (repoRoot === "") {
      return "ok";
    }

    const directory = path.join(repoRoot, "chronicle", year);
    const entries = await this.requireBound(
      this.readDirectory,
      "Add.readDirectory",
    )(directory);
    const docid = nextDocid(year, entries);
    const fsPath = path.join(directory, `${docid}.md`);
    await this.requireBound(this.writeTextFile, "Add.writeTextFile")(
      fsPath,
      addTemplate(kind),
    );
    await this.requireBound(this.openFile, "Add.openFile")(fsPath);
    return "ok";
  }

  bind(
    showInputBox: ShowInputBox,
    getRepoRoot: GetRepoRoot,
    readDirectory: ReadDirectory,
    writeTextFile: WriteTextFile,
    openFile: OpenFile,
  ): void {
    assert.ok(
      this.showInputBox === null &&
        this.getRepoRoot === null &&
        this.readDirectory === null &&
        this.writeTextFile === null &&
        this.openFile === null,
      "Add is already bound",
    );
    this.showInputBox = showInputBox;
    this.getRepoRoot = getRepoRoot;
    this.readDirectory = readDirectory;
    this.writeTextFile = writeTextFile;
    this.openFile = openFile;
  }
}

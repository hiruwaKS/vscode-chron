// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert, fireAndForget } from "../utils/lang";
import { Service } from "../utils/Service";
import { cardFromMeta, parseDocPath, parseMeta } from "../utils/doc";
import { getMetaSearchText } from "../utils/searchText";
import { compareDocid } from "../utils/cardCsv";
import type { Card } from "../utils/doc";
import type { SearchState } from "./treeview";

export type ShowInputBox = (
  prompt: string,
  value: string,
) => Promise<string | undefined>;
export type FindMarkdownFiles = (basePath: string) => Promise<string[]>;
export type ReadTextFile = (fsPath: string) => Promise<string>;
export type GetRepoRoot = () => string;
export type PushSearchState = (state: Partial<SearchState>) => unknown;
export type PushSearchResults = (results: Card[]) => unknown;

export class Search extends Service {
  query = "";
  caseSensitive = false;
  private requestId = 0;
  private showInputBox: ShowInputBox | null = null;
  private findMarkdownFiles: FindMarkdownFiles | null = null;
  private readTextFile: ReadTextFile | null = null;
  private getRepoRoot: GetRepoRoot | null = null;
  private pushSearchState: PushSearchState | null = null;
  private pushSearchResults: PushSearchResults | null = null;

  onSearchNodeClicked(): void {
    this.log?.("TRACE", "Search.onSearchNodeClicked");
    fireAndForget(() => this.onSearchNodeClickedAsync());
  }

  private async onSearchNodeClickedAsync(): Promise<void> {
    const value = await this.requireBound(
      this.showInputBox,
      "Search.showInputBox",
    )("Search document titles", this.query);
    if (value !== undefined) {
      await this.onInputBoxSubmitAsync(value);
    }
  }

  onInputBoxSubmit(value: string): void {
    this.log?.("TRACE", "Search.onInputBoxSubmit");
    fireAndForget(() => this.onInputBoxSubmitAsync(value));
  }

  private async onInputBoxSubmitAsync(value: string): Promise<void> {
    this.query = value.trim();
    await this.runSearchAsync();
  }

  onCsToggled(): boolean {
    this.log?.("TRACE", "Search.onCsToggled");
    this.caseSensitive = !this.caseSensitive;
    fireAndForget(() => this.csToggledAsync());
    return this.caseSensitive;
  }

  private async csToggledAsync(): Promise<void> {
    await this.runSearchAsync();
  }

  private async runSearchAsync(): Promise<void> {
    const requestId = this.requestId + 1;
    this.requestId = requestId;
    await this.requireBound(
      this.pushSearchState,
      "Search.pushSearchState",
    )({
      query: this.query,
      caseSensitive: this.caseSensitive,
    });
    await this.requireBound(
      this.pushSearchResults,
      "Search.pushSearchResults",
    )([]);
    if (this.query === "") {
      return;
    }

    let results: Card[] = [];
    try {
      results = await this.searchAsync(this.query, this.caseSensitive);
    } catch (error) {
      this.log?.("ERROR", "Search.searchAsync", String(error));
    }
    if (requestId === this.requestId) {
      await this.requireBound(
        this.pushSearchResults,
        "Search.pushSearchResults",
      )(results);
    }
  }

  private async searchAsync(
    query: string,
    caseSensitive: boolean,
  ): Promise<Card[]> {
    interface SearchMatch {
      index: number;
      card: Card;
    }

    const repoRoot = this.requireBound(
      this.getRepoRoot,
      "Search.getRepoRoot",
    )();
    if (repoRoot === "") {
      return [];
    }
    const files = await this.requireBound(
      this.findMarkdownFiles,
      "Search.findMarkdownFiles",
    )(repoRoot);
    const needle = caseSensitive ? query : query.toLowerCase();
    const readTextFile = this.requireBound(
      this.readTextFile,
      "Search.readTextFile",
    );

    const matches = await Promise.all(
      files.map(async function searchFileAsync(
        fsPath: string,
      ): Promise<SearchMatch | null> {
        const docPath = parseDocPath(fsPath);
        if (docPath === null) {
          return null;
        }
        let text: string;
        try {
          text = await readTextFile(fsPath);
        } catch {
          return null;
        }
        const metaText = getMetaSearchText(text);
        const haystack = caseSensitive ? metaText : metaText.toLowerCase();
        const index = haystack.indexOf(needle);
        if (index < 0) {
          return null;
        }
        const meta = parseMeta(text);
        return {
          index,
          card: cardFromMeta(meta, docPath.docid, repoRoot),
        };
      }),
    );

    const seen = new Set<string>();
    return matches
      .filter((match): match is SearchMatch => match !== null)
      .sort(
        (left, right) =>
          left.index - right.index ||
          compareDocid(left.card.docid, right.card.docid),
      )
      .filter(({ card }) => {
        if (seen.has(card.docid)) {
          return false;
        }
        seen.add(card.docid);
        return true;
      })
      .map(({ card }) => card);
  }

  bind(
    showInputBox: ShowInputBox,
    findMarkdownFiles: FindMarkdownFiles,
    readTextFile: ReadTextFile,
    getRepoRoot: GetRepoRoot,
    pushSearchState: PushSearchState,
    pushSearchResults: PushSearchResults,
  ): void {
    assert.ok(
      this.showInputBox === null &&
        this.findMarkdownFiles === null &&
        this.readTextFile === null &&
        this.getRepoRoot === null &&
        this.pushSearchState === null &&
        this.pushSearchResults === null,
      "Search is already bound",
    );
    this.showInputBox = showInputBox;
    this.findMarkdownFiles = findMarkdownFiles;
    this.readTextFile = readTextFile;
    this.getRepoRoot = getRepoRoot;
    this.pushSearchState = pushSearchState;
    this.pushSearchResults = pushSearchResults;
  }
}

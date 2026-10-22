// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../utils/lang";
import * as vscode from "../utils/vscode";

export class LazyAsset {
  static extensionUri: vscode.Uri | null = null;

  assetPath: string | null = null;
  cache: vscode.Uri | null = null;

  init(assetPath: string): this {
    assert.ok(
      typeof assetPath === "string" && assetPath.length > 0,
      "assetPath must be a non-empty string",
    );

    this.assetPath = assetPath;
    this.cache = null;
    return this;
  }

  static setExtensionUri(value: vscode.Uri): void {
    assert.ok(
      typeof value.scheme === "string",
      "extensionUri must be a vscode.Uri",
    );

    if (LazyAsset.extensionUri !== null) {
      assert.strictEqual(
        LazyAsset.extensionUri.toString(),
        value.toString(),
        "extensionUri is already set",
      );
      return;
    }

    LazyAsset.extensionUri = value;
  }

  get(): vscode.Uri {
    const extensionUri = LazyAsset.extensionUri;
    assert.ok(
      this.assetPath !== null,
      "asset path is not set; call init() first",
    );
    assert.ok(
      extensionUri !== null,
      "extensionUri is not set; call LazyAsset.setExtensionUri() first",
    );

    this.cache ??= vscode.Uri.joinPath(extensionUri, "assets", this.assetPath);

    return this.cache;
  }
}

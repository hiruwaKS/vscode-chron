// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as path from "node:path";
import * as assert from "node:assert";
import { inspect } from "node:util";

export function fireAndForget<T>(fn: () => Promise<T>): void {
  void Promise.resolve().then(fn);
}

export function fireAndCatch<T, R = void>(
  fn: () => Promise<T>,
  handleCatch: (error: unknown) => R | PromiseLike<R>,
): void {
  void Promise.resolve().then(fn).catch(handleCatch);
}

export { path, assert, inspect };

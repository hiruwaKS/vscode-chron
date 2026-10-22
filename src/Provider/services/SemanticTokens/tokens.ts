// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TOKEN_TYPES } from "../utils/defs";

export type TokenName = (typeof TOKEN_TYPES)[number];

export type TokenIndexes = Record<TokenName, number>;

export function createTokenIndexes(): TokenIndexes {
  return Object.fromEntries(
    TOKEN_TYPES.map((type, index) => [type, index]),
  ) as TokenIndexes;
}

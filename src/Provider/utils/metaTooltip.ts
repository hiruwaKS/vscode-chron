// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import type { Meta } from "./doc";

export function formatMetaTooltip(meta: Meta): string {
  return [
    meta.title,
    meta.type === "" ? "" : `type: ${meta.type}`,
    meta.authors === "" ? "" : `authors: ${meta.authors}`,
    meta.venue === "" ? "" : `venue: ${meta.venue}`,
    meta.at === "" ? "" : `at: ${meta.at}`,
    meta.doi === "" ? "" : `doi: ${meta.doi}`,
    meta.kp === "" ? "" : `kp: ${meta.kp}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { inspect } from "../utils/lang";

export interface LogEntry {
  at: string;
  level: string;
  text: string;
}

export function formatTrace(args: readonly unknown[]): string {
  const MAX_TRACE_ARG = 300;
  const MAX_TRACE_ARGS = 8;
  const MAX_TRACE_LINE = 1200;
  const MAX_TRACE_STRING = 200;

  function summarizeTraceArg(value: unknown): string {
    let text: string;
    if (typeof value === "string") {
      text =
        value.length > MAX_TRACE_STRING
          ? `${value.slice(0, MAX_TRACE_STRING)}...(${String(value.length)} chars)`
          : value;
      text = JSON.stringify(text);
    } else {
      try {
        text = inspect(value, {
          breakLength: Infinity,
          compact: true,
          depth: 2,
          maxArrayLength: 10,
          maxStringLength: MAX_TRACE_STRING,
        });
      } catch {
        text = String(value);
      }
    }
    text = text.replace(/\r?\n/g, "\\n");
    if (text.length > MAX_TRACE_ARG) {
      text = `${text.slice(0, MAX_TRACE_ARG)}...(${String(text.length)} chars)`;
    }
    return text;
  }

  const [name, ...values] = args;
  const parts = values.slice(0, MAX_TRACE_ARGS).map(summarizeTraceArg);
  if (values.length > MAX_TRACE_ARGS) {
    parts.push(`...(+${String(values.length - MAX_TRACE_ARGS)} args)`);
  }
  const traceName = typeof name === "string" ? name : format(name);
  let text = `${traceName}(${parts.join(", ")})`;
  if (text.length > MAX_TRACE_LINE) {
    text = `${text.slice(0, MAX_TRACE_LINE)}...`;
  }
  return text;
}

export function format(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  try {
    const text: unknown = JSON.stringify(value);
    return typeof text === "string" ? text : String(value);
  } catch {
    return String(value);
  }
}

export function appendBatch(
  current: string,
  batch: readonly LogEntry[],
): string {
  const lines = batch
    .map(({ at, level, text }) => `[${at}] [${level}] ${text}`)
    .join("\n");
  const separator = current && !current.endsWith("\n") ? "\n" : "";
  return `${current}${separator}${lines}\n`;
}

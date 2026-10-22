// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { Service } from "../utils/Service";
import { assert, fireAndForget } from "../utils/lang";
import { appendBatch, format, formatTrace } from "./loggerFormat";
import type { LogEntry } from "./loggerFormat";

export type LogFileExists = () => Promise<boolean>;
export type ReadLogFile = () => Promise<string>;
export type WriteLogFile = (content: string) => Promise<string>;
export type PushLoggingState = (logging: boolean) => void;

export class Logger extends Service {
  private logFileExists: LogFileExists | null = null;
  private readLogFile: ReadLogFile | null = null;
  private writeLogFile: WriteLogFile | null = null;
  pendingLines: LogEntry[] = [];
  writeLock = false;
  logging = false;
  private pushLoggingState: PushLoggingState | null = null;

  init(): string {
    this.log?.("TRACE", "Logger.init");
    this.requireBound(
      this.pushLoggingState,
      "Logger.pushLoggingState",
    )(this.logging);
    return "ok";
  }

  onLog(level: string, ...args: unknown[]): string {
    if (!this.logging) {
      return "ok";
    }
    const name = level.toUpperCase();
    this.queue(
      name,
      name === "TRACE" ? formatTrace(args) : args.map(format).join(" "),
    );
    return "ok";
  }

  onToggleLogging(): boolean {
    this.logging = !this.logging;
    this.requireBound(
      this.pushLoggingState,
      "Logger.pushLoggingState",
    )(this.logging);
    return this.logging;
  }

  queue(level: string, text: string): void {
    this.requireBound(this.logFileExists, "Logger.logFileExists");
    this.requireBound(this.readLogFile, "Logger.readLogFile");
    this.requireBound(this.writeLogFile, "Logger.writeLogFile");
    this.pendingLines.push({
      at: new Date().toISOString(),
      level,
      text,
    });
    if (!this.writeLock) {
      fireAndForget(() => this.flushAsync());
    }
  }

  async flushAsync(): Promise<string> {
    if (this.writeLock) {
      return "ok";
    }
    this.writeLock = true;
    const logFileExists = this.requireBound(
      this.logFileExists,
      "Logger.logFileExists",
    );
    const readLogFile = this.requireBound(
      this.readLogFile,
      "Logger.readLogFile",
    );
    const writeLogFile = this.requireBound(
      this.writeLogFile,
      "Logger.writeLogFile",
    );
    try {
      while (this.pendingLines.length > 0) {
        if (!(await logFileExists())) {
          this.pendingLines.length = 0;
          return "ok";
        }
        const batch = this.pendingLines.splice(0);
        const current = await readLogFile();
        await writeLogFile(appendBatch(current, batch));
      }
      return "ok";
    } finally {
      this.writeLock = false;
    }
  }

  bind(
    logFileExists: LogFileExists,
    readLogFile: ReadLogFile,
    writeLogFile: WriteLogFile,
    pushLoggingState: PushLoggingState,
  ): void {
    assert.ok(
      this.logFileExists === null &&
        this.readLogFile === null &&
        this.writeLogFile === null &&
        this.pushLoggingState === null,
      "Logger is already bound",
    );
    this.logFileExists = logFileExists;
    this.readLogFile = readLogFile;
    this.writeLogFile = writeLogFile;
    this.pushLoggingState = pushLoggingState;
  }
}

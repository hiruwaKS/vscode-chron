// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { assert } from "../../utils/lang";

export type Log = (level: string, ...args: string[]) => void;

export class Service {
  protected log: Log | null = null;

  bindLog(log: Log): void {
    assert.ok(this.log === null, "log is already bound");
    this.log = log;
  }

  protected requireBound<T>(value: T | null, name: string): T {
    assert.ok(value !== null, `${name} is not bound`);
    return value;
  }
}

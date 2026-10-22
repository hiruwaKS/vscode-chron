// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import { TOGGLE_LOGGING, TreeNode } from "../common";

export interface LoggingPresentation {
  label: string;
  tooltip: string;
  iconId: string;
  color: string;
}

export interface LoggingStateOptions {
  logging?: boolean;
}

export class LoggingState extends TreeNode {
  static ON: LoggingPresentation = Object.freeze({
    label: "logging",
    tooltip: "Logging is on",
    iconId: "circleFilled",
    color: "charts.red",
  });

  static OFF: LoggingPresentation = Object.freeze({
    label: "click to start log",
    tooltip: "Click to start logging",
    iconId: "play",
    color: "charts.green",
  });

  logging: boolean;
  action: string;

  constructor(options: LoggingStateOptions = {}) {
    const logging = options.logging ?? false;
    const state = LoggingState.presentation(logging);

    super({
      label: state.label,
      tooltip: state.tooltip,
      iconId: state.iconId,
      color: state.color,
    });

    this.logging = logging;
    this.action = TOGGLE_LOGGING;
  }

  override update(logging: boolean): TreeNode[] {
    if (this.logging === logging) {
      return [];
    }
    const state = LoggingState.presentation(logging);
    this.logging = logging;
    this.label = state.label;
    this.tooltip = state.tooltip;
    this.iconId = state.iconId;
    this.color = state.color;
    return [this];
  }

  static presentation(logging: boolean): LoggingPresentation {
    return logging ? LoggingState.ON : LoggingState.OFF;
  }
}

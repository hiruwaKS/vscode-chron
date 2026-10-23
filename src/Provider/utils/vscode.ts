// (c) 2026 HiruwaKS (with ds v4.1, opencode). Licensed under the MIT License.
import * as vscode from "../../utils/vscode";

// Curated VS Code surface for services. Only the members listed here are
// importable; add new ones deliberately instead of re-exporting the module.
export const Uri = vscode.Uri;
export const Range = vscode.Range;
export const Position = vscode.Position;
export const RelativePattern = vscode.RelativePattern;
export const EventEmitter = vscode.EventEmitter;
export const TreeItem = vscode.TreeItem;
export const TreeItemCollapsibleState = vscode.TreeItemCollapsibleState;
export const ThemeIcon = vscode.ThemeIcon;
export const ThemeColor = vscode.ThemeColor;
export const FileDecoration = vscode.FileDecoration;
export const DocumentLink = vscode.DocumentLink;
export const Diagnostic = vscode.Diagnostic;
export const DiagnosticSeverity = vscode.DiagnosticSeverity;
export const InlayHint = vscode.InlayHint;
export const SemanticTokens = vscode.SemanticTokens;
export const SemanticTokensBuilder = vscode.SemanticTokensBuilder;
export const SemanticTokensLegend = vscode.SemanticTokensLegend;
export const window = vscode.window;
export const workspace = vscode.workspace;
export const commands = vscode.commands;
export const env = vscode.env;

export type CancellationToken = vscode.CancellationToken;
export type Diagnostic = vscode.Diagnostic;
export type DocumentLink = vscode.DocumentLink;
export type EventEmitter<T> = vscode.EventEmitter<T>;
export type FileDecoration = vscode.FileDecoration;
export type FileType = vscode.FileType;
export type InlayHint = vscode.InlayHint;
export type Position = vscode.Position;
export type Range = vscode.Range;
export type SemanticTokens = vscode.SemanticTokens;
export type SemanticTokensLegend = vscode.SemanticTokensLegend;
export type TextDocument = vscode.TextDocument;
export type ThemeColor = vscode.ThemeColor;
export type ThemeIcon = vscode.ThemeIcon;
export type TreeItem = vscode.TreeItem;
export type TreeItemCollapsibleState = vscode.TreeItemCollapsibleState;
export type Uri = vscode.Uri;
export type Disposable = vscode.Disposable;
export type DocumentLinkProvider = vscode.DocumentLinkProvider;
export type ExtensionContext = vscode.ExtensionContext;
export type FileDecorationProvider = vscode.FileDecorationProvider;
export type InlayHintsProvider = vscode.InlayHintsProvider;
export type DocumentSemanticTokensProvider =
  vscode.DocumentSemanticTokensProvider;
export type TextEditor = vscode.TextEditor;
export type TreeDataProvider<T> = vscode.TreeDataProvider<T>;
export const languages = vscode.languages;

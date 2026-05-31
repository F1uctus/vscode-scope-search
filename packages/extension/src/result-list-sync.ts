import * as vscode from 'vscode';
import {
  searchInSpans,
  type SearchMatch,
  type SearchOptions,
  type SpanExtractor,
} from '@scope-search/core';
import type { ScopeSearchPanel } from './panel';

const REFRESH_DEBOUNCE_MS = 200;

let extensionEditDepth = 0;

export function runWithoutResultWatch<T>(fn: () => Promise<T> | T): Promise<T> | T {
  extensionEditDepth++;
  try {
    return fn();
  } finally {
    extensionEditDepth--;
  }
}

export async function runWithoutResultWatchAsync<T>(fn: () => Promise<T>): Promise<T> {
  extensionEditDepth++;
  try {
    return await fn();
  } finally {
    extensionEditDepth--;
  }
}

function isExtensionEdit(): boolean {
  return extensionEditDepth > 0;
}

function countResultFiles(results: SearchMatch[]): number {
  return new Set(results.map((r) => r.path)).size;
}

export class ResultListSync {
  private results: SearchMatch[] = [];
  private fileOrder: string[] = [];
  private options: SearchOptions | undefined;
  private searchId = 0;
  private fileTotal = 0;
  private watchedPaths = new Set<string>();
  private pendingPaths = new Set<string>();
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private refreshGeneration = 0;
  private languageByPath = new Map<string, string | undefined>();

  constructor(
    private readonly extractor: SpanExtractor,
    private readonly panel: ScopeSearchPanel,
    private readonly isSearching: () => boolean,
  ) {}

  bindDocumentWatcher(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (isExtensionEdit() || this.isSearching()) {
          return;
        }
        const filePath = event.document.uri.fsPath;
        if (event.document.uri.scheme !== 'file' || !this.watchedPaths.has(filePath)) {
          return;
        }
        this.scheduleRefresh(filePath);
      }),
    );
  }

  setFromSearch(
    results: SearchMatch[],
    options: SearchOptions,
    searchId: number,
    fileTotal: number,
    languageByPath?: Record<string, string | undefined>,
  ): void {
    this.results = results;
    this.fileOrder = this.fileOrderFromResults(results);
    this.options = options;
    this.searchId = searchId;
    this.fileTotal = fileTotal;
    this.watchedPaths = new Set(results.map((r) => r.path));
    this.languageByPath = new Map(Object.entries(languageByPath ?? {}));
    this.pendingPaths.clear();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  clear(): void {
    this.results = [];
    this.fileOrder = [];
    this.options = undefined;
    this.searchId = 0;
    this.fileTotal = 0;
    this.watchedPaths.clear();
    this.pendingPaths.clear();
    this.languageByPath.clear();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  getResults(): SearchMatch[] {
    return this.results;
  }

  getFileOrder(): string[] {
    return [...this.fileOrder];
  }

  private scheduleRefresh(filePath: string): void {
    if (!this.options?.pattern.trim()) {
      return;
    }
    this.pendingPaths.add(filePath);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = undefined;
      void this.flushScheduled();
    }, REFRESH_DEBOUNCE_MS);
  }

  async refreshFiles(filePaths: string[]): Promise<SearchMatch[]> {
    for (const filePath of filePaths) {
      this.pendingPaths.add(filePath);
    }
    return this.flushScheduled();
  }

  private fileOrderFromResults(results: SearchMatch[]): string[] {
    const order: string[] = [];
    const seen = new Set<string>();
    for (const result of results) {
      if (!seen.has(result.path)) {
        seen.add(result.path);
        order.push(result.path);
      }
    }
    return order;
  }

  private mergeRefreshedResults(
    prior: SearchMatch[],
    refreshedByPath: Map<string, SearchMatch[]>,
    refreshedPaths: Set<string>,
  ): SearchMatch[] {
    const keptByPath = new Map<string, SearchMatch[]>();
    for (const result of prior) {
      if (refreshedPaths.has(result.path)) {
        continue;
      }
      const kept = keptByPath.get(result.path);
      if (kept) {
        kept.push(result);
      } else {
        keptByPath.set(result.path, [result]);
      }
    }

    const merged: SearchMatch[] = [];
    for (const filePath of this.fileOrder) {
      if (refreshedPaths.has(filePath)) {
        merged.push(...(refreshedByPath.get(filePath) ?? []));
      } else {
        merged.push(...(keptByPath.get(filePath) ?? []));
      }
    }
    return merged;
  }

  private async flushScheduled(): Promise<SearchMatch[]> {
    const paths = [...this.pendingPaths];
    this.pendingPaths.clear();
    if (paths.length === 0 || !this.options?.pattern.trim()) {
      return this.results;
    }

    const generation = ++this.refreshGeneration;
    const options = this.options;
    const refreshedPaths = new Set(paths);
    const refreshedByPath = new Map<string, SearchMatch[]>();

    for (const filePath of paths) {
      if (generation !== this.refreshGeneration) {
        return this.results;
      }
      try {
        const uri = vscode.Uri.file(filePath);
        const doc = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === filePath)
          ?? await vscode.workspace.openTextDocument(uri);
        const spans = await this.extractor.extractSpans(filePath, doc.getText(), doc.languageId);
        refreshedByPath.set(filePath, searchInSpans(filePath, doc.getText(), spans, options));
        this.languageByPath.set(filePath, doc.languageId);
      } catch {
        refreshedByPath.set(filePath, []);
      }
    }

    if (generation !== this.refreshGeneration) {
      return this.results;
    }

    this.results = this.mergeRefreshedResults(this.results, refreshedByPath, refreshedPaths);
    this.watchedPaths = new Set(this.results.map((r) => r.path));
    this.publish(true);
    return this.results;
  }

  private publish(preserveExclusions: boolean): void {
    const languageByPath = Object.fromEntries(this.languageByPath.entries());
    this.panel.postResults(this.results, this.searchId, preserveExclusions, languageByPath);
    this.panel.postSearchStatus({
      searchId: this.searchId,
      state: 'complete',
      matchCount: this.results.length,
      fileCount: countResultFiles(this.results),
      fileTotal: this.fileTotal,
    });
  }
}

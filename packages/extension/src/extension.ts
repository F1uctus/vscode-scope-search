import * as vscode from 'vscode';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {
  discoverScopes,
  findModuleRoot,
  buildGrammarBundle,
  parseExtensionManifest,
  type ExtensionManifest,
  type GrammarBundle,
  isLikelyBinaryPath,
  resolveFilesNode,
  mergeExcludeSources,
  readDefaultExcludes,
  replaceInSpans,
  replaceSingleMatch,
  runScopedSearch,
  SpanExtractor,
  validateRegex,
  matchKey,
  matchPositionsEqual,
  scopeLabel,
  type GrammarBundle,
  type MatchPosition,
  type SearchMatch,
  type SearchOptions,
  DEFAULT_SCOPE,
} from '@scope-search/core';
import { ScopeSearchPanel, type PanelState, type ReplacePayload, openSearchResult } from './panel';
import {
  ReplaceHistoryManager,
  type FileCaptureInput,
  type ReplaceHistoryEntry,
  fileHashMatches,
  applyStrictUndoToFile,
  applyForceUndoToFile,
} from './replace-history';
import { ResultListSync, runWithoutResultWatchAsync } from './result-list-sync';

const DEFAULT_SCOPES = [{ id: DEFAULT_SCOPE, label: scopeLabel(DEFAULT_SCOPE) }];
const PANEL_STATE_KEY = 'scopeSearch.panelState';

function loadGrammarBundleFromExtensions(): GrammarBundle {
  const manifests: ExtensionManifest[] = [];
  for (const ext of vscode.extensions.all) {
    const manifest = parseExtensionManifest(ext.extensionPath, ext.packageJSON as {
      contributes?: {
        grammars?: Array<{ language?: string; scopeName: string; path: string }>;
        languages?: Array<{ id: string; configuration?: string }>;
      };
    });
    if (manifest) {
      manifests.push(manifest);
    }
  }
  return buildGrammarBundle(manifests);
}

function patternsFromConfiguration(searchCfg: vscode.WorkspaceConfiguration, filesCfg: vscode.WorkspaceConfiguration): string[] {
  const patterns: string[] = [];
  for (const [key, val] of Object.entries(searchCfg.get<Record<string, boolean>>('exclude') ?? {})) {
    if (val) {
      patterns.push(key);
    }
  }
  for (const [key, val] of Object.entries(filesCfg.get<Record<string, boolean>>('exclude') ?? {})) {
    if (val) {
      patterns.push(key);
    }
  }
  return patterns;
}

function getDefaultExcludePatterns(): string[] {
  const folders = vscode.workspace.workspaceFolders ?? [];
  const sources: string[][] = [];

  if (folders.length === 0) {
    sources.push(patternsFromConfiguration(
      vscode.workspace.getConfiguration('search'),
      vscode.workspace.getConfiguration('files'),
    ));
  } else {
    for (const folder of folders) {
      sources.push(patternsFromConfiguration(
        vscode.workspace.getConfiguration('search', folder.uri),
        vscode.workspace.getConfiguration('files', folder.uri),
      ));
      sources.push(readDefaultExcludes(path.join(folder.uri.fsPath, '.vscode', 'settings.json')));
    }
  }

  return mergeExcludeSources(...sources);
}

function filterTextUris(uris: vscode.Uri[]): vscode.Uri[] {
  return uris.filter((uri) => !isLikelyBinaryPath(uri.fsPath));
}

async function resolveFiles(include?: string, exclude?: string): Promise<vscode.Uri[]> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length === 0) {
    return [];
  }

  const defaultExcludes = getDefaultExcludePatterns();
  const paths: string[] = [];
  for (const folder of folders) {
    const remaining = 2000 - paths.length;
    if (remaining <= 0) {
      break;
    }
    const found = await resolveFilesNode({
      cwd: folder.uri.fsPath,
      paths: ['.'],
      include,
      exclude,
      defaultExcludes,
      useDefaultExcludes: false,
      maxFiles: remaining,
    });
    paths.push(...found);
  }
  return filterTextUris(paths.map((p) => vscode.Uri.file(p)));
}

async function tryReadFile(
  uri: vscode.Uri,
): Promise<{ path: string; text: string; languageId?: string } | undefined> {
  if (isLikelyBinaryPath(uri.fsPath)) {
    return undefined;
  }
  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    return {
      path: uri.fsPath,
      text: doc.getText(),
      languageId: doc.languageId,
    };
  } catch {
    return undefined;
  }
}

function countResultFiles(results: SearchMatch[]): number {
  return new Set(results.map((r) => r.path)).size;
}

function languageByPathFromFiles(
  files: Array<{ path: string; languageId?: string }>,
  results: SearchMatch[],
): Record<string, string | undefined> {
  const map: Record<string, string | undefined> = {};
  for (const file of files) {
    map[file.path] = file.languageId;
  }
  for (const result of results) {
    if (!(result.path in map)) {
      map[result.path] = undefined;
    }
  }
  return map;
}

function isMatchSkipped(
  match: SearchMatch,
  skipMatches?: Array<MatchPosition & { path: string }>,
): boolean {
  if (!skipMatches?.length) {
    return false;
  }
  const key = matchKey(match);
  return skipMatches.some((s) => matchKey(s) === key);
}

function visibleResultsAfterSkip(
  results: SearchMatch[],
  skipMatches?: Array<MatchPosition & { path: string }>,
): SearchMatch[] {
  return results.filter((m) => !isMatchSkipped(m, skipMatches));
}

type UndoFocusTarget = {
  path: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
};

function undoFocusTarget(payload: ReplacePayload): UndoFocusTarget | undefined {
  const extended = payload as ReplacePayload & Partial<UndoFocusTarget>;
  if (
    typeof extended.path === 'string'
    && typeof extended.startLine === 'number'
    && typeof extended.startCol === 'number'
    && typeof extended.endLine === 'number'
    && typeof extended.endCol === 'number'
  ) {
    return {
      path: extended.path,
      startLine: extended.startLine,
      startCol: extended.startCol,
      endLine: extended.endLine,
      endCol: extended.endCol,
    };
  }
  return undefined;
}

async function focusAfterUndo(entry: ReplaceHistoryEntry, results: SearchMatch[]): Promise<void> {
  const exact = undoFocusTarget(entry.searchPayload);
  if (exact) {
    await openSearchResult({ type: 'openResult', ...exact });
    return;
  }

  const payload = entry.searchPayload as ReplacePayload & { path?: string };
  const filePath = payload.path ?? entry.files[0]?.path;
  if (!filePath) {
    return;
  }

  const match = visibleResultsAfterSkip(results, payload.skipMatches)
    .find((m) => m.path === filePath);
  if (match) {
    await openSearchResult({
      type: 'openResult',
      path: match.path,
      startLine: match.startLine,
      startCol: match.startCol,
      endLine: match.endLine,
      endCol: match.endCol,
    });
  }
}

async function focusFirstMatchInNextFile(
  replacedFilePath: string,
  fileOrder: string[],
  results: SearchMatch[],
  skipMatches?: Array<MatchPosition & { path: string }>,
): Promise<void> {
  const visible = visibleResultsAfterSkip(results, skipMatches);
  const startIndex = fileOrder.indexOf(replacedFilePath);
  if (startIndex === -1) {
    const next = visible.find((m) => m.path !== replacedFilePath);
    if (next) {
      await openSearchResult({
        type: 'openResult',
        path: next.path,
        startLine: next.startLine,
        startCol: next.startCol,
        endLine: next.endLine,
        endCol: next.endCol,
      });
    }
    return;
  }

  for (let i = startIndex + 1; i < fileOrder.length; i++) {
    const match = visible.find((m) => m.path === fileOrder[i]);
    if (match) {
      await openSearchResult({
        type: 'openResult',
        path: match.path,
        startLine: match.startLine,
        startCol: match.startCol,
        endLine: match.endLine,
        endCol: match.endCol,
      });
      return;
    }
  }
}

function resolveReplaceTarget(
  visible: SearchMatch[],
  payload: {
    path: string;
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
    replacedIndex?: number;
  },
): SearchMatch | undefined {
  const inFile = visible.filter((m) => m.path === payload.path);
  const byCoords = inFile.find((m) => matchPositionsEqual(m, payload));
  if (byCoords) {
    return byCoords;
  }

  if (inFile.length === 1) {
    return inFile[0];
  }

  if (
    payload.replacedIndex != null
    && payload.replacedIndex < visible.length
    && visible[payload.replacedIndex]!.path === payload.path
  ) {
    return visible[payload.replacedIndex];
  }

  const key = matchKey(payload);
  return inFile.find((m) => matchKey(m) === key);
}

async function focusAfterReplaceOne(
  replacedPath: string,
  replacedIndex: number | undefined,
  results: SearchMatch[],
  fileOrder: string[],
  skipMatches?: Array<MatchPosition & { path: string }>,
): Promise<void> {
  const visible = visibleResultsAfterSkip(results, skipMatches);

  if (replacedIndex != null && replacedIndex < visible.length) {
    const next = visible[replacedIndex]!;
    await openSearchResult({
      type: 'openResult',
      path: next.path,
      startLine: next.startLine,
      startCol: next.startCol,
      endLine: next.endLine,
      endCol: next.endCol,
    });
    return;
  }

  const nextInFile = visible.find((m) => m.path === replacedPath);
  if (nextInFile) {
    await openSearchResult({
      type: 'openResult',
      path: nextInFile.path,
      startLine: nextInFile.startLine,
      startCol: nextInFile.startCol,
      endLine: nextInFile.endLine,
      endCol: nextInFile.endCol,
    });
    return;
  }

  await focusFirstMatchInNextFile(replacedPath, fileOrder, results, skipMatches);
}

function searchOptionsFromReplace(payload: ReplacePayload): SearchOptions {
  return {
    pattern: payload.query,
    isRegex: !!payload.isRegex,
    isCaseSensitive: !!payload.isCaseSensitive,
    matchWholeWord: !!payload.matchWholeWord,
    scopeId: payload.scopeId ?? DEFAULT_SCOPE,
  };
}

function skipForFile(
  skipMatches: Array<MatchPosition & { path: string }> | undefined,
  filePath: string,
): MatchPosition[] {
  return (skipMatches ?? [])
    .filter((m) => m.path === filePath)
    .map(({ startLine, startCol, endLine, endCol }) => ({ startLine, startCol, endLine, endCol }));
}

async function applyTextEdits(
  doc: vscode.TextDocument,
  edits: Array<{ start: number; end: number; text: string }>,
): Promise<boolean> {
  return runWithoutResultWatchAsync(async () => {
    if (edits.length === 0) {
      return false;
    }

    const uri = doc.uri;
    const sorted = [...edits].sort((a, b) => b.start - a.start);
    const toRange = (start: number, end: number) =>
      new vscode.Range(doc.positionAt(start), doc.positionAt(end));

    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.toString() === uri.toString(),
    );
    if (editor) {
      const applied = await editor.edit((builder) => {
        for (const edit of sorted) {
          builder.replace(toRange(edit.start, edit.end), edit.text);
        }
      });
      if (applied) {
        return true;
      }
    }

    const workspaceEdit = new vscode.WorkspaceEdit();
    for (const edit of sorted) {
      workspaceEdit.replace(uri, toRange(edit.start, edit.end), edit.text);
    }
    return vscode.workspace.applyEdit(workspaceEdit);
  });
}

async function applyFullFileReplace(
  extractor: SpanExtractor,
  filePath: string,
  options: SearchOptions,
  replacement: string,
  skip?: MatchPosition[],
): Promise<{ count: number; capture?: FileCaptureInput }> {
  if (isLikelyBinaryPath(filePath)) {
    return { count: 0 };
  }
  const uri = vscode.Uri.file(filePath);
  const existing = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === filePath);
  const doc = existing ?? await vscode.workspace.openTextDocument(uri);
  const preContent = doc.getText();
  const preVersion = doc.version;
  const spans = await extractor.extractSpans(filePath, preContent, doc.languageId);
  const { count, edits } = replaceInSpans(preContent, spans, {
    ...options,
    replacement,
    skip,
  });
  if (count === 0) {
    return { count: 0 };
  }

  const applied = await applyTextEdits(doc, edits);
  if (!applied) {
    throw new Error('Replace failed: could not apply edit.');
  }

  const updatedDoc = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === filePath)
    ?? await vscode.workspace.openTextDocument(uri);

  return {
    count,
    capture: {
      path: filePath,
      preContent,
      postContent: updatedDoc.getText(),
      preVersion,
      postVersion: updatedDoc.version,
    },
  };
}

function postHistoryState(panel: ScopeSearchPanel, history: ReplaceHistoryManager): void {
  panel.postHistoryState({
    canUndo: history.canUndo(),
    label: history.peekLabel(),
  });
}

async function recordReplaceHistory(
  history: ReplaceHistoryManager,
  panel: ScopeSearchPanel,
  label: string,
  captures: FileCaptureInput[],
  searchPayload: ReplacePayload,
): Promise<void> {
  if (captures.length === 0) {
    return;
  }
  const entryId = crypto.randomUUID();
  const files = [];
  for (const capture of captures) {
    files.push(await history.persistFileArtifacts(entryId, capture));
  }
  await history.push({
    id: entryId,
    label,
    files,
    searchPayload,
  });
  postHistoryState(panel, history);
}

function setSearchingContext(active: boolean): void {
  void vscode.commands.executeCommand('setContext', 'scopeSearch.searching', active);
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const preferTreeSitter = vscode.workspace.getConfiguration('scopeSearch').get<boolean>('preferTreeSitter', true);
  const moduleRoot = findModuleRoot(context.extensionPath);
  const grammarBundle = loadGrammarBundleFromExtensions();
  const extractor = new SpanExtractor(grammarBundle.primaryGrammars, {
    preferTreeSitter,
    moduleRoot,
    commentRules: grammarBundle.commentRules,
    grammarsByScope: grammarBundle.grammarsByScope,
  });

  const panel = new ScopeSearchPanel(context.extensionUri);
  const replaceHistory = await ReplaceHistoryManager.create(context);
  let searching = false;
  const resultSync = new ResultListSync(extractor, panel, () => searching);
  resultSync.bindDocumentWatcher(context);
  const setActiveSearch = (active: boolean) => {
    searching = active;
    setSearchingContext(active);
  };
  let latestSearchId = 0;
  let stopSearchId = 0;
  let scopeUpdateId = 0;

  const loadPanelState = (): PanelState =>
    context.workspaceState.get<PanelState>(PANEL_STATE_KEY) ?? {};

  const savePanelState = async (state: PanelState): Promise<void> => {
    await context.workspaceState.update(PANEL_STATE_KEY, state);
  };

  const updateScopes = (payload: { include?: string; exclude?: string } = {}): void => {
    const updateId = ++scopeUpdateId;
    void (async () => {
      try {
        let uris = await resolveFiles(payload.include, payload.exclude);
        if (uris.length === 0 && vscode.workspace.workspaceFolders?.length) {
          await new Promise((r) => setTimeout(r, 400));
          uris = await resolveFiles(payload.include, payload.exclude);
        }
        if (updateId !== scopeUpdateId) {
          return;
        }
        if (uris.length === 0) {
          panel.postScopes(DEFAULT_SCOPES);
          return;
        }

        const uriByPath = new Map(uris.map((u) => [u.fsPath, u]));
        const scopes = await discoverScopes(
          extractor,
          uris.map((u) => u.fsPath),
          async (p) => {
            const uri = uriByPath.get(p);
            if (!uri) {
              return '';
            }
            const file = await tryReadFile(uri);
            return file?.text ?? '';
          },
          async (p) => {
            const uri = uriByPath.get(p);
            if (!uri) {
              return undefined;
            }
            const file = await tryReadFile(uri);
            return file?.languageId;
          },
        );
        if (updateId !== scopeUpdateId) {
          return;
        }
        panel.postScopes(scopes.length > 0 ? scopes : DEFAULT_SCOPES);
      } catch (err) {
        if (updateId !== scopeUpdateId) {
          return;
        }
        panel.postScopes(DEFAULT_SCOPES);
        console.warn('[scope-search] scope discovery failed:', err);
      }
    })();
  };

  const doSearch = async (payload: {
    searchId: number;
    query: string;
    replace?: string;
    include?: string;
    exclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    scopeId?: string;
  }): Promise<void> => {
    const searchId = payload.searchId;
    latestSearchId = searchId;

    try {
      const options: SearchOptions = {
        pattern: payload.query,
        isRegex: !!payload.isRegex,
        isCaseSensitive: !!payload.isCaseSensitive,
        matchWholeWord: !!payload.matchWholeWord,
        scopeId: payload.scopeId ?? DEFAULT_SCOPE,
      };

      if (!options.pattern.trim()) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: 'idle' });
        resultSync.clear();
        panel.postResults([], searchId);
        return;
      }

      if (options.isRegex) {
        const err = validateRegex(options.pattern);
        if (err) {
          setActiveSearch(false);
          panel.postSearchStatus({ searchId, state: 'idle' });
          panel.postError(err);
          return;
        }
      }

      setActiveSearch(true);
      panel.postSearchStatus({ searchId, state: 'searching', phase: 'listing' });

      const uris = await resolveFiles(payload.include, payload.exclude);
      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        return;
      }

      const fileTotal = uris.length;
      const files: Array<{ path: string; text: string; languageId?: string }> = [];
      for (let i = 0; i < uris.length; i++) {
        if (searchId !== latestSearchId || searchId <= stopSearchId) {
          setActiveSearch(false);
          panel.postSearchStatus({ searchId, state: 'stopped' });
          return;
        }
        const uri = uris[i]!;
        panel.postSearchStatus({
          searchId,
          state: 'searching',
          phase: 'reading',
          currentFile: path.basename(uri.fsPath),
          fileIndex: i + 1,
          fileTotal,
        });
        const file = await tryReadFile(uri);
        if (file) {
          files.push(file);
        }
      }

      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: 'stopped' });
        return;
      }

      const results = await runScopedSearch(
        extractor,
        files,
        options,
        (progress) => {
          if (searchId !== latestSearchId || searchId <= stopSearchId) {
            return;
          }
          panel.postSearchStatus({
            searchId,
            state: 'searching',
            phase: 'searching',
            currentFile: path.basename(progress.filePath),
            fileIndex: progress.fileIndex,
            fileTotal: progress.fileTotal,
            matchCount: progress.matchCount,
          });
        },
        () => searchId !== latestSearchId || searchId <= stopSearchId,
      );

      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: 'stopped' });
        return;
      }

      setActiveSearch(false);
      const langByPath = languageByPathFromFiles(files, results);
      resultSync.setFromSearch(results, options, searchId, fileTotal, langByPath);
      panel.postResults(results, searchId, false, langByPath);
      panel.postSearchStatus({
        searchId,
        state: 'complete',
        matchCount: results.length,
        fileCount: countResultFiles(results),
        fileTotal,
      });
    } catch (err) {
      if (searchId !== latestSearchId) {
        return;
      }
      setActiveSearch(false);
      console.warn('[scope-search] search failed:', err);
      resultSync.clear();
      panel.postResults([], searchId);
      panel.postSearchStatus({ searchId, state: 'complete', matchCount: 0, fileCount: 0 });
    }
  };

  const replaceAllInFile = async (payload: ReplacePayload & { path: string }): Promise<void> => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err = validateRegex(options.pattern);
      if (err) {
        panel.postError(err);
        return;
      }
    }

    try {
      const { count, capture } = await applyFullFileReplace(
        extractor,
        payload.path,
        options,
        payload.replace,
        skipForFile(payload.skipMatches, payload.path),
      );
      if (count === 0) {
        return;
      }
      if (capture) {
        await recordReplaceHistory(
          replaceHistory,
          panel,
          `Replace All in File (${count} in ${path.basename(payload.path)})`,
          [capture],
          payload,
        );
      }
      const results = await resultSync.refreshFiles([payload.path]);
      await focusFirstMatchInNextFile(
        payload.path,
        resultSync.getFileOrder(),
        results,
        payload.skipMatches,
      );
    } catch (err) {
      console.warn('[scope-search] replace failed:', err);
      panel.postError(err instanceof Error ? err.message : String(err));
    }
  };

  const replaceAll = async (payload: ReplacePayload): Promise<void> => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err = validateRegex(options.pattern);
      if (err) {
        panel.postError(err);
        return;
      }
    }

    const paths = payload.paths ?? [];
    if (paths.length === 0) {
      return;
    }

    try {
      const captures: FileCaptureInput[] = [];
      let total = 0;
      for (const filePath of paths) {
        const { count, capture } = await applyFullFileReplace(
          extractor,
          filePath,
          options,
          payload.replace,
          skipForFile(payload.skipMatches, filePath),
        );
        total += count;
        if (capture) {
          captures.push(capture);
        }
      }
      if (total === 0) {
        return;
      }
      const fileCount = captures.length;
      await recordReplaceHistory(
        replaceHistory,
        panel,
        fileCount === 1
          ? `Replace All (${total} in ${path.basename(captures[0]!.path)})`
          : `Replace All (${total} in ${fileCount} files)`,
        captures,
        payload,
      );
      await resultSync.refreshFiles(captures.map((c) => c.path));
    } catch (err) {
      console.warn('[scope-search] replace all failed:', err);
      panel.postError(err instanceof Error ? err.message : String(err));
    }
  };

  const replaceOne = async (
    payload: ReplacePayload & {
      path: string;
      startLine: number;
      startCol: number;
      endLine: number;
      endCol: number;
      replacedIndex?: number;
    },
  ): Promise<void> => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err = validateRegex(options.pattern);
      if (err) {
        panel.postError(err);
        return;
      }
    }
    if (isLikelyBinaryPath(payload.path)) {
      return;
    }

    try {
      const uri = vscode.Uri.file(payload.path);
      const existing = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === payload.path);
      const doc = existing ?? await vscode.workspace.openTextDocument(uri);

      const synced = await resultSync.refreshFiles([payload.path]);
      const target = resolveReplaceTarget(
        visibleResultsAfterSkip(synced, payload.skipMatches),
        payload,
      );
      if (!target) {
        panel.postError('Replace failed: match not found (results may be stale).');
        return;
      }

      const text = doc.getText();
      const spans = await extractor.extractSpans(payload.path, text, doc.languageId);
      const matchAt: MatchPosition = {
        startLine: target.startLine,
        startCol: target.startCol,
        endLine: target.endLine,
        endCol: target.endCol,
      };
      const start = doc.offsetAt(new vscode.Position(matchAt.startLine, matchAt.startCol));
      const end = doc.offsetAt(new vscode.Position(matchAt.endLine, matchAt.endCol));
      const preContent = text;
      const preVersion = doc.version;
      const { replacement, count } = replaceSingleMatch(text, spans, {
        ...options,
        replacement: payload.replace,
      }, matchAt);
      if (count === 0) {
        panel.postError('Replace failed: match not found at expected location.');
        return;
      }

      const applied = await applyTextEdits(doc, [{ start, end, text: replacement }]);
      if (!applied) {
        panel.postError('Replace failed: could not apply edit.');
        return;
      }

      const updatedDoc = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === payload.path)
        ?? await vscode.workspace.openTextDocument(uri);
      await recordReplaceHistory(
        replaceHistory,
        panel,
        `Replace 1 in ${path.basename(payload.path)}`,
        [{
          path: payload.path,
          preContent,
          postContent: updatedDoc.getText(),
          preVersion,
          postVersion: updatedDoc.version,
        }],
        payload,
      );

      const results = await resultSync.refreshFiles([payload.path]);
      await focusAfterReplaceOne(
        payload.path,
        payload.replacedIndex,
        results,
        resultSync.getFileOrder(),
        payload.skipMatches,
      );
    } catch (err) {
      console.warn('[scope-search] replace one failed:', err);
      panel.postError(err instanceof Error ? err.message : String(err));
    }
  };

  const undoLastReplace = async (): Promise<void> => {
    const entry = replaceHistory.peek();
    if (!entry) {
      postHistoryState(panel, replaceHistory);
      return;
    }

    const mismatched: string[] = [];
    const docs = new Map<string, vscode.TextDocument>();
    for (const record of entry.files) {
      const uri = vscode.Uri.file(record.path);
      const existing = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === record.path);
      const doc = existing ?? await vscode.workspace.openTextDocument(uri);
      docs.set(record.path, doc);
      if (!fileHashMatches(record, doc.getText())) {
        mismatched.push(path.basename(record.path));
      }
    }

    let force = false;
    if (mismatched.length > 0) {
      const list = mismatched.join(', ');
      const choice = await vscode.window.showWarningMessage(
        `Cannot safely undo replace: ${list} ${mismatched.length === 1 ? 'was' : 'were'} modified after the replace. Use Force Undo to restore the pre-replace version anyway.`,
        'Force Undo',
        'Cancel',
      );
      if (choice !== 'Force Undo') {
        return;
      }
      force = true;
      const confirm = await vscode.window.showWarningMessage(
        `Force undo will overwrite the current content of ${entry.files.length} file(s) with the version from before the replace. This action may be irreversible.`,
        { modal: true },
        'Overwrite',
      );
      if (confirm !== 'Overwrite') {
        return;
      }
    }

    try {
      await runWithoutResultWatchAsync(async () => {
        for (const record of entry.files) {
          const doc = docs.get(record.path)!;
          const ok = force
            ? await applyForceUndoToFile(replaceHistory, record, doc)
            : await applyStrictUndoToFile(replaceHistory, record, doc);
          if (!ok) {
            throw new Error(`Undo failed for ${record.path}`);
          }
        }
      });
      await replaceHistory.pop();
      postHistoryState(panel, replaceHistory);
      const results = await resultSync.refreshFiles(entry.files.map((f) => f.path));
      await focusAfterUndo(entry, results);
    } catch (err) {
      console.warn('[scope-search] undo failed:', err);
      panel.postError(err instanceof Error ? err.message : String(err));
    }
  };

  panel.onMessage((msg) => {
    if (msg.type === 'search') {
      void doSearch(msg);
    } else if (msg.type === 'replaceAllInFile') {
      void replaceAllInFile(msg);
    } else if (msg.type === 'replaceAll') {
      void replaceAll(msg);
    } else if (msg.type === 'replaceOne') {
      void replaceOne(msg);
    } else if (msg.type === 'undoLastReplace') {
      void undoLastReplace();
    } else if (msg.type === 'saveState') {
      void savePanelState(msg.state);
    } else if (msg.type === 'ready') {
      panel.postRestoreState(loadPanelState());
      postHistoryState(panel, replaceHistory);
      updateScopes({
        include: loadPanelState().include,
        exclude: loadPanelState().exclude,
      });
    } else if (msg.type === 'updateScope') {
      updateScopes(msg);
    }
  });

  panel.onViewReady = () => {
    panel.postRestoreState(loadPanelState());
    postHistoryState(panel, replaceHistory);
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('scopeSearch.panel', panel, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      void updateScopes({
        include: loadPanelState().include,
        exclude: loadPanelState().exclude,
      });
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('search.exclude') || e.affectsConfiguration('files.exclude')) {
        void updateScopes({
          include: loadPanelState().include,
          exclude: loadPanelState().exclude,
        });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('scopeSearch.run', async () => {
      await vscode.commands.executeCommand('scopeSearch.panel.focus');
      panel.focusQuery();
    }),
    vscode.commands.registerCommand('scopeSearch.focus', async () => {
      await vscode.commands.executeCommand('scopeSearch.panel.focus');
    }),
    vscode.commands.registerCommand('scopeSearch.stop', () => {
      stopSearchId = latestSearchId;
      latestSearchId += 1;
      setActiveSearch(false);
      panel.requestStop();
    }),
    vscode.commands.registerCommand('scopeSearch.refresh', () => {
      panel.requestRefresh();
    }),
    vscode.commands.registerCommand('scopeSearch.clear', () => {
      stopSearchId = latestSearchId;
      latestSearchId += 1;
      setActiveSearch(false);
      panel.requestClear();
    }),
  );
}

export function deactivate(): void {
  setSearchingContext(false);
}

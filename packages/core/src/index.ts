export * from './types';
export * from './scopes';
export * from './search';
export * from './replacement';
export * from './files';
export * from './scopediscovery';
export { SpanExtractor, buildGrammarMap, buildGrammarBundle, loadExtensionManifests, loadAllExtensionManifests, parseExtensionManifest } from './grammars/registry';
export * from './binary';
export { findModuleRoot } from './paths';
export type { ExtensionManifest } from './files';
export { createTextMateBackend, TextMateBackend } from './grammars/textmate';
export { createTreeSitterBackend, TreeSitterBackend } from './grammars/treesitter';

import type { GrammarBundle, GrammarContribution, SearchMatch, SearchOptions } from './types';
import { SpanExtractor } from './grammars/registry';
import { buildGrammarBundle } from './files';
import { searchInSpans, replaceInSpans } from './search';

export interface SearchProgress {
  filePath: string;
  fileIndex: number;
  fileTotal: number;
  matchCount: number;
}

export async function runScopedSearch(
  extractor: SpanExtractor,
  files: Array<{ path: string; text: string; languageId?: string }>,
  options: SearchOptions,
  onProgress?: (progress: SearchProgress) => void,
  isCancelled?: () => boolean,
): Promise<SearchMatch[]> {
  const all: SearchMatch[] = [];
  const total = files.length;
  for (let i = 0; i < files.length; i++) {
    if (isCancelled?.()) {
      break;
    }
    const file = files[i]!;
    onProgress?.({
      filePath: file.path,
      fileIndex: i + 1,
      fileTotal: total,
      matchCount: all.length,
    });
    const spans = await extractor.extractSpans(file.path, file.text, file.languageId);
    if (isCancelled?.()) {
      break;
    }
    all.push(...searchInSpans(file.path, file.text, spans, options));
  }
  return all;
}

export function grammarMapFromContributions(contributions: GrammarContribution[]): Map<string, GrammarContribution> {
  return buildGrammarBundleFromContributions(contributions).primaryGrammars;
}

export function buildGrammarBundleFromContributions(contributions: GrammarContribution[]): GrammarBundle {
  const manifest = {
    extensionPath: '',
    grammars: contributions,
    grammarsByScope: contributions.map((g) => ({
      scopeName: g.scopeName,
      grammarPath: g.grammarPath,
      extensionPath: g.extensionPath,
      languageId: g.languageId,
    })),
    languageIds: [...new Set(contributions.map((g) => g.languageId))],
    commentRules: new Map(),
  };
  return buildGrammarBundle([manifest]);
}

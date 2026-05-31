import * as fs from 'node:fs';
import type { ScopeInfo, SemanticSpan } from './types';
import { DEFAULT_SCOPE, scopeLabel } from './types';
import { SpanExtractor } from './grammars/registry';
import { sampleFilesByLanguage } from './files';
import { filterTextPaths } from './binary';

export async function discoverScopes(
  extractor: SpanExtractor,
  files: string[],
  readText: (path: string) => string | Promise<string>,
  getLanguageId?: (path: string) => string | undefined | Promise<string | undefined>,
): Promise<ScopeInfo[]> {
  const sampled = sampleFilesByLanguage(filterTextPaths(files));
  const found = new Set<string>();

  for (const file of sampled) {
    try {
      let text: string;
      const raw = readText(file);
      text = raw instanceof Promise ? await raw : raw;
      const langRaw = getLanguageId?.(file);
      const lang = langRaw instanceof Promise ? await langRaw : langRaw;
      const spans = await extractor.extractSpans(file, text, lang);
      for (const span of spans) {
        found.add(span.category);
      }
    } catch {
      // skip unreadable, binary, or unsupported files
    }
  }

  if (found.size === 0) {
    return [{ id: DEFAULT_SCOPE, label: scopeLabel(DEFAULT_SCOPE) }];
  }

  const ordered = [...found].sort();
  if (found.has(DEFAULT_SCOPE)) {
    return [
      { id: DEFAULT_SCOPE, label: scopeLabel(DEFAULT_SCOPE) },
      ...ordered.filter((id) => id !== DEFAULT_SCOPE).map((id) => ({ id, label: scopeLabel(id) })),
    ];
  }
  return ordered.map((id) => ({ id, label: scopeLabel(id) }));
}

export function collectCategories(spans: SemanticSpan[]): string[] {
  return [...new Set(spans.map((s) => s.category))].sort();
}

export async function discoverScopesFromSpans(
  extractor: SpanExtractor,
  files: string[],
  readText: (path: string) => string | Promise<string>,
): Promise<ScopeInfo[]> {
  return discoverScopes(extractor, files, readText);
}

export function readFileText(path: string): string {
  return fs.readFileSync(path, 'utf8');
}

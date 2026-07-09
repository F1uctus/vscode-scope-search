import type { GrammarContribution, LanguageCommentRules, SemanticSpan, SpanExtractOptions } from '../types';
import { createTextMateBackend, TextMateBackend } from './textmate';
import { createTreeSitterBackend, TreeSitterBackend } from './treesitter';
import {
  extractCommentSpansFallback,
  hasCommentSpans,
} from './fallback';
import { guessLanguageId, grammarLanguageIds, resolveLanguageId } from '../files';

function dedupeSpans(spans: SemanticSpan[]): SemanticSpan[] {
  const seen = new Set<string>();
  const out: SemanticSpan[] = [];
  for (const s of spans) {
    const key = `${s.start}:${s.end}:${s.category}:${s.source}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(s);
  }
  return out;
}

// Span extraction re-tokenizes with installed TextMate grammars. VS Code provides
// no public API to read live editor tokens; semantic/LSP tokens are not used here.
export class SpanExtractor {
  private textmate: TextMateBackend;
  private treesitter: TreeSitterBackend;
  private preferTreeSitter: boolean;
  private grammarMap: Map<string, GrammarContribution>;
  private commentRules?: Map<string, LanguageCommentRules>;

  constructor(
    grammarMap: Map<string, GrammarContribution>,
    options: SpanExtractOptions = {},
  ) {
    const moduleRoot = options.moduleRoot;
    this.grammarMap = grammarMap;
    this.commentRules = options.commentRules;
    this.textmate = createTextMateBackend(grammarMap, moduleRoot, options.grammarsByScope);
    this.treesitter = createTreeSitterBackend(moduleRoot);
    this.preferTreeSitter = options.preferTreeSitter !== false;
  }

  async extractSpans(filePath: string, text: string, languageId?: string): Promise<SemanticSpan[]> {
    const langs = grammarLanguageIds(languageId ?? guessLanguageId(filePath), this.grammarMap);
    const spans: SemanticSpan[] = [];

    try {
      for (const lang of langs) {
        const resolved = resolveLanguageId(lang);
        if (this.preferTreeSitter && this.treesitter.hasParser(resolved)) {
          spans.push(...await this.treesitter.extractSpans(resolved, text));
        }
        spans.push(...await this.textmate.extractSpans(resolved, text));
        if (resolved !== lang) {
          spans.push(...await this.textmate.extractSpans(lang, text));
        }
      }
    } catch {
      // grammar backends may fail; language-config fallback may still run
    }

    if (!hasCommentSpans(spans)) {
      for (const lang of langs) {
        spans.push(...extractCommentSpansFallback(text, lang, this.commentRules));
        if (hasCommentSpans(spans)) {
          break;
        }
      }
    }

    return dedupeSpans(spans);
  }

  /** TextMate scope stack at a document offset, from the first grammar that yields one. */
  async getScopesAt(
    filePath: string,
    text: string,
    languageId: string | undefined,
    offset: number,
  ): Promise<string[] | undefined> {
    const langs = grammarLanguageIds(languageId ?? guessLanguageId(filePath), this.grammarMap);
    for (const lang of langs) {
      const resolved = resolveLanguageId(lang);
      const scopes = await this.textmate.scopesAt(resolved, text, offset)
        ?? (resolved !== lang ? await this.textmate.scopesAt(lang, text, offset) : undefined);
      if (scopes) {
        return scopes;
      }
    }
    return undefined;
  }
}

export {
  buildGrammarMap,
  buildGrammarBundle,
  loadExtensionManifests,
  loadAllExtensionManifests,
  parseExtensionManifest,
} from '../files';
export type { ExtensionManifest } from '../files';

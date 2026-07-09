import * as fs from 'node:fs';
import { Registry, parseRawGrammar, type IGrammar, INITIAL } from 'vscode-textmate';
import type { OnigScanner, OnigString } from 'vscode-oniguruma';
import type { GrammarContribution, GrammarScopeContribution, SemanticSpan } from '../types';
import { classifyTextMateScopes } from '../scopes';
import { resolveFromModuleRoot } from '../paths';

let onigReady: Promise<{ createOnigScanner: (patterns: string[]) => OnigScanner; createOnigString: (s: string) => OnigString }> | undefined;
let onigReadyRoot: string | undefined;

async function getOnigLib(moduleRoot?: string) {
  if (!onigReady || onigReadyRoot !== moduleRoot) {
    onigReadyRoot = moduleRoot;
    onigReady = (async () => {
      const onig = await import('vscode-oniguruma');
      const wasmPath = resolveFromModuleRoot(moduleRoot, 'vscode-oniguruma/release/onig.wasm');
      const wasmBin = fs.readFileSync(wasmPath);
      await onig.loadWASM(wasmBin);
      return {
        createOnigScanner: (patterns: string[]) => new onig.OnigScanner(patterns),
        createOnigString: (s: string) => new onig.OnigString(s),
      };
    })();
  }
  return onigReady;
}

export class TextMateBackend {
  private registry?: Registry;
  private grammarCache = new Map<string, IGrammar>();
  private grammarMap: Map<string, GrammarContribution>;
  private grammarsByScope: Map<string, GrammarScopeContribution>;
  private moduleRoot?: string;

  constructor(
    grammarMap: Map<string, GrammarContribution>,
    moduleRoot?: string,
    grammarsByScope?: Map<string, GrammarScopeContribution>,
  ) {
    this.grammarMap = grammarMap;
    this.grammarsByScope = grammarsByScope ?? buildScopeMapFromPrimary(grammarMap);
    this.moduleRoot = moduleRoot;
  }

  private async ensureRegistry(): Promise<Registry> {
    if (this.registry) {
      return this.registry;
    }
    const onigLib = await getOnigLib(this.moduleRoot);
    const grammarsByScope = this.grammarsByScope;
    this.registry = new Registry({
      onigLib: Promise.resolve(onigLib),
      loadGrammar: async (scopeName: string) => {
        const g = grammarsByScope.get(scopeName);
        if (g && fs.existsSync(g.grammarPath)) {
          const raw = fs.readFileSync(g.grammarPath, 'utf8');
          return parseRawGrammar(raw, g.grammarPath);
        }
        return null;
      },
    });
    return this.registry;
  }

  private async loadGrammar(languageId: string): Promise<IGrammar | undefined> {
    const contrib = this.grammarMap.get(languageId);
    if (!contrib) {
      return undefined;
    }
    const registry = await this.ensureRegistry();
    let grammar = this.grammarCache.get(contrib.scopeName);
    if (!grammar) {
      grammar = await registry.loadGrammar(contrib.scopeName) ?? undefined;
      if (!grammar) {
        return undefined;
      }
      this.grammarCache.set(contrib.scopeName, grammar);
    }
    return grammar;
  }

  async extractSpans(languageId: string, text: string): Promise<SemanticSpan[]> {
    try {
      const grammar = await this.loadGrammar(languageId);
      if (!grammar) {
        return [];
      }

      const spans: SemanticSpan[] = [];
      const lines = text.split('\n');
      let offset = 0;
      let ruleStack = INITIAL;
      for (const line of lines) {
        const lineTokens = grammar.tokenizeLine(line, ruleStack);
        ruleStack = lineTokens.ruleStack;
        for (const token of lineTokens.tokens) {
          const category = classifyTextMateScopes(token.scopes);
          if (!category) {
            continue;
          }
          spans.push({
            start: offset + token.startIndex,
            end: offset + token.endIndex,
            category,
            source: 'textmate',
          });
        }
        offset += line.length + 1;
      }
      return spans;
    } catch {
      return [];
    }
  }

  /**
   * TextMate scope stack of the token covering the given document offset.
   * Tokenization state is line-sequential, so lines are tokenized from the
   * document start up to the target line.
   */
  async scopesAt(languageId: string, text: string, offset: number): Promise<string[] | undefined> {
    try {
      const grammar = await this.loadGrammar(languageId);
      if (!grammar) {
        return undefined;
      }

      const lines = text.split('\n');
      let lineStart = 0;
      let ruleStack = INITIAL;
      for (const line of lines) {
        const lineEnd = lineStart + line.length;
        const lineTokens = grammar.tokenizeLine(line, ruleStack);
        if (offset >= lineStart && offset < lineEnd) {
          const column = offset - lineStart;
          for (const token of lineTokens.tokens) {
            if (column >= token.startIndex && column < token.endIndex) {
              return [...token.scopes];
            }
          }
          return undefined;
        }
        ruleStack = lineTokens.ruleStack;
        lineStart = lineEnd + 1;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}

function buildScopeMapFromPrimary(grammarMap: Map<string, GrammarContribution>): Map<string, GrammarScopeContribution> {
  const map = new Map<string, GrammarScopeContribution>();
  for (const g of grammarMap.values()) {
    if (!map.has(g.scopeName)) {
      map.set(g.scopeName, {
        scopeName: g.scopeName,
        grammarPath: g.grammarPath,
        extensionPath: g.extensionPath,
        languageId: g.languageId,
      });
    }
  }
  return map;
}

export function createTextMateBackend(
  grammarMap: Map<string, GrammarContribution>,
  moduleRoot?: string,
  grammarsByScope?: Map<string, GrammarScopeContribution>,
): TextMateBackend {
  return new TextMateBackend(grammarMap, moduleRoot, grammarsByScope);
}

export interface SemanticSpan {
  start: number;
  end: number;
  category: string;
  source: 'textmate' | 'tree-sitter';
}

export interface SearchMatch {
  path: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  matchedText: string;
  preview: string;
}

export interface MatchPosition {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export function matchKey(match: SearchMatch | (MatchPosition & { path: string })): string {
  return `${match.path}:${match.startLine}:${match.startCol}:${match.endLine}:${match.endCol}`;
}

export function matchPositionsEqual(a: MatchPosition, b: MatchPosition): boolean {
  return a.startLine === b.startLine
    && a.startCol === b.startCol
    && a.endLine === b.endLine
    && a.endCol === b.endCol;
}

export interface SearchOptions {
  pattern: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  matchWholeWord: boolean;
  scopeId: string;
}

export interface FileQuery {
  include?: string;
  exclude?: string;
  useDefaultExcludes?: boolean;
}

export interface GrammarContribution {
  languageId: string;
  scopeName: string;
  grammarPath: string;
  extensionPath: string;
}

export interface GrammarScopeContribution {
  scopeName: string;
  grammarPath: string;
  extensionPath: string;
  languageId?: string;
}

export interface LanguageCommentRules {
  lineComment?: string;
  lineCommentEnd?: string;
  blockComment?: [string, string];
}

export interface GrammarBundle {
  primaryGrammars: Map<string, GrammarContribution>;
  grammarsByScope: Map<string, GrammarScopeContribution>;
  commentRules: Map<string, LanguageCommentRules>;
}

export interface ScopeInfo {
  id: string;
  label: string;
}

export interface SpanExtractOptions {
  preferTreeSitter?: boolean;
  moduleRoot?: string;
  commentRules?: Map<string, LanguageCommentRules>;
  grammarsByScope?: Map<string, GrammarScopeContribution>;
}

export const DEFAULT_SCOPE = 'comment';

export const SCOPE_LABELS: Record<string, string> = {
  comment: 'Comments',
  string: 'Strings',
  keyword: 'Keywords',
  type: 'Types',
  variable: 'Variables',
  constant: 'Constants',
  number: 'Numbers',
  operator: 'Operators',
  punctuation: 'Punctuation',
  meta: 'Meta',
};

export function scopeLabel(id: string): string {
  return SCOPE_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

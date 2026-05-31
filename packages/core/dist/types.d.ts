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
export declare function matchKey(match: SearchMatch | (MatchPosition & {
    path: string;
})): string;
export declare function matchPositionsEqual(a: MatchPosition, b: MatchPosition): boolean;
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
export declare const DEFAULT_SCOPE = "comment";
export declare const SCOPE_LABELS: Record<string, string>;
export declare function scopeLabel(id: string): string;
//# sourceMappingURL=types.d.ts.map
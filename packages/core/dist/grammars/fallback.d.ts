import type { LanguageCommentRules, SemanticSpan } from '../types';
export declare function extractCommentSpansFromLanguageConfig(text: string, rules: LanguageCommentRules | undefined): SemanticSpan[];
export declare function extractCommentSpansFallback(text: string, languageId: string, commentRules?: Map<string, LanguageCommentRules>): SemanticSpan[];
export declare function hasCommentSpans(spans: SemanticSpan[]): boolean;
//# sourceMappingURL=fallback.d.ts.map
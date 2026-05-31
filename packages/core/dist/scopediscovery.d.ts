import type { ScopeInfo, SemanticSpan } from './types';
import { SpanExtractor } from './grammars/registry';
export declare function discoverScopes(extractor: SpanExtractor, files: string[], readText: (path: string) => string | Promise<string>, getLanguageId?: (path: string) => string | undefined | Promise<string | undefined>): Promise<ScopeInfo[]>;
export declare function collectCategories(spans: SemanticSpan[]): string[];
export declare function discoverScopesFromSpans(extractor: SpanExtractor, files: string[], readText: (path: string) => string | Promise<string>): Promise<ScopeInfo[]>;
export declare function readFileText(path: string): string;
//# sourceMappingURL=scopediscovery.d.ts.map
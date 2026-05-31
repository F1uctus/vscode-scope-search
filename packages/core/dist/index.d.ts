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
export interface SearchProgress {
    filePath: string;
    fileIndex: number;
    fileTotal: number;
    matchCount: number;
}
export declare function runScopedSearch(extractor: SpanExtractor, files: Array<{
    path: string;
    text: string;
    languageId?: string;
}>, options: SearchOptions, onProgress?: (progress: SearchProgress) => void, isCancelled?: () => boolean): Promise<SearchMatch[]>;
export declare function grammarMapFromContributions(contributions: GrammarContribution[]): Map<string, GrammarContribution>;
export declare function buildGrammarBundleFromContributions(contributions: GrammarContribution[]): GrammarBundle;
//# sourceMappingURL=index.d.ts.map
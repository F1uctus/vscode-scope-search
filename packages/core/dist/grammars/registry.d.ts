import type { GrammarContribution, SemanticSpan, SpanExtractOptions } from '../types';
export declare class SpanExtractor {
    private textmate;
    private treesitter;
    private preferTreeSitter;
    private grammarMap;
    private commentRules?;
    constructor(grammarMap: Map<string, GrammarContribution>, options?: SpanExtractOptions);
    extractSpans(filePath: string, text: string, languageId?: string): Promise<SemanticSpan[]>;
}
export { buildGrammarMap, buildGrammarBundle, loadExtensionManifests, loadAllExtensionManifests, parseExtensionManifest, } from '../files';
export type { ExtensionManifest } from '../files';
//# sourceMappingURL=registry.d.ts.map
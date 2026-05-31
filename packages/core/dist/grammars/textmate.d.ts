import type { GrammarContribution, GrammarScopeContribution, SemanticSpan } from '../types';
export declare class TextMateBackend {
    private registry?;
    private grammarCache;
    private grammarMap;
    private grammarsByScope;
    private moduleRoot?;
    constructor(grammarMap: Map<string, GrammarContribution>, moduleRoot?: string, grammarsByScope?: Map<string, GrammarScopeContribution>);
    private ensureRegistry;
    extractSpans(languageId: string, text: string): Promise<SemanticSpan[]>;
}
export declare function createTextMateBackend(grammarMap: Map<string, GrammarContribution>, moduleRoot?: string, grammarsByScope?: Map<string, GrammarScopeContribution>): TextMateBackend;
//# sourceMappingURL=textmate.d.ts.map
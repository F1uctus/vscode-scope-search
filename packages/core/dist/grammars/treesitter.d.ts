import type { SemanticSpan } from '../types';
export declare class TreeSitterBackend {
    private initPromise?;
    private parsers;
    private wasmDir;
    private moduleRoot?;
    constructor(moduleRoot?: string);
    private ensureInit;
    hasParser(languageId: string): boolean;
    private getParser;
    extractSpans(languageId: string, text: string): Promise<SemanticSpan[]>;
}
export declare function createTreeSitterBackend(moduleRoot?: string): TreeSitterBackend;
//# sourceMappingURL=treesitter.d.ts.map
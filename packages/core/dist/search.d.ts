import type { MatchPosition, SearchMatch, SearchOptions, SemanticSpan } from './types';
export declare function searchInSpans(path: string, fileText: string, spans: SemanticSpan[], options: SearchOptions): SearchMatch[];
export interface ReplaceOptions extends SearchOptions {
    replacement: string;
    skip?: MatchPosition[];
}
export declare function replaceSingleMatch(fileText: string, spans: SemanticSpan[], options: ReplaceOptions, at: MatchPosition): {
    replacement: string;
    count: number;
};
export interface TextEdit {
    start: number;
    end: number;
    text: string;
}
export declare function replaceInSpans(fileText: string, spans: SemanticSpan[], options: ReplaceOptions): {
    text: string;
    count: number;
    edits: TextEdit[];
};
export declare function validateRegex(pattern: string): string | undefined;
//# sourceMappingURL=search.d.ts.map
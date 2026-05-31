export interface ReplacementOptions {
    pattern: string;
    isRegex: boolean;
    isCaseSensitive: boolean;
}
export declare function applyReplacementTemplate(replacement: string, match: RegExpExecArray, context: string): string;
export declare function resolveMatchReplacement(replacement: string, matchedText: string, options: ReplacementOptions, context?: string, matchStartInContext?: number): string;
//# sourceMappingURL=replacement.d.ts.map
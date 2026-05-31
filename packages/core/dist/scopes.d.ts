export declare function classifyTextMateScopes(scopes: string[]): string | undefined;
export declare function classifyTreeSitterCapture(name: string): string | undefined;
export declare function classifyTreeSitterNodeType(type: string): string | undefined;
export declare function mergeSpans(spans: Array<{
    start: number;
    end: number;
}>): Array<{
    start: number;
    end: number;
}>;
export declare function offsetToLineCol(text: string, offset: number): {
    line: number;
    col: number;
};
export declare function lineColToOffset(text: string, line: number, col: number): number;
//# sourceMappingURL=scopes.d.ts.map
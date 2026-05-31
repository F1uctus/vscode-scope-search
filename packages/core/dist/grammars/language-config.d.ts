import type { LanguageCommentRules } from '../types';
interface RawLanguageConfiguration {
    comments?: {
        lineComment?: string | {
            start: string;
            end?: string;
        };
        blockComment?: [string, string];
    };
}
/** Strip line and block comments from JSONC (language-configuration.json). */
export declare function stripJsonComments(text: string): string;
export declare function parseLanguageConfiguration(configPath: string): LanguageCommentRules | undefined;
export declare function commentRulesFromConfiguration(raw: RawLanguageConfiguration): LanguageCommentRules | undefined;
export declare function mergeCommentRules(target: Map<string, LanguageCommentRules>, languageId: string, rules: LanguageCommentRules | undefined): void;
export {};
//# sourceMappingURL=language-config.d.ts.map
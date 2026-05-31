import type { GrammarBundle, GrammarContribution, GrammarScopeContribution, LanguageCommentRules } from './types';
export interface ExtensionManifest {
    extensionPath: string;
    grammars: GrammarContribution[];
    grammarsByScope: GrammarScopeContribution[];
    languageIds: string[];
    commentRules: Map<string, LanguageCommentRules>;
}
interface PackageContributions {
    contributes?: {
        grammars?: Array<{
            language?: string;
            scopeName: string;
            path: string;
        }>;
        languages?: Array<{
            id: string;
            configuration?: string;
        }>;
    };
}
export declare function parseExtensionManifest(extensionPath: string, pkg: PackageContributions): ExtensionManifest | undefined;
export declare function loadExtensionManifests(extensionsDir: string): ExtensionManifest[];
export declare function loadAllExtensionManifests(dirs: string[]): ExtensionManifest[];
export declare function buildGrammarMap(manifests: ExtensionManifest[]): Map<string, GrammarContribution>;
export declare function buildGrammarBundle(manifests: ExtensionManifest[]): GrammarBundle;
export declare function readDefaultExcludes(settingsPath: string): string[];
export declare function parseGlobInput(input?: string): string[];
/** Expand VS Code-style folder excludes (_opam, .venv) for fast-glob/picomatch. */
export declare function normalizeExcludePattern(pattern: string): string[];
export declare function normalizeExcludePatterns(patterns: string[]): string[];
export declare function collectExcludePatterns(explicit?: string, defaults?: string[]): string[];
export declare function combineExcludePatterns(explicit?: string, defaults?: string[]): string | undefined;
export declare function mergeExcludeSources(...sources: string[][]): string[];
export interface ResolveFilesOptions {
    cwd: string;
    paths?: string[];
    include?: string;
    exclude?: string;
    useDefaultExcludes?: boolean;
    defaultExcludes?: string[];
    settingsPath?: string;
    maxFiles?: number;
}
export declare function resolveFilesNode(options: ResolveFilesOptions): Promise<string[]>;
export declare function guessLanguageId(filePath: string): string;
export declare function relatedLanguageIds(languageId: string): string[];
export declare function resolveLanguageId(languageId: string): string;
export declare function grammarLanguageIds(languageId: string, primaryGrammars?: Map<string, GrammarContribution>): string[];
export declare function sampleFilesByLanguage(files: string[], maxPerLanguage?: number, maxTotal?: number): string[];
export {};
//# sourceMappingURL=files.d.ts.map
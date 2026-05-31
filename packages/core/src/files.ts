import * as fs from 'node:fs';
import * as path from 'node:path';
import fg from 'fast-glob';
import picomatch from 'picomatch';
import type { GrammarBundle, GrammarContribution, GrammarScopeContribution, LanguageCommentRules } from './types';
import { isLikelyBinaryPath } from './binary';
import { mergeCommentRules, parseLanguageConfiguration } from './grammars/language-config';

export interface ExtensionManifest {
  extensionPath: string;
  grammars: GrammarContribution[];
  grammarsByScope: GrammarScopeContribution[];
  languageIds: string[];
  commentRules: Map<string, LanguageCommentRules>;
}

interface PackageContributions {
  contributes?: {
    grammars?: Array<{ language?: string; scopeName: string; path: string }>;
    languages?: Array<{ id: string; configuration?: string }>;
  };
}

export function parseExtensionManifest(extensionPath: string, pkg: PackageContributions): ExtensionManifest | undefined {
  const grammars: GrammarContribution[] = [];
  const grammarsByScope: GrammarScopeContribution[] = [];
  const languageIds: string[] = [];
  const commentRules = new Map<string, LanguageCommentRules>();

  for (const lang of pkg.contributes?.languages ?? []) {
    languageIds.push(lang.id);
    if (lang.configuration) {
      mergeCommentRules(commentRules, lang.id, parseLanguageConfiguration(path.join(extensionPath, lang.configuration)));
    }
  }

  for (const g of pkg.contributes?.grammars ?? []) {
    const scope: GrammarScopeContribution = {
      scopeName: g.scopeName,
      grammarPath: path.join(extensionPath, g.path),
      extensionPath,
      languageId: g.language,
    };
    grammarsByScope.push(scope);
    if (g.language) {
      grammars.push({
        languageId: g.language,
        scopeName: g.scopeName,
        grammarPath: scope.grammarPath,
        extensionPath,
      });
    }
  }

  if (grammars.length === 0 && grammarsByScope.length === 0 && commentRules.size === 0) {
    return undefined;
  }

  return { extensionPath, grammars, grammarsByScope, languageIds, commentRules };
}

export function loadExtensionManifests(extensionsDir: string): ExtensionManifest[] {
  if (!fs.existsSync(extensionsDir)) {
    return [];
  }
  const manifests: ExtensionManifest[] = [];
  for (const entry of fs.readdirSync(extensionsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const extensionPath = path.join(extensionsDir, entry.name);
    const pkgPath = path.join(extensionPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      continue;
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as PackageContributions;
      const manifest = parseExtensionManifest(extensionPath, pkg);
      if (manifest) {
        manifests.push(manifest);
      }
    } catch {
      // skip invalid manifests
    }
  }
  return manifests;
}

export function loadAllExtensionManifests(dirs: string[]): ExtensionManifest[] {
  const seen = new Set<string>();
  const all: ExtensionManifest[] = [];
  for (const dir of dirs) {
    for (const manifest of loadExtensionManifests(dir)) {
      const key = manifest.extensionPath;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      all.push(manifest);
    }
  }
  return all;
}

export function buildGrammarMap(manifests: ExtensionManifest[]): Map<string, GrammarContribution> {
  return buildGrammarBundle(manifests).primaryGrammars;
}

export function buildGrammarBundle(manifests: ExtensionManifest[]): GrammarBundle {
  const primaryGrammars = selectPrimaryGrammars(manifests);
  const grammarsByScope = new Map<string, GrammarScopeContribution>();
  const commentRules = new Map<string, LanguageCommentRules>();

  for (const manifest of manifests) {
    for (const g of manifest.grammarsByScope) {
      if (!grammarsByScope.has(g.scopeName)) {
        grammarsByScope.set(g.scopeName, g);
      }
    }
    for (const [langId, rules] of manifest.commentRules) {
      if (!commentRules.has(langId)) {
        commentRules.set(langId, rules);
      }
    }
  }

  return { primaryGrammars, grammarsByScope, commentRules };
}

function selectPrimaryGrammars(manifests: ExtensionManifest[]): Map<string, GrammarContribution> {
  const byLanguage = new Map<string, GrammarContribution[]>();
  const languageOwners = new Map<string, Set<string>>();

  for (const manifest of manifests) {
    for (const langId of manifest.languageIds) {
      let owners = languageOwners.get(langId);
      if (!owners) {
        owners = new Set();
        languageOwners.set(langId, owners);
      }
      owners.add(manifest.extensionPath);
    }
    for (const g of manifest.grammars) {
      const list = byLanguage.get(g.languageId) ?? [];
      list.push(g);
      byLanguage.set(g.languageId, list);
    }
  }

  const result = new Map<string, GrammarContribution>();
  for (const [langId, candidates] of byLanguage) {
    const owners = languageOwners.get(langId);
    const preferred = owners
      ? candidates.filter((c) => owners.has(c.extensionPath))
      : candidates;
    const chosen = preferred[0] ?? candidates[0];
    if (chosen) {
      result.set(langId, chosen);
    }
  }
  return result;
}

export function readDefaultExcludes(settingsPath: string): string[] {
  if (!fs.existsSync(settingsPath)) {
    return [];
  }
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as {
      'search.exclude'?: Record<string, boolean>;
      'files.exclude'?: Record<string, boolean>;
    };
    const patterns: string[] = [];
    for (const [key, val] of Object.entries(settings['search.exclude'] ?? {})) {
      if (val) {
        patterns.push(key);
      }
    }
    for (const [key, val] of Object.entries(settings['files.exclude'] ?? {})) {
      if (val) {
        patterns.push(key);
      }
    }
    return patterns;
  } catch {
    return [];
  }
}

export function parseGlobInput(input?: string): string[] {
  if (!input?.trim()) {
    return [];
  }
  return input.split(',').map((p) => p.trim()).filter(Boolean);
}

/** Expand VS Code-style folder excludes (_opam, .venv) for fast-glob/picomatch. */
export function normalizeExcludePattern(pattern: string): string[] {
  const p = pattern.trim();
  if (!p) {
    return [];
  }
  if (/[*?[\]{}]/.test(p)) {
    return [p];
  }
  if (p.includes('/')) {
    const withGlob = p.endsWith('/') ? `${p}**` : `${p}/**`;
    return p === withGlob ? [p] : [p, withGlob];
  }
  return [p, `${p}/**`, `**/${p}/**`];
}

export function normalizeExcludePatterns(patterns: string[]): string[] {
  return [...new Set(patterns.flatMap(normalizeExcludePattern))];
}

export function collectExcludePatterns(explicit?: string, defaults: string[] = []): string[] {
  return normalizeExcludePatterns([...defaults, ...parseGlobInput(explicit)].filter(Boolean));
}

export function combineExcludePatterns(explicit?: string, defaults: string[] = []): string | undefined {
  const parts = collectExcludePatterns(explicit, defaults);
  if (parts.length === 0) {
    return undefined;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return `{${parts.join(',')}}`;
}

export function mergeExcludeSources(...sources: string[][]): string[] {
  return collectExcludePatterns(undefined, sources.flat());
}

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

function makeMatcher(patterns: string[], matchWhenEmpty: boolean): (input: string) => boolean {
  if (patterns.length === 0) {
    return () => matchWhenEmpty;
  }
  const matchers = patterns.map((p) => picomatch(p, { dot: true }));
  return (input: string) => matchers.some((m) => m(input));
}

export async function resolveFilesNode(options: ResolveFilesOptions): Promise<string[]> {
  const cwd = options.cwd;
  const searchRoots = options.paths?.length ? options.paths : ['.'];
  const defaultExcludes = options.defaultExcludes ?? (
    options.useDefaultExcludes !== false
      ? readDefaultExcludes(options.settingsPath ?? path.join(cwd, '.vscode', 'settings.json'))
      : []
  );
  const ignorePatterns = collectExcludePatterns(options.exclude, defaultExcludes);
  const includePatterns = parseGlobInput(options.include);
  const isMatchInclude = makeMatcher(includePatterns.length ? includePatterns : ['**/*'], true);
  const isMatchExclude = makeMatcher(ignorePatterns, false);

  const maxFiles = options.maxFiles ?? Number.POSITIVE_INFINITY;
  const files: string[] = [];
  for (const root of searchRoots) {
    const absRoot = path.resolve(cwd, root);
    const entries = await fg('**/*', {
      cwd: absRoot,
      absolute: true,
      onlyFiles: true,
      dot: true,
      followSymbolicLinks: true,
      suppressErrors: true,
      ignore: ignorePatterns.length ? ignorePatterns : undefined,
    });
    for (const file of entries) {
      if (files.length >= maxFiles) {
        return files;
      }
      if (isLikelyBinaryPath(file)) {
        continue;
      }
      const rel = path.relative(cwd, file).replace(/\\/g, '/');
      if (!isMatchInclude(rel) && !isMatchInclude('/' + rel)) {
        continue;
      }
      if (isMatchExclude(rel) || isMatchExclude('/' + rel)) {
        continue;
      }
      files.push(file);
    }
  }
  return files;
}

export function guessLanguageId(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescriptreact',
    '.js': 'javascript',
    '.jsx': 'javascriptreact',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.py': 'python',
    '.rs': 'rust',
    '.go': 'go',
    '.v': 'rocq',
    '.coq': 'rocq',
    '.json': 'json',
    '.css': 'css',
    '.html': 'html',
    '.md': 'markdown',
    '.typ': 'typst',
    '.toml': 'toml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.hpp': 'cpp',
    '.java': 'java',
    '.rb': 'ruby',
    '.sh': 'shellscript',
    '.bash': 'shellscript',
  };
  return map[ext] ?? (ext.slice(1) || 'plaintext');
}

/** Map VS Code language ids to related grammar/parser ids. */
const LANGUAGE_ALIASES: Record<string, string> = {
  rocq: 'coq',
  coq: 'rocq',
  javascriptreact: 'typescriptreact',
};

export function relatedLanguageIds(languageId: string): string[] {
  const ids = [languageId];
  const alias = LANGUAGE_ALIASES[languageId];
  if (alias && !ids.includes(alias)) {
    ids.push(alias);
  }
  for (const [from, to] of Object.entries(LANGUAGE_ALIASES)) {
    if (to === languageId && !ids.includes(from)) {
      ids.push(from);
    }
  }
  return ids;
}

export function resolveLanguageId(languageId: string): string {
  return LANGUAGE_ALIASES[languageId] ?? languageId;
}

export function grammarLanguageIds(
  languageId: string,
  primaryGrammars?: Map<string, GrammarContribution>,
): string[] {
  if (primaryGrammars?.has(languageId)) {
    return [languageId];
  }
  const related = relatedLanguageIds(languageId);
  if (primaryGrammars) {
    const withGrammar = related.filter((id) => primaryGrammars.has(id));
    return withGrammar.length > 0 ? withGrammar : [languageId];
  }
  return related;
}

export function sampleFilesByLanguage(files: string[], maxPerLanguage = 20, maxTotal = 50): string[] {
  if (files.length <= maxTotal) {
    return files;
  }
  const byLang = new Map<string, string[]>();
  for (const f of files) {
    const lang = guessLanguageId(f);
    const list = byLang.get(lang) ?? [];
    list.push(f);
    byLang.set(lang, list);
  }
  const sampled: string[] = [];
  for (const list of byLang.values()) {
    sampled.push(...list.slice(0, maxPerLanguage));
  }
  return sampled;
}

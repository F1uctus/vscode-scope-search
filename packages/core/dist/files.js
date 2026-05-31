"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExtensionManifest = parseExtensionManifest;
exports.loadExtensionManifests = loadExtensionManifests;
exports.loadAllExtensionManifests = loadAllExtensionManifests;
exports.buildGrammarMap = buildGrammarMap;
exports.buildGrammarBundle = buildGrammarBundle;
exports.readDefaultExcludes = readDefaultExcludes;
exports.parseGlobInput = parseGlobInput;
exports.normalizeExcludePattern = normalizeExcludePattern;
exports.normalizeExcludePatterns = normalizeExcludePatterns;
exports.collectExcludePatterns = collectExcludePatterns;
exports.combineExcludePatterns = combineExcludePatterns;
exports.mergeExcludeSources = mergeExcludeSources;
exports.resolveFilesNode = resolveFilesNode;
exports.guessLanguageId = guessLanguageId;
exports.relatedLanguageIds = relatedLanguageIds;
exports.resolveLanguageId = resolveLanguageId;
exports.grammarLanguageIds = grammarLanguageIds;
exports.sampleFilesByLanguage = sampleFilesByLanguage;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const picomatch_1 = __importDefault(require("picomatch"));
const binary_1 = require("./binary");
const language_config_1 = require("./grammars/language-config");
function parseExtensionManifest(extensionPath, pkg) {
    const grammars = [];
    const grammarsByScope = [];
    const languageIds = [];
    const commentRules = new Map();
    for (const lang of pkg.contributes?.languages ?? []) {
        languageIds.push(lang.id);
        if (lang.configuration) {
            (0, language_config_1.mergeCommentRules)(commentRules, lang.id, (0, language_config_1.parseLanguageConfiguration)(path.join(extensionPath, lang.configuration)));
        }
    }
    for (const g of pkg.contributes?.grammars ?? []) {
        const scope = {
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
function loadExtensionManifests(extensionsDir) {
    if (!fs.existsSync(extensionsDir)) {
        return [];
    }
    const manifests = [];
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
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const manifest = parseExtensionManifest(extensionPath, pkg);
            if (manifest) {
                manifests.push(manifest);
            }
        }
        catch {
            // skip invalid manifests
        }
    }
    return manifests;
}
function loadAllExtensionManifests(dirs) {
    const seen = new Set();
    const all = [];
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
function buildGrammarMap(manifests) {
    return buildGrammarBundle(manifests).primaryGrammars;
}
function buildGrammarBundle(manifests) {
    const primaryGrammars = selectPrimaryGrammars(manifests);
    const grammarsByScope = new Map();
    const commentRules = new Map();
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
function selectPrimaryGrammars(manifests) {
    const byLanguage = new Map();
    const languageOwners = new Map();
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
    const result = new Map();
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
function readDefaultExcludes(settingsPath) {
    if (!fs.existsSync(settingsPath)) {
        return [];
    }
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const patterns = [];
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
    }
    catch {
        return [];
    }
}
function parseGlobInput(input) {
    if (!input?.trim()) {
        return [];
    }
    return input.split(',').map((p) => p.trim()).filter(Boolean);
}
/** Expand VS Code-style folder excludes (_opam, .venv) for fast-glob/picomatch. */
function normalizeExcludePattern(pattern) {
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
function normalizeExcludePatterns(patterns) {
    return [...new Set(patterns.flatMap(normalizeExcludePattern))];
}
function collectExcludePatterns(explicit, defaults = []) {
    return normalizeExcludePatterns([...defaults, ...parseGlobInput(explicit)].filter(Boolean));
}
function combineExcludePatterns(explicit, defaults = []) {
    const parts = collectExcludePatterns(explicit, defaults);
    if (parts.length === 0) {
        return undefined;
    }
    if (parts.length === 1) {
        return parts[0];
    }
    return `{${parts.join(',')}}`;
}
function mergeExcludeSources(...sources) {
    return collectExcludePatterns(undefined, sources.flat());
}
function makeMatcher(patterns, matchWhenEmpty) {
    if (patterns.length === 0) {
        return () => matchWhenEmpty;
    }
    const matchers = patterns.map((p) => (0, picomatch_1.default)(p, { dot: true }));
    return (input) => matchers.some((m) => m(input));
}
async function resolveFilesNode(options) {
    const cwd = options.cwd;
    const searchRoots = options.paths?.length ? options.paths : ['.'];
    const defaultExcludes = options.defaultExcludes ?? (options.useDefaultExcludes !== false
        ? readDefaultExcludes(options.settingsPath ?? path.join(cwd, '.vscode', 'settings.json'))
        : []);
    const ignorePatterns = collectExcludePatterns(options.exclude, defaultExcludes);
    const includePatterns = parseGlobInput(options.include);
    const isMatchInclude = makeMatcher(includePatterns.length ? includePatterns : ['**/*'], true);
    const isMatchExclude = makeMatcher(ignorePatterns, false);
    const maxFiles = options.maxFiles ?? Number.POSITIVE_INFINITY;
    const files = [];
    for (const root of searchRoots) {
        const absRoot = path.resolve(cwd, root);
        const entries = await (0, fast_glob_1.default)('**/*', {
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
            if ((0, binary_1.isLikelyBinaryPath)(file)) {
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
function guessLanguageId(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
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
const LANGUAGE_ALIASES = {
    rocq: 'coq',
    coq: 'rocq',
    javascriptreact: 'typescriptreact',
};
function relatedLanguageIds(languageId) {
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
function resolveLanguageId(languageId) {
    return LANGUAGE_ALIASES[languageId] ?? languageId;
}
function grammarLanguageIds(languageId, primaryGrammars) {
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
function sampleFilesByLanguage(files, maxPerLanguage = 20, maxTotal = 50) {
    if (files.length <= maxTotal) {
        return files;
    }
    const byLang = new Map();
    for (const f of files) {
        const lang = guessLanguageId(f);
        const list = byLang.get(lang) ?? [];
        list.push(f);
        byLang.set(lang, list);
    }
    const sampled = [];
    for (const list of byLang.values()) {
        sampled.push(...list.slice(0, maxPerLanguage));
    }
    return sampled;
}
//# sourceMappingURL=files.js.map
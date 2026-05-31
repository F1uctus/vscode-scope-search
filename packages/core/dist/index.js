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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeSitterBackend = exports.createTreeSitterBackend = exports.TextMateBackend = exports.createTextMateBackend = exports.findModuleRoot = exports.parseExtensionManifest = exports.loadAllExtensionManifests = exports.loadExtensionManifests = exports.buildGrammarBundle = exports.buildGrammarMap = exports.SpanExtractor = void 0;
exports.runScopedSearch = runScopedSearch;
exports.grammarMapFromContributions = grammarMapFromContributions;
exports.buildGrammarBundleFromContributions = buildGrammarBundleFromContributions;
__exportStar(require("./types"), exports);
__exportStar(require("./scopes"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./replacement"), exports);
__exportStar(require("./files"), exports);
__exportStar(require("./scopediscovery"), exports);
var registry_1 = require("./grammars/registry");
Object.defineProperty(exports, "SpanExtractor", { enumerable: true, get: function () { return registry_1.SpanExtractor; } });
Object.defineProperty(exports, "buildGrammarMap", { enumerable: true, get: function () { return registry_1.buildGrammarMap; } });
Object.defineProperty(exports, "buildGrammarBundle", { enumerable: true, get: function () { return registry_1.buildGrammarBundle; } });
Object.defineProperty(exports, "loadExtensionManifests", { enumerable: true, get: function () { return registry_1.loadExtensionManifests; } });
Object.defineProperty(exports, "loadAllExtensionManifests", { enumerable: true, get: function () { return registry_1.loadAllExtensionManifests; } });
Object.defineProperty(exports, "parseExtensionManifest", { enumerable: true, get: function () { return registry_1.parseExtensionManifest; } });
__exportStar(require("./binary"), exports);
var paths_1 = require("./paths");
Object.defineProperty(exports, "findModuleRoot", { enumerable: true, get: function () { return paths_1.findModuleRoot; } });
var textmate_1 = require("./grammars/textmate");
Object.defineProperty(exports, "createTextMateBackend", { enumerable: true, get: function () { return textmate_1.createTextMateBackend; } });
Object.defineProperty(exports, "TextMateBackend", { enumerable: true, get: function () { return textmate_1.TextMateBackend; } });
var treesitter_1 = require("./grammars/treesitter");
Object.defineProperty(exports, "createTreeSitterBackend", { enumerable: true, get: function () { return treesitter_1.createTreeSitterBackend; } });
Object.defineProperty(exports, "TreeSitterBackend", { enumerable: true, get: function () { return treesitter_1.TreeSitterBackend; } });
const files_1 = require("./files");
const search_1 = require("./search");
async function runScopedSearch(extractor, files, options, onProgress, isCancelled) {
    const all = [];
    const total = files.length;
    for (let i = 0; i < files.length; i++) {
        if (isCancelled?.()) {
            break;
        }
        const file = files[i];
        onProgress?.({
            filePath: file.path,
            fileIndex: i + 1,
            fileTotal: total,
            matchCount: all.length,
        });
        const spans = await extractor.extractSpans(file.path, file.text, file.languageId);
        if (isCancelled?.()) {
            break;
        }
        all.push(...(0, search_1.searchInSpans)(file.path, file.text, spans, options));
    }
    return all;
}
function grammarMapFromContributions(contributions) {
    return buildGrammarBundleFromContributions(contributions).primaryGrammars;
}
function buildGrammarBundleFromContributions(contributions) {
    const manifest = {
        extensionPath: '',
        grammars: contributions,
        grammarsByScope: contributions.map((g) => ({
            scopeName: g.scopeName,
            grammarPath: g.grammarPath,
            extensionPath: g.extensionPath,
            languageId: g.languageId,
        })),
        languageIds: [...new Set(contributions.map((g) => g.languageId))],
        commentRules: new Map(),
    };
    return (0, files_1.buildGrammarBundle)([manifest]);
}
//# sourceMappingURL=index.js.map
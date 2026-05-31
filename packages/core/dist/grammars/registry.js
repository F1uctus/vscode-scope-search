"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExtensionManifest = exports.loadAllExtensionManifests = exports.loadExtensionManifests = exports.buildGrammarBundle = exports.buildGrammarMap = exports.SpanExtractor = void 0;
const textmate_1 = require("./textmate");
const treesitter_1 = require("./treesitter");
const fallback_1 = require("./fallback");
const files_1 = require("../files");
function dedupeSpans(spans) {
    const seen = new Set();
    const out = [];
    for (const s of spans) {
        const key = `${s.start}:${s.end}:${s.category}:${s.source}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(s);
    }
    return out;
}
// Span extraction re-tokenizes with installed TextMate grammars. VS Code provides
// no public API to read live editor tokens; semantic/LSP tokens are not used here.
class SpanExtractor {
    textmate;
    treesitter;
    preferTreeSitter;
    grammarMap;
    commentRules;
    constructor(grammarMap, options = {}) {
        const moduleRoot = options.moduleRoot;
        this.grammarMap = grammarMap;
        this.commentRules = options.commentRules;
        this.textmate = (0, textmate_1.createTextMateBackend)(grammarMap, moduleRoot, options.grammarsByScope);
        this.treesitter = (0, treesitter_1.createTreeSitterBackend)(moduleRoot);
        this.preferTreeSitter = options.preferTreeSitter !== false;
    }
    async extractSpans(filePath, text, languageId) {
        const langs = (0, files_1.grammarLanguageIds)(languageId ?? (0, files_1.guessLanguageId)(filePath), this.grammarMap);
        const spans = [];
        try {
            for (const lang of langs) {
                const resolved = (0, files_1.resolveLanguageId)(lang);
                if (this.preferTreeSitter && this.treesitter.hasParser(resolved)) {
                    spans.push(...await this.treesitter.extractSpans(resolved, text));
                }
                spans.push(...await this.textmate.extractSpans(resolved, text));
                if (resolved !== lang) {
                    spans.push(...await this.textmate.extractSpans(lang, text));
                }
            }
        }
        catch {
            // grammar backends may fail; language-config fallback may still run
        }
        if (!(0, fallback_1.hasCommentSpans)(spans)) {
            for (const lang of langs) {
                spans.push(...(0, fallback_1.extractCommentSpansFallback)(text, lang, this.commentRules));
                if ((0, fallback_1.hasCommentSpans)(spans)) {
                    break;
                }
            }
        }
        return dedupeSpans(spans);
    }
}
exports.SpanExtractor = SpanExtractor;
var files_2 = require("../files");
Object.defineProperty(exports, "buildGrammarMap", { enumerable: true, get: function () { return files_2.buildGrammarMap; } });
Object.defineProperty(exports, "buildGrammarBundle", { enumerable: true, get: function () { return files_2.buildGrammarBundle; } });
Object.defineProperty(exports, "loadExtensionManifests", { enumerable: true, get: function () { return files_2.loadExtensionManifests; } });
Object.defineProperty(exports, "loadAllExtensionManifests", { enumerable: true, get: function () { return files_2.loadAllExtensionManifests; } });
Object.defineProperty(exports, "parseExtensionManifest", { enumerable: true, get: function () { return files_2.parseExtensionManifest; } });
//# sourceMappingURL=registry.js.map
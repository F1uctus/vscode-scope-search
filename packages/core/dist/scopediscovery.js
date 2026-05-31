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
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverScopes = discoverScopes;
exports.collectCategories = collectCategories;
exports.discoverScopesFromSpans = discoverScopesFromSpans;
exports.readFileText = readFileText;
const fs = __importStar(require("node:fs"));
const types_1 = require("./types");
const files_1 = require("./files");
const binary_1 = require("./binary");
async function discoverScopes(extractor, files, readText, getLanguageId) {
    const sampled = (0, files_1.sampleFilesByLanguage)((0, binary_1.filterTextPaths)(files));
    const found = new Set();
    for (const file of sampled) {
        try {
            let text;
            const raw = readText(file);
            text = raw instanceof Promise ? await raw : raw;
            const langRaw = getLanguageId?.(file);
            const lang = langRaw instanceof Promise ? await langRaw : langRaw;
            const spans = await extractor.extractSpans(file, text, lang);
            for (const span of spans) {
                found.add(span.category);
            }
        }
        catch {
            // skip unreadable, binary, or unsupported files
        }
    }
    if (found.size === 0) {
        return [{ id: types_1.DEFAULT_SCOPE, label: (0, types_1.scopeLabel)(types_1.DEFAULT_SCOPE) }];
    }
    const ordered = [...found].sort();
    if (found.has(types_1.DEFAULT_SCOPE)) {
        return [
            { id: types_1.DEFAULT_SCOPE, label: (0, types_1.scopeLabel)(types_1.DEFAULT_SCOPE) },
            ...ordered.filter((id) => id !== types_1.DEFAULT_SCOPE).map((id) => ({ id, label: (0, types_1.scopeLabel)(id) })),
        ];
    }
    return ordered.map((id) => ({ id, label: (0, types_1.scopeLabel)(id) }));
}
function collectCategories(spans) {
    return [...new Set(spans.map((s) => s.category))].sort();
}
async function discoverScopesFromSpans(extractor, files, readText) {
    return discoverScopes(extractor, files, readText);
}
function readFileText(path) {
    return fs.readFileSync(path, 'utf8');
}
//# sourceMappingURL=scopediscovery.js.map
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
exports.TextMateBackend = void 0;
exports.createTextMateBackend = createTextMateBackend;
const fs = __importStar(require("node:fs"));
const vscode_textmate_1 = require("vscode-textmate");
const scopes_1 = require("../scopes");
const paths_1 = require("../paths");
let onigReady;
let onigReadyRoot;
async function getOnigLib(moduleRoot) {
    if (!onigReady || onigReadyRoot !== moduleRoot) {
        onigReadyRoot = moduleRoot;
        onigReady = (async () => {
            const onig = await Promise.resolve().then(() => __importStar(require('vscode-oniguruma')));
            const wasmPath = (0, paths_1.resolveFromModuleRoot)(moduleRoot, 'vscode-oniguruma/release/onig.wasm');
            const wasmBin = fs.readFileSync(wasmPath);
            await onig.loadWASM(wasmBin);
            return {
                createOnigScanner: (patterns) => new onig.OnigScanner(patterns),
                createOnigString: (s) => new onig.OnigString(s),
            };
        })();
    }
    return onigReady;
}
class TextMateBackend {
    registry;
    grammarCache = new Map();
    grammarMap;
    grammarsByScope;
    moduleRoot;
    constructor(grammarMap, moduleRoot, grammarsByScope) {
        this.grammarMap = grammarMap;
        this.grammarsByScope = grammarsByScope ?? buildScopeMapFromPrimary(grammarMap);
        this.moduleRoot = moduleRoot;
    }
    async ensureRegistry() {
        if (this.registry) {
            return this.registry;
        }
        const onigLib = await getOnigLib(this.moduleRoot);
        const grammarsByScope = this.grammarsByScope;
        this.registry = new vscode_textmate_1.Registry({
            onigLib: Promise.resolve(onigLib),
            loadGrammar: async (scopeName) => {
                const g = grammarsByScope.get(scopeName);
                if (g && fs.existsSync(g.grammarPath)) {
                    const raw = fs.readFileSync(g.grammarPath, 'utf8');
                    return (0, vscode_textmate_1.parseRawGrammar)(raw, g.grammarPath);
                }
                return null;
            },
        });
        return this.registry;
    }
    async extractSpans(languageId, text) {
        const contrib = this.grammarMap.get(languageId);
        if (!contrib) {
            return [];
        }
        try {
            const registry = await this.ensureRegistry();
            let grammar = this.grammarCache.get(contrib.scopeName);
            if (!grammar) {
                grammar = await registry.loadGrammar(contrib.scopeName) ?? undefined;
                if (!grammar) {
                    return [];
                }
                this.grammarCache.set(contrib.scopeName, grammar);
            }
            const spans = [];
            const lines = text.split('\n');
            let offset = 0;
            let ruleStack = vscode_textmate_1.INITIAL;
            for (const line of lines) {
                const lineTokens = grammar.tokenizeLine(line, ruleStack);
                ruleStack = lineTokens.ruleStack;
                for (const token of lineTokens.tokens) {
                    const category = (0, scopes_1.classifyTextMateScopes)(token.scopes);
                    if (!category) {
                        continue;
                    }
                    spans.push({
                        start: offset + token.startIndex,
                        end: offset + token.endIndex,
                        category,
                        source: 'textmate',
                    });
                }
                offset += line.length + 1;
            }
            return spans;
        }
        catch {
            return [];
        }
    }
}
exports.TextMateBackend = TextMateBackend;
function buildScopeMapFromPrimary(grammarMap) {
    const map = new Map();
    for (const g of grammarMap.values()) {
        if (!map.has(g.scopeName)) {
            map.set(g.scopeName, {
                scopeName: g.scopeName,
                grammarPath: g.grammarPath,
                extensionPath: g.extensionPath,
                languageId: g.languageId,
            });
        }
    }
    return map;
}
function createTextMateBackend(grammarMap, moduleRoot, grammarsByScope) {
    return new TextMateBackend(grammarMap, moduleRoot, grammarsByScope);
}
//# sourceMappingURL=textmate.js.map
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
exports.TreeSitterBackend = void 0;
exports.createTreeSitterBackend = createTreeSitterBackend;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const web_tree_sitter_1 = __importDefault(require("web-tree-sitter"));
const scopes_1 = require("../scopes");
const LANGUAGE_TO_WASM = {
    typescript: 'tree-sitter-typescript.wasm',
    typescriptreact: 'tree-sitter-tsx.wasm',
    javascript: 'tree-sitter-javascript.wasm',
    javascriptreact: 'tree-sitter-tsx.wasm',
    python: 'tree-sitter-python.wasm',
    rust: 'tree-sitter-rust.wasm',
    go: 'tree-sitter-go.wasm',
    json: 'tree-sitter-json.wasm',
    css: 'tree-sitter-css.wasm',
    html: 'tree-sitter-html.wasm',
    c: 'tree-sitter-c.wasm',
    cpp: 'tree-sitter-cpp.wasm',
    java: 'tree-sitter-java.wasm',
    ruby: 'tree-sitter-ruby.wasm',
    bash: 'tree-sitter-bash.wasm',
    shellscript: 'tree-sitter-bash.wasm',
    markdown: 'tree-sitter-markdown.wasm',
    yaml: 'tree-sitter-yaml.wasm',
    toml: 'tree-sitter-toml.wasm',
};
const COMMENT_QUERY = `
(comment) @comment
(line_comment) @comment
(block_comment) @comment
`;
const HIGHLIGHT_QUERY = `
(comment) @comment
(string) @string
(string_literal) @string
(escape_sequence) @string
(number) @number
(type_identifier) @type
(primitive_type) @type
`;
function walkExtraComments(node, spans) {
    if (node.isExtra) {
        const cat = (0, scopes_1.classifyTreeSitterNodeType)(node.type);
        if (cat) {
            spans.push({
                start: node.startIndex,
                end: node.endIndex,
                category: cat,
                source: 'tree-sitter',
            });
        }
    }
    for (let i = 0; i < node.childCount; i++) {
        walkExtraComments(node.child(i), spans);
    }
}
const paths_1 = require("../paths");
class TreeSitterBackend {
    initPromise;
    parsers = new Map();
    wasmDir;
    moduleRoot;
    constructor(moduleRoot) {
        this.moduleRoot = moduleRoot;
        this.wasmDir = (0, paths_1.treeSitterWasmsDir)(moduleRoot);
    }
    async ensureInit() {
        if (!this.initPromise) {
            const moduleRoot = this.moduleRoot;
            this.initPromise = web_tree_sitter_1.default.init({
                locateFile() {
                    return (0, paths_1.resolveFromModuleRoot)(moduleRoot, 'web-tree-sitter/tree-sitter.wasm');
                },
            });
        }
        await this.initPromise;
    }
    hasParser(languageId) {
        return languageId in LANGUAGE_TO_WASM;
    }
    async getParser(languageId) {
        const wasmFile = LANGUAGE_TO_WASM[languageId];
        if (!wasmFile) {
            return undefined;
        }
        if (this.parsers.has(languageId)) {
            return this.parsers.get(languageId);
        }
        await this.ensureInit();
        const wasmPath = path.join(this.wasmDir, 'out', wasmFile);
        if (!fs.existsSync(wasmPath)) {
            return undefined;
        }
        const parser = new web_tree_sitter_1.default();
        const lang = await web_tree_sitter_1.default.Language.load(wasmPath);
        parser.setLanguage(lang);
        this.parsers.set(languageId, parser);
        return parser;
    }
    async extractSpans(languageId, text) {
        try {
            const parser = await this.getParser(languageId);
            if (!parser) {
                return [];
            }
            const tree = parser.parse(text);
            const root = tree.rootNode;
            const spans = [];
            walkExtraComments(root, spans);
            for (const querySrc of [COMMENT_QUERY, HIGHLIGHT_QUERY]) {
                try {
                    const query = parser.getLanguage().query(querySrc);
                    const captures = query.captures(root);
                    for (const cap of captures) {
                        const category = (0, scopes_1.classifyTreeSitterCapture)(cap.name);
                        if (!category) {
                            continue;
                        }
                        spans.push({
                            start: cap.node.startIndex,
                            end: cap.node.endIndex,
                            category,
                            source: 'tree-sitter',
                        });
                    }
                }
                catch {
                    // query may not apply to this grammar
                }
            }
            return dedupeSpans(spans);
        }
        catch {
            return [];
        }
    }
}
exports.TreeSitterBackend = TreeSitterBackend;
function dedupeSpans(spans) {
    const seen = new Set();
    const out = [];
    for (const s of spans) {
        const key = `${s.start}:${s.end}:${s.category}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(s);
    }
    return out;
}
function createTreeSitterBackend(moduleRoot) {
    return new TreeSitterBackend(moduleRoot);
}
//# sourceMappingURL=treesitter.js.map
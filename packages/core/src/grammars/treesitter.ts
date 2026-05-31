import * as fs from 'node:fs';
import * as path from 'node:path';
import Parser from 'web-tree-sitter';
import type { SemanticSpan } from '../types';
import { classifyTreeSitterCapture, classifyTreeSitterNodeType } from '../scopes';

const LANGUAGE_TO_WASM: Record<string, string> = {
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

function walkExtraComments(node: Parser.SyntaxNode, spans: SemanticSpan[]): void {
  if (node.isExtra) {
    const cat = classifyTreeSitterNodeType(node.type);
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
    walkExtraComments(node.child(i)!, spans);
  }
}

import { resolveFromModuleRoot, treeSitterWasmsDir } from '../paths';

export class TreeSitterBackend {
  private initPromise?: Promise<void>;
  private parsers = new Map<string, Parser>();
  private wasmDir: string;
  private moduleRoot?: string;

  constructor(moduleRoot?: string) {
    this.moduleRoot = moduleRoot;
    this.wasmDir = treeSitterWasmsDir(moduleRoot);
  }

  private async ensureInit(): Promise<void> {
    if (!this.initPromise) {
      const moduleRoot = this.moduleRoot;
      this.initPromise = Parser.init({
        locateFile() {
          return resolveFromModuleRoot(moduleRoot, 'web-tree-sitter/tree-sitter.wasm');
        },
      });
    }
    await this.initPromise;
  }

  hasParser(languageId: string): boolean {
    return languageId in LANGUAGE_TO_WASM;
  }

  private async getParser(languageId: string): Promise<Parser | undefined> {
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
    const parser = new Parser();
    const lang = await Parser.Language.load(wasmPath);
    parser.setLanguage(lang);
    this.parsers.set(languageId, parser);
    return parser;
  }

  async extractSpans(languageId: string, text: string): Promise<SemanticSpan[]> {
    try {
      const parser = await this.getParser(languageId);
      if (!parser) {
        return [];
      }
    const tree = parser.parse(text);
    const root = tree.rootNode;
    const spans: SemanticSpan[] = [];

    walkExtraComments(root, spans);

    for (const querySrc of [COMMENT_QUERY, HIGHLIGHT_QUERY]) {
      try {
        const query = parser.getLanguage().query(querySrc);
        const captures = query.captures(root);
        for (const cap of captures) {
          const category = classifyTreeSitterCapture(cap.name);
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
      } catch {
        // query may not apply to this grammar
      }
    }

    return dedupeSpans(spans);
    } catch {
      return [];
    }
  }
}

function dedupeSpans(spans: SemanticSpan[]): SemanticSpan[] {
  const seen = new Set<string>();
  const out: SemanticSpan[] = [];
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

export function createTreeSitterBackend(moduleRoot?: string): TreeSitterBackend {
  return new TreeSitterBackend(moduleRoot);
}

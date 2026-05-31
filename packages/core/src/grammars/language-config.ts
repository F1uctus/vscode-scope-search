import * as fs from 'node:fs';
import type { LanguageCommentRules } from '../types';

interface RawLanguageConfiguration {
  comments?: {
    lineComment?: string | { start: string; end?: string };
    blockComment?: [string, string];
  };
}

/** Strip line and block comments from JSONC (language-configuration.json). */
export function stripJsonComments(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (ch === '"') {
      out += ch;
      i++;
      while (i < text.length) {
        const c = text[i]!;
        out += c;
        i++;
        if (c === '\\' && i < text.length) {
          out += text[i]!;
          i++;
          continue;
        }
        if (c === '"') {
          break;
        }
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < text.length && text[i] !== '\n') {
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '/')) {
        i++;
      }
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function parseLanguageConfiguration(configPath: string): LanguageCommentRules | undefined {
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const rawText = stripJsonComments(fs.readFileSync(configPath, 'utf8'));
    const raw = JSON.parse(rawText) as RawLanguageConfiguration;
    return commentRulesFromConfiguration(raw);
  } catch {
    return undefined;
  }
}

export function commentRulesFromConfiguration(raw: RawLanguageConfiguration): LanguageCommentRules | undefined {
  const comments = raw.comments;
  if (!comments) {
    return undefined;
  }
  const rules: LanguageCommentRules = {};
  if (typeof comments.lineComment === 'string') {
    rules.lineComment = comments.lineComment;
  } else if (comments.lineComment && typeof comments.lineComment === 'object') {
    rules.lineComment = comments.lineComment.start;
    if (comments.lineComment.end) {
      rules.lineCommentEnd = comments.lineComment.end;
    }
  }
  if (Array.isArray(comments.blockComment) && comments.blockComment.length === 2) {
    rules.blockComment = [comments.blockComment[0]!, comments.blockComment[1]!];
  }
  if (!rules.lineComment && !rules.blockComment) {
    return undefined;
  }
  return rules;
}

export function mergeCommentRules(
  target: Map<string, LanguageCommentRules>,
  languageId: string,
  rules: LanguageCommentRules | undefined,
): void {
  if (!rules) {
    return;
  }
  if (!target.has(languageId)) {
    target.set(languageId, rules);
  }
}

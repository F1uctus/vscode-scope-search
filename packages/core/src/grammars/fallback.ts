import type { LanguageCommentRules, SemanticSpan } from '../types';
import { relatedLanguageIds } from '../files';

export function extractCommentSpansFromLanguageConfig(
  text: string,
  rules: LanguageCommentRules | undefined,
): SemanticSpan[] {
  if (!rules) {
    return [];
  }

  const spans: SemanticSpan[] = [];

  if (rules.blockComment) {
    const [open, close] = rules.blockComment;
    spans.push(...extractBlockComments(text, open, close));
  }

  if (rules.lineComment) {
    spans.push(...extractLineComments(text, rules.lineComment, rules.lineCommentEnd));
  }

  return mergeSpanRanges(spans);
}

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractBlockComments(text: string, open: string, close: string): SemanticSpan[] {
  const spans: SemanticSpan[] = [];
  const pattern = new RegExp(`${escapeRegexLiteral(open)}[\\s\\S]*?${escapeRegexLiteral(close)}`, 'g');
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    spans.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'comment',
      source: 'textmate',
    });
  }
  return spans;
}

function extractLineComments(text: string, lineComment: string, lineCommentEnd?: string): SemanticSpan[] {
  const spans: SemanticSpan[] = [];
  const lines = text.split('\n');
  let offset = 0;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const lead = line.length - trimmed.length;
    if (trimmed.startsWith(lineComment)) {
      const end = lineCommentEnd
        ? findLineCommentEnd(line, lead + lineComment.length, lineCommentEnd)
        : line.length;
      spans.push({
        start: offset + lead,
        end: offset + end,
        category: 'comment',
        source: 'textmate',
      });
    } else {
      const idx = line.indexOf(lineComment);
      if (idx !== -1) {
        const before = line.slice(0, idx);
        if (!isInsideString(before)) {
          const start = idx;
          const end = lineCommentEnd
            ? findLineCommentEnd(line, idx + lineComment.length, lineCommentEnd)
            : line.length;
          spans.push({
            start: offset + start,
            end: offset + end,
            category: 'comment',
            source: 'textmate',
          });
        }
      }
    }
    offset += line.length + 1;
  }

  return spans;
}

function findLineCommentEnd(line: string, contentStart: number, lineCommentEnd: string): number {
  const endIdx = line.indexOf(lineCommentEnd, contentStart);
  return endIdx === -1 ? line.length : endIdx;
}

function isInsideString(before: string): boolean {
  let singles = 0;
  let doubles = 0;
  for (let i = 0; i < before.length; i++) {
    const ch = before[i]!;
    if (ch === "'" && before[i - 1] !== '\\') {
      singles++;
    }
    if (ch === '"' && before[i - 1] !== '\\') {
      doubles++;
    }
  }
  return singles % 2 === 1 || doubles % 2 === 1;
}

function mergeSpanRanges(spans: SemanticSpan[]): SemanticSpan[] {
  if (spans.length === 0) {
    return spans;
  }
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: SemanticSpan[] = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = out[out.length - 1]!;
    if (cur.start <= last.end && cur.category === last.category) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

function commentRulesForLanguage(
  languageId: string,
  commentRules: Map<string, LanguageCommentRules> | undefined,
): LanguageCommentRules | undefined {
  if (!commentRules) {
    return undefined;
  }
  for (const id of relatedLanguageIds(languageId)) {
    const rules = commentRules.get(id);
    if (rules) {
      return rules;
    }
  }
  return undefined;
}

export function extractCommentSpansFallback(
  text: string,
  languageId: string,
  commentRules?: Map<string, LanguageCommentRules>,
): SemanticSpan[] {
  return extractCommentSpansFromLanguageConfig(text, commentRulesForLanguage(languageId, commentRules));
}

export function hasCommentSpans(spans: SemanticSpan[]): boolean {
  return spans.some((s) => s.category === 'comment');
}

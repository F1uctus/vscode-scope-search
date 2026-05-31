import type { MatchPosition, SearchMatch, SearchOptions, SemanticSpan } from './types';
import { mergeSpans, offsetToLineCol, lineColToOffset } from './scopes';
import { resolveMatchReplacement } from './replacement';

function buildMatcher(options: SearchOptions): RegExp | string {
  const flags = options.isCaseSensitive ? 'gu' : 'giu';
  if (options.isRegex) {
    return new RegExp(options.pattern, flags);
  }
  const escaped = options.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (options.matchWholeWord) {
    return new RegExp(`\\b${escaped}\\b`, flags);
  }
  return options.isCaseSensitive ? options.pattern : options.pattern.toLowerCase();
}

function matchesLiteral(
  haystack: string,
  needle: string | RegExp,
  isCaseSensitive: boolean,
  matchWholeWord: boolean,
): Array<{ start: number; end: number; text: string }> {
  const results: Array<{ start: number; end: number; text: string }> = [];
  if (needle instanceof RegExp) {
    needle.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = needle.exec(haystack)) !== null) {
      const text = m[0];
      results.push({ start: m.index, end: m.index + text.length, text });
      if (text.length === 0) {
        needle.lastIndex++;
      }
    }
    return results;
  }

  const source = isCaseSensitive ? haystack : haystack.toLowerCase();
  const target = isCaseSensitive ? needle : needle.toLowerCase();
  let from = 0;
  while (from <= source.length) {
    const idx = source.indexOf(target, from);
    if (idx === -1) {
      break;
    }
    const end = idx + target.length;
    if (matchWholeWord) {
      const before = idx > 0 ? haystack[idx - 1]! : ' ';
      const after = end < haystack.length ? haystack[end]! : ' ';
      if (!/\W/.test(before) || !/\W/.test(after)) {
        from = idx + 1;
        continue;
      }
    }
    results.push({ start: idx, end, text: haystack.slice(idx, end) });
    from = end || idx + 1;
  }
  return results;
}

export function searchInSpans(
  path: string,
  fileText: string,
  spans: SemanticSpan[],
  options: SearchOptions,
): SearchMatch[] {
  const filtered = spans.filter((s) => s.category === options.scopeId);
  if (filtered.length === 0 || !options.pattern) {
    return [];
  }

  const merged = mergeSpans(filtered);
  const matcher = buildMatcher(options);
  const matches: SearchMatch[] = [];

  for (const span of merged) {
    const slice = fileText.slice(span.start, span.end);
    const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
    for (const lm of localMatches) {
      const absStart = span.start + lm.start;
      const absEnd = span.start + lm.end;
      const startPos = offsetToLineCol(fileText, absStart);
      const endPos = offsetToLineCol(fileText, absEnd);
      const lineStart = fileText.lastIndexOf('\n', absStart - 1) + 1;
      const lineEnd = fileText.indexOf('\n', absStart);
      const preview = fileText.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      matches.push({
        path,
        startLine: startPos.line,
        startCol: startPos.col,
        endLine: endPos.line,
        endCol: endPos.col,
        matchedText: lm.text,
        preview,
      });
    }
  }
  return matches;
}

function resolveReplacement(
  replacement: string,
  fileText: string,
  absStart: number,
  absEnd: number,
  options: SearchOptions,
): string {
  const matchedText = fileText.slice(absStart, absEnd);
  const lineStart = fileText.lastIndexOf('\n', absStart - 1) + 1;
  const lineEndIdx = fileText.indexOf('\n', absStart);
  const lineEnd = lineEndIdx === -1 ? fileText.length : lineEndIdx;
  const line = fileText.slice(lineStart, lineEnd);
  const relStart = absStart - lineStart;
  return resolveMatchReplacement(replacement, matchedText, options, line, relStart);
}

export interface ReplaceOptions extends SearchOptions {
  replacement: string;
  skip?: MatchPosition[];
}

function isSkipped(start: number, end: number, fileText: string, skip?: MatchPosition[]): boolean {
  if (!skip?.length) {
    return false;
  }
  for (const item of skip) {
    const skipStart = lineColToOffset(fileText, item.startLine, item.startCol);
    const skipEnd = lineColToOffset(fileText, item.endLine, item.endCol);
    if (start === skipStart && end === skipEnd) {
      return true;
    }
  }
  return false;
}

export function replaceSingleMatch(
  fileText: string,
  spans: SemanticSpan[],
  options: ReplaceOptions,
  at: MatchPosition,
): { replacement: string; count: number } {
  const start = lineColToOffset(fileText, at.startLine, at.startCol);
  const end = lineColToOffset(fileText, at.endLine, at.endCol);
  const filtered = spans.filter((s) => s.category === options.scopeId);
  if (filtered.length === 0 || !options.pattern || start >= end) {
    return { replacement: '', count: 0 };
  }

  const merged = mergeSpans(filtered);
  const inScope = merged.some((span) => start >= span.start && end <= span.end);
  if (!inScope) {
    return { replacement: '', count: 0 };
  }

  const slice = fileText.slice(start, end);
  const matcher = buildMatcher(options);
  const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
  if (localMatches.length === 0 || localMatches[0]!.start !== 0 || localMatches[0]!.end !== slice.length) {
    return { replacement: '', count: 0 };
  }

  return {
    replacement: resolveReplacement(options.replacement, fileText, start, end, options),
    count: 1,
  };
}

export interface TextEdit {
  start: number;
  end: number;
  text: string;
}

export function replaceInSpans(
  fileText: string,
  spans: SemanticSpan[],
  options: ReplaceOptions,
): { text: string; count: number; edits: TextEdit[] } {
  const filtered = spans.filter((s) => s.category === options.scopeId);
  if (filtered.length === 0 || !options.pattern) {
    return { text: fileText, count: 0, edits: [] };
  }

  const merged = mergeSpans(filtered);
  const matcher = buildMatcher(options);
  const edits: TextEdit[] = [];

  for (const span of merged) {
    const sliceStart = span.start;
    const slice = fileText.slice(span.start, span.end);
    const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
    for (const lm of localMatches) {
      const absStart = sliceStart + lm.start;
      const absEnd = sliceStart + lm.end;
      if (isSkipped(absStart, absEnd, fileText, options.skip)) {
        continue;
      }
      edits.push({
        start: absStart,
        end: absEnd,
        text: resolveReplacement(options.replacement, fileText, absStart, absEnd, options),
      });
    }
  }

  if (edits.length === 0) {
    return { text: fileText, count: 0, edits: [] };
  }

  edits.sort((a, b) => b.start - a.start);
  let text = fileText;
  for (const edit of edits) {
    text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
  }
  return { text, count: edits.length, edits };
}

export function validateRegex(pattern: string): string | undefined {
  try {
    // eslint-disable-next-line no-new
    new RegExp(pattern, 'u');
    return undefined;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

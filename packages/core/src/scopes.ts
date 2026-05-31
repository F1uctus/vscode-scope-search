const SCOPE_PATTERNS: Array<[RegExp, string]> = [
  [/^comment(\.|$)/, 'comment'],
  [/\.comment(\.|$)/, 'comment'],
  [/^string(\.|$)/, 'string'],
  [/\.string(\.|$)/, 'string'],
  [/^keyword(\.|$)/, 'keyword'],
  [/\.keyword(\.|$)/, 'keyword'],
  [/\.storage\.type(\.|$)/, 'type'],
  [/\.entity\.name\.type(\.|$)/, 'type'],
  [/\.support\.type(\.|$)/, 'type'],
  [/^variable(\.|$)/, 'variable'],
  [/\.variable(\.|$)/, 'variable'],
  [/^constant(\.|$)/, 'constant'],
  [/\.constant(\.|$)/, 'constant'],
  [/\.constant\.numeric(\.|$)/, 'number'],
  [/\.keyword\.operator(\.|$)/, 'operator'],
  [/\.punctuation(\.|$)/, 'punctuation'],
  [/^meta(\.|$)/, 'meta'],
  [/\.meta(\.|$)/, 'meta'],
];

export function classifyTextMateScopes(scopes: string[]): string | undefined {
  for (let i = scopes.length - 1; i >= 0; i--) {
    const scope = scopes[i]!;
    for (const [pattern, category] of SCOPE_PATTERNS) {
      if (pattern.test(scope)) {
        return category;
      }
    }
  }
  return undefined;
}

const TS_CAPTURE_MAP: Record<string, string> = {
  comment: 'comment',
  string: 'string',
  keyword: 'keyword',
  type: 'type',
  variable: 'variable',
  constant: 'constant',
  number: 'number',
  operator: 'operator',
  punctuation: 'punctuation',
  property: 'variable',
  function: 'variable',
  method: 'variable',
  parameter: 'variable',
};

export function classifyTreeSitterCapture(name: string): string | undefined {
  const base = name.replace(/^@/, '').split('.')[0]!;
  return TS_CAPTURE_MAP[base] ?? (base in TS_CAPTURE_MAP ? TS_CAPTURE_MAP[base] : undefined);
}

export function classifyTreeSitterNodeType(type: string): string | undefined {
  const lower = type.toLowerCase();
  if (lower.includes('comment')) {
    return 'comment';
  }
  if (lower.includes('string')) {
    return 'string';
  }
  return undefined;
}

export function mergeSpans(spans: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (spans.length === 0) {
    return [];
  }
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = merged[merged.length - 1]!;
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

export function offsetToLineCol(text: string, offset: number): { line: number; col: number } {
  let line = 0;
  let col = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      col = 0;
    } else {
      col++;
    }
  }
  return { line, col };
}

export function lineColToOffset(text: string, line: number, col: number): number {
  let offset = 0;
  let curLine = 0;
  while (curLine < line && offset < text.length) {
    if (text.charCodeAt(offset) === 10) {
      curLine++;
    }
    offset++;
  }
  let curCol = 0;
  while (curCol < col && offset < text.length) {
    if (text.charCodeAt(offset) === 10) {
      break;
    }
    offset++;
    curCol++;
  }
  return offset;
}

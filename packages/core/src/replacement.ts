export interface ReplacementOptions {
  pattern: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
}

export function applyReplacementTemplate(
  replacement: string,
  match: RegExpExecArray,
  context: string,
): string {
  return replacement.replace(/\$(?:\$|&|`|'|(\d+)|<([^>]+)>)/g, (token, index, name) => {
    if (token === '$$') {
      return '$';
    }
    if (token === '$&') {
      return match[0] ?? '';
    }
    if (token === '$`') {
      return context.slice(0, match.index ?? 0);
    }
    if (token === "$'") {
      return context.slice((match.index ?? 0) + match[0].length);
    }
    if (name !== undefined) {
      return match.groups?.[name] ?? token;
    }
    if (index !== undefined) {
      const n = Number(index);
      if (n === 0) {
        return match[0] ?? '';
      }
      return match[n] ?? token;
    }
    return token;
  });
}

function execMatchAt(
  pattern: string,
  flags: string,
  context: string,
  at: number,
  length: number,
): RegExpExecArray | undefined {
  const re = new RegExp(pattern, flags);
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(context)) !== null) {
    if (m.index === at && m[0].length === length) {
      return m;
    }
    if (m[0].length === 0) {
      re.lastIndex++;
    }
  }
  return undefined;
}

export function resolveMatchReplacement(
  replacement: string,
  matchedText: string,
  options: ReplacementOptions,
  context?: string,
  matchStartInContext?: number,
): string {
  if (!options.isRegex) {
    return replacement;
  }

  const flags = options.isCaseSensitive ? 'u' : 'ui';
  const ctx = context ?? matchedText;
  const at = matchStartInContext ?? (context ? context.indexOf(matchedText) : 0);
  if (at < 0) {
    return replacement;
  }

  let match = execMatchAt(options.pattern, flags, ctx, at, matchedText.length);
  if (!match && context === undefined) {
    const re = new RegExp(options.pattern, flags);
    re.lastIndex = 0;
    const direct = re.exec(matchedText);
    if (direct && direct.index === 0 && direct[0].length === matchedText.length) {
      match = direct;
    }
  }
  if (!match) {
    return replacement;
  }
  return applyReplacementTemplate(replacement, match, ctx);
}

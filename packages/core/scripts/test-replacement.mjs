import assert from 'node:assert/strict';
import { applyReplacementTemplate, resolveMatchReplacement } from '../dist/replacement.js';

function exec(pattern, text) {
  const re = new RegExp(pattern, 'u');
  const match = re.exec(text);
  assert(match, `expected match for ${pattern} in ${text}`);
  return match;
}

assert.equal(
  resolveMatchReplacement('$1-updated', '\\fnorm', {
    pattern: '(\\\\fnorm)',
    isRegex: true,
    isCaseSensitive: true,
  }),
  '\\fnorm-updated',
);

assert.equal(
  resolveMatchReplacement('prefix-$2-$1', 'ab', {
    pattern: '(a)(b)',
    isRegex: true,
    isCaseSensitive: true,
  }),
  'prefix-b-a',
);

assert.equal(
  resolveMatchReplacement('$$1', 'x', {
    pattern: '(x)',
    isRegex: true,
    isCaseSensitive: true,
  }),
  '$1',
);

assert.equal(
  resolveMatchReplacement('$1', 'x', {
    pattern: 'x',
    isRegex: false,
    isCaseSensitive: true,
  }),
  '$1',
);

const line = 'Notation "\\fnorm" M ^+ 2" := (frob_sq M)';
assert.equal(
  resolveMatchReplacement('<<$1>>', '\\fnorm', {
    pattern: '(\\\\fnorm)',
    isRegex: true,
    isCaseSensitive: true,
  }, line, line.indexOf('\\fnorm')),
  '<<\\fnorm>>',
);

const match = exec('(?<name>\\\\fnorm)', '\\fnorm');
assert.equal(
  applyReplacementTemplate('name=$<name>', match, '\\fnorm'),
  'name=\\fnorm',
);

console.log('replacement tests passed');

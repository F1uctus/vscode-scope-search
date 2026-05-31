import assert from 'node:assert/strict';
import {
  extractCommentSpansFromLanguageConfig,
  extractCommentSpansFallback,
  hasCommentSpans,
} from '../dist/grammars/fallback.js';
import { grammarLanguageIds } from '../dist/files.js';

const rocqRules = { blockComment: ['(*', '*)'] };
const jsRules = { lineComment: '//' };

assert.equal(
  hasCommentSpans(extractCommentSpansFromLanguageConfig(
    'rewrite (bigD1 i)//= lerDl; apply: sumr_ge0=> i\' _; exact: hge0.',
    rocqRules,
  )),
  false,
  'Rocq //= line must not be treated as a comment when only block comments are configured',
);

assert.equal(
  hasCommentSpans(extractCommentSpansFromLanguageConfig(
    'let x = 1; // real comment',
    jsRules,
  )),
  true,
  'JavaScript // line comments should be detected from language configuration',
);

const jsCommentSpans = extractCommentSpansFromLanguageConfig('let x = 1; // real comment', jsRules);
assert.ok(jsCommentSpans.some((s) => s.category === 'comment' && s.start <= 12), 'JS comment span should start at //');

assert.equal(
  hasCommentSpans(extractCommentSpansFromLanguageConfig(
    'Lemma foo: True. (* block comment *) Qed.',
    rocqRules,
  )),
  true,
  'Rocq block comments should be detected from language configuration',
);

assert.equal(
  hasCommentSpans(extractCommentSpansFallback('code // not a comment', 'plaintext', new Map())),
  false,
  'Languages without comment configuration should not get heuristic comment spans',
);

const rocqGrammarMap = new Map([
  ['rocq', { languageId: 'rocq', scopeName: 'source.rocq', grammarPath: '', extensionPath: '' }],
]);
assert.deepEqual(grammarLanguageIds('rocq', rocqGrammarMap), ['rocq'], 'rocq should not alias to coq when rocq grammar exists');

const coqOnlyMap = new Map([
  ['coq', { languageId: 'coq', scopeName: 'source.coq', grammarPath: '', extensionPath: '' }],
]);
assert.deepEqual(
  grammarLanguageIds('rocq', coqOnlyMap),
  ['coq'],
  'rocq should fall back to coq grammar when rocq grammar is missing',
);

import { classifyTextMateScopes } from '../dist/scopes.js';
assert.equal(classifyTextMateScopes(['source.rocq', 'comment.block.rocq']), 'comment');
assert.equal(classifyTextMateScopes(['source.js', 'comment.line.double-slash.js']), 'comment');

import { parseLanguageConfiguration } from '../dist/grammars/language-config.js';
const rocqConfigPath = '/home/f1uctus/.vscode/extensions/rocq-prover.vsrocq-2.4.3/syntax/rocq.language-configuration.json';
const parsedRocqRules = parseLanguageConfiguration(rocqConfigPath);
if (parsedRocqRules) {
  assert.deepEqual(parsedRocqRules.blockComment, ['(*', '*)']);
} else {
  console.warn('skip rocq language-configuration parse test: VsRocq not installed');
}

console.log('fallback tests passed');

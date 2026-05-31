import assert from 'node:assert/strict';
import {
  applyReversePatch,
  contentHash,
  createReversePatch,
} from '../dist/replace-history-test.js';

const pre = `${'x'.repeat(10_000)}\\fnorm${'y'.repeat(10_000)}`;
const post = `${'x'.repeat(10_000)}\\norm${'y'.repeat(10_000)}`;

const patch = createReversePatch(post, pre, '/tmp/mxfrob.v');
const restored = applyReversePatch(post, patch);
assert.equal(restored, pre);
assert.notEqual(contentHash(pre), contentHash(post));

console.log('replace-history tests passed');

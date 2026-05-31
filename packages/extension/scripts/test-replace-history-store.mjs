import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  MANIFEST_VERSION,
  ReplaceHistoryStore,
  patchRel,
  postSnapshotRel,
} from '../dist/replace-history-store-test.js';

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'scope-search-undo-'));
const store = new ReplaceHistoryStore(tmpRoot);

const entryId = 'entry-1';
const fileId = 'abc123';
const undoPatchRel = patchRel(entryId, fileId);
const postSnapshotRelPath = postSnapshotRel(entryId, fileId);

await store.writeBlob(undoPatchRel, 'patch-content');
await store.writeBlob(postSnapshotRelPath, 'post-content');

const meta = {
  id: entryId,
  timestamp: 1,
  label: 'Replace 1 in foo.ts',
  files: [{
    path: '/tmp/foo.ts',
    postHash: 'post',
    preHash: 'pre',
    preVersion: 1,
    postVersion: 2,
    undoPatchRel,
    postSnapshotRel: postSnapshotRelPath,
  }],
  searchPayload: { query: 'x', replace: 'y' },
};

await store.saveAllEntries([meta]);

const reloaded = await store.loadAllEntries();
assert.equal(reloaded.length, 1);
assert.equal(reloaded[0].label, meta.label);
assert.equal(reloaded[0].files[0].undoPatchRel, undoPatchRel);

const manifest = JSON.parse(await fs.readFile(store.manifestPath(), 'utf8'));
assert.equal(manifest.version, MANIFEST_VERSION);
assert.equal(manifest.entries.length, 1);

assert.equal(await store.readBlob(undoPatchRel), 'patch-content');
assert.equal(await store.readBlob(postSnapshotRelPath), 'post-content');

await store.deleteEntry(entryId);
await store.saveAllEntries([]);
assert.equal((await store.loadAllEntries()).length, 0);

await fs.rm(tmpRoot, { recursive: true, force: true });
console.log('replace-history-store tests passed');

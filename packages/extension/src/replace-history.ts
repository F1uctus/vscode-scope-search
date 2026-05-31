import * as crypto from 'node:crypto';
import * as vscode from 'vscode';
import type { ReplacePayload } from './panel';
import {
  applyReversePatch,
  contentHash,
  createReversePatch,
  sanitizeFileId,
} from './replace-history-core';
import {
  patchRel,
  postSnapshotRel,
  ReplaceHistoryStore,
  type StoredEntryMeta,
  type StoredFileRecord,
} from './replace-history-store';

export { applyReversePatch, contentHash, createReversePatch } from './replace-history-core';

export const HISTORY_CAP = 50;

export type FileReplaceRecord = StoredFileRecord;
export type ReplaceHistoryEntry = StoredEntryMeta;

export interface FileCaptureInput {
  path: string;
  preContent: string;
  postContent: string;
  preVersion: number;
  postVersion: number;
}

export class ReplaceHistoryManager {
  private entries: ReplaceHistoryEntry[] = [];

  private constructor(private readonly store: ReplaceHistoryStore | undefined) {}

  static async create(context: vscode.ExtensionContext): Promise<ReplaceHistoryManager> {
    const store = ReplaceHistoryStore.fromContext(context);
    const manager = new ReplaceHistoryManager(store);
    if (store) {
      manager.entries = await store.loadAllEntries();
    }
    return manager;
  }

  canUndo(): boolean {
    return this.entries.length > 0;
  }

  peek(): ReplaceHistoryEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  peekLabel(): string | undefined {
    return this.peek()?.label;
  }

  private requireStore(): ReplaceHistoryStore {
    if (!this.store) {
      throw new Error('No workspace open for replace history.');
    }
    return this.store;
  }

  async persistFileArtifacts(
    entryId: string,
    input: FileCaptureInput,
  ): Promise<FileReplaceRecord> {
    const store = this.requireStore();
    const fileId = sanitizeFileId(input.path);
    const undoPatchRel = patchRel(entryId, fileId);
    const postSnapshotRelPath = postSnapshotRel(entryId, fileId);
    const patch = createReversePatch(input.postContent, input.preContent, input.path);

    await store.writeBlob(undoPatchRel, patch);
    await store.writeBlob(postSnapshotRelPath, input.postContent);

    return {
      path: input.path,
      postHash: contentHash(input.postContent),
      preHash: contentHash(input.preContent),
      preVersion: input.preVersion,
      postVersion: input.postVersion,
      undoPatchRel,
      postSnapshotRel: postSnapshotRelPath,
    };
  }

  async push(entry: Omit<ReplaceHistoryEntry, 'id' | 'timestamp'> & { id?: string }): Promise<ReplaceHistoryEntry> {
    const full: ReplaceHistoryEntry = {
      id: entry.id ?? crypto.randomUUID(),
      timestamp: Date.now(),
      label: entry.label,
      files: entry.files,
      searchPayload: entry.searchPayload,
    };

    this.entries.push(full);
    while (this.entries.length > HISTORY_CAP) {
      const removed = this.entries.shift();
      if (removed) {
        await this.deleteEntryArtifacts(removed.id);
      }
    }
    await this.persist();
    return full;
  }

  async pop(): Promise<ReplaceHistoryEntry | undefined> {
    const entry = this.entries.pop();
    if (entry) {
      await this.deleteEntryArtifacts(entry.id);
      await this.persist();
    }
    return entry;
  }

  private async persist(): Promise<void> {
    if (!this.store) {
      return;
    }
    await this.store.saveAllEntries(this.entries);
  }

  async deleteEntryArtifacts(entryId: string): Promise<void> {
    if (!this.store) {
      return;
    }
    await this.store.deleteEntry(entryId);
  }

  async readPreContent(record: FileReplaceRecord): Promise<string> {
    const store = this.requireStore();
    const post = await store.readBlob(record.postSnapshotRel);
    const patch = await store.readBlob(record.undoPatchRel);
    const pre = applyReversePatch(post, patch);
    if (pre === undefined) {
      throw new Error(`Failed to reconstruct pre-replace content for ${record.path}`);
    }
    return pre;
  }

  async readPatch(record: FileReplaceRecord): Promise<string> {
    return this.requireStore().readBlob(record.undoPatchRel);
  }
}

export async function replaceDocumentContent(
  doc: vscode.TextDocument,
  newText: string,
): Promise<boolean> {
  const uri = doc.uri;
  const fullRange = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length),
  );

  const editor = vscode.window.visibleTextEditors.find(
    (e) => e.document.uri.toString() === uri.toString(),
  );
  if (editor) {
    const applied = await editor.edit((builder) => {
      builder.replace(fullRange, newText);
    });
    if (applied) {
      return true;
    }
  }

  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.replace(uri, fullRange, newText);
  return vscode.workspace.applyEdit(workspaceEdit);
}

export function fileHashMatches(record: FileReplaceRecord, currentText: string): boolean {
  return contentHash(currentText) === record.postHash;
}

export async function applyStrictUndoToFile(
  history: ReplaceHistoryManager,
  record: FileReplaceRecord,
  doc: vscode.TextDocument,
): Promise<boolean> {
  const current = doc.getText();
  if (!fileHashMatches(record, current)) {
    return false;
  }

  const patch = await history.readPatch(record);
  const restored = applyReversePatch(current, patch);
  if (restored === undefined) {
    throw new Error(`Patch apply failed for ${record.path}`);
  }
  if (contentHash(restored) !== record.preHash) {
    throw new Error(`Undo verification failed for ${record.path}`);
  }

  return replaceDocumentContent(doc, restored);
}

export async function applyForceUndoToFile(
  history: ReplaceHistoryManager,
  record: FileReplaceRecord,
  doc: vscode.TextDocument,
): Promise<boolean> {
  const pre = await history.readPreContent(record);
  if (contentHash(pre) !== record.preHash) {
    throw new Error(`Pre-replace snapshot verification failed for ${record.path}`);
  }
  return replaceDocumentContent(doc, pre);
}

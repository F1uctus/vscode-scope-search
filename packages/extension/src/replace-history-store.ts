import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { ReplacePayload } from './panel';

export const MANIFEST_VERSION = 1;
export const MANIFEST_FILE = 'manifest.json';
export const ENTRIES_DIR = 'entries';

export interface StoredFileRecord {
  path: string;
  postHash: string;
  preHash: string;
  preVersion: number;
  postVersion: number;
  undoPatchRel: string;
  postSnapshotRel: string;
}

export interface StoredEntryMeta {
  id: string;
  timestamp: number;
  label: string;
  files: StoredFileRecord[];
  searchPayload: ReplacePayload;
}

export interface ManifestEntryRef {
  id: string;
  timestamp: number;
  label: string;
  dir: string;
}

export interface Manifest {
  version: number;
  entries: ManifestEntryRef[];
}

export class ReplaceHistoryStore {
  constructor(readonly undoRootFsPath: string) {}

  static fromContext(context: vscode.ExtensionContext): ReplaceHistoryStore | undefined {
    if (!context.storageUri) {
      return undefined;
    }
    return new ReplaceHistoryStore(
      vscode.Uri.joinPath(context.storageUri, 'undo').fsPath,
    );
  }

  resolve(relPath: string): string {
    return path.join(this.undoRootFsPath, relPath);
  }

  entryDirRel(entryId: string): string {
    return path.posix.join(ENTRIES_DIR, entryId);
  }

  entryDirFsPath(entryId: string): string {
    return this.resolve(this.entryDirRel(entryId));
  }

  manifestPath(): string {
    return path.join(this.undoRootFsPath, MANIFEST_FILE);
  }

  async manifestExists(): Promise<boolean> {
    try {
      await fs.access(this.manifestPath());
      return true;
    } catch {
      return false;
    }
  }

  async ensureRoot(): Promise<void> {
    await fs.mkdir(this.undoRootFsPath, { recursive: true });
  }

  async readManifest(): Promise<Manifest | undefined> {
    try {
      const raw = await fs.readFile(this.manifestPath(), 'utf8');
      const parsed = JSON.parse(raw) as Manifest;
      if (parsed.version !== MANIFEST_VERSION || !Array.isArray(parsed.entries)) {
        return undefined;
      }
      return parsed;
    } catch {
      return undefined;
    }
  }

  async writeManifest(entries: StoredEntryMeta[]): Promise<void> {
    await this.ensureRoot();
    const manifest: Manifest = {
      version: MANIFEST_VERSION,
      entries: entries.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        label: entry.label,
        dir: this.entryDirRel(entry.id),
      })),
    };
    await fs.writeFile(this.manifestPath(), JSON.stringify(manifest, null, 2), 'utf8');
  }

  async readEntryMeta(entryId: string): Promise<StoredEntryMeta | undefined> {
    const metaPath = path.join(this.entryDirFsPath(entryId), 'meta.json');
    try {
      const raw = await fs.readFile(metaPath, 'utf8');
      return JSON.parse(raw) as StoredEntryMeta;
    } catch {
      return undefined;
    }
  }

  async writeEntryMeta(meta: StoredEntryMeta): Promise<void> {
    const dir = this.entryDirFsPath(meta.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'meta.json'),
      JSON.stringify(meta, null, 2),
      'utf8',
    );
  }

  async loadAllEntries(): Promise<StoredEntryMeta[]> {
    const manifest = await this.readManifest();
    if (!manifest) {
      return [];
    }

    const entries: StoredEntryMeta[] = [];
    for (const ref of manifest.entries) {
      const meta = await this.readEntryMeta(ref.id);
      if (meta) {
        entries.push(meta);
      }
    }
    return entries;
  }

  async saveAllEntries(entries: StoredEntryMeta[]): Promise<void> {
    await this.ensureRoot();
    await fs.mkdir(path.join(this.undoRootFsPath, ENTRIES_DIR), { recursive: true });
    for (const entry of entries) {
      await this.writeEntryMeta(entry);
    }
    await this.writeManifest(entries);
  }

  async deleteEntry(entryId: string): Promise<void> {
    await fs.rm(this.entryDirFsPath(entryId), { recursive: true, force: true });
  }

  async writeBlob(relPath: string, content: string): Promise<void> {
    const fullPath = this.resolve(relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
  }

  async readBlob(relPath: string): Promise<string> {
    return fs.readFile(this.resolve(relPath), 'utf8');
  }

  blobExists(relPath: string): Promise<boolean> {
    return fs.access(this.resolve(relPath))
      .then(() => true)
      .catch(() => false);
  }
}

export function patchRel(entryId: string, fileId: string): string {
  return path.posix.join(ENTRIES_DIR, entryId, `${fileId}.patch`);
}

export function postSnapshotRel(entryId: string, fileId: string): string {
  return path.posix.join(ENTRIES_DIR, entryId, `${fileId}-post.txt`);
}

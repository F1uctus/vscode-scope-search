var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// scripts/vscode-stub.js
var require_vscode_stub = __commonJS({
  "scripts/vscode-stub.js"(exports2, module2) {
    module2.exports = {
      Uri: {
        joinPath: (base, ...parts) => ({
          fsPath: [base.fsPath ?? base.path ?? String(base), ...parts].join("/").replace(/\/+/g, "/")
        })
      }
    };
  }
});

// src/replace-history-store.ts
var replace_history_store_exports = {};
__export(replace_history_store_exports, {
  ENTRIES_DIR: () => ENTRIES_DIR,
  MANIFEST_FILE: () => MANIFEST_FILE,
  MANIFEST_VERSION: () => MANIFEST_VERSION,
  ReplaceHistoryStore: () => ReplaceHistoryStore,
  patchRel: () => patchRel,
  postSnapshotRel: () => postSnapshotRel
});
module.exports = __toCommonJS(replace_history_store_exports);
var fs = __toESM(require("node:fs/promises"));
var path = __toESM(require("node:path"));
var vscode = __toESM(require_vscode_stub());
var MANIFEST_VERSION = 1;
var MANIFEST_FILE = "manifest.json";
var ENTRIES_DIR = "entries";
var ReplaceHistoryStore = class _ReplaceHistoryStore {
  constructor(undoRootFsPath) {
    this.undoRootFsPath = undoRootFsPath;
  }
  static fromContext(context) {
    if (!context.storageUri) {
      return void 0;
    }
    return new _ReplaceHistoryStore(
      vscode.Uri.joinPath(context.storageUri, "undo").fsPath
    );
  }
  resolve(relPath) {
    return path.join(this.undoRootFsPath, relPath);
  }
  entryDirRel(entryId) {
    return path.posix.join(ENTRIES_DIR, entryId);
  }
  entryDirFsPath(entryId) {
    return this.resolve(this.entryDirRel(entryId));
  }
  manifestPath() {
    return path.join(this.undoRootFsPath, MANIFEST_FILE);
  }
  async manifestExists() {
    try {
      await fs.access(this.manifestPath());
      return true;
    } catch {
      return false;
    }
  }
  async ensureRoot() {
    await fs.mkdir(this.undoRootFsPath, { recursive: true });
  }
  async readManifest() {
    try {
      const raw = await fs.readFile(this.manifestPath(), "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.version !== MANIFEST_VERSION || !Array.isArray(parsed.entries)) {
        return void 0;
      }
      return parsed;
    } catch {
      return void 0;
    }
  }
  async writeManifest(entries) {
    await this.ensureRoot();
    const manifest = {
      version: MANIFEST_VERSION,
      entries: entries.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        label: entry.label,
        dir: this.entryDirRel(entry.id)
      }))
    };
    await fs.writeFile(this.manifestPath(), JSON.stringify(manifest, null, 2), "utf8");
  }
  async readEntryMeta(entryId) {
    const metaPath = path.join(this.entryDirFsPath(entryId), "meta.json");
    try {
      const raw = await fs.readFile(metaPath, "utf8");
      return JSON.parse(raw);
    } catch {
      return void 0;
    }
  }
  async writeEntryMeta(meta) {
    const dir = this.entryDirFsPath(meta.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "meta.json"),
      JSON.stringify(meta, null, 2),
      "utf8"
    );
  }
  async loadAllEntries() {
    const manifest = await this.readManifest();
    if (!manifest) {
      return [];
    }
    const entries = [];
    for (const ref of manifest.entries) {
      const meta = await this.readEntryMeta(ref.id);
      if (meta) {
        entries.push(meta);
      }
    }
    return entries;
  }
  async saveAllEntries(entries) {
    await this.ensureRoot();
    await fs.mkdir(path.join(this.undoRootFsPath, ENTRIES_DIR), { recursive: true });
    for (const entry of entries) {
      await this.writeEntryMeta(entry);
    }
    await this.writeManifest(entries);
  }
  async deleteEntry(entryId) {
    await fs.rm(this.entryDirFsPath(entryId), { recursive: true, force: true });
  }
  async writeBlob(relPath, content) {
    const fullPath = this.resolve(relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf8");
  }
  async readBlob(relPath) {
    return fs.readFile(this.resolve(relPath), "utf8");
  }
  blobExists(relPath) {
    return fs.access(this.resolve(relPath)).then(() => true).catch(() => false);
  }
};
function patchRel(entryId, fileId) {
  return path.posix.join(ENTRIES_DIR, entryId, `${fileId}.patch`);
}
function postSnapshotRel(entryId, fileId) {
  return path.posix.join(ENTRIES_DIR, entryId, `${fileId}-post.txt`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ENTRIES_DIR,
  MANIFEST_FILE,
  MANIFEST_VERSION,
  ReplaceHistoryStore,
  patchRel,
  postSnapshotRel
});

import * as fs from 'node:fs';
import * as path from 'node:path';

export function findModuleRoot(startDir: string): string | undefined {
  let dir = path.resolve(startDir);
  const vendor = path.join(dir, 'vendor');
  if (fs.existsSync(vendor)) {
    return vendor;
  }
  while (true) {
    const nm = path.join(dir, 'node_modules');
    if (fs.existsSync(nm)) {
      return nm;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

export function resolveFromModuleRoot(moduleRoot: string | undefined, pkgPath: string): string {
  if (moduleRoot) {
    const candidate = path.join(moduleRoot, pkgPath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return require.resolve(pkgPath);
}

export function treeSitterWasmsDir(moduleRoot: string | undefined): string {
  if (moduleRoot) {
    const candidate = path.join(moduleRoot, 'tree-sitter-wasms');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.dirname(require.resolve('tree-sitter-wasms/package.json'));
}

const fs = require('node:fs');
const path = require('node:path');

const extensionRoot = path.join(__dirname, '..');
const vendorRoot = path.join(extensionRoot, 'vendor');
const repoRoot = path.join(extensionRoot, '..', '..');

function resolveFromRepo(relativePath) {
  const fromRepo = path.join(repoRoot, 'node_modules', relativePath);
  if (fs.existsSync(fromRepo)) {
    return fromRepo;
  }
  return require.resolve(relativePath);
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`missing vendor source directory: ${srcDir}`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFile(src, dest);
    }
  }
}

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

rmDir(vendorRoot);
fs.mkdirSync(vendorRoot, { recursive: true });

copyFile(
  resolveFromRepo('vscode-oniguruma/release/onig.wasm'),
  path.join(vendorRoot, 'vscode-oniguruma', 'release', 'onig.wasm'),
);

copyFile(
  resolveFromRepo('web-tree-sitter/tree-sitter.wasm'),
  path.join(vendorRoot, 'web-tree-sitter', 'tree-sitter.wasm'),
);

copyDir(
  path.join(path.dirname(resolveFromRepo('tree-sitter-wasms/package.json')), 'out'),
  path.join(vendorRoot, 'tree-sitter-wasms', 'out'),
);

console.log('vendored runtime assets to', vendorRoot);

const fs = require('node:fs');
const path = require('node:path');

const distDir = path.dirname(require.resolve('@vscode/codicons/dist/codicon.css'));
const outDir = path.join(__dirname, '..', 'media', 'codicons');

fs.mkdirSync(outDir, { recursive: true });
for (const file of ['codicon.css', 'codicon.ttf']) {
  fs.copyFileSync(path.join(distDir, file), path.join(outDir, file));
}

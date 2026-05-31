const esbuild = require('esbuild');
const path = require('node:path');

const root = path.join(__dirname, '..');
const entry = path.join(root, '..', 'core', 'src', 'replacement.ts');
const outfile = path.join(root, 'media', 'replacement.js');

esbuild.buildSync({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: 'iife',
  globalName: 'ScopeSearchReplacement',
  platform: 'browser',
  target: 'es2020',
  logLevel: 'info',
});

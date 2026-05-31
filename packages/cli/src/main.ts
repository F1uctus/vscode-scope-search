import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  buildGrammarBundle,
  DEFAULT_SCOPE,
  loadAllExtensionManifests,
  resolveFilesNode,
  runScopedSearch,
  SpanExtractor,
  validateRegex,
  type SearchOptions,
} from '@scope-search/core';

interface CliArgs {
  query?: string;
  scope: string;
  include?: string;
  exclude?: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  matchWholeWord: boolean;
  extDir?: string;
  paths: string[];
}

function usage(): never {
  console.error(
    'scope-search --query TEXT [--scope comment] [--include GLOB] [--exclude GLOB] [--regex] [--case] [--word] [--ext-dir PATH] [PATH...]',
  );
  process.exit(2);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    scope: DEFAULT_SCOPE,
    isRegex: false,
    isCaseSensitive: false,
    matchWholeWord: false,
    paths: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    switch (a) {
      case '--query':
      case '-q':
        args.query = argv[++i];
        break;
      case '--scope':
      case '-s':
        args.scope = argv[++i] ?? DEFAULT_SCOPE;
        break;
      case '--include':
        args.include = argv[++i];
        break;
      case '--exclude':
        args.exclude = argv[++i];
        break;
      case '--regex':
      case '-r':
        args.isRegex = true;
        break;
      case '--case':
      case '-i':
        args.isCaseSensitive = true;
        break;
      case '--word':
      case '-w':
        args.matchWholeWord = true;
        break;
      case '--ext-dir':
        args.extDir = argv[++i];
        break;
      case '--help':
      case '-h':
        usage();
      default:
        if (a.startsWith('-')) {
          console.error('unknown flag:', a);
          usage();
        }
        args.paths.push(a);
    }
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.query) {
    usage();
  }

  const options: SearchOptions = {
    pattern: args.query,
    isRegex: args.isRegex,
    isCaseSensitive: args.isCaseSensitive,
    matchWholeWord: args.matchWholeWord,
    scopeId: args.scope,
  };

  if (options.isRegex) {
    const err = validateRegex(options.pattern);
    if (err) {
      console.error(err);
      process.exit(1);
    }
  }

  const cwd = process.cwd();
  const extDirs = args.extDir
    ? [args.extDir]
    : [
        path.join(os.homedir(), '.vscode', 'extensions'),
        path.join(os.homedir(), '.cursor', 'extensions'),
      ];
  const manifests = loadAllExtensionManifests(extDirs);
  const grammarBundle = buildGrammarBundle(manifests);
  const extractor = new SpanExtractor(grammarBundle.primaryGrammars, {
    preferTreeSitter: true,
    commentRules: grammarBundle.commentRules,
    grammarsByScope: grammarBundle.grammarsByScope,
  });

  const files = await resolveFilesNode({
    cwd,
    paths: args.paths.length ? args.paths : ['.'],
    include: args.include,
    exclude: args.exclude,
    useDefaultExcludes: true,
    settingsPath: path.join(cwd, '.vscode', 'settings.json'),
  });

  const inputs = files.map((f) => ({
    path: f,
    text: fs.readFileSync(f, 'utf8'),
  }));

  const results = await runScopedSearch(extractor, inputs, options);
  for (const r of results) {
    const rel = path.relative(cwd, r.path).replace(/\\/g, '/');
    console.log(`${rel}:${r.startLine + 1}:${r.startCol + 1}:${r.matchedText}`);
  }
  process.exit(results.length > 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import * as vscode from 'vscode';

type LanguageIcon = string | { light?: string; dark?: string };

interface LanguageContribution {
  id?: string;
  icon?: LanguageIcon;
}

let languageIconCache: Map<string, vscode.Uri> | undefined;
let languageIconRoots: vscode.Uri[] | undefined;

function iconPathFromContribution(icon: LanguageIcon): string | undefined {
  if (typeof icon === 'string') {
    return icon;
  }
  return icon.dark ?? icon.light;
}

export function getLanguageIconUris(): Map<string, vscode.Uri> {
  if (languageIconCache) {
    return languageIconCache;
  }

  const map = new Map<string, vscode.Uri>();
  const roots = new Set<string>();

  for (const ext of vscode.extensions.all) {
    const pkg = ext.packageJSON as { contributes?: { languages?: LanguageContribution[] } };
    for (const lang of pkg.contributes?.languages ?? []) {
      if (!lang.id || !lang.icon || map.has(lang.id)) {
        continue;
      }
      const rel = iconPathFromContribution(lang.icon);
      if (!rel) {
        continue;
      }
      const normalized = rel.replace(/^\.\//, '');
      map.set(lang.id, vscode.Uri.joinPath(ext.extensionUri, normalized));
      roots.add(ext.extensionUri.toString());
    }
  }

  languageIconCache = map;
  languageIconRoots = [...roots].map((s) => vscode.Uri.parse(s));
  return map;
}

export function getLanguageIconExtensionRoots(): vscode.Uri[] {
  getLanguageIconUris();
  return languageIconRoots ?? [];
}

export function buildFileIconWebviewUris(
  webview: vscode.Webview,
  entries: Array<{ path: string; languageId?: string }>,
): Record<string, string> {
  const icons = getLanguageIconUris();
  const out: Record<string, string> = {};
  for (const { path, languageId } of entries) {
    if (!languageId) {
      continue;
    }
    const uri = icons.get(languageId);
    if (uri) {
      out[path] = webview.asWebviewUri(uri).toString();
    }
  }
  return out;
}

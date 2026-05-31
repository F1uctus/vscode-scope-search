import * as vscode from 'vscode';
import type { ScopeInfo, SearchMatch, MatchPosition } from '@scope-search/core';
import { buildFileIconWebviewUris, getLanguageIconExtensionRoots } from './file-icons';

export interface PanelState {
  query?: string;
  replace?: string;
  queryHistory?: string[];
  replaceHistory?: string[];
  include?: string;
  exclude?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  matchWholeWord?: boolean;
  scopeId?: string;
}

export interface ReplacePayload {
  query: string;
  replace: string;
  include?: string;
  exclude?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  matchWholeWord?: boolean;
  scopeId?: string;
  skipMatches?: Array<MatchPosition & { path: string }>;
  paths?: string[];
}

export type WebviewMessage =
  | { type: 'search'; searchId: number; query: string; replace?: string; include?: string; exclude?: string; isRegex?: boolean; isCaseSensitive?: boolean; matchWholeWord?: boolean; scopeId?: string }
  | { type: 'updateScope'; include?: string; exclude?: string }
  | { type: 'saveState'; state: PanelState }
  | { type: 'ready' }
  | { type: 'openResult'; path: string; startLine: number; startCol: number; endLine: number; endCol: number }
  | ({ type: 'replaceAllInFile'; path: string } & ReplacePayload)
  | ({ type: 'replaceAll' } & ReplacePayload)
  | ({ type: 'undoLastReplace' })
  | ({
      type: 'replaceOne';
      path: string;
      startLine: number;
      startCol: number;
      endLine: number;
      endCol: number;
      replacedIndex?: number;
    } & ReplacePayload);

type OpenResultMessage = Extract<WebviewMessage, { type: 'openResult' }>;

export type SearchStatusMessage = {
  type: 'searchStatus';
  searchId: number;
  state: 'searching' | 'complete' | 'idle' | 'stopped';
  phase?: 'listing' | 'reading' | 'searching';
  currentFile?: string;
  fileIndex?: number;
  fileTotal?: number;
  matchCount?: number;
  fileCount?: number;
};

export class ScopeSearchPanel implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private messageHandler?: (msg: WebviewMessage) => void | Promise<void>;
  onViewReady?: () => void;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri, ...getLanguageIconExtensionRoots()],
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    // Handlers must not await heavy work: VS Code serializes webview messages
    // until each handler's promise settles, which would delay openResult clicks.
    webviewView.webview.onDidReceiveMessage((msg: WebviewMessage) => {
      if (msg.type === 'openResult') {
        void openSearchResult(msg);
        return;
      }
      if (msg.type === 'replaceAllInFile' || msg.type === 'replaceAll' || msg.type === 'replaceOne' || msg.type === 'undoLastReplace') {
        void this.messageHandler?.(msg);
        return;
      }
      void this.messageHandler?.(msg);
    });
    this.onViewReady?.();
  }

  onMessage(handler: (msg: WebviewMessage) => void | Promise<void>): void {
    this.messageHandler = handler;
  }

  postScopes(scopes: ScopeInfo[]): void {
    this.view?.webview.postMessage({ type: 'scopes', scopes });
  }

  postResults(
    results: SearchMatch[],
    searchId: number,
    preserveExclusions = false,
    languageByPath?: Record<string, string | undefined>,
  ): void {
    const workspaceRoots = (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
    const webview = this.view?.webview;
    const fileIcons =
      webview && languageByPath
        ? buildFileIconWebviewUris(
            webview,
            Object.entries(languageByPath).map(([path, languageId]) => ({ path, languageId })),
          )
        : {};
    this.view?.webview.postMessage({
      type: 'results',
      results,
      searchId,
      workspaceRoots,
      preserveExclusions,
      fileIcons,
    });
  }

  postSearchStatus(msg: Omit<SearchStatusMessage, 'type'>): void {
    this.view?.webview.postMessage({ type: 'searchStatus', ...msg });
  }

  postRestoreState(state: PanelState): void {
    this.view?.webview.postMessage({ type: 'restoreState', state });
  }

  postError(error: string): void {
    this.view?.webview.postMessage({ type: 'error', error });
  }

  postHistoryState(state: { canUndo: boolean; label?: string }): void {
    this.view?.webview.postMessage({ type: 'historyState', ...state });
  }

  focusQuery(): void {
    this.view?.webview.postMessage({ type: 'focusQuery' });
  }

  requestRefresh(): void {
    this.view?.webview.postMessage({ type: 'refresh' });
  }

  requestClear(): void {
    this.view?.webview.postMessage({ type: 'clear' });
  }

  requestStop(): void {
    this.view?.webview.postMessage({ type: 'stop' });
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'panel.js'));
    const replacementUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'replacement.js'),
    );
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'panel.css'));
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'codicons', 'codicon.css'),
    );
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${codiconsUri}" rel="stylesheet">
  <link href="${styleUri}" rel="stylesheet">
  <title>Scope Search</title>
</head>
<body>
  <div class="row">
    <input id="query" type="text" placeholder="Search" />
  </div>
  <div class="row replace-row">
    <input id="replace" type="text" placeholder="Replace" />
    <button id="undoLastReplaceBtn" type="button" class="icon-btn codicon codicon-reply" title="Undo last replace" hidden></button>
    <button id="replaceAllGlobalBtn" type="button" class="icon-btn codicon codicon-replace-all" title="Replace All"></button>
  </div>
  <div class="row toggles">
    <button id="caseBtn" title="Match Case">Aa</button>
    <button id="wordBtn" title="Match Whole Word">ab</button>
    <button id="regexBtn" title="Use Regular Expression">.*</button>
  </div>
  <div class="row">
    <input id="include" type="text" placeholder="files to include" />
  </div>
  <div class="row">
    <input id="exclude" type="text" placeholder="files to exclude" />
  </div>
  <div class="row row-field">
    <label for="scope">Scope</label>
    <select id="scope">
      <option value="comment">Comments</option>
    </select>
  </div>
  <div id="progress" class="progress" hidden>
    <div class="progress-bar"></div>
  </div>
  <div id="status" class="status"></div>
  <div id="error"></div>
  <div id="results"></div>
  <script nonce="${nonce}" src="${replacementUri}"></script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

export async function openSearchResult(msg: OpenResultMessage): Promise<void> {
  const uri = vscode.Uri.file(msg.path);
  const start = new vscode.Position(msg.startLine, msg.startCol);
  const end = new vscode.Position(msg.endLine, msg.endCol);
  const range = new vscode.Range(start, end);

  const existing = vscode.workspace.textDocuments.find((d) => d.uri.fsPath === msg.path);
  const doc = existing ?? await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(doc, {
    selection: range,
    viewColumn: vscode.ViewColumn.Active,
    preview: false,
  });
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

(function () {
  const vscode = acquireVsCodeApi();

  const queryEl = document.getElementById('query');
  const replaceEl = document.getElementById('replace');
  const replaceAllGlobalBtn = document.getElementById('replaceAllGlobalBtn');
  const undoLastReplaceBtn = document.getElementById('undoLastReplaceBtn');
  const includeEl = document.getElementById('include');
  const excludeEl = document.getElementById('exclude');
  const scopeEl = document.getElementById('scope');
  const resultsEl = document.getElementById('results');
  const errorEl = document.getElementById('error');
  const statusEl = document.getElementById('status');
  const progressEl = document.getElementById('progress');
  const caseBtn = document.getElementById('caseBtn');
  const regexBtn = document.getElementById('regexBtn');
  const wordBtn = document.getElementById('wordBtn');

  const state = {
    isCaseSensitive: false,
    isRegex: false,
    matchWholeWord: false,
    scopeId: 'comment',
    searchId: 0,
    activeSearchId: 0,
    restored: false,
    allResults: [],
    excludedMatches: new Map(),
    workspaceRoots: [],
    fileIcons: {},
    canUndo: false,
    undoLabel: '',
  };

  function matchKey(r) {
    return r.path + ':' + r.startLine + ':' + r.startCol + ':' + r.endLine + ':' + r.endCol;
  }

  function shortCount(n) {
    if (n == null || n < 0) {
      return '?';
    }
    if (n < 1000) {
      return String(n);
    }
    if (n < 10000) {
      return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.round(n / 1000) + 'k';
  }

  function toggle(btn, key, value) {
    if (value !== undefined) {
      state[key] = !!value;
    } else {
      state[key] = !state[key];
    }
    btn.classList.toggle('active', state[key]);
  }

  function onSearchFlagToggle(btn, key) {
    toggle(btn, key);
    persistState();
    layoutMatchPreviews();
    scheduleSearch();
  }

  caseBtn.addEventListener('click', () => onSearchFlagToggle(caseBtn, 'isCaseSensitive'));
  regexBtn.addEventListener('click', () => onSearchFlagToggle(regexBtn, 'isRegex'));
  wordBtn.addEventListener('click', () => onSearchFlagToggle(wordBtn, 'matchWholeWord'));

  const INPUT_HISTORY_MAX = 50;

  function isSingleLineInputValue(value) {
    return !/[\r\n]/.test(value);
  }

  function createInputHistory(initialItems) {
    const items = Array.isArray(initialItems) ? initialItems.filter((v) => typeof v === 'string') : [];
    let index = -1;
    let draft = '';

    function trimHistory(list) {
      const out = [];
      for (const entry of list) {
        const v = String(entry);
        if (!v) {
          continue;
        }
        const existing = out.indexOf(v);
        if (existing !== -1) {
          out.splice(existing, 1);
        }
        out.push(v);
      }
      return out.slice(-INPUT_HISTORY_MAX);
    }

    function normalizedItems() {
      return trimHistory(items);
    }

    function syncItems(next) {
      items.length = 0;
      items.push(...trimHistory(next));
    }

    return {
      items: () => normalizedItems(),
      load(saved) {
        syncItems(saved || []);
        index = -1;
        draft = '';
      },
      exportItems() {
        return normalizedItems();
      },
      resetNavigation() {
        index = -1;
        draft = '';
      },
      push(value) {
        const v = String(value ?? '');
        if (!v) {
          return;
        }
        const next = normalizedItems().filter((entry) => entry !== v);
        next.push(v);
        syncItems(next);
        index = -1;
        draft = v;
      },
      onKeyDown(inputEl, event) {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
          return false;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return false;
        }
        if (!isSingleLineInputValue(inputEl.value)) {
          return false;
        }
        const list = normalizedItems();
        if (list.length === 0) {
          return false;
        }
        if (event.key === 'ArrowUp') {
          if (index === -1) {
            draft = inputEl.value;
            index = list.length - 1;
          } else if (index > 0) {
            index -= 1;
          }
          inputEl.value = list[index];
          inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
          event.preventDefault();
          return true;
        }
        if (index === -1) {
          return false;
        }
        if (index < list.length - 1) {
          index += 1;
          inputEl.value = list[index];
        } else {
          index = -1;
          inputEl.value = draft;
        }
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
        event.preventDefault();
        return true;
      },
    };
  }

  const queryHistory = createInputHistory([]);
  const replaceHistory = createInputHistory([]);

  function panelState() {
    return {
      query: queryEl.value,
      replace: replaceEl.value,
      queryHistory: queryHistory.exportItems(),
      replaceHistory: replaceHistory.exportItems(),
      include: includeEl.value,
      exclude: excludeEl.value,
      isRegex: state.isRegex,
      isCaseSensitive: state.isCaseSensitive,
      matchWholeWord: state.matchWholeWord,
      scopeId: scopeEl.value || state.scopeId,
    };
  }

  function persistState() {
    const s = panelState();
    vscode.setState(s);
    vscode.postMessage({ type: 'saveState', state: s });
  }

  function applyState(s) {
    if (!s) {
      return;
    }
    if (s.query != null) {
      queryEl.value = s.query;
    }
    if (s.replace != null) {
      replaceEl.value = s.replace;
    }
    if (s.queryHistory) {
      queryHistory.load(s.queryHistory);
    }
    if (s.replaceHistory) {
      replaceHistory.load(s.replaceHistory);
    }
    if (s.include != null) {
      includeEl.value = s.include;
    }
    if (s.exclude != null) {
      excludeEl.value = s.exclude;
    }
    if (s.isCaseSensitive != null) {
      toggle(caseBtn, 'isCaseSensitive', s.isCaseSensitive);
    }
    if (s.isRegex != null) {
      toggle(regexBtn, 'isRegex', s.isRegex);
    }
    if (s.matchWholeWord != null) {
      toggle(wordBtn, 'matchWholeWord', s.matchWholeWord);
    }
    if (s.scopeId) {
      state.scopeId = s.scopeId;
      if ([...scopeEl.options].some((o) => o.value === s.scopeId)) {
        scopeEl.value = s.scopeId;
      }
    }
  }

  function payload() {
    const s = panelState();
    return {
      query: s.query,
      replace: s.replace,
      include: s.include,
      exclude: s.exclude,
      isRegex: s.isRegex,
      isCaseSensitive: s.isCaseSensitive,
      matchWholeWord: s.matchWholeWord,
      scopeId: s.scopeId,
    };
  }

  function skipMatchesPayload() {
    return Array.from(state.excludedMatches.values());
  }

  function replacePayload(extra) {
    return {
      ...payload(),
      skipMatches: skipMatchesPayload(),
      ...extra,
    };
  }

  function clearExclusions() {
    state.excludedMatches.clear();
  }

  function visibleResults() {
    return state.allResults.filter((r) => !state.excludedMatches.has(matchKey(r)));
  }

  function updateStatusFromResults(results) {
    const n = results.length;
    const f = new Set(results.map((r) => r.path)).size;
    if (n === 0) {
      setStatus('No results found');
    } else if (f === 1) {
      setStatus(n === 1 ? '1 result in 1 file' : n + ' results in 1 file');
    } else {
      setStatus(n + ' results in ' + f + ' files');
    }
  }

  function setSearching(active) {
    progressEl.hidden = !active;
    progressEl.classList.toggle('active', active);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function formatSearching(msg) {
    if (msg.phase === 'listing') {
      return 'Listing files…';
    }
    const file = msg.currentFile || '…';
    const idx = msg.fileIndex ?? 0;
    const total = shortCount(msg.fileTotal);
    const matches = msg.matchCount != null ? ' · ' + msg.matchCount + ' hit' + (msg.matchCount === 1 ? '' : 's') : '';
    const phase = msg.phase === 'reading' ? 'read' : 'scan';
    return file + ' · ' + phase + ' ' + idx + '/' + total + matches;
  }

  function runSearchNow() {
    const p = payload();
    errorEl.textContent = '';
    persistState();
    clearExclusions();
    if (!p.query.trim()) {
      state.activeSearchId = ++state.searchId;
      state.allResults = [];
      setSearching(false);
      setStatus('');
      resultsEl.innerHTML = '';
      return;
    }
    state.searchId += 1;
    const searchId = state.searchId;
    state.activeSearchId = searchId;
    setSearching(true);
    setStatus('Listing files…');
    vscode.postMessage({ type: 'search', searchId, ...p });
  }

  let searchTimer;
  function scheduleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearchNow, 300);
  }

  function updateScopes() {
    persistState();
    vscode.postMessage({
      type: 'updateScope',
      include: includeEl.value,
      exclude: excludeEl.value,
    });
  }

  let scopeTimer;
  function scheduleScopeUpdate() {
    clearTimeout(scopeTimer);
    scopeTimer = setTimeout(updateScopes, 300);
  }

  function clearAll() {
    clearTimeout(searchTimer);
    state.searchId += 1;
    state.activeSearchId = state.searchId;
    queryEl.value = '';
    replaceEl.value = '';
    toggle(caseBtn, 'isCaseSensitive', false);
    toggle(regexBtn, 'isRegex', false);
    toggle(wordBtn, 'matchWholeWord', false);
    errorEl.textContent = '';
    state.allResults = [];
    clearExclusions();
    resultsEl.innerHTML = '';
    setSearching(false);
    setStatus('');
    persistState();
    updateReplaceButtons();
  }

  function stopSearch() {
    clearTimeout(searchTimer);
    state.searchId += 1;
    state.activeSearchId = state.searchId;
    setSearching(false);
    setStatus('Search stopped');
  }

  function replaceEnabled() {
    return queryEl.value.trim().length > 0;
  }

  function updateUndoButton() {
    if (!undoLastReplaceBtn) {
      return;
    }
    undoLastReplaceBtn.hidden = !state.canUndo;
    undoLastReplaceBtn.disabled = !state.canUndo;
    undoLastReplaceBtn.title = state.canUndo && state.undoLabel
      ? 'Undo last replace: ' + state.undoLabel
      : 'Undo last replace';
  }

  function updateReplaceButtons() {
    const enabled = replaceEnabled();
    if (replaceAllGlobalBtn) {
      replaceAllGlobalBtn.disabled = !enabled;
    }
    for (const btn of resultsEl.querySelectorAll('.replace-all-btn, .match-replace-btn')) {
      btn.disabled = !enabled;
    }
    updateUndoButton();
  }

  function excludeMatch(r) {
    state.excludedMatches.set(matchKey(r), {
      path: r.path,
      startLine: r.startLine,
      startCol: r.startCol,
      endLine: r.endLine,
      endCol: r.endCol,
    });
    renderResults();
    updateStatusFromResults(visibleResults());
  }

  function commitQueryHistory() {
    queryHistory.push(queryEl.value);
  }

  function commitReplaceHistory() {
    replaceHistory.push(replaceEl.value);
  }

  function bindInputHistory(inputEl, history, onNavigate) {
    inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && inputEl === queryEl) {
        commitQueryHistory();
        clearTimeout(searchTimer);
        runSearchNow();
        event.preventDefault();
        return;
      }
      if (history.onKeyDown(inputEl, event)) {
        persistState();
        onNavigate?.();
      }
    });
    inputEl.addEventListener('input', () => {
      history.resetNavigation();
    });
    inputEl.addEventListener('change', () => {
      if (inputEl === queryEl) {
        commitQueryHistory();
      } else if (inputEl === replaceEl) {
        commitReplaceHistory();
      }
      persistState();
    });
  }

  bindInputHistory(queryEl, queryHistory, () => {
    updateReplaceButtons();
    scheduleSearch();
  });
  bindInputHistory(replaceEl, replaceHistory, () => {
    updateReplaceButtons();
    layoutMatchPreviews();
  });

  queryEl.addEventListener('input', () => {
    persistState();
    updateReplaceButtons();
    scheduleSearch();
  });
  replaceEl.addEventListener('input', () => {
    persistState();
    updateReplaceButtons();
    layoutMatchPreviews();
  });
  includeEl.addEventListener('input', () => {
    persistState();
    scheduleScopeUpdate();
    scheduleSearch();
  });
  excludeEl.addEventListener('input', () => {
    persistState();
    scheduleScopeUpdate();
    scheduleSearch();
  });

  scopeEl.addEventListener('change', () => {
    state.scopeId = scopeEl.value;
    persistState();
    scheduleSearch();
  });

  if (replaceAllGlobalBtn) {
    replaceAllGlobalBtn.addEventListener('click', () => {
      if (!replaceEnabled()) {
        return;
      }
      const paths = [...new Set(visibleResults().map((r) => r.path))];
      if (paths.length === 0) {
        return;
      }
      commitQueryHistory();
      commitReplaceHistory();
      vscode.postMessage({
        type: 'replaceAll',
        ...replacePayload({ paths }),
      });
    });
  }

  if (undoLastReplaceBtn) {
    undoLastReplaceBtn.addEventListener('click', () => {
      if (!state.canUndo) {
        return;
      }
      vscode.postMessage({ type: 'undoLastReplace' });
    });
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'restoreState') {
      applyState(msg.state);
      state.restored = true;
      updateReplaceButtons();
      if (queryEl.value.trim()) {
        scheduleSearch();
      } else {
        updateScopes();
      }
    } else if (msg.type === 'scopes') {
      const prev = scopeEl.value || state.scopeId;
      scopeEl.innerHTML = '';
      for (const s of msg.scopes) {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        scopeEl.appendChild(opt);
      }
      if ([...scopeEl.options].some((o) => o.value === prev)) {
        scopeEl.value = prev;
      } else if ([...scopeEl.options].some((o) => o.value === 'comment')) {
        scopeEl.value = 'comment';
      } else if (scopeEl.options.length > 0) {
        scopeEl.value = scopeEl.options[0].value;
      }
      state.scopeId = scopeEl.value;
    } else if (msg.type === 'searchStatus') {
      if (msg.searchId !== state.activeSearchId) {
        return;
      }
      if (msg.state === 'searching') {
        setSearching(true);
        setStatus(formatSearching(msg));
      } else if (msg.state === 'complete') {
        setSearching(false);
        const visible = visibleResults();
        const n = visible.length;
        const f = new Set(visible.map((r) => r.path)).size;
        const scanned = msg.fileTotal != null ? ' · scanned ' + shortCount(msg.fileTotal) : '';
        if (n === 0) {
          setStatus('No results found' + scanned);
        } else if (f === 1) {
          setStatus((n === 1 ? '1 result in 1 file' : n + ' results in 1 file') + scanned);
        } else {
          setStatus(n + ' results in ' + f + ' files' + scanned);
        }
      } else if (msg.state === 'stopped') {
        setSearching(false);
        setStatus('Search stopped');
      } else if (msg.state === 'idle') {
        setSearching(false);
        setStatus('');
      }
    } else if (msg.type === 'results') {
      if (msg.searchId !== undefined && msg.searchId !== state.activeSearchId) {
        return;
      }
      errorEl.textContent = '';
      state.allResults = msg.results || [];
      state.workspaceRoots = msg.workspaceRoots || [];
      state.fileIcons = msg.fileIcons || {};
      if (!msg.preserveExclusions) {
        clearExclusions();
      }
      renderResults();
      updateReplaceButtons();
    } else if (msg.type === 'historyState') {
      state.canUndo = !!msg.canUndo;
      state.undoLabel = msg.label || '';
      updateUndoButton();
    } else if (msg.type === 'error') {
      setSearching(false);
      errorEl.textContent = msg.error;
    } else if (msg.type === 'focusQuery') {
      queryEl.focus();
      queryEl.select();
    } else if (msg.type === 'refresh') {
      runSearchNow();
    } else if (msg.type === 'clear') {
      clearAll();
    } else if (msg.type === 'stop') {
      stopSearch();
    }
  });

  function splitFilePath(fullPath, workspaceRoots) {
    let rel = fullPath;
    const sorted = (workspaceRoots || []).slice().sort((a, b) => b.length - a.length);
    for (const root of sorted) {
      const prefix = root.endsWith('/') ? root : root + '/';
      if (fullPath === root) {
        rel = '';
        break;
      }
      if (fullPath.startsWith(prefix)) {
        rel = fullPath.slice(prefix.length);
        break;
      }
    }
    const slash = rel.lastIndexOf('/');
    if (slash === -1) {
      return { name: rel || fullPath, dir: '' };
    }
    return { name: rel.slice(slash + 1), dir: rel.slice(0, slash) };
  }

  function groupResultsByFile(results) {
    const groups = [];
    const index = new Map();
    for (const r of results) {
      let group = index.get(r.path);
      if (!group) {
        group = { path: r.path, matches: [] };
        index.set(r.path, group);
        groups.push(group);
      }
      group.matches.push(r);
    }
    return groups;
  }

  const ELLIPSIS = '\u2026';
  let previewMeasureEl;
  let previewLayoutObserver;

  function createTextMeasurer(sampleEl) {
    if (!previewMeasureEl) {
      previewMeasureEl = document.createElement('span');
      previewMeasureEl.style.position = 'absolute';
      previewMeasureEl.style.visibility = 'hidden';
      previewMeasureEl.style.whiteSpace = 'nowrap';
      previewMeasureEl.style.pointerEvents = 'none';
      previewMeasureEl.style.left = '0';
      previewMeasureEl.style.top = '0';
      document.body.appendChild(previewMeasureEl);
    }
    const style = getComputedStyle(sampleEl);
    previewMeasureEl.style.fontFamily = style.fontFamily;
    previewMeasureEl.style.fontSize = style.fontSize;
    previewMeasureEl.style.fontWeight = style.fontWeight;
    previewMeasureEl.style.fontStyle = style.fontStyle;
    previewMeasureEl.style.letterSpacing = style.letterSpacing;
    return (text) => {
      previewMeasureEl.textContent = text;
      return previewMeasureEl.getBoundingClientRect().width;
    };
  }

  function fitPrefix(text, maxWidth, measure) {
    if (!text || maxWidth <= 0) {
      return '';
    }
    if (measure(text) <= maxWidth) {
      return text;
    }
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (measure(text.slice(0, mid)) <= maxWidth) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return text.slice(0, lo);
  }

  function fitSuffix(text, maxWidth, measure) {
    if (!text || maxWidth <= 0) {
      return '';
    }
    if (measure(text) <= maxWidth) {
      return text;
    }
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (measure(text.slice(text.length - mid)) <= maxWidth) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return text.slice(text.length - lo);
  }

  function truncateSection(text, sideBudget, measure) {
    if (!text) {
      return '';
    }
    if (measure(text) <= sideBudget) {
      return text;
    }
    const ellW = measure(ELLIPSIS);
    let inner = sideBudget - ellW;
    if (inner <= 0) {
      return ELLIPSIS;
    }
    const headBudget = inner * 0.5;
    const tailBudget = inner - headBudget;
    let head = fitPrefix(text, headBudget, measure);
    let tail = fitSuffix(text, tailBudget, measure);
    if (head.length + tail.length >= text.length) {
      return text;
    }
    const maxHeadLen = text.length - tail.length;
    if (head.length > maxHeadLen) {
      head = text.slice(0, maxHeadLen);
    }
    return head + ELLIPSIS + tail;
  }

  function replacePreviewActive() {
    return replaceEl.value.length > 0;
  }

  function replacementOptions() {
    return {
      pattern: queryEl.value,
      isRegex: state.isRegex,
      isCaseSensitive: state.isCaseSensitive,
    };
  }

  function matchIndexInPreview(preview, matchedText, startCol) {
    const col = Number(startCol);
    if (
      Number.isFinite(col) &&
      col >= 0 &&
      preview.slice(col, col + matchedText.length) === matchedText
    ) {
      return col;
    }
    return preview.indexOf(matchedText);
  }

  /** Strip leading whitespace before the match; display-only. */
  function stripLeadingForDisplay(text, matchStart) {
    if (!text || matchStart <= 0) {
      return { text, matchStart };
    }
    const leading = text.slice(0, matchStart);
    const trimCount = leading.length - leading.trimStart().length;
    if (trimCount <= 0) {
      return { text, matchStart };
    }
    return { text: text.slice(trimCount), matchStart: matchStart - trimCount };
  }

  function resolveReplaceText(matchedText, preview, startCol) {
    const template = replaceEl.value;
    if (!replacePreviewActive()) {
      return '';
    }
    if (!state.isRegex || !matchedText) {
      return template;
    }
    const matchIdx = matchIndexInPreview(preview, matchedText, startCol);
    return ScopeSearchReplacement.resolveMatchReplacement(
      template,
      matchedText,
      replacementOptions(),
      preview,
      matchIdx >= 0 ? matchIdx : undefined,
    );
  }

  function truncateAroundMatch(preview, matchedText, maxWidth, measure, replaceText, startCol) {
    if (!preview || maxWidth <= 0) {
      return { text: preview || '', matchStart: 0 };
    }
    const showReplace = replaceText != null && replaceText.length > 0 && matchedText;
    if (!matchedText) {
      return { text: fitPrefix(preview, maxWidth, measure), matchStart: 0 };
    }

    const matchIdx = matchIndexInPreview(preview, matchedText, startCol);
    if (matchIdx === -1) {
      return { text: fitPrefix(preview, maxWidth, measure), matchStart: 0 };
    }

    const before = preview.slice(0, matchIdx);
    const match = matchedText;
    const after = preview.slice(matchIdx + matchedText.length);
    const displayFull = before + match + (showReplace ? replaceText : '') + after;
    if (measure(displayFull) <= maxWidth) {
      return { text: preview, matchStart: matchIdx };
    }

    const matchW = measure(match);
    const replaceW = showReplace ? measure(replaceText) : 0;
    let contextBudget = Math.max(0, maxWidth - matchW - replaceW);

    if (contextBudget <= 0) {
      return { text: fitPrefix(match, maxWidth, measure), matchStart: 0 };
    }

    for (let pass = 0; pass < 10; pass++) {
      const beforeBudget = before ? contextBudget * 0.5 : 0;
      const afterBudget = after ? contextBudget - beforeBudget : 0;
      const beforePart = before ? truncateSection(before, beforeBudget, measure) : '';
      const afterPart = after ? truncateSection(after, afterBudget, measure) : '';
      const candidate = beforePart + match + afterPart;
      const displayCandidate = beforePart + match + (showReplace ? replaceText : '') + afterPart;
      if (measure(displayCandidate) <= maxWidth) {
        return { text: candidate, matchStart: beforePart.length };
      }
      contextBudget *= 0.85;
    }

    const text = fitPrefix(preview, maxWidth, measure);
    const matchStart = matchIndexInPreview(text, matchedText, startCol);
    return { text, matchStart: matchStart >= 0 ? matchStart : 0 };
  }

  function buildPreviewHtml(preview, matchedText, replaceText, matchStart) {
    if (!matchedText) {
      return escapeHtml(preview);
    }
    const idx = matchStart;
    if (idx < 0 || preview.slice(idx, idx + matchedText.length) !== matchedText) {
      return escapeHtml(preview);
    }
    const before = preview.slice(0, idx);
    const after = preview.slice(idx + matchedText.length);
    if (replaceText != null && replaceText.length > 0) {
      return (
        escapeHtml(before) +
        '<span class="replace-old">' +
        escapeHtml(matchedText) +
        '</span>' +
        '<span class="replace-new">' +
        escapeHtml(replaceText) +
        '</span>' +
        escapeHtml(after)
      );
    }
    return (
      escapeHtml(before) +
      '<mark>' +
      escapeHtml(matchedText) +
      '</mark>' +
      escapeHtml(after)
    );
  }

  function layoutMatchPreview(previewEl) {
    const preview = previewEl.dataset.preview || '';
    const matchedText = previewEl.dataset.matchedText || '';
    const startCol = previewEl.dataset.startCol;
    const matchIdx = matchIndexInPreview(preview, matchedText, startCol);
    const replaceText = resolveReplaceText(matchedText, preview, startCol);
    const line = previewEl.closest('.match-line');
    if (!line) {
      return;
    }
    const lineStyle = getComputedStyle(line);
    const padX = parseFloat(lineStyle.paddingLeft) + parseFloat(lineStyle.paddingRight);
    const maxWidth = Math.max(40, line.clientWidth - padX);
    const measure = createTextMeasurer(previewEl);
    const truncated = truncateAroundMatch(
      preview,
      matchedText,
      maxWidth,
      measure,
      replaceText,
      startCol,
    );
    const display = stripLeadingForDisplay(truncated.text, truncated.matchStart);
    previewEl.innerHTML = buildPreviewHtml(
      display.text,
      matchedText,
      replaceText,
      display.matchStart,
    );
    previewEl.title = preview.trim();
  }

  function layoutMatchPreviews() {
    for (const previewEl of resultsEl.querySelectorAll('.match-preview')) {
      layoutMatchPreview(previewEl);
    }
  }

  function ensurePreviewLayoutObserver() {
    if (previewLayoutObserver) {
      return;
    }
    previewLayoutObserver = new ResizeObserver(() => {
      layoutMatchPreviews();
    });
    previewLayoutObserver.observe(resultsEl);
    if (resultsEl.parentElement) {
      previewLayoutObserver.observe(resultsEl.parentElement);
    }
  }

  function highlightPreview(preview, matchedText, startCol) {
    const matchIdx = matchIndexInPreview(preview, matchedText, startCol);
    const replaceText = resolveReplaceText(matchedText, preview, startCol);
    const display = stripLeadingForDisplay(preview, matchIdx >= 0 ? matchIdx : 0);
    return buildPreviewHtml(
      display.text,
      matchedText,
      replaceText,
      display.matchStart,
    );
  }

  function openMatch(r) {
    vscode.postMessage({
      type: 'openResult',
      path: r.path,
      startLine: r.startLine,
      startCol: r.startCol,
      endLine: r.endLine,
      endCol: r.endCol,
    });
  }

  function createIconButton(className, title) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.title = title;
    return btn;
  }

  function renderResults() {
    resultsEl.innerHTML = '';
    const results = visibleResults();
    const groups = groupResultsByFile(results);
    const canReplace = replaceEnabled();
    for (const group of groups) {
      const { name, dir } = splitFilePath(group.path, state.workspaceRoots);
      const fileGroup = document.createElement('div');
      fileGroup.className = 'file-group';

      const header = document.createElement('div');
      header.className = 'file-header';

      const chevron = document.createElement('span');
      chevron.className = 'chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = '▾';

      const fileName = document.createElement('span');
      fileName.className = 'file-name';
      fileName.textContent = name;

      header.appendChild(chevron);

      const iconUrl = state.fileIcons[group.path];
      if (iconUrl) {
        const fileIcon = document.createElement('img');
        fileIcon.className = 'file-icon';
        fileIcon.src = iconUrl;
        fileIcon.alt = '';
        fileIcon.setAttribute('aria-hidden', 'true');
        header.appendChild(fileIcon);
      } else {
        const fileIcon = document.createElement('span');
        fileIcon.className = 'file-icon codicon codicon-file';
        fileIcon.setAttribute('aria-hidden', 'true');
        header.appendChild(fileIcon);
      }

      header.appendChild(fileName);
      if (dir) {
        const fileDir = document.createElement('span');
        fileDir.className = 'file-dir';
        fileDir.textContent = dir;
        header.appendChild(fileDir);
      }

      const actions = document.createElement('div');
      actions.className = 'file-actions';

      const replaceBtn = createIconButton('replace-all-btn icon-btn codicon codicon-replace', 'Replace All in File');
      replaceBtn.disabled = !canReplace;
      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!replaceEnabled()) {
          return;
        }
        commitQueryHistory();
        commitReplaceHistory();
        vscode.postMessage({
          type: 'replaceAllInFile',
          path: group.path,
          ...replacePayload(),
        });
      });

      const badge = document.createElement('span');
      badge.className = 'match-badge';
      badge.textContent = String(group.matches.length);

      actions.appendChild(replaceBtn);
      actions.appendChild(badge);
      header.appendChild(actions);

      header.addEventListener('click', (e) => {
        if (e.target.closest('.replace-all-btn')) {
          return;
        }
        fileGroup.classList.toggle('collapsed');
        chevron.textContent = fileGroup.classList.contains('collapsed') ? '▸' : '▾';
      });

      const matchList = document.createElement('ul');
      matchList.className = 'file-matches';
      for (const r of group.matches) {
        const li = document.createElement('li');
        li.className = 'match-line';

        const preview = document.createElement('div');
        preview.className = 'match-preview';
        preview.dataset.preview = r.preview;
        preview.dataset.matchedText = r.matchedText || '';
        preview.dataset.startCol = String(r.startCol);
        preview.innerHTML = highlightPreview(r.preview, r.matchedText, r.startCol);
        preview.title = r.preview.trim();
        preview.addEventListener('click', (e) => {
          e.stopPropagation();
          openMatch(r);
        });

        const matchActions = document.createElement('div');
        matchActions.className = 'match-actions';

        const matchReplaceBtn = createIconButton('match-replace-btn icon-btn codicon codicon-replace', 'Replace');
        matchReplaceBtn.disabled = !canReplace;
        matchReplaceBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!replaceEnabled()) {
            return;
          }
          commitQueryHistory();
          commitReplaceHistory();
          const visible = visibleResults();
          const replacedIndex = visible.findIndex((m) => matchKey(m) === matchKey(r));
          vscode.postMessage({
            type: 'replaceOne',
            path: r.path,
            startLine: r.startLine,
            startCol: r.startCol,
            endLine: r.endLine,
            endCol: r.endCol,
            replacedIndex: replacedIndex >= 0 ? replacedIndex : undefined,
            ...replacePayload(),
          });
        });

        const dismissBtn = createIconButton('match-dismiss-btn icon-btn codicon codicon-close', 'Dismiss');
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          excludeMatch(r);
        });

        matchActions.appendChild(matchReplaceBtn);
        matchActions.appendChild(dismissBtn);

        li.appendChild(preview);
        li.appendChild(matchActions);
        matchList.appendChild(li);
      }

      fileGroup.appendChild(header);
      fileGroup.appendChild(matchList);
      resultsEl.appendChild(fileGroup);
    }
    ensurePreviewLayoutObserver();
    requestAnimationFrame(() => layoutMatchPreviews());
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  applyState(vscode.getState());
  updateReplaceButtons();
  vscode.postMessage({ type: 'ready' });
})();

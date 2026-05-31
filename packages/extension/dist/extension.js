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
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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

// ../core/dist/types.js
var require_types = __commonJS({
  "../core/dist/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SCOPE_LABELS = exports2.DEFAULT_SCOPE = void 0;
    exports2.matchKey = matchKey2;
    exports2.matchPositionsEqual = matchPositionsEqual2;
    exports2.scopeLabel = scopeLabel2;
    function matchKey2(match) {
      return `${match.path}:${match.startLine}:${match.startCol}:${match.endLine}:${match.endCol}`;
    }
    function matchPositionsEqual2(a, b) {
      return a.startLine === b.startLine && a.startCol === b.startCol && a.endLine === b.endLine && a.endCol === b.endCol;
    }
    exports2.DEFAULT_SCOPE = "comment";
    exports2.SCOPE_LABELS = {
      comment: "Comments",
      string: "Strings",
      keyword: "Keywords",
      type: "Types",
      variable: "Variables",
      constant: "Constants",
      number: "Numbers",
      operator: "Operators",
      punctuation: "Punctuation",
      meta: "Meta"
    };
    function scopeLabel2(id) {
      return exports2.SCOPE_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
    }
  }
});

// ../core/dist/scopes.js
var require_scopes = __commonJS({
  "../core/dist/scopes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.classifyTextMateScopes = classifyTextMateScopes;
    exports2.classifyTreeSitterCapture = classifyTreeSitterCapture;
    exports2.classifyTreeSitterNodeType = classifyTreeSitterNodeType;
    exports2.mergeSpans = mergeSpans;
    exports2.offsetToLineCol = offsetToLineCol;
    exports2.lineColToOffset = lineColToOffset;
    var SCOPE_PATTERNS = [
      [/^comment(\.|$)/, "comment"],
      [/\.comment(\.|$)/, "comment"],
      [/^string(\.|$)/, "string"],
      [/\.string(\.|$)/, "string"],
      [/^keyword(\.|$)/, "keyword"],
      [/\.keyword(\.|$)/, "keyword"],
      [/\.storage\.type(\.|$)/, "type"],
      [/\.entity\.name\.type(\.|$)/, "type"],
      [/\.support\.type(\.|$)/, "type"],
      [/^variable(\.|$)/, "variable"],
      [/\.variable(\.|$)/, "variable"],
      [/^constant(\.|$)/, "constant"],
      [/\.constant(\.|$)/, "constant"],
      [/\.constant\.numeric(\.|$)/, "number"],
      [/\.keyword\.operator(\.|$)/, "operator"],
      [/\.punctuation(\.|$)/, "punctuation"],
      [/^meta(\.|$)/, "meta"],
      [/\.meta(\.|$)/, "meta"]
    ];
    function classifyTextMateScopes(scopes) {
      for (let i2 = scopes.length - 1; i2 >= 0; i2--) {
        const scope = scopes[i2];
        for (const [pattern, category] of SCOPE_PATTERNS) {
          if (pattern.test(scope)) {
            return category;
          }
        }
      }
      return void 0;
    }
    var TS_CAPTURE_MAP = {
      comment: "comment",
      string: "string",
      keyword: "keyword",
      type: "type",
      variable: "variable",
      constant: "constant",
      number: "number",
      operator: "operator",
      punctuation: "punctuation",
      property: "variable",
      function: "variable",
      method: "variable",
      parameter: "variable"
    };
    function classifyTreeSitterCapture(name2) {
      const base = name2.replace(/^@/, "").split(".")[0];
      return TS_CAPTURE_MAP[base] ?? (base in TS_CAPTURE_MAP ? TS_CAPTURE_MAP[base] : void 0);
    }
    function classifyTreeSitterNodeType(type) {
      const lower = type.toLowerCase();
      if (lower.includes("comment")) {
        return "comment";
      }
      if (lower.includes("string")) {
        return "string";
      }
      return void 0;
    }
    function mergeSpans(spans) {
      if (spans.length === 0) {
        return [];
      }
      const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
      const merged = [sorted[0]];
      for (let i2 = 1; i2 < sorted.length; i2++) {
        const cur = sorted[i2];
        const last = merged[merged.length - 1];
        if (cur.start <= last.end) {
          last.end = Math.max(last.end, cur.end);
        } else {
          merged.push({ ...cur });
        }
      }
      return merged;
    }
    function offsetToLineCol(text, offset) {
      let line = 0;
      let col = 0;
      for (let i2 = 0; i2 < offset && i2 < text.length; i2++) {
        if (text.charCodeAt(i2) === 10) {
          line++;
          col = 0;
        } else {
          col++;
        }
      }
      return { line, col };
    }
    function lineColToOffset(text, line, col) {
      let offset = 0;
      let curLine = 0;
      while (curLine < line && offset < text.length) {
        if (text.charCodeAt(offset) === 10) {
          curLine++;
        }
        offset++;
      }
      let curCol = 0;
      while (curCol < col && offset < text.length) {
        if (text.charCodeAt(offset) === 10) {
          break;
        }
        offset++;
        curCol++;
      }
      return offset;
    }
  }
});

// ../core/dist/replacement.js
var require_replacement = __commonJS({
  "../core/dist/replacement.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyReplacementTemplate = applyReplacementTemplate;
    exports2.resolveMatchReplacement = resolveMatchReplacement;
    function applyReplacementTemplate(replacement, match, context) {
      return replacement.replace(/\$(?:\$|&|`|'|(\d+)|<([^>]+)>)/g, (token, index, name2) => {
        if (token === "$$") {
          return "$";
        }
        if (token === "$&") {
          return match[0] ?? "";
        }
        if (token === "$`") {
          return context.slice(0, match.index ?? 0);
        }
        if (token === "$'") {
          return context.slice((match.index ?? 0) + match[0].length);
        }
        if (name2 !== void 0) {
          return match.groups?.[name2] ?? token;
        }
        if (index !== void 0) {
          const n = Number(index);
          if (n === 0) {
            return match[0] ?? "";
          }
          return match[n] ?? token;
        }
        return token;
      });
    }
    function execMatchAt(pattern, flags2, context, at, length) {
      const re = new RegExp(pattern, flags2);
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(context)) !== null) {
        if (m.index === at && m[0].length === length) {
          return m;
        }
        if (m[0].length === 0) {
          re.lastIndex++;
        }
      }
      return void 0;
    }
    function resolveMatchReplacement(replacement, matchedText, options, context, matchStartInContext) {
      if (!options.isRegex) {
        return replacement;
      }
      const flags2 = options.isCaseSensitive ? "u" : "ui";
      const ctx = context ?? matchedText;
      const at = matchStartInContext ?? (context ? context.indexOf(matchedText) : 0);
      if (at < 0) {
        return replacement;
      }
      let match = execMatchAt(options.pattern, flags2, ctx, at, matchedText.length);
      if (!match && context === void 0) {
        const re = new RegExp(options.pattern, flags2);
        re.lastIndex = 0;
        const direct = re.exec(matchedText);
        if (direct && direct.index === 0 && direct[0].length === matchedText.length) {
          match = direct;
        }
      }
      if (!match) {
        return replacement;
      }
      return applyReplacementTemplate(replacement, match, ctx);
    }
  }
});

// ../core/dist/search.js
var require_search = __commonJS({
  "../core/dist/search.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.searchInSpans = searchInSpans2;
    exports2.replaceSingleMatch = replaceSingleMatch2;
    exports2.replaceInSpans = replaceInSpans2;
    exports2.validateRegex = validateRegex2;
    var scopes_1 = require_scopes();
    var replacement_1 = require_replacement();
    function buildMatcher(options) {
      const flags2 = options.isCaseSensitive ? "gu" : "giu";
      if (options.isRegex) {
        return new RegExp(options.pattern, flags2);
      }
      const escaped = options.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (options.matchWholeWord) {
        return new RegExp(`\\b${escaped}\\b`, flags2);
      }
      return options.isCaseSensitive ? options.pattern : options.pattern.toLowerCase();
    }
    function matchesLiteral(haystack, needle, isCaseSensitive, matchWholeWord) {
      const results = [];
      if (needle instanceof RegExp) {
        needle.lastIndex = 0;
        let m;
        while ((m = needle.exec(haystack)) !== null) {
          const text = m[0];
          results.push({ start: m.index, end: m.index + text.length, text });
          if (text.length === 0) {
            needle.lastIndex++;
          }
        }
        return results;
      }
      const source = isCaseSensitive ? haystack : haystack.toLowerCase();
      const target = isCaseSensitive ? needle : needle.toLowerCase();
      let from = 0;
      while (from <= source.length) {
        const idx = source.indexOf(target, from);
        if (idx === -1) {
          break;
        }
        const end = idx + target.length;
        if (matchWholeWord) {
          const before = idx > 0 ? haystack[idx - 1] : " ";
          const after = end < haystack.length ? haystack[end] : " ";
          if (!/\W/.test(before) || !/\W/.test(after)) {
            from = idx + 1;
            continue;
          }
        }
        results.push({ start: idx, end, text: haystack.slice(idx, end) });
        from = end || idx + 1;
      }
      return results;
    }
    function searchInSpans2(path4, fileText, spans, options) {
      const filtered = spans.filter((s) => s.category === options.scopeId);
      if (filtered.length === 0 || !options.pattern) {
        return [];
      }
      const merged = (0, scopes_1.mergeSpans)(filtered);
      const matcher = buildMatcher(options);
      const matches = [];
      for (const span of merged) {
        const slice = fileText.slice(span.start, span.end);
        const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
        for (const lm of localMatches) {
          const absStart = span.start + lm.start;
          const absEnd = span.start + lm.end;
          const startPos = (0, scopes_1.offsetToLineCol)(fileText, absStart);
          const endPos = (0, scopes_1.offsetToLineCol)(fileText, absEnd);
          const lineStart = fileText.lastIndexOf("\n", absStart - 1) + 1;
          const lineEnd = fileText.indexOf("\n", absStart);
          const preview = fileText.slice(lineStart, lineEnd === -1 ? void 0 : lineEnd);
          matches.push({
            path: path4,
            startLine: startPos.line,
            startCol: startPos.col,
            endLine: endPos.line,
            endCol: endPos.col,
            matchedText: lm.text,
            preview
          });
        }
      }
      return matches;
    }
    function resolveReplacement(replacement, fileText, absStart, absEnd, options) {
      const matchedText = fileText.slice(absStart, absEnd);
      const lineStart = fileText.lastIndexOf("\n", absStart - 1) + 1;
      const lineEndIdx = fileText.indexOf("\n", absStart);
      const lineEnd = lineEndIdx === -1 ? fileText.length : lineEndIdx;
      const line = fileText.slice(lineStart, lineEnd);
      const relStart = absStart - lineStart;
      return (0, replacement_1.resolveMatchReplacement)(replacement, matchedText, options, line, relStart);
    }
    function isSkipped(start2, end, fileText, skip) {
      if (!skip?.length) {
        return false;
      }
      for (const item of skip) {
        const skipStart = (0, scopes_1.lineColToOffset)(fileText, item.startLine, item.startCol);
        const skipEnd = (0, scopes_1.lineColToOffset)(fileText, item.endLine, item.endCol);
        if (start2 === skipStart && end === skipEnd) {
          return true;
        }
      }
      return false;
    }
    function replaceSingleMatch2(fileText, spans, options, at) {
      const start2 = (0, scopes_1.lineColToOffset)(fileText, at.startLine, at.startCol);
      const end = (0, scopes_1.lineColToOffset)(fileText, at.endLine, at.endCol);
      const filtered = spans.filter((s) => s.category === options.scopeId);
      if (filtered.length === 0 || !options.pattern || start2 >= end) {
        return { replacement: "", count: 0 };
      }
      const merged = (0, scopes_1.mergeSpans)(filtered);
      const inScope = merged.some((span) => start2 >= span.start && end <= span.end);
      if (!inScope) {
        return { replacement: "", count: 0 };
      }
      const slice = fileText.slice(start2, end);
      const matcher = buildMatcher(options);
      const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
      if (localMatches.length === 0 || localMatches[0].start !== 0 || localMatches[0].end !== slice.length) {
        return { replacement: "", count: 0 };
      }
      return {
        replacement: resolveReplacement(options.replacement, fileText, start2, end, options),
        count: 1
      };
    }
    function replaceInSpans2(fileText, spans, options) {
      const filtered = spans.filter((s) => s.category === options.scopeId);
      if (filtered.length === 0 || !options.pattern) {
        return { text: fileText, count: 0, edits: [] };
      }
      const merged = (0, scopes_1.mergeSpans)(filtered);
      const matcher = buildMatcher(options);
      const edits = [];
      for (const span of merged) {
        const sliceStart = span.start;
        const slice = fileText.slice(span.start, span.end);
        const localMatches = matchesLiteral(slice, matcher, options.isCaseSensitive, options.matchWholeWord);
        for (const lm of localMatches) {
          const absStart = sliceStart + lm.start;
          const absEnd = sliceStart + lm.end;
          if (isSkipped(absStart, absEnd, fileText, options.skip)) {
            continue;
          }
          edits.push({
            start: absStart,
            end: absEnd,
            text: resolveReplacement(options.replacement, fileText, absStart, absEnd, options)
          });
        }
      }
      if (edits.length === 0) {
        return { text: fileText, count: 0, edits: [] };
      }
      edits.sort((a, b) => b.start - a.start);
      let text = fileText;
      for (const edit of edits) {
        text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
      }
      return { text, count: edits.length, edits };
    }
    function validateRegex2(pattern) {
      try {
        new RegExp(pattern, "u");
        return void 0;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    }
  }
});

// ../../node_modules/fast-glob/out/utils/array.js
var require_array = __commonJS({
  "../../node_modules/fast-glob/out/utils/array.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.splitWhen = exports2.flatten = void 0;
    function flatten(items) {
      return items.reduce((collection, item) => [].concat(collection, item), []);
    }
    exports2.flatten = flatten;
    function splitWhen(items, predicate) {
      const result = [[]];
      let groupIndex = 0;
      for (const item of items) {
        if (predicate(item)) {
          groupIndex++;
          result[groupIndex] = [];
        } else {
          result[groupIndex].push(item);
        }
      }
      return result;
    }
    exports2.splitWhen = splitWhen;
  }
});

// ../../node_modules/fast-glob/out/utils/errno.js
var require_errno = __commonJS({
  "../../node_modules/fast-glob/out/utils/errno.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEnoentCodeError = void 0;
    function isEnoentCodeError(error) {
      return error.code === "ENOENT";
    }
    exports2.isEnoentCodeError = isEnoentCodeError;
  }
});

// ../../node_modules/fast-glob/out/utils/fs.js
var require_fs = __commonJS({
  "../../node_modules/fast-glob/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name2, stats) {
        this.name = name2;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name2, stats) {
      return new DirentFromStats(name2, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// ../../node_modules/fast-glob/out/utils/path.js
var require_path = __commonJS({
  "../../node_modules/fast-glob/out/utils/path.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPosixPathToPattern = exports2.convertWindowsPathToPattern = exports2.convertPathToPattern = exports2.escapePosixPath = exports2.escapeWindowsPath = exports2.escape = exports2.removeLeadingDotSegment = exports2.makeAbsolute = exports2.unixify = void 0;
    var os = require("os");
    var path4 = require("path");
    var IS_WINDOWS_PLATFORM = os.platform() === "win32";
    var LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2;
    var POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
    var WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;
    var DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
    var WINDOWS_BACKSLASHES_RE = /\\(?![!()+@[\]{}])/g;
    function unixify(filepath) {
      return filepath.replace(/\\/g, "/");
    }
    exports2.unixify = unixify;
    function makeAbsolute(cwd, filepath) {
      return path4.resolve(cwd, filepath);
    }
    exports2.makeAbsolute = makeAbsolute;
    function removeLeadingDotSegment(entry) {
      if (entry.charAt(0) === ".") {
        const secondCharactery = entry.charAt(1);
        if (secondCharactery === "/" || secondCharactery === "\\") {
          return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
        }
      }
      return entry;
    }
    exports2.removeLeadingDotSegment = removeLeadingDotSegment;
    exports2.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
    function escapeWindowsPath(pattern) {
      return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapeWindowsPath = escapeWindowsPath;
    function escapePosixPath(pattern) {
      return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapePosixPath = escapePosixPath;
    exports2.convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;
    function convertWindowsPathToPattern(filepath) {
      return escapeWindowsPath(filepath).replace(DOS_DEVICE_PATH_RE, "//$1").replace(WINDOWS_BACKSLASHES_RE, "/");
    }
    exports2.convertWindowsPathToPattern = convertWindowsPathToPattern;
    function convertPosixPathToPattern(filepath) {
      return escapePosixPath(filepath);
    }
    exports2.convertPosixPathToPattern = convertPosixPathToPattern;
  }
});

// ../../node_modules/is-extglob/index.js
var require_is_extglob = __commonJS({
  "../../node_modules/is-extglob/index.js"(exports2, module2) {
    module2.exports = function isExtglob(str) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      var match;
      while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
        if (match[2]) return true;
        str = str.slice(match.index + match[0].length);
      }
      return false;
    };
  }
});

// ../../node_modules/is-glob/index.js
var require_is_glob = __commonJS({
  "../../node_modules/is-glob/index.js"(exports2, module2) {
    var isExtglob = require_is_extglob();
    var chars = { "{": "}", "(": ")", "[": "]" };
    var strictCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      var pipeIndex = -2;
      var closeSquareIndex = -2;
      var closeCurlyIndex = -2;
      var closeParenIndex = -2;
      var backSlashIndex = -2;
      while (index < str.length) {
        if (str[index] === "*") {
          return true;
        }
        if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
          return true;
        }
        if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
          if (closeSquareIndex < index) {
            closeSquareIndex = str.indexOf("]", index);
          }
          if (closeSquareIndex > index) {
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
          }
        }
        if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
          closeCurlyIndex = str.indexOf("}", index);
          if (closeCurlyIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
              return true;
            }
          }
        }
        if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
          closeParenIndex = str.indexOf(")", index);
          if (closeParenIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
        if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
          if (pipeIndex < index) {
            pipeIndex = str.indexOf("|", index);
          }
          if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
            closeParenIndex = str.indexOf(")", pipeIndex);
            if (closeParenIndex > pipeIndex) {
              backSlashIndex = str.indexOf("\\", pipeIndex);
              if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
                return true;
              }
            }
          }
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    var relaxedCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      while (index < str.length) {
        if (/[*?{}()[\]]/.test(str[index])) {
          return true;
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    module2.exports = function isGlob(str, options) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      if (isExtglob(str)) {
        return true;
      }
      var check = strictCheck;
      if (options && options.strict === false) {
        check = relaxedCheck;
      }
      return check(str);
    };
  }
});

// ../../node_modules/glob-parent/index.js
var require_glob_parent = __commonJS({
  "../../node_modules/glob-parent/index.js"(exports2, module2) {
    "use strict";
    var isGlob = require_is_glob();
    var pathPosixDirname = require("path").posix.dirname;
    var isWin32 = require("os").platform() === "win32";
    var slash = "/";
    var backslash = /\\/g;
    var enclosure = /[\{\[].*[\}\]]$/;
    var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
    var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
    module2.exports = function globParent(str, opts) {
      var options = Object.assign({ flipBackslashes: true }, opts);
      if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
        str = str.replace(backslash, slash);
      }
      if (enclosure.test(str)) {
        str += slash;
      }
      str += "a";
      do {
        str = pathPosixDirname(str);
      } while (isGlob(str) || globby.test(str));
      return str.replace(escaped, "$1");
    };
  }
});

// ../../node_modules/braces/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/braces/lib/utils.js"(exports2) {
    "use strict";
    exports2.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports2.find = (node, type) => node.nodes.find((node2) => node2.type === type);
    exports2.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false) return false;
      if (!exports2.isInteger(min) || !exports2.isInteger(max)) return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };
    exports2.escapeNode = (block, n = 0, type) => {
      const node = block.nodes[n];
      if (!node) return;
      if (type && node.type === type || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports2.encloseBrace = (node) => {
      if (node.type !== "brace") return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isInvalidBrace = (block) => {
      if (block.type !== "brace") return false;
      if (block.invalid === true || block.dollar) return true;
      if (block.commas >> 0 + block.ranges >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text") acc.push(node.value);
      if (node.type === "range") node.type = "text";
      return acc;
    }, []);
    exports2.flatten = (...args2) => {
      const result = [];
      const flat = (arr) => {
        for (let i2 = 0; i2 < arr.length; i2++) {
          const ele = arr[i2];
          if (Array.isArray(ele)) {
            flat(ele);
            continue;
          }
          if (ele !== void 0) {
            result.push(ele);
          }
        }
        return result;
      };
      flat(args2);
      return result;
    };
  }
});

// ../../node_modules/braces/lib/stringify.js
var require_stringify = __commonJS({
  "../../node_modules/braces/lib/stringify.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    module2.exports = (ast, options = {}) => {
      const stringify = (node, parent = {}) => {
        const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        let output = "";
        if (node.value) {
          if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
            return "\\" + node.value;
          }
          return node.value;
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += stringify(child);
          }
        }
        return output;
      };
      return stringify(ast);
    };
  }
});

// ../../node_modules/is-number/index.js
var require_is_number = __commonJS({
  "../../node_modules/is-number/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(num) {
      if (typeof num === "number") {
        return num - num === 0;
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }
      return false;
    };
  }
});

// ../../node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS({
  "../../node_modules/to-regex-range/index.js"(exports2, module2) {
    "use strict";
    var isNumber = require_is_number();
    var toRegexRange = (min, max, options) => {
      if (isNumber(min) === false) {
        throw new TypeError("toRegexRange: expected the first argument to be a number");
      }
      if (max === void 0 || min === max) {
        return String(min);
      }
      if (isNumber(max) === false) {
        throw new TypeError("toRegexRange: expected the second argument to be a number.");
      }
      let opts = { relaxZeros: true, ...options };
      if (typeof opts.strictZeros === "boolean") {
        opts.relaxZeros = opts.strictZeros === false;
      }
      let relax = String(opts.relaxZeros);
      let shorthand = String(opts.shorthand);
      let capture = String(opts.capture);
      let wrap = String(opts.wrap);
      let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
      if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
        return toRegexRange.cache[cacheKey].result;
      }
      let a = Math.min(min, max);
      let b = Math.max(min, max);
      if (Math.abs(a - b) === 1) {
        let result = min + "|" + max;
        if (opts.capture) {
          return `(${result})`;
        }
        if (opts.wrap === false) {
          return result;
        }
        return `(?:${result})`;
      }
      let isPadded = hasPadding(min) || hasPadding(max);
      let state = { min, max, a, b };
      let positives = [];
      let negatives = [];
      if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
      }
      if (a < 0) {
        let newMin = b < 0 ? Math.abs(b) : 1;
        negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
        a = state.a = 0;
      }
      if (b >= 0) {
        positives = splitToPatterns(a, b, state, opts);
      }
      state.negatives = negatives;
      state.positives = positives;
      state.result = collatePatterns(negatives, positives, opts);
      if (opts.capture === true) {
        state.result = `(${state.result})`;
      } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
      }
      toRegexRange.cache[cacheKey] = state;
      return state.result;
    };
    function collatePatterns(neg, pos, options) {
      let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
      let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
      let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
      let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
      return subpatterns.join("|");
    }
    function splitToRanges(min, max) {
      let nines = 1;
      let zeros = 1;
      let stop2 = countNines(min, nines);
      let stops = /* @__PURE__ */ new Set([max]);
      while (min <= stop2 && stop2 <= max) {
        stops.add(stop2);
        nines += 1;
        stop2 = countNines(min, nines);
      }
      stop2 = countZeros(max + 1, zeros) - 1;
      while (min < stop2 && stop2 <= max) {
        stops.add(stop2);
        zeros += 1;
        stop2 = countZeros(max + 1, zeros) - 1;
      }
      stops = [...stops];
      stops.sort(compare);
      return stops;
    }
    function rangeToPattern(start2, stop2, options) {
      if (start2 === stop2) {
        return { pattern: start2, count: [], digits: 0 };
      }
      let zipped = zip(start2, stop2);
      let digits = zipped.length;
      let pattern = "";
      let count = 0;
      for (let i2 = 0; i2 < digits; i2++) {
        let [startDigit, stopDigit] = zipped[i2];
        if (startDigit === stopDigit) {
          pattern += startDigit;
        } else if (startDigit !== "0" || stopDigit !== "9") {
          pattern += toCharacterClass(startDigit, stopDigit, options);
        } else {
          count++;
        }
      }
      if (count) {
        pattern += options.shorthand === true ? "\\d" : "[0-9]";
      }
      return { pattern, count: [count], digits };
    }
    function splitToPatterns(min, max, tok, options) {
      let ranges = splitToRanges(min, max);
      let tokens = [];
      let start2 = min;
      let prev;
      for (let i2 = 0; i2 < ranges.length; i2++) {
        let max2 = ranges[i2];
        let obj = rangeToPattern(String(start2), String(max2), options);
        let zeros = "";
        if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
          if (prev.count.length > 1) {
            prev.count.pop();
          }
          prev.count.push(obj.count[0]);
          prev.string = prev.pattern + toQuantifier(prev.count);
          start2 = max2 + 1;
          continue;
        }
        if (tok.isPadded) {
          zeros = padZeros(max2, tok, options);
        }
        obj.string = zeros + obj.pattern + toQuantifier(obj.count);
        tokens.push(obj);
        start2 = max2 + 1;
        prev = obj;
      }
      return tokens;
    }
    function filterPatterns(arr, comparison, prefix, intersection, options) {
      let result = [];
      for (let ele of arr) {
        let { string } = ele;
        if (!intersection && !contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
        if (intersection && contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
      }
      return result;
    }
    function zip(a, b) {
      let arr = [];
      for (let i2 = 0; i2 < a.length; i2++) arr.push([a[i2], b[i2]]);
      return arr;
    }
    function compare(a, b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    function contains(arr, key, val) {
      return arr.some((ele) => ele[key] === val);
    }
    function countNines(min, len) {
      return Number(String(min).slice(0, -len) + "9".repeat(len));
    }
    function countZeros(integer, zeros) {
      return integer - integer % Math.pow(10, zeros);
    }
    function toQuantifier(digits) {
      let [start2 = 0, stop2 = ""] = digits;
      if (stop2 || start2 > 1) {
        return `{${start2 + (stop2 ? "," + stop2 : "")}}`;
      }
      return "";
    }
    function toCharacterClass(a, b, options) {
      return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
    }
    function hasPadding(str) {
      return /^-?(0+)\d/.test(str);
    }
    function padZeros(value, tok, options) {
      if (!tok.isPadded) {
        return value;
      }
      let diff2 = Math.abs(tok.maxLen - String(value).length);
      let relax = options.relaxZeros !== false;
      switch (diff2) {
        case 0:
          return "";
        case 1:
          return relax ? "0?" : "0";
        case 2:
          return relax ? "0{0,2}" : "00";
        default: {
          return relax ? `0{0,${diff2}}` : `0{${diff2}}`;
        }
      }
    }
    toRegexRange.cache = {};
    toRegexRange.clearCache = () => toRegexRange.cache = {};
    module2.exports = toRegexRange;
  }
});

// ../../node_modules/fill-range/index.js
var require_fill_range = __commonJS({
  "../../node_modules/fill-range/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var toRegexRange = require_to_regex_range();
    var isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    var transform = (toNumber) => {
      return (value) => toNumber === true ? Number(value) : String(value);
    };
    var isValidValue = (value) => {
      return typeof value === "number" || typeof value === "string" && value !== "";
    };
    var isNumber = (num) => Number.isInteger(+num);
    var zeros = (input) => {
      let value = `${input}`;
      let index = -1;
      if (value[0] === "-") value = value.slice(1);
      if (value === "0") return false;
      while (value[++index] === "0") ;
      return index > 0;
    };
    var stringify = (start2, end, options) => {
      if (typeof start2 === "string" || typeof end === "string") {
        return true;
      }
      return options.stringify === true;
    };
    var pad = (input, maxLength, toNumber) => {
      if (maxLength > 0) {
        let dash = input[0] === "-" ? "-" : "";
        if (dash) input = input.slice(1);
        input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
      }
      if (toNumber === false) {
        return String(input);
      }
      return input;
    };
    var toMaxLen = (input, maxLength) => {
      let negative = input[0] === "-" ? "-" : "";
      if (negative) {
        input = input.slice(1);
        maxLength--;
      }
      while (input.length < maxLength) input = "0" + input;
      return negative ? "-" + input : input;
    };
    var toSequence = (parts2, options, maxLen) => {
      parts2.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      parts2.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      let prefix = options.capture ? "" : "?:";
      let positives = "";
      let negatives = "";
      let result;
      if (parts2.positives.length) {
        positives = parts2.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
      }
      if (parts2.negatives.length) {
        negatives = `-(${prefix}${parts2.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
      }
      if (positives && negatives) {
        result = `${positives}|${negatives}`;
      } else {
        result = positives || negatives;
      }
      if (options.wrap) {
        return `(${prefix}${result})`;
      }
      return result;
    };
    var toRange = (a, b, isNumbers, options) => {
      if (isNumbers) {
        return toRegexRange(a, b, { wrap: false, ...options });
      }
      let start2 = String.fromCharCode(a);
      if (a === b) return start2;
      let stop2 = String.fromCharCode(b);
      return `[${start2}-${stop2}]`;
    };
    var toRegex = (start2, end, options) => {
      if (Array.isArray(start2)) {
        let wrap = options.wrap === true;
        let prefix = options.capture ? "" : "?:";
        return wrap ? `(${prefix}${start2.join("|")})` : start2.join("|");
      }
      return toRegexRange(start2, end, options);
    };
    var rangeError = (...args2) => {
      return new RangeError("Invalid range arguments: " + util.inspect(...args2));
    };
    var invalidRange = (start2, end, options) => {
      if (options.strictRanges === true) throw rangeError([start2, end]);
      return [];
    };
    var invalidStep = (step, options) => {
      if (options.strictRanges === true) {
        throw new TypeError(`Expected step "${step}" to be a number`);
      }
      return [];
    };
    var fillNumbers = (start2, end, step = 1, options = {}) => {
      let a = Number(start2);
      let b = Number(end);
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        if (options.strictRanges === true) throw rangeError([start2, end]);
        return [];
      }
      if (a === 0) a = 0;
      if (b === 0) b = 0;
      let descending = a > b;
      let startString = String(start2);
      let endString = String(end);
      let stepString = String(step);
      step = Math.max(Math.abs(step), 1);
      let padded = zeros(startString) || zeros(endString) || zeros(stepString);
      let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
      let toNumber = padded === false && stringify(start2, end, options) === false;
      let format = options.transform || transform(toNumber);
      if (options.toRegex && step === 1) {
        return toRange(toMaxLen(start2, maxLen), toMaxLen(end, maxLen), true, options);
      }
      let parts2 = { negatives: [], positives: [] };
      let push = (num) => parts2[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        if (options.toRegex === true && step > 1) {
          push(a);
        } else {
          range.push(pad(format(a, index), maxLen, toNumber));
        }
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return step > 1 ? toSequence(parts2, options, maxLen) : toRegex(range, null, { wrap: false, ...options });
      }
      return range;
    };
    var fillLetters = (start2, end, step = 1, options = {}) => {
      if (!isNumber(start2) && start2.length > 1 || !isNumber(end) && end.length > 1) {
        return invalidRange(start2, end, options);
      }
      let format = options.transform || ((val) => String.fromCharCode(val));
      let a = `${start2}`.charCodeAt(0);
      let b = `${end}`.charCodeAt(0);
      let descending = a > b;
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      if (options.toRegex && step === 1) {
        return toRange(min, max, false, options);
      }
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        range.push(format(a, index));
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return toRegex(range, null, { wrap: false, options });
      }
      return range;
    };
    var fill = (start2, end, step, options = {}) => {
      if (end == null && isValidValue(start2)) {
        return [start2];
      }
      if (!isValidValue(start2) || !isValidValue(end)) {
        return invalidRange(start2, end, options);
      }
      if (typeof step === "function") {
        return fill(start2, end, 1, { transform: step });
      }
      if (isObject(step)) {
        return fill(start2, end, 0, step);
      }
      let opts = { ...options };
      if (opts.capture === true) opts.wrap = true;
      step = step || opts.step || 1;
      if (!isNumber(step)) {
        if (step != null && !isObject(step)) return invalidStep(step, opts);
        return fill(start2, end, 1, step);
      }
      if (isNumber(start2) && isNumber(end)) {
        return fillNumbers(start2, end, step, opts);
      }
      return fillLetters(start2, end, Math.max(Math.abs(step), 1), opts);
    };
    module2.exports = fill;
  }
});

// ../../node_modules/braces/lib/compile.js
var require_compile = __commonJS({
  "../../node_modules/braces/lib/compile.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var utils = require_utils();
    var compile = (ast, options = {}) => {
      const walk = (node, parent = {}) => {
        const invalidBlock = utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        const invalid = invalidBlock === true || invalidNode === true;
        const prefix = options.escapeInvalid === true ? "\\" : "";
        let output = "";
        if (node.isOpen === true) {
          return prefix + node.value;
        }
        if (node.isClose === true) {
          console.log("node.isClose", prefix, node.value);
          return prefix + node.value;
        }
        if (node.type === "open") {
          return invalid ? prefix + node.value : "(";
        }
        if (node.type === "close") {
          return invalid ? prefix + node.value : ")";
        }
        if (node.type === "comma") {
          return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes && node.ranges > 0) {
          const args2 = utils.reduce(node.nodes);
          const range = fill(...args2, { ...options, wrap: false, toRegex: true, strictZeros: true });
          if (range.length !== 0) {
            return args2.length > 1 && range.length > 1 ? `(${range})` : range;
          }
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += walk(child, node);
          }
        }
        return output;
      };
      return walk(ast);
    };
    module2.exports = compile;
  }
});

// ../../node_modules/braces/lib/expand.js
var require_expand = __commonJS({
  "../../node_modules/braces/lib/expand.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var stringify = require_stringify();
    var utils = require_utils();
    var append = (queue = "", stash = "", enclose = false) => {
      const result = [];
      queue = [].concat(queue);
      stash = [].concat(stash);
      if (!stash.length) return queue;
      if (!queue.length) {
        return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
      }
      for (const item of queue) {
        if (Array.isArray(item)) {
          for (const value of item) {
            result.push(append(value, stash, enclose));
          }
        } else {
          for (let ele of stash) {
            if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
            result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
          }
        }
      }
      return utils.flatten(result);
    };
    var expand = (ast, options = {}) => {
      const rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
      const walk = (node, parent = {}) => {
        node.queue = [];
        let p = parent;
        let q = parent.queue;
        while (p.type !== "brace" && p.type !== "root" && p.parent) {
          p = p.parent;
          q = p.queue;
        }
        if (node.invalid || node.dollar) {
          q.push(append(q.pop(), stringify(node, options)));
          return;
        }
        if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
          q.push(append(q.pop(), ["{}"]));
          return;
        }
        if (node.nodes && node.ranges > 0) {
          const args2 = utils.reduce(node.nodes);
          if (utils.exceedsLimit(...args2, options.step, rangeLimit)) {
            throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
          }
          let range = fill(...args2, options);
          if (range.length === 0) {
            range = stringify(node, options);
          }
          q.push(append(q.pop(), range));
          node.nodes = [];
          return;
        }
        const enclose = utils.encloseBrace(node);
        let queue = node.queue;
        let block = node;
        while (block.type !== "brace" && block.type !== "root" && block.parent) {
          block = block.parent;
          queue = block.queue;
        }
        for (let i2 = 0; i2 < node.nodes.length; i2++) {
          const child = node.nodes[i2];
          if (child.type === "comma" && node.type === "brace") {
            if (i2 === 1) queue.push("");
            queue.push("");
            continue;
          }
          if (child.type === "close") {
            q.push(append(q.pop(), queue, enclose));
            continue;
          }
          if (child.value && child.type !== "open") {
            queue.push(append(queue.pop(), child.value));
            continue;
          }
          if (child.nodes) {
            walk(child, node);
          }
        }
        return queue;
      };
      return utils.flatten(walk(ast));
    };
    module2.exports = expand;
  }
});

// ../../node_modules/braces/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/braces/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      MAX_LENGTH: 1e4,
      // Digits
      CHAR_0: "0",
      /* 0 */
      CHAR_9: "9",
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: "A",
      /* A */
      CHAR_LOWERCASE_A: "a",
      /* a */
      CHAR_UPPERCASE_Z: "Z",
      /* Z */
      CHAR_LOWERCASE_Z: "z",
      /* z */
      CHAR_LEFT_PARENTHESES: "(",
      /* ( */
      CHAR_RIGHT_PARENTHESES: ")",
      /* ) */
      CHAR_ASTERISK: "*",
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: "&",
      /* & */
      CHAR_AT: "@",
      /* @ */
      CHAR_BACKSLASH: "\\",
      /* \ */
      CHAR_BACKTICK: "`",
      /* ` */
      CHAR_CARRIAGE_RETURN: "\r",
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: "^",
      /* ^ */
      CHAR_COLON: ":",
      /* : */
      CHAR_COMMA: ",",
      /* , */
      CHAR_DOLLAR: "$",
      /* . */
      CHAR_DOT: ".",
      /* . */
      CHAR_DOUBLE_QUOTE: '"',
      /* " */
      CHAR_EQUAL: "=",
      /* = */
      CHAR_EXCLAMATION_MARK: "!",
      /* ! */
      CHAR_FORM_FEED: "\f",
      /* \f */
      CHAR_FORWARD_SLASH: "/",
      /* / */
      CHAR_HASH: "#",
      /* # */
      CHAR_HYPHEN_MINUS: "-",
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: "<",
      /* < */
      CHAR_LEFT_CURLY_BRACE: "{",
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: "[",
      /* [ */
      CHAR_LINE_FEED: "\n",
      /* \n */
      CHAR_NO_BREAK_SPACE: "\xA0",
      /* \u00A0 */
      CHAR_PERCENT: "%",
      /* % */
      CHAR_PLUS: "+",
      /* + */
      CHAR_QUESTION_MARK: "?",
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: ">",
      /* > */
      CHAR_RIGHT_CURLY_BRACE: "}",
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: "]",
      /* ] */
      CHAR_SEMICOLON: ";",
      /* ; */
      CHAR_SINGLE_QUOTE: "'",
      /* ' */
      CHAR_SPACE: " ",
      /*   */
      CHAR_TAB: "	",
      /* \t */
      CHAR_UNDERSCORE: "_",
      /* _ */
      CHAR_VERTICAL_LINE: "|",
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
      /* \uFEFF */
    };
  }
});

// ../../node_modules/braces/lib/parse.js
var require_parse = __commonJS({
  "../../node_modules/braces/lib/parse.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var {
      MAX_LENGTH,
      CHAR_BACKSLASH,
      /* \ */
      CHAR_BACKTICK,
      /* ` */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_RIGHT_SQUARE_BRACKET,
      /* ] */
      CHAR_DOUBLE_QUOTE,
      /* " */
      CHAR_SINGLE_QUOTE,
      /* ' */
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE
    } = require_constants();
    var parse = (input, options = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      const opts = options || {};
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      if (input.length > max) {
        throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
      }
      const ast = { type: "root", input, nodes: [] };
      const stack = [ast];
      let block = ast;
      let prev = ast;
      let brackets = 0;
      const length = input.length;
      let index = 0;
      let depth = 0;
      let value;
      const advance = () => input[index++];
      const push = (node) => {
        if (node.type === "text" && prev.type === "dot") {
          prev.type = "text";
        }
        if (prev && prev.type === "text" && node.type === "text") {
          prev.value += node.value;
          return;
        }
        block.nodes.push(node);
        node.parent = block;
        node.prev = prev;
        prev = node;
        return node;
      };
      push({ type: "bos" });
      while (index < length) {
        block = stack[stack.length - 1];
        value = advance();
        if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
          continue;
        }
        if (value === CHAR_BACKSLASH) {
          push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
          continue;
        }
        if (value === CHAR_RIGHT_SQUARE_BRACKET) {
          push({ type: "text", value: "\\" + value });
          continue;
        }
        if (value === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          let next;
          while (index < length && (next = advance())) {
            value += next;
            if (next === CHAR_LEFT_SQUARE_BRACKET) {
              brackets++;
              continue;
            }
            if (next === CHAR_BACKSLASH) {
              value += advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              brackets--;
              if (brackets === 0) {
                break;
              }
            }
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_PARENTHESES) {
          block = push({ type: "paren", nodes: [] });
          stack.push(block);
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_RIGHT_PARENTHESES) {
          if (block.type !== "paren") {
            push({ type: "text", value });
            continue;
          }
          block = stack.pop();
          push({ type: "text", value });
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
          const open = value;
          let next;
          if (options.keepQuotes !== true) {
            value = "";
          }
          while (index < length && (next = advance())) {
            if (next === CHAR_BACKSLASH) {
              value += next + advance();
              continue;
            }
            if (next === open) {
              if (options.keepQuotes === true) value += next;
              break;
            }
            value += next;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_CURLY_BRACE) {
          depth++;
          const dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
          const brace = {
            type: "brace",
            open: true,
            close: false,
            dollar,
            depth,
            commas: 0,
            ranges: 0,
            nodes: []
          };
          block = push(brace);
          stack.push(block);
          push({ type: "open", value });
          continue;
        }
        if (value === CHAR_RIGHT_CURLY_BRACE) {
          if (block.type !== "brace") {
            push({ type: "text", value });
            continue;
          }
          const type = "close";
          block = stack.pop();
          block.close = true;
          push({ type, value });
          depth--;
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_COMMA && depth > 0) {
          if (block.ranges > 0) {
            block.ranges = 0;
            const open = block.nodes.shift();
            block.nodes = [open, { type: "text", value: stringify(block) }];
          }
          push({ type: "comma", value });
          block.commas++;
          continue;
        }
        if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
          const siblings = block.nodes;
          if (depth === 0 || siblings.length === 0) {
            push({ type: "text", value });
            continue;
          }
          if (prev.type === "dot") {
            block.range = [];
            prev.value += value;
            prev.type = "range";
            if (block.nodes.length !== 3 && block.nodes.length !== 5) {
              block.invalid = true;
              block.ranges = 0;
              prev.type = "text";
              continue;
            }
            block.ranges++;
            block.args = [];
            continue;
          }
          if (prev.type === "range") {
            siblings.pop();
            const before = siblings[siblings.length - 1];
            before.value += prev.value + value;
            prev = before;
            block.ranges--;
            continue;
          }
          push({ type: "dot", value });
          continue;
        }
        push({ type: "text", value });
      }
      do {
        block = stack.pop();
        if (block.type !== "root") {
          block.nodes.forEach((node) => {
            if (!node.nodes) {
              if (node.type === "open") node.isOpen = true;
              if (node.type === "close") node.isClose = true;
              if (!node.nodes) node.type = "text";
              node.invalid = true;
            }
          });
          const parent = stack[stack.length - 1];
          const index2 = parent.nodes.indexOf(block);
          parent.nodes.splice(index2, 1, ...block.nodes);
        }
      } while (stack.length > 0);
      push({ type: "eos" });
      return ast;
    };
    module2.exports = parse;
  }
});

// ../../node_modules/braces/index.js
var require_braces = __commonJS({
  "../../node_modules/braces/index.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var compile = require_compile();
    var expand = require_expand();
    var parse = require_parse();
    var braces = (input, options = {}) => {
      let output = [];
      if (Array.isArray(input)) {
        for (const pattern of input) {
          const result = braces.create(pattern, options);
          if (Array.isArray(result)) {
            output.push(...result);
          } else {
            output.push(result);
          }
        }
      } else {
        output = [].concat(braces.create(input, options));
      }
      if (options && options.expand === true && options.nodupes === true) {
        output = [...new Set(output)];
      }
      return output;
    };
    braces.parse = (input, options = {}) => parse(input, options);
    braces.stringify = (input, options = {}) => {
      if (typeof input === "string") {
        return stringify(braces.parse(input, options), options);
      }
      return stringify(input, options);
    };
    braces.compile = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      return compile(input, options);
    };
    braces.expand = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      let result = expand(input, options);
      if (options.noempty === true) {
        result = result.filter(Boolean);
      }
      if (options.nodupes === true) {
        result = [...new Set(result)];
      }
      return result;
    };
    braces.create = (input, options = {}) => {
      if (input === "" || input.length < 3) {
        return [input];
      }
      return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
    };
    module2.exports = braces;
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/lib/constants.js
var require_constants2 = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var path4 = require("path");
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      SEP: path4.sep,
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/lib/utils.js
var require_utils2 = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var path4 = require("path");
    var win32 = process.platform === "win32";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants2();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports2.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path4.sep === "\\";
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants2();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts2 = [];
      let str = input;
      let index = -1;
      let start2 = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start2 + 1) {
            start2 += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start2) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start2) {
          negated = token.negated = true;
          start2++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start2 > 0) {
        prefix = str.slice(0, start2);
        str = str.slice(start2);
        lastIndex -= start2;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start: start2,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start2;
          const i2 = slashes[idx];
          const value = input.slice(n, i2);
          if (opts.tokens) {
            if (idx === 0 && start2 !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts2.push(value);
          }
          prevIndex = i2;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts2.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts2;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/lib/parse.js
var require_parse2 = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants2();
    var utils = require_utils2();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args2, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args2, options);
      }
      args2.sort();
      const value = `[${args2.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args2.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts2 = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts2.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts2.push(value);
      return parts2;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i2 = 0; i2 < values.length; i2++) {
        for (let j = i2 + 1; j < values.length; j++) {
          const a = values[i2];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i2 = 1; i2 < pattern.length; i2++) {
        const ch = pattern[i2];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i2 !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i2),
              end: i2
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body2, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body2).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const win32 = utils.isWindows(options);
      const PLATFORM_CHARS = constants.globChars(win32);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.value += tok.value;
          prev.output = (prev.output || "") + tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body2 = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body2, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i2 = token.tokensIndex + 1; i2 < tokens.length; i2++) {
            tokens[i2].value = "";
            tokens[i2].output = "";
            delete tokens[i2].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix2 = POSIX_REGEX_SOURCE[rest2];
                if (posix2) {
                  prev.value = pre + posix2;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i2 = arr.length - 1; i2 >= 0; i2--) {
              tokens.pop();
              if (arr[i2].type === "brace") {
                break;
              }
              if (arr[i2].type !== "dots") {
                range.unshift(arr[i2].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out2 = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out2;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (next === "<" && !utils.supportsLookbehinds()) {
              throw new Error("Node.js v10 or higher is required for regex lookbehinds");
            }
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const win32 = utils.isWindows(options);
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(win32);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse;
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var path4 = require("path");
    var scan = require_scan();
    var parse = require_parse2();
    var utils = require_utils2();
    var constants = require_constants2();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix2 = utils.isWindows(options);
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix: posix2 });
        const result = { glob, state, regex, posix: posix2, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix: posix2 } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix2 ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix2);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options, posix2 = utils.isWindows(options)) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(path4.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err2) {
        if (options && options.debug === true) throw err2;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// ../../node_modules/micromatch/node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "../../node_modules/micromatch/node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_picomatch();
  }
});

// ../../node_modules/micromatch/index.js
var require_micromatch = __commonJS({
  "../../node_modules/micromatch/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var braces = require_braces();
    var picomatch = require_picomatch2();
    var utils = require_utils2();
    var isEmptyString = (v) => v === "" || v === "./";
    var hasBraces = (v) => {
      const index = v.indexOf("{");
      return index > -1 && v.indexOf("}", index) > -1;
    };
    var micromatch = (list, patterns, options) => {
      patterns = [].concat(patterns);
      list = [].concat(list);
      let omit = /* @__PURE__ */ new Set();
      let keep = /* @__PURE__ */ new Set();
      let items = /* @__PURE__ */ new Set();
      let negatives = 0;
      let onResult = (state) => {
        items.add(state.output);
        if (options && options.onResult) {
          options.onResult(state);
        }
      };
      for (let i2 = 0; i2 < patterns.length; i2++) {
        let isMatch = picomatch(String(patterns[i2]), { ...options, onResult }, true);
        let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
        if (negated) negatives++;
        for (let item of list) {
          let matched = isMatch(item, true);
          let match = negated ? !matched.isMatch : matched.isMatch;
          if (!match) continue;
          if (negated) {
            omit.add(matched.output);
          } else {
            omit.delete(matched.output);
            keep.add(matched.output);
          }
        }
      }
      let result = negatives === patterns.length ? [...items] : [...keep];
      let matches = result.filter((item) => !omit.has(item));
      if (options && matches.length === 0) {
        if (options.failglob === true) {
          throw new Error(`No matches found for "${patterns.join(", ")}"`);
        }
        if (options.nonull === true || options.nullglob === true) {
          return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
        }
      }
      return matches;
    };
    micromatch.match = micromatch;
    micromatch.matcher = (pattern, options) => picomatch(pattern, options);
    micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    micromatch.any = micromatch.isMatch;
    micromatch.not = (list, patterns, options = {}) => {
      patterns = [].concat(patterns).map(String);
      let result = /* @__PURE__ */ new Set();
      let items = [];
      let onResult = (state) => {
        if (options.onResult) options.onResult(state);
        items.push(state.output);
      };
      let matches = new Set(micromatch(list, patterns, { ...options, onResult }));
      for (let item of items) {
        if (!matches.has(item)) {
          result.add(item);
        }
      }
      return [...result];
    };
    micromatch.contains = (str, pattern, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      if (Array.isArray(pattern)) {
        return pattern.some((p) => micromatch.contains(str, p, options));
      }
      if (typeof pattern === "string") {
        if (isEmptyString(str) || isEmptyString(pattern)) {
          return false;
        }
        if (str.includes(pattern) || str.startsWith("./") && str.slice(2).includes(pattern)) {
          return true;
        }
      }
      return micromatch.isMatch(str, pattern, { ...options, contains: true });
    };
    micromatch.matchKeys = (obj, patterns, options) => {
      if (!utils.isObject(obj)) {
        throw new TypeError("Expected the first argument to be an object");
      }
      let keys = micromatch(Object.keys(obj), patterns, options);
      let res = {};
      for (let key of keys) res[key] = obj[key];
      return res;
    };
    micromatch.some = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (items.some((item) => isMatch(item))) {
          return true;
        }
      }
      return false;
    };
    micromatch.every = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (!items.every((item) => isMatch(item))) {
          return false;
        }
      }
      return true;
    };
    micromatch.all = (str, patterns, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      return [].concat(patterns).every((p) => picomatch(p, options)(str));
    };
    micromatch.capture = (glob, input, options) => {
      let posix2 = utils.isWindows(options);
      let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
      let match = regex.exec(posix2 ? utils.toPosixSlashes(input) : input);
      if (match) {
        return match.slice(1).map((v) => v === void 0 ? "" : v);
      }
    };
    micromatch.makeRe = (...args2) => picomatch.makeRe(...args2);
    micromatch.scan = (...args2) => picomatch.scan(...args2);
    micromatch.parse = (patterns, options) => {
      let res = [];
      for (let pattern of [].concat(patterns || [])) {
        for (let str of braces(String(pattern), options)) {
          res.push(picomatch.parse(str, options));
        }
      }
      return res;
    };
    micromatch.braces = (pattern, options) => {
      if (typeof pattern !== "string") throw new TypeError("Expected a string");
      if (options && options.nobrace === true || !hasBraces(pattern)) {
        return [pattern];
      }
      return braces(pattern, options);
    };
    micromatch.braceExpand = (pattern, options) => {
      if (typeof pattern !== "string") throw new TypeError("Expected a string");
      return micromatch.braces(pattern, { ...options, expand: true });
    };
    micromatch.hasBraces = hasBraces;
    module2.exports = micromatch;
  }
});

// ../../node_modules/fast-glob/out/utils/pattern.js
var require_pattern = __commonJS({
  "../../node_modules/fast-glob/out/utils/pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAbsolute = exports2.partitionAbsoluteAndRelative = exports2.removeDuplicateSlashes = exports2.matchAny = exports2.convertPatternsToRe = exports2.makeRe = exports2.getPatternParts = exports2.expandBraceExpansion = exports2.expandPatternsWithBraceExpansion = exports2.isAffectDepthOfReadingPattern = exports2.endsWithSlashGlobStar = exports2.hasGlobStar = exports2.getBaseDirectory = exports2.isPatternRelatedToParentDirectory = exports2.getPatternsOutsideCurrentDirectory = exports2.getPatternsInsideCurrentDirectory = exports2.getPositivePatterns = exports2.getNegativePatterns = exports2.isPositivePattern = exports2.isNegativePattern = exports2.convertToNegativePattern = exports2.convertToPositivePattern = exports2.isDynamicPattern = exports2.isStaticPattern = void 0;
    var path4 = require("path");
    var globParent = require_glob_parent();
    var micromatch = require_micromatch();
    var GLOBSTAR = "**";
    var ESCAPE_SYMBOL = "\\";
    var COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
    var REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
    var REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
    var GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
    var BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
    var DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
    function isStaticPattern(pattern, options = {}) {
      return !isDynamicPattern(pattern, options);
    }
    exports2.isStaticPattern = isStaticPattern;
    function isDynamicPattern(pattern, options = {}) {
      if (pattern === "") {
        return false;
      }
      if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
        return true;
      }
      if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
        return true;
      }
      return false;
    }
    exports2.isDynamicPattern = isDynamicPattern;
    function hasBraceExpansion(pattern) {
      const openingBraceIndex = pattern.indexOf("{");
      if (openingBraceIndex === -1) {
        return false;
      }
      const closingBraceIndex = pattern.indexOf("}", openingBraceIndex + 1);
      if (closingBraceIndex === -1) {
        return false;
      }
      const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
      return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
    }
    function convertToPositivePattern(pattern) {
      return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
    }
    exports2.convertToPositivePattern = convertToPositivePattern;
    function convertToNegativePattern(pattern) {
      return "!" + pattern;
    }
    exports2.convertToNegativePattern = convertToNegativePattern;
    function isNegativePattern(pattern) {
      return pattern.startsWith("!") && pattern[1] !== "(";
    }
    exports2.isNegativePattern = isNegativePattern;
    function isPositivePattern(pattern) {
      return !isNegativePattern(pattern);
    }
    exports2.isPositivePattern = isPositivePattern;
    function getNegativePatterns(patterns) {
      return patterns.filter(isNegativePattern);
    }
    exports2.getNegativePatterns = getNegativePatterns;
    function getPositivePatterns(patterns) {
      return patterns.filter(isPositivePattern);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getPatternsInsideCurrentDirectory(patterns) {
      return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
    }
    exports2.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
    function getPatternsOutsideCurrentDirectory(patterns) {
      return patterns.filter(isPatternRelatedToParentDirectory);
    }
    exports2.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
    function isPatternRelatedToParentDirectory(pattern) {
      return pattern.startsWith("..") || pattern.startsWith("./..");
    }
    exports2.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
    function getBaseDirectory(pattern) {
      return globParent(pattern, { flipBackslashes: false });
    }
    exports2.getBaseDirectory = getBaseDirectory;
    function hasGlobStar(pattern) {
      return pattern.includes(GLOBSTAR);
    }
    exports2.hasGlobStar = hasGlobStar;
    function endsWithSlashGlobStar(pattern) {
      return pattern.endsWith("/" + GLOBSTAR);
    }
    exports2.endsWithSlashGlobStar = endsWithSlashGlobStar;
    function isAffectDepthOfReadingPattern(pattern) {
      const basename3 = path4.basename(pattern);
      return endsWithSlashGlobStar(pattern) || isStaticPattern(basename3);
    }
    exports2.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
    function expandPatternsWithBraceExpansion(patterns) {
      return patterns.reduce((collection, pattern) => {
        return collection.concat(expandBraceExpansion(pattern));
      }, []);
    }
    exports2.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
    function expandBraceExpansion(pattern) {
      const patterns = micromatch.braces(pattern, { expand: true, nodupes: true, keepEscaping: true });
      patterns.sort((a, b) => a.length - b.length);
      return patterns.filter((pattern2) => pattern2 !== "");
    }
    exports2.expandBraceExpansion = expandBraceExpansion;
    function getPatternParts(pattern, options) {
      let { parts: parts2 } = micromatch.scan(pattern, Object.assign(Object.assign({}, options), { parts: true }));
      if (parts2.length === 0) {
        parts2 = [pattern];
      }
      if (parts2[0].startsWith("/")) {
        parts2[0] = parts2[0].slice(1);
        parts2.unshift("");
      }
      return parts2;
    }
    exports2.getPatternParts = getPatternParts;
    function makeRe(pattern, options) {
      return micromatch.makeRe(pattern, options);
    }
    exports2.makeRe = makeRe;
    function convertPatternsToRe(patterns, options) {
      return patterns.map((pattern) => makeRe(pattern, options));
    }
    exports2.convertPatternsToRe = convertPatternsToRe;
    function matchAny(entry, patternsRe) {
      return patternsRe.some((patternRe) => patternRe.test(entry));
    }
    exports2.matchAny = matchAny;
    function removeDuplicateSlashes(pattern) {
      return pattern.replace(DOUBLE_SLASH_RE, "/");
    }
    exports2.removeDuplicateSlashes = removeDuplicateSlashes;
    function partitionAbsoluteAndRelative(patterns) {
      const absolute = [];
      const relative = [];
      for (const pattern of patterns) {
        if (isAbsolute(pattern)) {
          absolute.push(pattern);
        } else {
          relative.push(pattern);
        }
      }
      return [absolute, relative];
    }
    exports2.partitionAbsoluteAndRelative = partitionAbsoluteAndRelative;
    function isAbsolute(pattern) {
      return path4.isAbsolute(pattern);
    }
    exports2.isAbsolute = isAbsolute;
  }
});

// ../../node_modules/merge2/index.js
var require_merge2 = __commonJS({
  "../../node_modules/merge2/index.js"(exports2, module2) {
    "use strict";
    var Stream = require("stream");
    var PassThrough = Stream.PassThrough;
    var slice = Array.prototype.slice;
    module2.exports = merge2;
    function merge2() {
      const streamsQueue = [];
      const args2 = slice.call(arguments);
      let merging = false;
      let options = args2[args2.length - 1];
      if (options && !Array.isArray(options) && options.pipe == null) {
        args2.pop();
      } else {
        options = {};
      }
      const doEnd = options.end !== false;
      const doPipeError = options.pipeError === true;
      if (options.objectMode == null) {
        options.objectMode = true;
      }
      if (options.highWaterMark == null) {
        options.highWaterMark = 64 * 1024;
      }
      const mergedStream = PassThrough(options);
      function addStream() {
        for (let i2 = 0, len = arguments.length; i2 < len; i2++) {
          streamsQueue.push(pauseStreams(arguments[i2], options));
        }
        mergeStream();
        return this;
      }
      function mergeStream() {
        if (merging) {
          return;
        }
        merging = true;
        let streams = streamsQueue.shift();
        if (!streams) {
          process.nextTick(endStream);
          return;
        }
        if (!Array.isArray(streams)) {
          streams = [streams];
        }
        let pipesCount = streams.length + 1;
        function next() {
          if (--pipesCount > 0) {
            return;
          }
          merging = false;
          mergeStream();
        }
        function pipe(stream) {
          function onend() {
            stream.removeListener("merge2UnpipeEnd", onend);
            stream.removeListener("end", onend);
            if (doPipeError) {
              stream.removeListener("error", onerror);
            }
            next();
          }
          function onerror(err2) {
            mergedStream.emit("error", err2);
          }
          if (stream._readableState.endEmitted) {
            return next();
          }
          stream.on("merge2UnpipeEnd", onend);
          stream.on("end", onend);
          if (doPipeError) {
            stream.on("error", onerror);
          }
          stream.pipe(mergedStream, { end: false });
          stream.resume();
        }
        for (let i2 = 0; i2 < streams.length; i2++) {
          pipe(streams[i2]);
        }
        next();
      }
      function endStream() {
        merging = false;
        mergedStream.emit("queueDrain");
        if (doEnd) {
          mergedStream.end();
        }
      }
      mergedStream.setMaxListeners(0);
      mergedStream.add = addStream;
      mergedStream.on("unpipe", function(stream) {
        stream.emit("merge2UnpipeEnd");
      });
      if (args2.length) {
        addStream.apply(null, args2);
      }
      return mergedStream;
    }
    function pauseStreams(streams, options) {
      if (!Array.isArray(streams)) {
        if (!streams._readableState && streams.pipe) {
          streams = streams.pipe(PassThrough(options));
        }
        if (!streams._readableState || !streams.pause || !streams.pipe) {
          throw new Error("Only readable stream can be merged.");
        }
        streams.pause();
      } else {
        for (let i2 = 0, len = streams.length; i2 < len; i2++) {
          streams[i2] = pauseStreams(streams[i2], options);
        }
      }
      return streams;
    }
  }
});

// ../../node_modules/fast-glob/out/utils/stream.js
var require_stream = __commonJS({
  "../../node_modules/fast-glob/out/utils/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.merge = void 0;
    var merge2 = require_merge2();
    function merge(streams) {
      const mergedStream = merge2(streams);
      streams.forEach((stream) => {
        stream.once("error", (error) => mergedStream.emit("error", error));
      });
      mergedStream.once("close", () => propagateCloseEventToSources(streams));
      mergedStream.once("end", () => propagateCloseEventToSources(streams));
      return mergedStream;
    }
    exports2.merge = merge;
    function propagateCloseEventToSources(streams) {
      streams.forEach((stream) => stream.emit("close"));
    }
  }
});

// ../../node_modules/fast-glob/out/utils/string.js
var require_string = __commonJS({
  "../../node_modules/fast-glob/out/utils/string.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEmpty = exports2.isString = void 0;
    function isString(input) {
      return typeof input === "string";
    }
    exports2.isString = isString;
    function isEmpty(input) {
      return input === "";
    }
    exports2.isEmpty = isEmpty;
  }
});

// ../../node_modules/fast-glob/out/utils/index.js
var require_utils3 = __commonJS({
  "../../node_modules/fast-glob/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.string = exports2.stream = exports2.pattern = exports2.path = exports2.fs = exports2.errno = exports2.array = void 0;
    var array = require_array();
    exports2.array = array;
    var errno = require_errno();
    exports2.errno = errno;
    var fs3 = require_fs();
    exports2.fs = fs3;
    var path4 = require_path();
    exports2.path = path4;
    var pattern = require_pattern();
    exports2.pattern = pattern;
    var stream = require_stream();
    exports2.stream = stream;
    var string = require_string();
    exports2.string = string;
  }
});

// ../../node_modules/fast-glob/out/managers/tasks.js
var require_tasks = __commonJS({
  "../../node_modules/fast-glob/out/managers/tasks.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPatternGroupToTask = exports2.convertPatternGroupsToTasks = exports2.groupPatternsByBaseDirectory = exports2.getNegativePatternsAsPositive = exports2.getPositivePatterns = exports2.convertPatternsToTasks = exports2.generate = void 0;
    var utils = require_utils3();
    function generate(input, settings) {
      const patterns = processPatterns(input, settings);
      const ignore = processPatterns(settings.ignore, settings);
      const positivePatterns = getPositivePatterns(patterns);
      const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);
      const staticPatterns = positivePatterns.filter((pattern) => utils.pattern.isStaticPattern(pattern, settings));
      const dynamicPatterns = positivePatterns.filter((pattern) => utils.pattern.isDynamicPattern(pattern, settings));
      const staticTasks = convertPatternsToTasks(
        staticPatterns,
        negativePatterns,
        /* dynamic */
        false
      );
      const dynamicTasks = convertPatternsToTasks(
        dynamicPatterns,
        negativePatterns,
        /* dynamic */
        true
      );
      return staticTasks.concat(dynamicTasks);
    }
    exports2.generate = generate;
    function processPatterns(input, settings) {
      let patterns = input;
      if (settings.braceExpansion) {
        patterns = utils.pattern.expandPatternsWithBraceExpansion(patterns);
      }
      if (settings.baseNameMatch) {
        patterns = patterns.map((pattern) => pattern.includes("/") ? pattern : `**/${pattern}`);
      }
      return patterns.map((pattern) => utils.pattern.removeDuplicateSlashes(pattern));
    }
    function convertPatternsToTasks(positive, negative, dynamic) {
      const tasks = [];
      const patternsOutsideCurrentDirectory = utils.pattern.getPatternsOutsideCurrentDirectory(positive);
      const patternsInsideCurrentDirectory = utils.pattern.getPatternsInsideCurrentDirectory(positive);
      const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
      const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
      tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
      if ("." in insideCurrentDirectoryGroup) {
        tasks.push(convertPatternGroupToTask(".", patternsInsideCurrentDirectory, negative, dynamic));
      } else {
        tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
      }
      return tasks;
    }
    exports2.convertPatternsToTasks = convertPatternsToTasks;
    function getPositivePatterns(patterns) {
      return utils.pattern.getPositivePatterns(patterns);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getNegativePatternsAsPositive(patterns, ignore) {
      const negative = utils.pattern.getNegativePatterns(patterns).concat(ignore);
      const positive = negative.map(utils.pattern.convertToPositivePattern);
      return positive;
    }
    exports2.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
    function groupPatternsByBaseDirectory(patterns) {
      const group = {};
      return patterns.reduce((collection, pattern) => {
        const base = utils.pattern.getBaseDirectory(pattern);
        if (base in collection) {
          collection[base].push(pattern);
        } else {
          collection[base] = [pattern];
        }
        return collection;
      }, group);
    }
    exports2.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
    function convertPatternGroupsToTasks(positive, negative, dynamic) {
      return Object.keys(positive).map((base) => {
        return convertPatternGroupToTask(base, positive[base], negative, dynamic);
      });
    }
    exports2.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
    function convertPatternGroupToTask(base, positive, negative, dynamic) {
      return {
        dynamic,
        positive,
        negative,
        base,
        patterns: [].concat(positive, negative.map(utils.pattern.convertToNegativePattern))
      };
    }
    exports2.convertPatternGroupToTask = convertPatternGroupToTask;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/providers/async.js
var require_async = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read2(path4, settings, callback) {
      settings.fs.lstat(path4, (lstatError, lstat) => {
        if (lstatError !== null) {
          callFailureCallback(callback, lstatError);
          return;
        }
        if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
          callSuccessCallback(callback, lstat);
          return;
        }
        settings.fs.stat(path4, (statError, stat) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              callFailureCallback(callback, statError);
              return;
            }
            callSuccessCallback(callback, lstat);
            return;
          }
          if (settings.markSymbolicLink) {
            stat.isSymbolicLink = () => true;
          }
          callSuccessCallback(callback, stat);
        });
      });
    }
    exports2.read = read2;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// ../../node_modules/@nodelib/fs.stat/out/providers/sync.js
var require_sync = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read2(path4, settings) {
      const lstat = settings.fs.lstatSync(path4);
      if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        return lstat;
      }
      try {
        const stat = settings.fs.statSync(path4);
        if (settings.markSymbolicLink) {
          stat.isSymbolicLink = () => true;
        }
        return stat;
      } catch (error) {
        if (!settings.throwErrorOnBrokenSymbolicLink) {
          return lstat;
        }
        throw error;
      }
    }
    exports2.read = read2;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/adapters/fs.js
var require_fs2 = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      stat: fs3.stat,
      lstatSync: fs3.lstatSync,
      statSync: fs3.statSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/settings.js
var require_settings = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fs3 = require_fs2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
        this.fs = fs3.createFileSystemAdapter(this._options.fs);
        this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/index.js
var require_out = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.statSync = exports2.stat = exports2.Settings = void 0;
    var async = require_async();
    var sync = require_sync();
    var settings_1 = require_settings();
    exports2.Settings = settings_1.default;
    function stat(path4, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path4, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path4, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.stat = stat;
    function statSync(path4, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path4, settings);
    }
    exports2.statSync = statSync;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/queue-microtask/index.js
var require_queue_microtask = __commonJS({
  "../../node_modules/queue-microtask/index.js"(exports2, module2) {
    var promise;
    module2.exports = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : global) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err2) => setTimeout(() => {
      throw err2;
    }, 0));
  }
});

// ../../node_modules/run-parallel/index.js
var require_run_parallel = __commonJS({
  "../../node_modules/run-parallel/index.js"(exports2, module2) {
    module2.exports = runParallel;
    var queueMicrotask2 = require_queue_microtask();
    function runParallel(tasks, cb) {
      let results, pending, keys;
      let isSync = true;
      if (Array.isArray(tasks)) {
        results = [];
        pending = tasks.length;
      } else {
        keys = Object.keys(tasks);
        results = {};
        pending = keys.length;
      }
      function done(err2) {
        function end() {
          if (cb) cb(err2, results);
          cb = null;
        }
        if (isSync) queueMicrotask2(end);
        else end();
      }
      function each(i2, err2, result) {
        results[i2] = result;
        if (--pending === 0 || err2) {
          done(err2);
        }
      }
      if (!pending) {
        done(null);
      } else if (keys) {
        keys.forEach(function(key) {
          tasks[key](function(err2, result) {
            each(key, err2, result);
          });
        });
      } else {
        tasks.forEach(function(task, i2) {
          task(function(err2, result) {
            each(i2, err2, result);
          });
        });
      }
      isSync = false;
    }
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/constants.js
var require_constants3 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
    var NODE_PROCESS_VERSION_PARTS = process.versions.node.split(".");
    if (NODE_PROCESS_VERSION_PARTS[0] === void 0 || NODE_PROCESS_VERSION_PARTS[1] === void 0) {
      throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
    }
    var MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
    var MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
    var SUPPORTED_MAJOR_VERSION = 10;
    var SUPPORTED_MINOR_VERSION = 10;
    var IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
    var IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/utils/fs.js
var require_fs3 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name2, stats) {
        this.name = name2;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name2, stats) {
      return new DirentFromStats(name2, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/utils/index.js
var require_utils4 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fs = void 0;
    var fs3 = require_fs3();
    exports2.fs = fs3;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/common.js
var require_common = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = void 0;
    function joinPathSegments(a, b, separator) {
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/async.js
var require_async2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var rpl = require_run_parallel();
    var constants_1 = require_constants3();
    var utils = require_utils4();
    var common = require_common();
    function read2(directory, settings, callback) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        readdirWithFileTypes(directory, settings, callback);
        return;
      }
      readdir(directory, settings, callback);
    }
    exports2.read = read2;
    function readdirWithFileTypes(directory, settings, callback) {
      settings.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const entries = dirents.map((dirent) => ({
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        }));
        if (!settings.followSymbolicLinks) {
          callSuccessCallback(callback, entries);
          return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, rplEntries);
        });
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function makeRplTaskEntry(entry, settings) {
      return (done) => {
        if (!entry.dirent.isSymbolicLink()) {
          done(null, entry);
          return;
        }
        settings.fs.stat(entry.path, (statError, stats) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              done(statError);
              return;
            }
            done(null, entry);
            return;
          }
          entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          done(null, entry);
        });
      };
    }
    function readdir(directory, settings, callback) {
      settings.fs.readdir(directory, (readdirError, names) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const tasks = names.map((name2) => {
          const path4 = common.joinPathSegments(directory, name2, settings.pathSegmentSeparator);
          return (done) => {
            fsStat.stat(path4, settings.fsStatSettings, (error, stats) => {
              if (error !== null) {
                done(error);
                return;
              }
              const entry = {
                name: name2,
                path: path4,
                dirent: utils.fs.createDirentFromStats(name2, stats)
              };
              if (settings.stats) {
                entry.stats = stats;
              }
              done(null, entry);
            });
          };
        });
        rpl(tasks, (rplError, entries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, entries);
        });
      });
    }
    exports2.readdir = readdir;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/sync.js
var require_sync2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var constants_1 = require_constants3();
    var utils = require_utils4();
    var common = require_common();
    function read2(directory, settings) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        return readdirWithFileTypes(directory, settings);
      }
      return readdir(directory, settings);
    }
    exports2.read = read2;
    function readdirWithFileTypes(directory, settings) {
      const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
      return dirents.map((dirent) => {
        const entry = {
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        };
        if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
          try {
            const stats = settings.fs.statSync(entry.path);
            entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          } catch (error) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              throw error;
            }
          }
        }
        return entry;
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function readdir(directory, settings) {
      const names = settings.fs.readdirSync(directory);
      return names.map((name2) => {
        const entryPath = common.joinPathSegments(directory, name2, settings.pathSegmentSeparator);
        const stats = fsStat.statSync(entryPath, settings.fsStatSettings);
        const entry = {
          name: name2,
          path: entryPath,
          dirent: utils.fs.createDirentFromStats(name2, stats)
        };
        if (settings.stats) {
          entry.stats = stats;
        }
        return entry;
      });
    }
    exports2.readdir = readdir;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/adapters/fs.js
var require_fs4 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      stat: fs3.stat,
      lstatSync: fs3.lstatSync,
      statSync: fs3.statSync,
      readdir: fs3.readdir,
      readdirSync: fs3.readdirSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/settings.js
var require_settings2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsStat = require_out();
    var fs3 = require_fs4();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
        this.fs = fs3.createFileSystemAdapter(this._options.fs);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path4.sep);
        this.stats = this._getValue(this._options.stats, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
        this.fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this.followSymbolicLinks,
          fs: this.fs,
          throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/index.js
var require_out2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.scandirSync = exports2.scandir = void 0;
    var async = require_async2();
    var sync = require_sync2();
    var settings_1 = require_settings2();
    exports2.Settings = settings_1.default;
    function scandir(path4, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path4, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path4, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.scandir = scandir;
    function scandirSync(path4, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path4, settings);
    }
    exports2.scandirSync = scandirSync;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/reusify/reusify.js
var require_reusify = __commonJS({
  "../../node_modules/reusify/reusify.js"(exports2, module2) {
    "use strict";
    function reusify(Constructor) {
      var head = new Constructor();
      var tail = head;
      function get() {
        var current = head;
        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }
        current.next = null;
        return current;
      }
      function release(obj) {
        tail.next = obj;
        tail = obj;
      }
      return {
        get,
        release
      };
    }
    module2.exports = reusify;
  }
});

// ../../node_modules/fastq/queue.js
var require_queue = __commonJS({
  "../../node_modules/fastq/queue.js"(exports2, module2) {
    "use strict";
    var reusify = require_reusify();
    function fastqueue(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      if (!(_concurrency >= 1)) {
        throw new Error("fastqueue concurrency must be equal to or greater than 1");
      }
      var cache = reusify(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;
      var errorHandler = null;
      var self2 = {
        push,
        drain: noop,
        saturated: noop,
        pause,
        paused: false,
        get concurrency() {
          return _concurrency;
        },
        set concurrency(value) {
          if (!(value >= 1)) {
            throw new Error("fastqueue concurrency must be equal to or greater than 1");
          }
          _concurrency = value;
          if (self2.paused) return;
          for (; queueHead && _running < _concurrency; ) {
            _running++;
            release();
          }
        },
        running,
        resume,
        idle,
        length,
        getQueue,
        unshift,
        empty: noop,
        kill,
        killAndDrain,
        error,
        abort: abort2
      };
      return self2;
      function running() {
        return _running;
      }
      function pause() {
        self2.paused = true;
      }
      function length() {
        var current = queueHead;
        var counter = 0;
        while (current) {
          current = current.next;
          counter++;
        }
        return counter;
      }
      function getQueue() {
        var current = queueHead;
        var tasks = [];
        while (current) {
          tasks.push(current.value);
          current = current.next;
        }
        return tasks;
      }
      function resume() {
        if (!self2.paused) return;
        self2.paused = false;
        if (queueHead === null) {
          _running++;
          release();
          return;
        }
        for (; queueHead && _running < _concurrency; ) {
          _running++;
          release();
        }
      }
      function idle() {
        return _running === 0 && self2.length() === 0;
      }
      function push(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self2.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self2.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function unshift(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self2.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self2.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function release(holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next && _running <= _concurrency) {
          if (!self2.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self2.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self2.drain();
        }
      }
      function kill() {
        queueHead = null;
        queueTail = null;
        self2.drain = noop;
      }
      function killAndDrain() {
        queueHead = null;
        queueTail = null;
        self2.drain();
        self2.drain = noop;
      }
      function abort2() {
        var current = queueHead;
        queueHead = null;
        queueTail = null;
        while (current) {
          var next = current.next;
          var callback = current.callback;
          var errorHandler2 = current.errorHandler;
          var val = current.value;
          var context2 = current.context;
          current.value = null;
          current.callback = noop;
          current.errorHandler = null;
          if (errorHandler2) {
            errorHandler2(new Error("abort"), val);
          }
          callback.call(context2, new Error("abort"));
          current.release(current);
          current = next;
        }
        self2.drain = noop;
      }
      function error(handler) {
        errorHandler = handler;
      }
    }
    function noop() {
    }
    function Task() {
      this.value = null;
      this.callback = noop;
      this.next = null;
      this.release = noop;
      this.context = null;
      this.errorHandler = null;
      var self2 = this;
      this.worked = function worked(err2, result) {
        var callback = self2.callback;
        var errorHandler = self2.errorHandler;
        var val = self2.value;
        self2.value = null;
        self2.callback = noop;
        if (self2.errorHandler) {
          errorHandler(err2, val);
        }
        callback.call(self2.context, err2, result);
        self2.release(self2);
      };
    }
    function queueAsPromised(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      function asyncWrapper(arg, cb) {
        worker.call(this, arg).then(function(res) {
          cb(null, res);
        }, cb);
      }
      var queue = fastqueue(context, asyncWrapper, _concurrency);
      var pushCb = queue.push;
      var unshiftCb = queue.unshift;
      queue.push = push;
      queue.unshift = unshift;
      queue.drained = drained;
      return queue;
      function push(value) {
        var p = new Promise(function(resolve, reject) {
          pushCb(value, function(err2, result) {
            if (err2) {
              reject(err2);
              return;
            }
            resolve(result);
          });
        });
        p.catch(noop);
        return p;
      }
      function unshift(value) {
        var p = new Promise(function(resolve, reject) {
          unshiftCb(value, function(err2, result) {
            if (err2) {
              reject(err2);
              return;
            }
            resolve(result);
          });
        });
        p.catch(noop);
        return p;
      }
      function drained() {
        var p = new Promise(function(resolve) {
          process.nextTick(function() {
            if (queue.idle()) {
              resolve();
            } else {
              var previousDrain = queue.drain;
              queue.drain = function() {
                if (typeof previousDrain === "function") previousDrain();
                resolve();
                queue.drain = previousDrain;
              };
            }
          });
        });
        return p;
      }
    }
    module2.exports = fastqueue;
    module2.exports.promise = queueAsPromised;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/common.js
var require_common2 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = exports2.replacePathSegmentSeparator = exports2.isAppliedFilter = exports2.isFatalError = void 0;
    function isFatalError(settings, error) {
      if (settings.errorFilter === null) {
        return true;
      }
      return !settings.errorFilter(error);
    }
    exports2.isFatalError = isFatalError;
    function isAppliedFilter(filter, value) {
      return filter === null || filter(value);
    }
    exports2.isAppliedFilter = isAppliedFilter;
    function replacePathSegmentSeparator(filepath, separator) {
      return filepath.split(/[/\\]/).join(separator);
    }
    exports2.replacePathSegmentSeparator = replacePathSegmentSeparator;
    function joinPathSegments(a, b, separator) {
      if (a === "") {
        return b;
      }
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/reader.js
var require_reader = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common = require_common2();
    var Reader = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._root = common.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
      }
    };
    exports2.default = Reader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/async.js
var require_async3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var events_1 = require("events");
    var fsScandir = require_out2();
    var fastq = require_queue();
    var common = require_common2();
    var reader_1 = require_reader();
    var AsyncReader = class extends reader_1.default {
      constructor(_root, _settings) {
        super(_root, _settings);
        this._settings = _settings;
        this._scandir = fsScandir.scandir;
        this._emitter = new events_1.EventEmitter();
        this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
        this._isFatalError = false;
        this._isDestroyed = false;
        this._queue.drain = () => {
          if (!this._isFatalError) {
            this._emitter.emit("end");
          }
        };
      }
      read() {
        this._isFatalError = false;
        this._isDestroyed = false;
        setImmediate(() => {
          this._pushToQueue(this._root, this._settings.basePath);
        });
        return this._emitter;
      }
      get isDestroyed() {
        return this._isDestroyed;
      }
      destroy() {
        if (this._isDestroyed) {
          throw new Error("The reader is already destroyed");
        }
        this._isDestroyed = true;
        this._queue.killAndDrain();
      }
      onEntry(callback) {
        this._emitter.on("entry", callback);
      }
      onError(callback) {
        this._emitter.once("error", callback);
      }
      onEnd(callback) {
        this._emitter.once("end", callback);
      }
      _pushToQueue(directory, base) {
        const queueItem = { directory, base };
        this._queue.push(queueItem, (error) => {
          if (error !== null) {
            this._handleError(error);
          }
        });
      }
      _worker(item, done) {
        this._scandir(item.directory, this._settings.fsScandirSettings, (error, entries) => {
          if (error !== null) {
            done(error, void 0);
            return;
          }
          for (const entry of entries) {
            this._handleEntry(entry, item.base);
          }
          done(null, void 0);
        });
      }
      _handleError(error) {
        if (this._isDestroyed || !common.isFatalError(this._settings, error)) {
          return;
        }
        this._isFatalError = true;
        this._isDestroyed = true;
        this._emitter.emit("error", error);
      }
      _handleEntry(entry, base) {
        if (this._isDestroyed || this._isFatalError) {
          return;
        }
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._emitEntry(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _emitEntry(entry) {
        this._emitter.emit("entry", entry);
      }
    };
    exports2.default = AsyncReader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/async.js
var require_async4 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async3();
    var AsyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._storage = [];
      }
      read(callback) {
        this._reader.onError((error) => {
          callFailureCallback(callback, error);
        });
        this._reader.onEntry((entry) => {
          this._storage.push(entry);
        });
        this._reader.onEnd(() => {
          callSuccessCallback(callback, this._storage);
        });
        this._reader.read();
      }
    };
    exports2.default = AsyncProvider;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, entries) {
      callback(null, entries);
    }
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/stream.js
var require_stream2 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var async_1 = require_async3();
    var StreamProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._stream = new stream_1.Readable({
          objectMode: true,
          read: () => {
          },
          destroy: () => {
            if (!this._reader.isDestroyed) {
              this._reader.destroy();
            }
          }
        });
      }
      read() {
        this._reader.onError((error) => {
          this._stream.emit("error", error);
        });
        this._reader.onEntry((entry) => {
          this._stream.push(entry);
        });
        this._reader.onEnd(() => {
          this._stream.push(null);
        });
        this._reader.read();
        return this._stream;
      }
    };
    exports2.default = StreamProvider;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/sync.js
var require_sync3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsScandir = require_out2();
    var common = require_common2();
    var reader_1 = require_reader();
    var SyncReader = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._scandir = fsScandir.scandirSync;
        this._storage = [];
        this._queue = /* @__PURE__ */ new Set();
      }
      read() {
        this._pushToQueue(this._root, this._settings.basePath);
        this._handleQueue();
        return this._storage;
      }
      _pushToQueue(directory, base) {
        this._queue.add({ directory, base });
      }
      _handleQueue() {
        for (const item of this._queue.values()) {
          this._handleDirectory(item.directory, item.base);
        }
      }
      _handleDirectory(directory, base) {
        try {
          const entries = this._scandir(directory, this._settings.fsScandirSettings);
          for (const entry of entries) {
            this._handleEntry(entry, base);
          }
        } catch (error) {
          this._handleError(error);
        }
      }
      _handleError(error) {
        if (!common.isFatalError(this._settings, error)) {
          return;
        }
        throw error;
      }
      _handleEntry(entry, base) {
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._pushToStorage(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _pushToStorage(entry) {
        this._storage.push(entry);
      }
    };
    exports2.default = SyncReader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/sync.js
var require_sync4 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync3();
    var SyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new sync_1.default(this._root, this._settings);
      }
      read() {
        return this._reader.read();
      }
    };
    exports2.default = SyncProvider;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/settings.js
var require_settings3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsScandir = require_out2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.basePath = this._getValue(this._options.basePath, void 0);
        this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
        this.deepFilter = this._getValue(this._options.deepFilter, null);
        this.entryFilter = this._getValue(this._options.entryFilter, null);
        this.errorFilter = this._getValue(this._options.errorFilter, null);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path4.sep);
        this.fsScandirSettings = new fsScandir.Settings({
          followSymbolicLinks: this._options.followSymbolicLinks,
          fs: this._options.fs,
          pathSegmentSeparator: this._options.pathSegmentSeparator,
          stats: this._options.stats,
          throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/index.js
var require_out3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.walkStream = exports2.walkSync = exports2.walk = void 0;
    var async_1 = require_async4();
    var stream_1 = require_stream2();
    var sync_1 = require_sync4();
    var settings_1 = require_settings3();
    exports2.Settings = settings_1.default;
    function walk(directory, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        new async_1.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
        return;
      }
      new async_1.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
    }
    exports2.walk = walk;
    function walkSync(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new sync_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkSync = walkSync;
    function walkStream(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new stream_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkStream = walkStream;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/fast-glob/out/readers/reader.js
var require_reader2 = __commonJS({
  "../../node_modules/fast-glob/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsStat = require_out();
    var utils = require_utils3();
    var Reader = class {
      constructor(_settings) {
        this._settings = _settings;
        this._fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
        });
      }
      _getFullEntryPath(filepath) {
        return path4.resolve(this._settings.cwd, filepath);
      }
      _makeEntry(stats, pattern) {
        const entry = {
          name: pattern,
          path: pattern,
          dirent: utils.fs.createDirentFromStats(pattern, stats)
        };
        if (this._settings.stats) {
          entry.stats = stats;
        }
        return entry;
      }
      _isFatalError(error) {
        return !utils.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
      }
    };
    exports2.default = Reader;
  }
});

// ../../node_modules/fast-glob/out/readers/stream.js
var require_stream3 = __commonJS({
  "../../node_modules/fast-glob/out/readers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderStream = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkStream = fsWalk.walkStream;
        this._stat = fsStat.stat;
      }
      dynamic(root, options) {
        return this._walkStream(root, options);
      }
      static(patterns, options) {
        const filepaths = patterns.map(this._getFullEntryPath, this);
        const stream = new stream_1.PassThrough({ objectMode: true });
        stream._write = (index, _enc, done) => {
          return this._getEntry(filepaths[index], patterns[index], options).then((entry) => {
            if (entry !== null && options.entryFilter(entry)) {
              stream.push(entry);
            }
            if (index === filepaths.length - 1) {
              stream.end();
            }
            done();
          }).catch(done);
        };
        for (let i2 = 0; i2 < filepaths.length; i2++) {
          stream.write(i2);
        }
        return stream;
      }
      _getEntry(filepath, pattern, options) {
        return this._getStat(filepath).then((stats) => this._makeEntry(stats, pattern)).catch((error) => {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        });
      }
      _getStat(filepath) {
        return new Promise((resolve, reject) => {
          this._stat(filepath, this._fsStatSettings, (error, stats) => {
            return error === null ? resolve(stats) : reject(error);
          });
        });
      }
    };
    exports2.default = ReaderStream;
  }
});

// ../../node_modules/fast-glob/out/readers/async.js
var require_async5 = __commonJS({
  "../../node_modules/fast-glob/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var stream_1 = require_stream3();
    var ReaderAsync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkAsync = fsWalk.walk;
        this._readerStream = new stream_1.default(this._settings);
      }
      dynamic(root, options) {
        return new Promise((resolve, reject) => {
          this._walkAsync(root, options, (error, entries) => {
            if (error === null) {
              resolve(entries);
            } else {
              reject(error);
            }
          });
        });
      }
      async static(patterns, options) {
        const entries = [];
        const stream = this._readerStream.static(patterns, options);
        return new Promise((resolve, reject) => {
          stream.once("error", reject);
          stream.on("data", (entry) => entries.push(entry));
          stream.once("end", () => resolve(entries));
        });
      }
    };
    exports2.default = ReaderAsync;
  }
});

// ../../node_modules/fast-glob/out/providers/matchers/matcher.js
var require_matcher = __commonJS({
  "../../node_modules/fast-glob/out/providers/matchers/matcher.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var Matcher = class {
      constructor(_patterns, _settings, _micromatchOptions) {
        this._patterns = _patterns;
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this._storage = [];
        this._fillStorage();
      }
      _fillStorage() {
        for (const pattern of this._patterns) {
          const segments = this._getPatternSegments(pattern);
          const sections = this._splitSegmentsIntoSections(segments);
          this._storage.push({
            complete: sections.length <= 1,
            pattern,
            segments,
            sections
          });
        }
      }
      _getPatternSegments(pattern) {
        const parts2 = utils.pattern.getPatternParts(pattern, this._micromatchOptions);
        return parts2.map((part) => {
          const dynamic = utils.pattern.isDynamicPattern(part, this._settings);
          if (!dynamic) {
            return {
              dynamic: false,
              pattern: part
            };
          }
          return {
            dynamic: true,
            pattern: part,
            patternRe: utils.pattern.makeRe(part, this._micromatchOptions)
          };
        });
      }
      _splitSegmentsIntoSections(segments) {
        return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
      }
    };
    exports2.default = Matcher;
  }
});

// ../../node_modules/fast-glob/out/providers/matchers/partial.js
var require_partial = __commonJS({
  "../../node_modules/fast-glob/out/providers/matchers/partial.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var matcher_1 = require_matcher();
    var PartialMatcher = class extends matcher_1.default {
      match(filepath) {
        const parts2 = filepath.split("/");
        const levels = parts2.length;
        const patterns = this._storage.filter((info2) => !info2.complete || info2.segments.length > levels);
        for (const pattern of patterns) {
          const section = pattern.sections[0];
          if (!pattern.complete && levels > section.length) {
            return true;
          }
          const match = parts2.every((part, index) => {
            const segment = pattern.segments[index];
            if (segment.dynamic && segment.patternRe.test(part)) {
              return true;
            }
            if (!segment.dynamic && segment.pattern === part) {
              return true;
            }
            return false;
          });
          if (match) {
            return true;
          }
        }
        return false;
      }
    };
    exports2.default = PartialMatcher;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/deep.js
var require_deep = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/deep.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var partial_1 = require_partial();
    var DeepFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
      }
      getFilter(basePath, positive, negative) {
        const matcher = this._getMatcher(positive);
        const negativeRe = this._getNegativePatternsRe(negative);
        return (entry) => this._filter(basePath, entry, matcher, negativeRe);
      }
      _getMatcher(patterns) {
        return new partial_1.default(patterns, this._settings, this._micromatchOptions);
      }
      _getNegativePatternsRe(patterns) {
        const affectDepthOfReadingPatterns = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);
        return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
      }
      _filter(basePath, entry, matcher, negativeRe) {
        if (this._isSkippedByDeep(basePath, entry.path)) {
          return false;
        }
        if (this._isSkippedSymbolicLink(entry)) {
          return false;
        }
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._isSkippedByPositivePatterns(filepath, matcher)) {
          return false;
        }
        return this._isSkippedByNegativePatterns(filepath, negativeRe);
      }
      _isSkippedByDeep(basePath, entryPath) {
        if (this._settings.deep === Infinity) {
          return false;
        }
        return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
      }
      _getEntryLevel(basePath, entryPath) {
        const entryPathDepth = entryPath.split("/").length;
        if (basePath === "") {
          return entryPathDepth;
        }
        const basePathDepth = basePath.split("/").length;
        return entryPathDepth - basePathDepth;
      }
      _isSkippedSymbolicLink(entry) {
        return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
      }
      _isSkippedByPositivePatterns(entryPath, matcher) {
        return !this._settings.baseNameMatch && !matcher.match(entryPath);
      }
      _isSkippedByNegativePatterns(entryPath, patternsRe) {
        return !utils.pattern.matchAny(entryPath, patternsRe);
      }
    };
    exports2.default = DeepFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/entry.js
var require_entry = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var EntryFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this.index = /* @__PURE__ */ new Map();
      }
      getFilter(positive, negative) {
        const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);
        const patterns = {
          positive: {
            all: utils.pattern.convertPatternsToRe(positive, this._micromatchOptions)
          },
          negative: {
            absolute: utils.pattern.convertPatternsToRe(absoluteNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true })),
            relative: utils.pattern.convertPatternsToRe(relativeNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true }))
          }
        };
        return (entry) => this._filter(entry, patterns);
      }
      _filter(entry, patterns) {
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._settings.unique && this._isDuplicateEntry(filepath)) {
          return false;
        }
        if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
          return false;
        }
        const isMatched = this._isMatchToPatternsSet(filepath, patterns, entry.dirent.isDirectory());
        if (this._settings.unique && isMatched) {
          this._createIndexRecord(filepath);
        }
        return isMatched;
      }
      _isDuplicateEntry(filepath) {
        return this.index.has(filepath);
      }
      _createIndexRecord(filepath) {
        this.index.set(filepath, void 0);
      }
      _onlyFileFilter(entry) {
        return this._settings.onlyFiles && !entry.dirent.isFile();
      }
      _onlyDirectoryFilter(entry) {
        return this._settings.onlyDirectories && !entry.dirent.isDirectory();
      }
      _isMatchToPatternsSet(filepath, patterns, isDirectory) {
        const isMatched = this._isMatchToPatterns(filepath, patterns.positive.all, isDirectory);
        if (!isMatched) {
          return false;
        }
        const isMatchedByRelativeNegative = this._isMatchToPatterns(filepath, patterns.negative.relative, isDirectory);
        if (isMatchedByRelativeNegative) {
          return false;
        }
        const isMatchedByAbsoluteNegative = this._isMatchToAbsoluteNegative(filepath, patterns.negative.absolute, isDirectory);
        if (isMatchedByAbsoluteNegative) {
          return false;
        }
        return true;
      }
      _isMatchToAbsoluteNegative(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const fullpath = utils.path.makeAbsolute(this._settings.cwd, filepath);
        return this._isMatchToPatterns(fullpath, patternsRe, isDirectory);
      }
      _isMatchToPatterns(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const isMatched = utils.pattern.matchAny(filepath, patternsRe);
        if (!isMatched && isDirectory) {
          return utils.pattern.matchAny(filepath + "/", patternsRe);
        }
        return isMatched;
      }
    };
    exports2.default = EntryFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/error.js
var require_error = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var ErrorFilter = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getFilter() {
        return (error) => this._isNonFatalError(error);
      }
      _isNonFatalError(error) {
        return utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
      }
    };
    exports2.default = ErrorFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/transformers/entry.js
var require_entry2 = __commonJS({
  "../../node_modules/fast-glob/out/providers/transformers/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var EntryTransformer = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getTransformer() {
        return (entry) => this._transform(entry);
      }
      _transform(entry) {
        let filepath = entry.path;
        if (this._settings.absolute) {
          filepath = utils.path.makeAbsolute(this._settings.cwd, filepath);
          filepath = utils.path.unixify(filepath);
        }
        if (this._settings.markDirectories && entry.dirent.isDirectory()) {
          filepath += "/";
        }
        if (!this._settings.objectMode) {
          return filepath;
        }
        return Object.assign(Object.assign({}, entry), { path: filepath });
      }
    };
    exports2.default = EntryTransformer;
  }
});

// ../../node_modules/fast-glob/out/providers/provider.js
var require_provider = __commonJS({
  "../../node_modules/fast-glob/out/providers/provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var deep_1 = require_deep();
    var entry_1 = require_entry();
    var error_1 = require_error();
    var entry_2 = require_entry2();
    var Provider = class {
      constructor(_settings) {
        this._settings = _settings;
        this.errorFilter = new error_1.default(this._settings);
        this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
        this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
        this.entryTransformer = new entry_2.default(this._settings);
      }
      _getRootDirectory(task) {
        return path4.resolve(this._settings.cwd, task.base);
      }
      _getReaderOptions(task) {
        const basePath = task.base === "." ? "" : task.base;
        return {
          basePath,
          pathSegmentSeparator: "/",
          concurrency: this._settings.concurrency,
          deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
          entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
          errorFilter: this.errorFilter.getFilter(),
          followSymbolicLinks: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          stats: this._settings.stats,
          throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
          transform: this.entryTransformer.getTransformer()
        };
      }
      _getMicromatchOptions() {
        return {
          dot: this._settings.dot,
          matchBase: this._settings.baseNameMatch,
          nobrace: !this._settings.braceExpansion,
          nocase: !this._settings.caseSensitiveMatch,
          noext: !this._settings.extglob,
          noglobstar: !this._settings.globstar,
          posix: true,
          strictSlashes: false
        };
      }
    };
    exports2.default = Provider;
  }
});

// ../../node_modules/fast-glob/out/providers/async.js
var require_async6 = __commonJS({
  "../../node_modules/fast-glob/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async5();
    var provider_1 = require_provider();
    var ProviderAsync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new async_1.default(this._settings);
      }
      async read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = await this.api(root, task, options);
        return entries.map((entry) => options.transform(entry));
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderAsync;
  }
});

// ../../node_modules/fast-glob/out/providers/stream.js
var require_stream4 = __commonJS({
  "../../node_modules/fast-glob/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var stream_2 = require_stream3();
    var provider_1 = require_provider();
    var ProviderStream = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new stream_2.default(this._settings);
      }
      read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const source = this.api(root, task, options);
        const destination = new stream_1.Readable({ objectMode: true, read: () => {
        } });
        source.once("error", (error) => destination.emit("error", error)).on("data", (entry) => destination.emit("data", options.transform(entry))).once("end", () => destination.emit("end"));
        destination.once("close", () => source.destroy());
        return destination;
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderStream;
  }
});

// ../../node_modules/fast-glob/out/readers/sync.js
var require_sync5 = __commonJS({
  "../../node_modules/fast-glob/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderSync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkSync = fsWalk.walkSync;
        this._statSync = fsStat.statSync;
      }
      dynamic(root, options) {
        return this._walkSync(root, options);
      }
      static(patterns, options) {
        const entries = [];
        for (const pattern of patterns) {
          const filepath = this._getFullEntryPath(pattern);
          const entry = this._getEntry(filepath, pattern, options);
          if (entry === null || !options.entryFilter(entry)) {
            continue;
          }
          entries.push(entry);
        }
        return entries;
      }
      _getEntry(filepath, pattern, options) {
        try {
          const stats = this._getStat(filepath);
          return this._makeEntry(stats, pattern);
        } catch (error) {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        }
      }
      _getStat(filepath) {
        return this._statSync(filepath, this._fsStatSettings);
      }
    };
    exports2.default = ReaderSync;
  }
});

// ../../node_modules/fast-glob/out/providers/sync.js
var require_sync6 = __commonJS({
  "../../node_modules/fast-glob/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync5();
    var provider_1 = require_provider();
    var ProviderSync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new sync_1.default(this._settings);
      }
      read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = this.api(root, task, options);
        return entries.map(options.transform);
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderSync;
  }
});

// ../../node_modules/fast-glob/out/settings.js
var require_settings4 = __commonJS({
  "../../node_modules/fast-glob/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    var os = require("os");
    var CPU_COUNT = Math.max(os.cpus().length, 1);
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      lstatSync: fs3.lstatSync,
      stat: fs3.stat,
      statSync: fs3.statSync,
      readdir: fs3.readdir,
      readdirSync: fs3.readdirSync
    };
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.absolute = this._getValue(this._options.absolute, false);
        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
        this.cwd = this._getValue(this._options.cwd, process.cwd());
        this.deep = this._getValue(this._options.deep, Infinity);
        this.dot = this._getValue(this._options.dot, false);
        this.extglob = this._getValue(this._options.extglob, true);
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
        this.fs = this._getFileSystemMethods(this._options.fs);
        this.globstar = this._getValue(this._options.globstar, true);
        this.ignore = this._getValue(this._options.ignore, []);
        this.markDirectories = this._getValue(this._options.markDirectories, false);
        this.objectMode = this._getValue(this._options.objectMode, false);
        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
        this.stats = this._getValue(this._options.stats, false);
        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
        this.unique = this._getValue(this._options.unique, true);
        if (this.onlyDirectories) {
          this.onlyFiles = false;
        }
        if (this.stats) {
          this.objectMode = true;
        }
        this.ignore = [].concat(this.ignore);
      }
      _getValue(option, value) {
        return option === void 0 ? value : option;
      }
      _getFileSystemMethods(methods = {}) {
        return Object.assign(Object.assign({}, exports2.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/fast-glob/out/index.js
var require_out4 = __commonJS({
  "../../node_modules/fast-glob/out/index.js"(exports2, module2) {
    "use strict";
    var taskManager = require_tasks();
    var async_1 = require_async6();
    var stream_1 = require_stream4();
    var sync_1 = require_sync6();
    var settings_1 = require_settings4();
    var utils = require_utils3();
    async function FastGlob(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, async_1.default, options);
      const result = await Promise.all(works);
      return utils.array.flatten(result);
    }
    (function(FastGlob2) {
      FastGlob2.glob = FastGlob2;
      FastGlob2.globSync = sync;
      FastGlob2.globStream = stream;
      FastGlob2.async = FastGlob2;
      function sync(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, sync_1.default, options);
        return utils.array.flatten(works);
      }
      FastGlob2.sync = sync;
      function stream(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, stream_1.default, options);
        return utils.stream.merge(works);
      }
      FastGlob2.stream = stream;
      function generateTasks(source, options) {
        assertPatternsInput(source);
        const patterns = [].concat(source);
        const settings = new settings_1.default(options);
        return taskManager.generate(patterns, settings);
      }
      FastGlob2.generateTasks = generateTasks;
      function isDynamicPattern(source, options) {
        assertPatternsInput(source);
        const settings = new settings_1.default(options);
        return utils.pattern.isDynamicPattern(source, settings);
      }
      FastGlob2.isDynamicPattern = isDynamicPattern;
      function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
      }
      FastGlob2.escapePath = escapePath;
      function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertPathToPattern(source);
      }
      FastGlob2.convertPathToPattern = convertPathToPattern;
      let posix2;
      (function(posix3) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapePosixPath(source);
        }
        posix3.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertPosixPathToPattern(source);
        }
        posix3.convertPathToPattern = convertPathToPattern2;
      })(posix2 = FastGlob2.posix || (FastGlob2.posix = {}));
      let win32;
      (function(win322) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapeWindowsPath(source);
        }
        win322.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertWindowsPathToPattern(source);
        }
        win322.convertPathToPattern = convertPathToPattern2;
      })(win32 = FastGlob2.win32 || (FastGlob2.win32 = {}));
    })(FastGlob || (FastGlob = {}));
    function getWorks(source, _Provider, options) {
      const patterns = [].concat(source);
      const settings = new settings_1.default(options);
      const tasks = taskManager.generate(patterns, settings);
      const provider = new _Provider(settings);
      return tasks.map(provider.read, provider);
    }
    function assertPatternsInput(input) {
      const source = [].concat(input);
      const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
      if (!isValidSource) {
        throw new TypeError("Patterns must be a string (non empty) or an array of strings");
      }
    }
    module2.exports = FastGlob;
  }
});

// ../../node_modules/picomatch/lib/constants.js
var require_constants4 = __commonJS({
  "../../node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var SEP = "/";
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
      SEP
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
      SEP: "\\"
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// ../../node_modules/picomatch/lib/utils.js
var require_utils5 = __commonJS({
  "../../node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants4();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.isWindows = () => {
      if (typeof navigator !== "undefined" && navigator.platform) {
        const platform = navigator.platform.toLowerCase();
        return platform === "win32" || platform === "windows";
      }
      if (typeof process !== "undefined" && process.platform) {
        return process.platform === "win32";
      }
      return false;
    };
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
    exports2.basename = (path4, { windows } = {}) => {
      const segs = path4.split(windows ? /[\\/]/ : "/");
      const last = segs[segs.length - 1];
      if (last === "") {
        return segs[segs.length - 2];
      }
      return last;
    };
  }
});

// ../../node_modules/picomatch/lib/scan.js
var require_scan2 = __commonJS({
  "../../node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils5();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants4();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts2 = [];
      let str = input;
      let index = -1;
      let start2 = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start2 + 1) {
            start2 += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start2) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start2) {
          negated = token.negated = true;
          start2++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start2 > 0) {
        prefix = str.slice(0, start2);
        str = str.slice(start2);
        lastIndex -= start2;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start: start2,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start2;
          const i2 = slashes[idx];
          const value = input.slice(n, i2);
          if (opts.tokens) {
            if (idx === 0 && start2 !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts2.push(value);
          }
          prevIndex = i2;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts2.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts2;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// ../../node_modules/picomatch/lib/parse.js
var require_parse3 = __commonJS({
  "../../node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants4();
    var utils = require_utils5();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args2, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args2, options);
      }
      args2.sort();
      const value = `[${args2.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args2.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts2 = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts2.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts2.push(value);
      return parts2;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i2 = 0; i2 < values.length; i2++) {
        for (let j = i2 + 1; j < values.length; j++) {
          const a = values[i2];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i2 = 1; i2 < pattern.length; i2++) {
        const ch = pattern[i2];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i2 !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i2),
              end: i2
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body2, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body2).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const PLATFORM_CHARS = constants.globChars(opts.windows);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.output = (prev.output || prev.value) + tok.value;
          prev.value += tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body2 = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body2, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i2 = token.tokensIndex + 1; i2 < tokens.length; i2++) {
            tokens[i2].value = "";
            tokens[i2].output = "";
            delete tokens[i2].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix2 = POSIX_REGEX_SOURCE[rest2];
                if (posix2) {
                  prev.value = pre + posix2;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i2 = arr.length - 1; i2 >= 0; i2--) {
              tokens.pop();
              if (arr[i2].type === "brace") {
                break;
              }
              if (arr[i2].type !== "dots") {
                range.unshift(arr[i2].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out2 = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out2;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(opts.windows);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse;
  }
});

// ../../node_modules/picomatch/lib/picomatch.js
var require_picomatch3 = __commonJS({
  "../../node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var scan = require_scan2();
    var parse = require_parse3();
    var utils = require_utils5();
    var constants = require_constants4();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix2 = opts.windows;
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix: posix2 });
        const result = { glob, state, regex, posix: posix2, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix: posix2 } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix2 ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix2);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(utils.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err2) {
        if (options && options.debug === true) throw err2;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// ../../node_modules/picomatch/index.js
var require_picomatch4 = __commonJS({
  "../../node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    var pico = require_picomatch3();
    var utils = require_utils5();
    function picomatch(glob, options, returnState = false) {
      if (options && (options.windows === null || options.windows === void 0)) {
        options = { ...options, windows: utils.isWindows() };
      }
      return pico(glob, options, returnState);
    }
    Object.assign(picomatch, pico);
    module2.exports = picomatch;
  }
});

// ../core/dist/binary.js
var require_binary = __commonJS({
  "../core/dist/binary.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isLikelyBinaryPath = isLikelyBinaryPath2;
    exports2.looksLikeBinaryBuffer = looksLikeBinaryBuffer;
    exports2.filterTextPaths = filterTextPaths;
    var path4 = __importStar(require("node:path"));
    var BINARY_EXTENSIONS = /* @__PURE__ */ new Set([
      ".3gp",
      ".7z",
      ".aac",
      ".aiff",
      ".avi",
      ".bmp",
      ".bz2",
      ".class",
      ".com",
      ".dat",
      ".db",
      ".deb",
      ".djvu",
      ".dll",
      ".dmg",
      ".doc",
      ".docx",
      ".dylib",
      ".exe",
      ".flac",
      ".flv",
      ".gif",
      ".gz",
      ".heic",
      ".heif",
      ".ico",
      ".iso",
      ".jar",
      ".jpeg",
      ".jpg",
      ".lz",
      ".lz4",
      ".m4a",
      ".mkv",
      ".mov",
      ".mp3",
      ".mp4",
      ".mpeg",
      ".mpg",
      ".msi",
      ".o",
      ".odp",
      ".ods",
      ".odt",
      ".ogg",
      ".opus",
      ".pdf",
      ".png",
      ".ppt",
      ".pptx",
      ".pyc",
      ".pyo",
      ".rar",
      ".rpm",
      ".so",
      ".sqlite",
      ".sqlite3",
      ".svgz",
      ".tar",
      ".tgz",
      ".tif",
      ".tiff",
      ".ttf",
      ".vo",
      ".vok",
      ".vos",
      ".glob",
      ".aux",
      ".wasm",
      ".wav",
      ".webm",
      ".webp",
      ".woff",
      ".woff2",
      ".xls",
      ".xlsx",
      ".xz",
      ".zip",
      ".zst"
    ]);
    function isLikelyBinaryPath2(filePath) {
      const ext = path4.extname(filePath).toLowerCase();
      return BINARY_EXTENSIONS.has(ext);
    }
    function looksLikeBinaryBuffer(buf) {
      const n = Math.min(buf.length, 8192);
      for (let i2 = 0; i2 < n; i2++) {
        if (buf[i2] === 0) {
          return true;
        }
      }
      return false;
    }
    function filterTextPaths(paths) {
      return paths.filter((p) => !isLikelyBinaryPath2(p));
    }
  }
});

// ../core/dist/grammars/language-config.js
var require_language_config = __commonJS({
  "../core/dist/grammars/language-config.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stripJsonComments = stripJsonComments;
    exports2.parseLanguageConfiguration = parseLanguageConfiguration;
    exports2.commentRulesFromConfiguration = commentRulesFromConfiguration;
    exports2.mergeCommentRules = mergeCommentRules;
    var fs3 = __importStar(require("node:fs"));
    function stripJsonComments(text) {
      let out2 = "";
      let i2 = 0;
      while (i2 < text.length) {
        const ch = text[i2];
        const next = text[i2 + 1];
        if (ch === '"') {
          out2 += ch;
          i2++;
          while (i2 < text.length) {
            const c = text[i2];
            out2 += c;
            i2++;
            if (c === "\\" && i2 < text.length) {
              out2 += text[i2];
              i2++;
              continue;
            }
            if (c === '"') {
              break;
            }
          }
          continue;
        }
        if (ch === "/" && next === "/") {
          i2 += 2;
          while (i2 < text.length && text[i2] !== "\n") {
            i2++;
          }
          continue;
        }
        if (ch === "/" && next === "*") {
          i2 += 2;
          while (i2 < text.length - 1 && !(text[i2] === "*" && text[i2 + 1] === "/")) {
            i2++;
          }
          i2 += 2;
          continue;
        }
        out2 += ch;
        i2++;
      }
      return out2;
    }
    function parseLanguageConfiguration(configPath) {
      if (!fs3.existsSync(configPath)) {
        return void 0;
      }
      try {
        const rawText = stripJsonComments(fs3.readFileSync(configPath, "utf8"));
        const raw = JSON.parse(rawText);
        return commentRulesFromConfiguration(raw);
      } catch {
        return void 0;
      }
    }
    function commentRulesFromConfiguration(raw) {
      const comments = raw.comments;
      if (!comments) {
        return void 0;
      }
      const rules = {};
      if (typeof comments.lineComment === "string") {
        rules.lineComment = comments.lineComment;
      } else if (comments.lineComment && typeof comments.lineComment === "object") {
        rules.lineComment = comments.lineComment.start;
        if (comments.lineComment.end) {
          rules.lineCommentEnd = comments.lineComment.end;
        }
      }
      if (Array.isArray(comments.blockComment) && comments.blockComment.length === 2) {
        rules.blockComment = [comments.blockComment[0], comments.blockComment[1]];
      }
      if (!rules.lineComment && !rules.blockComment) {
        return void 0;
      }
      return rules;
    }
    function mergeCommentRules(target, languageId, rules) {
      if (!rules) {
        return;
      }
      if (!target.has(languageId)) {
        target.set(languageId, rules);
      }
    }
  }
});

// ../core/dist/files.js
var require_files = __commonJS({
  "../core/dist/files.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseExtensionManifest = parseExtensionManifest2;
    exports2.loadExtensionManifests = loadExtensionManifests;
    exports2.loadAllExtensionManifests = loadAllExtensionManifests;
    exports2.buildGrammarMap = buildGrammarMap;
    exports2.buildGrammarBundle = buildGrammarBundle2;
    exports2.readDefaultExcludes = readDefaultExcludes2;
    exports2.parseGlobInput = parseGlobInput;
    exports2.normalizeExcludePattern = normalizeExcludePattern;
    exports2.normalizeExcludePatterns = normalizeExcludePatterns;
    exports2.collectExcludePatterns = collectExcludePatterns;
    exports2.combineExcludePatterns = combineExcludePatterns;
    exports2.mergeExcludeSources = mergeExcludeSources2;
    exports2.resolveFilesNode = resolveFilesNode2;
    exports2.guessLanguageId = guessLanguageId;
    exports2.relatedLanguageIds = relatedLanguageIds;
    exports2.resolveLanguageId = resolveLanguageId;
    exports2.grammarLanguageIds = grammarLanguageIds;
    exports2.sampleFilesByLanguage = sampleFilesByLanguage;
    var fs3 = __importStar(require("node:fs"));
    var path4 = __importStar(require("node:path"));
    var fast_glob_1 = __importDefault(require_out4());
    var picomatch_1 = __importDefault(require_picomatch4());
    var binary_1 = require_binary();
    var language_config_1 = require_language_config();
    function parseExtensionManifest2(extensionPath, pkg) {
      const grammars = [];
      const grammarsByScope = [];
      const languageIds = [];
      const commentRules = /* @__PURE__ */ new Map();
      for (const lang of pkg.contributes?.languages ?? []) {
        languageIds.push(lang.id);
        if (lang.configuration) {
          (0, language_config_1.mergeCommentRules)(commentRules, lang.id, (0, language_config_1.parseLanguageConfiguration)(path4.join(extensionPath, lang.configuration)));
        }
      }
      for (const g of pkg.contributes?.grammars ?? []) {
        const scope = {
          scopeName: g.scopeName,
          grammarPath: path4.join(extensionPath, g.path),
          extensionPath,
          languageId: g.language
        };
        grammarsByScope.push(scope);
        if (g.language) {
          grammars.push({
            languageId: g.language,
            scopeName: g.scopeName,
            grammarPath: scope.grammarPath,
            extensionPath
          });
        }
      }
      if (grammars.length === 0 && grammarsByScope.length === 0 && commentRules.size === 0) {
        return void 0;
      }
      return { extensionPath, grammars, grammarsByScope, languageIds, commentRules };
    }
    function loadExtensionManifests(extensionsDir) {
      if (!fs3.existsSync(extensionsDir)) {
        return [];
      }
      const manifests = [];
      for (const entry of fs3.readdirSync(extensionsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }
        const extensionPath = path4.join(extensionsDir, entry.name);
        const pkgPath = path4.join(extensionPath, "package.json");
        if (!fs3.existsSync(pkgPath)) {
          continue;
        }
        try {
          const pkg = JSON.parse(fs3.readFileSync(pkgPath, "utf8"));
          const manifest = parseExtensionManifest2(extensionPath, pkg);
          if (manifest) {
            manifests.push(manifest);
          }
        } catch {
        }
      }
      return manifests;
    }
    function loadAllExtensionManifests(dirs) {
      const seen = /* @__PURE__ */ new Set();
      const all = [];
      for (const dir of dirs) {
        for (const manifest of loadExtensionManifests(dir)) {
          const key = manifest.extensionPath;
          if (seen.has(key)) {
            continue;
          }
          seen.add(key);
          all.push(manifest);
        }
      }
      return all;
    }
    function buildGrammarMap(manifests) {
      return buildGrammarBundle2(manifests).primaryGrammars;
    }
    function buildGrammarBundle2(manifests) {
      const primaryGrammars = selectPrimaryGrammars(manifests);
      const grammarsByScope = /* @__PURE__ */ new Map();
      const commentRules = /* @__PURE__ */ new Map();
      for (const manifest of manifests) {
        for (const g of manifest.grammarsByScope) {
          if (!grammarsByScope.has(g.scopeName)) {
            grammarsByScope.set(g.scopeName, g);
          }
        }
        for (const [langId, rules] of manifest.commentRules) {
          if (!commentRules.has(langId)) {
            commentRules.set(langId, rules);
          }
        }
      }
      return { primaryGrammars, grammarsByScope, commentRules };
    }
    function selectPrimaryGrammars(manifests) {
      const byLanguage = /* @__PURE__ */ new Map();
      const languageOwners = /* @__PURE__ */ new Map();
      for (const manifest of manifests) {
        for (const langId of manifest.languageIds) {
          let owners = languageOwners.get(langId);
          if (!owners) {
            owners = /* @__PURE__ */ new Set();
            languageOwners.set(langId, owners);
          }
          owners.add(manifest.extensionPath);
        }
        for (const g of manifest.grammars) {
          const list = byLanguage.get(g.languageId) ?? [];
          list.push(g);
          byLanguage.set(g.languageId, list);
        }
      }
      const result = /* @__PURE__ */ new Map();
      for (const [langId, candidates] of byLanguage) {
        const owners = languageOwners.get(langId);
        const preferred = owners ? candidates.filter((c) => owners.has(c.extensionPath)) : candidates;
        const chosen = preferred[0] ?? candidates[0];
        if (chosen) {
          result.set(langId, chosen);
        }
      }
      return result;
    }
    function readDefaultExcludes2(settingsPath) {
      if (!fs3.existsSync(settingsPath)) {
        return [];
      }
      try {
        const settings = JSON.parse(fs3.readFileSync(settingsPath, "utf8"));
        const patterns = [];
        for (const [key, val] of Object.entries(settings["search.exclude"] ?? {})) {
          if (val) {
            patterns.push(key);
          }
        }
        for (const [key, val] of Object.entries(settings["files.exclude"] ?? {})) {
          if (val) {
            patterns.push(key);
          }
        }
        return patterns;
      } catch {
        return [];
      }
    }
    function parseGlobInput(input) {
      if (!input?.trim()) {
        return [];
      }
      return input.split(",").map((p) => p.trim()).filter(Boolean);
    }
    function normalizeExcludePattern(pattern) {
      const p = pattern.trim();
      if (!p) {
        return [];
      }
      if (/[*?[\]{}]/.test(p)) {
        return [p];
      }
      if (p.includes("/")) {
        const withGlob = p.endsWith("/") ? `${p}**` : `${p}/**`;
        return p === withGlob ? [p] : [p, withGlob];
      }
      return [p, `${p}/**`, `**/${p}/**`];
    }
    function normalizeExcludePatterns(patterns) {
      return [...new Set(patterns.flatMap(normalizeExcludePattern))];
    }
    function collectExcludePatterns(explicit, defaults = []) {
      return normalizeExcludePatterns([...defaults, ...parseGlobInput(explicit)].filter(Boolean));
    }
    function combineExcludePatterns(explicit, defaults = []) {
      const parts2 = collectExcludePatterns(explicit, defaults);
      if (parts2.length === 0) {
        return void 0;
      }
      if (parts2.length === 1) {
        return parts2[0];
      }
      return `{${parts2.join(",")}}`;
    }
    function mergeExcludeSources2(...sources) {
      return collectExcludePatterns(void 0, sources.flat());
    }
    function makeMatcher(patterns, matchWhenEmpty) {
      if (patterns.length === 0) {
        return () => matchWhenEmpty;
      }
      const matchers = patterns.map((p) => (0, picomatch_1.default)(p, { dot: true }));
      return (input) => matchers.some((m) => m(input));
    }
    async function resolveFilesNode2(options) {
      const cwd = options.cwd;
      const searchRoots = options.paths?.length ? options.paths : ["."];
      const defaultExcludes = options.defaultExcludes ?? (options.useDefaultExcludes !== false ? readDefaultExcludes2(options.settingsPath ?? path4.join(cwd, ".vscode", "settings.json")) : []);
      const ignorePatterns = collectExcludePatterns(options.exclude, defaultExcludes);
      const includePatterns = parseGlobInput(options.include);
      const isMatchInclude = makeMatcher(includePatterns.length ? includePatterns : ["**/*"], true);
      const isMatchExclude = makeMatcher(ignorePatterns, false);
      const maxFiles = options.maxFiles ?? Number.POSITIVE_INFINITY;
      const files = [];
      for (const root of searchRoots) {
        const absRoot = path4.resolve(cwd, root);
        const entries = await (0, fast_glob_1.default)("**/*", {
          cwd: absRoot,
          absolute: true,
          onlyFiles: true,
          dot: true,
          followSymbolicLinks: true,
          suppressErrors: true,
          ignore: ignorePatterns.length ? ignorePatterns : void 0
        });
        for (const file of entries) {
          if (files.length >= maxFiles) {
            return files;
          }
          if ((0, binary_1.isLikelyBinaryPath)(file)) {
            continue;
          }
          const rel = path4.relative(cwd, file).replace(/\\/g, "/");
          if (!isMatchInclude(rel) && !isMatchInclude("/" + rel)) {
            continue;
          }
          if (isMatchExclude(rel) || isMatchExclude("/" + rel)) {
            continue;
          }
          files.push(file);
        }
      }
      return files;
    }
    function guessLanguageId(filePath) {
      const ext = path4.extname(filePath).toLowerCase();
      const map = {
        ".ts": "typescript",
        ".tsx": "typescriptreact",
        ".js": "javascript",
        ".jsx": "javascriptreact",
        ".mjs": "javascript",
        ".cjs": "javascript",
        ".py": "python",
        ".rs": "rust",
        ".go": "go",
        ".v": "rocq",
        ".coq": "rocq",
        ".json": "json",
        ".css": "css",
        ".html": "html",
        ".md": "markdown",
        ".typ": "typst",
        ".toml": "toml",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".cpp": "cpp",
        ".c": "c",
        ".h": "c",
        ".hpp": "cpp",
        ".java": "java",
        ".rb": "ruby",
        ".sh": "shellscript",
        ".bash": "shellscript"
      };
      return map[ext] ?? (ext.slice(1) || "plaintext");
    }
    var LANGUAGE_ALIASES = {
      rocq: "coq",
      coq: "rocq",
      javascriptreact: "typescriptreact"
    };
    function relatedLanguageIds(languageId) {
      const ids = [languageId];
      const alias = LANGUAGE_ALIASES[languageId];
      if (alias && !ids.includes(alias)) {
        ids.push(alias);
      }
      for (const [from, to] of Object.entries(LANGUAGE_ALIASES)) {
        if (to === languageId && !ids.includes(from)) {
          ids.push(from);
        }
      }
      return ids;
    }
    function resolveLanguageId(languageId) {
      return LANGUAGE_ALIASES[languageId] ?? languageId;
    }
    function grammarLanguageIds(languageId, primaryGrammars) {
      if (primaryGrammars?.has(languageId)) {
        return [languageId];
      }
      const related = relatedLanguageIds(languageId);
      if (primaryGrammars) {
        const withGrammar = related.filter((id) => primaryGrammars.has(id));
        return withGrammar.length > 0 ? withGrammar : [languageId];
      }
      return related;
    }
    function sampleFilesByLanguage(files, maxPerLanguage = 20, maxTotal = 50) {
      if (files.length <= maxTotal) {
        return files;
      }
      const byLang = /* @__PURE__ */ new Map();
      for (const f of files) {
        const lang = guessLanguageId(f);
        const list = byLang.get(lang) ?? [];
        list.push(f);
        byLang.set(lang, list);
      }
      const sampled = [];
      for (const list of byLang.values()) {
        sampled.push(...list.slice(0, maxPerLanguage));
      }
      return sampled;
    }
  }
});

// ../core/dist/scopediscovery.js
var require_scopediscovery = __commonJS({
  "../core/dist/scopediscovery.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.discoverScopes = discoverScopes2;
    exports2.collectCategories = collectCategories;
    exports2.discoverScopesFromSpans = discoverScopesFromSpans;
    exports2.readFileText = readFileText;
    var fs3 = __importStar(require("node:fs"));
    var types_1 = require_types();
    var files_1 = require_files();
    var binary_1 = require_binary();
    async function discoverScopes2(extractor, files, readText, getLanguageId) {
      const sampled = (0, files_1.sampleFilesByLanguage)((0, binary_1.filterTextPaths)(files));
      const found = /* @__PURE__ */ new Set();
      for (const file of sampled) {
        try {
          let text;
          const raw = readText(file);
          text = raw instanceof Promise ? await raw : raw;
          const langRaw = getLanguageId?.(file);
          const lang = langRaw instanceof Promise ? await langRaw : langRaw;
          const spans = await extractor.extractSpans(file, text, lang);
          for (const span of spans) {
            found.add(span.category);
          }
        } catch {
        }
      }
      if (found.size === 0) {
        return [{ id: types_1.DEFAULT_SCOPE, label: (0, types_1.scopeLabel)(types_1.DEFAULT_SCOPE) }];
      }
      const ordered = [...found].sort();
      if (found.has(types_1.DEFAULT_SCOPE)) {
        return [
          { id: types_1.DEFAULT_SCOPE, label: (0, types_1.scopeLabel)(types_1.DEFAULT_SCOPE) },
          ...ordered.filter((id) => id !== types_1.DEFAULT_SCOPE).map((id) => ({ id, label: (0, types_1.scopeLabel)(id) }))
        ];
      }
      return ordered.map((id) => ({ id, label: (0, types_1.scopeLabel)(id) }));
    }
    function collectCategories(spans) {
      return [...new Set(spans.map((s) => s.category))].sort();
    }
    async function discoverScopesFromSpans(extractor, files, readText) {
      return discoverScopes2(extractor, files, readText);
    }
    function readFileText(path4) {
      return fs3.readFileSync(path4, "utf8");
    }
  }
});

// ../../node_modules/vscode-textmate/release/main.js
var require_main = __commonJS({
  "../../node_modules/vscode-textmate/release/main.js"(exports2, module2) {
    !function(e, t) {
      "object" == typeof exports2 && "object" == typeof module2 ? module2.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports2 ? exports2.vscodetextmate = t() : e.vscodetextmate = t();
    }(exports2, () => (() => {
      "use strict";
      var e = { 185: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UseOnigurumaFindOptions = t2.DebugFlags = void 0, t2.DebugFlags = { InDebugMode: "undefined" != typeof process && !!process.env.VSCODE_TEXTMATE_DEBUG }, t2.UseOnigurumaFindOptions = false;
      }, 151: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.applyStateStackDiff = t2.diffStateStacksRefEq = void 0;
        const s = n(752);
        t2.diffStateStacksRefEq = function(e3, t3) {
          let n2 = 0;
          const s2 = [];
          let r = e3, i2 = t3;
          for (; r !== i2; ) r && (!i2 || r.depth >= i2.depth) ? (n2++, r = r.parent) : (s2.push(i2.toStateStackFrame()), i2 = i2.parent);
          return { pops: n2, newFrames: s2.reverse() };
        }, t2.applyStateStackDiff = function(e3, t3) {
          let n2 = e3;
          for (let e4 = 0; e4 < t3.pops; e4++) n2 = n2.parent;
          for (const e4 of t3.newFrames) n2 = s.StateStackImpl.pushFrame(n2, e4);
          return n2;
        };
      }, 490: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.toOptionalTokenType = t2.EncodedTokenAttributes = t2.FontAttribute = void 0;
        class n {
          constructor(e3, t3, n2) {
            this.fontFamily = e3, this.fontSize = t3, this.lineHeight = n2;
          }
          static _getKey(e3, t3, n2) {
            return `${e3}|${t3}|${n2}`;
          }
          static _get(e3, t3, s2) {
            const r = this._getKey(e3, t3, s2);
            let i2 = this._map.get(r);
            return i2 || (i2 = new n(e3, t3, s2), this._map.set(r, i2)), i2;
          }
          static from(e3, t3, s2) {
            return new n(e3, t3, s2);
          }
          with(e3) {
            return e3 ? n._get(e3.fontFamily || this.fontFamily, e3.fontSize || this.fontSize, e3.lineHeight || this.lineHeight) : this;
          }
        }
        var s;
        t2.FontAttribute = n, n._map = /* @__PURE__ */ new Map(), (s = t2.EncodedTokenAttributes || (t2.EncodedTokenAttributes = {})).toBinaryStr = function(e3) {
          return e3.toString(2).padStart(32, "0");
        }, s.print = function(e3) {
          const t3 = s.getLanguageId(e3), n2 = s.getTokenType(e3), r = s.getFontStyle(e3), i2 = s.getForeground(e3), o = s.getBackground(e3);
          console.log({ languageId: t3, tokenType: n2, fontStyle: r, foreground: i2, background: o });
        }, s.getLanguageId = function(e3) {
          return (255 & e3) >>> 0;
        }, s.getTokenType = function(e3) {
          return (768 & e3) >>> 8;
        }, s.containsBalancedBrackets = function(e3) {
          return !!(1024 & e3);
        }, s.getFontStyle = function(e3) {
          return (30720 & e3) >>> 11;
        }, s.getForeground = function(e3) {
          return (16744448 & e3) >>> 15;
        }, s.getBackground = function(e3) {
          return (4278190080 & e3) >>> 24;
        }, s.set = function(e3, t3, n2, r, i2, o, a) {
          let c = s.getLanguageId(e3), l = s.getTokenType(e3), u = s.containsBalancedBrackets(e3) ? 1 : 0, h = s.getFontStyle(e3), p = s.getForeground(e3), d = s.getBackground(e3);
          return 0 !== t3 && (c = t3), 8 !== n2 && (l = n2), null !== r && (u = r ? 1 : 0), -1 !== i2 && (h = i2), 0 !== o && (p = o), 0 !== a && (d = a), (c | l << 8 | u << 10 | h << 11 | p << 15 | d << 24) >>> 0;
        }, t2.toOptionalTokenType = function(e3) {
          return e3;
        };
      }, 214: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BasicScopeAttributesProvider = t2.BasicScopeAttributes = void 0;
        const s = n(807);
        class r {
          constructor(e3, t3) {
            this.languageId = e3, this.tokenType = t3;
          }
        }
        t2.BasicScopeAttributes = r;
        class i2 {
          constructor(e3, t3) {
            this._getBasicScopeAttributes = new s.CachedFn((e4) => {
              const t4 = this._scopeToLanguage(e4), n2 = this._toStandardTokenType(e4);
              return new r(t4, n2);
            }), this._defaultAttributes = new r(e3, 8), this._embeddedLanguagesMatcher = new o(Object.entries(t3 || {}));
          }
          getDefaultAttributes() {
            return this._defaultAttributes;
          }
          getBasicScopeAttributes(e3) {
            return null === e3 ? i2._NULL_SCOPE_METADATA : this._getBasicScopeAttributes.get(e3);
          }
          _scopeToLanguage(e3) {
            return this._embeddedLanguagesMatcher.match(e3) || 0;
          }
          _toStandardTokenType(e3) {
            const t3 = e3.match(i2.STANDARD_TOKEN_TYPE_REGEXP);
            if (!t3) return 8;
            switch (t3[1]) {
              case "comment":
                return 1;
              case "string":
                return 2;
              case "regex":
                return 3;
              case "meta.embedded":
                return 0;
            }
            throw new Error("Unexpected match for standard token type!");
          }
        }
        t2.BasicScopeAttributesProvider = i2, i2._NULL_SCOPE_METADATA = new r(0, 0), i2.STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
        class o {
          constructor(e3) {
            if (0 === e3.length) this.values = null, this.scopesRegExp = null;
            else {
              this.values = new Map(e3);
              const t3 = e3.map(([e4, t4]) => s.escapeRegExpCharacters(e4));
              t3.sort(), t3.reverse(), this.scopesRegExp = new RegExp(`^((${t3.join(")|(")}))($|\\.)`, "");
            }
          }
          match(e3) {
            if (!this.scopesRegExp) return;
            const t3 = e3.match(this.scopesRegExp);
            return t3 ? this.values.get(t3[1]) : void 0;
          }
        }
      }, 929: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.LineFonts = t2.FontInfo = t2.LineTokens = t2.BalancedBracketSelectors = t2.StateStackImpl = t2.AttributedScopeStack = t2.Grammar = t2.createGrammar = void 0;
        const s = n(185), r = n(490), i2 = n(916), o = n(810), a = n(666), c = n(63), l = n(807), u = n(214), h = n(398);
        function p(e3, t3, n2, s2, r2) {
          const o2 = i2.createMatchers(t3, d), c2 = a.RuleFactory.getCompiledRuleId(n2, s2, r2.repository);
          for (const n3 of o2) e3.push({ debugSelector: t3, matcher: n3.matcher, ruleId: c2, grammar: r2, priority: n3.priority });
        }
        function d(e3, t3) {
          if (t3.length < e3.length) return false;
          let n2 = 0;
          return e3.every((e4) => {
            for (let s2 = n2; s2 < t3.length; s2++) if (f(t3[s2], e4)) return n2 = s2 + 1, true;
            return false;
          });
        }
        function f(e3, t3) {
          if (!e3) return false;
          if (e3 === t3) return true;
          const n2 = t3.length;
          return e3.length > n2 && e3.substr(0, n2) === t3 && "." === e3[n2];
        }
        t2.createGrammar = function(e3, t3, n2, s2, r2, i3, o2, a2) {
          return new m(e3, t3, n2, s2, r2, i3, o2, a2);
        };
        class m {
          constructor(e3, t3, n2, s2, r2, o2, a2, c2) {
            if (this._rootScopeName = e3, this.balancedBracketSelectors = o2, this._onigLib = c2, this._basicScopeAttributesProvider = new u.BasicScopeAttributesProvider(n2, s2), this._rootId = -1, this._lastRuleId = 0, this._ruleId2desc = [null], this._includedGrammars = {}, this._grammarRepository = a2, this._grammar = g(t3, null), this._injections = null, this._tokenTypeMatchers = [], r2) for (const e4 of Object.keys(r2)) {
              const t4 = i2.createMatchers(e4, d);
              for (const n3 of t4) this._tokenTypeMatchers.push({ matcher: n3.matcher, type: r2[e4] });
            }
          }
          get themeProvider() {
            return this._grammarRepository;
          }
          dispose() {
            for (const e3 of this._ruleId2desc) e3 && e3.dispose();
          }
          createOnigScanner(e3) {
            return this._onigLib.createOnigScanner(e3);
          }
          createOnigString(e3) {
            return this._onigLib.createOnigString(e3);
          }
          getMetadataForScope(e3) {
            return this._basicScopeAttributesProvider.getBasicScopeAttributes(e3);
          }
          _collectInjections() {
            const e3 = [], t3 = this._rootScopeName, n2 = ((e4) => e4 === this._rootScopeName ? this._grammar : this.getExternalGrammar(e4))(t3);
            if (n2) {
              const s2 = n2.injections;
              if (s2) for (let t4 in s2) p(e3, t4, s2[t4], this, n2);
              const r2 = this._grammarRepository.injections(t3);
              r2 && r2.forEach((t4) => {
                const n3 = this.getExternalGrammar(t4);
                if (n3) {
                  const t5 = n3.injectionSelector;
                  t5 && p(e3, t5, n3, this, n3);
                }
              });
            }
            return e3.sort((e4, t4) => e4.priority - t4.priority), e3;
          }
          getInjections() {
            if (null === this._injections && (this._injections = this._collectInjections(), s.DebugFlags.InDebugMode && this._injections.length > 0)) {
              console.log(`Grammar ${this._rootScopeName} contains the following injections:`);
              for (const e3 of this._injections) console.log(`  - ${e3.debugSelector}`);
            }
            return this._injections;
          }
          registerRule(e3) {
            const t3 = ++this._lastRuleId, n2 = e3(a.ruleIdFromNumber(t3));
            return this._ruleId2desc[t3] = n2, n2;
          }
          getRule(e3) {
            return this._ruleId2desc[a.ruleIdToNumber(e3)];
          }
          getExternalGrammar(e3, t3) {
            if (this._includedGrammars[e3]) return this._includedGrammars[e3];
            if (this._grammarRepository) {
              const n2 = this._grammarRepository.lookup(e3);
              if (n2) return this._includedGrammars[e3] = g(n2, t3 && t3.$base), this._includedGrammars[e3];
            }
          }
          tokenizeLine(e3, t3, n2 = 0) {
            const s2 = this._tokenize(e3, t3, false, n2);
            return { tokens: s2.lineTokens.getResult(s2.ruleStack, s2.lineLength), ruleStack: s2.ruleStack, stoppedEarly: s2.stoppedEarly, fonts: s2.lineFonts.getResult() };
          }
          tokenizeLine2(e3, t3, n2 = 0) {
            const s2 = this._tokenize(e3, t3, true, n2);
            return { tokens: s2.lineTokens.getBinaryResult(s2.ruleStack, s2.lineLength), ruleStack: s2.ruleStack, stoppedEarly: s2.stoppedEarly, fonts: s2.lineFonts.getResult() };
          }
          _tokenize(e3, t3, n2, s2) {
            let i3;
            if (-1 === this._rootId && (this._rootId = a.RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository), this.getInjections()), t3 && t3 !== b.NULL) i3 = false, t3.reset();
            else {
              i3 = true;
              const e4 = this._basicScopeAttributesProvider.getDefaultAttributes(), n3 = this.themeProvider.getDefaults(), s3 = r.EncodedTokenAttributes.set(0, e4.languageId, e4.tokenType, null, n3.fontStyle, n3.foregroundId, n3.backgroundId), o2 = r.FontAttribute.from(n3.fontFamily, n3.fontSize, n3.lineHeight), a2 = this.getRule(this._rootId).getName(null, null);
              let c3;
              c3 = a2 ? _.createRootAndLookUpScopeName(a2, s3, o2, this) : _.createRoot("unknown", s3, o2), t3 = new b(null, this._rootId, -1, -1, false, null, c3, c3);
            }
            e3 += "\n";
            const c2 = this.createOnigString(e3), l2 = c2.content.length, u2 = new y(n2, e3, this._tokenTypeMatchers, this.balancedBracketSelectors), p2 = new k(), d2 = h._tokenizeString(this, c2, i3, 0, t3, u2, p2, true, s2);
            return o.disposeOnigString(c2), { lineLength: l2, lineTokens: u2, lineFonts: p2, ruleStack: d2.stack, stoppedEarly: d2.stoppedEarly };
          }
        }
        function g(e3, t3) {
          return (e3 = l.clone(e3)).repository = e3.repository || {}, e3.repository.$self = { $vscodeTextmateLocation: e3.$vscodeTextmateLocation, patterns: e3.patterns, name: e3.scopeName }, e3.repository.$base = t3 || e3.repository.$self, e3;
        }
        t2.Grammar = m;
        class _ {
          constructor(e3, t3, n2, s2, r2) {
            this.parent = e3, this.scopePath = t3, this.tokenAttributes = n2, this.fontAttributes = s2, this.styleAttributes = r2;
          }
          static fromExtension(e3, t3) {
            let n2 = e3, s2 = e3?.scopePath ?? null;
            for (const e4 of t3) s2 = c.ScopeStack.push(s2, e4.scopeNames), n2 = new _(n2, s2, e4.encodedTokenAttributes, null, null);
            return n2;
          }
          static createRoot(e3, t3, n2) {
            return new _(null, new c.ScopeStack(null, e3), t3, n2, null);
          }
          static createRootAndLookUpScopeName(e3, t3, n2, s2) {
            const r2 = s2.getMetadataForScope(e3), i3 = new c.ScopeStack(null, e3), o2 = s2.themeProvider.themeMatch(i3), a2 = _.mergeAttributes(t3, r2, o2), l2 = n2.with(o2);
            return new _(null, i3, a2, l2, o2);
          }
          get scopeName() {
            return this.scopePath.scopeName;
          }
          toString() {
            return this.getScopeNames().join(" ");
          }
          equals(e3) {
            return _.equals(this, e3);
          }
          static equals(e3, t3) {
            for (; ; ) {
              if (e3 === t3) return true;
              if (!e3 && !t3) return true;
              if (!e3 || !t3) return false;
              if (e3.scopeName !== t3.scopeName || e3.tokenAttributes !== t3.tokenAttributes) return false;
              e3 = e3.parent, t3 = t3.parent;
            }
          }
          static mergeAttributes(e3, t3, n2) {
            let s2 = -1, i3 = 0, o2 = 0;
            return null !== n2 && (s2 = n2.fontStyle, i3 = n2.foregroundId, o2 = n2.backgroundId), r.EncodedTokenAttributes.set(e3, t3.languageId, t3.tokenType, null, s2, i3, o2);
          }
          pushAttributed(e3, t3) {
            if (null === e3) return this;
            if (-1 === e3.indexOf(" ")) return _._pushAttributed(this, e3, t3);
            const n2 = e3.split(/ /g);
            let s2 = this;
            for (const e4 of n2) s2 = _._pushAttributed(s2, e4, t3);
            return s2;
          }
          static _pushAttributed(e3, t3, n2) {
            const s2 = n2.getMetadataForScope(t3), r2 = e3.scopePath.push(t3), i3 = n2.themeProvider.themeMatch(r2), o2 = _.mergeAttributes(e3.tokenAttributes, s2, i3), a2 = e3.fontAttributes?.with(i3) ?? null;
            return new _(e3, r2, o2, a2, i3);
          }
          getScopeNames() {
            return this.scopePath.getSegments();
          }
          getExtensionIfDefined(e3) {
            const t3 = [];
            let n2 = this;
            for (; n2 && n2 !== e3; ) t3.push({ encodedTokenAttributes: n2.tokenAttributes, scopeNames: n2.scopePath.getExtensionIfDefined(n2.parent?.scopePath ?? null) }), n2 = n2.parent;
            return n2 === e3 ? t3.reverse() : void 0;
          }
        }
        t2.AttributedScopeStack = _;
        class b {
          constructor(e3, t3, n2, s2, r2, i3, o2, a2) {
            this.parent = e3, this.ruleId = t3, this.beginRuleCapturedEOL = r2, this.endRule = i3, this.nameScopesList = o2, this.contentNameScopesList = a2, this._stackElementBrand = void 0, this.depth = this.parent ? this.parent.depth + 1 : 1, this._enterPos = n2, this._anchorPos = s2;
          }
          equals(e3) {
            return null !== e3 && b._equals(this, e3);
          }
          static _equals(e3, t3) {
            return e3 === t3 || !!this._structuralEquals(e3, t3) && _.equals(e3.contentNameScopesList, t3.contentNameScopesList);
          }
          static _structuralEquals(e3, t3) {
            for (; ; ) {
              if (e3 === t3) return true;
              if (!e3 && !t3) return true;
              if (!e3 || !t3) return false;
              if (e3.depth !== t3.depth || e3.ruleId !== t3.ruleId || e3.endRule !== t3.endRule) return false;
              e3 = e3.parent, t3 = t3.parent;
            }
          }
          clone() {
            return this;
          }
          static _reset(e3) {
            for (; e3; ) e3._enterPos = -1, e3._anchorPos = -1, e3 = e3.parent;
          }
          reset() {
            b._reset(this);
          }
          pop() {
            return this.parent;
          }
          safePop() {
            return this.parent ? this.parent : this;
          }
          push(e3, t3, n2, s2, r2, i3, o2) {
            return new b(this, e3, t3, n2, s2, r2, i3, o2);
          }
          getEnterPos() {
            return this._enterPos;
          }
          getAnchorPos() {
            return this._anchorPos;
          }
          getRule(e3) {
            return e3.getRule(this.ruleId);
          }
          toString() {
            const e3 = [];
            return this._writeString(e3, 0), "[" + e3.join(",") + "]";
          }
          _writeString(e3, t3) {
            return this.parent && (t3 = this.parent._writeString(e3, t3)), e3[t3++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`, t3;
          }
          withContentNameScopesList(e3) {
            return this.contentNameScopesList === e3 ? this : this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, e3);
          }
          withEndRule(e3) {
            return this.endRule === e3 ? this : new b(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, e3, this.nameScopesList, this.contentNameScopesList);
          }
          hasSameRuleAs(e3) {
            let t3 = this;
            for (; t3 && t3._enterPos === e3._enterPos; ) {
              if (t3.ruleId === e3.ruleId) return true;
              t3 = t3.parent;
            }
            return false;
          }
          toStateStackFrame() {
            return { ruleId: a.ruleIdToNumber(this.ruleId), beginRuleCapturedEOL: this.beginRuleCapturedEOL, endRule: this.endRule, nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [], contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? [] };
          }
          static pushFrame(e3, t3) {
            const n2 = _.fromExtension(e3?.nameScopesList ?? null, t3.nameScopesList);
            return new b(e3, a.ruleIdFromNumber(t3.ruleId), t3.enterPos ?? -1, t3.anchorPos ?? -1, t3.beginRuleCapturedEOL, t3.endRule, n2, _.fromExtension(n2, t3.contentNameScopesList));
          }
        }
        t2.StateStackImpl = b, b.NULL = new b(null, 0, 0, 0, false, null, null, null), t2.BalancedBracketSelectors = class {
          constructor(e3, t3) {
            this.allowAny = false, this.balancedBracketScopes = e3.flatMap((e4) => "*" === e4 ? (this.allowAny = true, []) : i2.createMatchers(e4, d).map((e5) => e5.matcher)), this.unbalancedBracketScopes = t3.flatMap((e4) => i2.createMatchers(e4, d).map((e5) => e5.matcher));
          }
          get matchesAlways() {
            return this.allowAny && 0 === this.unbalancedBracketScopes.length;
          }
          get matchesNever() {
            return 0 === this.balancedBracketScopes.length && !this.allowAny;
          }
          match(e3) {
            for (const t3 of this.unbalancedBracketScopes) if (t3(e3)) return false;
            for (const t3 of this.balancedBracketScopes) if (t3(e3)) return true;
            return this.allowAny;
          }
        };
        class y {
          constructor(e3, t3, n2, r2) {
            this.balancedBracketSelectors = r2, this._emitBinaryTokens = e3, this._tokenTypeOverrides = n2, s.DebugFlags.InDebugMode ? this._lineText = t3 : this._lineText = null, this._mergeConsecutiveTokensWithEqualMetadata = !l.containsRTL(t3), this._tokens = [], this._binaryTokens = [], this._lastTokenEndIndex = 0;
          }
          produce(e3, t3) {
            this.produceFromScopes(e3.contentNameScopesList, t3);
          }
          produceFromScopes(e3, t3) {
            if (this._lastTokenEndIndex >= t3) return;
            if (this._emitBinaryTokens) {
              let n3 = e3?.tokenAttributes ?? 0, i3 = false;
              if (this.balancedBracketSelectors?.matchesAlways && (i3 = true), this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
                const t4 = e3?.getScopeNames() ?? [];
                for (const e4 of this._tokenTypeOverrides) e4.matcher(t4) && (n3 = r.EncodedTokenAttributes.set(n3, 0, r.toOptionalTokenType(e4.type), null, -1, 0, 0));
                this.balancedBracketSelectors && (i3 = this.balancedBracketSelectors.match(t4));
              }
              if (i3 && (n3 = r.EncodedTokenAttributes.set(n3, 0, 8, i3, -1, 0, 0)), this._mergeConsecutiveTokensWithEqualMetadata && this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === n3) return void (this._lastTokenEndIndex = t3);
              if (s.DebugFlags.InDebugMode) {
                const n4 = e3?.getScopeNames() ?? [];
                console.log("  token: |" + this._lineText.substring(this._lastTokenEndIndex, t3).replace(/\n$/, "\\n") + "|");
                for (let e4 = 0; e4 < n4.length; e4++) console.log("      * " + n4[e4]);
              }
              return this._binaryTokens.push(this._lastTokenEndIndex), this._binaryTokens.push(n3), void (this._lastTokenEndIndex = t3);
            }
            const n2 = e3?.getScopeNames() ?? [];
            if (s.DebugFlags.InDebugMode) {
              console.log("  token: |" + this._lineText.substring(this._lastTokenEndIndex, t3).replace(/\n$/, "\\n") + "|");
              for (let e4 = 0; e4 < n2.length; e4++) console.log("      * " + n2[e4]);
            }
            this._tokens.push({ startIndex: this._lastTokenEndIndex, endIndex: t3, scopes: n2 }), this._lastTokenEndIndex = t3;
          }
          getResult(e3, t3) {
            return this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === t3 - 1 && this._tokens.pop(), 0 === this._tokens.length && (this._lastTokenEndIndex = -1, this.produce(e3, t3), this._tokens[this._tokens.length - 1].startIndex = 0), this._tokens;
          }
          getBinaryResult(e3, t3) {
            this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === t3 - 1 && (this._binaryTokens.pop(), this._binaryTokens.pop()), 0 === this._binaryTokens.length && (this._lastTokenEndIndex = -1, this.produce(e3, t3), this._binaryTokens[this._binaryTokens.length - 2] = 0);
            const n2 = new Uint32Array(this._binaryTokens.length);
            for (let e4 = 0, t4 = this._binaryTokens.length; e4 < t4; e4++) n2[e4] = this._binaryTokens[e4];
            return n2;
          }
        }
        t2.LineTokens = y;
        class S {
          constructor(e3, t3, n2, s2, r2) {
            this.startIndex = e3, this.endIndex = t3, this.fontFamily = n2, this.fontSizeMultiplier = s2, this.lineHeightMultiplier = r2;
          }
          optionsEqual(e3) {
            return this.fontFamily === e3.fontFamily && this.fontSizeMultiplier === e3.fontSizeMultiplier && this.lineHeightMultiplier === e3.lineHeightMultiplier;
          }
        }
        t2.FontInfo = S;
        class k {
          constructor() {
            this._fonts = [], this._lastIndex = 0;
          }
          produce(e3, t3) {
            this.produceFromScopes(e3.contentNameScopesList, t3);
          }
          produceFromScopes(e3, t3) {
            if (!e3?.fontAttributes) return void (this._lastIndex = t3);
            const n2 = e3.fontAttributes.fontFamily, s2 = e3.fontAttributes.fontSize, r2 = e3.fontAttributes.lineHeight;
            if (!n2 && !s2 && !r2) return void (this._lastIndex = t3);
            const i3 = new S(this._lastIndex, t3, n2, s2, r2), o2 = this._fonts[this._fonts.length - 1];
            o2 && o2.endIndex === this._lastIndex && o2.optionsEqual(i3) ? o2.endIndex = i3.endIndex : this._fonts.push(i3), this._lastIndex = t3;
          }
          getResult() {
            return this._fonts;
          }
        }
        t2.LineFonts = k;
      }, 784: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.parseInclude = t2.TopLevelRepositoryReference = t2.TopLevelReference = t2.RelativeReference = t2.SelfReference = t2.BaseReference = t2.ScopeDependencyProcessor = t2.ExternalReferenceCollector = t2.TopLevelRepositoryRuleReference = t2.TopLevelRuleReference = void 0;
        const s = n(807);
        class r {
          constructor(e3) {
            this.scopeName = e3;
          }
          toKey() {
            return this.scopeName;
          }
        }
        t2.TopLevelRuleReference = r;
        class i2 {
          constructor(e3, t3) {
            this.scopeName = e3, this.ruleName = t3;
          }
          toKey() {
            return `${this.scopeName}#${this.ruleName}`;
          }
        }
        t2.TopLevelRepositoryRuleReference = i2;
        class o {
          constructor() {
            this._references = [], this._seenReferenceKeys = /* @__PURE__ */ new Set(), this.visitedRule = /* @__PURE__ */ new Set();
          }
          get references() {
            return this._references;
          }
          add(e3) {
            const t3 = e3.toKey();
            this._seenReferenceKeys.has(t3) || (this._seenReferenceKeys.add(t3), this._references.push(e3));
          }
        }
        function a(e3, t3, n2, s2) {
          const i3 = n2.lookup(e3.scopeName);
          if (!i3) {
            if (e3.scopeName === t3) throw new Error(`No grammar provided for <${t3}>`);
            return;
          }
          const o2 = n2.lookup(t3);
          e3 instanceof r ? l({ baseGrammar: o2, selfGrammar: i3 }, s2) : c(e3.ruleName, { baseGrammar: o2, selfGrammar: i3, repository: i3.repository }, s2);
          const a2 = n2.injections(e3.scopeName);
          if (a2) for (const e4 of a2) s2.add(new r(e4));
        }
        function c(e3, t3, n2) {
          t3.repository && t3.repository[e3] && u([t3.repository[e3]], t3, n2);
        }
        function l(e3, t3) {
          e3.selfGrammar.patterns && Array.isArray(e3.selfGrammar.patterns) && u(e3.selfGrammar.patterns, { ...e3, repository: e3.selfGrammar.repository }, t3), e3.selfGrammar.injections && u(Object.values(e3.selfGrammar.injections), { ...e3, repository: e3.selfGrammar.repository }, t3);
        }
        function u(e3, t3, n2) {
          for (const o2 of e3) {
            if (n2.visitedRule.has(o2)) continue;
            n2.visitedRule.add(o2);
            const e4 = o2.repository ? s.mergeObjects({}, t3.repository, o2.repository) : t3.repository;
            Array.isArray(o2.patterns) && u(o2.patterns, { ...t3, repository: e4 }, n2);
            const a2 = o2.include;
            if (!a2) continue;
            const h2 = g(a2);
            switch (h2.kind) {
              case 0:
                l({ ...t3, selfGrammar: t3.baseGrammar }, n2);
                break;
              case 1:
                l(t3, n2);
                break;
              case 2:
                c(h2.ruleName, { ...t3, repository: e4 }, n2);
                break;
              case 3:
              case 4:
                const s2 = h2.scopeName === t3.selfGrammar.scopeName ? t3.selfGrammar : h2.scopeName === t3.baseGrammar.scopeName ? t3.baseGrammar : void 0;
                if (s2) {
                  const r2 = { baseGrammar: t3.baseGrammar, selfGrammar: s2, repository: e4 };
                  4 === h2.kind ? c(h2.ruleName, r2, n2) : l(r2, n2);
                } else 4 === h2.kind ? n2.add(new i2(h2.scopeName, h2.ruleName)) : n2.add(new r(h2.scopeName));
            }
          }
        }
        t2.ExternalReferenceCollector = o, t2.ScopeDependencyProcessor = class {
          constructor(e3, t3) {
            this.repo = e3, this.initialScopeName = t3, this.seenFullScopeRequests = /* @__PURE__ */ new Set(), this.seenPartialScopeRequests = /* @__PURE__ */ new Set(), this.seenFullScopeRequests.add(this.initialScopeName), this.Q = [new r(this.initialScopeName)];
          }
          processQueue() {
            const e3 = this.Q;
            this.Q = [];
            const t3 = new o();
            for (const n2 of e3) a(n2, this.initialScopeName, this.repo, t3);
            for (const e4 of t3.references) if (e4 instanceof r) {
              if (this.seenFullScopeRequests.has(e4.scopeName)) continue;
              this.seenFullScopeRequests.add(e4.scopeName), this.Q.push(e4);
            } else {
              if (this.seenFullScopeRequests.has(e4.scopeName)) continue;
              if (this.seenPartialScopeRequests.has(e4.toKey())) continue;
              this.seenPartialScopeRequests.add(e4.toKey()), this.Q.push(e4);
            }
          }
        };
        class h {
          constructor() {
            this.kind = 0;
          }
        }
        t2.BaseReference = h;
        class p {
          constructor() {
            this.kind = 1;
          }
        }
        t2.SelfReference = p;
        class d {
          constructor(e3) {
            this.ruleName = e3, this.kind = 2;
          }
        }
        t2.RelativeReference = d;
        class f {
          constructor(e3) {
            this.scopeName = e3, this.kind = 3;
          }
        }
        t2.TopLevelReference = f;
        class m {
          constructor(e3, t3) {
            this.scopeName = e3, this.ruleName = t3, this.kind = 4;
          }
        }
        function g(e3) {
          if ("$base" === e3) return new h();
          if ("$self" === e3) return new p();
          const t3 = e3.indexOf("#");
          if (-1 === t3) return new f(e3);
          if (0 === t3) return new d(e3.substring(1));
          {
            const n2 = e3.substring(0, t3), s2 = e3.substring(t3 + 1);
            return new m(n2, s2);
          }
        }
        t2.TopLevelRepositoryReference = m, t2.parseInclude = g;
      }, 752: function(e2, t2, n) {
        var s = this && this.__createBinding || (Object.create ? function(e3, t3, n2, s2) {
          void 0 === s2 && (s2 = n2), Object.defineProperty(e3, s2, { enumerable: true, get: function() {
            return t3[n2];
          } });
        } : function(e3, t3, n2, s2) {
          void 0 === s2 && (s2 = n2), e3[s2] = t3[n2];
        }), r = this && this.__exportStar || function(e3, t3) {
          for (var n2 in e3) "default" === n2 || Object.prototype.hasOwnProperty.call(t3, n2) || s(t3, e3, n2);
        };
        Object.defineProperty(t2, "__esModule", { value: true }), r(n(929), t2);
      }, 398: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.LocalStackElement = t2._tokenizeString = void 0;
        const s = n(185), r = n(810), i2 = n(666), o = n(807);
        class a {
          constructor(e3, t3) {
            this.stack = e3, this.stoppedEarly = t3;
          }
        }
        function c(e3, t3, n2, r2, c2, h2, d2, f, m) {
          const g = (e4, t4) => {
            h2.produce(e4, t4), d2.produce(e4, t4);
          }, _ = t3.content.length;
          let b = false, y = -1;
          if (f) {
            const o2 = function(e4, t4, n3, r3, o3, a2, c3) {
              const l2 = (e5, t5) => {
                a2.produce(e5, t5), c3.produce(e5, t5);
              };
              let h3 = o3.beginRuleCapturedEOL ? 0 : -1;
              const d3 = [];
              for (let t5 = o3; t5; t5 = t5.pop()) {
                const n4 = t5.getRule(e4);
                n4 instanceof i2.BeginWhileRule && d3.push({ rule: n4, stack: t5 });
              }
              for (let f2 = d3.pop(); f2; f2 = d3.pop()) {
                const { ruleScanner: d4, findOptions: m2 } = u(f2.rule, e4, f2.stack.endRule, n3, r3 === h3), g2 = d4.findNextMatchSync(t4, r3, m2);
                if (s.DebugFlags.InDebugMode && (console.log("  scanning for while rule"), console.log(d4.toString())), !g2) {
                  s.DebugFlags.InDebugMode && console.log("  popping " + f2.rule.debugName + " - " + f2.rule.debugWhileRegExp), o3 = f2.stack.pop();
                  break;
                }
                if (g2.ruleId !== i2.whileRuleId) {
                  o3 = f2.stack.pop();
                  break;
                }
                g2.captureIndices && g2.captureIndices.length && (l2(f2.stack, g2.captureIndices[0].start), p(e4, t4, n3, f2.stack, a2, c3, f2.rule.whileCaptures, g2.captureIndices), l2(f2.stack, g2.captureIndices[0].end), h3 = g2.captureIndices[0].end, g2.captureIndices[0].end > r3 && (r3 = g2.captureIndices[0].end, n3 = false));
              }
              return { stack: o3, linePos: r3, anchorPosition: h3, isFirstLine: n3 };
            }(e3, t3, n2, r2, c2, h2, d2);
            c2 = o2.stack, r2 = o2.linePos, n2 = o2.isFirstLine, y = o2.anchorPosition;
          }
          const S = Date.now();
          for (; !b; ) {
            if (0 !== m && Date.now() - S > m) return new a(c2, true);
            k();
          }
          return new a(c2, false);
          function k() {
            s.DebugFlags.InDebugMode && (console.log(""), console.log(`@@scanNext ${r2}: |${t3.content.substr(r2).replace(/\n$/, "\\n")}|`));
            const a2 = function(e4, t4, n3, r3, i3, a3) {
              const c3 = function(e5, t5, n4, r4, i4, a4) {
                const c4 = i4.getRule(e5), { ruleScanner: u4, findOptions: h4 } = l(c4, e5, i4.endRule, n4, r4 === a4);
                let p3 = 0;
                s.DebugFlags.InDebugMode && (p3 = o.performanceNow());
                const d4 = u4.findNextMatchSync(t5, r4, h4);
                if (s.DebugFlags.InDebugMode) {
                  const e6 = o.performanceNow() - p3;
                  e6 > 5 && console.warn(`Rule ${c4.debugName} (${c4.id}) matching took ${e6} against '${t5}'`), console.log(`  scanning for (linePos: ${r4}, anchorPosition: ${a4})`), console.log(u4.toString()), d4 && console.log(`matched rule id: ${d4.ruleId} from ${d4.captureIndices[0].start} to ${d4.captureIndices[0].end}`);
                }
                return d4 ? { captureIndices: d4.captureIndices, matchedRuleId: d4.ruleId } : null;
              }(e4, t4, n3, r3, i3, a3), u3 = e4.getInjections();
              if (0 === u3.length) return c3;
              const h3 = function(e5, t5, n4, r4, i4, o2, a4) {
                let c4, u4 = Number.MAX_VALUE, h4 = null, p3 = 0;
                const d4 = o2.contentNameScopesList.getScopeNames();
                for (let o3 = 0, f3 = e5.length; o3 < f3; o3++) {
                  const f4 = e5[o3];
                  if (!f4.matcher(d4)) continue;
                  const m3 = t5.getRule(f4.ruleId), { ruleScanner: g2, findOptions: _2 } = l(m3, t5, null, r4, i4 === a4), b2 = g2.findNextMatchSync(n4, i4, _2);
                  if (!b2) continue;
                  s.DebugFlags.InDebugMode && (console.log(`  matched injection: ${f4.debugSelector}`), console.log(g2.toString()));
                  const y2 = b2.captureIndices[0].start;
                  if (!(y2 >= u4) && (u4 = y2, h4 = b2.captureIndices, c4 = b2.ruleId, p3 = f4.priority, u4 === i4)) break;
                }
                return h4 ? { priorityMatch: -1 === p3, captureIndices: h4, matchedRuleId: c4 } : null;
              }(u3, e4, t4, n3, r3, i3, a3);
              if (!h3) return c3;
              if (!c3) return h3;
              const p2 = c3.captureIndices[0].start, d3 = h3.captureIndices[0].start;
              return d3 < p2 || h3.priorityMatch && d3 === p2 ? h3 : c3;
            }(e3, t3, n2, r2, c2, y);
            if (!a2) return s.DebugFlags.InDebugMode && console.log("  no more matches."), g(c2, _), void (b = true);
            const u2 = a2.captureIndices, f2 = a2.matchedRuleId, m2 = !!(u2 && u2.length > 0) && u2[0].end > r2;
            if (f2 === i2.endRuleId) {
              const i3 = c2.getRule(e3);
              s.DebugFlags.InDebugMode && console.log("  popping " + i3.debugName + " - " + i3.debugEndRegExp), g(c2, u2[0].start), c2 = c2.withContentNameScopesList(c2.nameScopesList), p(e3, t3, n2, c2, h2, d2, i3.endCaptures, u2), g(c2, u2[0].end);
              const o2 = c2;
              if (c2 = c2.parent, y = o2.getAnchorPos(), !m2 && o2.getEnterPos() === r2) return s.DebugFlags.InDebugMode && console.error("[1] - Grammar is in an endless loop - Grammar pushed & popped a rule without advancing"), g(c2 = o2, _), void (b = true);
            } else {
              const o2 = e3.getRule(f2);
              g(c2, u2[0].start);
              const a3 = c2, l2 = o2.getName(t3.content, u2), S2 = c2.contentNameScopesList.pushAttributed(l2, e3);
              if (c2 = c2.push(f2, r2, y, u2[0].end === _, null, S2, S2), o2 instanceof i2.BeginEndRule) {
                const r3 = o2;
                s.DebugFlags.InDebugMode && console.log("  pushing " + r3.debugName + " - " + r3.debugBeginRegExp), p(e3, t3, n2, c2, h2, d2, r3.beginCaptures, u2), g(c2, u2[0].end), y = u2[0].end;
                const i3 = r3.getContentName(t3.content, u2), l3 = S2.pushAttributed(i3, e3);
                if (c2 = c2.withContentNameScopesList(l3), r3.endHasBackReferences && (c2 = c2.withEndRule(r3.getEndWithResolvedBackReferences(t3.content, u2))), !m2 && a3.hasSameRuleAs(c2)) return s.DebugFlags.InDebugMode && console.error("[2] - Grammar is in an endless loop - Grammar pushed the same rule without advancing"), c2 = c2.pop(), g(c2, _), void (b = true);
              } else if (o2 instanceof i2.BeginWhileRule) {
                const r3 = o2;
                s.DebugFlags.InDebugMode && console.log("  pushing " + r3.debugName), p(e3, t3, n2, c2, h2, d2, r3.beginCaptures, u2), g(c2, u2[0].end), y = u2[0].end;
                const i3 = r3.getContentName(t3.content, u2), l3 = S2.pushAttributed(i3, e3);
                if (c2 = c2.withContentNameScopesList(l3), r3.whileHasBackReferences && (c2 = c2.withEndRule(r3.getWhileWithResolvedBackReferences(t3.content, u2))), !m2 && a3.hasSameRuleAs(c2)) return s.DebugFlags.InDebugMode && console.error("[3] - Grammar is in an endless loop - Grammar pushed the same rule without advancing"), c2 = c2.pop(), g(c2, _), void (b = true);
              } else {
                const r3 = o2;
                if (s.DebugFlags.InDebugMode && console.log("  matched " + r3.debugName + " - " + r3.debugMatchRegExp), p(e3, t3, n2, c2, h2, d2, r3.captures, u2), g(c2, u2[0].end), c2 = c2.pop(), !m2) return s.DebugFlags.InDebugMode && console.error("[4] - Grammar is in an endless loop - Grammar is not advancing, nor is it pushing/popping"), c2 = c2.safePop(), g(c2, _), void (b = true);
              }
            }
            u2[0].end > r2 && (r2 = u2[0].end, n2 = false);
          }
        }
        function l(e3, t3, n2, r2, i3) {
          return s.UseOnigurumaFindOptions ? { ruleScanner: e3.compile(t3, n2), findOptions: h(r2, i3) } : { ruleScanner: e3.compileAG(t3, n2, r2, i3), findOptions: 0 };
        }
        function u(e3, t3, n2, r2, i3) {
          return s.UseOnigurumaFindOptions ? { ruleScanner: e3.compileWhile(t3, n2), findOptions: h(r2, i3) } : { ruleScanner: e3.compileWhileAG(t3, n2, r2, i3), findOptions: 0 };
        }
        function h(e3, t3) {
          let n2 = 0;
          return e3 || (n2 |= 1), t3 || (n2 |= 4), n2;
        }
        function p(e3, t3, n2, s2, i3, o2, a2, l2) {
          const u2 = (e4, t4) => {
            i3.produceFromScopes(e4, t4), o2.produceFromScopes(e4, t4);
          }, h2 = (e4, t4) => {
            i3.produce(e4, t4), o2.produce(e4, t4);
          };
          if (0 === a2.length) return;
          const p2 = t3.content, f = Math.min(a2.length, l2.length), m = [], g = l2[0].end;
          for (let t4 = 0; t4 < f; t4++) {
            const f2 = a2[t4];
            if (null === f2) continue;
            const _ = l2[t4];
            if (0 === _.length) continue;
            if (_.start > g) break;
            for (; m.length > 0 && m[m.length - 1].endPos <= _.start; ) u2(m[m.length - 1].scopes, m[m.length - 1].endPos), m.pop();
            if (m.length > 0 ? u2(m[m.length - 1].scopes, _.start) : h2(s2, _.start), f2.retokenizeCapturedWithRuleId) {
              const t5 = f2.getName(p2, l2), a3 = s2.contentNameScopesList.pushAttributed(t5, e3), u3 = f2.getContentName(p2, l2), h3 = a3.pushAttributed(u3, e3), d2 = s2.push(f2.retokenizeCapturedWithRuleId, _.start, -1, false, null, a3, h3), m2 = e3.createOnigString(p2.substring(0, _.end));
              c(e3, m2, n2 && 0 === _.start, _.start, d2, i3, o2, false, 0), r.disposeOnigString(m2);
              continue;
            }
            const b = f2.getName(p2, l2);
            if (null !== b) {
              const t5 = (m.length > 0 ? m[m.length - 1].scopes : s2.contentNameScopesList).pushAttributed(b, e3);
              m.push(new d(t5, _.end));
            }
          }
          for (; m.length > 0; ) u2(m[m.length - 1].scopes, m[m.length - 1].endPos), m.pop();
        }
        t2._tokenizeString = c;
        class d {
          constructor(e3, t3) {
            this.scopes = e3, this.endPos = t3;
          }
        }
        t2.LocalStackElement = d;
      }, 726: (e2, t2) => {
        function n(e3, t3) {
          throw new Error("Near offset " + e3.pos + ": " + t3 + " ~~~" + e3.source.substr(e3.pos, 50) + "~~~");
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.parseJSON = void 0, t2.parseJSON = function(e3, t3, o) {
          let a = new s(e3), c = new r(), l = 0, u = null, h = [], p = [];
          function d() {
            h.push(l), p.push(u);
          }
          function f() {
            l = h.pop(), u = p.pop();
          }
          function m(e4) {
            n(a, e4);
          }
          for (; i2(a, c); ) {
            if (0 === l) {
              if (null !== u && m("too many constructs in root"), 3 === c.type) {
                u = {}, o && (u.$vscodeTextmateLocation = c.toLocation(t3)), d(), l = 1;
                continue;
              }
              if (2 === c.type) {
                u = [], d(), l = 4;
                continue;
              }
              m("unexpected token in root");
            }
            if (2 === l) {
              if (5 === c.type) {
                f();
                continue;
              }
              if (7 === c.type) {
                l = 3;
                continue;
              }
              m("expected , or }");
            }
            if (1 === l || 3 === l) {
              if (1 === l && 5 === c.type) {
                f();
                continue;
              }
              if (1 === c.type) {
                let e4 = c.value;
                if (i2(a, c) && 6 === c.type || m("expected colon"), i2(a, c) || m("expected value"), l = 2, 1 === c.type) {
                  u[e4] = c.value;
                  continue;
                }
                if (8 === c.type) {
                  u[e4] = null;
                  continue;
                }
                if (9 === c.type) {
                  u[e4] = true;
                  continue;
                }
                if (10 === c.type) {
                  u[e4] = false;
                  continue;
                }
                if (11 === c.type) {
                  u[e4] = parseFloat(c.value);
                  continue;
                }
                if (2 === c.type) {
                  let t4 = [];
                  u[e4] = t4, d(), l = 4, u = t4;
                  continue;
                }
                if (3 === c.type) {
                  let n2 = {};
                  o && (n2.$vscodeTextmateLocation = c.toLocation(t3)), u[e4] = n2, d(), l = 1, u = n2;
                  continue;
                }
              }
              m("unexpected token in dict");
            }
            if (5 === l) {
              if (4 === c.type) {
                f();
                continue;
              }
              if (7 === c.type) {
                l = 6;
                continue;
              }
              m("expected , or ]");
            }
            if (4 === l || 6 === l) {
              if (4 === l && 4 === c.type) {
                f();
                continue;
              }
              if (l = 5, 1 === c.type) {
                u.push(c.value);
                continue;
              }
              if (8 === c.type) {
                u.push(null);
                continue;
              }
              if (9 === c.type) {
                u.push(true);
                continue;
              }
              if (10 === c.type) {
                u.push(false);
                continue;
              }
              if (11 === c.type) {
                u.push(parseFloat(c.value));
                continue;
              }
              if (2 === c.type) {
                let e4 = [];
                u.push(e4), d(), l = 4, u = e4;
                continue;
              }
              if (3 === c.type) {
                let e4 = {};
                o && (e4.$vscodeTextmateLocation = c.toLocation(t3)), u.push(e4), d(), l = 1, u = e4;
                continue;
              }
              m("unexpected token in array");
            }
            m("unknown state");
          }
          return 0 !== p.length && m("unclosed constructs"), u;
        };
        class s {
          constructor(e3) {
            this.source = e3, this.pos = 0, this.len = e3.length, this.line = 1, this.char = 0;
          }
        }
        class r {
          constructor() {
            this.value = null, this.type = 0, this.offset = -1, this.len = -1, this.line = -1, this.char = -1;
          }
          toLocation(e3) {
            return { filename: e3, line: this.line, char: this.char };
          }
        }
        function i2(e3, t3) {
          t3.value = null, t3.type = 0, t3.offset = -1, t3.len = -1, t3.line = -1, t3.char = -1;
          let s2, r2 = e3.source, i3 = e3.pos, o = e3.len, a = e3.line, c = e3.char;
          for (; ; ) {
            if (i3 >= o) return false;
            if (s2 = r2.charCodeAt(i3), 32 !== s2 && 9 !== s2 && 13 !== s2) {
              if (10 !== s2) break;
              i3++, a++, c = 0;
            } else i3++, c++;
          }
          if (t3.offset = i3, t3.line = a, t3.char = c, 34 === s2) {
            for (t3.type = 1, i3++, c++; ; ) {
              if (i3 >= o) return false;
              if (s2 = r2.charCodeAt(i3), i3++, c++, 92 !== s2) {
                if (34 === s2) break;
              } else i3++, c++;
            }
            t3.value = r2.substring(t3.offset + 1, i3 - 1).replace(/\\u([0-9A-Fa-f]{4})/g, (e4, t4) => String.fromCodePoint(parseInt(t4, 16))).replace(/\\(.)/g, (t4, s3) => {
              switch (s3) {
                case '"':
                  return '"';
                case "\\":
                  return "\\";
                case "/":
                  return "/";
                case "b":
                  return "\b";
                case "f":
                  return "\f";
                case "n":
                  return "\n";
                case "r":
                  return "\r";
                case "t":
                  return "	";
                default:
                  n(e3, "invalid escape sequence");
              }
              throw new Error("unreachable");
            });
          } else if (91 === s2) t3.type = 2, i3++, c++;
          else if (123 === s2) t3.type = 3, i3++, c++;
          else if (93 === s2) t3.type = 4, i3++, c++;
          else if (125 === s2) t3.type = 5, i3++, c++;
          else if (58 === s2) t3.type = 6, i3++, c++;
          else if (44 === s2) t3.type = 7, i3++, c++;
          else if (110 === s2) {
            if (t3.type = 8, i3++, c++, s2 = r2.charCodeAt(i3), 117 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 108 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 108 !== s2) return false;
            i3++, c++;
          } else if (116 === s2) {
            if (t3.type = 9, i3++, c++, s2 = r2.charCodeAt(i3), 114 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 117 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 101 !== s2) return false;
            i3++, c++;
          } else if (102 === s2) {
            if (t3.type = 10, i3++, c++, s2 = r2.charCodeAt(i3), 97 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 108 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 115 !== s2) return false;
            if (i3++, c++, s2 = r2.charCodeAt(i3), 101 !== s2) return false;
            i3++, c++;
          } else for (t3.type = 11; ; ) {
            if (i3 >= o) return false;
            if (s2 = r2.charCodeAt(i3), !(46 === s2 || s2 >= 48 && s2 <= 57 || 101 === s2 || 69 === s2 || 45 === s2 || 43 === s2)) break;
            i3++, c++;
          }
          return t3.len = i3 - t3.offset, null === t3.value && (t3.value = r2.substr(t3.offset, t3.len)), e3.pos = i3, e3.line = a, e3.char = c, true;
        }
      }, 625: function(e2, t2, n) {
        var s = this && this.__createBinding || (Object.create ? function(e3, t3, n2, s2) {
          void 0 === s2 && (s2 = n2), Object.defineProperty(e3, s2, { enumerable: true, get: function() {
            return t3[n2];
          } });
        } : function(e3, t3, n2, s2) {
          void 0 === s2 && (s2 = n2), e3[s2] = t3[n2];
        }), r = this && this.__exportStar || function(e3, t3) {
          for (var n2 in e3) "default" === n2 || Object.prototype.hasOwnProperty.call(t3, n2) || s(t3, e3, n2);
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.applyStateStackDiff = t2.diffStateStacksRefEq = t2.parseRawGrammar = t2.INITIAL = t2.Registry = void 0;
        const i2 = n(752), o = n(150), a = n(583), c = n(63), l = n(784), u = n(151);
        Object.defineProperty(t2, "applyStateStackDiff", { enumerable: true, get: function() {
          return u.applyStateStackDiff;
        } }), Object.defineProperty(t2, "diffStateStacksRefEq", { enumerable: true, get: function() {
          return u.diffStateStacksRefEq;
        } }), r(n(810), t2), t2.Registry = class {
          constructor(e3) {
            this._options = e3, this._syncRegistry = new a.SyncRegistry(c.Theme.createFromRawTheme(e3.theme, e3.colorMap), e3.onigLib), this._ensureGrammarCache = /* @__PURE__ */ new Map();
          }
          dispose() {
            this._syncRegistry.dispose();
          }
          setTheme(e3, t3) {
            this._syncRegistry.setTheme(c.Theme.createFromRawTheme(e3, t3));
          }
          getColorMap() {
            return this._syncRegistry.getColorMap();
          }
          loadGrammarWithEmbeddedLanguages(e3, t3, n2) {
            return this.loadGrammarWithConfiguration(e3, t3, { embeddedLanguages: n2 });
          }
          loadGrammarWithConfiguration(e3, t3, n2) {
            return this._loadGrammar(e3, t3, n2.embeddedLanguages, n2.tokenTypes, new i2.BalancedBracketSelectors(n2.balancedBracketSelectors || [], n2.unbalancedBracketSelectors || []));
          }
          loadGrammar(e3) {
            return this._loadGrammar(e3, 0, null, null, null);
          }
          async _loadGrammar(e3, t3, n2, s2, r2) {
            const i3 = new l.ScopeDependencyProcessor(this._syncRegistry, e3);
            for (; i3.Q.length > 0; ) await Promise.all(i3.Q.map((e4) => this._loadSingleGrammar(e4.scopeName))), i3.processQueue();
            return this._grammarForScopeName(e3, t3, n2, s2, r2);
          }
          async _loadSingleGrammar(e3) {
            return this._ensureGrammarCache.has(e3) || this._ensureGrammarCache.set(e3, this._doLoadSingleGrammar(e3)), this._ensureGrammarCache.get(e3);
          }
          async _doLoadSingleGrammar(e3) {
            const t3 = await this._options.loadGrammar(e3);
            if (t3) {
              const n2 = "function" == typeof this._options.getInjections ? this._options.getInjections(e3) : void 0;
              this._syncRegistry.addGrammar(t3, n2);
            }
          }
          async addGrammar(e3, t3 = [], n2 = 0, s2 = null) {
            return this._syncRegistry.addGrammar(e3, t3), await this._grammarForScopeName(e3.scopeName, n2, s2);
          }
          _grammarForScopeName(e3, t3 = 0, n2 = null, s2 = null, r2 = null) {
            return this._syncRegistry.grammarForScopeName(e3, t3, n2, s2, r2);
          }
        }, t2.INITIAL = i2.StateStackImpl.NULL, t2.parseRawGrammar = o.parseRawGrammar;
      }, 916: (e2, t2) => {
        function n(e3) {
          return !!e3 && !!e3.match(/[\w\.:]+/);
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createMatchers = void 0, t2.createMatchers = function(e3, t3) {
          const s = [], r = function(e4) {
            let t4 = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g, n2 = t4.exec(e4);
            return { next: () => {
              if (!n2) return null;
              const s2 = n2[0];
              return n2 = t4.exec(e4), s2;
            } };
          }(e3);
          let i2 = r.next();
          for (; null !== i2; ) {
            let e4 = 0;
            if (2 === i2.length && ":" === i2.charAt(1)) {
              switch (i2.charAt(0)) {
                case "R":
                  e4 = 1;
                  break;
                case "L":
                  e4 = -1;
                  break;
                default:
                  console.log(`Unknown priority ${i2} in scope selector`);
              }
              i2 = r.next();
            }
            let t4 = a();
            if (s.push({ matcher: t4, priority: e4 }), "," !== i2) break;
            i2 = r.next();
          }
          return s;
          function o() {
            if ("-" === i2) {
              i2 = r.next();
              const e4 = o();
              return (t4) => !!e4 && !e4(t4);
            }
            if ("(" === i2) {
              i2 = r.next();
              const e4 = function() {
                const e5 = [];
                let t4 = a();
                for (; t4 && (e5.push(t4), "|" === i2 || "," === i2); ) {
                  do {
                    i2 = r.next();
                  } while ("|" === i2 || "," === i2);
                  t4 = a();
                }
                return (t5) => e5.some((e6) => e6(t5));
              }();
              return ")" === i2 && (i2 = r.next()), e4;
            }
            if (n(i2)) {
              const e4 = [];
              do {
                e4.push(i2), i2 = r.next();
              } while (n(i2));
              return (n2) => t3(e4, n2);
            }
            return null;
          }
          function a() {
            const e4 = [];
            let t4 = o();
            for (; t4; ) e4.push(t4), t4 = o();
            return (t5) => e4.every((e5) => e5(t5));
          }
        };
      }, 810: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.disposeOnigString = void 0, t2.disposeOnigString = function(e3) {
          "function" == typeof e3.dispose && e3.dispose();
        };
      }, 150: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.parseRawGrammar = void 0;
        const s = n(578), r = n(185), i2 = n(726);
        t2.parseRawGrammar = function(e3, t3 = null) {
          return null !== t3 && /\.json$/.test(t3) ? (n2 = e3, o = t3, r.DebugFlags.InDebugMode ? i2.parseJSON(n2, o, true) : JSON.parse(n2)) : function(e4, t4) {
            return r.DebugFlags.InDebugMode ? s.parseWithLocation(e4, t4, "$vscodeTextmateLocation") : s.parsePLIST(e4);
          }(e3, t3);
          var n2, o;
        };
      }, 578: (e2, t2) => {
        function n(e3, t3, n2) {
          const s = e3.length;
          let r = 0, i2 = 1, o = 0;
          function a(t4) {
            if (null === n2) r += t4;
            else for (; t4 > 0; ) 10 === e3.charCodeAt(r) ? (r++, i2++, o = 0) : (r++, o++), t4--;
          }
          function c(e4) {
            null === n2 ? r = e4 : a(e4 - r);
          }
          function l() {
            for (; r < s; ) {
              let t4 = e3.charCodeAt(r);
              if (32 !== t4 && 9 !== t4 && 13 !== t4 && 10 !== t4) break;
              a(1);
            }
          }
          function u(t4) {
            return e3.substr(r, t4.length) === t4 && (a(t4.length), true);
          }
          function h(t4) {
            let n3 = e3.indexOf(t4, r);
            c(-1 !== n3 ? n3 + t4.length : s);
          }
          function p(t4) {
            let n3 = e3.indexOf(t4, r);
            if (-1 !== n3) {
              let s2 = e3.substring(r, n3);
              return c(n3 + t4.length), s2;
            }
            {
              let t5 = e3.substr(r);
              return c(s), t5;
            }
          }
          s > 0 && 65279 === e3.charCodeAt(0) && (r = 1);
          let d = 0, f = null, m = [], g = [], _ = null;
          function b(e4, t4) {
            m.push(d), g.push(f), d = e4, f = t4;
          }
          function y() {
            if (0 === m.length) return S("illegal state stack");
            d = m.pop(), f = g.pop();
          }
          function S(t4) {
            throw new Error("Near offset " + r + ": " + t4 + " ~~~" + e3.substr(r, 50) + "~~~");
          }
          const k = function() {
            if (null === _) return S("missing <key>");
            let e4 = {};
            null !== n2 && (e4[n2] = { filename: t3, line: i2, char: o }), f[_] = e4, _ = null, b(1, e4);
          }, C2 = function() {
            if (null === _) return S("missing <key>");
            let e4 = [];
            f[_] = e4, _ = null, b(2, e4);
          }, R = function() {
            let e4 = {};
            null !== n2 && (e4[n2] = { filename: t3, line: i2, char: o }), f.push(e4), b(1, e4);
          }, A = function() {
            let e4 = [];
            f.push(e4), b(2, e4);
          };
          function w() {
            if (1 !== d) return S("unexpected </dict>");
            y();
          }
          function I() {
            return 1 === d || 2 !== d ? S("unexpected </array>") : void y();
          }
          function P(e4) {
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function v(e4) {
            if (isNaN(e4)) return S("cannot parse float");
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function x(e4) {
            if (isNaN(e4)) return S("cannot parse integer");
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function N(e4) {
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function E(e4) {
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function F(e4) {
            if (1 === d) {
              if (null === _) return S("missing <key>");
              f[_] = e4, _ = null;
            } else 2 === d ? f.push(e4) : f = e4;
          }
          function T() {
            let e4 = p(">"), t4 = false;
            return 47 === e4.charCodeAt(e4.length - 1) && (t4 = true, e4 = e4.substring(0, e4.length - 1)), { name: e4.trim(), isClosed: t4 };
          }
          function D(e4) {
            if (e4.isClosed) return "";
            let t4 = p("</");
            return h(">"), t4.replace(/&#([0-9]+);/g, function(e5, t5) {
              return String.fromCodePoint(parseInt(t5, 10));
            }).replace(/&#x([0-9a-f]+);/g, function(e5, t5) {
              return String.fromCodePoint(parseInt(t5, 16));
            }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function(e5) {
              switch (e5) {
                case "&amp;":
                  return "&";
                case "&lt;":
                  return "<";
                case "&gt;":
                  return ">";
                case "&quot;":
                  return '"';
                case "&apos;":
                  return "'";
              }
              return e5;
            });
          }
          for (; r < s && (l(), !(r >= s)); ) {
            const c2 = e3.charCodeAt(r);
            if (a(1), 60 !== c2) return S("expected <");
            if (r >= s) return S("unexpected end of input");
            const p2 = e3.charCodeAt(r);
            if (63 === p2) {
              a(1), h("?>");
              continue;
            }
            if (33 === p2) {
              if (a(1), u("--")) {
                h("-->");
                continue;
              }
              h(">");
              continue;
            }
            if (47 === p2) {
              if (a(1), l(), u("plist")) {
                h(">");
                continue;
              }
              if (u("dict")) {
                h(">"), w();
                continue;
              }
              if (u("array")) {
                h(">"), I();
                continue;
              }
              return S("unexpected closed tag");
            }
            let m2 = T();
            switch (m2.name) {
              case "dict":
                1 === d ? k() : 2 === d ? R() : (f = {}, null !== n2 && (f[n2] = { filename: t3, line: i2, char: o }), b(1, f)), m2.isClosed && w();
                continue;
              case "array":
                1 === d ? C2() : 2 === d ? A() : (f = [], b(2, f)), m2.isClosed && I();
                continue;
              case "key":
                G = D(m2), 1 !== d ? S("unexpected <key>") : null !== _ ? S("too many <key>") : _ = G;
                continue;
              case "string":
                P(D(m2));
                continue;
              case "real":
                v(parseFloat(D(m2)));
                continue;
              case "integer":
                x(parseInt(D(m2), 10));
                continue;
              case "date":
                N(new Date(D(m2)));
                continue;
              case "data":
                E(D(m2));
                continue;
              case "true":
                D(m2), F(true);
                continue;
              case "false":
                D(m2), F(false);
                continue;
            }
            if (!/^plist/.test(m2.name)) return S("unexpected opened tag " + m2.name);
          }
          var G;
          return f;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.parsePLIST = t2.parseWithLocation = void 0, t2.parseWithLocation = function(e3, t3, s) {
          return n(e3, t3, s);
        }, t2.parsePLIST = function(e3) {
          return n(e3, null, null);
        };
      }, 583: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SyncRegistry = void 0;
        const s = n(752);
        t2.SyncRegistry = class {
          constructor(e3, t3) {
            this._onigLibPromise = t3, this._grammars = /* @__PURE__ */ new Map(), this._rawGrammars = /* @__PURE__ */ new Map(), this._injectionGrammars = /* @__PURE__ */ new Map(), this._theme = e3;
          }
          dispose() {
            for (const e3 of this._grammars.values()) e3.dispose();
          }
          setTheme(e3) {
            this._theme = e3;
          }
          getColorMap() {
            return this._theme.getColorMap();
          }
          addGrammar(e3, t3) {
            this._rawGrammars.set(e3.scopeName, e3), t3 && this._injectionGrammars.set(e3.scopeName, t3);
          }
          lookup(e3) {
            return this._rawGrammars.get(e3);
          }
          injections(e3) {
            return this._injectionGrammars.get(e3);
          }
          getDefaults() {
            return this._theme.getDefaults();
          }
          themeMatch(e3) {
            return this._theme.match(e3);
          }
          async grammarForScopeName(e3, t3, n2, r, i2) {
            if (!this._grammars.has(e3)) {
              let o = this._rawGrammars.get(e3);
              if (!o) return null;
              this._grammars.set(e3, s.createGrammar(e3, o, t3, n2, r, i2, this, await this._onigLibPromise));
            }
            return this._grammars.get(e3);
          }
        };
      }, 666: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CompiledRule = t2.RegExpSourceList = t2.RegExpSource = t2.RuleFactory = t2.BeginWhileRule = t2.BeginEndRule = t2.IncludeOnlyRule = t2.MatchRule = t2.CaptureRule = t2.Rule = t2.ruleIdToNumber = t2.ruleIdFromNumber = t2.whileRuleId = t2.endRuleId = void 0;
        const s = n(807), r = n(784), i2 = /\\(\d+)/, o = /\\(\d+)/g;
        Symbol("RuleId"), t2.endRuleId = -1, t2.whileRuleId = -2, t2.ruleIdFromNumber = function(e3) {
          return e3;
        }, t2.ruleIdToNumber = function(e3) {
          return e3;
        };
        class a {
          constructor(e3, t3, n2, r2) {
            this.$location = e3, this.id = t3, this._name = n2 || null, this._nameIsCapturing = s.RegexSource.hasCaptures(this._name), this._contentName = r2 || null, this._contentNameIsCapturing = s.RegexSource.hasCaptures(this._contentName);
          }
          get debugName() {
            const e3 = this.$location ? `${s.basename(this.$location.filename)}:${this.$location.line}` : "unknown";
            return `${this.constructor.name}#${this.id} @ ${e3}`;
          }
          getName(e3, t3) {
            return this._nameIsCapturing && null !== this._name && null !== e3 && null !== t3 ? s.RegexSource.replaceCaptures(this._name, e3, t3) : this._name;
          }
          getContentName(e3, t3) {
            return this._contentNameIsCapturing && null !== this._contentName ? s.RegexSource.replaceCaptures(this._contentName, e3, t3) : this._contentName;
          }
        }
        t2.Rule = a;
        class c extends a {
          constructor(e3, t3, n2, s2, r2) {
            super(e3, t3, n2, s2), this.retokenizeCapturedWithRuleId = r2;
          }
          dispose() {
          }
          collectPatterns(e3, t3) {
            throw new Error("Not supported!");
          }
          compile(e3, t3) {
            throw new Error("Not supported!");
          }
          compileAG(e3, t3, n2, s2) {
            throw new Error("Not supported!");
          }
        }
        t2.CaptureRule = c;
        class l extends a {
          constructor(e3, t3, n2, s2, r2) {
            super(e3, t3, n2, null), this._match = new f(s2, this.id), this.captures = r2, this._cachedCompiledPatterns = null;
          }
          dispose() {
            this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
          }
          get debugMatchRegExp() {
            return `${this._match.source}`;
          }
          collectPatterns(e3, t3) {
            t3.push(this._match);
          }
          compile(e3, t3) {
            return this._getCachedCompiledPatterns(e3).compile(e3);
          }
          compileAG(e3, t3, n2, s2) {
            return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
          }
          _getCachedCompiledPatterns(e3) {
            return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new m(), this.collectPatterns(e3, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
          }
        }
        t2.MatchRule = l;
        class u extends a {
          constructor(e3, t3, n2, s2, r2) {
            super(e3, t3, n2, s2), this.patterns = r2.patterns, this.hasMissingPatterns = r2.hasMissingPatterns, this._cachedCompiledPatterns = null;
          }
          dispose() {
            this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
          }
          collectPatterns(e3, t3) {
            for (const n2 of this.patterns) e3.getRule(n2).collectPatterns(e3, t3);
          }
          compile(e3, t3) {
            return this._getCachedCompiledPatterns(e3).compile(e3);
          }
          compileAG(e3, t3, n2, s2) {
            return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
          }
          _getCachedCompiledPatterns(e3) {
            return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new m(), this.collectPatterns(e3, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
          }
        }
        t2.IncludeOnlyRule = u;
        class h extends a {
          constructor(e3, t3, n2, s2, r2, i3, o2, a2, c2, l2) {
            super(e3, t3, n2, s2), this._begin = new f(r2, this.id), this.beginCaptures = i3, this._end = new f(o2 || "\uFFFF", -1), this.endHasBackReferences = this._end.hasBackReferences, this.endCaptures = a2, this.applyEndPatternLast = c2 || false, this.patterns = l2.patterns, this.hasMissingPatterns = l2.hasMissingPatterns, this._cachedCompiledPatterns = null;
          }
          dispose() {
            this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
          }
          get debugBeginRegExp() {
            return `${this._begin.source}`;
          }
          get debugEndRegExp() {
            return `${this._end.source}`;
          }
          getEndWithResolvedBackReferences(e3, t3) {
            return this._end.resolveBackReferences(e3, t3);
          }
          collectPatterns(e3, t3) {
            t3.push(this._begin);
          }
          compile(e3, t3) {
            return this._getCachedCompiledPatterns(e3, t3).compile(e3);
          }
          compileAG(e3, t3, n2, s2) {
            return this._getCachedCompiledPatterns(e3, t3).compileAG(e3, n2, s2);
          }
          _getCachedCompiledPatterns(e3, t3) {
            if (!this._cachedCompiledPatterns) {
              this._cachedCompiledPatterns = new m();
              for (const t4 of this.patterns) e3.getRule(t4).collectPatterns(e3, this._cachedCompiledPatterns);
              this.applyEndPatternLast ? this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end) : this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
            }
            return this._end.hasBackReferences && (this.applyEndPatternLast ? this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, t3) : this._cachedCompiledPatterns.setSource(0, t3)), this._cachedCompiledPatterns;
          }
        }
        t2.BeginEndRule = h;
        class p extends a {
          constructor(e3, n2, s2, r2, i3, o2, a2, c2, l2) {
            super(e3, n2, s2, r2), this._begin = new f(i3, this.id), this.beginCaptures = o2, this.whileCaptures = c2, this._while = new f(a2, t2.whileRuleId), this.whileHasBackReferences = this._while.hasBackReferences, this.patterns = l2.patterns, this.hasMissingPatterns = l2.hasMissingPatterns, this._cachedCompiledPatterns = null, this._cachedCompiledWhilePatterns = null;
          }
          dispose() {
            this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null), this._cachedCompiledWhilePatterns && (this._cachedCompiledWhilePatterns.dispose(), this._cachedCompiledWhilePatterns = null);
          }
          get debugBeginRegExp() {
            return `${this._begin.source}`;
          }
          get debugWhileRegExp() {
            return `${this._while.source}`;
          }
          getWhileWithResolvedBackReferences(e3, t3) {
            return this._while.resolveBackReferences(e3, t3);
          }
          collectPatterns(e3, t3) {
            t3.push(this._begin);
          }
          compile(e3, t3) {
            return this._getCachedCompiledPatterns(e3).compile(e3);
          }
          compileAG(e3, t3, n2, s2) {
            return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
          }
          _getCachedCompiledPatterns(e3) {
            if (!this._cachedCompiledPatterns) {
              this._cachedCompiledPatterns = new m();
              for (const t3 of this.patterns) e3.getRule(t3).collectPatterns(e3, this._cachedCompiledPatterns);
            }
            return this._cachedCompiledPatterns;
          }
          compileWhile(e3, t3) {
            return this._getCachedCompiledWhilePatterns(e3, t3).compile(e3);
          }
          compileWhileAG(e3, t3, n2, s2) {
            return this._getCachedCompiledWhilePatterns(e3, t3).compileAG(e3, n2, s2);
          }
          _getCachedCompiledWhilePatterns(e3, t3) {
            return this._cachedCompiledWhilePatterns || (this._cachedCompiledWhilePatterns = new m(), this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while)), this._while.hasBackReferences && this._cachedCompiledWhilePatterns.setSource(0, t3 || "\uFFFF"), this._cachedCompiledWhilePatterns;
          }
        }
        t2.BeginWhileRule = p;
        class d {
          static createCaptureRule(e3, t3, n2, s2, r2) {
            return e3.registerRule((e4) => new c(t3, e4, n2, s2, r2));
          }
          static getCompiledRuleId(e3, t3, n2) {
            return e3.id || t3.registerRule((r2) => {
              if (e3.id = r2, e3.match) return new l(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.match, d._compileCaptures(e3.captures, t3, n2));
              if (void 0 === e3.begin) {
                e3.repository && (n2 = s.mergeObjects({}, n2, e3.repository));
                let r3 = e3.patterns;
                return void 0 === r3 && e3.include && (r3 = [{ include: e3.include }]), new u(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, d._compilePatterns(r3, t3, n2));
              }
              return e3.while ? new p(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, e3.begin, d._compileCaptures(e3.beginCaptures || e3.captures, t3, n2), e3.while, d._compileCaptures(e3.whileCaptures || e3.captures, t3, n2), d._compilePatterns(e3.patterns, t3, n2)) : new h(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, e3.begin, d._compileCaptures(e3.beginCaptures || e3.captures, t3, n2), e3.end, d._compileCaptures(e3.endCaptures || e3.captures, t3, n2), e3.applyEndPatternLast, d._compilePatterns(e3.patterns, t3, n2));
            }), e3.id;
          }
          static _compileCaptures(e3, t3, n2) {
            let s2 = [];
            if (e3) {
              let r2 = 0;
              for (const t4 in e3) {
                if ("$vscodeTextmateLocation" === t4) continue;
                const e4 = parseInt(t4, 10);
                e4 > r2 && (r2 = e4);
              }
              for (let e4 = 0; e4 <= r2; e4++) s2[e4] = null;
              for (const r3 in e3) {
                if ("$vscodeTextmateLocation" === r3) continue;
                const i3 = parseInt(r3, 10);
                let o2 = 0;
                e3[r3].patterns && (o2 = d.getCompiledRuleId(e3[r3], t3, n2)), s2[i3] = d.createCaptureRule(t3, e3[r3].$vscodeTextmateLocation, e3[r3].name, e3[r3].contentName, o2);
              }
            }
            return s2;
          }
          static _compilePatterns(e3, t3, n2) {
            let s2 = [];
            if (e3) for (let i3 = 0, o2 = e3.length; i3 < o2; i3++) {
              const o3 = e3[i3];
              let a2 = -1;
              if (o3.include) {
                const e4 = r.parseInclude(o3.include);
                switch (e4.kind) {
                  case 0:
                  case 1:
                    a2 = d.getCompiledRuleId(n2[o3.include], t3, n2);
                    break;
                  case 2:
                    let s3 = n2[e4.ruleName];
                    s3 && (a2 = d.getCompiledRuleId(s3, t3, n2));
                    break;
                  case 3:
                  case 4:
                    const r2 = e4.scopeName, i4 = 4 === e4.kind ? e4.ruleName : null, c2 = t3.getExternalGrammar(r2, n2);
                    if (c2) if (i4) {
                      let e5 = c2.repository[i4];
                      e5 && (a2 = d.getCompiledRuleId(e5, t3, c2.repository));
                    } else a2 = d.getCompiledRuleId(c2.repository.$self, t3, c2.repository);
                }
              } else a2 = d.getCompiledRuleId(o3, t3, n2);
              if (-1 !== a2) {
                const e4 = t3.getRule(a2);
                let n3 = false;
                if ((e4 instanceof u || e4 instanceof h || e4 instanceof p) && e4.hasMissingPatterns && 0 === e4.patterns.length && (n3 = true), n3) continue;
                s2.push(a2);
              }
            }
            return { patterns: s2, hasMissingPatterns: (e3 ? e3.length : 0) !== s2.length };
          }
        }
        t2.RuleFactory = d;
        class f {
          constructor(e3, t3) {
            if (e3) {
              const t4 = e3.length;
              let n2 = 0, s2 = [], r2 = false;
              for (let i3 = 0; i3 < t4; i3++) if ("\\" === e3.charAt(i3) && i3 + 1 < t4) {
                const t5 = e3.charAt(i3 + 1);
                "z" === t5 ? (s2.push(e3.substring(n2, i3)), s2.push("$(?!\\n)(?<!\\n)"), n2 = i3 + 2) : "A" !== t5 && "G" !== t5 || (r2 = true), i3++;
              }
              this.hasAnchor = r2, 0 === n2 ? this.source = e3 : (s2.push(e3.substring(n2, t4)), this.source = s2.join(""));
            } else this.hasAnchor = false, this.source = e3;
            this.hasAnchor ? this._anchorCache = this._buildAnchorCache() : this._anchorCache = null, this.ruleId = t3, this.hasBackReferences = i2.test(this.source);
          }
          clone() {
            return new f(this.source, this.ruleId);
          }
          setSource(e3) {
            this.source !== e3 && (this.source = e3, this.hasAnchor && (this._anchorCache = this._buildAnchorCache()));
          }
          resolveBackReferences(e3, t3) {
            let n2 = t3.map((t4) => e3.substring(t4.start, t4.end));
            return o.lastIndex = 0, this.source.replace(o, (e4, t4) => s.escapeRegExpCharacters(n2[parseInt(t4, 10)] || ""));
          }
          _buildAnchorCache() {
            let e3, t3, n2, s2, r2 = [], i3 = [], o2 = [], a2 = [];
            for (e3 = 0, t3 = this.source.length; e3 < t3; e3++) n2 = this.source.charAt(e3), r2[e3] = n2, i3[e3] = n2, o2[e3] = n2, a2[e3] = n2, "\\" === n2 && e3 + 1 < t3 && (s2 = this.source.charAt(e3 + 1), "A" === s2 ? (r2[e3 + 1] = "\uFFFF", i3[e3 + 1] = "\uFFFF", o2[e3 + 1] = "A", a2[e3 + 1] = "A") : "G" === s2 ? (r2[e3 + 1] = "\uFFFF", i3[e3 + 1] = "G", o2[e3 + 1] = "\uFFFF", a2[e3 + 1] = "G") : (r2[e3 + 1] = s2, i3[e3 + 1] = s2, o2[e3 + 1] = s2, a2[e3 + 1] = s2), e3++);
            return { A0_G0: r2.join(""), A0_G1: i3.join(""), A1_G0: o2.join(""), A1_G1: a2.join("") };
          }
          resolveAnchors(e3, t3) {
            return this.hasAnchor && this._anchorCache ? e3 ? t3 ? this._anchorCache.A1_G1 : this._anchorCache.A1_G0 : t3 ? this._anchorCache.A0_G1 : this._anchorCache.A0_G0 : this.source;
          }
        }
        t2.RegExpSource = f;
        class m {
          constructor() {
            this._items = [], this._hasAnchors = false, this._cached = null, this._anchorCache = { A0_G0: null, A0_G1: null, A1_G0: null, A1_G1: null };
          }
          dispose() {
            this._disposeCaches();
          }
          _disposeCaches() {
            this._cached && (this._cached.dispose(), this._cached = null), this._anchorCache.A0_G0 && (this._anchorCache.A0_G0.dispose(), this._anchorCache.A0_G0 = null), this._anchorCache.A0_G1 && (this._anchorCache.A0_G1.dispose(), this._anchorCache.A0_G1 = null), this._anchorCache.A1_G0 && (this._anchorCache.A1_G0.dispose(), this._anchorCache.A1_G0 = null), this._anchorCache.A1_G1 && (this._anchorCache.A1_G1.dispose(), this._anchorCache.A1_G1 = null);
          }
          push(e3) {
            this._items.push(e3), this._hasAnchors = this._hasAnchors || e3.hasAnchor;
          }
          unshift(e3) {
            this._items.unshift(e3), this._hasAnchors = this._hasAnchors || e3.hasAnchor;
          }
          length() {
            return this._items.length;
          }
          setSource(e3, t3) {
            this._items[e3].source !== t3 && (this._disposeCaches(), this._items[e3].setSource(t3));
          }
          compile(e3) {
            if (!this._cached) {
              let t3 = this._items.map((e4) => e4.source);
              this._cached = new g(e3, t3, this._items.map((e4) => e4.ruleId));
            }
            return this._cached;
          }
          compileAG(e3, t3, n2) {
            return this._hasAnchors ? t3 ? n2 ? (this._anchorCache.A1_G1 || (this._anchorCache.A1_G1 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A1_G1) : (this._anchorCache.A1_G0 || (this._anchorCache.A1_G0 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A1_G0) : n2 ? (this._anchorCache.A0_G1 || (this._anchorCache.A0_G1 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A0_G1) : (this._anchorCache.A0_G0 || (this._anchorCache.A0_G0 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A0_G0) : this.compile(e3);
          }
          _resolveAnchors(e3, t3, n2) {
            let s2 = this._items.map((e4) => e4.resolveAnchors(t3, n2));
            return new g(e3, s2, this._items.map((e4) => e4.ruleId));
          }
        }
        t2.RegExpSourceList = m;
        class g {
          constructor(e3, t3, n2) {
            this.regExps = t3, this.rules = n2, this.scanner = e3.createOnigScanner(t3);
          }
          dispose() {
            "function" == typeof this.scanner.dispose && this.scanner.dispose();
          }
          toString() {
            const e3 = [];
            for (let t3 = 0, n2 = this.rules.length; t3 < n2; t3++) e3.push("   - " + this.rules[t3] + ": " + this.regExps[t3]);
            return e3.join("\n");
          }
          findNextMatchSync(e3, t3, n2) {
            const s2 = this.scanner.findNextMatchSync(e3, t3, n2);
            return s2 ? { ruleId: this.rules[s2.index], captureIndices: s2.captureIndices } : null;
          }
        }
        t2.CompiledRule = g;
      }, 63: (e2, t2, n) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ThemeTrieElement = t2.ThemeTrieElementRule = t2.ColorMap = t2.fontStyleToString = t2.ParsedThemeRule = t2.parseTheme = t2.StyleAttributes = t2.ScopeStack = t2.Theme = void 0;
        const s = n(807);
        class r {
          constructor(e3, t3, n2) {
            this._colorMap = e3, this._defaults = t3, this._root = n2, this._cachedMatchRoot = new s.CachedFn((e4) => this._root.match(e4));
          }
          static createFromRawTheme(e3, t3) {
            return this.createFromParsedTheme(c(e3), t3);
          }
          static createFromParsedTheme(e3, t3) {
            return function(e4, t4) {
              e4.sort((e5, t5) => {
                let n3 = s.strcmp(e5.scope, t5.scope);
                return 0 !== n3 ? n3 : (n3 = s.strArrCmp(e5.parentScopes, t5.parentScopes), 0 !== n3 ? n3 : e5.index - t5.index);
              });
              let n2 = 0, i3 = "#000000", o2 = "#ffffff", c2 = "", l2 = 0, h2 = 0;
              for (; e4.length >= 1 && "" === e4[0].scope; ) {
                let t5 = e4.shift();
                -1 !== t5.fontStyle && (n2 = t5.fontStyle), null !== t5.foreground && (i3 = t5.foreground), null !== t5.background && (o2 = t5.background), null !== t5.fontFamily && (c2 = t5.fontFamily), null !== t5.fontSize && (l2 = t5.fontSize), null !== t5.lineHeight && (h2 = t5.lineHeight);
              }
              let f = new u(t4), m = new a(n2, f.getId(i3), f.getId(o2), c2, l2, h2), g = new d(new p(0, null, -1, 0, 0, c2, l2, h2), []);
              for (let t5 = 0, n3 = e4.length; t5 < n3; t5++) {
                let n4 = e4[t5];
                g.insert(0, n4.scope, n4.parentScopes, n4.fontStyle, f.getId(n4.foreground), f.getId(n4.background), n4.fontFamily, n4.fontSize, n4.lineHeight);
              }
              return new r(f, m, g);
            }(e3, t3);
          }
          getColorMap() {
            return this._colorMap.getColorMap();
          }
          getDefaults() {
            return this._defaults;
          }
          match(e3) {
            if (null === e3) return this._defaults;
            const t3 = e3.scopeName, n2 = this._cachedMatchRoot.get(t3).find((t4) => function(e4, t5) {
              if (0 === t5.length) return true;
              for (let n3 = 0; n3 < t5.length; n3++) {
                let s2 = t5[n3], r2 = false;
                if (">" === s2) {
                  if (n3 === t5.length - 1) return false;
                  s2 = t5[++n3], r2 = true;
                }
                for (; e4 && !o(e4.scopeName, s2); ) {
                  if (r2) return false;
                  e4 = e4.parent;
                }
                if (!e4) return false;
                e4 = e4.parent;
              }
              return true;
            }(e3.parent, t4.parentScopes));
            return n2 ? new a(n2.fontStyle, n2.foreground, n2.background, n2.fontFamily, n2.fontSize, n2.lineHeight) : null;
          }
        }
        t2.Theme = r;
        class i2 {
          constructor(e3, t3) {
            this.parent = e3, this.scopeName = t3;
          }
          static push(e3, t3) {
            for (const n2 of t3) e3 = new i2(e3, n2);
            return e3;
          }
          static from(...e3) {
            let t3 = null;
            for (let n2 = 0; n2 < e3.length; n2++) t3 = new i2(t3, e3[n2]);
            return t3;
          }
          push(e3) {
            return new i2(this, e3);
          }
          getSegments() {
            let e3 = this;
            const t3 = [];
            for (; e3; ) t3.push(e3.scopeName), e3 = e3.parent;
            return t3.reverse(), t3;
          }
          toString() {
            return this.getSegments().join(" ");
          }
          extends(e3) {
            return this === e3 || null !== this.parent && this.parent.extends(e3);
          }
          getExtensionIfDefined(e3) {
            const t3 = [];
            let n2 = this;
            for (; n2 && n2 !== e3; ) t3.push(n2.scopeName), n2 = n2.parent;
            return n2 === e3 ? t3.reverse() : void 0;
          }
        }
        function o(e3, t3) {
          return t3 === e3 || e3.startsWith(t3) && "." === e3[t3.length];
        }
        t2.ScopeStack = i2;
        class a {
          constructor(e3, t3, n2, s2, r2, i3) {
            this.fontStyle = e3, this.foregroundId = t3, this.backgroundId = n2, this.fontFamily = s2, this.fontSize = r2, this.lineHeight = i3;
          }
        }
        function c(e3) {
          if (!e3) return [];
          if (!e3.settings || !Array.isArray(e3.settings)) return [];
          let t3 = e3.settings, n2 = [], r2 = 0;
          for (let e4 = 0, i3 = t3.length; e4 < i3; e4++) {
            let i4, o2 = t3[e4];
            if (!o2.settings) continue;
            if ("string" == typeof o2.scope) {
              let e5 = o2.scope;
              e5 = e5.replace(/^[,]+/, ""), e5 = e5.replace(/[,]+$/, ""), i4 = e5.split(",");
            } else i4 = Array.isArray(o2.scope) ? o2.scope : [""];
            let a2 = -1;
            if ("string" == typeof o2.settings.fontStyle) {
              a2 = 0;
              let e5 = o2.settings.fontStyle.split(" ");
              for (let t4 = 0, n3 = e5.length; t4 < n3; t4++) switch (e5[t4]) {
                case "italic":
                  a2 |= 1;
                  break;
                case "bold":
                  a2 |= 2;
                  break;
                case "underline":
                  a2 |= 4;
                  break;
                case "strikethrough":
                  a2 |= 8;
              }
            }
            let c2 = null;
            "string" == typeof o2.settings.foreground && s.isValidHexColor(o2.settings.foreground) && (c2 = o2.settings.foreground);
            let u2 = null;
            "string" == typeof o2.settings.background && s.isValidHexColor(o2.settings.background) && (u2 = o2.settings.background);
            let h2 = "";
            "string" == typeof o2.settings.fontFamily && (h2 = o2.settings.fontFamily);
            let p2 = 0;
            "number" == typeof o2.settings.fontSize && (p2 = o2.settings.fontSize);
            let d2 = 0;
            "number" == typeof o2.settings.lineHeight && (d2 = o2.settings.lineHeight);
            for (let t4 = 0, s2 = i4.length; t4 < s2; t4++) {
              let s3 = i4[t4].trim().split(" "), o3 = s3[s3.length - 1], f = null;
              s3.length > 1 && (f = s3.slice(0, s3.length - 1), f.reverse()), n2[r2++] = new l(o3, f, e4, a2, c2, u2, h2, p2, d2);
            }
          }
          return n2;
        }
        t2.StyleAttributes = a, t2.parseTheme = c;
        class l {
          constructor(e3, t3, n2, s2, r2, i3, o2, a2, c2) {
            this.scope = e3, this.parentScopes = t3, this.index = n2, this.fontStyle = s2, this.foreground = r2, this.background = i3, this.fontFamily = o2, this.fontSize = a2, this.lineHeight = c2;
          }
        }
        t2.ParsedThemeRule = l, t2.fontStyleToString = function(e3) {
          if (-1 === e3) return "not set";
          let t3 = "";
          return 1 & e3 && (t3 += "italic "), 2 & e3 && (t3 += "bold "), 4 & e3 && (t3 += "underline "), 8 & e3 && (t3 += "strikethrough "), "" === t3 && (t3 = "none"), t3.trim();
        };
        class u {
          constructor(e3) {
            if (this._lastColorId = 0, this._id2color = [], this._color2id = /* @__PURE__ */ Object.create(null), Array.isArray(e3)) {
              this._isFrozen = true;
              for (let t3 = 0, n2 = e3.length; t3 < n2; t3++) this._color2id[e3[t3]] = t3, this._id2color[t3] = e3[t3];
            } else this._isFrozen = false;
          }
          getId(e3) {
            if (null === e3) return 0;
            e3 = e3.toUpperCase();
            let t3 = this._color2id[e3];
            if (t3) return t3;
            if (this._isFrozen) throw new Error(`Missing color in color map - ${e3}`);
            return t3 = ++this._lastColorId, this._color2id[e3] = t3, this._id2color[t3] = e3, t3;
          }
          getColorMap() {
            return this._id2color.slice(0);
          }
        }
        t2.ColorMap = u;
        const h = Object.freeze([]);
        class p {
          constructor(e3, t3, n2, s2, r2, i3, o2, a2) {
            this.scopeDepth = e3, this.parentScopes = t3 || h, this.fontStyle = n2, this.foreground = s2, this.background = r2, this.fontFamily = i3, this.fontSize = o2, this.lineHeight = a2;
          }
          clone() {
            return new p(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background, this.fontFamily, this.fontSize, this.lineHeight);
          }
          static cloneArr(e3) {
            let t3 = [];
            for (let n2 = 0, s2 = e3.length; n2 < s2; n2++) t3[n2] = e3[n2].clone();
            return t3;
          }
          acceptOverwrite(e3, t3, n2, s2, r2, i3, o2) {
            this.scopeDepth > e3 ? console.log("how did this happen?") : this.scopeDepth = e3, -1 !== t3 && (this.fontStyle = t3), 0 !== n2 && (this.foreground = n2), 0 !== s2 && (this.background = s2), "" !== r2 && (this.fontFamily = r2), 0 !== i3 && (this.fontSize = i3), 0 !== o2 && (this.lineHeight = o2);
          }
        }
        t2.ThemeTrieElementRule = p;
        class d {
          constructor(e3, t3 = [], n2 = {}) {
            this._mainRule = e3, this._children = n2, this._rulesWithParentScopes = t3;
          }
          static _cmpBySpecificity(e3, t3) {
            if (e3.scopeDepth !== t3.scopeDepth) return t3.scopeDepth - e3.scopeDepth;
            let n2 = 0, s2 = 0;
            for (; ">" === e3.parentScopes[n2] && n2++, ">" === t3.parentScopes[s2] && s2++, !(n2 >= e3.parentScopes.length || s2 >= t3.parentScopes.length); ) {
              const r2 = t3.parentScopes[s2].length - e3.parentScopes[n2].length;
              if (0 !== r2) return r2;
              n2++, s2++;
            }
            return t3.parentScopes.length - e3.parentScopes.length;
          }
          match(e3) {
            if ("" !== e3) {
              let t4, n2, s2 = e3.indexOf(".");
              if (-1 === s2 ? (t4 = e3, n2 = "") : (t4 = e3.substring(0, s2), n2 = e3.substring(s2 + 1)), this._children.hasOwnProperty(t4)) return this._children[t4].match(n2);
            }
            const t3 = this._rulesWithParentScopes.concat(this._mainRule);
            return t3.sort(d._cmpBySpecificity), t3;
          }
          insert(e3, t3, n2, s2, r2, i3, o2, a2, c2) {
            if ("" === t3) return void this._doInsertHere(e3, n2, s2, r2, i3, o2, a2, c2);
            let l2, u2, h2, f = t3.indexOf(".");
            -1 === f ? (l2 = t3, u2 = "") : (l2 = t3.substring(0, f), u2 = t3.substring(f + 1)), this._children.hasOwnProperty(l2) ? h2 = this._children[l2] : (h2 = new d(this._mainRule.clone(), p.cloneArr(this._rulesWithParentScopes)), this._children[l2] = h2), h2.insert(e3 + 1, u2, n2, s2, r2, i3, o2, a2, c2);
          }
          _doInsertHere(e3, t3, n2, r2, i3, o2, a2, c2) {
            if (null !== t3) {
              for (let l2 = 0, u2 = this._rulesWithParentScopes.length; l2 < u2; l2++) {
                let u3 = this._rulesWithParentScopes[l2];
                if (0 === s.strArrCmp(u3.parentScopes, t3)) return void u3.acceptOverwrite(e3, n2, r2, i3, o2, a2, c2);
              }
              -1 === n2 && (n2 = this._mainRule.fontStyle), 0 === r2 && (r2 = this._mainRule.foreground), 0 === i3 && (i3 = this._mainRule.background), "" === o2 && (o2 = this._mainRule.fontFamily), 0 === a2 && (a2 = this._mainRule.fontSize), 0 === c2 && (c2 = this._mainRule.lineHeight), this._rulesWithParentScopes.push(new p(e3, t3, n2, r2, i3, o2, a2, c2));
            } else this._mainRule.acceptOverwrite(e3, n2, r2, i3, o2, a2, c2);
          }
        }
        t2.ThemeTrieElement = d;
      }, 807: (e2, t2) => {
        function n(e3) {
          return Array.isArray(e3) ? function(e4) {
            let t3 = [];
            for (let s2 = 0, r2 = e4.length; s2 < r2; s2++) t3[s2] = n(e4[s2]);
            return t3;
          }(e3) : "object" == typeof e3 ? function(e4) {
            let t3 = {};
            for (let s2 in e4) t3[s2] = n(e4[s2]);
            return t3;
          }(e3) : e3;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.containsRTL = t2.performanceNow = t2.CachedFn = t2.escapeRegExpCharacters = t2.isValidHexColor = t2.strArrCmp = t2.strcmp = t2.RegexSource = t2.basename = t2.mergeObjects = t2.clone = void 0, t2.clone = function(e3) {
          return n(e3);
        }, t2.mergeObjects = function(e3, ...t3) {
          return t3.forEach((t4) => {
            for (let n2 in t4) e3[n2] = t4[n2];
          }), e3;
        }, t2.basename = function e3(t3) {
          const n2 = ~t3.lastIndexOf("/") || ~t3.lastIndexOf("\\");
          return 0 === n2 ? t3 : ~n2 == t3.length - 1 ? e3(t3.substring(0, t3.length - 1)) : t3.substr(1 + ~n2);
        };
        let s, r = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g;
        function i2(e3, t3) {
          return e3 < t3 ? -1 : e3 > t3 ? 1 : 0;
        }
        t2.RegexSource = class {
          static hasCaptures(e3) {
            return null !== e3 && (r.lastIndex = 0, r.test(e3));
          }
          static replaceCaptures(e3, t3, n2) {
            return e3.replace(r, (e4, s2, r2, i3) => {
              let o = n2[parseInt(s2 || r2, 10)];
              if (!o) return e4;
              {
                let e5 = t3.substring(o.start, o.end);
                for (; "." === e5[0]; ) e5 = e5.substring(1);
                switch (i3) {
                  case "downcase":
                    return e5.toLowerCase();
                  case "upcase":
                    return e5.toUpperCase();
                  default:
                    return e5;
                }
              }
            });
          }
        }, t2.strcmp = i2, t2.strArrCmp = function(e3, t3) {
          if (null === e3 && null === t3) return 0;
          if (!e3) return -1;
          if (!t3) return 1;
          let n2 = e3.length, s2 = t3.length;
          if (n2 === s2) {
            for (let s3 = 0; s3 < n2; s3++) {
              let n3 = i2(e3[s3], t3[s3]);
              if (0 !== n3) return n3;
            }
            return 0;
          }
          return n2 - s2;
        }, t2.isValidHexColor = function(e3) {
          return !!(/^#[0-9a-f]{6}$/i.test(e3) || /^#[0-9a-f]{8}$/i.test(e3) || /^#[0-9a-f]{3}$/i.test(e3) || /^#[0-9a-f]{4}$/i.test(e3));
        }, t2.escapeRegExpCharacters = function(e3) {
          return e3.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
        }, t2.CachedFn = class {
          constructor(e3) {
            this.fn = e3, this.cache = /* @__PURE__ */ new Map();
          }
          get(e3) {
            if (this.cache.has(e3)) return this.cache.get(e3);
            const t3 = this.fn(e3);
            return this.cache.set(e3, t3), t3;
          }
        }, t2.performanceNow = "undefined" == typeof performance ? function() {
          return Date.now();
        } : function() {
          return performance.now();
        }, t2.containsRTL = function(e3) {
          return s || (s = /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA\u07FE-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u088E\u08A0-\u08C9\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDC7\uFDF0-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE35\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDD23\uDE80-\uDEA9\uDEAD-\uDF45\uDF51-\uDF81\uDF86-\uDFF6]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD4B-\uDFFF]|\uD83B[\uDC00-\uDEBB])/), s.test(e3);
        };
      } }, t = {};
      return function n(s) {
        var r = t[s];
        if (void 0 !== r) return r.exports;
        var i2 = t[s] = { exports: {} };
        return e[s].call(i2.exports, i2, i2.exports, n), i2.exports;
      }(625);
    })());
  }
});

// ../core/dist/paths.js
var require_paths = __commonJS({
  "../core/dist/paths.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.findModuleRoot = findModuleRoot2;
    exports2.resolveFromModuleRoot = resolveFromModuleRoot;
    exports2.treeSitterWasmsDir = treeSitterWasmsDir;
    var fs3 = __importStar(require("node:fs"));
    var path4 = __importStar(require("node:path"));
    function findModuleRoot2(startDir) {
      let dir = path4.resolve(startDir);
      const vendor = path4.join(dir, "vendor");
      if (fs3.existsSync(vendor)) {
        return vendor;
      }
      while (true) {
        const nm = path4.join(dir, "node_modules");
        if (fs3.existsSync(nm)) {
          return nm;
        }
        const parent = path4.dirname(dir);
        if (parent === dir) {
          return void 0;
        }
        dir = parent;
      }
    }
    function resolveFromModuleRoot(moduleRoot, pkgPath) {
      if (moduleRoot) {
        const candidate = path4.join(moduleRoot, pkgPath);
        if (fs3.existsSync(candidate)) {
          return candidate;
        }
      }
      return require.resolve(pkgPath);
    }
    function treeSitterWasmsDir(moduleRoot) {
      if (moduleRoot) {
        const candidate = path4.join(moduleRoot, "tree-sitter-wasms");
        if (fs3.existsSync(candidate)) {
          return candidate;
        }
      }
      return path4.dirname(require.resolve("tree-sitter-wasms/package.json"));
    }
  }
});

// ../../node_modules/vscode-oniguruma/release/main.js
var require_main2 = __commonJS({
  "../../node_modules/vscode-oniguruma/release/main.js"(exports2, module2) {
    !function(e, t) {
      "object" == typeof exports2 && "object" == typeof module2 ? module2.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports2 ? exports2.onig = t() : e.onig = t();
    }(exports2, () => {
      return e = { 770: function(e2, t2, n) {
        "use strict";
        var r = this && this.__importDefault || function(e3) {
          return e3 && e3.__esModule ? e3 : { default: e3 };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.setDefaultDebugCall = t2.createOnigScanner = t2.createOnigString = t2.loadWASM = t2.OnigScanner = t2.OnigString = void 0;
        const i2 = r(n(418));
        let o = null, a = false;
        class s {
          static _utf8ByteLength(e3) {
            let t3 = 0;
            for (let n2 = 0, r2 = e3.length; n2 < r2; n2++) {
              const i3 = e3.charCodeAt(n2);
              let o2 = i3, a2 = false;
              if (i3 >= 55296 && i3 <= 56319 && n2 + 1 < r2) {
                const t4 = e3.charCodeAt(n2 + 1);
                t4 >= 56320 && t4 <= 57343 && (o2 = 65536 + (i3 - 55296 << 10) | t4 - 56320, a2 = true);
              }
              t3 += o2 <= 127 ? 1 : o2 <= 2047 ? 2 : o2 <= 65535 ? 3 : 4, a2 && n2++;
            }
            return t3;
          }
          constructor(e3) {
            const t3 = e3.length, n2 = s._utf8ByteLength(e3), r2 = n2 !== t3, i3 = r2 ? new Uint32Array(t3 + 1) : null;
            r2 && (i3[t3] = n2);
            const o2 = r2 ? new Uint32Array(n2 + 1) : null;
            r2 && (o2[n2] = t3);
            const a2 = new Uint8Array(n2);
            let f2 = 0;
            for (let n3 = 0; n3 < t3; n3++) {
              const s2 = e3.charCodeAt(n3);
              let u2 = s2, c2 = false;
              if (s2 >= 55296 && s2 <= 56319 && n3 + 1 < t3) {
                const t4 = e3.charCodeAt(n3 + 1);
                t4 >= 56320 && t4 <= 57343 && (u2 = 65536 + (s2 - 55296 << 10) | t4 - 56320, c2 = true);
              }
              r2 && (i3[n3] = f2, c2 && (i3[n3 + 1] = f2), u2 <= 127 ? o2[f2 + 0] = n3 : u2 <= 2047 ? (o2[f2 + 0] = n3, o2[f2 + 1] = n3) : u2 <= 65535 ? (o2[f2 + 0] = n3, o2[f2 + 1] = n3, o2[f2 + 2] = n3) : (o2[f2 + 0] = n3, o2[f2 + 1] = n3, o2[f2 + 2] = n3, o2[f2 + 3] = n3)), u2 <= 127 ? a2[f2++] = u2 : u2 <= 2047 ? (a2[f2++] = 192 | (1984 & u2) >>> 6, a2[f2++] = 128 | (63 & u2) >>> 0) : u2 <= 65535 ? (a2[f2++] = 224 | (61440 & u2) >>> 12, a2[f2++] = 128 | (4032 & u2) >>> 6, a2[f2++] = 128 | (63 & u2) >>> 0) : (a2[f2++] = 240 | (1835008 & u2) >>> 18, a2[f2++] = 128 | (258048 & u2) >>> 12, a2[f2++] = 128 | (4032 & u2) >>> 6, a2[f2++] = 128 | (63 & u2) >>> 0), c2 && n3++;
            }
            this.utf16Length = t3, this.utf8Length = n2, this.utf16Value = e3, this.utf8Value = a2, this.utf16OffsetToUtf8 = i3, this.utf8OffsetToUtf16 = o2;
          }
          createString(e3) {
            const t3 = e3._omalloc(this.utf8Length);
            return e3.HEAPU8.set(this.utf8Value, t3), t3;
          }
        }
        class f {
          constructor(e3) {
            if (this.id = ++f.LAST_ID, !o) throw new Error("Must invoke loadWASM first.");
            this._onigBinding = o, this.content = e3;
            const t3 = new s(e3);
            this.utf16Length = t3.utf16Length, this.utf8Length = t3.utf8Length, this.utf16OffsetToUtf8 = t3.utf16OffsetToUtf8, this.utf8OffsetToUtf16 = t3.utf8OffsetToUtf16, this.utf8Length < 1e4 && !f._sharedPtrInUse ? (f._sharedPtr || (f._sharedPtr = o._omalloc(1e4)), f._sharedPtrInUse = true, o.HEAPU8.set(t3.utf8Value, f._sharedPtr), this.ptr = f._sharedPtr) : this.ptr = t3.createString(o);
          }
          convertUtf8OffsetToUtf16(e3) {
            return this.utf8OffsetToUtf16 ? e3 < 0 ? 0 : e3 > this.utf8Length ? this.utf16Length : this.utf8OffsetToUtf16[e3] : e3;
          }
          convertUtf16OffsetToUtf8(e3) {
            return this.utf16OffsetToUtf8 ? e3 < 0 ? 0 : e3 > this.utf16Length ? this.utf8Length : this.utf16OffsetToUtf8[e3] : e3;
          }
          dispose() {
            this.ptr === f._sharedPtr ? f._sharedPtrInUse = false : this._onigBinding._ofree(this.ptr);
          }
        }
        t2.OnigString = f, f.LAST_ID = 0, f._sharedPtr = 0, f._sharedPtrInUse = false;
        class u {
          constructor(e3, t3) {
            var n2, r2;
            if (!o) throw new Error("Must invoke loadWASM first.");
            const i3 = [], a2 = [];
            for (let t4 = 0, n3 = e3.length; t4 < n3; t4++) {
              const n4 = new s(e3[t4]);
              i3[t4] = n4.createString(o), a2[t4] = n4.utf8Length;
            }
            const f2 = o._omalloc(4 * e3.length);
            o.HEAPU32.set(i3, f2 / 4);
            const u2 = o._omalloc(4 * e3.length);
            o.HEAPU32.set(a2, u2 / 4), this._onigBinding = o, this._options = null !== (n2 = null == t3 ? void 0 : t3.options) && void 0 !== n2 ? n2 : [10];
            const c2 = this.onigOptions(this._options), _2 = this.onigSyntax(null !== (r2 = null == t3 ? void 0 : t3.syntax) && void 0 !== r2 ? r2 : 0), d = o._createOnigScanner(f2, u2, e3.length, c2, _2);
            this._ptr = d;
            for (let t4 = 0, n3 = e3.length; t4 < n3; t4++) o._ofree(i3[t4]);
            o._ofree(u2), o._ofree(f2), 0 === d && function(e4) {
              throw new Error(e4.UTF8ToString(e4._getLastOnigError()));
            }(o);
          }
          dispose() {
            this._onigBinding._freeOnigScanner(this._ptr);
          }
          findNextMatchSync(e3, t3, n2) {
            let r2 = a, i3 = this._options;
            if (Array.isArray(n2) ? (n2.includes(25) && (r2 = true), i3 = i3.concat(n2)) : "boolean" == typeof n2 && (r2 = n2), "string" == typeof e3) {
              e3 = new f(e3);
              const n3 = this._findNextMatchSync(e3, t3, r2, i3);
              return e3.dispose(), n3;
            }
            return this._findNextMatchSync(e3, t3, r2, i3);
          }
          _findNextMatchSync(e3, t3, n2, r2) {
            const i3 = this._onigBinding, o2 = this.onigOptions(r2);
            let a2;
            if (a2 = n2 ? i3._findNextOnigScannerMatchDbg(this._ptr, e3.id, e3.ptr, e3.utf8Length, e3.convertUtf16OffsetToUtf8(t3), o2) : i3._findNextOnigScannerMatch(this._ptr, e3.id, e3.ptr, e3.utf8Length, e3.convertUtf16OffsetToUtf8(t3), o2), 0 === a2) return null;
            const s2 = i3.HEAPU32;
            let f2 = a2 / 4;
            const u2 = s2[f2++], c2 = s2[f2++];
            let _2 = [];
            for (let t4 = 0; t4 < c2; t4++) {
              const n3 = e3.convertUtf8OffsetToUtf16(s2[f2++]), r3 = e3.convertUtf8OffsetToUtf16(s2[f2++]);
              _2[t4] = { start: n3, end: r3, length: r3 - n3 };
            }
            return { index: u2, captureIndices: _2 };
          }
          onigOptions(e3) {
            return e3.map((e4) => this.onigOption(e4)).reduce((e4, t3) => e4 | t3, this._onigBinding.ONIG_OPTION_NONE);
          }
          onigSyntax(e3) {
            switch (e3) {
              case 0:
                return this._onigBinding.ONIG_SYNTAX_DEFAULT;
              case 1:
                return this._onigBinding.ONIG_SYNTAX_ASIS;
              case 2:
                return this._onigBinding.ONIG_SYNTAX_POSIX_BASIC;
              case 3:
                return this._onigBinding.ONIG_SYNTAX_POSIX_EXTENDED;
              case 4:
                return this._onigBinding.ONIG_SYNTAX_EMACS;
              case 5:
                return this._onigBinding.ONIG_SYNTAX_GREP;
              case 6:
                return this._onigBinding.ONIG_SYNTAX_GNU_REGEX;
              case 7:
                return this._onigBinding.ONIG_SYNTAX_JAVA;
              case 8:
                return this._onigBinding.ONIG_SYNTAX_PERL;
              case 9:
                return this._onigBinding.ONIG_SYNTAX_PERL_NG;
              case 10:
                return this._onigBinding.ONIG_SYNTAX_RUBY;
              case 11:
                return this._onigBinding.ONIG_SYNTAX_PYTHON;
              case 12:
                return this._onigBinding.ONIG_SYNTAX_ONIGURUMA;
            }
          }
          onigOption(e3) {
            switch (e3) {
              case 1:
                return this._onigBinding.ONIG_OPTION_NONE;
              case 0:
              case 25:
                return this._onigBinding.ONIG_OPTION_DEFAULT;
              case 2:
                return this._onigBinding.ONIG_OPTION_IGNORECASE;
              case 3:
                return this._onigBinding.ONIG_OPTION_EXTEND;
              case 4:
                return this._onigBinding.ONIG_OPTION_MULTILINE;
              case 5:
                return this._onigBinding.ONIG_OPTION_SINGLELINE;
              case 6:
                return this._onigBinding.ONIG_OPTION_FIND_LONGEST;
              case 7:
                return this._onigBinding.ONIG_OPTION_FIND_NOT_EMPTY;
              case 8:
                return this._onigBinding.ONIG_OPTION_NEGATE_SINGLELINE;
              case 9:
                return this._onigBinding.ONIG_OPTION_DONT_CAPTURE_GROUP;
              case 10:
                return this._onigBinding.ONIG_OPTION_CAPTURE_GROUP;
              case 11:
                return this._onigBinding.ONIG_OPTION_NOTBOL;
              case 12:
                return this._onigBinding.ONIG_OPTION_NOTEOL;
              case 13:
                return this._onigBinding.ONIG_OPTION_CHECK_VALIDITY_OF_STRING;
              case 14:
                return this._onigBinding.ONIG_OPTION_IGNORECASE_IS_ASCII;
              case 15:
                return this._onigBinding.ONIG_OPTION_WORD_IS_ASCII;
              case 16:
                return this._onigBinding.ONIG_OPTION_DIGIT_IS_ASCII;
              case 17:
                return this._onigBinding.ONIG_OPTION_SPACE_IS_ASCII;
              case 18:
                return this._onigBinding.ONIG_OPTION_POSIX_IS_ASCII;
              case 19:
                return this._onigBinding.ONIG_OPTION_TEXT_SEGMENT_EXTENDED_GRAPHEME_CLUSTER;
              case 20:
                return this._onigBinding.ONIG_OPTION_TEXT_SEGMENT_WORD;
              case 21:
                return this._onigBinding.ONIG_OPTION_NOT_BEGIN_STRING;
              case 22:
                return this._onigBinding.ONIG_OPTION_NOT_END_STRING;
              case 23:
                return this._onigBinding.ONIG_OPTION_NOT_BEGIN_POSITION;
              case 24:
                return this._onigBinding.ONIG_OPTION_CALLBACK_EACH_MATCH;
            }
          }
        }
        t2.OnigScanner = u;
        let c = false, _ = null;
        t2.loadWASM = function(e3) {
          if (c) return _;
          let t3, n2, r2, a2;
          if (c = true, function(e4) {
            return "function" == typeof e4.instantiator;
          }(e3)) t3 = e3.instantiator, n2 = e3.print;
          else {
            let r3;
            !function(e4) {
              return void 0 !== e4.data;
            }(e3) ? r3 = e3 : (r3 = e3.data, n2 = e3.print), t3 = function(e4) {
              return "undefined" != typeof Response && e4 instanceof Response;
            }(r3) ? "function" == typeof WebAssembly.instantiateStreaming ? /* @__PURE__ */ function(e4) {
              return (t4) => WebAssembly.instantiateStreaming(e4, t4);
            }(r3) : /* @__PURE__ */ function(e4) {
              return async (t4) => {
                const n3 = await e4.arrayBuffer();
                return WebAssembly.instantiate(n3, t4);
              };
            }(r3) : /* @__PURE__ */ function(e4) {
              return (t4) => WebAssembly.instantiate(e4, t4);
            }(r3);
          }
          return _ = new Promise((e4, t4) => {
            r2 = e4, a2 = t4;
          }), function(e4, t4, n3, r3) {
            (0, i2.default)({ print: t4, instantiateWasm: (t5, n4) => {
              if ("undefined" == typeof performance) {
                const e5 = () => Date.now();
                t5.env.emscripten_get_now = e5, t5.wasi_snapshot_preview1.emscripten_get_now = e5;
              }
              return e4(t5).then((e5) => n4(e5.instance), r3), {};
            } }).then((e5) => {
              o = e5, n3();
            });
          }(t3, n2, r2, a2), _;
        }, t2.createOnigString = function(e3) {
          return new f(e3);
        }, t2.createOnigScanner = function(e3) {
          return new u(e3);
        }, t2.setDefaultDebugCall = function(e3) {
          a = e3;
        };
      }, 418: (e2) => {
        var t2 = ("undefined" != typeof document && document.currentScript && document.currentScript.src, function(e3 = {}) {
          var t3, n, r = e3;
          r.ready = new Promise((e4, r2) => {
            t3 = e4, n = r2;
          });
          var i2, o = Object.assign({}, r);
          "undefined" != typeof read && read, i2 = (e4) => {
            if ("function" == typeof readbuffer) return new Uint8Array(readbuffer(e4));
            let t4 = read(e4, "binary");
            return "object" == typeof t4 || P(n2), t4;
            var n2;
          }, "undefined" == typeof clearTimeout && (globalThis.clearTimeout = (e4) => {
          }), "undefined" == typeof setTimeout && (globalThis.setTimeout = (e4) => "function" == typeof e4 ? e4() : P()), "undefined" != typeof scriptArgs && scriptArgs, "undefined" != typeof onig_print && ("undefined" == typeof console && (console = {}), console.log = onig_print, console.warn = console.error = "undefined" != typeof printErr ? printErr : onig_print);
          var a, s, f = r.print || console.log.bind(console), u = r.printErr || console.error.bind(console);
          Object.assign(r, o), o = null, r.arguments && r.arguments, r.thisProgram && r.thisProgram, r.quit && r.quit, r.wasmBinary && (a = r.wasmBinary), r.noExitRuntime, "object" != typeof WebAssembly && P("no native wasm support detected");
          var c, _, d, g, l, h, p, O, v = false;
          function m() {
            var e4 = s.buffer;
            r.HEAP8 = c = new Int8Array(e4), r.HEAP16 = d = new Int16Array(e4), r.HEAPU8 = _ = new Uint8Array(e4), r.HEAPU16 = g = new Uint16Array(e4), r.HEAP32 = l = new Int32Array(e4), r.HEAPU32 = h = new Uint32Array(e4), r.HEAPF32 = p = new Float32Array(e4), r.HEAPF64 = O = new Float64Array(e4);
          }
          var y = [], I = [], T = [];
          var N = 0, A = null, S = null;
          function P(e4) {
            r.onAbort && r.onAbort(e4), u(e4 = "Aborted(" + e4 + ")"), v = true, e4 += ". Build with -sASSERTIONS for more info.";
            var t4 = new WebAssembly.RuntimeError(e4);
            throw n(t4), t4;
          }
          var E, w;
          function b(e4) {
            return e4.startsWith("data:application/octet-stream;base64,");
          }
          function C2(e4) {
            if (e4 == E && a) return new Uint8Array(a);
            if (i2) return i2(e4);
            throw "both async and sync fetching of the wasm failed";
          }
          function U(e4, t4, n2) {
            return function(e5) {
              return Promise.resolve().then(() => C2(e5));
            }(e4).then((e5) => WebAssembly.instantiate(e5, t4)).then((e5) => e5).then(n2, (e5) => {
              u(`failed to asynchronously prepare wasm: ${e5}`), P(e5);
            });
          }
          b(E = "onig.wasm") || (w = E, E = r.locateFile ? r.locateFile(w, "") : "" + w);
          var G = (e4) => {
            for (; e4.length > 0; ) e4.shift()(r);
          }, B = void 0, R = (e4) => {
            for (var t4 = "", n2 = e4; _[n2]; ) t4 += B[_[n2++]];
            return t4;
          }, W = {}, L = {}, D = {}, x = void 0, M = (e4) => {
            throw new x(e4);
          }, F = void 0, X = (e4, t4, n2) => {
            function r2(t5) {
              var r3 = n2(t5);
              r3.length !== e4.length && ((e5) => {
                throw new F(e5);
              })("Mismatched type converter count");
              for (var i4 = 0; i4 < e4.length; ++i4) k(e4[i4], r3[i4]);
            }
            e4.forEach(function(e5) {
              D[e5] = t4;
            });
            var i3 = new Array(t4.length), o2 = [], a2 = 0;
            t4.forEach((e5, t5) => {
              L.hasOwnProperty(e5) ? i3[t5] = L[e5] : (o2.push(e5), W.hasOwnProperty(e5) || (W[e5] = []), W[e5].push(() => {
                i3[t5] = L[e5], ++a2 === o2.length && r2(i3);
              }));
            }), 0 === o2.length && r2(i3);
          };
          function k(e4, t4, n2 = {}) {
            if (!("argPackAdvance" in t4)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
            return function(e5, t5, n3 = {}) {
              var r2 = t5.name;
              if (e5 || M(`type "${r2}" must have a positive integer typeid pointer`), L.hasOwnProperty(e5)) {
                if (n3.ignoreDuplicateRegistrations) return;
                M(`Cannot register type '${r2}' twice`);
              }
              if (L[e5] = t5, delete D[e5], W.hasOwnProperty(e5)) {
                var i3 = W[e5];
                delete W[e5], i3.forEach((e6) => e6());
              }
            }(e4, t4, n2);
          }
          function H() {
            this.allocated = [void 0], this.freelist = [];
          }
          var Y = new H(), j = () => {
            for (var e4 = 0, t4 = Y.reserved; t4 < Y.allocated.length; ++t4) void 0 !== Y.allocated[t4] && ++e4;
            return e4;
          }, V = (e4) => (e4 || M("Cannot use deleted val. handle = " + e4), Y.get(e4).value), $ = (e4) => {
            switch (e4) {
              case void 0:
                return 1;
              case null:
                return 2;
              case true:
                return 3;
              case false:
                return 4;
              default:
                return Y.allocate({ refcount: 1, value: e4 });
            }
          };
          function z(e4) {
            return this.fromWireType(l[e4 >> 2]);
          }
          var q = (e4, t4) => {
            switch (t4) {
              case 4:
                return function(e5) {
                  return this.fromWireType(p[e5 >> 2]);
                };
              case 8:
                return function(e5) {
                  return this.fromWireType(O[e5 >> 3]);
                };
              default:
                throw new TypeError(`invalid float width (${t4}): ${e4}`);
            }
          }, K = (e4, t4, n2) => {
            switch (t4) {
              case 1:
                return n2 ? (e5) => c[e5 >> 0] : (e5) => _[e5 >> 0];
              case 2:
                return n2 ? (e5) => d[e5 >> 1] : (e5) => g[e5 >> 1];
              case 4:
                return n2 ? (e5) => l[e5 >> 2] : (e5) => h[e5 >> 2];
              default:
                throw new TypeError(`invalid integer width (${t4}): ${e4}`);
            }
          };
          function J(e4) {
            return this.fromWireType(h[e4 >> 2]);
          }
          var Q, Z = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ee = (e4, t4, n2) => {
            for (var r2 = t4 + n2, i3 = t4; e4[i3] && !(i3 >= r2); ) ++i3;
            if (i3 - t4 > 16 && e4.buffer && Z) return Z.decode(e4.subarray(t4, i3));
            for (var o2 = ""; t4 < i3; ) {
              var a2 = e4[t4++];
              if (128 & a2) {
                var s2 = 63 & e4[t4++];
                if (192 != (224 & a2)) {
                  var f2 = 63 & e4[t4++];
                  if ((a2 = 224 == (240 & a2) ? (15 & a2) << 12 | s2 << 6 | f2 : (7 & a2) << 18 | s2 << 12 | f2 << 6 | 63 & e4[t4++]) < 65536) o2 += String.fromCharCode(a2);
                  else {
                    var u2 = a2 - 65536;
                    o2 += String.fromCharCode(55296 | u2 >> 10, 56320 | 1023 & u2);
                  }
                } else o2 += String.fromCharCode((31 & a2) << 6 | s2);
              } else o2 += String.fromCharCode(a2);
            }
            return o2;
          }, te = (e4, t4) => e4 ? ee(_, e4, t4) : "", ne = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, re = (e4, t4) => {
            for (var n2 = e4, r2 = n2 >> 1, i3 = r2 + t4 / 2; !(r2 >= i3) && g[r2]; ) ++r2;
            if ((n2 = r2 << 1) - e4 > 32 && ne) return ne.decode(_.subarray(e4, n2));
            for (var o2 = "", a2 = 0; !(a2 >= t4 / 2); ++a2) {
              var s2 = d[e4 + 2 * a2 >> 1];
              if (0 == s2) break;
              o2 += String.fromCharCode(s2);
            }
            return o2;
          }, ie = (e4, t4, n2) => {
            if (void 0 === n2 && (n2 = 2147483647), n2 < 2) return 0;
            for (var r2 = t4, i3 = (n2 -= 2) < 2 * e4.length ? n2 / 2 : e4.length, o2 = 0; o2 < i3; ++o2) {
              var a2 = e4.charCodeAt(o2);
              d[t4 >> 1] = a2, t4 += 2;
            }
            return d[t4 >> 1] = 0, t4 - r2;
          }, oe = (e4) => 2 * e4.length, ae = (e4, t4) => {
            for (var n2 = 0, r2 = ""; !(n2 >= t4 / 4); ) {
              var i3 = l[e4 + 4 * n2 >> 2];
              if (0 == i3) break;
              if (++n2, i3 >= 65536) {
                var o2 = i3 - 65536;
                r2 += String.fromCharCode(55296 | o2 >> 10, 56320 | 1023 & o2);
              } else r2 += String.fromCharCode(i3);
            }
            return r2;
          }, se = (e4, t4, n2) => {
            if (void 0 === n2 && (n2 = 2147483647), n2 < 4) return 0;
            for (var r2 = t4, i3 = r2 + n2 - 4, o2 = 0; o2 < e4.length; ++o2) {
              var a2 = e4.charCodeAt(o2);
              if (a2 >= 55296 && a2 <= 57343 && (a2 = 65536 + ((1023 & a2) << 10) | 1023 & e4.charCodeAt(++o2)), l[t4 >> 2] = a2, (t4 += 4) + 4 > i3) break;
            }
            return l[t4 >> 2] = 0, t4 - r2;
          }, fe = (e4) => {
            for (var t4 = 0, n2 = 0; n2 < e4.length; ++n2) {
              var r2 = e4.charCodeAt(n2);
              r2 >= 55296 && r2 <= 57343 && ++n2, t4 += 4;
            }
            return t4;
          };
          Q = () => performance.now();
          var ue = (e4) => {
            var t4 = (e4 - s.buffer.byteLength + 65535) / 65536;
            try {
              return s.grow(t4), m(), 1;
            } catch (e5) {
            }
          }, ce = [null, [], []];
          (() => {
            for (var e4 = new Array(256), t4 = 0; t4 < 256; ++t4) e4[t4] = String.fromCharCode(t4);
            B = e4;
          })(), x = r.BindingError = class extends Error {
            constructor(e4) {
              super(e4), this.name = "BindingError";
            }
          }, F = r.InternalError = class extends Error {
            constructor(e4) {
              super(e4), this.name = "InternalError";
            }
          }, Object.assign(H.prototype, { get(e4) {
            return this.allocated[e4];
          }, has(e4) {
            return void 0 !== this.allocated[e4];
          }, allocate(e4) {
            var t4 = this.freelist.pop() || this.allocated.length;
            return this.allocated[t4] = e4, t4;
          }, free(e4) {
            this.allocated[e4] = void 0, this.freelist.push(e4);
          } }), Y.allocated.push({ value: void 0 }, { value: null }, { value: true }, { value: false }), Y.reserved = Y.allocated.length, r.count_emval_handles = j;
          var _e, de = { _embind_register_bigint: (e4, t4, n2, r2, i3) => {
          }, _embind_register_bool: (e4, t4, n2, r2) => {
            k(e4, { name: t4 = R(t4), fromWireType: function(e5) {
              return !!e5;
            }, toWireType: function(e5, t5) {
              return t5 ? n2 : r2;
            }, argPackAdvance: 8, readValueFromPointer: function(e5) {
              return this.fromWireType(_[e5]);
            }, destructorFunction: null });
          }, _embind_register_constant: (e4, t4, n2) => {
            e4 = R(e4), X([], [t4], function(t5) {
              return t5 = t5[0], r[e4] = t5.fromWireType(n2), [];
            });
          }, _embind_register_emval: (e4, t4) => {
            k(e4, { name: t4 = R(t4), fromWireType: (e5) => {
              var t5 = V(e5);
              return ((e6) => {
                e6 >= Y.reserved && 0 == --Y.get(e6).refcount && Y.free(e6);
              })(e5), t5;
            }, toWireType: (e5, t5) => $(t5), argPackAdvance: 8, readValueFromPointer: z, destructorFunction: null });
          }, _embind_register_float: (e4, t4, n2) => {
            k(e4, { name: t4 = R(t4), fromWireType: (e5) => e5, toWireType: (e5, t5) => t5, argPackAdvance: 8, readValueFromPointer: q(t4, n2), destructorFunction: null });
          }, _embind_register_integer: (e4, t4, n2, r2, i3) => {
            t4 = R(t4), -1 === i3 && (i3 = 4294967295);
            var o2 = (e5) => e5;
            if (0 === r2) {
              var a2 = 32 - 8 * n2;
              o2 = (e5) => e5 << a2 >>> a2;
            }
            var s2 = t4.includes("unsigned");
            k(e4, { name: t4, fromWireType: o2, toWireType: s2 ? function(e5, t5) {
              return this.name, t5 >>> 0;
            } : function(e5, t5) {
              return this.name, t5;
            }, argPackAdvance: 8, readValueFromPointer: K(t4, n2, 0 !== r2), destructorFunction: null });
          }, _embind_register_memory_view: (e4, t4, n2) => {
            var r2 = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t4];
            function i3(e5) {
              var t5 = h[e5 >> 2], n3 = h[e5 + 4 >> 2];
              return new r2(c.buffer, n3, t5);
            }
            k(e4, { name: n2 = R(n2), fromWireType: i3, argPackAdvance: 8, readValueFromPointer: i3 }, { ignoreDuplicateRegistrations: true });
          }, _embind_register_std_string: (e4, t4) => {
            var n2 = "std::string" === (t4 = R(t4));
            k(e4, { name: t4, fromWireType: (e5) => {
              var t5, r2 = h[e5 >> 2], i3 = e5 + 4;
              if (n2) for (var o2 = i3, a2 = 0; a2 <= r2; ++a2) {
                var s2 = i3 + a2;
                if (a2 == r2 || 0 == _[s2]) {
                  var f2 = te(o2, s2 - o2);
                  void 0 === t5 ? t5 = f2 : (t5 += String.fromCharCode(0), t5 += f2), o2 = s2 + 1;
                }
              }
              else {
                var u2 = new Array(r2);
                for (a2 = 0; a2 < r2; ++a2) u2[a2] = String.fromCharCode(_[i3 + a2]);
                t5 = u2.join("");
              }
              return he(e5), t5;
            }, toWireType: (e5, t5) => {
              var r2;
              t5 instanceof ArrayBuffer && (t5 = new Uint8Array(t5));
              var i3 = "string" == typeof t5;
              i3 || t5 instanceof Uint8Array || t5 instanceof Uint8ClampedArray || t5 instanceof Int8Array || M("Cannot pass non-string to std::string"), r2 = n2 && i3 ? ((e6) => {
                for (var t6 = 0, n3 = 0; n3 < e6.length; ++n3) {
                  var r3 = e6.charCodeAt(n3);
                  r3 <= 127 ? t6++ : r3 <= 2047 ? t6 += 2 : r3 >= 55296 && r3 <= 57343 ? (t6 += 4, ++n3) : t6 += 3;
                }
                return t6;
              })(t5) : t5.length;
              var o2 = le(4 + r2 + 1), a2 = o2 + 4;
              if (h[o2 >> 2] = r2, n2 && i3) ((e6, t6, n3, r3) => {
                if (!(r3 > 0)) return 0;
                for (var i4 = n3, o3 = n3 + r3 - 1, a3 = 0; a3 < e6.length; ++a3) {
                  var s3 = e6.charCodeAt(a3);
                  if (s3 >= 55296 && s3 <= 57343 && (s3 = 65536 + ((1023 & s3) << 10) | 1023 & e6.charCodeAt(++a3)), s3 <= 127) {
                    if (n3 >= o3) break;
                    t6[n3++] = s3;
                  } else if (s3 <= 2047) {
                    if (n3 + 1 >= o3) break;
                    t6[n3++] = 192 | s3 >> 6, t6[n3++] = 128 | 63 & s3;
                  } else if (s3 <= 65535) {
                    if (n3 + 2 >= o3) break;
                    t6[n3++] = 224 | s3 >> 12, t6[n3++] = 128 | s3 >> 6 & 63, t6[n3++] = 128 | 63 & s3;
                  } else {
                    if (n3 + 3 >= o3) break;
                    t6[n3++] = 240 | s3 >> 18, t6[n3++] = 128 | s3 >> 12 & 63, t6[n3++] = 128 | s3 >> 6 & 63, t6[n3++] = 128 | 63 & s3;
                  }
                }
                t6[n3] = 0;
              })(t5, _, a2, r2 + 1);
              else if (i3) for (var s2 = 0; s2 < r2; ++s2) {
                var f2 = t5.charCodeAt(s2);
                f2 > 255 && (he(a2), M("String has UTF-16 code units that do not fit in 8 bits")), _[a2 + s2] = f2;
              }
              else for (s2 = 0; s2 < r2; ++s2) _[a2 + s2] = t5[s2];
              return null !== e5 && e5.push(he, o2), o2;
            }, argPackAdvance: 8, readValueFromPointer: J, destructorFunction: (e5) => he(e5) });
          }, _embind_register_std_wstring: (e4, t4, n2) => {
            var r2, i3, o2, a2, s2;
            n2 = R(n2), 2 === t4 ? (r2 = re, i3 = ie, a2 = oe, o2 = () => g, s2 = 1) : 4 === t4 && (r2 = ae, i3 = se, a2 = fe, o2 = () => h, s2 = 2), k(e4, { name: n2, fromWireType: (e5) => {
              for (var n3, i4 = h[e5 >> 2], a3 = o2(), f2 = e5 + 4, u2 = 0; u2 <= i4; ++u2) {
                var c2 = e5 + 4 + u2 * t4;
                if (u2 == i4 || 0 == a3[c2 >> s2]) {
                  var _2 = r2(f2, c2 - f2);
                  void 0 === n3 ? n3 = _2 : (n3 += String.fromCharCode(0), n3 += _2), f2 = c2 + t4;
                }
              }
              return he(e5), n3;
            }, toWireType: (e5, r3) => {
              "string" != typeof r3 && M(`Cannot pass non-string to C++ string type ${n2}`);
              var o3 = a2(r3), f2 = le(4 + o3 + t4);
              return h[f2 >> 2] = o3 >> s2, i3(r3, f2 + 4, o3 + t4), null !== e5 && e5.push(he, f2), f2;
            }, argPackAdvance: 8, readValueFromPointer: z, destructorFunction: (e5) => he(e5) });
          }, _embind_register_void: (e4, t4) => {
            k(e4, { isVoid: true, name: t4 = R(t4), argPackAdvance: 0, fromWireType: () => {
            }, toWireType: (e5, t5) => {
            } });
          }, emscripten_get_now: Q, emscripten_memcpy_big: (e4, t4, n2) => _.copyWithin(e4, t4, t4 + n2), emscripten_resize_heap: (e4) => {
            var t4 = _.length, n2 = 2147483648;
            if ((e4 >>>= 0) > n2) return false;
            for (var r2, i3 = 1; i3 <= 4; i3 *= 2) {
              var o2 = t4 * (1 + 0.2 / i3);
              o2 = Math.min(o2, e4 + 100663296);
              var a2 = Math.min(n2, (r2 = Math.max(e4, o2)) + (65536 - r2 % 65536) % 65536);
              if (ue(a2)) return true;
            }
            return false;
          }, fd_write: (e4, t4, n2, r2) => {
            for (var i3 = 0, o2 = 0; o2 < n2; o2++) {
              var a2 = h[t4 >> 2], s2 = h[t4 + 4 >> 2];
              t4 += 8;
              for (var c2 = 0; c2 < s2; c2++) d2 = e4, g2 = _[a2 + c2], l2 = void 0, l2 = ce[d2], 0 === g2 || 10 === g2 ? ((1 === d2 ? f : u)(ee(l2, 0)), l2.length = 0) : l2.push(g2);
              i3 += s2;
            }
            var d2, g2, l2;
            return h[r2 >> 2] = i3, 0;
          } }, ge = function() {
            var e4, t4, i3, o2, f2 = { env: de, wasi_snapshot_preview1: de };
            function c2(e5, t5) {
              var n2, i4 = e5.exports;
              return s = (ge = i4).memory, m(), ge.__indirect_function_table, n2 = ge.__wasm_call_ctors, I.unshift(n2), function(e6) {
                if (N--, r.monitorRunDependencies && r.monitorRunDependencies(N), 0 == N && (null !== A && (clearInterval(A), A = null), S)) {
                  var t6 = S;
                  S = null, t6();
                }
              }(), i4;
            }
            if (N++, r.monitorRunDependencies && r.monitorRunDependencies(N), r.instantiateWasm) try {
              return r.instantiateWasm(f2, c2);
            } catch (e5) {
              u(`Module.instantiateWasm callback failed with error: ${e5}`), n(e5);
            }
            return (e4 = a, t4 = E, i3 = f2, o2 = function(e5) {
              c2(e5.instance);
            }, e4 || "function" != typeof WebAssembly.instantiateStreaming || b(t4) || "function" != typeof fetch ? U(t4, i3, o2) : fetch(t4, { credentials: "same-origin" }).then((e5) => WebAssembly.instantiateStreaming(e5, i3).then(o2, function(e6) {
              return u(`wasm streaming compile failed: ${e6}`), u("falling back to ArrayBuffer instantiation"), U(t4, i3, o2);
            }))).catch(n), {};
          }(), le = (e4) => (le = ge.malloc)(e4), he = (e4) => (he = ge.free)(e4);
          function pe() {
            function e4() {
              _e || (_e = true, r.calledRun = true, v || (G(I), t3(r), r.onRuntimeInitialized && r.onRuntimeInitialized(), function() {
                if (r.postRun) for ("function" == typeof r.postRun && (r.postRun = [r.postRun]); r.postRun.length; ) e5 = r.postRun.shift(), T.unshift(e5);
                var e5;
                G(T);
              }()));
            }
            N > 0 || (function() {
              if (r.preRun) for ("function" == typeof r.preRun && (r.preRun = [r.preRun]); r.preRun.length; ) e5 = r.preRun.shift(), y.unshift(e5);
              var e5;
              G(y);
            }(), N > 0 || (r.setStatus ? (r.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                r.setStatus("");
              }, 1), e4();
            }, 1)) : e4()));
          }
          if (r._omalloc = (e4) => (r._omalloc = ge.omalloc)(e4), r._ofree = (e4) => (r._ofree = ge.ofree)(e4), r._getLastOnigError = () => (r._getLastOnigError = ge.getLastOnigError)(), r._createOnigScanner = (e4, t4, n2, i3, o2) => (r._createOnigScanner = ge.createOnigScanner)(e4, t4, n2, i3, o2), r._freeOnigScanner = (e4) => (r._freeOnigScanner = ge.freeOnigScanner)(e4), r._findNextOnigScannerMatch = (e4, t4, n2, i3, o2, a2) => (r._findNextOnigScannerMatch = ge.findNextOnigScannerMatch)(e4, t4, n2, i3, o2, a2), r._findNextOnigScannerMatchDbg = (e4, t4, n2, i3, o2, a2) => (r._findNextOnigScannerMatchDbg = ge.findNextOnigScannerMatchDbg)(e4, t4, n2, i3, o2, a2), r.__embind_initialize_bindings = () => (r.__embind_initialize_bindings = ge._embind_initialize_bindings)(), r.dynCall_jiji = (e4, t4, n2, i3, o2) => (r.dynCall_jiji = ge.dynCall_jiji)(e4, t4, n2, i3, o2), r.UTF8ToString = te, S = function e4() {
            _e || pe(), _e || (S = e4);
          }, r.preInit) for ("function" == typeof r.preInit && (r.preInit = [r.preInit]); r.preInit.length > 0; ) r.preInit.pop()();
          return pe(), e3.ready;
        });
        e2.exports = t2;
      } }, t = {}, function n(r) {
        var i2 = t[r];
        if (void 0 !== i2) return i2.exports;
        var o = t[r] = { exports: {} };
        return e[r].call(o.exports, o, o.exports, n), o.exports;
      }(770);
      var e, t;
    });
  }
});

// ../core/dist/grammars/textmate.js
var require_textmate = __commonJS({
  "../core/dist/grammars/textmate.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TextMateBackend = void 0;
    exports2.createTextMateBackend = createTextMateBackend;
    var fs3 = __importStar(require("node:fs"));
    var vscode_textmate_1 = require_main();
    var scopes_1 = require_scopes();
    var paths_1 = require_paths();
    var onigReady;
    var onigReadyRoot;
    async function getOnigLib(moduleRoot) {
      if (!onigReady || onigReadyRoot !== moduleRoot) {
        onigReadyRoot = moduleRoot;
        onigReady = (async () => {
          const onig = await Promise.resolve().then(() => __importStar(require_main2()));
          const wasmPath = (0, paths_1.resolveFromModuleRoot)(moduleRoot, "vscode-oniguruma/release/onig.wasm");
          const wasmBin = fs3.readFileSync(wasmPath);
          await onig.loadWASM(wasmBin);
          return {
            createOnigScanner: (patterns) => new onig.OnigScanner(patterns),
            createOnigString: (s) => new onig.OnigString(s)
          };
        })();
      }
      return onigReady;
    }
    var TextMateBackend = class {
      registry;
      grammarCache = /* @__PURE__ */ new Map();
      grammarMap;
      grammarsByScope;
      moduleRoot;
      constructor(grammarMap, moduleRoot, grammarsByScope) {
        this.grammarMap = grammarMap;
        this.grammarsByScope = grammarsByScope ?? buildScopeMapFromPrimary(grammarMap);
        this.moduleRoot = moduleRoot;
      }
      async ensureRegistry() {
        if (this.registry) {
          return this.registry;
        }
        const onigLib = await getOnigLib(this.moduleRoot);
        const grammarsByScope = this.grammarsByScope;
        this.registry = new vscode_textmate_1.Registry({
          onigLib: Promise.resolve(onigLib),
          loadGrammar: async (scopeName) => {
            const g = grammarsByScope.get(scopeName);
            if (g && fs3.existsSync(g.grammarPath)) {
              const raw = fs3.readFileSync(g.grammarPath, "utf8");
              return (0, vscode_textmate_1.parseRawGrammar)(raw, g.grammarPath);
            }
            return null;
          }
        });
        return this.registry;
      }
      async extractSpans(languageId, text) {
        const contrib = this.grammarMap.get(languageId);
        if (!contrib) {
          return [];
        }
        try {
          const registry = await this.ensureRegistry();
          let grammar = this.grammarCache.get(contrib.scopeName);
          if (!grammar) {
            grammar = await registry.loadGrammar(contrib.scopeName) ?? void 0;
            if (!grammar) {
              return [];
            }
            this.grammarCache.set(contrib.scopeName, grammar);
          }
          const spans = [];
          const lines = text.split("\n");
          let offset = 0;
          let ruleStack = vscode_textmate_1.INITIAL;
          for (const line of lines) {
            const lineTokens = grammar.tokenizeLine(line, ruleStack);
            ruleStack = lineTokens.ruleStack;
            for (const token of lineTokens.tokens) {
              const category = (0, scopes_1.classifyTextMateScopes)(token.scopes);
              if (!category) {
                continue;
              }
              spans.push({
                start: offset + token.startIndex,
                end: offset + token.endIndex,
                category,
                source: "textmate"
              });
            }
            offset += line.length + 1;
          }
          return spans;
        } catch {
          return [];
        }
      }
    };
    exports2.TextMateBackend = TextMateBackend;
    function buildScopeMapFromPrimary(grammarMap) {
      const map = /* @__PURE__ */ new Map();
      for (const g of grammarMap.values()) {
        if (!map.has(g.scopeName)) {
          map.set(g.scopeName, {
            scopeName: g.scopeName,
            grammarPath: g.grammarPath,
            extensionPath: g.extensionPath,
            languageId: g.languageId
          });
        }
      }
      return map;
    }
    function createTextMateBackend(grammarMap, moduleRoot, grammarsByScope) {
      return new TextMateBackend(grammarMap, moduleRoot, grammarsByScope);
    }
  }
});

// ../../node_modules/web-tree-sitter/tree-sitter.js
var require_tree_sitter = __commonJS({
  "../../node_modules/web-tree-sitter/tree-sitter.js"(exports, module) {
    var Module = typeof Module != "undefined" ? Module : {};
    var ENVIRONMENT_IS_WEB = typeof window == "object";
    var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
    var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
    if (ENVIRONMENT_IS_NODE) {
    }
    var TreeSitter = function() {
      var initPromise;
      var document = typeof window == "object" ? {
        currentScript: window.document.currentScript
      } : null;
      class Parser {
        constructor() {
          this.initialize();
        }
        initialize() {
          throw new Error("cannot construct a Parser before calling `init()`");
        }
        static init(moduleOptions) {
          if (initPromise) return initPromise;
          Module = Object.assign({}, Module, moduleOptions);
          return initPromise = new Promise((resolveInitPromise) => {
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
              throw toThrow;
            };
            var scriptDirectory = "";
            function locateFile(path4) {
              if (Module["locateFile"]) {
                return Module["locateFile"](path4, scriptDirectory);
              }
              return scriptDirectory + path4;
            }
            var readAsync, readBinary;
            if (ENVIRONMENT_IS_NODE) {
              var fs = require("fs");
              var nodePath = require("path");
              scriptDirectory = __dirname + "/";
              readBinary = (filename) => {
                filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                var ret = fs.readFileSync(filename);
                return ret;
              };
              readAsync = (filename, binary2 = true) => {
                filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                return new Promise((resolve, reject) => {
                  fs.readFile(filename, binary2 ? void 0 : "utf8", (err2, data) => {
                    if (err2) reject(err2);
                    else resolve(binary2 ? data.buffer : data);
                  });
                });
              };
              if (!Module["thisProgram"] && process.argv.length > 1) {
                thisProgram = process.argv[1].replace(/\\/g, "/");
              }
              arguments_ = process.argv.slice(2);
              if (typeof module != "undefined") {
                module["exports"] = Module;
              }
              quit_ = (status, toThrow) => {
                process.exitCode = status;
                throw toThrow;
              };
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
              if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory = self.location.href;
              } else if (typeof document != "undefined" && document.currentScript) {
                scriptDirectory = document.currentScript.src;
              }
              if (scriptDirectory.startsWith("blob:")) {
                scriptDirectory = "";
              } else {
                scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
              }
              {
                if (ENVIRONMENT_IS_WORKER) {
                  readBinary = (url) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    xhr.responseType = "arraybuffer";
                    xhr.send(null);
                    return new Uint8Array(
                      /** @type{!ArrayBuffer} */
                      xhr.response
                    );
                  };
                }
                readAsync = (url) => {
                  if (isFileURI(url)) {
                    return new Promise((reject, resolve) => {
                      var xhr = new XMLHttpRequest();
                      xhr.open("GET", url, true);
                      xhr.responseType = "arraybuffer";
                      xhr.onload = () => {
                        if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                          resolve(xhr.response);
                        }
                        reject(xhr.status);
                      };
                      xhr.onerror = reject;
                      xhr.send(null);
                    });
                  }
                  return fetch(url, {
                    credentials: "same-origin"
                  }).then((response) => {
                    if (response.ok) {
                      return response.arrayBuffer();
                    }
                    return Promise.reject(new Error(response.status + " : " + response.url));
                  });
                };
              }
            } else {
            }
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.error.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var dynamicLibraries = Module["dynamicLibraries"] || [];
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;
            var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
            var HEAP_DATA_VIEW;
            function updateMemoryViews() {
              var b = wasmMemory.buffer;
              Module["HEAP_DATA_VIEW"] = HEAP_DATA_VIEW = new DataView(b);
              Module["HEAP8"] = HEAP8 = new Int8Array(b);
              Module["HEAP16"] = HEAP16 = new Int16Array(b);
              Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
              Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
              Module["HEAP32"] = HEAP32 = new Int32Array(b);
              Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
              Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
              Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
            }
            if (Module["wasmMemory"]) {
              wasmMemory = Module["wasmMemory"];
            } else {
              var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432;
              wasmMemory = new WebAssembly.Memory({
                "initial": INITIAL_MEMORY / 65536,
                // In theory we should not need to emit the maximum if we want "unlimited"
                // or 4GB of memory, but VMs error on that atm, see
                // https://github.com/emscripten-core/emscripten/issues/14130
                // And in the pthreads case we definitely need to emit a maximum. So
                // always emit one.
                "maximum": 2147483648 / 65536
              });
            }
            updateMemoryViews();
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATPOSTRUN__ = [];
            var __RELOC_FUNCS__ = [];
            var runtimeInitialized = false;
            function preRun() {
              if (Module["preRun"]) {
                if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                while (Module["preRun"].length) {
                  addOnPreRun(Module["preRun"].shift());
                }
              }
              callRuntimeCallbacks(__ATPRERUN__);
            }
            function initRuntime() {
              runtimeInitialized = true;
              callRuntimeCallbacks(__RELOC_FUNCS__);
              callRuntimeCallbacks(__ATINIT__);
            }
            function preMain() {
              callRuntimeCallbacks(__ATMAIN__);
            }
            function postRun() {
              if (Module["postRun"]) {
                if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                while (Module["postRun"].length) {
                  addOnPostRun(Module["postRun"].shift());
                }
              }
              callRuntimeCallbacks(__ATPOSTRUN__);
            }
            function addOnPreRun(cb) {
              __ATPRERUN__.unshift(cb);
            }
            function addOnInit(cb) {
              __ATINIT__.unshift(cb);
            }
            function addOnPostRun(cb) {
              __ATPOSTRUN__.unshift(cb);
            }
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;
            function getUniqueRunDependency(id) {
              return id;
            }
            function addRunDependency(id) {
              runDependencies++;
              Module["monitorRunDependencies"]?.(runDependencies);
            }
            function removeRunDependency(id) {
              runDependencies--;
              Module["monitorRunDependencies"]?.(runDependencies);
              if (runDependencies == 0) {
                if (runDependencyWatcher !== null) {
                  clearInterval(runDependencyWatcher);
                  runDependencyWatcher = null;
                }
                if (dependenciesFulfilled) {
                  var callback = dependenciesFulfilled;
                  dependenciesFulfilled = null;
                  callback();
                }
              }
            }
            function abort(what) {
              Module["onAbort"]?.(what);
              what = "Aborted(" + what + ")";
              err(what);
              ABORT = true;
              EXITSTATUS = 1;
              what += ". Build with -sASSERTIONS for more info.";
              var e = new WebAssembly.RuntimeError(what);
              throw e;
            }
            var dataURIPrefix = "data:application/octet-stream;base64,";
            var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
            var isFileURI = (filename) => filename.startsWith("file://");
            function findWasmBinary() {
              var f = "tree-sitter.wasm";
              if (!isDataURI(f)) {
                return locateFile(f);
              }
              return f;
            }
            var wasmBinaryFile;
            function getBinarySync(file) {
              if (file == wasmBinaryFile && wasmBinary) {
                return new Uint8Array(wasmBinary);
              }
              if (readBinary) {
                return readBinary(file);
              }
              throw "both async and sync fetching of the wasm failed";
            }
            function getBinaryPromise(binaryFile) {
              if (!wasmBinary) {
                return readAsync(binaryFile).then(
                  (response) => new Uint8Array(
                    /** @type{!ArrayBuffer} */
                    response
                  ),
                  // Fall back to getBinarySync if readAsync fails
                  () => getBinarySync(binaryFile)
                );
              }
              return Promise.resolve().then(() => getBinarySync(binaryFile));
            }
            function instantiateArrayBuffer(binaryFile, imports, receiver) {
              return getBinaryPromise(binaryFile).then((binary2) => WebAssembly.instantiate(binary2, imports)).then(receiver, (reason) => {
                err(`failed to asynchronously prepare wasm: ${reason}`);
                abort(reason);
              });
            }
            function instantiateAsync(binary2, binaryFile, imports, callback) {
              if (!binary2 && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
              !isFileURI(binaryFile) && // Avoid instantiateStreaming() on Node.js environment for now, as while
              // Node.js v18.1.0 implements it, it does not have a full fetch()
              // implementation yet.
              // Reference:
              //   https://github.com/emscripten-core/emscripten/pull/16917
              !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
                return fetch(binaryFile, {
                  credentials: "same-origin"
                }).then((response) => {
                  var result = WebAssembly.instantiateStreaming(response, imports);
                  return result.then(callback, function(reason) {
                    err(`wasm streaming compile failed: ${reason}`);
                    err("falling back to ArrayBuffer instantiation");
                    return instantiateArrayBuffer(binaryFile, imports, callback);
                  });
                });
              }
              return instantiateArrayBuffer(binaryFile, imports, callback);
            }
            function getWasmImports() {
              return {
                "env": wasmImports,
                "wasi_snapshot_preview1": wasmImports,
                "GOT.mem": new Proxy(wasmImports, GOTHandler),
                "GOT.func": new Proxy(wasmImports, GOTHandler)
              };
            }
            function createWasm() {
              var info2 = getWasmImports();
              function receiveInstance(instance2, module2) {
                wasmExports = instance2.exports;
                wasmExports = relocateExports(wasmExports, 1024);
                var metadata2 = getDylinkMetadata(module2);
                if (metadata2.neededDynlibs) {
                  dynamicLibraries = metadata2.neededDynlibs.concat(dynamicLibraries);
                }
                mergeLibSymbols(wasmExports, "main");
                LDSO.init();
                loadDylibs();
                addOnInit(wasmExports["__wasm_call_ctors"]);
                __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]);
                removeRunDependency("wasm-instantiate");
                return wasmExports;
              }
              addRunDependency("wasm-instantiate");
              function receiveInstantiationResult(result) {
                receiveInstance(result["instance"], result["module"]);
              }
              if (Module["instantiateWasm"]) {
                try {
                  return Module["instantiateWasm"](info2, receiveInstance);
                } catch (e) {
                  err(`Module.instantiateWasm callback failed with error: ${e}`);
                  return false;
                }
              }
              if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
              instantiateAsync(wasmBinary, wasmBinaryFile, info2, receiveInstantiationResult);
              return {};
            }
            var ASM_CONSTS = {};
            function ExitStatus(status) {
              this.name = "ExitStatus";
              this.message = `Program terminated with exit(${status})`;
              this.status = status;
            }
            var GOT = {};
            var currentModuleWeakSymbols = /* @__PURE__ */ new Set([]);
            var GOTHandler = {
              get(obj, symName) {
                var rtn = GOT[symName];
                if (!rtn) {
                  rtn = GOT[symName] = new WebAssembly.Global({
                    "value": "i32",
                    "mutable": true
                  });
                }
                if (!currentModuleWeakSymbols.has(symName)) {
                  rtn.required = true;
                }
                return rtn;
              }
            };
            var LE_HEAP_LOAD_F32 = (byteOffset) => HEAP_DATA_VIEW.getFloat32(byteOffset, true);
            var LE_HEAP_LOAD_F64 = (byteOffset) => HEAP_DATA_VIEW.getFloat64(byteOffset, true);
            var LE_HEAP_LOAD_I16 = (byteOffset) => HEAP_DATA_VIEW.getInt16(byteOffset, true);
            var LE_HEAP_LOAD_I32 = (byteOffset) => HEAP_DATA_VIEW.getInt32(byteOffset, true);
            var LE_HEAP_LOAD_U32 = (byteOffset) => HEAP_DATA_VIEW.getUint32(byteOffset, true);
            var LE_HEAP_STORE_F32 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat32(byteOffset, value, true);
            var LE_HEAP_STORE_F64 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat64(byteOffset, value, true);
            var LE_HEAP_STORE_I16 = (byteOffset, value) => HEAP_DATA_VIEW.setInt16(byteOffset, value, true);
            var LE_HEAP_STORE_I32 = (byteOffset, value) => HEAP_DATA_VIEW.setInt32(byteOffset, value, true);
            var LE_HEAP_STORE_U32 = (byteOffset, value) => HEAP_DATA_VIEW.setUint32(byteOffset, value, true);
            var callRuntimeCallbacks = (callbacks) => {
              while (callbacks.length > 0) {
                callbacks.shift()(Module);
              }
            };
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
            var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
              var endIdx = idx + maxBytesToRead;
              var endPtr = idx;
              while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
              if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
              }
              var str = "";
              while (idx < endPtr) {
                var u0 = heapOrArray[idx++];
                if (!(u0 & 128)) {
                  str += String.fromCharCode(u0);
                  continue;
                }
                var u1 = heapOrArray[idx++] & 63;
                if ((u0 & 224) == 192) {
                  str += String.fromCharCode((u0 & 31) << 6 | u1);
                  continue;
                }
                var u2 = heapOrArray[idx++] & 63;
                if ((u0 & 240) == 224) {
                  u0 = (u0 & 15) << 12 | u1 << 6 | u2;
                } else {
                  u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
                }
                if (u0 < 65536) {
                  str += String.fromCharCode(u0);
                } else {
                  var ch = u0 - 65536;
                  str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                }
              }
              return str;
            };
            var getDylinkMetadata = (binary2) => {
              var offset = 0;
              var end = 0;
              function getU8() {
                return binary2[offset++];
              }
              function getLEB() {
                var ret = 0;
                var mul = 1;
                while (1) {
                  var byte = binary2[offset++];
                  ret += (byte & 127) * mul;
                  mul *= 128;
                  if (!(byte & 128)) break;
                }
                return ret;
              }
              function getString() {
                var len = getLEB();
                offset += len;
                return UTF8ArrayToString(binary2, offset - len, len);
              }
              function failIf(condition, message) {
                if (condition) throw new Error(message);
              }
              var name2 = "dylink.0";
              if (binary2 instanceof WebAssembly.Module) {
                var dylinkSection = WebAssembly.Module.customSections(binary2, name2);
                if (dylinkSection.length === 0) {
                  name2 = "dylink";
                  dylinkSection = WebAssembly.Module.customSections(binary2, name2);
                }
                failIf(dylinkSection.length === 0, "need dylink section");
                binary2 = new Uint8Array(dylinkSection[0]);
                end = binary2.length;
              } else {
                var int32View = new Uint32Array(new Uint8Array(binary2.subarray(0, 24)).buffer);
                var magicNumberFound = int32View[0] == 1836278016 || int32View[0] == 6386541;
                failIf(!magicNumberFound, "need to see wasm magic number");
                failIf(binary2[8] !== 0, "need the dylink section to be first");
                offset = 9;
                var section_size = getLEB();
                end = offset + section_size;
                name2 = getString();
              }
              var customSection = {
                neededDynlibs: [],
                tlsExports: /* @__PURE__ */ new Set(),
                weakImports: /* @__PURE__ */ new Set()
              };
              if (name2 == "dylink") {
                customSection.memorySize = getLEB();
                customSection.memoryAlign = getLEB();
                customSection.tableSize = getLEB();
                customSection.tableAlign = getLEB();
                var neededDynlibsCount = getLEB();
                for (var i2 = 0; i2 < neededDynlibsCount; ++i2) {
                  var libname = getString();
                  customSection.neededDynlibs.push(libname);
                }
              } else {
                failIf(name2 !== "dylink.0");
                var WASM_DYLINK_MEM_INFO = 1;
                var WASM_DYLINK_NEEDED = 2;
                var WASM_DYLINK_EXPORT_INFO = 3;
                var WASM_DYLINK_IMPORT_INFO = 4;
                var WASM_SYMBOL_TLS = 256;
                var WASM_SYMBOL_BINDING_MASK = 3;
                var WASM_SYMBOL_BINDING_WEAK = 1;
                while (offset < end) {
                  var subsectionType = getU8();
                  var subsectionSize = getLEB();
                  if (subsectionType === WASM_DYLINK_MEM_INFO) {
                    customSection.memorySize = getLEB();
                    customSection.memoryAlign = getLEB();
                    customSection.tableSize = getLEB();
                    customSection.tableAlign = getLEB();
                  } else if (subsectionType === WASM_DYLINK_NEEDED) {
                    var neededDynlibsCount = getLEB();
                    for (var i2 = 0; i2 < neededDynlibsCount; ++i2) {
                      libname = getString();
                      customSection.neededDynlibs.push(libname);
                    }
                  } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
                    var count = getLEB();
                    while (count--) {
                      var symname = getString();
                      var flags2 = getLEB();
                      if (flags2 & WASM_SYMBOL_TLS) {
                        customSection.tlsExports.add(symname);
                      }
                    }
                  } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
                    var count = getLEB();
                    while (count--) {
                      var modname = getString();
                      var symname = getString();
                      var flags2 = getLEB();
                      if ((flags2 & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                        customSection.weakImports.add(symname);
                      }
                    }
                  } else {
                    offset += subsectionSize;
                  }
                }
              }
              return customSection;
            };
            function getValue(ptr, type = "i8") {
              if (type.endsWith("*")) type = "*";
              switch (type) {
                case "i1":
                  return HEAP8[ptr];
                case "i8":
                  return HEAP8[ptr];
                case "i16":
                  return LE_HEAP_LOAD_I16((ptr >> 1) * 2);
                case "i32":
                  return LE_HEAP_LOAD_I32((ptr >> 2) * 4);
                case "i64":
                  abort("to do getValue(i64) use WASM_BIGINT");
                case "float":
                  return LE_HEAP_LOAD_F32((ptr >> 2) * 4);
                case "double":
                  return LE_HEAP_LOAD_F64((ptr >> 3) * 8);
                case "*":
                  return LE_HEAP_LOAD_U32((ptr >> 2) * 4);
                default:
                  abort(`invalid type for getValue: ${type}`);
              }
            }
            var newDSO = (name2, handle2, syms) => {
              var dso = {
                refcount: Infinity,
                name: name2,
                exports: syms,
                global: true
              };
              LDSO.loadedLibsByName[name2] = dso;
              if (handle2 != void 0) {
                LDSO.loadedLibsByHandle[handle2] = dso;
              }
              return dso;
            };
            var LDSO = {
              loadedLibsByName: {},
              loadedLibsByHandle: {},
              init() {
                newDSO("__main__", 0, wasmImports);
              }
            };
            var ___heap_base = 78112;
            var zeroMemory = (address, size) => {
              HEAPU8.fill(0, address, address + size);
              return address;
            };
            var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
            var getMemory = (size) => {
              if (runtimeInitialized) {
                return zeroMemory(_malloc(size), size);
              }
              var ret = ___heap_base;
              var end = ret + alignMemory(size, 16);
              ___heap_base = end;
              GOT["__heap_base"].value = end;
              return ret;
            };
            var isInternalSym = (symName) => ["__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js"].includes(symName) || symName.startsWith("__em_js__");
            var uleb128Encode = (n, target) => {
              if (n < 128) {
                target.push(n);
              } else {
                target.push(n % 128 | 128, n >> 7);
              }
            };
            var sigToWasmTypes = (sig) => {
              var typeNames = {
                "i": "i32",
                "j": "i64",
                "f": "f32",
                "d": "f64",
                "e": "externref",
                "p": "i32"
              };
              var type = {
                parameters: [],
                results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
              };
              for (var i2 = 1; i2 < sig.length; ++i2) {
                type.parameters.push(typeNames[sig[i2]]);
              }
              return type;
            };
            var generateFuncType = (sig, target) => {
              var sigRet = sig.slice(0, 1);
              var sigParam = sig.slice(1);
              var typeCodes = {
                "i": 127,
                // i32
                "p": 127,
                // i32
                "j": 126,
                // i64
                "f": 125,
                // f32
                "d": 124,
                // f64
                "e": 111
              };
              target.push(96);
              uleb128Encode(sigParam.length, target);
              for (var i2 = 0; i2 < sigParam.length; ++i2) {
                target.push(typeCodes[sigParam[i2]]);
              }
              if (sigRet == "v") {
                target.push(0);
              } else {
                target.push(1, typeCodes[sigRet]);
              }
            };
            var convertJsFunctionToWasm = (func2, sig) => {
              if (typeof WebAssembly.Function == "function") {
                return new WebAssembly.Function(sigToWasmTypes(sig), func2);
              }
              var typeSectionBody = [1];
              generateFuncType(sig, typeSectionBody);
              var bytes = [
                0,
                97,
                115,
                109,
                // magic ("\0asm")
                1,
                0,
                0,
                0,
                // version: 1
                1
              ];
              uleb128Encode(typeSectionBody.length, bytes);
              bytes.push(...typeSectionBody);
              bytes.push(
                2,
                7,
                // import section
                // (import "e" "f" (func 0 (type 0)))
                1,
                1,
                101,
                1,
                102,
                0,
                0,
                7,
                5,
                // export section
                // (export "f" (func 0 (type 0)))
                1,
                1,
                102,
                0,
                0
              );
              var module2 = new WebAssembly.Module(new Uint8Array(bytes));
              var instance2 = new WebAssembly.Instance(module2, {
                "e": {
                  "f": func2
                }
              });
              var wrappedFunc = instance2.exports["f"];
              return wrappedFunc;
            };
            var wasmTableMirror = [];
            var wasmTable = new WebAssembly.Table({
              "initial": 28,
              "element": "anyfunc"
            });
            var getWasmTableEntry = (funcPtr) => {
              var func2 = wasmTableMirror[funcPtr];
              if (!func2) {
                if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
                wasmTableMirror[funcPtr] = func2 = wasmTable.get(funcPtr);
              }
              return func2;
            };
            var updateTableMap = (offset, count) => {
              if (functionsInTableMap) {
                for (var i2 = offset; i2 < offset + count; i2++) {
                  var item = getWasmTableEntry(i2);
                  if (item) {
                    functionsInTableMap.set(item, i2);
                  }
                }
              }
            };
            var functionsInTableMap;
            var getFunctionAddress = (func2) => {
              if (!functionsInTableMap) {
                functionsInTableMap = /* @__PURE__ */ new WeakMap();
                updateTableMap(0, wasmTable.length);
              }
              return functionsInTableMap.get(func2) || 0;
            };
            var freeTableIndexes = [];
            var getEmptyTableSlot = () => {
              if (freeTableIndexes.length) {
                return freeTableIndexes.pop();
              }
              try {
                wasmTable.grow(1);
              } catch (err2) {
                if (!(err2 instanceof RangeError)) {
                  throw err2;
                }
                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
              }
              return wasmTable.length - 1;
            };
            var setWasmTableEntry = (idx, func2) => {
              wasmTable.set(idx, func2);
              wasmTableMirror[idx] = wasmTable.get(idx);
            };
            var addFunction = (func2, sig) => {
              var rtn = getFunctionAddress(func2);
              if (rtn) {
                return rtn;
              }
              var ret = getEmptyTableSlot();
              try {
                setWasmTableEntry(ret, func2);
              } catch (err2) {
                if (!(err2 instanceof TypeError)) {
                  throw err2;
                }
                var wrapped = convertJsFunctionToWasm(func2, sig);
                setWasmTableEntry(ret, wrapped);
              }
              functionsInTableMap.set(func2, ret);
              return ret;
            };
            var updateGOT = (exports2, replace) => {
              for (var symName in exports2) {
                if (isInternalSym(symName)) {
                  continue;
                }
                var value = exports2[symName];
                if (symName.startsWith("orig$")) {
                  symName = symName.split("$")[1];
                  replace = true;
                }
                GOT[symName] ||= new WebAssembly.Global({
                  "value": "i32",
                  "mutable": true
                });
                if (replace || GOT[symName].value == 0) {
                  if (typeof value == "function") {
                    GOT[symName].value = addFunction(value);
                  } else if (typeof value == "number") {
                    GOT[symName].value = value;
                  } else {
                    err(`unhandled export type for '${symName}': ${typeof value}`);
                  }
                }
              }
            };
            var relocateExports = (exports2, memoryBase2, replace) => {
              var relocated = {};
              for (var e in exports2) {
                var value = exports2[e];
                if (typeof value == "object") {
                  value = value.value;
                }
                if (typeof value == "number") {
                  value += memoryBase2;
                }
                relocated[e] = value;
              }
              updateGOT(relocated, replace);
              return relocated;
            };
            var isSymbolDefined = (symName) => {
              var existing = wasmImports[symName];
              if (!existing || existing.stub) {
                return false;
              }
              return true;
            };
            var dynCallLegacy = (sig, ptr, args2) => {
              sig = sig.replace(/p/g, "i");
              var f = Module["dynCall_" + sig];
              return f(ptr, ...args2);
            };
            var dynCall = (sig, ptr, args2 = []) => {
              if (sig.includes("j")) {
                return dynCallLegacy(sig, ptr, args2);
              }
              var rtn = getWasmTableEntry(ptr)(...args2);
              return rtn;
            };
            var stackSave = () => _emscripten_stack_get_current();
            var stackRestore = (val) => __emscripten_stack_restore(val);
            var createInvokeFunction = (sig) => (ptr, ...args2) => {
              var sp = stackSave();
              try {
                return dynCall(sig, ptr, args2);
              } catch (e) {
                stackRestore(sp);
                if (e !== e + 0) throw e;
                _setThrew(1, 0);
              }
            };
            var resolveGlobalSymbol = (symName, direct = false) => {
              var sym;
              if (direct && "orig$" + symName in wasmImports) {
                symName = "orig$" + symName;
              }
              if (isSymbolDefined(symName)) {
                sym = wasmImports[symName];
              } else if (symName.startsWith("invoke_")) {
                sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1]);
              }
              return {
                sym,
                name: symName
              };
            };
            var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
            var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => {
              var metadata = getDylinkMetadata(binary);
              currentModuleWeakSymbols = metadata.weakImports;
              function loadModule() {
                var firstLoad = !handle || !HEAP8[handle + 8];
                if (firstLoad) {
                  var memAlign = Math.pow(2, metadata.memoryAlign);
                  var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
                  var tableBase = metadata.tableSize ? wasmTable.length : 0;
                  if (handle) {
                    HEAP8[handle + 8] = 1;
                    LE_HEAP_STORE_U32((handle + 12 >> 2) * 4, memoryBase);
                    LE_HEAP_STORE_I32((handle + 16 >> 2) * 4, metadata.memorySize);
                    LE_HEAP_STORE_U32((handle + 20 >> 2) * 4, tableBase);
                    LE_HEAP_STORE_I32((handle + 24 >> 2) * 4, metadata.tableSize);
                  }
                } else {
                  memoryBase = LE_HEAP_LOAD_U32((handle + 12 >> 2) * 4);
                  tableBase = LE_HEAP_LOAD_U32((handle + 20 >> 2) * 4);
                }
                var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length;
                if (tableGrowthNeeded > 0) {
                  wasmTable.grow(tableGrowthNeeded);
                }
                var moduleExports;
                function resolveSymbol(sym) {
                  var resolved = resolveGlobalSymbol(sym).sym;
                  if (!resolved && localScope) {
                    resolved = localScope[sym];
                  }
                  if (!resolved) {
                    resolved = moduleExports[sym];
                  }
                  return resolved;
                }
                var proxyHandler = {
                  get(stubs, prop) {
                    switch (prop) {
                      case "__memory_base":
                        return memoryBase;
                      case "__table_base":
                        return tableBase;
                    }
                    if (prop in wasmImports && !wasmImports[prop].stub) {
                      return wasmImports[prop];
                    }
                    if (!(prop in stubs)) {
                      var resolved;
                      stubs[prop] = (...args2) => {
                        resolved ||= resolveSymbol(prop);
                        return resolved(...args2);
                      };
                    }
                    return stubs[prop];
                  }
                };
                var proxy = new Proxy({}, proxyHandler);
                var info = {
                  "GOT.mem": new Proxy({}, GOTHandler),
                  "GOT.func": new Proxy({}, GOTHandler),
                  "env": proxy,
                  "wasi_snapshot_preview1": proxy
                };
                function postInstantiation(module, instance) {
                  updateTableMap(tableBase, metadata.tableSize);
                  moduleExports = relocateExports(instance.exports, memoryBase);
                  if (!flags.allowUndefined) {
                    reportUndefinedSymbols();
                  }
                  function addEmAsm(addr, body) {
                    var args = [];
                    var arity = 0;
                    for (; arity < 16; arity++) {
                      if (body.indexOf("$" + arity) != -1) {
                        args.push("$" + arity);
                      } else {
                        break;
                      }
                    }
                    args = args.join(",");
                    var func = `(${args}) => { ${body} };`;
                    ASM_CONSTS[start] = eval(func);
                  }
                  if ("__start_em_asm" in moduleExports) {
                    var start = moduleExports["__start_em_asm"];
                    var stop = moduleExports["__stop_em_asm"];
                    while (start < stop) {
                      var jsString = UTF8ToString(start);
                      addEmAsm(start, jsString);
                      start = HEAPU8.indexOf(0, start) + 1;
                    }
                  }
                  function addEmJs(name, cSig, body) {
                    var jsArgs = [];
                    cSig = cSig.slice(1, -1);
                    if (cSig != "void") {
                      cSig = cSig.split(",");
                      for (var i in cSig) {
                        var jsArg = cSig[i].split(" ").pop();
                        jsArgs.push(jsArg.replace("*", ""));
                      }
                    }
                    var func = `(${jsArgs}) => ${body};`;
                    moduleExports[name] = eval(func);
                  }
                  for (var name in moduleExports) {
                    if (name.startsWith("__em_js__")) {
                      var start = moduleExports[name];
                      var jsString = UTF8ToString(start);
                      var parts = jsString.split("<::>");
                      addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
                      delete moduleExports[name];
                    }
                  }
                  var applyRelocs = moduleExports["__wasm_apply_data_relocs"];
                  if (applyRelocs) {
                    if (runtimeInitialized) {
                      applyRelocs();
                    } else {
                      __RELOC_FUNCS__.push(applyRelocs);
                    }
                  }
                  var init = moduleExports["__wasm_call_ctors"];
                  if (init) {
                    if (runtimeInitialized) {
                      init();
                    } else {
                      __ATINIT__.push(init);
                    }
                  }
                  return moduleExports;
                }
                if (flags.loadAsync) {
                  if (binary instanceof WebAssembly.Module) {
                    var instance = new WebAssembly.Instance(binary, info);
                    return Promise.resolve(postInstantiation(binary, instance));
                  }
                  return WebAssembly.instantiate(binary, info).then((result) => postInstantiation(result.module, result.instance));
                }
                var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
                var instance = new WebAssembly.Instance(module, info);
                return postInstantiation(module, instance);
              }
              if (flags.loadAsync) {
                return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags, localScope)), Promise.resolve()).then(loadModule);
              }
              metadata.neededDynlibs.forEach((needed) => loadDynamicLibrary(needed, flags, localScope));
              return loadModule();
            };
            var mergeLibSymbols = (exports2, libName2) => {
              for (var [sym, exp] of Object.entries(exports2)) {
                const setImport = (target) => {
                  if (!isSymbolDefined(target)) {
                    wasmImports[target] = exp;
                  }
                };
                setImport(sym);
                const main_alias = "__main_argc_argv";
                if (sym == "main") {
                  setImport(main_alias);
                }
                if (sym == main_alias) {
                  setImport("main");
                }
                if (sym.startsWith("dynCall_") && !Module.hasOwnProperty(sym)) {
                  Module[sym] = exp;
                }
              }
            };
            var asyncLoad = (url, onload, onerror, noRunDep) => {
              var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
              readAsync(url).then((arrayBuffer) => {
                onload(new Uint8Array(arrayBuffer));
                if (dep) removeRunDependency(dep);
              }, (err2) => {
                if (onerror) {
                  onerror();
                } else {
                  throw `Loading data file "${url}" failed.`;
                }
              });
              if (dep) addRunDependency(dep);
            };
            function loadDynamicLibrary(libName2, flags2 = {
              global: true,
              nodelete: true
            }, localScope2, handle2) {
              var dso = LDSO.loadedLibsByName[libName2];
              if (dso) {
                if (!flags2.global) {
                  if (localScope2) {
                    Object.assign(localScope2, dso.exports);
                  }
                } else if (!dso.global) {
                  dso.global = true;
                  mergeLibSymbols(dso.exports, libName2);
                }
                if (flags2.nodelete && dso.refcount !== Infinity) {
                  dso.refcount = Infinity;
                }
                dso.refcount++;
                if (handle2) {
                  LDSO.loadedLibsByHandle[handle2] = dso;
                }
                return flags2.loadAsync ? Promise.resolve(true) : true;
              }
              dso = newDSO(libName2, handle2, "loading");
              dso.refcount = flags2.nodelete ? Infinity : 1;
              dso.global = flags2.global;
              function loadLibData() {
                if (handle2) {
                  var data = LE_HEAP_LOAD_U32((handle2 + 28 >> 2) * 4);
                  var dataSize = LE_HEAP_LOAD_U32((handle2 + 32 >> 2) * 4);
                  if (data && dataSize) {
                    var libData = HEAP8.slice(data, data + dataSize);
                    return flags2.loadAsync ? Promise.resolve(libData) : libData;
                  }
                }
                var libFile = locateFile(libName2);
                if (flags2.loadAsync) {
                  return new Promise(function(resolve, reject) {
                    asyncLoad(libFile, resolve, reject);
                  });
                }
                if (!readBinary) {
                  throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
                }
                return readBinary(libFile);
              }
              function getExports() {
                if (flags2.loadAsync) {
                  return loadLibData().then((libData) => loadWebAssemblyModule(libData, flags2, libName2, localScope2, handle2));
                }
                return loadWebAssemblyModule(loadLibData(), flags2, libName2, localScope2, handle2);
              }
              function moduleLoaded(exports2) {
                if (dso.global) {
                  mergeLibSymbols(exports2, libName2);
                } else if (localScope2) {
                  Object.assign(localScope2, exports2);
                }
                dso.exports = exports2;
              }
              if (flags2.loadAsync) {
                return getExports().then((exports2) => {
                  moduleLoaded(exports2);
                  return true;
                });
              }
              moduleLoaded(getExports());
              return true;
            }
            var reportUndefinedSymbols = () => {
              for (var [symName, entry] of Object.entries(GOT)) {
                if (entry.value == 0) {
                  var value = resolveGlobalSymbol(symName, true).sym;
                  if (!value && !entry.required) {
                    continue;
                  }
                  if (typeof value == "function") {
                    entry.value = addFunction(value, value.sig);
                  } else if (typeof value == "number") {
                    entry.value = value;
                  } else {
                    throw new Error(`bad export type for '${symName}': ${typeof value}`);
                  }
                }
              }
            };
            var loadDylibs = () => {
              if (!dynamicLibraries.length) {
                reportUndefinedSymbols();
                return;
              }
              addRunDependency("loadDylibs");
              dynamicLibraries.reduce((chain, lib) => chain.then(() => loadDynamicLibrary(lib, {
                loadAsync: true,
                global: true,
                nodelete: true,
                allowUndefined: true
              })), Promise.resolve()).then(() => {
                reportUndefinedSymbols();
                removeRunDependency("loadDylibs");
              });
            };
            var noExitRuntime = Module["noExitRuntime"] || true;
            function setValue(ptr, value, type = "i8") {
              if (type.endsWith("*")) type = "*";
              switch (type) {
                case "i1":
                  HEAP8[ptr] = value;
                  break;
                case "i8":
                  HEAP8[ptr] = value;
                  break;
                case "i16":
                  LE_HEAP_STORE_I16((ptr >> 1) * 2, value);
                  break;
                case "i32":
                  LE_HEAP_STORE_I32((ptr >> 2) * 4, value);
                  break;
                case "i64":
                  abort("to do setValue(i64) use WASM_BIGINT");
                case "float":
                  LE_HEAP_STORE_F32((ptr >> 2) * 4, value);
                  break;
                case "double":
                  LE_HEAP_STORE_F64((ptr >> 3) * 8, value);
                  break;
                case "*":
                  LE_HEAP_STORE_U32((ptr >> 2) * 4, value);
                  break;
                default:
                  abort(`invalid type for setValue: ${type}`);
              }
            }
            var ___memory_base = new WebAssembly.Global({
              "value": "i32",
              "mutable": false
            }, 1024);
            var ___stack_pointer = new WebAssembly.Global({
              "value": "i32",
              "mutable": true
            }, 78112);
            var ___table_base = new WebAssembly.Global({
              "value": "i32",
              "mutable": false
            }, 1);
            var __abort_js = () => {
              abort("");
            };
            __abort_js.sig = "v";
            var nowIsMonotonic = 1;
            var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
            __emscripten_get_now_is_monotonic.sig = "i";
            var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
            __emscripten_memcpy_js.sig = "vppp";
            var _emscripten_date_now = () => Date.now();
            _emscripten_date_now.sig = "d";
            var _emscripten_get_now;
            _emscripten_get_now = () => performance.now();
            _emscripten_get_now.sig = "d";
            var getHeapMax = () => (
              // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
              // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
              // for any code that deals with heap sizes, which would require special
              // casing all heap size related code to treat 0 specially.
              2147483648
            );
            var growMemory = (size) => {
              var b = wasmMemory.buffer;
              var pages = (size - b.byteLength + 65535) / 65536;
              try {
                wasmMemory.grow(pages);
                updateMemoryViews();
                return 1;
              } catch (e) {
              }
            };
            var _emscripten_resize_heap = (requestedSize) => {
              var oldSize = HEAPU8.length;
              requestedSize >>>= 0;
              var maxHeapSize = getHeapMax();
              if (requestedSize > maxHeapSize) {
                return false;
              }
              var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
              for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
                overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                var replacement = growMemory(newSize);
                if (replacement) {
                  return true;
                }
              }
              return false;
            };
            _emscripten_resize_heap.sig = "ip";
            var _fd_close = (fd) => 52;
            _fd_close.sig = "ii";
            var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
            function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
              var offset = convertI32PairToI53Checked(offset_low, offset_high);
              return 70;
            }
            _fd_seek.sig = "iiiiip";
            var printCharBuffers = [null, [], []];
            var printChar = (stream, curr) => {
              var buffer = printCharBuffers[stream];
              if (curr === 0 || curr === 10) {
                (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
                buffer.length = 0;
              } else {
                buffer.push(curr);
              }
            };
            var _fd_write = (fd, iov, iovcnt, pnum) => {
              var num = 0;
              for (var i2 = 0; i2 < iovcnt; i2++) {
                var ptr = LE_HEAP_LOAD_U32((iov >> 2) * 4);
                var len = LE_HEAP_LOAD_U32((iov + 4 >> 2) * 4);
                iov += 8;
                for (var j = 0; j < len; j++) {
                  printChar(fd, HEAPU8[ptr + j]);
                }
                num += len;
              }
              LE_HEAP_STORE_U32((pnum >> 2) * 4, num);
              return 0;
            };
            _fd_write.sig = "iippp";
            function _tree_sitter_log_callback(isLexMessage, messageAddress) {
              if (currentLogCallback) {
                const message = UTF8ToString(messageAddress);
                currentLogCallback(message, isLexMessage !== 0);
              }
            }
            function _tree_sitter_parse_callback(inputBufferAddress, index, row, column, lengthAddress) {
              const INPUT_BUFFER_SIZE = 10 * 1024;
              const string = currentParseCallback(index, {
                row,
                column
              });
              if (typeof string === "string") {
                setValue(lengthAddress, string.length, "i32");
                stringToUTF16(string, inputBufferAddress, INPUT_BUFFER_SIZE);
              } else {
                setValue(lengthAddress, 0, "i32");
              }
            }
            var runtimeKeepaliveCounter = 0;
            var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
            var _proc_exit = (code) => {
              EXITSTATUS = code;
              if (!keepRuntimeAlive()) {
                Module["onExit"]?.(code);
                ABORT = true;
              }
              quit_(code, new ExitStatus(code));
            };
            _proc_exit.sig = "vi";
            var exitJS = (status, implicit) => {
              EXITSTATUS = status;
              _proc_exit(status);
            };
            var handleException = (e) => {
              if (e instanceof ExitStatus || e == "unwind") {
                return EXITSTATUS;
              }
              quit_(1, e);
            };
            var lengthBytesUTF8 = (str) => {
              var len = 0;
              for (var i2 = 0; i2 < str.length; ++i2) {
                var c = str.charCodeAt(i2);
                if (c <= 127) {
                  len++;
                } else if (c <= 2047) {
                  len += 2;
                } else if (c >= 55296 && c <= 57343) {
                  len += 4;
                  ++i2;
                } else {
                  len += 3;
                }
              }
              return len;
            };
            var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
              if (!(maxBytesToWrite > 0)) return 0;
              var startIdx = outIdx;
              var endIdx = outIdx + maxBytesToWrite - 1;
              for (var i2 = 0; i2 < str.length; ++i2) {
                var u = str.charCodeAt(i2);
                if (u >= 55296 && u <= 57343) {
                  var u1 = str.charCodeAt(++i2);
                  u = 65536 + ((u & 1023) << 10) | u1 & 1023;
                }
                if (u <= 127) {
                  if (outIdx >= endIdx) break;
                  heap[outIdx++] = u;
                } else if (u <= 2047) {
                  if (outIdx + 1 >= endIdx) break;
                  heap[outIdx++] = 192 | u >> 6;
                  heap[outIdx++] = 128 | u & 63;
                } else if (u <= 65535) {
                  if (outIdx + 2 >= endIdx) break;
                  heap[outIdx++] = 224 | u >> 12;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63;
                } else {
                  if (outIdx + 3 >= endIdx) break;
                  heap[outIdx++] = 240 | u >> 18;
                  heap[outIdx++] = 128 | u >> 12 & 63;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63;
                }
              }
              heap[outIdx] = 0;
              return outIdx - startIdx;
            };
            var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
            var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
            var stringToUTF8OnStack = (str) => {
              var size = lengthBytesUTF8(str) + 1;
              var ret = stackAlloc(size);
              stringToUTF8(str, ret, size);
              return ret;
            };
            var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
              maxBytesToWrite ??= 2147483647;
              if (maxBytesToWrite < 2) return 0;
              maxBytesToWrite -= 2;
              var startPtr = outPtr;
              var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
              for (var i2 = 0; i2 < numCharsToWrite; ++i2) {
                var codeUnit = str.charCodeAt(i2);
                LE_HEAP_STORE_I16((outPtr >> 1) * 2, codeUnit);
                outPtr += 2;
              }
              LE_HEAP_STORE_I16((outPtr >> 1) * 2, 0);
              return outPtr - startPtr;
            };
            var AsciiToString = (ptr) => {
              var str = "";
              while (1) {
                var ch = HEAPU8[ptr++];
                if (!ch) return str;
                str += String.fromCharCode(ch);
              }
            };
            var wasmImports = {
              /** @export */
              __heap_base: ___heap_base,
              /** @export */
              __indirect_function_table: wasmTable,
              /** @export */
              __memory_base: ___memory_base,
              /** @export */
              __stack_pointer: ___stack_pointer,
              /** @export */
              __table_base: ___table_base,
              /** @export */
              _abort_js: __abort_js,
              /** @export */
              _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
              /** @export */
              _emscripten_memcpy_js: __emscripten_memcpy_js,
              /** @export */
              emscripten_get_now: _emscripten_get_now,
              /** @export */
              emscripten_resize_heap: _emscripten_resize_heap,
              /** @export */
              fd_close: _fd_close,
              /** @export */
              fd_seek: _fd_seek,
              /** @export */
              fd_write: _fd_write,
              /** @export */
              memory: wasmMemory,
              /** @export */
              tree_sitter_log_callback: _tree_sitter_log_callback,
              /** @export */
              tree_sitter_parse_callback: _tree_sitter_parse_callback
            };
            var wasmExports = createWasm();
            var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();
            var ___wasm_apply_data_relocs = () => (___wasm_apply_data_relocs = wasmExports["__wasm_apply_data_relocs"])();
            var _malloc = Module["_malloc"] = (a0) => (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0);
            var _calloc = Module["_calloc"] = (a0, a1) => (_calloc = Module["_calloc"] = wasmExports["calloc"])(a0, a1);
            var _realloc = Module["_realloc"] = (a0, a1) => (_realloc = Module["_realloc"] = wasmExports["realloc"])(a0, a1);
            var _free = Module["_free"] = (a0) => (_free = Module["_free"] = wasmExports["free"])(a0);
            var _ts_language_symbol_count = Module["_ts_language_symbol_count"] = (a0) => (_ts_language_symbol_count = Module["_ts_language_symbol_count"] = wasmExports["ts_language_symbol_count"])(a0);
            var _ts_language_state_count = Module["_ts_language_state_count"] = (a0) => (_ts_language_state_count = Module["_ts_language_state_count"] = wasmExports["ts_language_state_count"])(a0);
            var _ts_language_version = Module["_ts_language_version"] = (a0) => (_ts_language_version = Module["_ts_language_version"] = wasmExports["ts_language_version"])(a0);
            var _ts_language_field_count = Module["_ts_language_field_count"] = (a0) => (_ts_language_field_count = Module["_ts_language_field_count"] = wasmExports["ts_language_field_count"])(a0);
            var _ts_language_next_state = Module["_ts_language_next_state"] = (a0, a1, a2) => (_ts_language_next_state = Module["_ts_language_next_state"] = wasmExports["ts_language_next_state"])(a0, a1, a2);
            var _ts_language_symbol_name = Module["_ts_language_symbol_name"] = (a0, a1) => (_ts_language_symbol_name = Module["_ts_language_symbol_name"] = wasmExports["ts_language_symbol_name"])(a0, a1);
            var _ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = (a0, a1, a2, a3) => (_ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = wasmExports["ts_language_symbol_for_name"])(a0, a1, a2, a3);
            var _strncmp = Module["_strncmp"] = (a0, a1, a2) => (_strncmp = Module["_strncmp"] = wasmExports["strncmp"])(a0, a1, a2);
            var _ts_language_symbol_type = Module["_ts_language_symbol_type"] = (a0, a1) => (_ts_language_symbol_type = Module["_ts_language_symbol_type"] = wasmExports["ts_language_symbol_type"])(a0, a1);
            var _ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = (a0, a1) => (_ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = wasmExports["ts_language_field_name_for_id"])(a0, a1);
            var _ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = (a0, a1) => (_ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = wasmExports["ts_lookahead_iterator_new"])(a0, a1);
            var _ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = (a0) => (_ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = wasmExports["ts_lookahead_iterator_delete"])(a0);
            var _ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = (a0, a1) => (_ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = wasmExports["ts_lookahead_iterator_reset_state"])(a0, a1);
            var _ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = (a0, a1, a2) => (_ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = wasmExports["ts_lookahead_iterator_reset"])(a0, a1, a2);
            var _ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = (a0) => (_ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = wasmExports["ts_lookahead_iterator_next"])(a0);
            var _ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = (a0) => (_ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = wasmExports["ts_lookahead_iterator_current_symbol"])(a0);
            var _memset = Module["_memset"] = (a0, a1, a2) => (_memset = Module["_memset"] = wasmExports["memset"])(a0, a1, a2);
            var _memcpy = Module["_memcpy"] = (a0, a1, a2) => (_memcpy = Module["_memcpy"] = wasmExports["memcpy"])(a0, a1, a2);
            var _ts_parser_delete = Module["_ts_parser_delete"] = (a0) => (_ts_parser_delete = Module["_ts_parser_delete"] = wasmExports["ts_parser_delete"])(a0);
            var _ts_parser_reset = Module["_ts_parser_reset"] = (a0) => (_ts_parser_reset = Module["_ts_parser_reset"] = wasmExports["ts_parser_reset"])(a0);
            var _ts_parser_set_language = Module["_ts_parser_set_language"] = (a0, a1) => (_ts_parser_set_language = Module["_ts_parser_set_language"] = wasmExports["ts_parser_set_language"])(a0, a1);
            var _ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = (a0) => (_ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = wasmExports["ts_parser_timeout_micros"])(a0);
            var _ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = (a0, a1, a2) => (_ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = wasmExports["ts_parser_set_timeout_micros"])(a0, a1, a2);
            var _ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = (a0, a1, a2) => (_ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = wasmExports["ts_parser_set_included_ranges"])(a0, a1, a2);
            var _memmove = Module["_memmove"] = (a0, a1, a2) => (_memmove = Module["_memmove"] = wasmExports["memmove"])(a0, a1, a2);
            var _memcmp = Module["_memcmp"] = (a0, a1, a2) => (_memcmp = Module["_memcmp"] = wasmExports["memcmp"])(a0, a1, a2);
            var _ts_query_new = Module["_ts_query_new"] = (a0, a1, a2, a3, a4) => (_ts_query_new = Module["_ts_query_new"] = wasmExports["ts_query_new"])(a0, a1, a2, a3, a4);
            var _ts_query_delete = Module["_ts_query_delete"] = (a0) => (_ts_query_delete = Module["_ts_query_delete"] = wasmExports["ts_query_delete"])(a0);
            var _iswspace = Module["_iswspace"] = (a0) => (_iswspace = Module["_iswspace"] = wasmExports["iswspace"])(a0);
            var _iswalnum = Module["_iswalnum"] = (a0) => (_iswalnum = Module["_iswalnum"] = wasmExports["iswalnum"])(a0);
            var _ts_query_pattern_count = Module["_ts_query_pattern_count"] = (a0) => (_ts_query_pattern_count = Module["_ts_query_pattern_count"] = wasmExports["ts_query_pattern_count"])(a0);
            var _ts_query_capture_count = Module["_ts_query_capture_count"] = (a0) => (_ts_query_capture_count = Module["_ts_query_capture_count"] = wasmExports["ts_query_capture_count"])(a0);
            var _ts_query_string_count = Module["_ts_query_string_count"] = (a0) => (_ts_query_string_count = Module["_ts_query_string_count"] = wasmExports["ts_query_string_count"])(a0);
            var _ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = (a0, a1, a2) => (_ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = wasmExports["ts_query_capture_name_for_id"])(a0, a1, a2);
            var _ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = (a0, a1, a2) => (_ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = wasmExports["ts_query_string_value_for_id"])(a0, a1, a2);
            var _ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = (a0, a1, a2) => (_ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = wasmExports["ts_query_predicates_for_pattern"])(a0, a1, a2);
            var _ts_query_disable_capture = Module["_ts_query_disable_capture"] = (a0, a1, a2) => (_ts_query_disable_capture = Module["_ts_query_disable_capture"] = wasmExports["ts_query_disable_capture"])(a0, a1, a2);
            var _ts_tree_copy = Module["_ts_tree_copy"] = (a0) => (_ts_tree_copy = Module["_ts_tree_copy"] = wasmExports["ts_tree_copy"])(a0);
            var _ts_tree_delete = Module["_ts_tree_delete"] = (a0) => (_ts_tree_delete = Module["_ts_tree_delete"] = wasmExports["ts_tree_delete"])(a0);
            var _ts_init = Module["_ts_init"] = () => (_ts_init = Module["_ts_init"] = wasmExports["ts_init"])();
            var _ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = () => (_ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = wasmExports["ts_parser_new_wasm"])();
            var _ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = (a0, a1) => (_ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = wasmExports["ts_parser_enable_logger_wasm"])(a0, a1);
            var _ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = (a0, a1, a2, a3, a4) => (_ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = wasmExports["ts_parser_parse_wasm"])(a0, a1, a2, a3, a4);
            var _ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = (a0) => (_ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = wasmExports["ts_parser_included_ranges_wasm"])(a0);
            var _ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = (a0, a1) => (_ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = wasmExports["ts_language_type_is_named_wasm"])(a0, a1);
            var _ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = (a0, a1) => (_ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = wasmExports["ts_language_type_is_visible_wasm"])(a0, a1);
            var _ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = (a0) => (_ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = wasmExports["ts_tree_root_node_wasm"])(a0);
            var _ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = (a0) => (_ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = wasmExports["ts_tree_root_node_with_offset_wasm"])(a0);
            var _ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = (a0) => (_ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = wasmExports["ts_tree_edit_wasm"])(a0);
            var _ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = (a0) => (_ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = wasmExports["ts_tree_included_ranges_wasm"])(a0);
            var _ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = (a0, a1) => (_ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = wasmExports["ts_tree_get_changed_ranges_wasm"])(a0, a1);
            var _ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = (a0) => (_ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = wasmExports["ts_tree_cursor_new_wasm"])(a0);
            var _ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = (a0) => (_ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = wasmExports["ts_tree_cursor_delete_wasm"])(a0);
            var _ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = (a0) => (_ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = wasmExports["ts_tree_cursor_reset_wasm"])(a0);
            var _ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = (a0, a1) => (_ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = wasmExports["ts_tree_cursor_reset_to_wasm"])(a0, a1);
            var _ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_wasm"])(a0);
            var _ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = (a0) => (_ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = wasmExports["ts_tree_cursor_goto_last_child_wasm"])(a0);
            var _ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_index_wasm"])(a0);
            var _ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_position_wasm"])(a0);
            var _ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = (a0) => (_ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_next_sibling_wasm"])(a0);
            var _ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = (a0) => (_ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_previous_sibling_wasm"])(a0);
            var _ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = (a0, a1) => (_ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = wasmExports["ts_tree_cursor_goto_descendant_wasm"])(a0, a1);
            var _ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = (a0) => (_ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = wasmExports["ts_tree_cursor_goto_parent_wasm"])(a0);
            var _ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = wasmExports["ts_tree_cursor_current_node_type_id_wasm"])(a0);
            var _ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = wasmExports["ts_tree_cursor_current_node_state_id_wasm"])(a0);
            var _ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = (a0) => (_ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = wasmExports["ts_tree_cursor_current_node_is_named_wasm"])(a0);
            var _ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = (a0) => (_ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = wasmExports["ts_tree_cursor_current_node_is_missing_wasm"])(a0);
            var _ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = wasmExports["ts_tree_cursor_current_node_id_wasm"])(a0);
            var _ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = (a0) => (_ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = wasmExports["ts_tree_cursor_start_position_wasm"])(a0);
            var _ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = (a0) => (_ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = wasmExports["ts_tree_cursor_end_position_wasm"])(a0);
            var _ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = (a0) => (_ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = wasmExports["ts_tree_cursor_start_index_wasm"])(a0);
            var _ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = (a0) => (_ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = wasmExports["ts_tree_cursor_end_index_wasm"])(a0);
            var _ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = (a0) => (_ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = wasmExports["ts_tree_cursor_current_field_id_wasm"])(a0);
            var _ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = (a0) => (_ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = wasmExports["ts_tree_cursor_current_depth_wasm"])(a0);
            var _ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = (a0) => (_ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = wasmExports["ts_tree_cursor_current_descendant_index_wasm"])(a0);
            var _ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = (a0) => (_ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = wasmExports["ts_tree_cursor_current_node_wasm"])(a0);
            var _ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = (a0) => (_ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = wasmExports["ts_node_symbol_wasm"])(a0);
            var _ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = (a0, a1) => (_ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = wasmExports["ts_node_field_name_for_child_wasm"])(a0, a1);
            var _ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = (a0, a1) => (_ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = wasmExports["ts_node_children_by_field_id_wasm"])(a0, a1);
            var _ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = (a0) => (_ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = wasmExports["ts_node_first_child_for_byte_wasm"])(a0);
            var _ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = (a0) => (_ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = wasmExports["ts_node_first_named_child_for_byte_wasm"])(a0);
            var _ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = (a0) => (_ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = wasmExports["ts_node_grammar_symbol_wasm"])(a0);
            var _ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = (a0) => (_ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = wasmExports["ts_node_child_count_wasm"])(a0);
            var _ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = (a0) => (_ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = wasmExports["ts_node_named_child_count_wasm"])(a0);
            var _ts_node_child_wasm = Module["_ts_node_child_wasm"] = (a0, a1) => (_ts_node_child_wasm = Module["_ts_node_child_wasm"] = wasmExports["ts_node_child_wasm"])(a0, a1);
            var _ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = (a0, a1) => (_ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = wasmExports["ts_node_named_child_wasm"])(a0, a1);
            var _ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = (a0, a1) => (_ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = wasmExports["ts_node_child_by_field_id_wasm"])(a0, a1);
            var _ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = (a0) => (_ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = wasmExports["ts_node_next_sibling_wasm"])(a0);
            var _ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = (a0) => (_ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = wasmExports["ts_node_prev_sibling_wasm"])(a0);
            var _ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = (a0) => (_ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = wasmExports["ts_node_next_named_sibling_wasm"])(a0);
            var _ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = (a0) => (_ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = wasmExports["ts_node_prev_named_sibling_wasm"])(a0);
            var _ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = (a0) => (_ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = wasmExports["ts_node_descendant_count_wasm"])(a0);
            var _ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = (a0) => (_ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = wasmExports["ts_node_parent_wasm"])(a0);
            var _ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = (a0) => (_ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = wasmExports["ts_node_descendant_for_index_wasm"])(a0);
            var _ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = (a0) => (_ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = wasmExports["ts_node_named_descendant_for_index_wasm"])(a0);
            var _ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = (a0) => (_ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = wasmExports["ts_node_descendant_for_position_wasm"])(a0);
            var _ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = (a0) => (_ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = wasmExports["ts_node_named_descendant_for_position_wasm"])(a0);
            var _ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = (a0) => (_ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = wasmExports["ts_node_start_point_wasm"])(a0);
            var _ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = (a0) => (_ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = wasmExports["ts_node_end_point_wasm"])(a0);
            var _ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = (a0) => (_ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = wasmExports["ts_node_start_index_wasm"])(a0);
            var _ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = (a0) => (_ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = wasmExports["ts_node_end_index_wasm"])(a0);
            var _ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = (a0) => (_ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = wasmExports["ts_node_to_string_wasm"])(a0);
            var _ts_node_children_wasm = Module["_ts_node_children_wasm"] = (a0) => (_ts_node_children_wasm = Module["_ts_node_children_wasm"] = wasmExports["ts_node_children_wasm"])(a0);
            var _ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = (a0) => (_ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = wasmExports["ts_node_named_children_wasm"])(a0);
            var _ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = (a0, a1, a2, a3, a4, a5, a6) => (_ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = wasmExports["ts_node_descendants_of_type_wasm"])(a0, a1, a2, a3, a4, a5, a6);
            var _ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = (a0) => (_ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = wasmExports["ts_node_is_named_wasm"])(a0);
            var _ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = (a0) => (_ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = wasmExports["ts_node_has_changes_wasm"])(a0);
            var _ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = (a0) => (_ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = wasmExports["ts_node_has_error_wasm"])(a0);
            var _ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = (a0) => (_ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = wasmExports["ts_node_is_error_wasm"])(a0);
            var _ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = (a0) => (_ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = wasmExports["ts_node_is_missing_wasm"])(a0);
            var _ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = (a0) => (_ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = wasmExports["ts_node_is_extra_wasm"])(a0);
            var _ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = (a0) => (_ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = wasmExports["ts_node_parse_state_wasm"])(a0);
            var _ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = (a0) => (_ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = wasmExports["ts_node_next_parse_state_wasm"])(a0);
            var _ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = wasmExports["ts_query_matches_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
            var _ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = wasmExports["ts_query_captures_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
            var _iswalpha = Module["_iswalpha"] = (a0) => (_iswalpha = Module["_iswalpha"] = wasmExports["iswalpha"])(a0);
            var _iswblank = Module["_iswblank"] = (a0) => (_iswblank = Module["_iswblank"] = wasmExports["iswblank"])(a0);
            var _iswdigit = Module["_iswdigit"] = (a0) => (_iswdigit = Module["_iswdigit"] = wasmExports["iswdigit"])(a0);
            var _iswlower = Module["_iswlower"] = (a0) => (_iswlower = Module["_iswlower"] = wasmExports["iswlower"])(a0);
            var _iswupper = Module["_iswupper"] = (a0) => (_iswupper = Module["_iswupper"] = wasmExports["iswupper"])(a0);
            var _iswxdigit = Module["_iswxdigit"] = (a0) => (_iswxdigit = Module["_iswxdigit"] = wasmExports["iswxdigit"])(a0);
            var _memchr = Module["_memchr"] = (a0, a1, a2) => (_memchr = Module["_memchr"] = wasmExports["memchr"])(a0, a1, a2);
            var _strlen = Module["_strlen"] = (a0) => (_strlen = Module["_strlen"] = wasmExports["strlen"])(a0);
            var _strcmp = Module["_strcmp"] = (a0, a1) => (_strcmp = Module["_strcmp"] = wasmExports["strcmp"])(a0, a1);
            var _strncat = Module["_strncat"] = (a0, a1, a2) => (_strncat = Module["_strncat"] = wasmExports["strncat"])(a0, a1, a2);
            var _strncpy = Module["_strncpy"] = (a0, a1, a2) => (_strncpy = Module["_strncpy"] = wasmExports["strncpy"])(a0, a1, a2);
            var _towlower = Module["_towlower"] = (a0) => (_towlower = Module["_towlower"] = wasmExports["towlower"])(a0);
            var _towupper = Module["_towupper"] = (a0) => (_towupper = Module["_towupper"] = wasmExports["towupper"])(a0);
            var _setThrew = (a0, a1) => (_setThrew = wasmExports["setThrew"])(a0, a1);
            var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);
            var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);
            var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();
            var dynCall_jiji = Module["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module["dynCall_jiji"] = wasmExports["dynCall_jiji"])(a0, a1, a2, a3, a4);
            var _orig$ts_parser_timeout_micros = Module["_orig$ts_parser_timeout_micros"] = (a0) => (_orig$ts_parser_timeout_micros = Module["_orig$ts_parser_timeout_micros"] = wasmExports["orig$ts_parser_timeout_micros"])(a0);
            var _orig$ts_parser_set_timeout_micros = Module["_orig$ts_parser_set_timeout_micros"] = (a0, a1) => (_orig$ts_parser_set_timeout_micros = Module["_orig$ts_parser_set_timeout_micros"] = wasmExports["orig$ts_parser_set_timeout_micros"])(a0, a1);
            Module["AsciiToString"] = AsciiToString;
            Module["stringToUTF16"] = stringToUTF16;
            var calledRun;
            dependenciesFulfilled = function runCaller() {
              if (!calledRun) run();
              if (!calledRun) dependenciesFulfilled = runCaller;
            };
            function callMain(args2 = []) {
              var entryFunction = resolveGlobalSymbol("main").sym;
              if (!entryFunction) return;
              args2.unshift(thisProgram);
              var argc = args2.length;
              var argv = stackAlloc((argc + 1) * 4);
              var argv_ptr = argv;
              args2.forEach((arg) => {
                LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, stringToUTF8OnStack(arg));
                argv_ptr += 4;
              });
              LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, 0);
              try {
                var ret = entryFunction(argc, argv);
                exitJS(
                  ret,
                  /* implicit = */
                  true
                );
                return ret;
              } catch (e) {
                return handleException(e);
              }
            }
            function run(args2 = arguments_) {
              if (runDependencies > 0) {
                return;
              }
              preRun();
              if (runDependencies > 0) {
                return;
              }
              function doRun() {
                if (calledRun) return;
                calledRun = true;
                Module["calledRun"] = true;
                if (ABORT) return;
                initRuntime();
                preMain();
                Module["onRuntimeInitialized"]?.();
                if (shouldRunNow) callMain(args2);
                postRun();
              }
              if (Module["setStatus"]) {
                Module["setStatus"]("Running...");
                setTimeout(function() {
                  setTimeout(function() {
                    Module["setStatus"]("");
                  }, 1);
                  doRun();
                }, 1);
              } else {
                doRun();
              }
            }
            if (Module["preInit"]) {
              if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
              while (Module["preInit"].length > 0) {
                Module["preInit"].pop()();
              }
            }
            var shouldRunNow = true;
            if (Module["noInitialRun"]) shouldRunNow = false;
            run();
            const C = Module;
            const INTERNAL = {};
            const SIZE_OF_INT = 4;
            const SIZE_OF_CURSOR = 4 * SIZE_OF_INT;
            const SIZE_OF_NODE = 5 * SIZE_OF_INT;
            const SIZE_OF_POINT = 2 * SIZE_OF_INT;
            const SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT;
            const ZERO_POINT = {
              row: 0,
              column: 0
            };
            const QUERY_WORD_REGEX = /[\w-.]*/g;
            const PREDICATE_STEP_TYPE_CAPTURE = 1;
            const PREDICATE_STEP_TYPE_STRING = 2;
            const LANGUAGE_FUNCTION_REGEX = /^_?tree_sitter_\w+/;
            let VERSION;
            let MIN_COMPATIBLE_VERSION;
            let TRANSFER_BUFFER;
            let currentParseCallback;
            let currentLogCallback;
            class ParserImpl {
              static init() {
                TRANSFER_BUFFER = C._ts_init();
                VERSION = getValue(TRANSFER_BUFFER, "i32");
                MIN_COMPATIBLE_VERSION = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
              }
              initialize() {
                C._ts_parser_new_wasm();
                this[0] = getValue(TRANSFER_BUFFER, "i32");
                this[1] = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
              }
              delete() {
                C._ts_parser_delete(this[0]);
                C._free(this[1]);
                this[0] = 0;
                this[1] = 0;
              }
              setLanguage(language) {
                let address;
                if (!language) {
                  address = 0;
                  language = null;
                } else if (language.constructor === Language) {
                  address = language[0];
                  const version = C._ts_language_version(address);
                  if (version < MIN_COMPATIBLE_VERSION || VERSION < version) {
                    throw new Error(`Incompatible language version ${version}. Compatibility range ${MIN_COMPATIBLE_VERSION} through ${VERSION}.`);
                  }
                } else {
                  throw new Error("Argument must be a Language");
                }
                this.language = language;
                C._ts_parser_set_language(this[0], address);
                return this;
              }
              getLanguage() {
                return this.language;
              }
              parse(callback, oldTree, options) {
                if (typeof callback === "string") {
                  currentParseCallback = (index, _) => callback.slice(index);
                } else if (typeof callback === "function") {
                  currentParseCallback = callback;
                } else {
                  throw new Error("Argument must be a string or a function");
                }
                if (this.logCallback) {
                  currentLogCallback = this.logCallback;
                  C._ts_parser_enable_logger_wasm(this[0], 1);
                } else {
                  currentLogCallback = null;
                  C._ts_parser_enable_logger_wasm(this[0], 0);
                }
                let rangeCount = 0;
                let rangeAddress = 0;
                if (options?.includedRanges) {
                  rangeCount = options.includedRanges.length;
                  rangeAddress = C._calloc(rangeCount, SIZE_OF_RANGE);
                  let address = rangeAddress;
                  for (let i2 = 0; i2 < rangeCount; i2++) {
                    marshalRange(address, options.includedRanges[i2]);
                    address += SIZE_OF_RANGE;
                  }
                }
                const treeAddress = C._ts_parser_parse_wasm(this[0], this[1], oldTree ? oldTree[0] : 0, rangeAddress, rangeCount);
                if (!treeAddress) {
                  currentParseCallback = null;
                  currentLogCallback = null;
                  throw new Error("Parsing failed");
                }
                const result = new Tree(INTERNAL, treeAddress, this.language, currentParseCallback);
                currentParseCallback = null;
                currentLogCallback = null;
                return result;
              }
              reset() {
                C._ts_parser_reset(this[0]);
              }
              getIncludedRanges() {
                C._ts_parser_included_ranges_wasm(this[0]);
                const count = getValue(TRANSFER_BUFFER, "i32");
                const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const result = new Array(count);
                if (count > 0) {
                  let address = buffer;
                  for (let i2 = 0; i2 < count; i2++) {
                    result[i2] = unmarshalRange(address);
                    address += SIZE_OF_RANGE;
                  }
                  C._free(buffer);
                }
                return result;
              }
              getTimeoutMicros() {
                return C._ts_parser_timeout_micros(this[0]);
              }
              setTimeoutMicros(timeout) {
                C._ts_parser_set_timeout_micros(this[0], timeout);
              }
              setLogger(callback) {
                if (!callback) {
                  callback = null;
                } else if (typeof callback !== "function") {
                  throw new Error("Logger callback must be a function");
                }
                this.logCallback = callback;
                return this;
              }
              getLogger() {
                return this.logCallback;
              }
            }
            class Tree {
              constructor(internal, address, language, textCallback) {
                assertInternal(internal);
                this[0] = address;
                this.language = language;
                this.textCallback = textCallback;
              }
              copy() {
                const address = C._ts_tree_copy(this[0]);
                return new Tree(INTERNAL, address, this.language, this.textCallback);
              }
              delete() {
                C._ts_tree_delete(this[0]);
                this[0] = 0;
              }
              edit(edit) {
                marshalEdit(edit);
                C._ts_tree_edit_wasm(this[0]);
              }
              get rootNode() {
                C._ts_tree_root_node_wasm(this[0]);
                return unmarshalNode(this);
              }
              rootNodeWithOffset(offsetBytes, offsetExtent) {
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                setValue(address, offsetBytes, "i32");
                marshalPoint(address + SIZE_OF_INT, offsetExtent);
                C._ts_tree_root_node_with_offset_wasm(this[0]);
                return unmarshalNode(this);
              }
              getLanguage() {
                return this.language;
              }
              walk() {
                return this.rootNode.walk();
              }
              getChangedRanges(other) {
                if (other.constructor !== Tree) {
                  throw new TypeError("Argument must be a Tree");
                }
                C._ts_tree_get_changed_ranges_wasm(this[0], other[0]);
                const count = getValue(TRANSFER_BUFFER, "i32");
                const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const result = new Array(count);
                if (count > 0) {
                  let address = buffer;
                  for (let i2 = 0; i2 < count; i2++) {
                    result[i2] = unmarshalRange(address);
                    address += SIZE_OF_RANGE;
                  }
                  C._free(buffer);
                }
                return result;
              }
              getIncludedRanges() {
                C._ts_tree_included_ranges_wasm(this[0]);
                const count = getValue(TRANSFER_BUFFER, "i32");
                const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const result = new Array(count);
                if (count > 0) {
                  let address = buffer;
                  for (let i2 = 0; i2 < count; i2++) {
                    result[i2] = unmarshalRange(address);
                    address += SIZE_OF_RANGE;
                  }
                  C._free(buffer);
                }
                return result;
              }
            }
            class Node {
              constructor(internal, tree) {
                assertInternal(internal);
                this.tree = tree;
              }
              get typeId() {
                marshalNode(this);
                return C._ts_node_symbol_wasm(this.tree[0]);
              }
              get grammarId() {
                marshalNode(this);
                return C._ts_node_grammar_symbol_wasm(this.tree[0]);
              }
              get type() {
                return this.tree.language.types[this.typeId] || "ERROR";
              }
              get grammarType() {
                return this.tree.language.types[this.grammarId] || "ERROR";
              }
              get endPosition() {
                marshalNode(this);
                C._ts_node_end_point_wasm(this.tree[0]);
                return unmarshalPoint(TRANSFER_BUFFER);
              }
              get endIndex() {
                marshalNode(this);
                return C._ts_node_end_index_wasm(this.tree[0]);
              }
              get text() {
                return getText(this.tree, this.startIndex, this.endIndex);
              }
              get parseState() {
                marshalNode(this);
                return C._ts_node_parse_state_wasm(this.tree[0]);
              }
              get nextParseState() {
                marshalNode(this);
                return C._ts_node_next_parse_state_wasm(this.tree[0]);
              }
              get isNamed() {
                marshalNode(this);
                return C._ts_node_is_named_wasm(this.tree[0]) === 1;
              }
              get hasError() {
                marshalNode(this);
                return C._ts_node_has_error_wasm(this.tree[0]) === 1;
              }
              get hasChanges() {
                marshalNode(this);
                return C._ts_node_has_changes_wasm(this.tree[0]) === 1;
              }
              get isError() {
                marshalNode(this);
                return C._ts_node_is_error_wasm(this.tree[0]) === 1;
              }
              get isMissing() {
                marshalNode(this);
                return C._ts_node_is_missing_wasm(this.tree[0]) === 1;
              }
              get isExtra() {
                marshalNode(this);
                return C._ts_node_is_extra_wasm(this.tree[0]) === 1;
              }
              equals(other) {
                return this.id === other.id;
              }
              child(index) {
                marshalNode(this);
                C._ts_node_child_wasm(this.tree[0], index);
                return unmarshalNode(this.tree);
              }
              namedChild(index) {
                marshalNode(this);
                C._ts_node_named_child_wasm(this.tree[0], index);
                return unmarshalNode(this.tree);
              }
              childForFieldId(fieldId) {
                marshalNode(this);
                C._ts_node_child_by_field_id_wasm(this.tree[0], fieldId);
                return unmarshalNode(this.tree);
              }
              childForFieldName(fieldName) {
                const fieldId = this.tree.language.fields.indexOf(fieldName);
                if (fieldId !== -1) return this.childForFieldId(fieldId);
                return null;
              }
              fieldNameForChild(index) {
                marshalNode(this);
                const address = C._ts_node_field_name_for_child_wasm(this.tree[0], index);
                if (!address) {
                  return null;
                }
                const result = AsciiToString(address);
                return result;
              }
              childrenForFieldName(fieldName) {
                const fieldId = this.tree.language.fields.indexOf(fieldName);
                if (fieldId !== -1 && fieldId !== 0) return this.childrenForFieldId(fieldId);
                return [];
              }
              childrenForFieldId(fieldId) {
                marshalNode(this);
                C._ts_node_children_by_field_id_wasm(this.tree[0], fieldId);
                const count = getValue(TRANSFER_BUFFER, "i32");
                const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const result = new Array(count);
                if (count > 0) {
                  let address = buffer;
                  for (let i2 = 0; i2 < count; i2++) {
                    result[i2] = unmarshalNode(this.tree, address);
                    address += SIZE_OF_NODE;
                  }
                  C._free(buffer);
                }
                return result;
              }
              firstChildForIndex(index) {
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                setValue(address, index, "i32");
                C._ts_node_first_child_for_byte_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              firstNamedChildForIndex(index) {
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                setValue(address, index, "i32");
                C._ts_node_first_named_child_for_byte_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get childCount() {
                marshalNode(this);
                return C._ts_node_child_count_wasm(this.tree[0]);
              }
              get namedChildCount() {
                marshalNode(this);
                return C._ts_node_named_child_count_wasm(this.tree[0]);
              }
              get firstChild() {
                return this.child(0);
              }
              get firstNamedChild() {
                return this.namedChild(0);
              }
              get lastChild() {
                return this.child(this.childCount - 1);
              }
              get lastNamedChild() {
                return this.namedChild(this.namedChildCount - 1);
              }
              get children() {
                if (!this._children) {
                  marshalNode(this);
                  C._ts_node_children_wasm(this.tree[0]);
                  const count = getValue(TRANSFER_BUFFER, "i32");
                  const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                  this._children = new Array(count);
                  if (count > 0) {
                    let address = buffer;
                    for (let i2 = 0; i2 < count; i2++) {
                      this._children[i2] = unmarshalNode(this.tree, address);
                      address += SIZE_OF_NODE;
                    }
                    C._free(buffer);
                  }
                }
                return this._children;
              }
              get namedChildren() {
                if (!this._namedChildren) {
                  marshalNode(this);
                  C._ts_node_named_children_wasm(this.tree[0]);
                  const count = getValue(TRANSFER_BUFFER, "i32");
                  const buffer = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                  this._namedChildren = new Array(count);
                  if (count > 0) {
                    let address = buffer;
                    for (let i2 = 0; i2 < count; i2++) {
                      this._namedChildren[i2] = unmarshalNode(this.tree, address);
                      address += SIZE_OF_NODE;
                    }
                    C._free(buffer);
                  }
                }
                return this._namedChildren;
              }
              descendantsOfType(types, startPosition, endPosition) {
                if (!Array.isArray(types)) types = [types];
                if (!startPosition) startPosition = ZERO_POINT;
                if (!endPosition) endPosition = ZERO_POINT;
                const symbols = [];
                const typesBySymbol = this.tree.language.types;
                for (let i2 = 0, n = typesBySymbol.length; i2 < n; i2++) {
                  if (types.includes(typesBySymbol[i2])) {
                    symbols.push(i2);
                  }
                }
                const symbolsAddress = C._malloc(SIZE_OF_INT * symbols.length);
                for (let i2 = 0, n = symbols.length; i2 < n; i2++) {
                  setValue(symbolsAddress + i2 * SIZE_OF_INT, symbols[i2], "i32");
                }
                marshalNode(this);
                C._ts_node_descendants_of_type_wasm(this.tree[0], symbolsAddress, symbols.length, startPosition.row, startPosition.column, endPosition.row, endPosition.column);
                const descendantCount = getValue(TRANSFER_BUFFER, "i32");
                const descendantAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const result = new Array(descendantCount);
                if (descendantCount > 0) {
                  let address = descendantAddress;
                  for (let i2 = 0; i2 < descendantCount; i2++) {
                    result[i2] = unmarshalNode(this.tree, address);
                    address += SIZE_OF_NODE;
                  }
                }
                C._free(descendantAddress);
                C._free(symbolsAddress);
                return result;
              }
              get nextSibling() {
                marshalNode(this);
                C._ts_node_next_sibling_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get previousSibling() {
                marshalNode(this);
                C._ts_node_prev_sibling_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get nextNamedSibling() {
                marshalNode(this);
                C._ts_node_next_named_sibling_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get previousNamedSibling() {
                marshalNode(this);
                C._ts_node_prev_named_sibling_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get descendantCount() {
                marshalNode(this);
                return C._ts_node_descendant_count_wasm(this.tree[0]);
              }
              get parent() {
                marshalNode(this);
                C._ts_node_parent_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              descendantForIndex(start2, end = start2) {
                if (typeof start2 !== "number" || typeof end !== "number") {
                  throw new Error("Arguments must be numbers");
                }
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                setValue(address, start2, "i32");
                setValue(address + SIZE_OF_INT, end, "i32");
                C._ts_node_descendant_for_index_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              namedDescendantForIndex(start2, end = start2) {
                if (typeof start2 !== "number" || typeof end !== "number") {
                  throw new Error("Arguments must be numbers");
                }
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                setValue(address, start2, "i32");
                setValue(address + SIZE_OF_INT, end, "i32");
                C._ts_node_named_descendant_for_index_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              descendantForPosition(start2, end = start2) {
                if (!isPoint(start2) || !isPoint(end)) {
                  throw new Error("Arguments must be {row, column} objects");
                }
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                marshalPoint(address, start2);
                marshalPoint(address + SIZE_OF_POINT, end);
                C._ts_node_descendant_for_position_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              namedDescendantForPosition(start2, end = start2) {
                if (!isPoint(start2) || !isPoint(end)) {
                  throw new Error("Arguments must be {row, column} objects");
                }
                marshalNode(this);
                const address = TRANSFER_BUFFER + SIZE_OF_NODE;
                marshalPoint(address, start2);
                marshalPoint(address + SIZE_OF_POINT, end);
                C._ts_node_named_descendant_for_position_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              walk() {
                marshalNode(this);
                C._ts_tree_cursor_new_wasm(this.tree[0]);
                return new TreeCursor(INTERNAL, this.tree);
              }
              toString() {
                marshalNode(this);
                const address = C._ts_node_to_string_wasm(this.tree[0]);
                const result = AsciiToString(address);
                C._free(address);
                return result;
              }
            }
            class TreeCursor {
              constructor(internal, tree) {
                assertInternal(internal);
                this.tree = tree;
                unmarshalTreeCursor(this);
              }
              delete() {
                marshalTreeCursor(this);
                C._ts_tree_cursor_delete_wasm(this.tree[0]);
                this[0] = this[1] = this[2] = 0;
              }
              reset(node) {
                marshalNode(node);
                marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE);
                C._ts_tree_cursor_reset_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
              }
              resetTo(cursor) {
                marshalTreeCursor(this, TRANSFER_BUFFER);
                marshalTreeCursor(cursor, TRANSFER_BUFFER + SIZE_OF_CURSOR);
                C._ts_tree_cursor_reset_to_wasm(this.tree[0], cursor.tree[0]);
                unmarshalTreeCursor(this);
              }
              get nodeType() {
                return this.tree.language.types[this.nodeTypeId] || "ERROR";
              }
              get nodeTypeId() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0]);
              }
              get nodeStateId() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_node_state_id_wasm(this.tree[0]);
              }
              get nodeId() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_node_id_wasm(this.tree[0]);
              }
              get nodeIsNamed() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0]) === 1;
              }
              get nodeIsMissing() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0]) === 1;
              }
              get nodeText() {
                marshalTreeCursor(this);
                const startIndex = C._ts_tree_cursor_start_index_wasm(this.tree[0]);
                const endIndex = C._ts_tree_cursor_end_index_wasm(this.tree[0]);
                return getText(this.tree, startIndex, endIndex);
              }
              get startPosition() {
                marshalTreeCursor(this);
                C._ts_tree_cursor_start_position_wasm(this.tree[0]);
                return unmarshalPoint(TRANSFER_BUFFER);
              }
              get endPosition() {
                marshalTreeCursor(this);
                C._ts_tree_cursor_end_position_wasm(this.tree[0]);
                return unmarshalPoint(TRANSFER_BUFFER);
              }
              get startIndex() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_start_index_wasm(this.tree[0]);
              }
              get endIndex() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_end_index_wasm(this.tree[0]);
              }
              get currentNode() {
                marshalTreeCursor(this);
                C._ts_tree_cursor_current_node_wasm(this.tree[0]);
                return unmarshalNode(this.tree);
              }
              get currentFieldId() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_field_id_wasm(this.tree[0]);
              }
              get currentFieldName() {
                return this.tree.language.fields[this.currentFieldId];
              }
              get currentDepth() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_depth_wasm(this.tree[0]);
              }
              get currentDescendantIndex() {
                marshalTreeCursor(this);
                return C._ts_tree_cursor_current_descendant_index_wasm(this.tree[0]);
              }
              gotoFirstChild() {
                marshalTreeCursor(this);
                const result = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoLastChild() {
                marshalTreeCursor(this);
                const result = C._ts_tree_cursor_goto_last_child_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoFirstChildForIndex(goalIndex) {
                marshalTreeCursor(this);
                setValue(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalIndex, "i32");
                const result = C._ts_tree_cursor_goto_first_child_for_index_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoFirstChildForPosition(goalPosition) {
                marshalTreeCursor(this);
                marshalPoint(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalPosition);
                const result = C._ts_tree_cursor_goto_first_child_for_position_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoNextSibling() {
                marshalTreeCursor(this);
                const result = C._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoPreviousSibling() {
                marshalTreeCursor(this);
                const result = C._ts_tree_cursor_goto_previous_sibling_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
              gotoDescendant(goalDescendantindex) {
                marshalTreeCursor(this);
                C._ts_tree_cursor_goto_descendant_wasm(this.tree[0], goalDescendantindex);
                unmarshalTreeCursor(this);
              }
              gotoParent() {
                marshalTreeCursor(this);
                const result = C._ts_tree_cursor_goto_parent_wasm(this.tree[0]);
                unmarshalTreeCursor(this);
                return result === 1;
              }
            }
            class Language {
              constructor(internal, address) {
                assertInternal(internal);
                this[0] = address;
                this.types = new Array(C._ts_language_symbol_count(this[0]));
                for (let i2 = 0, n = this.types.length; i2 < n; i2++) {
                  if (C._ts_language_symbol_type(this[0], i2) < 2) {
                    this.types[i2] = UTF8ToString(C._ts_language_symbol_name(this[0], i2));
                  }
                }
                this.fields = new Array(C._ts_language_field_count(this[0]) + 1);
                for (let i2 = 0, n = this.fields.length; i2 < n; i2++) {
                  const fieldName = C._ts_language_field_name_for_id(this[0], i2);
                  if (fieldName !== 0) {
                    this.fields[i2] = UTF8ToString(fieldName);
                  } else {
                    this.fields[i2] = null;
                  }
                }
              }
              get version() {
                return C._ts_language_version(this[0]);
              }
              get fieldCount() {
                return this.fields.length - 1;
              }
              get stateCount() {
                return C._ts_language_state_count(this[0]);
              }
              fieldIdForName(fieldName) {
                const result = this.fields.indexOf(fieldName);
                if (result !== -1) {
                  return result;
                } else {
                  return null;
                }
              }
              fieldNameForId(fieldId) {
                return this.fields[fieldId] || null;
              }
              idForNodeType(type, named) {
                const typeLength = lengthBytesUTF8(type);
                const typeAddress = C._malloc(typeLength + 1);
                stringToUTF8(type, typeAddress, typeLength + 1);
                const result = C._ts_language_symbol_for_name(this[0], typeAddress, typeLength, named);
                C._free(typeAddress);
                return result || null;
              }
              get nodeTypeCount() {
                return C._ts_language_symbol_count(this[0]);
              }
              nodeTypeForId(typeId) {
                const name2 = C._ts_language_symbol_name(this[0], typeId);
                return name2 ? UTF8ToString(name2) : null;
              }
              nodeTypeIsNamed(typeId) {
                return C._ts_language_type_is_named_wasm(this[0], typeId) ? true : false;
              }
              nodeTypeIsVisible(typeId) {
                return C._ts_language_type_is_visible_wasm(this[0], typeId) ? true : false;
              }
              nextState(stateId, typeId) {
                return C._ts_language_next_state(this[0], stateId, typeId);
              }
              lookaheadIterator(stateId) {
                const address = C._ts_lookahead_iterator_new(this[0], stateId);
                if (address) return new LookaheadIterable(INTERNAL, address, this);
                return null;
              }
              query(source) {
                const sourceLength = lengthBytesUTF8(source);
                const sourceAddress = C._malloc(sourceLength + 1);
                stringToUTF8(source, sourceAddress, sourceLength + 1);
                const address = C._ts_query_new(this[0], sourceAddress, sourceLength, TRANSFER_BUFFER, TRANSFER_BUFFER + SIZE_OF_INT);
                if (!address) {
                  const errorId = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                  const errorByte = getValue(TRANSFER_BUFFER, "i32");
                  const errorIndex = UTF8ToString(sourceAddress, errorByte).length;
                  const suffix = source.substr(errorIndex, 100).split("\n")[0];
                  let word = suffix.match(QUERY_WORD_REGEX)[0];
                  let error;
                  switch (errorId) {
                    case 2:
                      error = new RangeError(`Bad node name '${word}'`);
                      break;
                    case 3:
                      error = new RangeError(`Bad field name '${word}'`);
                      break;
                    case 4:
                      error = new RangeError(`Bad capture name @${word}`);
                      break;
                    case 5:
                      error = new TypeError(`Bad pattern structure at offset ${errorIndex}: '${suffix}'...`);
                      word = "";
                      break;
                    default:
                      error = new SyntaxError(`Bad syntax at offset ${errorIndex}: '${suffix}'...`);
                      word = "";
                      break;
                  }
                  error.index = errorIndex;
                  error.length = word.length;
                  C._free(sourceAddress);
                  throw error;
                }
                const stringCount = C._ts_query_string_count(address);
                const captureCount = C._ts_query_capture_count(address);
                const patternCount = C._ts_query_pattern_count(address);
                const captureNames = new Array(captureCount);
                const stringValues = new Array(stringCount);
                for (let i2 = 0; i2 < captureCount; i2++) {
                  const nameAddress = C._ts_query_capture_name_for_id(address, i2, TRANSFER_BUFFER);
                  const nameLength = getValue(TRANSFER_BUFFER, "i32");
                  captureNames[i2] = UTF8ToString(nameAddress, nameLength);
                }
                for (let i2 = 0; i2 < stringCount; i2++) {
                  const valueAddress = C._ts_query_string_value_for_id(address, i2, TRANSFER_BUFFER);
                  const nameLength = getValue(TRANSFER_BUFFER, "i32");
                  stringValues[i2] = UTF8ToString(valueAddress, nameLength);
                }
                const setProperties = new Array(patternCount);
                const assertedProperties = new Array(patternCount);
                const refutedProperties = new Array(patternCount);
                const predicates = new Array(patternCount);
                const textPredicates = new Array(patternCount);
                for (let i2 = 0; i2 < patternCount; i2++) {
                  const predicatesAddress = C._ts_query_predicates_for_pattern(address, i2, TRANSFER_BUFFER);
                  const stepCount = getValue(TRANSFER_BUFFER, "i32");
                  predicates[i2] = [];
                  textPredicates[i2] = [];
                  const steps = [];
                  let stepAddress = predicatesAddress;
                  for (let j = 0; j < stepCount; j++) {
                    const stepType = getValue(stepAddress, "i32");
                    stepAddress += SIZE_OF_INT;
                    const stepValueId = getValue(stepAddress, "i32");
                    stepAddress += SIZE_OF_INT;
                    if (stepType === PREDICATE_STEP_TYPE_CAPTURE) {
                      steps.push({
                        type: "capture",
                        name: captureNames[stepValueId]
                      });
                    } else if (stepType === PREDICATE_STEP_TYPE_STRING) {
                      steps.push({
                        type: "string",
                        value: stringValues[stepValueId]
                      });
                    } else if (steps.length > 0) {
                      if (steps[0].type !== "string") {
                        throw new Error("Predicates must begin with a literal value");
                      }
                      const operator = steps[0].value;
                      let isPositive = true;
                      let matchAll = true;
                      let captureName;
                      switch (operator) {
                        case "any-not-eq?":
                        case "not-eq?":
                          isPositive = false;
                        case "any-eq?":
                        case "eq?":
                          if (steps.length !== 3) {
                            throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}`);
                          }
                          if (steps[1].type !== "capture") {
                            throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}"`);
                          }
                          matchAll = !operator.startsWith("any-");
                          if (steps[2].type === "capture") {
                            const captureName1 = steps[1].name;
                            const captureName2 = steps[2].name;
                            textPredicates[i2].push((captures) => {
                              const nodes1 = [];
                              const nodes2 = [];
                              for (const c of captures) {
                                if (c.name === captureName1) nodes1.push(c.node);
                                if (c.name === captureName2) nodes2.push(c.node);
                              }
                              const compare = (n1, n2, positive) => positive ? n1.text === n2.text : n1.text !== n2.text;
                              return matchAll ? nodes1.every((n1) => nodes2.some((n2) => compare(n1, n2, isPositive))) : nodes1.some((n1) => nodes2.some((n2) => compare(n1, n2, isPositive)));
                            });
                          } else {
                            captureName = steps[1].name;
                            const stringValue = steps[2].value;
                            const matches = (n) => n.text === stringValue;
                            const doesNotMatch = (n) => n.text !== stringValue;
                            textPredicates[i2].push((captures) => {
                              const nodes = [];
                              for (const c of captures) {
                                if (c.name === captureName) nodes.push(c.node);
                              }
                              const test = isPositive ? matches : doesNotMatch;
                              return matchAll ? nodes.every(test) : nodes.some(test);
                            });
                          }
                          break;
                        case "any-not-match?":
                        case "not-match?":
                          isPositive = false;
                        case "any-match?":
                        case "match?":
                          if (steps.length !== 3) {
                            throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}.`);
                          }
                          if (steps[1].type !== "capture") {
                            throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
                          }
                          if (steps[2].type !== "string") {
                            throw new Error(`Second argument of \`#${operator}\` predicate must be a string. Got @${steps[2].value}.`);
                          }
                          captureName = steps[1].name;
                          const regex = new RegExp(steps[2].value);
                          matchAll = !operator.startsWith("any-");
                          textPredicates[i2].push((captures) => {
                            const nodes = [];
                            for (const c of captures) {
                              if (c.name === captureName) nodes.push(c.node.text);
                            }
                            const test = (text, positive) => positive ? regex.test(text) : !regex.test(text);
                            if (nodes.length === 0) return !isPositive;
                            return matchAll ? nodes.every((text) => test(text, isPositive)) : nodes.some((text) => test(text, isPositive));
                          });
                          break;
                        case "set!":
                          if (steps.length < 2 || steps.length > 3) {
                            throw new Error(`Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
                          }
                          if (steps.some((s) => s.type !== "string")) {
                            throw new Error(`Arguments to \`#set!\` predicate must be a strings.".`);
                          }
                          if (!setProperties[i2]) setProperties[i2] = {};
                          setProperties[i2][steps[1].value] = steps[2] ? steps[2].value : null;
                          break;
                        case "is?":
                        case "is-not?":
                          if (steps.length < 2 || steps.length > 3) {
                            throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
                          }
                          if (steps.some((s) => s.type !== "string")) {
                            throw new Error(`Arguments to \`#${operator}\` predicate must be a strings.".`);
                          }
                          const properties = operator === "is?" ? assertedProperties : refutedProperties;
                          if (!properties[i2]) properties[i2] = {};
                          properties[i2][steps[1].value] = steps[2] ? steps[2].value : null;
                          break;
                        case "not-any-of?":
                          isPositive = false;
                        case "any-of?":
                          if (steps.length < 2) {
                            throw new Error(`Wrong number of arguments to \`#${operator}\` predicate. Expected at least 1. Got ${steps.length - 1}.`);
                          }
                          if (steps[1].type !== "capture") {
                            throw new Error(`First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`);
                          }
                          for (let i3 = 2; i3 < steps.length; i3++) {
                            if (steps[i3].type !== "string") {
                              throw new Error(`Arguments to \`#${operator}\` predicate must be a strings.".`);
                            }
                          }
                          captureName = steps[1].name;
                          const values = steps.slice(2).map((s) => s.value);
                          textPredicates[i2].push((captures) => {
                            const nodes = [];
                            for (const c of captures) {
                              if (c.name === captureName) nodes.push(c.node.text);
                            }
                            if (nodes.length === 0) return !isPositive;
                            return nodes.every((text) => values.includes(text)) === isPositive;
                          });
                          break;
                        default:
                          predicates[i2].push({
                            operator,
                            operands: steps.slice(1)
                          });
                      }
                      steps.length = 0;
                    }
                  }
                  Object.freeze(setProperties[i2]);
                  Object.freeze(assertedProperties[i2]);
                  Object.freeze(refutedProperties[i2]);
                }
                C._free(sourceAddress);
                return new Query(INTERNAL, address, captureNames, textPredicates, predicates, Object.freeze(setProperties), Object.freeze(assertedProperties), Object.freeze(refutedProperties));
              }
              static load(input) {
                let bytes;
                if (input instanceof Uint8Array) {
                  bytes = Promise.resolve(input);
                } else {
                  const url = input;
                  if (typeof process !== "undefined" && process.versions && process.versions.node) {
                    const fs3 = require("fs");
                    bytes = Promise.resolve(fs3.readFileSync(url));
                  } else {
                    bytes = fetch(url).then((response) => response.arrayBuffer().then((buffer) => {
                      if (response.ok) {
                        return new Uint8Array(buffer);
                      } else {
                        const body2 = new TextDecoder("utf-8").decode(buffer);
                        throw new Error(`Language.load failed with status ${response.status}.

${body2}`);
                      }
                    }));
                  }
                }
                return bytes.then((bytes2) => loadWebAssemblyModule(bytes2, {
                  loadAsync: true
                })).then((mod) => {
                  const symbolNames = Object.keys(mod);
                  const functionName = symbolNames.find((key) => LANGUAGE_FUNCTION_REGEX.test(key) && !key.includes("external_scanner_"));
                  if (!functionName) {
                    console.log(`Couldn't find language function in WASM file. Symbols:
${JSON.stringify(symbolNames, null, 2)}`);
                  }
                  const languageAddress = mod[functionName]();
                  return new Language(INTERNAL, languageAddress);
                });
              }
            }
            class LookaheadIterable {
              constructor(internal, address, language) {
                assertInternal(internal);
                this[0] = address;
                this.language = language;
              }
              get currentTypeId() {
                return C._ts_lookahead_iterator_current_symbol(this[0]);
              }
              get currentType() {
                return this.language.types[this.currentTypeId] || "ERROR";
              }
              delete() {
                C._ts_lookahead_iterator_delete(this[0]);
                this[0] = 0;
              }
              resetState(stateId) {
                return C._ts_lookahead_iterator_reset_state(this[0], stateId);
              }
              reset(language, stateId) {
                if (C._ts_lookahead_iterator_reset(this[0], language[0], stateId)) {
                  this.language = language;
                  return true;
                }
                return false;
              }
              [Symbol.iterator]() {
                const self2 = this;
                return {
                  next() {
                    if (C._ts_lookahead_iterator_next(self2[0])) {
                      return {
                        done: false,
                        value: self2.currentType
                      };
                    }
                    return {
                      done: true,
                      value: ""
                    };
                  }
                };
              }
            }
            class Query {
              constructor(internal, address, captureNames, textPredicates, predicates, setProperties, assertedProperties, refutedProperties) {
                assertInternal(internal);
                this[0] = address;
                this.captureNames = captureNames;
                this.textPredicates = textPredicates;
                this.predicates = predicates;
                this.setProperties = setProperties;
                this.assertedProperties = assertedProperties;
                this.refutedProperties = refutedProperties;
                this.exceededMatchLimit = false;
              }
              delete() {
                C._ts_query_delete(this[0]);
                this[0] = 0;
              }
              matches(node, { startPosition = ZERO_POINT, endPosition = ZERO_POINT, startIndex = 0, endIndex = 0, matchLimit = 4294967295, maxStartDepth = 4294967295, timeoutMicros = 0 } = {}) {
                if (typeof matchLimit !== "number") {
                  throw new Error("Arguments must be numbers");
                }
                marshalNode(node);
                C._ts_query_matches_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
                const rawCount = getValue(TRANSFER_BUFFER, "i32");
                const startAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const didExceedMatchLimit = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
                const result = new Array(rawCount);
                this.exceededMatchLimit = Boolean(didExceedMatchLimit);
                let filteredCount = 0;
                let address = startAddress;
                for (let i2 = 0; i2 < rawCount; i2++) {
                  const pattern = getValue(address, "i32");
                  address += SIZE_OF_INT;
                  const captureCount = getValue(address, "i32");
                  address += SIZE_OF_INT;
                  const captures = new Array(captureCount);
                  address = unmarshalCaptures(this, node.tree, address, captures);
                  if (this.textPredicates[pattern].every((p) => p(captures))) {
                    result[filteredCount] = {
                      pattern,
                      captures
                    };
                    const setProperties = this.setProperties[pattern];
                    if (setProperties) result[filteredCount].setProperties = setProperties;
                    const assertedProperties = this.assertedProperties[pattern];
                    if (assertedProperties) result[filteredCount].assertedProperties = assertedProperties;
                    const refutedProperties = this.refutedProperties[pattern];
                    if (refutedProperties) result[filteredCount].refutedProperties = refutedProperties;
                    filteredCount++;
                  }
                }
                result.length = filteredCount;
                C._free(startAddress);
                return result;
              }
              captures(node, { startPosition = ZERO_POINT, endPosition = ZERO_POINT, startIndex = 0, endIndex = 0, matchLimit = 4294967295, maxStartDepth = 4294967295, timeoutMicros = 0 } = {}) {
                if (typeof matchLimit !== "number") {
                  throw new Error("Arguments must be numbers");
                }
                marshalNode(node);
                C._ts_query_captures_wasm(this[0], node.tree[0], startPosition.row, startPosition.column, endPosition.row, endPosition.column, startIndex, endIndex, matchLimit, maxStartDepth, timeoutMicros);
                const count = getValue(TRANSFER_BUFFER, "i32");
                const startAddress = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                const didExceedMatchLimit = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
                const result = [];
                this.exceededMatchLimit = Boolean(didExceedMatchLimit);
                const captures = [];
                let address = startAddress;
                for (let i2 = 0; i2 < count; i2++) {
                  const pattern = getValue(address, "i32");
                  address += SIZE_OF_INT;
                  const captureCount = getValue(address, "i32");
                  address += SIZE_OF_INT;
                  const captureIndex = getValue(address, "i32");
                  address += SIZE_OF_INT;
                  captures.length = captureCount;
                  address = unmarshalCaptures(this, node.tree, address, captures);
                  if (this.textPredicates[pattern].every((p) => p(captures))) {
                    const capture = captures[captureIndex];
                    const setProperties = this.setProperties[pattern];
                    if (setProperties) capture.setProperties = setProperties;
                    const assertedProperties = this.assertedProperties[pattern];
                    if (assertedProperties) capture.assertedProperties = assertedProperties;
                    const refutedProperties = this.refutedProperties[pattern];
                    if (refutedProperties) capture.refutedProperties = refutedProperties;
                    result.push(capture);
                  }
                }
                C._free(startAddress);
                return result;
              }
              predicatesForPattern(patternIndex) {
                return this.predicates[patternIndex];
              }
              disableCapture(captureName) {
                const captureNameLength = lengthBytesUTF8(captureName);
                const captureNameAddress = C._malloc(captureNameLength + 1);
                stringToUTF8(captureName, captureNameAddress, captureNameLength + 1);
                C._ts_query_disable_capture(this[0], captureNameAddress, captureNameLength);
                C._free(captureNameAddress);
              }
              didExceedMatchLimit() {
                return this.exceededMatchLimit;
              }
            }
            function getText(tree, startIndex, endIndex) {
              const length = endIndex - startIndex;
              let result = tree.textCallback(startIndex, null, endIndex);
              startIndex += result.length;
              while (startIndex < endIndex) {
                const string = tree.textCallback(startIndex, null, endIndex);
                if (string && string.length > 0) {
                  startIndex += string.length;
                  result += string;
                } else {
                  break;
                }
              }
              if (startIndex > endIndex) {
                result = result.slice(0, length);
              }
              return result;
            }
            function unmarshalCaptures(query, tree, address, result) {
              for (let i2 = 0, n = result.length; i2 < n; i2++) {
                const captureIndex = getValue(address, "i32");
                address += SIZE_OF_INT;
                const node = unmarshalNode(tree, address);
                address += SIZE_OF_NODE;
                result[i2] = {
                  name: query.captureNames[captureIndex],
                  node
                };
              }
              return address;
            }
            function assertInternal(x) {
              if (x !== INTERNAL) throw new Error("Illegal constructor");
            }
            function isPoint(point) {
              return point && typeof point.row === "number" && typeof point.column === "number";
            }
            function marshalNode(node) {
              let address = TRANSFER_BUFFER;
              setValue(address, node.id, "i32");
              address += SIZE_OF_INT;
              setValue(address, node.startIndex, "i32");
              address += SIZE_OF_INT;
              setValue(address, node.startPosition.row, "i32");
              address += SIZE_OF_INT;
              setValue(address, node.startPosition.column, "i32");
              address += SIZE_OF_INT;
              setValue(address, node[0], "i32");
            }
            function unmarshalNode(tree, address = TRANSFER_BUFFER) {
              const id = getValue(address, "i32");
              address += SIZE_OF_INT;
              if (id === 0) return null;
              const index = getValue(address, "i32");
              address += SIZE_OF_INT;
              const row = getValue(address, "i32");
              address += SIZE_OF_INT;
              const column = getValue(address, "i32");
              address += SIZE_OF_INT;
              const other = getValue(address, "i32");
              const result = new Node(INTERNAL, tree);
              result.id = id;
              result.startIndex = index;
              result.startPosition = {
                row,
                column
              };
              result[0] = other;
              return result;
            }
            function marshalTreeCursor(cursor, address = TRANSFER_BUFFER) {
              setValue(address + 0 * SIZE_OF_INT, cursor[0], "i32");
              setValue(address + 1 * SIZE_OF_INT, cursor[1], "i32");
              setValue(address + 2 * SIZE_OF_INT, cursor[2], "i32");
              setValue(address + 3 * SIZE_OF_INT, cursor[3], "i32");
            }
            function unmarshalTreeCursor(cursor) {
              cursor[0] = getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, "i32");
              cursor[1] = getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, "i32");
              cursor[2] = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
              cursor[3] = getValue(TRANSFER_BUFFER + 3 * SIZE_OF_INT, "i32");
            }
            function marshalPoint(address, point) {
              setValue(address, point.row, "i32");
              setValue(address + SIZE_OF_INT, point.column, "i32");
            }
            function unmarshalPoint(address) {
              const result = {
                row: getValue(address, "i32") >>> 0,
                column: getValue(address + SIZE_OF_INT, "i32") >>> 0
              };
              return result;
            }
            function marshalRange(address, range) {
              marshalPoint(address, range.startPosition);
              address += SIZE_OF_POINT;
              marshalPoint(address, range.endPosition);
              address += SIZE_OF_POINT;
              setValue(address, range.startIndex, "i32");
              address += SIZE_OF_INT;
              setValue(address, range.endIndex, "i32");
              address += SIZE_OF_INT;
            }
            function unmarshalRange(address) {
              const result = {};
              result.startPosition = unmarshalPoint(address);
              address += SIZE_OF_POINT;
              result.endPosition = unmarshalPoint(address);
              address += SIZE_OF_POINT;
              result.startIndex = getValue(address, "i32") >>> 0;
              address += SIZE_OF_INT;
              result.endIndex = getValue(address, "i32") >>> 0;
              return result;
            }
            function marshalEdit(edit) {
              let address = TRANSFER_BUFFER;
              marshalPoint(address, edit.startPosition);
              address += SIZE_OF_POINT;
              marshalPoint(address, edit.oldEndPosition);
              address += SIZE_OF_POINT;
              marshalPoint(address, edit.newEndPosition);
              address += SIZE_OF_POINT;
              setValue(address, edit.startIndex, "i32");
              address += SIZE_OF_INT;
              setValue(address, edit.oldEndIndex, "i32");
              address += SIZE_OF_INT;
              setValue(address, edit.newEndIndex, "i32");
              address += SIZE_OF_INT;
            }
            for (const name2 of Object.getOwnPropertyNames(ParserImpl.prototype)) {
              Object.defineProperty(Parser.prototype, name2, {
                value: ParserImpl.prototype[name2],
                enumerable: false,
                writable: false
              });
            }
            Parser.Language = Language;
            Module.onRuntimeInitialized = () => {
              ParserImpl.init();
              resolveInitPromise();
            };
          });
        }
      }
      return Parser;
    }();
    if (typeof exports === "object") {
      module.exports = TreeSitter;
    }
  }
});

// ../core/dist/grammars/treesitter.js
var require_treesitter = __commonJS({
  "../core/dist/grammars/treesitter.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys2 = function(o) {
        ownKeys2 = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys2(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys2(mod), i2 = 0; i2 < k.length; i2++) if (k[i2] !== "default") __createBinding(result, mod, k[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TreeSitterBackend = void 0;
    exports2.createTreeSitterBackend = createTreeSitterBackend;
    var fs3 = __importStar(require("node:fs"));
    var path4 = __importStar(require("node:path"));
    var web_tree_sitter_1 = __importDefault(require_tree_sitter());
    var scopes_1 = require_scopes();
    var LANGUAGE_TO_WASM = {
      typescript: "tree-sitter-typescript.wasm",
      typescriptreact: "tree-sitter-tsx.wasm",
      javascript: "tree-sitter-javascript.wasm",
      javascriptreact: "tree-sitter-tsx.wasm",
      python: "tree-sitter-python.wasm",
      rust: "tree-sitter-rust.wasm",
      go: "tree-sitter-go.wasm",
      json: "tree-sitter-json.wasm",
      css: "tree-sitter-css.wasm",
      html: "tree-sitter-html.wasm",
      c: "tree-sitter-c.wasm",
      cpp: "tree-sitter-cpp.wasm",
      java: "tree-sitter-java.wasm",
      ruby: "tree-sitter-ruby.wasm",
      bash: "tree-sitter-bash.wasm",
      shellscript: "tree-sitter-bash.wasm",
      markdown: "tree-sitter-markdown.wasm",
      yaml: "tree-sitter-yaml.wasm",
      toml: "tree-sitter-toml.wasm"
    };
    var COMMENT_QUERY = `
(comment) @comment
(line_comment) @comment
(block_comment) @comment
`;
    var HIGHLIGHT_QUERY = `
(comment) @comment
(string) @string
(string_literal) @string
(escape_sequence) @string
(number) @number
(type_identifier) @type
(primitive_type) @type
`;
    function walkExtraComments(node, spans) {
      if (node.isExtra) {
        const cat = (0, scopes_1.classifyTreeSitterNodeType)(node.type);
        if (cat) {
          spans.push({
            start: node.startIndex,
            end: node.endIndex,
            category: cat,
            source: "tree-sitter"
          });
        }
      }
      for (let i2 = 0; i2 < node.childCount; i2++) {
        walkExtraComments(node.child(i2), spans);
      }
    }
    var paths_1 = require_paths();
    var TreeSitterBackend = class {
      initPromise;
      parsers = /* @__PURE__ */ new Map();
      wasmDir;
      moduleRoot;
      constructor(moduleRoot) {
        this.moduleRoot = moduleRoot;
        this.wasmDir = (0, paths_1.treeSitterWasmsDir)(moduleRoot);
      }
      async ensureInit() {
        if (!this.initPromise) {
          const moduleRoot = this.moduleRoot;
          this.initPromise = web_tree_sitter_1.default.init({
            locateFile() {
              return (0, paths_1.resolveFromModuleRoot)(moduleRoot, "web-tree-sitter/tree-sitter.wasm");
            }
          });
        }
        await this.initPromise;
      }
      hasParser(languageId) {
        return languageId in LANGUAGE_TO_WASM;
      }
      async getParser(languageId) {
        const wasmFile = LANGUAGE_TO_WASM[languageId];
        if (!wasmFile) {
          return void 0;
        }
        if (this.parsers.has(languageId)) {
          return this.parsers.get(languageId);
        }
        await this.ensureInit();
        const wasmPath = path4.join(this.wasmDir, "out", wasmFile);
        if (!fs3.existsSync(wasmPath)) {
          return void 0;
        }
        const parser = new web_tree_sitter_1.default();
        const lang = await web_tree_sitter_1.default.Language.load(wasmPath);
        parser.setLanguage(lang);
        this.parsers.set(languageId, parser);
        return parser;
      }
      async extractSpans(languageId, text) {
        try {
          const parser = await this.getParser(languageId);
          if (!parser) {
            return [];
          }
          const tree = parser.parse(text);
          const root = tree.rootNode;
          const spans = [];
          walkExtraComments(root, spans);
          for (const querySrc of [COMMENT_QUERY, HIGHLIGHT_QUERY]) {
            try {
              const query = parser.getLanguage().query(querySrc);
              const captures = query.captures(root);
              for (const cap of captures) {
                const category = (0, scopes_1.classifyTreeSitterCapture)(cap.name);
                if (!category) {
                  continue;
                }
                spans.push({
                  start: cap.node.startIndex,
                  end: cap.node.endIndex,
                  category,
                  source: "tree-sitter"
                });
              }
            } catch {
            }
          }
          return dedupeSpans(spans);
        } catch {
          return [];
        }
      }
    };
    exports2.TreeSitterBackend = TreeSitterBackend;
    function dedupeSpans(spans) {
      const seen = /* @__PURE__ */ new Set();
      const out2 = [];
      for (const s of spans) {
        const key = `${s.start}:${s.end}:${s.category}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        out2.push(s);
      }
      return out2;
    }
    function createTreeSitterBackend(moduleRoot) {
      return new TreeSitterBackend(moduleRoot);
    }
  }
});

// ../core/dist/grammars/fallback.js
var require_fallback = __commonJS({
  "../core/dist/grammars/fallback.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extractCommentSpansFromLanguageConfig = extractCommentSpansFromLanguageConfig;
    exports2.extractCommentSpansFallback = extractCommentSpansFallback;
    exports2.hasCommentSpans = hasCommentSpans;
    var files_1 = require_files();
    function extractCommentSpansFromLanguageConfig(text, rules) {
      if (!rules) {
        return [];
      }
      const spans = [];
      if (rules.blockComment) {
        const [open, close] = rules.blockComment;
        spans.push(...extractBlockComments(text, open, close));
      }
      if (rules.lineComment) {
        spans.push(...extractLineComments(text, rules.lineComment, rules.lineCommentEnd));
      }
      return mergeSpanRanges(spans);
    }
    function escapeRegexLiteral(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function extractBlockComments(text, open, close) {
      const spans = [];
      const pattern = new RegExp(`${escapeRegexLiteral(open)}[\\s\\S]*?${escapeRegexLiteral(close)}`, "g");
      let m;
      while ((m = pattern.exec(text)) !== null) {
        spans.push({
          start: m.index,
          end: m.index + m[0].length,
          category: "comment",
          source: "textmate"
        });
      }
      return spans;
    }
    function extractLineComments(text, lineComment, lineCommentEnd) {
      const spans = [];
      const lines = text.split("\n");
      let offset = 0;
      for (const line of lines) {
        const trimmed = line.trimStart();
        const lead = line.length - trimmed.length;
        if (trimmed.startsWith(lineComment)) {
          const end = lineCommentEnd ? findLineCommentEnd(line, lead + lineComment.length, lineCommentEnd) : line.length;
          spans.push({
            start: offset + lead,
            end: offset + end,
            category: "comment",
            source: "textmate"
          });
        } else {
          const idx = line.indexOf(lineComment);
          if (idx !== -1) {
            const before = line.slice(0, idx);
            if (!isInsideString(before)) {
              const start2 = idx;
              const end = lineCommentEnd ? findLineCommentEnd(line, idx + lineComment.length, lineCommentEnd) : line.length;
              spans.push({
                start: offset + start2,
                end: offset + end,
                category: "comment",
                source: "textmate"
              });
            }
          }
        }
        offset += line.length + 1;
      }
      return spans;
    }
    function findLineCommentEnd(line, contentStart, lineCommentEnd) {
      const endIdx = line.indexOf(lineCommentEnd, contentStart);
      return endIdx === -1 ? line.length : endIdx;
    }
    function isInsideString(before) {
      let singles = 0;
      let doubles = 0;
      for (let i2 = 0; i2 < before.length; i2++) {
        const ch = before[i2];
        if (ch === "'" && before[i2 - 1] !== "\\") {
          singles++;
        }
        if (ch === '"' && before[i2 - 1] !== "\\") {
          doubles++;
        }
      }
      return singles % 2 === 1 || doubles % 2 === 1;
    }
    function mergeSpanRanges(spans) {
      if (spans.length === 0) {
        return spans;
      }
      const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
      const out2 = [sorted[0]];
      for (let i2 = 1; i2 < sorted.length; i2++) {
        const cur = sorted[i2];
        const last = out2[out2.length - 1];
        if (cur.start <= last.end && cur.category === last.category) {
          last.end = Math.max(last.end, cur.end);
        } else {
          out2.push({ ...cur });
        }
      }
      return out2;
    }
    function commentRulesForLanguage(languageId, commentRules) {
      if (!commentRules) {
        return void 0;
      }
      for (const id of (0, files_1.relatedLanguageIds)(languageId)) {
        const rules = commentRules.get(id);
        if (rules) {
          return rules;
        }
      }
      return void 0;
    }
    function extractCommentSpansFallback(text, languageId, commentRules) {
      return extractCommentSpansFromLanguageConfig(text, commentRulesForLanguage(languageId, commentRules));
    }
    function hasCommentSpans(spans) {
      return spans.some((s) => s.category === "comment");
    }
  }
});

// ../core/dist/grammars/registry.js
var require_registry = __commonJS({
  "../core/dist/grammars/registry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseExtensionManifest = exports2.loadAllExtensionManifests = exports2.loadExtensionManifests = exports2.buildGrammarBundle = exports2.buildGrammarMap = exports2.SpanExtractor = void 0;
    var textmate_1 = require_textmate();
    var treesitter_1 = require_treesitter();
    var fallback_1 = require_fallback();
    var files_1 = require_files();
    function dedupeSpans(spans) {
      const seen = /* @__PURE__ */ new Set();
      const out2 = [];
      for (const s of spans) {
        const key = `${s.start}:${s.end}:${s.category}:${s.source}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        out2.push(s);
      }
      return out2;
    }
    var SpanExtractor2 = class {
      textmate;
      treesitter;
      preferTreeSitter;
      grammarMap;
      commentRules;
      constructor(grammarMap, options = {}) {
        const moduleRoot = options.moduleRoot;
        this.grammarMap = grammarMap;
        this.commentRules = options.commentRules;
        this.textmate = (0, textmate_1.createTextMateBackend)(grammarMap, moduleRoot, options.grammarsByScope);
        this.treesitter = (0, treesitter_1.createTreeSitterBackend)(moduleRoot);
        this.preferTreeSitter = options.preferTreeSitter !== false;
      }
      async extractSpans(filePath, text, languageId) {
        const langs = (0, files_1.grammarLanguageIds)(languageId ?? (0, files_1.guessLanguageId)(filePath), this.grammarMap);
        const spans = [];
        try {
          for (const lang of langs) {
            const resolved = (0, files_1.resolveLanguageId)(lang);
            if (this.preferTreeSitter && this.treesitter.hasParser(resolved)) {
              spans.push(...await this.treesitter.extractSpans(resolved, text));
            }
            spans.push(...await this.textmate.extractSpans(resolved, text));
            if (resolved !== lang) {
              spans.push(...await this.textmate.extractSpans(lang, text));
            }
          }
        } catch {
        }
        if (!(0, fallback_1.hasCommentSpans)(spans)) {
          for (const lang of langs) {
            spans.push(...(0, fallback_1.extractCommentSpansFallback)(text, lang, this.commentRules));
            if ((0, fallback_1.hasCommentSpans)(spans)) {
              break;
            }
          }
        }
        return dedupeSpans(spans);
      }
    };
    exports2.SpanExtractor = SpanExtractor2;
    var files_2 = require_files();
    Object.defineProperty(exports2, "buildGrammarMap", { enumerable: true, get: function() {
      return files_2.buildGrammarMap;
    } });
    Object.defineProperty(exports2, "buildGrammarBundle", { enumerable: true, get: function() {
      return files_2.buildGrammarBundle;
    } });
    Object.defineProperty(exports2, "loadExtensionManifests", { enumerable: true, get: function() {
      return files_2.loadExtensionManifests;
    } });
    Object.defineProperty(exports2, "loadAllExtensionManifests", { enumerable: true, get: function() {
      return files_2.loadAllExtensionManifests;
    } });
    Object.defineProperty(exports2, "parseExtensionManifest", { enumerable: true, get: function() {
      return files_2.parseExtensionManifest;
    } });
  }
});

// ../core/dist/index.js
var require_dist = __commonJS({
  "../core/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TreeSitterBackend = exports2.createTreeSitterBackend = exports2.TextMateBackend = exports2.createTextMateBackend = exports2.findModuleRoot = exports2.parseExtensionManifest = exports2.loadAllExtensionManifests = exports2.loadExtensionManifests = exports2.buildGrammarBundle = exports2.buildGrammarMap = exports2.SpanExtractor = void 0;
    exports2.runScopedSearch = runScopedSearch2;
    exports2.grammarMapFromContributions = grammarMapFromContributions;
    exports2.buildGrammarBundleFromContributions = buildGrammarBundleFromContributions;
    __exportStar(require_types(), exports2);
    __exportStar(require_scopes(), exports2);
    __exportStar(require_search(), exports2);
    __exportStar(require_replacement(), exports2);
    __exportStar(require_files(), exports2);
    __exportStar(require_scopediscovery(), exports2);
    var registry_1 = require_registry();
    Object.defineProperty(exports2, "SpanExtractor", { enumerable: true, get: function() {
      return registry_1.SpanExtractor;
    } });
    Object.defineProperty(exports2, "buildGrammarMap", { enumerable: true, get: function() {
      return registry_1.buildGrammarMap;
    } });
    Object.defineProperty(exports2, "buildGrammarBundle", { enumerable: true, get: function() {
      return registry_1.buildGrammarBundle;
    } });
    Object.defineProperty(exports2, "loadExtensionManifests", { enumerable: true, get: function() {
      return registry_1.loadExtensionManifests;
    } });
    Object.defineProperty(exports2, "loadAllExtensionManifests", { enumerable: true, get: function() {
      return registry_1.loadAllExtensionManifests;
    } });
    Object.defineProperty(exports2, "parseExtensionManifest", { enumerable: true, get: function() {
      return registry_1.parseExtensionManifest;
    } });
    __exportStar(require_binary(), exports2);
    var paths_1 = require_paths();
    Object.defineProperty(exports2, "findModuleRoot", { enumerable: true, get: function() {
      return paths_1.findModuleRoot;
    } });
    var textmate_1 = require_textmate();
    Object.defineProperty(exports2, "createTextMateBackend", { enumerable: true, get: function() {
      return textmate_1.createTextMateBackend;
    } });
    Object.defineProperty(exports2, "TextMateBackend", { enumerable: true, get: function() {
      return textmate_1.TextMateBackend;
    } });
    var treesitter_1 = require_treesitter();
    Object.defineProperty(exports2, "createTreeSitterBackend", { enumerable: true, get: function() {
      return treesitter_1.createTreeSitterBackend;
    } });
    Object.defineProperty(exports2, "TreeSitterBackend", { enumerable: true, get: function() {
      return treesitter_1.TreeSitterBackend;
    } });
    var files_1 = require_files();
    var search_1 = require_search();
    async function runScopedSearch2(extractor, files, options, onProgress, isCancelled) {
      const all = [];
      const total = files.length;
      for (let i2 = 0; i2 < files.length; i2++) {
        if (isCancelled?.()) {
          break;
        }
        const file = files[i2];
        onProgress?.({
          filePath: file.path,
          fileIndex: i2 + 1,
          fileTotal: total,
          matchCount: all.length
        });
        const spans = await extractor.extractSpans(file.path, file.text, file.languageId);
        if (isCancelled?.()) {
          break;
        }
        all.push(...(0, search_1.searchInSpans)(file.path, file.text, spans, options));
      }
      return all;
    }
    function grammarMapFromContributions(contributions) {
      return buildGrammarBundleFromContributions(contributions).primaryGrammars;
    }
    function buildGrammarBundleFromContributions(contributions) {
      const manifest = {
        extensionPath: "",
        grammars: contributions,
        grammarsByScope: contributions.map((g) => ({
          scopeName: g.scopeName,
          grammarPath: g.grammarPath,
          extensionPath: g.extensionPath,
          languageId: g.languageId
        })),
        languageIds: [...new Set(contributions.map((g) => g.languageId))],
        commentRules: /* @__PURE__ */ new Map()
      };
      return (0, files_1.buildGrammarBundle)([manifest]);
    }
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode6 = __toESM(require("vscode"));
var path3 = __toESM(require("node:path"));
var crypto3 = __toESM(require("node:crypto"));
var import_core2 = __toESM(require_dist());

// src/panel.ts
var vscode2 = __toESM(require("vscode"));

// src/file-icons.ts
var vscode = __toESM(require("vscode"));
var languageIconCache;
var languageIconRoots;
function iconPathFromContribution(icon) {
  if (typeof icon === "string") {
    return icon;
  }
  return icon.dark ?? icon.light;
}
function getLanguageIconUris() {
  if (languageIconCache) {
    return languageIconCache;
  }
  const map = /* @__PURE__ */ new Map();
  const roots = /* @__PURE__ */ new Set();
  for (const ext of vscode.extensions.all) {
    const pkg = ext.packageJSON;
    for (const lang of pkg.contributes?.languages ?? []) {
      if (!lang.id || !lang.icon || map.has(lang.id)) {
        continue;
      }
      const rel = iconPathFromContribution(lang.icon);
      if (!rel) {
        continue;
      }
      const normalized = rel.replace(/^\.\//, "");
      map.set(lang.id, vscode.Uri.joinPath(ext.extensionUri, normalized));
      roots.add(ext.extensionUri.toString());
    }
  }
  languageIconCache = map;
  languageIconRoots = [...roots].map((s) => vscode.Uri.parse(s));
  return map;
}
function getLanguageIconExtensionRoots() {
  getLanguageIconUris();
  return languageIconRoots ?? [];
}
function buildFileIconWebviewUris(webview, entries) {
  const icons = getLanguageIconUris();
  const out2 = {};
  for (const { path: path4, languageId } of entries) {
    if (!languageId) {
      continue;
    }
    const uri = icons.get(languageId);
    if (uri) {
      out2[path4] = webview.asWebviewUri(uri).toString();
    }
  }
  return out2;
}

// src/panel.ts
var ScopeSearchPanel = class {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }
  view;
  messageHandler;
  onViewReady;
  resolveWebviewView(webviewView, _context, _token) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri, ...getLanguageIconExtensionRoots()]
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === "openResult") {
        void openSearchResult(msg);
        return;
      }
      if (msg.type === "replaceAllInFile" || msg.type === "replaceAll" || msg.type === "replaceOne" || msg.type === "undoLastReplace") {
        void this.messageHandler?.(msg);
        return;
      }
      void this.messageHandler?.(msg);
    });
    this.onViewReady?.();
  }
  onMessage(handler) {
    this.messageHandler = handler;
  }
  postScopes(scopes) {
    this.view?.webview.postMessage({ type: "scopes", scopes });
  }
  postResults(results, searchId, preserveExclusions = false, languageByPath) {
    const workspaceRoots = (vscode2.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
    const webview = this.view?.webview;
    const fileIcons = webview && languageByPath ? buildFileIconWebviewUris(
      webview,
      Object.entries(languageByPath).map(([path4, languageId]) => ({ path: path4, languageId }))
    ) : {};
    this.view?.webview.postMessage({
      type: "results",
      results,
      searchId,
      workspaceRoots,
      preserveExclusions,
      fileIcons
    });
  }
  postSearchStatus(msg) {
    this.view?.webview.postMessage({ type: "searchStatus", ...msg });
  }
  postRestoreState(state) {
    this.view?.webview.postMessage({ type: "restoreState", state });
  }
  postError(error) {
    this.view?.webview.postMessage({ type: "error", error });
  }
  postHistoryState(state) {
    this.view?.webview.postMessage({ type: "historyState", ...state });
  }
  focusQuery() {
    this.view?.webview.postMessage({ type: "focusQuery" });
  }
  requestRefresh() {
    this.view?.webview.postMessage({ type: "refresh" });
  }
  requestClear() {
    this.view?.webview.postMessage({ type: "clear" });
  }
  requestStop() {
    this.view?.webview.postMessage({ type: "stop" });
  }
  getHtml(webview) {
    const scriptUri = webview.asWebviewUri(vscode2.Uri.joinPath(this.extensionUri, "media", "panel.js"));
    const replacementUri = webview.asWebviewUri(
      vscode2.Uri.joinPath(this.extensionUri, "media", "replacement.js")
    );
    const styleUri = webview.asWebviewUri(vscode2.Uri.joinPath(this.extensionUri, "media", "panel.css"));
    const codiconsUri = webview.asWebviewUri(
      vscode2.Uri.joinPath(this.extensionUri, "media", "codicons", "codicon.css")
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
};
async function openSearchResult(msg) {
  const uri = vscode2.Uri.file(msg.path);
  const start2 = new vscode2.Position(msg.startLine, msg.startCol);
  const end = new vscode2.Position(msg.endLine, msg.endCol);
  const range = new vscode2.Range(start2, end);
  const existing = vscode2.workspace.textDocuments.find((d) => d.uri.fsPath === msg.path);
  const doc = existing ?? await vscode2.workspace.openTextDocument(uri);
  const editor = await vscode2.window.showTextDocument(doc, {
    selection: range,
    viewColumn: vscode2.ViewColumn.Active,
    preview: false
  });
  editor.revealRange(range, vscode2.TextEditorRevealType.InCenter);
}
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i2 = 0; i2 < 32; i2++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// src/replace-history.ts
var crypto2 = __toESM(require("node:crypto"));
var vscode4 = __toESM(require("vscode"));

// src/replace-history-core.ts
var crypto = __toESM(require("node:crypto"));
var path = __toESM(require("node:path"));

// ../../node_modules/diff/lib/index.mjs
function Diff() {
}
Diff.prototype = {
  diff: function diff(oldString, newString) {
    var _options$timeout;
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var callback = options.callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    var self2 = this;
    function done(value) {
      value = self2.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return true;
      } else {
        return value;
      }
    }
    oldString = this.castInput(oldString, options);
    newString = this.castInput(newString, options);
    oldString = this.removeEmpty(this.tokenize(oldString, options));
    newString = this.removeEmpty(this.tokenize(newString, options));
    var newLen = newString.length, oldLen = oldString.length;
    var editLength = 1;
    var maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    var maxExecutionTime = (_options$timeout = options.timeout) !== null && _options$timeout !== void 0 ? _options$timeout : Infinity;
    var abortAfterTimestamp = Date.now() + maxExecutionTime;
    var bestPath = [{
      oldPos: -1,
      lastComponent: void 0
    }];
    var newPos = this.extractCommon(bestPath[0], newString, oldString, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(buildValues(self2, bestPath[0].lastComponent, newString, oldString, self2.useLongestToken));
    }
    var minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    function execEditLength() {
      for (var diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        var basePath = void 0;
        var removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        var canAdd = false;
        if (addPath) {
          var addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        var canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = self2.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = self2.addToPath(removePath, false, true, 1, options);
        }
        newPos = self2.extractCommon(basePath, newString, oldString, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(buildValues(self2, basePath.lastComponent, newString, oldString, self2.useLongestToken));
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    }
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback();
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        var ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  },
  addToPath: function addToPath(path4, added, removed, oldPosInc, options) {
    var last = path4.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path4.oldPos + oldPosInc,
        lastComponent: {
          count: last.count + 1,
          added,
          removed,
          previousComponent: last.previousComponent
        }
      };
    } else {
      return {
        oldPos: path4.oldPos + oldPosInc,
        lastComponent: {
          count: 1,
          added,
          removed,
          previousComponent: last
        }
      };
    }
  },
  extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath, options) {
    var newLen = newString.length, oldLen = oldString.length, oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldString[oldPos + 1], newString[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = {
          count: 1,
          previousComponent: basePath.lastComponent,
          added: false,
          removed: false
        };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = {
        count: commonCount,
        previousComponent: basePath.lastComponent,
        added: false,
        removed: false
      };
    }
    basePath.oldPos = oldPos;
    return newPos;
  },
  equals: function equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  },
  removeEmpty: function removeEmpty(array) {
    var ret = [];
    for (var i2 = 0; i2 < array.length; i2++) {
      if (array[i2]) {
        ret.push(array[i2]);
      }
    }
    return ret;
  },
  castInput: function castInput(value) {
    return value;
  },
  tokenize: function tokenize(value) {
    return Array.from(value);
  },
  join: function join(chars) {
    return chars.join("");
  },
  postProcess: function postProcess(changeObjects) {
    return changeObjects;
  }
};
function buildValues(diff2, lastComponent, newString, oldString, useLongestToken) {
  var components = [];
  var nextComponent;
  while (lastComponent) {
    components.push(lastComponent);
    nextComponent = lastComponent.previousComponent;
    delete lastComponent.previousComponent;
    lastComponent = nextComponent;
  }
  components.reverse();
  var componentPos = 0, componentLen = components.length, newPos = 0, oldPos = 0;
  for (; componentPos < componentLen; componentPos++) {
    var component = components[componentPos];
    if (!component.removed) {
      if (!component.added && useLongestToken) {
        var value = newString.slice(newPos, newPos + component.count);
        value = value.map(function(value2, i2) {
          var oldValue = oldString[oldPos + i2];
          return oldValue.length > value2.length ? oldValue : value2;
        });
        component.value = diff2.join(value);
      } else {
        component.value = diff2.join(newString.slice(newPos, newPos + component.count));
      }
      newPos += component.count;
      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff2.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count;
    }
  }
  return components;
}
var characterDiff = new Diff();
function longestCommonPrefix(str1, str2) {
  var i2;
  for (i2 = 0; i2 < str1.length && i2 < str2.length; i2++) {
    if (str1[i2] != str2[i2]) {
      return str1.slice(0, i2);
    }
  }
  return str1.slice(0, i2);
}
function longestCommonSuffix(str1, str2) {
  var i2;
  if (!str1 || !str2 || str1[str1.length - 1] != str2[str2.length - 1]) {
    return "";
  }
  for (i2 = 0; i2 < str1.length && i2 < str2.length; i2++) {
    if (str1[str1.length - (i2 + 1)] != str2[str2.length - (i2 + 1)]) {
      return str1.slice(-i2);
    }
  }
  return str1.slice(-i2);
}
function replacePrefix(string, oldPrefix, newPrefix) {
  if (string.slice(0, oldPrefix.length) != oldPrefix) {
    throw Error("string ".concat(JSON.stringify(string), " doesn't start with prefix ").concat(JSON.stringify(oldPrefix), "; this is a bug"));
  }
  return newPrefix + string.slice(oldPrefix.length);
}
function replaceSuffix(string, oldSuffix, newSuffix) {
  if (!oldSuffix) {
    return string + newSuffix;
  }
  if (string.slice(-oldSuffix.length) != oldSuffix) {
    throw Error("string ".concat(JSON.stringify(string), " doesn't end with suffix ").concat(JSON.stringify(oldSuffix), "; this is a bug"));
  }
  return string.slice(0, -oldSuffix.length) + newSuffix;
}
function removePrefix(string, oldPrefix) {
  return replacePrefix(string, oldPrefix, "");
}
function removeSuffix(string, oldSuffix) {
  return replaceSuffix(string, oldSuffix, "");
}
function maximumOverlap(string1, string2) {
  return string2.slice(0, overlapCount(string1, string2));
}
function overlapCount(a, b) {
  var startA = 0;
  if (a.length > b.length) {
    startA = a.length - b.length;
  }
  var endB = b.length;
  if (a.length < b.length) {
    endB = a.length;
  }
  var map = Array(endB);
  var k = 0;
  map[0] = 0;
  for (var j = 1; j < endB; j++) {
    if (b[j] == b[k]) {
      map[j] = map[k];
    } else {
      map[j] = k;
    }
    while (k > 0 && b[j] != b[k]) {
      k = map[k];
    }
    if (b[j] == b[k]) {
      k++;
    }
  }
  k = 0;
  for (var i2 = startA; i2 < a.length; i2++) {
    while (k > 0 && a[i2] != b[k]) {
      k = map[k];
    }
    if (a[i2] == b[k]) {
      k++;
    }
  }
  return k;
}
function hasOnlyWinLineEndings(string) {
  return string.includes("\r\n") && !string.startsWith("\n") && !string.match(/[^\r]\n/);
}
function hasOnlyUnixLineEndings(string) {
  return !string.includes("\r\n") && string.includes("\n");
}
var extendedWordChars = "a-zA-Z0-9_\\u{C0}-\\u{FF}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}";
var tokenizeIncludingWhitespace = new RegExp("[".concat(extendedWordChars, "]+|\\s+|[^").concat(extendedWordChars, "]"), "ug");
var wordDiff = new Diff();
wordDiff.equals = function(left, right, options) {
  if (options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  }
  return left.trim() === right.trim();
};
wordDiff.tokenize = function(value) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var parts2;
  if (options.intlSegmenter) {
    if (options.intlSegmenter.resolvedOptions().granularity != "word") {
      throw new Error('The segmenter passed must have a granularity of "word"');
    }
    parts2 = Array.from(options.intlSegmenter.segment(value), function(segment) {
      return segment.segment;
    });
  } else {
    parts2 = value.match(tokenizeIncludingWhitespace) || [];
  }
  var tokens = [];
  var prevPart = null;
  parts2.forEach(function(part) {
    if (/\s/.test(part)) {
      if (prevPart == null) {
        tokens.push(part);
      } else {
        tokens.push(tokens.pop() + part);
      }
    } else if (/\s/.test(prevPart)) {
      if (tokens[tokens.length - 1] == prevPart) {
        tokens.push(tokens.pop() + part);
      } else {
        tokens.push(prevPart + part);
      }
    } else {
      tokens.push(part);
    }
    prevPart = part;
  });
  return tokens;
};
wordDiff.join = function(tokens) {
  return tokens.map(function(token, i2) {
    if (i2 == 0) {
      return token;
    } else {
      return token.replace(/^\s+/, "");
    }
  }).join("");
};
wordDiff.postProcess = function(changes, options) {
  if (!changes || options.oneChangePerToken) {
    return changes;
  }
  var lastKeep = null;
  var insertion = null;
  var deletion = null;
  changes.forEach(function(change) {
    if (change.added) {
      insertion = change;
    } else if (change.removed) {
      deletion = change;
    } else {
      if (insertion || deletion) {
        dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change);
      }
      lastKeep = change;
      insertion = null;
      deletion = null;
    }
  });
  if (insertion || deletion) {
    dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null);
  }
  return changes;
};
function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep) {
  if (deletion && insertion) {
    var oldWsPrefix = deletion.value.match(/^\s*/)[0];
    var oldWsSuffix = deletion.value.match(/\s*$/)[0];
    var newWsPrefix = insertion.value.match(/^\s*/)[0];
    var newWsSuffix = insertion.value.match(/\s*$/)[0];
    if (startKeep) {
      var commonWsPrefix = longestCommonPrefix(oldWsPrefix, newWsPrefix);
      startKeep.value = replaceSuffix(startKeep.value, newWsPrefix, commonWsPrefix);
      deletion.value = removePrefix(deletion.value, commonWsPrefix);
      insertion.value = removePrefix(insertion.value, commonWsPrefix);
    }
    if (endKeep) {
      var commonWsSuffix = longestCommonSuffix(oldWsSuffix, newWsSuffix);
      endKeep.value = replacePrefix(endKeep.value, newWsSuffix, commonWsSuffix);
      deletion.value = removeSuffix(deletion.value, commonWsSuffix);
      insertion.value = removeSuffix(insertion.value, commonWsSuffix);
    }
  } else if (insertion) {
    if (startKeep) {
      insertion.value = insertion.value.replace(/^\s*/, "");
    }
    if (endKeep) {
      endKeep.value = endKeep.value.replace(/^\s*/, "");
    }
  } else if (startKeep && endKeep) {
    var newWsFull = endKeep.value.match(/^\s*/)[0], delWsStart = deletion.value.match(/^\s*/)[0], delWsEnd = deletion.value.match(/\s*$/)[0];
    var newWsStart = longestCommonPrefix(newWsFull, delWsStart);
    deletion.value = removePrefix(deletion.value, newWsStart);
    var newWsEnd = longestCommonSuffix(removePrefix(newWsFull, newWsStart), delWsEnd);
    deletion.value = removeSuffix(deletion.value, newWsEnd);
    endKeep.value = replacePrefix(endKeep.value, newWsFull, newWsEnd);
    startKeep.value = replaceSuffix(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
  } else if (endKeep) {
    var endKeepWsPrefix = endKeep.value.match(/^\s*/)[0];
    var deletionWsSuffix = deletion.value.match(/\s*$/)[0];
    var overlap = maximumOverlap(deletionWsSuffix, endKeepWsPrefix);
    deletion.value = removeSuffix(deletion.value, overlap);
  } else if (startKeep) {
    var startKeepWsSuffix = startKeep.value.match(/\s*$/)[0];
    var deletionWsPrefix = deletion.value.match(/^\s*/)[0];
    var _overlap = maximumOverlap(startKeepWsSuffix, deletionWsPrefix);
    deletion.value = removePrefix(deletion.value, _overlap);
  }
}
var wordWithSpaceDiff = new Diff();
wordWithSpaceDiff.tokenize = function(value) {
  var regex = new RegExp("(\\r?\\n)|[".concat(extendedWordChars, "]+|[^\\S\\n\\r]+|[^").concat(extendedWordChars, "]"), "ug");
  return value.match(regex) || [];
};
var lineDiff = new Diff();
lineDiff.tokenize = function(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, "\n");
  }
  var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (var i2 = 0; i2 < linesAndNewlines.length; i2++) {
    var line = linesAndNewlines[i2];
    if (i2 % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
};
lineDiff.equals = function(left, right, options) {
  if (options.ignoreWhitespace) {
    if (!options.newlineIsToken || !left.includes("\n")) {
      left = left.trim();
    }
    if (!options.newlineIsToken || !right.includes("\n")) {
      right = right.trim();
    }
  } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
    if (left.endsWith("\n")) {
      left = left.slice(0, -1);
    }
    if (right.endsWith("\n")) {
      right = right.slice(0, -1);
    }
  }
  return Diff.prototype.equals.call(this, left, right, options);
};
function diffLines(oldStr, newStr, callback) {
  return lineDiff.diff(oldStr, newStr, callback);
}
var sentenceDiff = new Diff();
sentenceDiff.tokenize = function(value) {
  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
};
var cssDiff = new Diff();
cssDiff.tokenize = function(value) {
  return value.split(/([{}:;,]|\s+)/);
};
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i2 = e.call(t, r || "default");
    if ("object" != typeof i2) return i2;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i2 = _toPrimitive(t, "string");
  return "symbol" == typeof i2 ? i2 : i2 + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var jsonDiff = new Diff();
jsonDiff.useLongestToken = true;
jsonDiff.tokenize = lineDiff.tokenize;
jsonDiff.castInput = function(value, options) {
  var undefinedReplacement = options.undefinedReplacement, _options$stringifyRep = options.stringifyReplacer, stringifyReplacer = _options$stringifyRep === void 0 ? function(k, v) {
    return typeof v === "undefined" ? undefinedReplacement : v;
  } : _options$stringifyRep;
  return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, "  ");
};
jsonDiff.equals = function(left, right, options) {
  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"), options);
};
function canonicalize(obj, stack, replacementStack, replacer, key) {
  stack = stack || [];
  replacementStack = replacementStack || [];
  if (replacer) {
    obj = replacer(key, obj);
  }
  var i2;
  for (i2 = 0; i2 < stack.length; i2 += 1) {
    if (stack[i2] === obj) {
      return replacementStack[i2];
    }
  }
  var canonicalizedObj;
  if ("[object Array]" === Object.prototype.toString.call(obj)) {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);
    for (i2 = 0; i2 < obj.length; i2 += 1) {
      canonicalizedObj[i2] = canonicalize(obj[i2], stack, replacementStack, replacer, key);
    }
    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  }
  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }
  if (_typeof(obj) === "object" && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);
    var sortedKeys = [], _key;
    for (_key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, _key)) {
        sortedKeys.push(_key);
      }
    }
    sortedKeys.sort();
    for (i2 = 0; i2 < sortedKeys.length; i2 += 1) {
      _key = sortedKeys[i2];
      canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
    }
    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  }
  return canonicalizedObj;
}
var arrayDiff = new Diff();
arrayDiff.tokenize = function(value) {
  return value.slice();
};
arrayDiff.join = arrayDiff.removeEmpty = function(value) {
  return value;
};
function unixToWin(patch) {
  if (Array.isArray(patch)) {
    return patch.map(unixToWin);
  }
  return _objectSpread2(_objectSpread2({}, patch), {}, {
    hunks: patch.hunks.map(function(hunk) {
      return _objectSpread2(_objectSpread2({}, hunk), {}, {
        lines: hunk.lines.map(function(line, i2) {
          var _hunk$lines;
          return line.startsWith("\\") || line.endsWith("\r") || (_hunk$lines = hunk.lines[i2 + 1]) !== null && _hunk$lines !== void 0 && _hunk$lines.startsWith("\\") ? line : line + "\r";
        })
      });
    })
  });
}
function winToUnix(patch) {
  if (Array.isArray(patch)) {
    return patch.map(winToUnix);
  }
  return _objectSpread2(_objectSpread2({}, patch), {}, {
    hunks: patch.hunks.map(function(hunk) {
      return _objectSpread2(_objectSpread2({}, hunk), {}, {
        lines: hunk.lines.map(function(line) {
          return line.endsWith("\r") ? line.substring(0, line.length - 1) : line;
        })
      });
    })
  });
}
function isUnix(patch) {
  if (!Array.isArray(patch)) {
    patch = [patch];
  }
  return !patch.some(function(index) {
    return index.hunks.some(function(hunk) {
      return hunk.lines.some(function(line) {
        return !line.startsWith("\\") && line.endsWith("\r");
      });
    });
  });
}
function isWin(patch) {
  if (!Array.isArray(patch)) {
    patch = [patch];
  }
  return patch.some(function(index) {
    return index.hunks.some(function(hunk) {
      return hunk.lines.some(function(line) {
        return line.endsWith("\r");
      });
    });
  }) && patch.every(function(index) {
    return index.hunks.every(function(hunk) {
      return hunk.lines.every(function(line, i2) {
        var _hunk$lines2;
        return line.startsWith("\\") || line.endsWith("\r") || ((_hunk$lines2 = hunk.lines[i2 + 1]) === null || _hunk$lines2 === void 0 ? void 0 : _hunk$lines2.startsWith("\\"));
      });
    });
  });
}
function parsePatch(uniDiff) {
  var diffstr = uniDiff.split(/\n/), list = [], i2 = 0;
  function parseIndex() {
    var index = {};
    list.push(index);
    while (i2 < diffstr.length) {
      var line = diffstr[i2];
      if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
        break;
      }
      var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
      if (header) {
        index.index = header[1];
      }
      i2++;
    }
    parseFileHeader(index);
    parseFileHeader(index);
    index.hunks = [];
    while (i2 < diffstr.length) {
      var _line = diffstr[i2];
      if (/^(Index:\s|diff\s|\-\-\-\s|\+\+\+\s|===================================================================)/.test(_line)) {
        break;
      } else if (/^@@/.test(_line)) {
        index.hunks.push(parseHunk());
      } else if (_line) {
        throw new Error("Unknown line " + (i2 + 1) + " " + JSON.stringify(_line));
      } else {
        i2++;
      }
    }
  }
  function parseFileHeader(index) {
    var fileHeader = /^(---|\+\+\+)\s+(.*)\r?$/.exec(diffstr[i2]);
    if (fileHeader) {
      var keyPrefix = fileHeader[1] === "---" ? "old" : "new";
      var data = fileHeader[2].split("	", 2);
      var fileName = data[0].replace(/\\\\/g, "\\");
      if (/^".*"$/.test(fileName)) {
        fileName = fileName.substr(1, fileName.length - 2);
      }
      index[keyPrefix + "FileName"] = fileName;
      index[keyPrefix + "Header"] = (data[1] || "").trim();
      i2++;
    }
  }
  function parseHunk() {
    var chunkHeaderIndex = i2, chunkHeaderLine = diffstr[i2++], chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    var hunk = {
      oldStart: +chunkHeader[1],
      oldLines: typeof chunkHeader[2] === "undefined" ? 1 : +chunkHeader[2],
      newStart: +chunkHeader[3],
      newLines: typeof chunkHeader[4] === "undefined" ? 1 : +chunkHeader[4],
      lines: []
    };
    if (hunk.oldLines === 0) {
      hunk.oldStart += 1;
    }
    if (hunk.newLines === 0) {
      hunk.newStart += 1;
    }
    var addCount = 0, removeCount = 0;
    for (; i2 < diffstr.length && (removeCount < hunk.oldLines || addCount < hunk.newLines || (_diffstr$i = diffstr[i2]) !== null && _diffstr$i !== void 0 && _diffstr$i.startsWith("\\")); i2++) {
      var _diffstr$i;
      var operation = diffstr[i2].length == 0 && i2 != diffstr.length - 1 ? " " : diffstr[i2][0];
      if (operation === "+" || operation === "-" || operation === " " || operation === "\\") {
        hunk.lines.push(diffstr[i2]);
        if (operation === "+") {
          addCount++;
        } else if (operation === "-") {
          removeCount++;
        } else if (operation === " ") {
          addCount++;
          removeCount++;
        }
      } else {
        throw new Error("Hunk at line ".concat(chunkHeaderIndex + 1, " contained invalid line ").concat(diffstr[i2]));
      }
    }
    if (!addCount && hunk.newLines === 1) {
      hunk.newLines = 0;
    }
    if (!removeCount && hunk.oldLines === 1) {
      hunk.oldLines = 0;
    }
    if (addCount !== hunk.newLines) {
      throw new Error("Added line count did not match for hunk at line " + (chunkHeaderIndex + 1));
    }
    if (removeCount !== hunk.oldLines) {
      throw new Error("Removed line count did not match for hunk at line " + (chunkHeaderIndex + 1));
    }
    return hunk;
  }
  while (i2 < diffstr.length) {
    parseIndex();
  }
  return list;
}
function distanceIterator(start2, minLine, maxLine) {
  var wantForward = true, backwardExhausted = false, forwardExhausted = false, localOffset = 1;
  return function iterator() {
    if (wantForward && !forwardExhausted) {
      if (backwardExhausted) {
        localOffset++;
      } else {
        wantForward = false;
      }
      if (start2 + localOffset <= maxLine) {
        return start2 + localOffset;
      }
      forwardExhausted = true;
    }
    if (!backwardExhausted) {
      if (!forwardExhausted) {
        wantForward = true;
      }
      if (minLine <= start2 - localOffset) {
        return start2 - localOffset++;
      }
      backwardExhausted = true;
      return iterator();
    }
  };
}
function applyPatch(source, uniDiff) {
  var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  if (typeof uniDiff === "string") {
    uniDiff = parsePatch(uniDiff);
  }
  if (Array.isArray(uniDiff)) {
    if (uniDiff.length > 1) {
      throw new Error("applyPatch only works with a single input.");
    }
    uniDiff = uniDiff[0];
  }
  if (options.autoConvertLineEndings || options.autoConvertLineEndings == null) {
    if (hasOnlyWinLineEndings(source) && isUnix(uniDiff)) {
      uniDiff = unixToWin(uniDiff);
    } else if (hasOnlyUnixLineEndings(source) && isWin(uniDiff)) {
      uniDiff = winToUnix(uniDiff);
    }
  }
  var lines = source.split("\n"), hunks = uniDiff.hunks, compareLine = options.compareLine || function(lineNumber, line2, operation, patchContent) {
    return line2 === patchContent;
  }, fuzzFactor = options.fuzzFactor || 0, minLine = 0;
  if (fuzzFactor < 0 || !Number.isInteger(fuzzFactor)) {
    throw new Error("fuzzFactor must be a non-negative integer");
  }
  if (!hunks.length) {
    return source;
  }
  var prevLine = "", removeEOFNL = false, addEOFNL = false;
  for (var i2 = 0; i2 < hunks[hunks.length - 1].lines.length; i2++) {
    var line = hunks[hunks.length - 1].lines[i2];
    if (line[0] == "\\") {
      if (prevLine[0] == "+") {
        removeEOFNL = true;
      } else if (prevLine[0] == "-") {
        addEOFNL = true;
      }
    }
    prevLine = line;
  }
  if (removeEOFNL) {
    if (addEOFNL) {
      if (!fuzzFactor && lines[lines.length - 1] == "") {
        return false;
      }
    } else if (lines[lines.length - 1] == "") {
      lines.pop();
    } else if (!fuzzFactor) {
      return false;
    }
  } else if (addEOFNL) {
    if (lines[lines.length - 1] != "") {
      lines.push("");
    } else if (!fuzzFactor) {
      return false;
    }
  }
  function applyHunk(hunkLines, toPos2, maxErrors2) {
    var hunkLinesI = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
    var lastContextLineMatched = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
    var patchedLines = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [];
    var patchedLinesLength = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : 0;
    var nConsecutiveOldContextLines = 0;
    var nextContextLineMustMatch = false;
    for (; hunkLinesI < hunkLines.length; hunkLinesI++) {
      var hunkLine = hunkLines[hunkLinesI], operation = hunkLine.length > 0 ? hunkLine[0] : " ", content = hunkLine.length > 0 ? hunkLine.substr(1) : hunkLine;
      if (operation === "-") {
        if (compareLine(toPos2 + 1, lines[toPos2], operation, content)) {
          toPos2++;
          nConsecutiveOldContextLines = 0;
        } else {
          if (!maxErrors2 || lines[toPos2] == null) {
            return null;
          }
          patchedLines[patchedLinesLength] = lines[toPos2];
          return applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI, false, patchedLines, patchedLinesLength + 1);
        }
      }
      if (operation === "+") {
        if (!lastContextLineMatched) {
          return null;
        }
        patchedLines[patchedLinesLength] = content;
        patchedLinesLength++;
        nConsecutiveOldContextLines = 0;
        nextContextLineMustMatch = true;
      }
      if (operation === " ") {
        nConsecutiveOldContextLines++;
        patchedLines[patchedLinesLength] = lines[toPos2];
        if (compareLine(toPos2 + 1, lines[toPos2], operation, content)) {
          patchedLinesLength++;
          lastContextLineMatched = true;
          nextContextLineMustMatch = false;
          toPos2++;
        } else {
          if (nextContextLineMustMatch || !maxErrors2) {
            return null;
          }
          return lines[toPos2] && (applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI + 1, false, patchedLines, patchedLinesLength + 1) || applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI, false, patchedLines, patchedLinesLength + 1)) || applyHunk(hunkLines, toPos2, maxErrors2 - 1, hunkLinesI + 1, false, patchedLines, patchedLinesLength);
        }
      }
    }
    patchedLinesLength -= nConsecutiveOldContextLines;
    toPos2 -= nConsecutiveOldContextLines;
    patchedLines.length = patchedLinesLength;
    return {
      patchedLines,
      oldLineLastI: toPos2 - 1
    };
  }
  var resultLines = [];
  var prevHunkOffset = 0;
  for (var _i = 0; _i < hunks.length; _i++) {
    var hunk = hunks[_i];
    var hunkResult = void 0;
    var maxLine = lines.length - hunk.oldLines + fuzzFactor;
    var toPos = void 0;
    for (var maxErrors = 0; maxErrors <= fuzzFactor; maxErrors++) {
      toPos = hunk.oldStart + prevHunkOffset - 1;
      var iterator = distanceIterator(toPos, minLine, maxLine);
      for (; toPos !== void 0; toPos = iterator()) {
        hunkResult = applyHunk(hunk.lines, toPos, maxErrors);
        if (hunkResult) {
          break;
        }
      }
      if (hunkResult) {
        break;
      }
    }
    if (!hunkResult) {
      return false;
    }
    for (var _i2 = minLine; _i2 < toPos; _i2++) {
      resultLines.push(lines[_i2]);
    }
    for (var _i3 = 0; _i3 < hunkResult.patchedLines.length; _i3++) {
      var _line = hunkResult.patchedLines[_i3];
      resultLines.push(_line);
    }
    minLine = hunkResult.oldLineLastI + 1;
    prevHunkOffset = toPos + 1 - hunk.oldStart;
  }
  for (var _i4 = minLine; _i4 < lines.length; _i4++) {
    resultLines.push(lines[_i4]);
  }
  return resultLines.join("\n");
}
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (!options) {
    options = {};
  }
  if (typeof options === "function") {
    options = {
      callback: options
    };
  }
  if (typeof options.context === "undefined") {
    options.context = 4;
  }
  if (options.newlineIsToken) {
    throw new Error("newlineIsToken may not be used with patch-generation functions, only with diffing functions");
  }
  if (!options.callback) {
    return diffLinesResultToPatch(diffLines(oldStr, newStr, options));
  } else {
    var _options = options, _callback = _options.callback;
    diffLines(oldStr, newStr, _objectSpread2(_objectSpread2({}, options), {}, {
      callback: function callback(diff2) {
        var patch = diffLinesResultToPatch(diff2);
        _callback(patch);
      }
    }));
  }
  function diffLinesResultToPatch(diff2) {
    if (!diff2) {
      return;
    }
    diff2.push({
      value: "",
      lines: []
    });
    function contextLines(lines) {
      return lines.map(function(entry) {
        return " " + entry;
      });
    }
    var hunks = [];
    var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
    var _loop = function _loop2() {
      var current = diff2[i2], lines = current.lines || splitLines(current.value);
      current.lines = lines;
      if (current.added || current.removed) {
        var _curRange;
        if (!oldRangeStart) {
          var prev = diff2[i2 - 1];
          oldRangeStart = oldLine;
          newRangeStart = newLine;
          if (prev) {
            curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
            oldRangeStart -= curRange.length;
            newRangeStart -= curRange.length;
          }
        }
        (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function(entry) {
          return (current.added ? "+" : "-") + entry;
        })));
        if (current.added) {
          newLine += lines.length;
        } else {
          oldLine += lines.length;
        }
      } else {
        if (oldRangeStart) {
          if (lines.length <= options.context * 2 && i2 < diff2.length - 2) {
            var _curRange2;
            (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
          } else {
            var _curRange3;
            var contextSize = Math.min(lines.length, options.context);
            (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));
            var _hunk = {
              oldStart: oldRangeStart,
              oldLines: oldLine - oldRangeStart + contextSize,
              newStart: newRangeStart,
              newLines: newLine - newRangeStart + contextSize,
              lines: curRange
            };
            hunks.push(_hunk);
            oldRangeStart = 0;
            newRangeStart = 0;
            curRange = [];
          }
        }
        oldLine += lines.length;
        newLine += lines.length;
      }
    };
    for (var i2 = 0; i2 < diff2.length; i2++) {
      _loop();
    }
    for (var _i = 0, _hunks = hunks; _i < _hunks.length; _i++) {
      var hunk = _hunks[_i];
      for (var _i2 = 0; _i2 < hunk.lines.length; _i2++) {
        if (hunk.lines[_i2].endsWith("\n")) {
          hunk.lines[_i2] = hunk.lines[_i2].slice(0, -1);
        } else {
          hunk.lines.splice(_i2 + 1, 0, "\\ No newline at end of file");
          _i2++;
        }
      }
    }
    return {
      oldFileName,
      newFileName,
      oldHeader,
      newHeader,
      hunks
    };
  }
}
function formatPatch(diff2) {
  if (Array.isArray(diff2)) {
    return diff2.map(formatPatch).join("\n");
  }
  var ret = [];
  if (diff2.oldFileName == diff2.newFileName) {
    ret.push("Index: " + diff2.oldFileName);
  }
  ret.push("===================================================================");
  ret.push("--- " + diff2.oldFileName + (typeof diff2.oldHeader === "undefined" ? "" : "	" + diff2.oldHeader));
  ret.push("+++ " + diff2.newFileName + (typeof diff2.newHeader === "undefined" ? "" : "	" + diff2.newHeader));
  for (var i2 = 0; i2 < diff2.hunks.length; i2++) {
    var hunk = diff2.hunks[i2];
    if (hunk.oldLines === 0) {
      hunk.oldStart -= 1;
    }
    if (hunk.newLines === 0) {
      hunk.newStart -= 1;
    }
    ret.push("@@ -" + hunk.oldStart + "," + hunk.oldLines + " +" + hunk.newStart + "," + hunk.newLines + " @@");
    ret.push.apply(ret, hunk.lines);
  }
  return ret.join("\n") + "\n";
}
function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  var _options2;
  if (typeof options === "function") {
    options = {
      callback: options
    };
  }
  if (!((_options2 = options) !== null && _options2 !== void 0 && _options2.callback)) {
    var patchObj = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
    if (!patchObj) {
      return;
    }
    return formatPatch(patchObj);
  } else {
    var _options3 = options, _callback2 = _options3.callback;
    structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, _objectSpread2(_objectSpread2({}, options), {}, {
      callback: function callback(patchObj2) {
        if (!patchObj2) {
          _callback2();
        } else {
          _callback2(formatPatch(patchObj2));
        }
      }
    }));
  }
}
function splitLines(text) {
  var hasTrailingNl = text.endsWith("\n");
  var result = text.split("\n").map(function(line) {
    return line + "\n";
  });
  if (hasTrailingNl) {
    result.pop();
  } else {
    result.push(result.pop().slice(0, -1));
  }
  return result;
}

// src/replace-history-core.ts
function contentHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}
function createReversePatch(postContent, preContent, filePath) {
  return createTwoFilesPatch(
    `${path.basename(filePath)} (post)`,
    `${path.basename(filePath)} (pre)`,
    postContent,
    preContent,
    "",
    "",
    { context: 3 }
  );
}
function applyReversePatch(currentContent, patch) {
  const result = applyPatch(currentContent, patch, { fuzz: 0 });
  if (result === false) {
    return void 0;
  }
  return result;
}
function sanitizeFileId(filePath) {
  return crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16);
}

// src/replace-history-store.ts
var fs2 = __toESM(require("node:fs/promises"));
var path2 = __toESM(require("node:path"));
var vscode3 = __toESM(require("vscode"));
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
      vscode3.Uri.joinPath(context.storageUri, "undo").fsPath
    );
  }
  resolve(relPath) {
    return path2.join(this.undoRootFsPath, relPath);
  }
  entryDirRel(entryId) {
    return path2.posix.join(ENTRIES_DIR, entryId);
  }
  entryDirFsPath(entryId) {
    return this.resolve(this.entryDirRel(entryId));
  }
  manifestPath() {
    return path2.join(this.undoRootFsPath, MANIFEST_FILE);
  }
  async manifestExists() {
    try {
      await fs2.access(this.manifestPath());
      return true;
    } catch {
      return false;
    }
  }
  async ensureRoot() {
    await fs2.mkdir(this.undoRootFsPath, { recursive: true });
  }
  async readManifest() {
    try {
      const raw = await fs2.readFile(this.manifestPath(), "utf8");
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
    await fs2.writeFile(this.manifestPath(), JSON.stringify(manifest, null, 2), "utf8");
  }
  async readEntryMeta(entryId) {
    const metaPath = path2.join(this.entryDirFsPath(entryId), "meta.json");
    try {
      const raw = await fs2.readFile(metaPath, "utf8");
      return JSON.parse(raw);
    } catch {
      return void 0;
    }
  }
  async writeEntryMeta(meta) {
    const dir = this.entryDirFsPath(meta.id);
    await fs2.mkdir(dir, { recursive: true });
    await fs2.writeFile(
      path2.join(dir, "meta.json"),
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
    await fs2.mkdir(path2.join(this.undoRootFsPath, ENTRIES_DIR), { recursive: true });
    for (const entry of entries) {
      await this.writeEntryMeta(entry);
    }
    await this.writeManifest(entries);
  }
  async deleteEntry(entryId) {
    await fs2.rm(this.entryDirFsPath(entryId), { recursive: true, force: true });
  }
  async writeBlob(relPath, content) {
    const fullPath = this.resolve(relPath);
    await fs2.mkdir(path2.dirname(fullPath), { recursive: true });
    await fs2.writeFile(fullPath, content, "utf8");
  }
  async readBlob(relPath) {
    return fs2.readFile(this.resolve(relPath), "utf8");
  }
  blobExists(relPath) {
    return fs2.access(this.resolve(relPath)).then(() => true).catch(() => false);
  }
};
function patchRel(entryId, fileId) {
  return path2.posix.join(ENTRIES_DIR, entryId, `${fileId}.patch`);
}
function postSnapshotRel(entryId, fileId) {
  return path2.posix.join(ENTRIES_DIR, entryId, `${fileId}-post.txt`);
}

// src/replace-history.ts
var HISTORY_CAP = 50;
var ReplaceHistoryManager = class _ReplaceHistoryManager {
  constructor(store) {
    this.store = store;
  }
  entries = [];
  static async create(context) {
    const store = ReplaceHistoryStore.fromContext(context);
    const manager = new _ReplaceHistoryManager(store);
    if (store) {
      manager.entries = await store.loadAllEntries();
    }
    return manager;
  }
  canUndo() {
    return this.entries.length > 0;
  }
  peek() {
    return this.entries[this.entries.length - 1];
  }
  peekLabel() {
    return this.peek()?.label;
  }
  requireStore() {
    if (!this.store) {
      throw new Error("No workspace open for replace history.");
    }
    return this.store;
  }
  async persistFileArtifacts(entryId, input) {
    const store = this.requireStore();
    const fileId = sanitizeFileId(input.path);
    const undoPatchRel = patchRel(entryId, fileId);
    const postSnapshotRelPath = postSnapshotRel(entryId, fileId);
    const patch = createReversePatch(input.postContent, input.preContent, input.path);
    await store.writeBlob(undoPatchRel, patch);
    await store.writeBlob(postSnapshotRelPath, input.postContent);
    return {
      path: input.path,
      postHash: contentHash(input.postContent),
      preHash: contentHash(input.preContent),
      preVersion: input.preVersion,
      postVersion: input.postVersion,
      undoPatchRel,
      postSnapshotRel: postSnapshotRelPath
    };
  }
  async push(entry) {
    const full = {
      id: entry.id ?? crypto2.randomUUID(),
      timestamp: Date.now(),
      label: entry.label,
      files: entry.files,
      searchPayload: entry.searchPayload
    };
    this.entries.push(full);
    while (this.entries.length > HISTORY_CAP) {
      const removed = this.entries.shift();
      if (removed) {
        await this.deleteEntryArtifacts(removed.id);
      }
    }
    await this.persist();
    return full;
  }
  async pop() {
    const entry = this.entries.pop();
    if (entry) {
      await this.deleteEntryArtifacts(entry.id);
      await this.persist();
    }
    return entry;
  }
  async persist() {
    if (!this.store) {
      return;
    }
    await this.store.saveAllEntries(this.entries);
  }
  async deleteEntryArtifacts(entryId) {
    if (!this.store) {
      return;
    }
    await this.store.deleteEntry(entryId);
  }
  async readPreContent(record) {
    const store = this.requireStore();
    const post = await store.readBlob(record.postSnapshotRel);
    const patch = await store.readBlob(record.undoPatchRel);
    const pre = applyReversePatch(post, patch);
    if (pre === void 0) {
      throw new Error(`Failed to reconstruct pre-replace content for ${record.path}`);
    }
    return pre;
  }
  async readPatch(record) {
    return this.requireStore().readBlob(record.undoPatchRel);
  }
};
async function replaceDocumentContent(doc, newText) {
  const uri = doc.uri;
  const fullRange = new vscode4.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length)
  );
  const editor = vscode4.window.visibleTextEditors.find(
    (e) => e.document.uri.toString() === uri.toString()
  );
  if (editor) {
    const applied = await editor.edit((builder) => {
      builder.replace(fullRange, newText);
    });
    if (applied) {
      return true;
    }
  }
  const workspaceEdit = new vscode4.WorkspaceEdit();
  workspaceEdit.replace(uri, fullRange, newText);
  return vscode4.workspace.applyEdit(workspaceEdit);
}
function fileHashMatches(record, currentText) {
  return contentHash(currentText) === record.postHash;
}
async function applyStrictUndoToFile(history, record, doc) {
  const current = doc.getText();
  if (!fileHashMatches(record, current)) {
    return false;
  }
  const patch = await history.readPatch(record);
  const restored = applyReversePatch(current, patch);
  if (restored === void 0) {
    throw new Error(`Patch apply failed for ${record.path}`);
  }
  if (contentHash(restored) !== record.preHash) {
    throw new Error(`Undo verification failed for ${record.path}`);
  }
  return replaceDocumentContent(doc, restored);
}
async function applyForceUndoToFile(history, record, doc) {
  const pre = await history.readPreContent(record);
  if (contentHash(pre) !== record.preHash) {
    throw new Error(`Pre-replace snapshot verification failed for ${record.path}`);
  }
  return replaceDocumentContent(doc, pre);
}

// src/result-list-sync.ts
var vscode5 = __toESM(require("vscode"));
var import_core = __toESM(require_dist());
var REFRESH_DEBOUNCE_MS = 200;
var extensionEditDepth = 0;
async function runWithoutResultWatchAsync(fn) {
  extensionEditDepth++;
  try {
    return await fn();
  } finally {
    extensionEditDepth--;
  }
}
function isExtensionEdit() {
  return extensionEditDepth > 0;
}
function countResultFiles(results) {
  return new Set(results.map((r) => r.path)).size;
}
var ResultListSync = class {
  constructor(extractor, panel, isSearching) {
    this.extractor = extractor;
    this.panel = panel;
    this.isSearching = isSearching;
  }
  results = [];
  fileOrder = [];
  options;
  searchId = 0;
  fileTotal = 0;
  watchedPaths = /* @__PURE__ */ new Set();
  pendingPaths = /* @__PURE__ */ new Set();
  refreshTimer;
  refreshGeneration = 0;
  languageByPath = /* @__PURE__ */ new Map();
  bindDocumentWatcher(context) {
    context.subscriptions.push(
      vscode5.workspace.onDidChangeTextDocument((event) => {
        if (isExtensionEdit() || this.isSearching()) {
          return;
        }
        const filePath = event.document.uri.fsPath;
        if (event.document.uri.scheme !== "file" || !this.watchedPaths.has(filePath)) {
          return;
        }
        this.scheduleRefresh(filePath);
      })
    );
  }
  setFromSearch(results, options, searchId, fileTotal, languageByPath) {
    this.results = results;
    this.fileOrder = this.fileOrderFromResults(results);
    this.options = options;
    this.searchId = searchId;
    this.fileTotal = fileTotal;
    this.watchedPaths = new Set(results.map((r) => r.path));
    this.languageByPath = new Map(Object.entries(languageByPath ?? {}));
    this.pendingPaths.clear();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = void 0;
    }
  }
  clear() {
    this.results = [];
    this.fileOrder = [];
    this.options = void 0;
    this.searchId = 0;
    this.fileTotal = 0;
    this.watchedPaths.clear();
    this.pendingPaths.clear();
    this.languageByPath.clear();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = void 0;
    }
  }
  getResults() {
    return this.results;
  }
  getFileOrder() {
    return [...this.fileOrder];
  }
  scheduleRefresh(filePath) {
    if (!this.options?.pattern.trim()) {
      return;
    }
    this.pendingPaths.add(filePath);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = void 0;
      void this.flushScheduled();
    }, REFRESH_DEBOUNCE_MS);
  }
  async refreshFiles(filePaths) {
    for (const filePath of filePaths) {
      this.pendingPaths.add(filePath);
    }
    return this.flushScheduled();
  }
  fileOrderFromResults(results) {
    const order = [];
    const seen = /* @__PURE__ */ new Set();
    for (const result of results) {
      if (!seen.has(result.path)) {
        seen.add(result.path);
        order.push(result.path);
      }
    }
    return order;
  }
  mergeRefreshedResults(prior, refreshedByPath, refreshedPaths) {
    const keptByPath = /* @__PURE__ */ new Map();
    for (const result of prior) {
      if (refreshedPaths.has(result.path)) {
        continue;
      }
      const kept = keptByPath.get(result.path);
      if (kept) {
        kept.push(result);
      } else {
        keptByPath.set(result.path, [result]);
      }
    }
    const merged = [];
    for (const filePath of this.fileOrder) {
      if (refreshedPaths.has(filePath)) {
        merged.push(...refreshedByPath.get(filePath) ?? []);
      } else {
        merged.push(...keptByPath.get(filePath) ?? []);
      }
    }
    return merged;
  }
  async flushScheduled() {
    const paths = [...this.pendingPaths];
    this.pendingPaths.clear();
    if (paths.length === 0 || !this.options?.pattern.trim()) {
      return this.results;
    }
    const generation = ++this.refreshGeneration;
    const options = this.options;
    const refreshedPaths = new Set(paths);
    const refreshedByPath = /* @__PURE__ */ new Map();
    for (const filePath of paths) {
      if (generation !== this.refreshGeneration) {
        return this.results;
      }
      try {
        const uri = vscode5.Uri.file(filePath);
        const doc = vscode5.workspace.textDocuments.find((d) => d.uri.fsPath === filePath) ?? await vscode5.workspace.openTextDocument(uri);
        const spans = await this.extractor.extractSpans(filePath, doc.getText(), doc.languageId);
        refreshedByPath.set(filePath, (0, import_core.searchInSpans)(filePath, doc.getText(), spans, options));
        this.languageByPath.set(filePath, doc.languageId);
      } catch {
        refreshedByPath.set(filePath, []);
      }
    }
    if (generation !== this.refreshGeneration) {
      return this.results;
    }
    this.results = this.mergeRefreshedResults(this.results, refreshedByPath, refreshedPaths);
    this.watchedPaths = new Set(this.results.map((r) => r.path));
    this.publish(true);
    return this.results;
  }
  publish(preserveExclusions) {
    const languageByPath = Object.fromEntries(this.languageByPath.entries());
    this.panel.postResults(this.results, this.searchId, preserveExclusions, languageByPath);
    this.panel.postSearchStatus({
      searchId: this.searchId,
      state: "complete",
      matchCount: this.results.length,
      fileCount: countResultFiles(this.results),
      fileTotal: this.fileTotal
    });
  }
};

// src/extension.ts
var DEFAULT_SCOPES = [{ id: import_core2.DEFAULT_SCOPE, label: (0, import_core2.scopeLabel)(import_core2.DEFAULT_SCOPE) }];
var PANEL_STATE_KEY = "scopeSearch.panelState";
function loadGrammarBundleFromExtensions() {
  const manifests = [];
  for (const ext of vscode6.extensions.all) {
    const manifest = (0, import_core2.parseExtensionManifest)(ext.extensionPath, ext.packageJSON);
    if (manifest) {
      manifests.push(manifest);
    }
  }
  return (0, import_core2.buildGrammarBundle)(manifests);
}
function patternsFromConfiguration(searchCfg, filesCfg) {
  const patterns = [];
  for (const [key, val] of Object.entries(searchCfg.get("exclude") ?? {})) {
    if (val) {
      patterns.push(key);
    }
  }
  for (const [key, val] of Object.entries(filesCfg.get("exclude") ?? {})) {
    if (val) {
      patterns.push(key);
    }
  }
  return patterns;
}
function getDefaultExcludePatterns() {
  const folders = vscode6.workspace.workspaceFolders ?? [];
  const sources = [];
  if (folders.length === 0) {
    sources.push(patternsFromConfiguration(
      vscode6.workspace.getConfiguration("search"),
      vscode6.workspace.getConfiguration("files")
    ));
  } else {
    for (const folder of folders) {
      sources.push(patternsFromConfiguration(
        vscode6.workspace.getConfiguration("search", folder.uri),
        vscode6.workspace.getConfiguration("files", folder.uri)
      ));
      sources.push((0, import_core2.readDefaultExcludes)(path3.join(folder.uri.fsPath, ".vscode", "settings.json")));
    }
  }
  return (0, import_core2.mergeExcludeSources)(...sources);
}
function filterTextUris(uris) {
  return uris.filter((uri) => !(0, import_core2.isLikelyBinaryPath)(uri.fsPath));
}
async function resolveFiles(include, exclude) {
  const folders = vscode6.workspace.workspaceFolders ?? [];
  if (folders.length === 0) {
    return [];
  }
  const defaultExcludes = getDefaultExcludePatterns();
  const paths = [];
  for (const folder of folders) {
    const remaining = 2e3 - paths.length;
    if (remaining <= 0) {
      break;
    }
    const found = await (0, import_core2.resolveFilesNode)({
      cwd: folder.uri.fsPath,
      paths: ["."],
      include,
      exclude,
      defaultExcludes,
      useDefaultExcludes: false,
      maxFiles: remaining
    });
    paths.push(...found);
  }
  return filterTextUris(paths.map((p) => vscode6.Uri.file(p)));
}
async function tryReadFile(uri) {
  if ((0, import_core2.isLikelyBinaryPath)(uri.fsPath)) {
    return void 0;
  }
  try {
    const doc = await vscode6.workspace.openTextDocument(uri);
    return {
      path: uri.fsPath,
      text: doc.getText(),
      languageId: doc.languageId
    };
  } catch {
    return void 0;
  }
}
function countResultFiles2(results) {
  return new Set(results.map((r) => r.path)).size;
}
function languageByPathFromFiles(files, results) {
  const map = {};
  for (const file of files) {
    map[file.path] = file.languageId;
  }
  for (const result of results) {
    if (!(result.path in map)) {
      map[result.path] = void 0;
    }
  }
  return map;
}
function isMatchSkipped(match, skipMatches) {
  if (!skipMatches?.length) {
    return false;
  }
  const key = (0, import_core2.matchKey)(match);
  return skipMatches.some((s) => (0, import_core2.matchKey)(s) === key);
}
function visibleResultsAfterSkip(results, skipMatches) {
  return results.filter((m) => !isMatchSkipped(m, skipMatches));
}
function undoFocusTarget(payload) {
  const extended = payload;
  if (typeof extended.path === "string" && typeof extended.startLine === "number" && typeof extended.startCol === "number" && typeof extended.endLine === "number" && typeof extended.endCol === "number") {
    return {
      path: extended.path,
      startLine: extended.startLine,
      startCol: extended.startCol,
      endLine: extended.endLine,
      endCol: extended.endCol
    };
  }
  return void 0;
}
async function focusAfterUndo(entry, results) {
  const exact = undoFocusTarget(entry.searchPayload);
  if (exact) {
    await openSearchResult({ type: "openResult", ...exact });
    return;
  }
  const payload = entry.searchPayload;
  const filePath = payload.path ?? entry.files[0]?.path;
  if (!filePath) {
    return;
  }
  const match = visibleResultsAfterSkip(results, payload.skipMatches).find((m) => m.path === filePath);
  if (match) {
    await openSearchResult({
      type: "openResult",
      path: match.path,
      startLine: match.startLine,
      startCol: match.startCol,
      endLine: match.endLine,
      endCol: match.endCol
    });
  }
}
async function focusFirstMatchInNextFile(replacedFilePath, fileOrder, results, skipMatches) {
  const visible = visibleResultsAfterSkip(results, skipMatches);
  const startIndex = fileOrder.indexOf(replacedFilePath);
  if (startIndex === -1) {
    const next = visible.find((m) => m.path !== replacedFilePath);
    if (next) {
      await openSearchResult({
        type: "openResult",
        path: next.path,
        startLine: next.startLine,
        startCol: next.startCol,
        endLine: next.endLine,
        endCol: next.endCol
      });
    }
    return;
  }
  for (let i2 = startIndex + 1; i2 < fileOrder.length; i2++) {
    const match = visible.find((m) => m.path === fileOrder[i2]);
    if (match) {
      await openSearchResult({
        type: "openResult",
        path: match.path,
        startLine: match.startLine,
        startCol: match.startCol,
        endLine: match.endLine,
        endCol: match.endCol
      });
      return;
    }
  }
}
function resolveReplaceTarget(visible, payload) {
  const inFile = visible.filter((m) => m.path === payload.path);
  const byCoords = inFile.find((m) => (0, import_core2.matchPositionsEqual)(m, payload));
  if (byCoords) {
    return byCoords;
  }
  if (inFile.length === 1) {
    return inFile[0];
  }
  if (payload.replacedIndex != null && payload.replacedIndex < visible.length && visible[payload.replacedIndex].path === payload.path) {
    return visible[payload.replacedIndex];
  }
  const key = (0, import_core2.matchKey)(payload);
  return inFile.find((m) => (0, import_core2.matchKey)(m) === key);
}
async function focusAfterReplaceOne(replacedPath, replacedIndex, results, fileOrder, skipMatches) {
  const visible = visibleResultsAfterSkip(results, skipMatches);
  if (replacedIndex != null && replacedIndex < visible.length) {
    const next = visible[replacedIndex];
    await openSearchResult({
      type: "openResult",
      path: next.path,
      startLine: next.startLine,
      startCol: next.startCol,
      endLine: next.endLine,
      endCol: next.endCol
    });
    return;
  }
  const nextInFile = visible.find((m) => m.path === replacedPath);
  if (nextInFile) {
    await openSearchResult({
      type: "openResult",
      path: nextInFile.path,
      startLine: nextInFile.startLine,
      startCol: nextInFile.startCol,
      endLine: nextInFile.endLine,
      endCol: nextInFile.endCol
    });
    return;
  }
  await focusFirstMatchInNextFile(replacedPath, fileOrder, results, skipMatches);
}
function searchOptionsFromReplace(payload) {
  return {
    pattern: payload.query,
    isRegex: !!payload.isRegex,
    isCaseSensitive: !!payload.isCaseSensitive,
    matchWholeWord: !!payload.matchWholeWord,
    scopeId: payload.scopeId ?? import_core2.DEFAULT_SCOPE
  };
}
function skipForFile(skipMatches, filePath) {
  return (skipMatches ?? []).filter((m) => m.path === filePath).map(({ startLine, startCol, endLine, endCol }) => ({ startLine, startCol, endLine, endCol }));
}
async function applyTextEdits(doc, edits) {
  return runWithoutResultWatchAsync(async () => {
    if (edits.length === 0) {
      return false;
    }
    const uri = doc.uri;
    const sorted = [...edits].sort((a, b) => b.start - a.start);
    const toRange = (start2, end) => new vscode6.Range(doc.positionAt(start2), doc.positionAt(end));
    const editor = vscode6.window.visibleTextEditors.find(
      (e) => e.document.uri.toString() === uri.toString()
    );
    if (editor) {
      const applied = await editor.edit((builder) => {
        for (const edit of sorted) {
          builder.replace(toRange(edit.start, edit.end), edit.text);
        }
      });
      if (applied) {
        return true;
      }
    }
    const workspaceEdit = new vscode6.WorkspaceEdit();
    for (const edit of sorted) {
      workspaceEdit.replace(uri, toRange(edit.start, edit.end), edit.text);
    }
    return vscode6.workspace.applyEdit(workspaceEdit);
  });
}
async function applyFullFileReplace(extractor, filePath, options, replacement, skip) {
  if ((0, import_core2.isLikelyBinaryPath)(filePath)) {
    return { count: 0 };
  }
  const uri = vscode6.Uri.file(filePath);
  const existing = vscode6.workspace.textDocuments.find((d) => d.uri.fsPath === filePath);
  const doc = existing ?? await vscode6.workspace.openTextDocument(uri);
  const preContent = doc.getText();
  const preVersion = doc.version;
  const spans = await extractor.extractSpans(filePath, preContent, doc.languageId);
  const { count, edits } = (0, import_core2.replaceInSpans)(preContent, spans, {
    ...options,
    replacement,
    skip
  });
  if (count === 0) {
    return { count: 0 };
  }
  const applied = await applyTextEdits(doc, edits);
  if (!applied) {
    throw new Error("Replace failed: could not apply edit.");
  }
  const updatedDoc = vscode6.workspace.textDocuments.find((d) => d.uri.fsPath === filePath) ?? await vscode6.workspace.openTextDocument(uri);
  return {
    count,
    capture: {
      path: filePath,
      preContent,
      postContent: updatedDoc.getText(),
      preVersion,
      postVersion: updatedDoc.version
    }
  };
}
function postHistoryState(panel, history) {
  panel.postHistoryState({
    canUndo: history.canUndo(),
    label: history.peekLabel()
  });
}
async function recordReplaceHistory(history, panel, label, captures, searchPayload) {
  if (captures.length === 0) {
    return;
  }
  const entryId = crypto3.randomUUID();
  const files = [];
  for (const capture of captures) {
    files.push(await history.persistFileArtifacts(entryId, capture));
  }
  await history.push({
    id: entryId,
    label,
    files,
    searchPayload
  });
  postHistoryState(panel, history);
}
function setSearchingContext(active) {
  void vscode6.commands.executeCommand("setContext", "scopeSearch.searching", active);
}
async function activate(context) {
  const preferTreeSitter = vscode6.workspace.getConfiguration("scopeSearch").get("preferTreeSitter", true);
  const moduleRoot = (0, import_core2.findModuleRoot)(context.extensionPath);
  const grammarBundle = loadGrammarBundleFromExtensions();
  const extractor = new import_core2.SpanExtractor(grammarBundle.primaryGrammars, {
    preferTreeSitter,
    moduleRoot,
    commentRules: grammarBundle.commentRules,
    grammarsByScope: grammarBundle.grammarsByScope
  });
  const panel = new ScopeSearchPanel(context.extensionUri);
  const replaceHistory = await ReplaceHistoryManager.create(context);
  let searching = false;
  const resultSync = new ResultListSync(extractor, panel, () => searching);
  resultSync.bindDocumentWatcher(context);
  const setActiveSearch = (active) => {
    searching = active;
    setSearchingContext(active);
  };
  let latestSearchId = 0;
  let stopSearchId = 0;
  let scopeUpdateId = 0;
  const loadPanelState = () => context.workspaceState.get(PANEL_STATE_KEY) ?? {};
  const savePanelState = async (state) => {
    await context.workspaceState.update(PANEL_STATE_KEY, state);
  };
  const updateScopes = (payload = {}) => {
    const updateId = ++scopeUpdateId;
    void (async () => {
      try {
        let uris = await resolveFiles(payload.include, payload.exclude);
        if (uris.length === 0 && vscode6.workspace.workspaceFolders?.length) {
          await new Promise((r) => setTimeout(r, 400));
          uris = await resolveFiles(payload.include, payload.exclude);
        }
        if (updateId !== scopeUpdateId) {
          return;
        }
        if (uris.length === 0) {
          panel.postScopes(DEFAULT_SCOPES);
          return;
        }
        const uriByPath = new Map(uris.map((u) => [u.fsPath, u]));
        const scopes = await (0, import_core2.discoverScopes)(
          extractor,
          uris.map((u) => u.fsPath),
          async (p) => {
            const uri = uriByPath.get(p);
            if (!uri) {
              return "";
            }
            const file = await tryReadFile(uri);
            return file?.text ?? "";
          },
          async (p) => {
            const uri = uriByPath.get(p);
            if (!uri) {
              return void 0;
            }
            const file = await tryReadFile(uri);
            return file?.languageId;
          }
        );
        if (updateId !== scopeUpdateId) {
          return;
        }
        panel.postScopes(scopes.length > 0 ? scopes : DEFAULT_SCOPES);
      } catch (err2) {
        if (updateId !== scopeUpdateId) {
          return;
        }
        panel.postScopes(DEFAULT_SCOPES);
        console.warn("[scope-search] scope discovery failed:", err2);
      }
    })();
  };
  const doSearch = async (payload) => {
    const searchId = payload.searchId;
    latestSearchId = searchId;
    try {
      const options = {
        pattern: payload.query,
        isRegex: !!payload.isRegex,
        isCaseSensitive: !!payload.isCaseSensitive,
        matchWholeWord: !!payload.matchWholeWord,
        scopeId: payload.scopeId ?? import_core2.DEFAULT_SCOPE
      };
      if (!options.pattern.trim()) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: "idle" });
        resultSync.clear();
        panel.postResults([], searchId);
        return;
      }
      if (options.isRegex) {
        const err2 = (0, import_core2.validateRegex)(options.pattern);
        if (err2) {
          setActiveSearch(false);
          panel.postSearchStatus({ searchId, state: "idle" });
          panel.postError(err2);
          return;
        }
      }
      setActiveSearch(true);
      panel.postSearchStatus({ searchId, state: "searching", phase: "listing" });
      const uris = await resolveFiles(payload.include, payload.exclude);
      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        return;
      }
      const fileTotal = uris.length;
      const files = [];
      for (let i2 = 0; i2 < uris.length; i2++) {
        if (searchId !== latestSearchId || searchId <= stopSearchId) {
          setActiveSearch(false);
          panel.postSearchStatus({ searchId, state: "stopped" });
          return;
        }
        const uri = uris[i2];
        panel.postSearchStatus({
          searchId,
          state: "searching",
          phase: "reading",
          currentFile: path3.basename(uri.fsPath),
          fileIndex: i2 + 1,
          fileTotal
        });
        const file = await tryReadFile(uri);
        if (file) {
          files.push(file);
        }
      }
      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: "stopped" });
        return;
      }
      const results = await (0, import_core2.runScopedSearch)(
        extractor,
        files,
        options,
        (progress) => {
          if (searchId !== latestSearchId || searchId <= stopSearchId) {
            return;
          }
          panel.postSearchStatus({
            searchId,
            state: "searching",
            phase: "searching",
            currentFile: path3.basename(progress.filePath),
            fileIndex: progress.fileIndex,
            fileTotal: progress.fileTotal,
            matchCount: progress.matchCount
          });
        },
        () => searchId !== latestSearchId || searchId <= stopSearchId
      );
      if (searchId !== latestSearchId || searchId <= stopSearchId) {
        setActiveSearch(false);
        panel.postSearchStatus({ searchId, state: "stopped" });
        return;
      }
      setActiveSearch(false);
      const langByPath = languageByPathFromFiles(files, results);
      resultSync.setFromSearch(results, options, searchId, fileTotal, langByPath);
      panel.postResults(results, searchId, false, langByPath);
      panel.postSearchStatus({
        searchId,
        state: "complete",
        matchCount: results.length,
        fileCount: countResultFiles2(results),
        fileTotal
      });
    } catch (err2) {
      if (searchId !== latestSearchId) {
        return;
      }
      setActiveSearch(false);
      console.warn("[scope-search] search failed:", err2);
      resultSync.clear();
      panel.postResults([], searchId);
      panel.postSearchStatus({ searchId, state: "complete", matchCount: 0, fileCount: 0 });
    }
  };
  const replaceAllInFile = async (payload) => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err2 = (0, import_core2.validateRegex)(options.pattern);
      if (err2) {
        panel.postError(err2);
        return;
      }
    }
    try {
      const { count, capture } = await applyFullFileReplace(
        extractor,
        payload.path,
        options,
        payload.replace,
        skipForFile(payload.skipMatches, payload.path)
      );
      if (count === 0) {
        return;
      }
      if (capture) {
        await recordReplaceHistory(
          replaceHistory,
          panel,
          `Replace All in File (${count} in ${path3.basename(payload.path)})`,
          [capture],
          payload
        );
      }
      const results = await resultSync.refreshFiles([payload.path]);
      await focusFirstMatchInNextFile(
        payload.path,
        resultSync.getFileOrder(),
        results,
        payload.skipMatches
      );
    } catch (err2) {
      console.warn("[scope-search] replace failed:", err2);
      panel.postError(err2 instanceof Error ? err2.message : String(err2));
    }
  };
  const replaceAll = async (payload) => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err2 = (0, import_core2.validateRegex)(options.pattern);
      if (err2) {
        panel.postError(err2);
        return;
      }
    }
    const paths = payload.paths ?? [];
    if (paths.length === 0) {
      return;
    }
    try {
      const captures = [];
      let total = 0;
      for (const filePath of paths) {
        const { count, capture } = await applyFullFileReplace(
          extractor,
          filePath,
          options,
          payload.replace,
          skipForFile(payload.skipMatches, filePath)
        );
        total += count;
        if (capture) {
          captures.push(capture);
        }
      }
      if (total === 0) {
        return;
      }
      const fileCount = captures.length;
      await recordReplaceHistory(
        replaceHistory,
        panel,
        fileCount === 1 ? `Replace All (${total} in ${path3.basename(captures[0].path)})` : `Replace All (${total} in ${fileCount} files)`,
        captures,
        payload
      );
      await resultSync.refreshFiles(captures.map((c) => c.path));
    } catch (err2) {
      console.warn("[scope-search] replace all failed:", err2);
      panel.postError(err2 instanceof Error ? err2.message : String(err2));
    }
  };
  const replaceOne = async (payload) => {
    const options = searchOptionsFromReplace(payload);
    if (!options.pattern.trim()) {
      return;
    }
    if (options.isRegex) {
      const err2 = (0, import_core2.validateRegex)(options.pattern);
      if (err2) {
        panel.postError(err2);
        return;
      }
    }
    if ((0, import_core2.isLikelyBinaryPath)(payload.path)) {
      return;
    }
    try {
      const uri = vscode6.Uri.file(payload.path);
      const existing = vscode6.workspace.textDocuments.find((d) => d.uri.fsPath === payload.path);
      const doc = existing ?? await vscode6.workspace.openTextDocument(uri);
      const synced = await resultSync.refreshFiles([payload.path]);
      const target = resolveReplaceTarget(
        visibleResultsAfterSkip(synced, payload.skipMatches),
        payload
      );
      if (!target) {
        panel.postError("Replace failed: match not found (results may be stale).");
        return;
      }
      const text = doc.getText();
      const spans = await extractor.extractSpans(payload.path, text, doc.languageId);
      const matchAt = {
        startLine: target.startLine,
        startCol: target.startCol,
        endLine: target.endLine,
        endCol: target.endCol
      };
      const start2 = doc.offsetAt(new vscode6.Position(matchAt.startLine, matchAt.startCol));
      const end = doc.offsetAt(new vscode6.Position(matchAt.endLine, matchAt.endCol));
      const preContent = text;
      const preVersion = doc.version;
      const { replacement, count } = (0, import_core2.replaceSingleMatch)(text, spans, {
        ...options,
        replacement: payload.replace
      }, matchAt);
      if (count === 0) {
        panel.postError("Replace failed: match not found at expected location.");
        return;
      }
      const applied = await applyTextEdits(doc, [{ start: start2, end, text: replacement }]);
      if (!applied) {
        panel.postError("Replace failed: could not apply edit.");
        return;
      }
      const updatedDoc = vscode6.workspace.textDocuments.find((d) => d.uri.fsPath === payload.path) ?? await vscode6.workspace.openTextDocument(uri);
      await recordReplaceHistory(
        replaceHistory,
        panel,
        `Replace 1 in ${path3.basename(payload.path)}`,
        [{
          path: payload.path,
          preContent,
          postContent: updatedDoc.getText(),
          preVersion,
          postVersion: updatedDoc.version
        }],
        payload
      );
      const results = await resultSync.refreshFiles([payload.path]);
      await focusAfterReplaceOne(
        payload.path,
        payload.replacedIndex,
        results,
        resultSync.getFileOrder(),
        payload.skipMatches
      );
    } catch (err2) {
      console.warn("[scope-search] replace one failed:", err2);
      panel.postError(err2 instanceof Error ? err2.message : String(err2));
    }
  };
  const undoLastReplace = async () => {
    const entry = replaceHistory.peek();
    if (!entry) {
      postHistoryState(panel, replaceHistory);
      return;
    }
    const mismatched = [];
    const docs = /* @__PURE__ */ new Map();
    for (const record of entry.files) {
      const uri = vscode6.Uri.file(record.path);
      const existing = vscode6.workspace.textDocuments.find((d) => d.uri.fsPath === record.path);
      const doc = existing ?? await vscode6.workspace.openTextDocument(uri);
      docs.set(record.path, doc);
      if (!fileHashMatches(record, doc.getText())) {
        mismatched.push(path3.basename(record.path));
      }
    }
    let force = false;
    if (mismatched.length > 0) {
      const list = mismatched.join(", ");
      const choice = await vscode6.window.showWarningMessage(
        `Cannot safely undo replace: ${list} ${mismatched.length === 1 ? "was" : "were"} modified after the replace. Use Force Undo to restore the pre-replace version anyway.`,
        "Force Undo",
        "Cancel"
      );
      if (choice !== "Force Undo") {
        return;
      }
      force = true;
      const confirm = await vscode6.window.showWarningMessage(
        `Force undo will overwrite the current content of ${entry.files.length} file(s) with the version from before the replace. This action may be irreversible.`,
        { modal: true },
        "Overwrite"
      );
      if (confirm !== "Overwrite") {
        return;
      }
    }
    try {
      await runWithoutResultWatchAsync(async () => {
        for (const record of entry.files) {
          const doc = docs.get(record.path);
          const ok = force ? await applyForceUndoToFile(replaceHistory, record, doc) : await applyStrictUndoToFile(replaceHistory, record, doc);
          if (!ok) {
            throw new Error(`Undo failed for ${record.path}`);
          }
        }
      });
      await replaceHistory.pop();
      postHistoryState(panel, replaceHistory);
      const results = await resultSync.refreshFiles(entry.files.map((f) => f.path));
      await focusAfterUndo(entry, results);
    } catch (err2) {
      console.warn("[scope-search] undo failed:", err2);
      panel.postError(err2 instanceof Error ? err2.message : String(err2));
    }
  };
  panel.onMessage((msg) => {
    if (msg.type === "search") {
      void doSearch(msg);
    } else if (msg.type === "replaceAllInFile") {
      void replaceAllInFile(msg);
    } else if (msg.type === "replaceAll") {
      void replaceAll(msg);
    } else if (msg.type === "replaceOne") {
      void replaceOne(msg);
    } else if (msg.type === "undoLastReplace") {
      void undoLastReplace();
    } else if (msg.type === "saveState") {
      void savePanelState(msg.state);
    } else if (msg.type === "ready") {
      panel.postRestoreState(loadPanelState());
      postHistoryState(panel, replaceHistory);
      updateScopes({
        include: loadPanelState().include,
        exclude: loadPanelState().exclude
      });
    } else if (msg.type === "updateScope") {
      updateScopes(msg);
    }
  });
  panel.onViewReady = () => {
    panel.postRestoreState(loadPanelState());
    postHistoryState(panel, replaceHistory);
  };
  context.subscriptions.push(
    vscode6.window.registerWebviewViewProvider("scopeSearch.panel", panel, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode6.workspace.onDidChangeWorkspaceFolders(() => {
      void updateScopes({
        include: loadPanelState().include,
        exclude: loadPanelState().exclude
      });
    }),
    vscode6.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("search.exclude") || e.affectsConfiguration("files.exclude")) {
        void updateScopes({
          include: loadPanelState().include,
          exclude: loadPanelState().exclude
        });
      }
    })
  );
  context.subscriptions.push(
    vscode6.commands.registerCommand("scopeSearch.run", async () => {
      await vscode6.commands.executeCommand("scopeSearch.panel.focus");
      panel.focusQuery();
    }),
    vscode6.commands.registerCommand("scopeSearch.focus", async () => {
      await vscode6.commands.executeCommand("scopeSearch.panel.focus");
    }),
    vscode6.commands.registerCommand("scopeSearch.stop", () => {
      stopSearchId = latestSearchId;
      latestSearchId += 1;
      setActiveSearch(false);
      panel.requestStop();
    }),
    vscode6.commands.registerCommand("scopeSearch.refresh", () => {
      panel.requestRefresh();
    }),
    vscode6.commands.registerCommand("scopeSearch.clear", () => {
      stopSearchId = latestSearchId;
      latestSearchId += 1;
      setActiveSearch(false);
      panel.requestClear();
    })
  );
}
function deactivate() {
  setSearchingContext(false);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
/*! Bundled license information:

is-extglob/index.js:
  (*!
   * is-extglob <https://github.com/jonschlinkert/is-extglob>
   *
   * Copyright (c) 2014-2016, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

is-glob/index.js:
  (*!
   * is-glob <https://github.com/jonschlinkert/is-glob>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-number/index.js:
  (*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

to-regex-range/index.js:
  (*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

fill-range/index.js:
  (*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

queue-microtask/index.js:
  (*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

run-parallel/index.js:
  (*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=extension.js.map

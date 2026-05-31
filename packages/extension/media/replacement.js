"use strict";
var ScopeSearchReplacement = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../core/src/replacement.ts
  var replacement_exports = {};
  __export(replacement_exports, {
    applyReplacementTemplate: () => applyReplacementTemplate,
    resolveMatchReplacement: () => resolveMatchReplacement
  });
  function applyReplacementTemplate(replacement, match, context) {
    return replacement.replace(/\$(?:\$|&|`|'|(\d+)|<([^>]+)>)/g, (token, index, name) => {
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
      if (name !== void 0) {
        return match.groups?.[name] ?? token;
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
  function execMatchAt(pattern, flags, context, at, length) {
    const re = new RegExp(pattern, flags);
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
    const flags = options.isCaseSensitive ? "u" : "ui";
    const ctx = context ?? matchedText;
    const at = matchStartInContext ?? (context ? context.indexOf(matchedText) : 0);
    if (at < 0) {
      return replacement;
    }
    let match = execMatchAt(options.pattern, flags, ctx, at, matchedText.length);
    if (!match && context === void 0) {
      const re = new RegExp(options.pattern, flags);
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
  return __toCommonJS(replacement_exports);
})();

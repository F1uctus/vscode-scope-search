"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripJsonComments = stripJsonComments;
exports.parseLanguageConfiguration = parseLanguageConfiguration;
exports.commentRulesFromConfiguration = commentRulesFromConfiguration;
exports.mergeCommentRules = mergeCommentRules;
const fs = __importStar(require("node:fs"));
/** Strip line and block comments from JSONC (language-configuration.json). */
function stripJsonComments(text) {
    let out = '';
    let i = 0;
    while (i < text.length) {
        const ch = text[i];
        const next = text[i + 1];
        if (ch === '"') {
            out += ch;
            i++;
            while (i < text.length) {
                const c = text[i];
                out += c;
                i++;
                if (c === '\\' && i < text.length) {
                    out += text[i];
                    i++;
                    continue;
                }
                if (c === '"') {
                    break;
                }
            }
            continue;
        }
        if (ch === '/' && next === '/') {
            i += 2;
            while (i < text.length && text[i] !== '\n') {
                i++;
            }
            continue;
        }
        if (ch === '/' && next === '*') {
            i += 2;
            while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '/')) {
                i++;
            }
            i += 2;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}
function parseLanguageConfiguration(configPath) {
    if (!fs.existsSync(configPath)) {
        return undefined;
    }
    try {
        const rawText = stripJsonComments(fs.readFileSync(configPath, 'utf8'));
        const raw = JSON.parse(rawText);
        return commentRulesFromConfiguration(raw);
    }
    catch {
        return undefined;
    }
}
function commentRulesFromConfiguration(raw) {
    const comments = raw.comments;
    if (!comments) {
        return undefined;
    }
    const rules = {};
    if (typeof comments.lineComment === 'string') {
        rules.lineComment = comments.lineComment;
    }
    else if (comments.lineComment && typeof comments.lineComment === 'object') {
        rules.lineComment = comments.lineComment.start;
        if (comments.lineComment.end) {
            rules.lineCommentEnd = comments.lineComment.end;
        }
    }
    if (Array.isArray(comments.blockComment) && comments.blockComment.length === 2) {
        rules.blockComment = [comments.blockComment[0], comments.blockComment[1]];
    }
    if (!rules.lineComment && !rules.blockComment) {
        return undefined;
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
//# sourceMappingURL=language-config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCommentSpansFromLanguageConfig = extractCommentSpansFromLanguageConfig;
exports.extractCommentSpansFallback = extractCommentSpansFallback;
exports.hasCommentSpans = hasCommentSpans;
const files_1 = require("../files");
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
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function extractBlockComments(text, open, close) {
    const spans = [];
    const pattern = new RegExp(`${escapeRegexLiteral(open)}[\\s\\S]*?${escapeRegexLiteral(close)}`, 'g');
    let m;
    while ((m = pattern.exec(text)) !== null) {
        spans.push({
            start: m.index,
            end: m.index + m[0].length,
            category: 'comment',
            source: 'textmate',
        });
    }
    return spans;
}
function extractLineComments(text, lineComment, lineCommentEnd) {
    const spans = [];
    const lines = text.split('\n');
    let offset = 0;
    for (const line of lines) {
        const trimmed = line.trimStart();
        const lead = line.length - trimmed.length;
        if (trimmed.startsWith(lineComment)) {
            const end = lineCommentEnd
                ? findLineCommentEnd(line, lead + lineComment.length, lineCommentEnd)
                : line.length;
            spans.push({
                start: offset + lead,
                end: offset + end,
                category: 'comment',
                source: 'textmate',
            });
        }
        else {
            const idx = line.indexOf(lineComment);
            if (idx !== -1) {
                const before = line.slice(0, idx);
                if (!isInsideString(before)) {
                    const start = idx;
                    const end = lineCommentEnd
                        ? findLineCommentEnd(line, idx + lineComment.length, lineCommentEnd)
                        : line.length;
                    spans.push({
                        start: offset + start,
                        end: offset + end,
                        category: 'comment',
                        source: 'textmate',
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
    for (let i = 0; i < before.length; i++) {
        const ch = before[i];
        if (ch === "'" && before[i - 1] !== '\\') {
            singles++;
        }
        if (ch === '"' && before[i - 1] !== '\\') {
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
    const out = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const cur = sorted[i];
        const last = out[out.length - 1];
        if (cur.start <= last.end && cur.category === last.category) {
            last.end = Math.max(last.end, cur.end);
        }
        else {
            out.push({ ...cur });
        }
    }
    return out;
}
function commentRulesForLanguage(languageId, commentRules) {
    if (!commentRules) {
        return undefined;
    }
    for (const id of (0, files_1.relatedLanguageIds)(languageId)) {
        const rules = commentRules.get(id);
        if (rules) {
            return rules;
        }
    }
    return undefined;
}
function extractCommentSpansFallback(text, languageId, commentRules) {
    return extractCommentSpansFromLanguageConfig(text, commentRulesForLanguage(languageId, commentRules));
}
function hasCommentSpans(spans) {
    return spans.some((s) => s.category === 'comment');
}
//# sourceMappingURL=fallback.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOPE_LABELS = exports.DEFAULT_SCOPE = void 0;
exports.matchKey = matchKey;
exports.matchPositionsEqual = matchPositionsEqual;
exports.scopeLabel = scopeLabel;
function matchKey(match) {
    return `${match.path}:${match.startLine}:${match.startCol}:${match.endLine}:${match.endCol}`;
}
function matchPositionsEqual(a, b) {
    return a.startLine === b.startLine
        && a.startCol === b.startCol
        && a.endLine === b.endLine
        && a.endCol === b.endCol;
}
exports.DEFAULT_SCOPE = 'comment';
exports.SCOPE_LABELS = {
    comment: 'Comments',
    string: 'Strings',
    keyword: 'Keywords',
    type: 'Types',
    variable: 'Variables',
    constant: 'Constants',
    number: 'Numbers',
    operator: 'Operators',
    punctuation: 'Punctuation',
    meta: 'Meta',
};
function scopeLabel(id) {
    return exports.SCOPE_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}
//# sourceMappingURL=types.js.map
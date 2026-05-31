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
exports.isLikelyBinaryPath = isLikelyBinaryPath;
exports.looksLikeBinaryBuffer = looksLikeBinaryBuffer;
exports.filterTextPaths = filterTextPaths;
const path = __importStar(require("node:path"));
const BINARY_EXTENSIONS = new Set([
    '.3gp', '.7z', '.aac', '.aiff', '.avi', '.bmp', '.bz2', '.class', '.com', '.dat', '.db', '.deb',
    '.djvu', '.dll', '.dmg', '.doc', '.docx', '.dylib', '.exe', '.flac', '.flv', '.gif', '.gz',
    '.heic', '.heif', '.ico', '.iso', '.jar', '.jpeg', '.jpg', '.lz', '.lz4', '.m4a', '.mkv',
    '.mov', '.mp3', '.mp4', '.mpeg', '.mpg', '.msi', '.o', '.odp', '.ods', '.odt', '.ogg', '.opus',
    '.pdf', '.png', '.ppt', '.pptx', '.pyc', '.pyo', '.rar', '.rpm', '.so', '.sqlite', '.sqlite3',
    '.svgz', '.tar', '.tgz', '.tif', '.tiff', '.ttf', '.vo', '.vok', '.vos', '.glob', '.aux',
    '.wasm', '.wav', '.webm', '.webp', '.woff', '.woff2', '.xls', '.xlsx', '.xz', '.zip', '.zst',
]);
function isLikelyBinaryPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
}
function looksLikeBinaryBuffer(buf) {
    const n = Math.min(buf.length, 8192);
    for (let i = 0; i < n; i++) {
        if (buf[i] === 0) {
            return true;
        }
    }
    return false;
}
function filterTextPaths(paths) {
    return paths.filter((p) => !isLikelyBinaryPath(p));
}
//# sourceMappingURL=binary.js.map
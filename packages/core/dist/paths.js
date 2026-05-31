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
exports.findModuleRoot = findModuleRoot;
exports.resolveFromModuleRoot = resolveFromModuleRoot;
exports.treeSitterWasmsDir = treeSitterWasmsDir;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function findModuleRoot(startDir) {
    let dir = path.resolve(startDir);
    const vendor = path.join(dir, 'vendor');
    if (fs.existsSync(vendor)) {
        return vendor;
    }
    while (true) {
        const nm = path.join(dir, 'node_modules');
        if (fs.existsSync(nm)) {
            return nm;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return undefined;
        }
        dir = parent;
    }
}
function resolveFromModuleRoot(moduleRoot, pkgPath) {
    if (moduleRoot) {
        const candidate = path.join(moduleRoot, pkgPath);
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return require.resolve(pkgPath);
}
function treeSitterWasmsDir(moduleRoot) {
    if (moduleRoot) {
        const candidate = path.join(moduleRoot, 'tree-sitter-wasms');
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return path.dirname(require.resolve('tree-sitter-wasms/package.json'));
}
//# sourceMappingURL=paths.js.map
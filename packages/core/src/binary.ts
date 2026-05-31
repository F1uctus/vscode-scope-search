import * as path from 'node:path';

const BINARY_EXTENSIONS = new Set([
  '.3gp', '.7z', '.aac', '.aiff', '.avi', '.bmp', '.bz2', '.class', '.com', '.dat', '.db', '.deb',
  '.djvu', '.dll', '.dmg', '.doc', '.docx', '.dylib', '.exe', '.flac', '.flv', '.gif', '.gz',
  '.heic', '.heif', '.ico', '.iso', '.jar', '.jpeg', '.jpg', '.lz', '.lz4', '.m4a', '.mkv',
  '.mov', '.mp3', '.mp4', '.mpeg', '.mpg', '.msi', '.o', '.odp', '.ods', '.odt', '.ogg', '.opus',
  '.pdf', '.png', '.ppt', '.pptx', '.pyc', '.pyo', '.rar', '.rpm', '.so', '.sqlite', '.sqlite3',
  '.svgz', '.tar', '.tgz', '.tif', '.tiff', '.ttf', '.vo', '.vok', '.vos', '.glob', '.aux',
  '.wasm', '.wav', '.webm', '.webp', '.woff', '.woff2', '.xls', '.xlsx', '.xz', '.zip', '.zst',
]);

export function isLikelyBinaryPath(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

export function looksLikeBinaryBuffer(buf: Uint8Array | Buffer): boolean {
  const n = Math.min(buf.length, 8192);
  for (let i = 0; i < n; i++) {
    if (buf[i] === 0) {
      return true;
    }
  }
  return false;
}

export function filterTextPaths(paths: string[]): string[] {
  return paths.filter((p) => !isLikelyBinaryPath(p));
}

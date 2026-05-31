import * as crypto from 'node:crypto';
import * as path from 'node:path';
import { createTwoFilesPatch, applyPatch } from 'diff';

export function contentHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function createReversePatch(postContent: string, preContent: string, filePath: string): string {
  return createTwoFilesPatch(
    `${path.basename(filePath)} (post)`,
    `${path.basename(filePath)} (pre)`,
    postContent,
    preContent,
    '',
    '',
    { context: 3 },
  );
}

export function applyReversePatch(currentContent: string, patch: string): string | undefined {
  const result = applyPatch(currentContent, patch, { fuzz: 0 });
  if (result === false) {
    return undefined;
  }
  return result;
}

export function sanitizeFileId(filePath: string): string {
  return crypto.createHash('sha256').update(filePath).digest('hex').slice(0, 16);
}

import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Monorepo root (clarity-v2), whether Next runs from `apps/docs` or repo root. */
export function getRepoRoot() {
  const cwd = process.cwd();
  if (cwd.endsWith(`${path.sep}apps${path.sep}docs`)) {
    return path.resolve(cwd, '../..');
  }
  return cwd;
}

/** Read a markdown file relative to the monorepo root (e.g. `packages/components/COMPONENTS.md`). */
export async function readRepoMarkdown(repoRelativePath: string) {
  const filePath = path.join(getRepoRoot(), repoRelativePath);
  return readFile(filePath, 'utf8');
}

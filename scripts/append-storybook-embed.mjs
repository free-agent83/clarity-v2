#!/usr/bin/env node
// One-shot script. Appends a "## Live component" section to every COMPONENT.md
// that doesn't already have one, with a <StorybookEmbed> pointing at the
// matching default story.
//
// Storybook story IDs are derived from the `title:` field of the colocated
// `*.stories.tsx` file (Storybook's standard ID algorithm: lowercase, replace
// non-alphanum with '-', collapse, trim, then append '--default').
//
// Example: title 'Actions/Button' → id 'actions-button--default'.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const BASE = path.join(ROOT, 'packages/components/src/components');
const MARKER = '## Live component';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

// Storybook's slugify (matches @storybook/csf toId): lowercase, non-alphanum → '-', trim.
function toStoryId(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '--default'
  );
}

// Extract the meta `title:` string from a stories file. Handle:
//   title: 'Actions/Button'    ← single quotes
//   title: "Actions/Button"    ← double quotes
//   title: `Actions/Button`    ← backticks
// Ignore type annotations like `title: string` (no quotes).
function extractTitle(src) {
  const m = src.match(/title:\s*['"`]([^'"`]+)['"`]/);
  return m ? m[1] : null;
}

const componentMds = [];
const storyFiles = new Map(); // dir → first stories file found

for await (const abs of walk(BASE)) {
  const base = path.basename(abs);
  if (base === 'COMPONENT.md') componentMds.push(abs);
  if (/\.stories\.tsx?$/.test(base)) {
    const dir = path.dirname(abs);
    if (!storyFiles.has(dir)) storyFiles.set(dir, abs);
  }
}

let touched = 0;
const missingStories = [];
const missingTitles = [];

for (const mdPath of componentMds) {
  const dir = path.dirname(mdPath);
  const md = await readFile(mdPath, 'utf8');
  if (md.includes(MARKER)) continue;

  const storyFile = storyFiles.get(dir);
  if (!storyFile) {
    missingStories.push(path.relative(ROOT, mdPath));
    continue;
  }
  const src = await readFile(storyFile, 'utf8');
  const title = extractTitle(src);
  if (!title) {
    missingTitles.push(path.relative(ROOT, storyFile));
    continue;
  }

  const storyId = toStoryId(title);
  const block = `\n## Live component\n\n<StorybookEmbed story="${storyId}" />\n`;
  await writeFile(mdPath, md.trimEnd() + '\n' + block);
  touched += 1;
  console.log(`embed appended: ${path.relative(ROOT, mdPath)} → ${storyId}  (title: '${title}')`);
}

console.log(`\nDone. ${touched} files updated, ${componentMds.length - touched - missingStories.length - missingTitles.length} already had a Live component section.`);
if (missingStories.length) {
  console.log(`\nSkipped (no stories file in same dir): ${missingStories.length}`);
  for (const p of missingStories) console.log(`  ${p}`);
}
if (missingTitles.length) {
  console.log(`\nSkipped (stories file has no extractable title): ${missingTitles.length}`);
  for (const p of missingTitles) console.log(`  ${p}`);
}

# Clarity by Nivoda — public docs launch: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Clarity as a public-facing design system site at `clarity.nivoda.com` with a publicly accessible Storybook at `storybook.clarity.nivoda.com`, positioned as a case study in agentic / AI-first design systems.

**Architecture:** Two Vercel projects from the same monorepo: `apps/docs/` (Fumadocs/Next.js) at the apex URL, `packages/components/` (Storybook static build) at the storybook subdomain. Component pages already exist as colocated `COMPONENT.md` files — work is enrichment, not creation. Principles section added as a new top-level IA entry; Resources section removed.

**Tech Stack:** Next.js 16 + Fumadocs UI 16 + MDX, Storybook (existing setup), Tailwind v4, Nx, Vercel.

**Spec:** [`docs/plans/specs/2026-05-25-public-docs-launch-design.md`](specs/2026-05-25-public-docs-launch-design.md)

**Working branch:** `feat/docs-fumadocs` (worktree at `.claude/worktrees/fumadocs/`). All work happens on this branch and is merged into `dev` at the end.

---

## File map

| Path | Action | Responsibility |
|---|---|---|
| `apps/docs/lib/source.ts` | Modify | IA section ordering: add `principles`, remove `resources` |
| `apps/docs/content/resources/*` | Delete | Remove 6 MDX files + meta.json |
| `apps/docs/content/principles/index.mdx` | Create | Elevator pitch — the case study positioning |
| `apps/docs/content/principles/code-first.mdx` | Create | Design lives in code, no separate source of truth |
| `apps/docs/content/principles/two-delivery-paths.mdx` | Create | Engineering self-service + design/PM self-service |
| `apps/docs/content/principles/built-for-agents.mdx` | Create | COMPONENT.md everywhere, repo-as-interface |
| `apps/docs/content/principles/meta.json` | Create | Section ordering |
| `apps/docs/app/(home)/page.tsx` | Modify | Rewrite landing for agentic positioning |
| `apps/docs/components/storybook-embed.tsx` | Create | `<StorybookEmbed story="..." />` iframe wrapper |
| `apps/docs/components/gap.tsx` | Create | `<Gap>` visual marker for placeholder content |
| `apps/docs/components/mdx.tsx` | Modify | Register `StorybookEmbed` and `Gap` for MDX |
| `apps/docs/lib/env.ts` | Create | `NEXT_PUBLIC_STORYBOOK_URL` resolver with sensible default |
| `apps/docs/.env.example` | Create | Document the env var |
| `scripts/append-storybook-embed.mjs` | Create | One-shot script to add `<StorybookEmbed>` block to each COMPONENT.md |
| `packages/components/src/components/**/COMPONENT.md` | Modify (×62) | Storybook embed appended; Gap applied where guidance is thin |
| `apps/docs/content/{brand,content,foundations,patterns}/<stub>.mdx` | Modify | Apply `<Gap>` marker where content is placeholder |
| `packages/components/vercel.json` | Create | Vercel build config for static Storybook |
| `packages/components/project.json` | Modify | Add `storybook-build` target (if missing) |
| `apps/docs/vercel.json` | Modify (if needed) | Confirm docs Vercel config |

---

## Phase 0 — Branch sync

### Task 0.1: Fast-forward local dev to origin/dev

**Files:** none (git plumbing)

- [ ] Verify clean working tree

Run: `git status`
Expected: `nothing to commit, working tree clean` on branch `dev`.

- [ ] Fast-forward dev

Run: `git pull --ff-only origin dev`
Expected: 6 commits pulled (test-app product image relocation + category images).

### Task 0.2: Update feat/docs-fumadocs with latest dev

**Files:** none (git plumbing in the fumadocs worktree)

- [ ] Switch to the fumadocs worktree

Run: `cd /Users/nivodatest/Documents/PROJECTS/nivoda/repos/clarity-v2/.claude/worktrees/fumadocs`
Expected: pwd matches the worktree path; `git status` shows `On branch feat/docs-fumadocs`.

- [ ] Merge dev into feat/docs-fumadocs (preserve history; do not rebase to avoid rewriting 19 published commits)

Run: `git merge dev --no-edit`
Expected: clean merge, or trivial conflicts in test-app paths that we accept "incoming" (test-app changes don't intersect with docs work).

- [ ] Smoke-test the build

Run: `cd apps/docs && npm run dev`
Expected: Next.js dev server starts on a port, no fatal MDX or compile errors. Stop the dev server when satisfied.

- [ ] Commit any conflict resolutions

Run: `git status`
If there are conflict resolutions to commit, commit them with message: `merge: dev into feat/docs-fumadocs to pick up megamenu + tailwind source fix + test-app images`

---

## Phase 1 — IA changes (Principles in, Resources out)

### Task 1.1: Remove the Resources section

**Files:**
- Delete: `apps/docs/content/resources/` (entire folder — 6 MDX files + any meta.json)

- [ ] Delete the resources content folder

Run: `rm -rf apps/docs/content/resources`
Expected: folder removed.

- [ ] Verify the docs site still builds

Run: `cd apps/docs && npm run build`
Expected: build succeeds. Any links from elsewhere pointing into `/docs/resources/*` will appear as warnings — capture them for follow-up but don't block on them.

- [ ] Commit

```
git add apps/docs/content/resources apps/docs/content
git commit -m "feat(docs): remove Resources section ahead of public launch

Resources (architecture, ADRs, changelog, contributing, roadmap, vision)
are internal artefacts. They are removed from the public-facing IA per
the public docs launch spec."
```

### Task 1.2: Add Principles to the IA section list

**Files:**
- Modify: `apps/docs/lib/source.ts`

- [ ] Update `IA_SECTIONS` set: add `'principles'`, remove `'resources'`

Edit the `IA_SECTIONS` Set declaration to:
```ts
const IA_SECTIONS = new Set([
  'get-started',
  'principles',
  'foundations',
  'patterns',
  'content',
  'brand',
]);
```

- [ ] Update `IA_SECTION_ORDER`: add `'principles'` after `'get-started'`, remove `'resources'`

```ts
const IA_SECTION_ORDER = [
  'get-started',
  'principles',
  'foundations',
  'patterns',
  'content',
  'brand',
];
```

- [ ] Update `IA_SECTION_LABELS`: add `principles: 'Principles'`, remove `resources`

```ts
const IA_SECTION_LABELS: Record<string, string> = {
  'get-started': 'Get started',
  principles: 'Principles',
  foundations: 'Foundations',
  patterns: 'Patterns',
  content: 'Content',
  brand: 'Brand',
};
```

- [ ] Add child ordering for Principles so pages appear in narrative order (not alphabetical)

```ts
const IA_SECTION_CHILD_ORDER: Record<string, string[]> = {
  brand: [
    'direction', 'logo', 'colour', 'typography',
    'photography', 'iconography', 'application-rules', 'illustration',
  ],
  principles: [
    'code-first',
    'two-delivery-paths',
    'built-for-agents',
  ],
};
```

- [ ] Verify the build still compiles

Run: `cd apps/docs && npm run build`
Expected: TypeScript clean, build succeeds. The sidebar will not yet render Principles entries because the MDX files do not exist — that is the next task.

### Task 1.3: Create the Principles MDX content

**Files:**
- Create: `apps/docs/content/principles/index.mdx`
- Create: `apps/docs/content/principles/code-first.mdx`
- Create: `apps/docs/content/principles/two-delivery-paths.mdx`
- Create: `apps/docs/content/principles/built-for-agents.mdx`

Each file follows the in-tree IA schema in `source.config.ts`:
```yaml
---
title: <Page title>
description: <One-line description shown in search and previews>
---
```

- [ ] Create `principles/index.mdx`

The elevator pitch. Lead with the positioning statement from the vision doc, rewritten for a public audience:

```mdx
---
title: Principles
description: Clarity is an agentic design system. Code-first, built to be consumed by AI agents and engineers writing code directly.
---

Clarity is an **agentic design system**.

Code-first. Built to be consumed by AI coding agents and by engineers writing code directly. The components ARE the design — there is no interpretation step where drift can happen, and therefore no iteration loop to catch it.

Whoever builds UI — an engineer writing code, a designer prompting an AI agent, a product manager prototyping a flow — produces design-correct output automatically.

Three ideas hold this together. Each has its own page.

- [**Code-first**](/docs/principles/code-first) — design lives in code. Tokens are W3C DTCG JSON. Components are real React. Documentation is markdown next to the code.
- [**Two delivery paths**](/docs/principles/two-delivery-paths) — engineering builds faster without design gates. Design and product self-serve with AI tools. Both paths use the same library.
- [**Built for agents**](/docs/principles/built-for-agents) — every component ships with a `COMPONENT.md` next to its source. The repo IS the interface for agents. No MCP server, no sync, no drift.
```

- [ ] Create `principles/code-first.mdx`

Plunder from `docs/architecture/architecture.md` (Guiding Principles, sections 17–24). Rewrite for a public audience — no internal-only language.

Key beats to cover:
- Tokens are W3C DTCG JSON, the canonical source for every visual decision
- Components are real React (shadcn/ui + Radix + Tailwind), not Figma layers
- Documentation is markdown colocated with the code (this very page is an example)
- One pipeline produces every output (CSS, Tailwind theme, Figma variables, React Native objects)
- There is no separate "design source of truth" that has to be kept in sync — the code IS the source

Aim for 250–400 words. Conversational, declarative, no marketing fluff.

- [ ] Create `principles/two-delivery-paths.mdx`

Plunder from the vision doc lines 24–47 (Two delivery paths, one library + Why this matters commercially). Rewrite for a public audience: drop the Nivoda-specific "design QA bottleneck" framing, keep the structural insight.

Key beats:
- Path 1: Engineers import from Clarity and ship without waiting for design review. The components are pre-approved at the source. Features are design-correct on the first pass.
- Path 2: Designers and PMs with AI tools build directly against the same library. Real working UI, not just mockups. Same components, same guarantees.
- Both paths compound: every consumer reinforces the value for the others.

Aim for 250–400 words.

- [ ] Create `principles/built-for-agents.mdx`

Plunder from `docs/architecture/architecture.md` sections 188–199 (AI Agent Consumption) and surrounding context.

Key beats:
- Every component in the library ships with a `COMPONENT.md` file colocated with its source code (e.g. `packages/components/src/components/atoms/button/COMPONENT.md`). Same file authored by humans, read by agents.
- The repo is the interface. Claude Code, Cursor, and anything else that reads files reads documentation in the same place they read code. No MCP server, no sync, no drift.
- Storybook stories are executable documentation: an agent can see live examples and prop signatures by reading the stories.
- Tokens are queryable JSON. The Nx project graph exposes the full system.
- This is why the design system can scale faster than the traditional design → engineering → design-QA loop allows.

Aim for 250–400 words.

- [ ] Verify all four pages render

Run: `cd apps/docs && npm run dev`
Open: `http://localhost:3000/docs/principles`, then each child page.
Expected: pages render, sidebar shows Principles section with three children in the order code-first / two-delivery-paths / built-for-agents, no MDX errors.

- [ ] Commit

```
git add apps/docs/content/principles apps/docs/lib/source.ts
git commit -m "feat(docs): add Principles section — the agentic design system case study

Replaces Resources in the IA. Four pages: index (elevator pitch),
code-first, two-delivery-paths, built-for-agents. Source material
plundered from vision.md and architecture.md and rewritten for a
public, forward-facing audience."
```

---

## Phase 2 — Landing page

### Task 2.1: Rewrite the home page with agentic positioning

**Files:**
- Modify: `apps/docs/app/(home)/page.tsx`

- [ ] Replace the existing landing copy with the agentic-first version

The current page leads with "Clarity V2 — Nivoda's design system". Replace with copy that leads with the agentic positioning. Keep the existing Tailwind utility classes and structural layout (centered hero, three-card grid below) but swap the content:

- H1: `Clarity by Nivoda` (smaller, calmer; the hook is below)
- Hero paragraph: lead with "An agentic design system." Then the supporting sentence: "Code-first. Built to be consumed by AI agents and engineers writing code directly. The components are the design."
- Three-card grid below maps to the three Principles pages:
  - **Code-first** — short paragraph; link → `/docs/principles/code-first`
  - **Two delivery paths** — short paragraph; link → `/docs/principles/two-delivery-paths`
  - **Built for agents** — short paragraph; link → `/docs/principles/built-for-agents`
- Two primary CTAs: `Get started` → `/docs/get-started` and `Browse components` → `/docs/components`. Keep these as-is.

Each card paragraph: 1–2 sentences max, ~20 words.

- [ ] Verify the landing page renders

Run: `cd apps/docs && npm run dev`
Open: `http://localhost:3000`
Expected: new copy renders, three cards link through to Principles pages, both primary CTAs work, no console errors, responsive layout intact at narrow widths.

- [ ] Commit

```
git add apps/docs/app/\(home\)/page.tsx
git commit -m "feat(docs): lead landing page with the agentic positioning

Front door now says 'Clarity by Nivoda — an agentic design system'
and routes visitors directly into the three Principles pages. Aligns
the home page with the case-study positioning of the site."
```

---

## Phase 3 — MDX custom components

### Task 3.1: Create the StorybookEmbed component

**Files:**
- Create: `apps/docs/components/storybook-embed.tsx`
- Create: `apps/docs/lib/env.ts`
- Create: `apps/docs/.env.example`

- [ ] Create the env resolver

`apps/docs/lib/env.ts`:
```ts
// Resolves the public Storybook URL with a sensible default for local development.
// In production, set NEXT_PUBLIC_STORYBOOK_URL to https://storybook.clarity.nivoda.com.
export const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? 'https://storybook.clarity.nivoda.com';
```

- [ ] Document the env var

`apps/docs/.env.example`:
```
# Public URL where the Storybook static build is hosted. Used by <StorybookEmbed>.
NEXT_PUBLIC_STORYBOOK_URL=https://storybook.clarity.nivoda.com
```

- [ ] Create the component

`apps/docs/components/storybook-embed.tsx`:
```tsx
import { STORYBOOK_URL } from '@/lib/env';

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "atoms-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Iframe height in px. Defaults to 480. */
  height?: number;
  /** Visible label below the iframe — defaults to "Live component". */
  label?: string;
}

export function StorybookEmbed({
  story,
  height = 480,
  label = 'Live component',
}: StorybookEmbedProps) {
  const src = `${STORYBOOK_URL}/iframe.html?id=${encodeURIComponent(story)}&viewMode=story`;
  return (
    <figure className="my-6 rounded-md border border-fd-border overflow-hidden">
      <iframe
        src={src}
        title={`Storybook: ${story}`}
        loading="lazy"
        height={height}
        className="w-full block bg-white"
      />
      <figcaption className="text-xs text-fd-muted-foreground px-3 py-2 border-t border-fd-border flex items-center justify-between">
        <span>{label}</span>
        <a
          href={`${STORYBOOK_URL}/?path=/story/${encodeURIComponent(story)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:no-underline"
        >
          Open in Storybook ↗
        </a>
      </figcaption>
    </figure>
  );
}
```

### Task 3.2: Create the Gap visual marker

**Files:**
- Create: `apps/docs/components/gap.tsx`

- [ ] Create the Gap component

`apps/docs/components/gap.tsx`:
```tsx
interface GapProps {
  /** One-line summary of what is missing. */
  children: React.ReactNode;
}

export function Gap({ children }: GapProps) {
  return (
    <aside
      className="my-6 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm flex gap-3"
      role="note"
      aria-label="Documentation gap"
    >
      <span className="font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 pt-0.5">
        Gap
      </span>
      <span className="text-fd-foreground/90">{children}</span>
    </aside>
  );
}
```

### Task 3.3: Register both components in the MDX provider

**Files:**
- Modify: `apps/docs/components/mdx.tsx`

- [ ] Register StorybookEmbed and Gap

Replace the body of `getMDXComponents`:
```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { StorybookEmbed } from './storybook-embed';
import { Gap } from './gap';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    StorybookEmbed,
    Gap,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
```

- [ ] Verify both render in any MDX page

Edit a throwaway page (e.g. `principles/index.mdx`) to add:
```mdx
<Gap>Smoke test — remove me.</Gap>

<StorybookEmbed story="atoms-button--default" />
```

Run: `cd apps/docs && npm run dev`
Expected: Gap renders as an amber callout. StorybookEmbed iframes the Button story (it will 404 against the placeholder URL until Storybook is deployed — that is expected at this stage; what matters is the iframe is in the DOM and pointing at the right URL).

Remove the smoke-test snippet before committing.

- [ ] Commit

```
git add apps/docs/components apps/docs/lib/env.ts apps/docs/.env.example
git commit -m "feat(docs): StorybookEmbed and Gap MDX components

StorybookEmbed iframes a story by ID from NEXT_PUBLIC_STORYBOOK_URL
(defaults to https://storybook.clarity.nivoda.com).

Gap renders an amber callout for placeholder content — used to keep
unfinished sections visible rather than hiding them."
```

---

## Phase 4 — Component pages

### Task 4.1: Audit COMPONENT.md coverage and Storybook story IDs

**Files:** none (read-only audit)

- [ ] Confirm all 62 components have COMPONENT.md

Run: `find packages/components/src/components -name "COMPONENT.md" | wc -l`
Expected: 62.

- [ ] List the 7 component dirs without COMPONENT.md to confirm they are intentionally excluded (templates, PLP / PDP kits, internals)

Run:
```bash
comm -23 \
  <(find packages/components/src/components -maxdepth 3 -mindepth 2 -type d | sort) \
  <(find packages/components/src/components -name "COMPONENT.md" -exec dirname {} \; | sort)
```
Expected: 7 directories. Inspect; if any look like they should have a COMPONENT.md, flag for follow-up (do not block this plan on filling them in).

- [ ] Identify the Storybook story ID convention

Run: `cat packages/components/.storybook/main.ts 2>/dev/null | head -30 && echo --- && find packages/components/src/components/atoms/button -name "*.stories.*"`
Expected: story ID for Button is something like `atoms-button--default` (Storybook auto-generates from the `title:` field in the stories file). Confirm by spotting a `title:` line in one stories file: `title: 'atoms/Button'` → ID prefix `atoms-button`.

The script in 4.2 must use the right ID format. Document it inline in the script.

### Task 4.2: Append a StorybookEmbed block to every COMPONENT.md

**Files:**
- Create: `scripts/append-storybook-embed.mjs` (at repo root)
- Modify: all 62 `packages/components/src/components/**/COMPONENT.md`

- [ ] Write the script

`scripts/append-storybook-embed.mjs`:
```js
#!/usr/bin/env node
// One-shot script. Appends a "## Live component" section to every COMPONENT.md
// that doesn't already have one, with a <StorybookEmbed> pointing at the
// matching default story.
//
// Storybook story IDs follow the convention:
//   title 'atoms/Button' + story 'Default' → id 'atoms-button--default'
//
// We derive the ID from the COMPONENT.md path: e.g.
//   packages/components/src/components/atoms/button/COMPONENT.md
//   → 'atoms-button--default'

import { readFile, writeFile } from 'node:fs/promises';
import { globby } from 'globby';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const files = await globby('packages/components/src/components/**/COMPONENT.md', {
  cwd: ROOT,
});

const MARKER = '## Live component';
let touched = 0;

for (const rel of files) {
  const abs = path.join(ROOT, rel);
  const md = await readFile(abs, 'utf8');
  if (md.includes(MARKER)) continue; // idempotent

  // packages/components/src/components/atoms/button/COMPONENT.md → ['atoms', 'button']
  const segments = rel.split('/').slice(4, -1);
  const storyId = `${segments.join('-')}--default`;

  const block = `\n## Live component\n\n<StorybookEmbed story="${storyId}" />\n`;
  await writeFile(abs, md.trimEnd() + '\n' + block);
  touched += 1;
  console.log(`embed appended: ${rel} → ${storyId}`);
}

console.log(`\nDone. ${touched} files updated, ${files.length - touched} already had a Live component section.`);
```

- [ ] Run the script

Run: `node scripts/append-storybook-embed.mjs`
Expected: ~62 files updated, then ~0 on a second run (idempotency check).

- [ ] Spot-check three components

Read: `packages/components/src/components/atoms/button/COMPONENT.md` — confirm the Live component block is at the end with `story="atoms-button--default"`.
Read: `packages/components/src/components/molecules/dialog/COMPONENT.md` — confirm `story="molecules-dialog--default"`.
Read: `packages/components/src/components/organisms/table/COMPONENT.md` — confirm `story="organisms-table--default"`.

- [ ] Verify the docs build still passes

Run: `cd apps/docs && npm run build`
Expected: build succeeds. Component pages render with the Live component section.

- [ ] Commit

```
git add scripts/append-storybook-embed.mjs packages/components/src/components
git commit -m "feat(docs): wire Storybook embeds into every component page

Adds a 'Live component' section to all 62 COMPONENT.md files with a
<StorybookEmbed> pointing at the matching default story. Idempotent
script at scripts/append-storybook-embed.mjs."
```

### Task 4.3: Confirm wrong story IDs surface visibly

**Files:** none

- [ ] Identify any component whose stories file doesn't have a `Default` export

Run:
```bash
for f in $(find packages/components/src/components -name "*.stories.tsx"); do
  if ! grep -q "export const Default" "$f"; then
    echo "no Default export: $f"
  fi
done
```
Expected: ideally empty. Any component without a `Default` export will render an empty Storybook iframe at runtime. If the list is non-empty:
- Either update the story file to export `Default` (preferred — touches the component package, not the docs), or
- Edit the relevant COMPONENT.md's `<StorybookEmbed>` block to point at a story that does exist.

This isn't a blocker for the launch — it's a polish step. Note any deferred items in a follow-up TODO comment in `scripts/append-storybook-embed.mjs`.

---

## Phase 5 — Apply Gap markers to stub pages

### Task 5.1: Mark the 8 known stub MDX pages with Gap callouts

**Files:**
- Modify: `apps/docs/content/brand/illustration.mdx`
- Modify: `apps/docs/content/content/terminology.mdx`
- Modify: `apps/docs/content/content/voice-and-tone.mdx`
- Modify: `apps/docs/content/content/writing-for-ui.mdx`
- Modify: `apps/docs/content/foundations/motion.mdx`
- Modify: `apps/docs/content/patterns/empty-states.mdx`
- Modify: `apps/docs/content/patterns/filter-composition.mdx`
- Modify: `apps/docs/content/patterns/loading-states.mdx`

- [ ] For each of the 8 stub pages above, insert a `<Gap>` callout immediately under the page intro

Read the existing content; preserve whatever placeholder copy is there. Add a `<Gap>` block right after the H1 (Fumadocs uses the frontmatter title — first paragraph counts as the lead) describing what is missing:

Example for `content/voice-and-tone.mdx`:
```mdx
<Gap>Voice & tone patterns and examples are not yet written. The principles are described below — concrete patterns and worked examples are coming.</Gap>
```

Use a single sentence per Gap, plain language, no hedging. The point is honesty: tell the reader exactly what isn't here.

- [ ] Verify all 8 pages render the Gap correctly

Run: `cd apps/docs && npm run dev`
Open each stub URL. Expected: amber Gap callout shows near the top of each.

- [ ] Commit

```
git add apps/docs/content
git commit -m "feat(docs): apply Gap markers to known stub pages

Eight pages launch publicly with placeholder content (illustration,
voice-and-tone, writing-for-ui, terminology, motion, empty-states,
filter-composition, loading-states). Each now opens with a Gap
callout naming exactly what's missing — gaps stay visible rather
than hidden behind 'coming soon'."
```

### Task 5.2: Apply Gap markers to under-documented component pages

**Files:**
- Modify: a subset of `packages/components/src/components/**/COMPONENT.md` (only those with thin guidance)

- [ ] Identify COMPONENT.md files that lack a substantive "Usage guidelines" section

Run:
```bash
for f in $(find packages/components/src/components -name "COMPONENT.md"); do
  if ! grep -q "## Usage guidelines\|## Best practices\|## When to use" "$f"; then
    echo "thin: $f"
  fi
done
```

- [ ] For each thin file, add a `<Gap>` callout above the H1 body (after frontmatter)

Example:
```mdx
<Gap>Usage guidance for this component is light — props and the live demo are accurate; written guidance is forthcoming.</Gap>
```

- [ ] Commit

```
git add packages/components/src/components
git commit -m "feat(docs): apply Gap markers to thin component pages

Components whose COMPONENT.md doesn't yet have usage guidance now open
with a Gap marker. Props and live demo continue to work; the marker
makes it visible that prose guidance is forthcoming."
```

---

## Phase 6 — Storybook deployment prep

### Task 6.1: Confirm Storybook produces a static build

**Files:** depends on what's already there.

- [ ] Identify how Storybook builds today

Run: `cat packages/components/package.json | grep -i 'storybook'`
Expected: scripts include `"storybook"` (dev) and `"build-storybook"` (static build) per the standard Storybook setup. If `build-storybook` is missing, add it.

- [ ] Produce a local static build and inspect the output

Run: `cd packages/components && npm run build-storybook`
Expected: a `storybook-static/` (or similar) directory is created with `index.html`, `iframe.html`, assets/, etc. Note the exact directory name — required for `vercel.json` in the next task.

### Task 6.2: Configure Vercel for the Storybook deployment

**Files:**
- Create: `packages/components/vercel.json`

- [ ] Write the Vercel config

`packages/components/vercel.json`:
```json
{
  "buildCommand": "cd ../.. && npx nx build-storybook components",
  "outputDirectory": "storybook-static",
  "installCommand": "cd ../.. && npm install",
  "framework": null
}
```

If `nx build-storybook components` isn't a wired-up target, fall back to the package-local script:
```json
{
  "buildCommand": "npm run build-storybook",
  "outputDirectory": "storybook-static",
  "installCommand": "cd ../.. && npm install",
  "framework": null
}
```

Pick whichever the previous task confirms works.

- [ ] Verify Storybook static output renders locally

Run: `cd packages/components && npx serve storybook-static -l 6007`
Open: `http://localhost:6007`
Expected: Storybook UI loads. Click into the Button atom. Then open `http://localhost:6007/iframe.html?id=atoms-button--default` directly to confirm the iframe URL format that StorybookEmbed produces.

- [ ] Commit

```
git add packages/components/vercel.json packages/components/package.json
git commit -m "chore(components): Vercel build config for public Storybook deploy

Storybook will deploy to storybook.clarity.nivoda.com as its own Vercel
project. Build command produces the static output that <StorybookEmbed>
iframes from the docs site."
```

### Task 6.3: Cross-origin / iframe headers

**Files:**
- Modify: `packages/components/.storybook/manager-head.html` or `preview-head.html` if applicable

- [ ] Confirm Storybook's default headers allow iframe embedding from `clarity.nivoda.com`

Storybook's default static build does not set `X-Frame-Options: DENY` or a restrictive `Content-Security-Policy`, so iframe embedding from another origin works out of the box. Verify:

Run: `curl -sI http://localhost:6007/iframe.html | grep -iE 'x-frame|content-security'`
Expected: no `X-Frame-Options` header and no `frame-ancestors` directive. If anything restrictive shows up, add a `vercel.json` rewrite or a `headers` block to permit `frame-ancestors clarity.nivoda.com` — but only if needed.

---

## Phase 7 — Vercel projects + domains (manual)

This phase is the only one requiring human/Vercel-dashboard work. Document the steps so Chris can run them — the worktree can't do them.

### Task 7.1: Create the docs Vercel project

- [ ] In Vercel, import the `clarity-v2` Bitbucket repo as a new project named `clarity-docs`
- [ ] Set the **Root Directory** to `apps/docs`
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Set env var: `NEXT_PUBLIC_STORYBOOK_URL=https://storybook.clarity.nivoda.com`
- [ ] Set production branch: `main`
- [ ] Add custom domain: `clarity.nivoda.com`
- [ ] Configure DNS at the nivoda.com registrar: `clarity` CNAME → Vercel target
- [ ] Trigger first deploy from `dev` (preview) to confirm the pipeline works

### Task 7.2: Create the Storybook Vercel project

- [ ] In Vercel, import the same repo as a second project named `clarity-storybook`
- [ ] Set the **Root Directory** to `packages/components`
- [ ] Framework preset: Other (`framework: null` in vercel.json overrides)
- [ ] Build command + output directory inherit from `vercel.json`
- [ ] Set production branch: `main`
- [ ] Add custom domain: `storybook.clarity.nivoda.com`
- [ ] Configure DNS at the nivoda.com registrar: `storybook.clarity` CNAME → Vercel target
- [ ] Trigger first deploy from `dev` to confirm

### Task 7.3: Verify the embeds work end-to-end

- [ ] Visit the preview URL of the docs project, open any component page
- [ ] Confirm the StorybookEmbed iframe loads the corresponding story from the Storybook preview
- [ ] Check Network tab for any blocked iframe (CORS, X-Frame-Options) — fix in Phase 6.3 if so

---

## Phase 8 — Merge to dev and prepare for staging

### Task 8.1: Open a PR from feat/docs-fumadocs → dev

- [ ] Push the branch

Run (from the worktree): `git push -u origin feat/docs-fumadocs`

- [ ] Open the PR via `gh`

Run:
```bash
gh pr create --title "feat(docs): Clarity by Nivoda public docs launch" --body "$(cat <<'EOF'
## Summary
- Public-facing docs site at clarity.nivoda.com (Fumadocs) + public Storybook at storybook.clarity.nivoda.com (both as separate Vercel projects from this monorepo)
- New Principles section (4 pages) positioning Clarity as an agentic / AI-first design system
- Resources section removed (internal artefacts: architecture, ADRs, roadmap, vision, contributing, changelog)
- StorybookEmbed and Gap MDX components; embed wired into every COMPONENT.md; Gap applied to 8 known stub pages
- Landing page rewritten to lead with the agentic positioning

Spec: docs/plans/specs/2026-05-25-public-docs-launch-design.md
Plan: docs/plans/2026-05-25-public-docs-launch-plan.md

## Test plan
- [ ] Vercel preview build of docs succeeds and renders
- [ ] Vercel preview build of Storybook succeeds and renders
- [ ] At least three component pages render the StorybookEmbed correctly against the preview Storybook URL
- [ ] All 8 stub pages display a Gap callout
- [ ] Landing page renders three Principles cards and both CTAs work
- [ ] No broken internal links (check /docs/resources/* returns 404, as expected)
EOF
)"
```

- [ ] Address any reviewer feedback, push fixes, get approval, merge as a merge commit (no squash — per the repo's CONTRIBUTING.md)

### Task 8.2: Cleanup

- [ ] After merge, remove the worktree

Run (from main repo path):
```bash
git worktree remove .claude/worktrees/fumadocs
git branch -D feat/docs-fumadocs  # only after confirming remote is also gone
```

- [ ] Update the cross-repo changelog

Edit root `CHANGELOG.md` to add a 2026-05-25 (or merge-day-dated) entry summarising the public docs launch.

### Task 8.3: Promote dev → staging when ready

This is a design-leadership judgement call per `CONTRIBUTING.md` — not part of this plan to trigger. The plan ends with `dev` merged and the two Vercel projects deploying preview builds. Promotion to `staging` and then `main` happens when Chris signs off.

---

## Out of scope (deliberately)

- Filling in the actual content for the 8 stub pages (separate, ongoing authoring work)
- Splitting `@nivoda/components` into product + marketing libraries
- Renaming any internal identifier from "Clarity V2" to "Clarity by Nivoda" (only the public surface adopts the new name)
- Migrating any content from `~/Documents/PROJECTS/nivoda/Repos/brand-system/`
- Search analytics, telemetry, or anything beyond Vercel + Fumadocs defaults
- A custom OG image generator beyond Fumadocs defaults
- Authentication, IP allowlists, or any access control — everything is public

---

## Skills referenced

- @superpowers:subagent-driven-development — recommended execution mode
- @superpowers:executing-plans — alternative inline execution mode
- @superpowers:verification-before-completion — apply at the end of each phase

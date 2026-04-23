# Fumadocs at `apps/docs` — Implementation Plan (PR 1: scaffold-only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Fumadocs-UI documentation site as a first-class Nx project at `apps/docs/`, consuming existing per-component `COMPONENT.md` files and the repo's `docs/` markdown as content sources, deployed empty (no live component demos yet) to Vercel behind access protection.

**Architecture:** Next.js 16.1.6 App Router + Fumadocs-UI + Fumadocs-MDX, scaffolded via `create-fumadocs-app` to avoid reinventing the current Fumadocs boilerplate. Registered as an Nx project under a new `apps/` top-level directory. Content sources point at `packages/components/src/components/**/COMPONENT.md` (52+ files, auto-ingested) and `docs/**/*.md`. The docs site itself imports `@nivoda/components`' compiled stylesheet so the chrome is visibly branded with Clarity V2 tokens — a live dogfooding signal even without embedded component demos. Live MDX component embeds deferred to PR 2 (separate plan). Engineering conversation + experience-framework cross-repo content deferred to Distribution-complete territory.

**Tech Stack:** Next.js 16.1.6, React 19.2+, Fumadocs v16+ (UI + MDX), Tailwind v4, ESM-only config, Nx 22.6, npm workspaces, Vercel.

**Version compatibility (confirmed):** Fumadocs v16 (released Oct 2025) raised minimum Next.js to 16 and minimum React to 19.2.0. Next 16.1.6 (released Jan 27 2026) is within the supported range. Latest Next stable is 16.2.4 — 16.1.6 is slightly behind but chosen deliberately to match Minivoda (`packages/test-app/`).

**Package manager note:** This repo uses **npm workspaces**, not pnpm. Workspace-local dependency syntax is `"@nivoda/components": "*"`, not `workspace:*`. The components package is published as `@nivoda/components`; tokens as `@nivoda/tokens`.

**Branch:** `feat/docs-fumadocs` (already created, based on `origin/dev`, at `.claude/worktrees/fumadocs/`).

---

## File structure (target end state)

```
apps/
  docs/
    app/
      (home)/page.tsx                    # landing page
      docs/[[...slug]]/page.tsx          # Fumadocs catch-all route
      api/search/route.ts                # Fumadocs search endpoint
      layout.tsx                         # root layout with RootProvider
      global.css                         # Tailwind + @nivoda/components styles
    content/
      meta.json                          # top-level nav metadata
    lib/
      source.ts                          # Fumadocs source loader
    mdx-components.tsx                   # MDX component overrides
    source.config.ts                     # Fumadocs content source config
    next.config.mjs
    package.json
    project.json                         # Nx project descriptor
    tsconfig.json
    .gitignore                           # .next/, .env.*.local
    README.md                            # brief — how to run, what it is
```

**Modified at repo root:**
- `package.json` — extend `workspaces` from `["packages/*"]` to `["packages/*", "apps/*"]`
- `.gitignore` — add `.next/` and `.env.*.local` if not already present
- `ROADMAP.md` — note Distribution phase kicked off

**Not modified (by design):**
- `packages/components/src/components/**/COMPONENT.md` — 52+ files consumed as-is; frontmatter uses `name:` which we'll map to `title:` in the source config rather than rewriting every file
- `packages/test-app/` — Joao's Minivoda territory, do not touch

---

## Decisions made upfront (do not relitigate during execution)

1. **Scaffold via `create-fumadocs-app`**, not by hand-writing Fumadocs boilerplate from memory. Fumadocs evolves quickly; the scaffolder produces the current correct starter for the installed Fumadocs version.
2. **Next.js 16.1.6** — chosen to align with Minivoda (`packages/test-app/`). Verify Fumadocs-UI supports it before proceeding (Task 3).
3. **PR scope is scaffold-only.** No live MDX component embeds. No experience-framework cross-repo content. No onboarding prose. No search-tuning. These are explicit non-goals for this PR.
4. **Vercel deployment is part of PR 1**, behind access protection. Green pipeline before anyone writes content.
5. **Nav auto-generated** from directory structure. No custom ordering/icons yet. Deferred to a follow-up.
6. **Frontmatter adaptation in source config** — the existing COMPONENT.md files use `name:`, `slug:`, `status:`, `lastUpdated:`. Map `name → title` in `source.config.ts` rather than touching 52 files.

---

## Pre-flight (do once before Task 1)

- [ ] Confirm you are in the correct worktree: `pwd` should end with `.claude/worktrees/fumadocs`
- [ ] Confirm branch: `git branch --show-current` → `feat/docs-fumadocs`
- [ ] Confirm clean: `git status` → nothing to commit
- [ ] Read `CLAUDE.md` at the repo root once for conventions

---

## Task 1: Extend workspaces to include `apps/*`

**Why:** npm workspaces currently only includes `packages/*`. Adding `apps/docs` as a workspace requires this change first, or `npm install` will not link the workspace deps.

**Files:**
- Modify: `package.json` (root)
- Modify: `.gitignore` (root) — add `.next/` and `.env.*.local` if absent

- [ ] **Step 1: Extend workspaces array**

Edit root `package.json`. Change:
```json
"workspaces": [
  "packages/*"
]
```
to:
```json
"workspaces": [
  "packages/*",
  "apps/*"
]
```

- [ ] **Step 2: Update root .gitignore**

Check current `.gitignore` contents. Append if missing:
```
# Next.js
.next/
.env.*.local
```

- [ ] **Step 3: Create empty apps directory**

Run: `mkdir -p apps`

(No `.gitkeep` — Task 3 creates `apps/docs/` immediately, so the directory won't be orphaned. If Joao's Minivoda PR has already landed and extended `workspaces` to include `apps/*`, skip steps 1 and 3 — this task becomes a no-op.)

- [ ] **Step 4: Verify workspace globbing**

Run: `npm install --dry-run 2>&1 | head -20`
Expected: no errors about `apps/*`.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore
git commit -m "chore(workspace): register apps/* as workspace glob

Prepare the monorepo for Nx-integrated apps alongside packages/*.
First consumer: apps/docs (Fumadocs documentation site)."
```

---

## Task 2: Confirm installed Fumadocs and React versions

**Why:** Compatibility is already confirmed on paper (Fumadocs v16+ requires Next 16 and React 19.2+, all met). This task is a defensive sanity check — pin the versions we actually resolved to, catch any surprise before scaffolding.

**Files:** None (research/verification task)

- [ ] **Step 1: Check current Fumadocs-UI version**

Run: `npm view fumadocs-ui version peerDependencies`
Expected: version `>=16.0.0`; peer deps listing `next: >=16` and `react: >=19.2`.

- [ ] **Step 2: Check current Fumadocs-MDX version**

Run: `npm view fumadocs-mdx version peerDependencies`
Expected: version `>=16.0.0`; compatible peer range.

- [ ] **Step 3: Note the React version in `packages/components/package.json`**

Read: `packages/components/package.json` → `dependencies.react`
Currently: `^19.1.0`. Since `19.2.x` satisfies `^19.1.0`, npm workspaces will hoist React 19.2 to the root and both packages will share it — no action needed. If the resolved React ends up below 19.2 after install, revisit (likely means `packages/components` has a `resolutions` or `overrides` clamping it).

- [ ] **Step 4: Record the resolved Fumadocs version**

Note the exact Fumadocs version the scaffolder will install — you'll pin this explicitly in Task 3 to avoid surprise minor bumps.

---

## Task 3: Scaffold Fumadocs app at `apps/docs/`

**Why:** Use the official scaffolder so the boilerplate is current. We'll adapt it into an Nx project in Task 4.

**Files:**
- Create: entire `apps/docs/` tree (scaffolder output)

- [ ] **Step 1: Inspect the scaffolder CLI before invoking it**

Fumadocs' `create-fumadocs-app` flag surface evolves. Do not assume flags. Run:
```bash
npx create-fumadocs-app@latest --help
```
Read the output. Note the current flag syntax for: template selection, skipping install, target directory.

- [ ] **Step 2: Run the Fumadocs scaffolder**

From repo root, with flags adapted from Step 1 output:
```bash
cd apps && npx create-fumadocs-app@latest
```
Interactive prompts — answer:
- Target directory: `docs`
- Framework: **Next.js** (not Tanstack Start or other)
- UI flavor: **Fumadocs UI** (not headless / not Fumadocs Core only)
- Content source: **Fumadocs MDX**
- Tailwind: **v4 / yes**
- Install dependencies now: **no** (we install at the monorepo root in Step 4)
- Git init: **no** (we're already in a git repo)

Decline any example content / blog / openapi extras.

- [ ] **Step 3: Inspect what got generated**

Run: `ls apps/docs && cat apps/docs/package.json`
Expected: a `package.json` with `next`, `fumadocs-ui`, `fumadocs-mdx`, and related deps. Note the Fumadocs version pinned.

- [ ] **Step 4: Pin Next.js to 16.1.6, rename package, and extend tsconfig**

Edit `apps/docs/package.json`. Set `next: "16.1.6"` exactly (not `^`). Set React to `^19.2.0` (Fumadocs v16 minimum).

Also set the package metadata:
```json
{
  "name": "@nivoda/docs",
  "version": "0.0.0",
  "private": true
}
```

Edit `apps/docs/tsconfig.json`. Ensure it extends the repo base:
```json
{
  "extends": "../../tsconfig.base.json",
  ...scaffolder-provided options, preserved verbatim...
}
```
This inherits `customConditions: ["@nivoda/clarity-v2"]` which PR 2 will rely on for resolving `@nivoda/components` source exports during live MDX demos. Don't drop Next's required compiler options (jsx, paths, etc.) — merge, don't replace.

- [ ] **Step 5: Install at the monorepo root**

From repo root:
```bash
npm install
```
Expected: succeeds, links `apps/docs` as a workspace, no peer-dep errors. If React resolves below 19.2 → stop, surface.

- [ ] **Step 6: Verify the scaffold runs**

From repo root:
```bash
cd apps/docs && npx next dev -p 3002
```
Expected: server starts, visiting `http://localhost:3002` shows the Fumadocs starter landing page. Kill the server (`Ctrl-C`).

- [ ] **Step 7: Remove the scaffold's example content**

The scaffolder drops example `content/docs/*.mdx` files. Delete them — we don't need them:
```bash
rm -rf apps/docs/content/docs
mkdir -p apps/docs/content
```
(We'll wire custom content sources in Task 6.)

- [ ] **Step 8: Commit**

```bash
git add apps/docs package-lock.json package.json
git commit -m "feat(docs): scaffold Fumadocs-UI app at apps/docs

Generated via create-fumadocs-app, pinned to Next 16.1.6 to match
Minivoda (packages/test-app). Example content removed; custom sources
wired in subsequent tasks."
```

---

## Task 4: Register `apps/docs` as an Nx project

**Why:** Nx needs a `project.json` to expose `dev`, `build`, and `typecheck` targets to the Nx graph. Without this, `nx affected` is blind to the docs app and we lose build caching.

**Files:**
- Create: `apps/docs/project.json`

- [ ] **Step 1: Inspect how existing packages expose Nx targets**

Read: `packages/components/project.json` (if present — it may rely on inferred targets from `@nx/js/typescript`). Either explicit or inferred is fine; mirror the pattern already in use.

- [ ] **Step 2: Exclude `apps/docs` from `@nx/js/typescript` inference**

The `@nx/js/typescript` plugin (registered in root `nx.json`) will otherwise auto-infer `build` and `typecheck` targets from `apps/docs/tsconfig.json`, producing duplicate/conflicting targets against the explicit ones we're about to declare.

Edit root `nx.json`. Change the plugin entry from:
```json
{
  "plugin": "@nx/js/typescript",
  "options": { ... }
}
```
to:
```json
{
  "plugin": "@nx/js/typescript",
  "exclude": ["apps/docs/*"],
  "options": { ... }
}
```
Preserve existing `options` verbatim.

- [ ] **Step 3: Create project.json**

Create `apps/docs/project.json`:
```json
{
  "name": "@nivoda/docs",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/docs",
  "projectType": "application",
  "targets": {
    "dev": {
      "command": "next dev -p 3002",
      "options": { "cwd": "apps/docs" },
      "cache": false
    },
    "build": {
      "command": "next build",
      "options": { "cwd": "apps/docs" },
      "inputs": ["default", "^default"],
      "outputs": ["{projectRoot}/.next"],
      "cache": true
    },
    "start": {
      "command": "next start -p 3002",
      "options": { "cwd": "apps/docs" },
      "dependsOn": ["build"],
      "cache": false
    },
    "typecheck": {
      "command": "tsc --noEmit",
      "options": { "cwd": "apps/docs" },
      "inputs": ["default", "^default"],
      "cache": true
    }
  }
}
```

- [ ] **Step 4: Verify Nx sees the project with no duplicate targets**

Run: `npx nx show project @nivoda/docs --json`
Expected: JSON output listing `dev`, `build`, `start`, `typecheck`. Each target should have exactly one definition — if you see any target with two values merged from plugin inference, the exclude in Step 2 didn't take. Revisit.

- [ ] **Step 5: Verify `nx dev` works**

Run: `npx nx dev @nivoda/docs` in one terminal, visit `http://localhost:3002` in a browser. Expected: Fumadocs starter still renders. Kill the server.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/project.json apps/docs/tsconfig.json nx.json
git commit -m "feat(docs): register apps/docs as Nx project

Exposes dev/build/start/typecheck targets so nx affected includes
the docs site in the graph. Excludes apps/docs from @nx/js/typescript
inference to avoid duplicate target definitions."
```

---

## Task 5: Add Clarity V2 workspace dependencies and styling

**Why:** The docs site should visibly use Clarity V2's tokens and component styles from day one — this is the cheapest dogfooding signal. Also wires the workspace linkage that PR 2 (live component embeds) will rely on.

**Files:**
- Modify: `apps/docs/package.json` — add `@nivoda/components` and `@nivoda/tokens` as workspace deps
- Modify: `apps/docs/app/global.css` (or wherever the scaffold put global styles) — import Clarity V2 stylesheet

- [ ] **Step 1: Add workspace deps to `apps/docs/package.json`**

Add to `dependencies`:
```json
"@nivoda/components": "*",
"@nivoda/tokens": "*"
```
(`*` is the npm-workspaces syntax for workspace-local resolution.)

- [ ] **Step 2: Install**

From repo root:
```bash
npm install
```
Expected: `apps/docs/node_modules/@nivoda/components` is a symlink to `packages/components`. Verify:
```bash
ls -la apps/docs/node_modules/@nivoda/components
```
Expected: symlink pointing at `packages/components` (or hoisted to root `node_modules` — both are valid for npm workspaces).

- [ ] **Step 3: Ensure components package is built**

The `@nivoda/components` package ships compiled output in `dist/`. Confirm it exists:
```bash
ls packages/components/dist
```
Expected: `index.css`, `index.js`, `index.d.ts`, plus the `components/` and `lib/` subdirs.

If `dist/` is missing, run: `npx nx build @nivoda/components` (or the equivalent target name — check `packages/components/project.json`).

- [ ] **Step 4: Import the stylesheet**

Primary approach — in the global stylesheet (typically `apps/docs/app/global.css`), at the top before Tailwind directives:
```css
@import "@nivoda/components/styles.css";
```

**Fallback if that fails:** CSS `@import` resolution via package `exports` subpaths is bundler-dependent. If Next/Turbopack can't resolve it, remove the `@import` and instead add a JS-side import in `apps/docs/app/layout.tsx`:
```ts
import "@nivoda/components/styles.css";
```
Both paths are valid; try CSS first (keeps style concerns in style files), fall back to JS if the bundler complains.

- [ ] **Step 5: Verify styling applied**

Run: `npx nx dev @nivoda/docs` and visit `http://localhost:3002`. Open devtools → Elements → Computed styles on `body`. Expected: CSS custom properties like `--background`, `--primary`, `--color-primitive-violet-500` (or similar — verify by checking `packages/components/dist/index.css`) are present in the cascade. The Fumadocs chrome may or may not visually change — what matters is the tokens are loaded.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/package.json apps/docs/app/global.css package-lock.json
git commit -m "feat(docs): consume @nivoda/components stylesheet

Links the docs site to the live component package via workspace deps
and imports the compiled stylesheet so Clarity V2 tokens are active
in the docs chrome. Sets the pattern for PR 2 (live MDX component
embeds)."
```

---

## Task 6: Wire content sources — COMPONENT.md + docs/

**Why:** The whole point of Fumadocs-over-Zeroheight (ADR-004) is that documentation source lives in the repo and the site reads it at build time. Now we point Fumadocs at the two markdown roots we have: colocated `COMPONENT.md` files (52+) and the `docs/` directory.

**Files:**
- Modify: `apps/docs/source.config.ts` — define content sources and frontmatter schema

- [ ] **Step 1: Inspect the scaffolder's config AND the installed Fumadocs-MDX API**

Read: `apps/docs/source.config.ts` — note exactly which functions/types it imports.

Then verify the installed API:
```bash
ls apps/docs/node_modules/fumadocs-mdx/dist/config
cat apps/docs/node_modules/fumadocs-mdx/dist/config/index.d.ts 2>/dev/null | head -50
# Or, if that path differs in your installed version:
find apps/docs/node_modules/fumadocs-mdx -name "*.d.ts" | head
```

**What to look for:** Fumadocs-MDX has historically used `defineDocs` and more recently `defineCollections` / `defineDocs`. The installed version's exports are authoritative — use those, not the pseudo-code below.

- [ ] **Step 2: Decide on content-source strategy — in-tree OR cross-package glob**

Fumadocs-MDX has historically rejected globs that reach outside the config directory (e.g. `../../packages/components/...`). Test this first with a minimal config pointing at one COMPONENT.md. Two strategies, in order of preference:

**Strategy A (preferred): direct cross-package globbing.** If the installed Fumadocs-MDX accepts `dir: "../../packages/components/src/components"` — use it. Cleanest, no copy step.

**Strategy B (fallback): symlink into `apps/docs/content/`.** If Strategy A fails, add a `prebuild` script in `apps/docs/package.json` that symlinks the two content roots into `apps/docs/content/`:
```json
"scripts": {
  "prebuild": "node scripts/link-content.mjs",
  "predev": "node scripts/link-content.mjs"
}
```
Where `scripts/link-content.mjs` creates symlinks at `apps/docs/content/components → ../../packages/components/src/components` and `apps/docs/content/guides → ../../docs`. Symlinks (not copies) so edits propagate live.

Pick the strategy that works with the installed Fumadocs-MDX. Commit the choice in Step 4's commit message so future readers know why the repo looks the way it does.

- [ ] **Step 3: Redefine content sources (example; adapt to installed API)**

The *intent*: two content collections (`components` and `guides`), with the components collection filtering to `**/COMPONENT.md` only and mapping frontmatter `name` → `title`. The exact call shape will vary with the Fumadocs-MDX version. Example in current API style:
```ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

export const components = defineDocs({
  dir: "<your chosen content root — see Step 2>",
  include: ["**/COMPONENT.md"],
  docs: {
    schema: z
      .object({
        name: z.string(),
        slug: z.string().optional(),
        version: z.string().optional(),
        status: z.string().optional(),
        lastUpdated: z.string().optional(),
      })
      .transform((data) => ({ ...data, title: data.name })),
  },
});

export const guides = defineDocs({
  dir: "<your chosen content root — see Step 2>",
  include: ["**/*.md"],
});

export default defineConfig();
```

**This snippet is guidance, not gospel.** The real API is whatever `apps/docs/node_modules/fumadocs-mdx/dist/config/*.d.ts` says it is. Match that.

- [ ] **Step 4: Update lib/source.ts to expose both collections**

Read `apps/docs/lib/source.ts`. It currently exposes one source. Extend it to expose both `components` and `guides`. Follow the pattern the scaffolder already used. Typical shape:
```ts
import { loader } from "fumadocs-core/source";
import { components, guides } from "@/.source";

export const componentsSource = loader({
  baseUrl: "/docs/components",
  source: components.toFumadocsSource(),
});

export const guidesSource = loader({
  baseUrl: "/docs/guides",
  source: guides.toFumadocsSource(),
});
```

- [ ] **Step 5: Update the catch-all page to route both collections**

Read `apps/docs/app/docs/[[...slug]]/page.tsx`. It currently reads one source. Extend so URLs under `/docs/components/*` use `componentsSource` and under `/docs/guides/*` use `guidesSource`. The precise refactor depends on the scaffolder's generated structure — preserve its conventions, just add branching.

- [ ] **Step 6: Run next build to surface schema errors early**

Run: `npx nx build @nivoda/docs`
Expected: build succeeds. If it fails on frontmatter (e.g. a COMPONENT.md with missing `name:`), fix the schema to be more permissive rather than touching the 52 source files in this PR. Log any genuinely-malformed frontmatter and surface at the end.

- [ ] **Step 7: Verify routes render in dev**

Run: `npx nx dev @nivoda/docs`
Visit:
- `http://localhost:3002/docs/components/atoms/button` — expected: Button docs render
- `http://localhost:3002/docs/guides/architecture/architecture` — expected: architecture doc renders

Kill the server.

- [ ] **Step 8: Commit**

```bash
git add apps/docs package.json
git commit -m "feat(docs): wire content sources for components + guides

Points Fumadocs at packages/components/src/components/**/COMPONENT.md
(52+ files) and docs/**/*.md. Frontmatter schema maps existing 'name'
field to Fumadocs' expected 'title' without touching source files.

Strategy used: <A: direct cross-package glob | B: symlinked via prebuild>"
```

---

## Task 7: Landing page, nav, and README

**Why:** The starter's landing page references example content we deleted. Replace it with a minimal Clarity V2 landing. Add a README so a cold reader can run the site.

**Files:**
- Modify: `apps/docs/app/(home)/page.tsx` (or wherever the scaffold put the home route)
- Create: `apps/docs/README.md`
- Optionally create: `apps/docs/content/meta.json` — top-level nav if auto-generation doesn't group components/guides nicely

- [ ] **Step 1: Replace landing page with a minimal Clarity V2 intro**

Rewrite `apps/docs/app/(home)/page.tsx` to a single heading + two links:
```tsx
export default function HomePage() {
  return (
    <main style={{ padding: "4rem 2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Clarity V2</h1>
      <p>Nivoda's design system. Tokens, components, patterns — one browsable source.</p>
      <ul>
        <li><a href="/docs/components/atoms/button">Components</a></li>
        <li><a href="/docs/guides/architecture/architecture">Architecture</a></li>
      </ul>
    </main>
  );
}
```
Intentionally unstyled — we're proving the pipeline, not shipping polish.

- [ ] **Step 2: Write apps/docs/README.md**

```markdown
# @nivoda/docs

Fumadocs-powered documentation site for Clarity V2.

## Run locally

From the repo root:

\`\`\`bash
npx nx dev @nivoda/docs
\`\`\`

Visit http://localhost:3002

## What it contains

- **Components** — auto-generated from `packages/components/src/components/**/COMPONENT.md`
- **Guides** — the repo's `docs/**/*.md` directory

Edit a COMPONENT.md, refresh the page, see the change. No sync to maintain.

## Deployment

Deployed to Vercel on push. Behind access protection until Distribution phase opens it up.
\`\`\`

- [ ] **Step 3: Smoke-test build + dev**

Run: `npx nx build @nivoda/docs` — expected: succeeds
Run: `npx nx dev @nivoda/docs` — visit `/`, click both links, confirm both routes resolve

- [ ] **Step 4: Commit**

```bash
git add apps/docs
git commit -m "feat(docs): landing page and README

Minimal landing page linking to components + guides collections.
README covers how to run locally and where content comes from."
```

---

## Task 8: Vercel deployment (access-protected)

**Why:** Green pipeline before there's content to lose. Catches Next/Nx build integration issues while they're cheap to fix.

**Files:**
- Create: `apps/docs/vercel.json` (optional — config can also live in the Vercel dashboard)

**Prerequisites:**
- Access to the Nivoda Vercel team (Chris has this — same team as Minivoda hosting)
- Vercel CLI installed, or access to the Vercel dashboard

- [ ] **Step 1: Push the branch to origin**

```bash
git push -u origin feat/docs-fumadocs
```

- [ ] **Step 2: Create the Vercel project**

Via Vercel dashboard:
- New Project → Import `free-agent83/clarity-v2` → branch `feat/docs-fumadocs`
- **Root Directory:** repo root (leave blank / default) — NOT `apps/docs`. This ensures npm workspaces resolves correctly at install time.
- **Framework Preset:** Next.js
- **Build Command:** `npx nx build @nivoda/docs`
- **Output Directory:** `apps/docs/.next`
- **Install Command:** `npm install` (default; workspaces are picked up automatically)
- **Node version:** match the repo (check `.nvmrc` or `package.json > engines`; if neither present, set Node 20.x)

Rationale for leaving Root Directory at repo root: setting it to `apps/docs` requires `cd ../..` hacks in install/build commands that break Vercel's dependency cache detection. Root-level build with a specific output path is the cleaner pattern.

- [ ] **Step 3: Enable access protection**

In Vercel project settings → Deployment Protection → set to "Vercel Authentication" (Nivoda team members only). **Do not** expose publicly in this PR.

- [ ] **Step 4: Trigger deployment**

Push a trivial commit (e.g. a whitespace change in the README) or click "Redeploy" in the Vercel dashboard.

- [ ] **Step 5: Verify the preview URL**

Once the build finishes, visit the preview URL. Expected:
- Landing page renders
- `/docs/components/atoms/button` renders the Button docs
- `/docs/guides/architecture/architecture` renders the architecture doc
- Access gate prompts for Vercel authentication (confirm protection is active)

If the build fails: read the Vercel build log. Typical issue is the build command not running from repo root — adjust.

- [ ] **Step 6: Capture the preview URL and commit any vercel.json tweaks**

If you added a `vercel.json` (e.g. to pin build command):
```bash
git add apps/docs/vercel.json
git commit -m "chore(docs): Vercel build config

Root-level build command so workspace deps resolve during CI build."
git push
```

Record the preview URL in the PR description when you open it.

---

## Task 9: Update ROADMAP.md + open PR

**Why:** The ROADMAP currently lists Distribution as "⚪ Next 0%". Shipping `apps/docs` bumps it to in-progress. Update in the same PR so the story stays coherent.

**Files:**
- Modify: `ROADMAP.md` — mark Distribution as in-progress, note the docs site URL

- [ ] **Step 1: Update ROADMAP status**

In `ROADMAP.md`, change the Distribution section heading from:
```
### Distribution ⚪ Next

░░░░░░░░░░ 0%
```
to:
```
### Distribution 🟡 Active

▓░░░░░░░░░ 10%
```

Under the Distribution bullets, update the Fumadocs line from:
```
- Fumadocs documentation site deployed to Vercel — ...
```
to:
```
- [x] Fumadocs documentation site scaffolded at `apps/docs/` and deployed to Vercel (access-protected)
- [ ] Live MDX component demos (PR 2)
- [ ] Experience Framework cross-repo content
- [ ] Onboarding material and prompt patterns
- [ ] First person other than Chris builds something real with Clarity V2 + AI
- [ ] Engineering conversation + migration strategy decided
```

Update the `_Last updated:_` date to today.

- [ ] **Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "docs(roadmap): Distribution phase active, apps/docs deployed"
git push
```

- [ ] **Step 3: Open PR**

```bash
gh pr create --title "feat(docs): Fumadocs site at apps/docs (scaffold-only)" --body "$(cat <<'EOF'
## Summary

- Scaffolds a Fumadocs-UI site at `apps/docs/` as a first-class Nx project
- Content sources: `packages/components/src/components/**/COMPONENT.md` (52+ files) and `docs/**/*.md`
- Consumes `@nivoda/components` and `@nivoda/tokens` via npm workspace deps
- Deployed to Vercel behind access protection

## Out of scope (deferred to PR 2+)

- Live MDX component demos
- Experience Framework cross-repo content
- Search tuning, nav polish, custom theming
- Onboarding material / prompt patterns

## Test plan

- [ ] `npx nx dev @nivoda/docs` serves locally on :3002
- [ ] `npx nx build @nivoda/docs` builds clean
- [ ] `/docs/components/atoms/button` renders on preview URL
- [ ] `/docs/guides/architecture/architecture` renders on preview URL
- [ ] Vercel access protection is active
- [ ] No conflicts with `packages/test-app/` or Joao's Minivoda branch

Preview: <paste Vercel URL>
EOF
)"
```

---

## Known risks and what to do about them

| Risk | Likelihood | If it happens |
|---|---|---|
| React 19.2 gets clamped below 19.2 by a transitive `overrides`/`resolutions` | Low | Task 2 Step 3 catches this. Fumadocs requires React ≥19.2; if clamped, surface rather than patch silently. |
| COMPONENT.md frontmatter mapping breaks build | Low-Medium | Relax the Zod schema in `source.config.ts` to be permissive; log malformed files but don't touch them in this PR. |
| Nx `@nvx/next` plugin needed for proper build caching | Low | Plan uses plain `command` executors which work without the plugin. Adding the plugin is a follow-up, not a blocker. |
| Vercel build can't resolve workspace deps | Medium | Task 8 sets Vercel's Root Directory to repo root, Build Command `npx nx build @nivoda/docs`, Output Directory `apps/docs/.next`. If deps still unresolved, force explicit workspace install: `npm install --workspaces`. |
| Minivoda PR (Joao's `origin/feat/minivoda-migration`) merges first and conflicts with root `package.json`/`package-lock.json` | Medium | Expected. Rebase `feat/docs-fumadocs` onto `dev` after merge. Check: if Joao's PR already added `apps/*` to `workspaces` (unlikely, his branch puts Minivoda in `packages/test-app/`), Task 1 Steps 1 and 3 become no-ops. If he added a different glob, merge both. `package-lock.json` regenerates via `npm install`. |
| ESLint not configured for `apps/docs` | Low | Scaffolder may or may not set up ESLint. Acceptable to ship without in PR 1 — `nx affected --target=lint` will silently skip. Flag in PR description as explicit deferral, address in PR 2. |
| Fumadocs-MDX API has shifted from what's written in Task 6 | Medium | Task 6 explicitly tells the executor to check the installed version's actual API and adapt. The *intent* is captured; the exact call signature is not load-bearing. |

---

## Out of scope for this plan (PR 2 or later)

- Live MDX component demos (`<ComponentPreview name="button" />` etc.) — biggest follow-up
- Experience Framework cross-repo content (`../experience-framework/`)
- Search result tuning / custom search UI
- Custom theming / brand polish beyond the default Fumadocs-UI theme
- Storybook iframe embeds in component docs pages
- Onboarding material, prompt patterns, worked self-service examples
- Public access (removing the Vercel gate) — decided during Distribution-complete
- Custom nav ordering / per-section icons / sidebar IA beyond auto-generation
- Analytics / feedback widgets

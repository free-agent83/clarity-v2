# Fumadocs at `apps/docs` — Implementation Plan (PR 1: scaffold-only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Fumadocs-UI documentation site as a first-class Nx project at `apps/docs/`, with a 7-section IA (Get started / Foundations / Components / Patterns / Content / Brand / Resources), Nivoda-branded dark-first chrome, and a hero landing page — demo-ready for leadership presentation. Content sources are existing per-component `COMPONENT.md` files (52+) and repo markdown (`docs/`, `ROADMAP.md`, `VISION.md`, `CHANGELOG.md`). Deployed to Vercel behind access protection.

**Architecture:** Next.js 16.1.6 App Router + Fumadocs-UI + Fumadocs-MDX, scaffolded via `create-fumadocs-app` to avoid reinventing the current Fumadocs boilerplate. Registered as an Nx project under a new `apps/` top-level directory. Content sources: `packages/components/src/components/**/COMPONENT.md` (functionally regrouped via `meta.json` from atomic to Actions/Forms/Display/etc.), `docs/**/*.md`, and repo-root markdown. The docs site imports `@nivoda/components`' compiled stylesheet, overrides Fumadocs theme CSS vars to soft-black dark-first per brand direction, and uses the Nivoda wordmark in the nav. Live MDX component demos deferred to PR 2 — Storybook is the live-demo surface for the leadership presentation (shown separately). Engineering conversation, experience-framework cross-repo content, and onboarding prose deferred to Distribution-complete territory.

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
      (home)/page.tsx                    # hero landing (Task 8)
      docs/[[...slug]]/page.tsx          # Fumadocs catch-all route
      api/search/route.ts                # Fumadocs search endpoint
      layout.tsx                         # root layout, dark-first theme
      layout.config.tsx                  # Fumadocs nav config (logo, brand)
      global.css                         # Tailwind + @nivoda/components styles + brand overrides
    content/
      meta.json                          # top-level: 7-section ordering
      get-started.mdx                    # Task 7 Step 10
      foundations/                       # 1 real + 5 stub (Task 7 Step 3)
      components/                        # functional grouping of 52 COMPONENT.md (Task 7 Step 4-5)
      patterns/                          # 1 real (PLP) + 3 stub (Task 7 Step 6)
      content/                           # 3 stubs (Task 7 Step 7)
      brand/                             # 2 real + 1 stub (Task 7 Step 8)
      resources/                         # all real, renders repo-root markdown (Task 7 Step 9)
    public/
      brand/                             # wordmark-white.svg, wordmark-black.svg, icon-*.svg
      favicon.svg
    lib/
      source.ts                          # Fumadocs source loader
    mdx-components.tsx                   # MDX component overrides
    source.config.ts                     # Fumadocs content source config
    next.config.mjs
    package.json
    project.json                         # Nx project descriptor
    tsconfig.json                        # extends ../../tsconfig.base.json
    .gitignore                           # .next/, .env.*.local
    README.md                            # Task 8 Step 6
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
2. **Next.js 16.1.6** — chosen to align with Minivoda (`packages/test-app/`). Verified Fumadocs-UI supports it (Fumadocs v16 requires Next 16+).
3. **Demo scope.** This PR must be presentable to leadership. Includes: 7-section IA, stub prose for un-written sections, Nivoda branding, dark-first theme, hero landing. Does NOT include: live component demos (Storybook covers that in a separate demo segment), live token swatches on Color/Typography pages, live brand component rendering.
4. **Vercel deployment is part of the PR**, behind access protection. Green pipeline before the demo.
5. **Frontmatter adaptation in source config** — the existing COMPONENT.md files use `name:`, `slug:`, `status:`, `lastUpdated:`. Map `name → title` in `source.config.ts` rather than touching 52 files.
6. **Functional grouping, not atomic, in sidebar.** Atoms/molecules/organisms is an implementation concept; Actions/Forms/Display/etc. is how consumers search. Filesystem stays atomic; `meta.json` overrides the sidebar.
7. **Stubs use option (b) — 2-3 sentence teasers** with `status: not-yet-written`. No filler, no promised dates.
8. **Brand direction: dark-first, soft black, restrained violet.** Sourced from `brand-system/visual-identity.md` in the `brand-system` repo. Violet is used for links, focus rings, and the primary CTA — never for chrome, panels, or backgrounds.

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

## Task 7: Information architecture — 7-section IA with stubs and resources

**Why:** The sidebar is the single most visible design decision of this PR. Auto-generated from filesystem = 37 alphabetical atoms, which dies on a projector. Structured functional IA = "this is a design system," not "this is a component library." Stubs (with teaser prose) signal scope and forward motion for the leadership demo.

**Demo context:** Storybook is being presented separately as the live component demo. Fumadocs' job in the demo is to prove this is a *system* — foundations, patterns, content, brand, governance — not just components.

**Files:**
- Create: `apps/docs/content/meta.json` — top-level 7-section ordering
- Create: `apps/docs/content/foundations/*.mdx` — stub pages
- Create: `apps/docs/content/foundations/meta.json`
- Create: `apps/docs/content/components/meta.json` — functional grouping ordering (re-maps atomic filesystem to Actions/Forms/Display/etc.)
- Create: `apps/docs/content/patterns/*.mdx` — stub pages
- Create: `apps/docs/content/patterns/meta.json`
- Create: `apps/docs/content/content/*.mdx` — stub pages (voice, writing, terminology)
- Create: `apps/docs/content/content/meta.json`
- Create: `apps/docs/content/brand/*.mdx` — logo, brand-expression pages
- Create: `apps/docs/content/brand/meta.json`
- Create: `apps/docs/content/resources/*.mdx` — pages that render repo-root markdown
- Create: `apps/docs/content/resources/meta.json`
- Modify: `apps/docs/source.config.ts` — add a collection for repo-root markdown (ROADMAP.md, VISION.md, CHANGELOG.md)

**Target top-level sidebar shape:**

```
Get started                 [1 real page]
Foundations                 [1 real, 5 stub]
├── Tokens
├── Color / OKLCH
├── Typography              [real — links to Typography COMPONENT.md]
├── Spacing                 [stub]
├── Elevation               [stub]
└── Motion                  [stub]
Components                  [REAL — functional grouping of 52 COMPONENT.md]
├── Actions
├── Forms
├── Display
├── Feedback
├── Overlays
├── Navigation
├── Data
├── Filtering
├── Layout
└── PLP Kit
Patterns                    [1 real, 3 stub]
├── Product listing page    [real — pulls from PLP spec docs]
├── Filter composition      [stub]
├── Empty states            [stub]
└── Loading states          [stub]
Content                     [all stub]
├── Voice & tone
├── Writing for UI
└── Terminology
Brand                       [2 real, 1 stub]
├── Logo                    [real — wraps Brand atom, shows wordmark + icon variants]
├── Brand expression        [real — wraps BrandExpress atom]
└── Illustration            [stub]
Resources                   [ALL real — render existing repo markdown]
├── Roadmap
├── Vision
├── Architecture
├── ADRs
├── Changelog
└── Contributing            [stub]
```

**Stub prose pattern — option (b), 2-3 sentences each:**

```mdx
---
title: Spacing
status: not-yet-written
---

Clarity V2's spacing scale follows a 4px base with a geometric progression.
The tokens are live in `@nivoda/tokens` today; written guidance is coming as
the component library stabilises.
```

Every stub has: title, `status: not-yet-written`, and 2-3 sentences that signal what the page will cover and where to look in the meantime. Don't write filler. Don't promise dates.

- [ ] **Step 1: Inspect how Fumadocs-MDX resolves meta.json ordering**

Read: `node_modules/fumadocs-ui/dist/page-tree/*.d.ts` (or equivalent docs in the installed version).

Confirm the expected shape of `meta.json`: typically `{ "title": "...", "pages": ["index", "page-a", "page-b", "---", "page-c"] }` where `---` inserts a separator. Page references can be relative or absolute. Some versions support cross-directory paths in `pages:` — verify before relying on it (load-bearing for the functional Components grouping).

- [ ] **Step 2: Create top-level meta.json**

Create `apps/docs/content/meta.json`:
```json
{
  "title": "Clarity V2",
  "pages": [
    "index",
    "---",
    "foundations",
    "components",
    "patterns",
    "content",
    "brand",
    "resources"
  ]
}
```

- [ ] **Step 3: Foundations — meta + stubs**

Create `apps/docs/content/foundations/meta.json`:
```json
{
  "title": "Foundations",
  "pages": ["index", "tokens", "color", "typography", "spacing", "elevation", "motion"]
}
```

Create `apps/docs/content/foundations/index.mdx` (section landing):
```mdx
---
title: Foundations
---

The primitives that make every component feel like the same product.
Tokens, color, typography, spacing, elevation, and motion — all sourced
from one OKLCH-based design token pipeline.
```

Create `apps/docs/content/foundations/tokens.mdx`:
```mdx
---
title: Tokens
status: not-yet-written
---

Clarity V2's token system is built on W3C DTCG + OKLCH, transformed by a
bespoke Node pipeline into shadcn-flat, structured, and React Native
outputs. Full detail in [ADR-001](/docs/resources/architecture#adr-001).
Visual reference is coming; the tokens themselves are live in `@nivoda/tokens`.
```

Create `apps/docs/content/foundations/color.mdx`:
```mdx
---
title: Color / OKLCH
status: not-yet-written
---

OKLCH is our color space. Every brand, status, and neutral hue is stored
as `{ colorSpace, components, hex }` so the math stays perceptual and the
hex fallback keeps React Native working. Visual swatches coming; raw tokens
are live in `@nivoda/tokens/dist`.
```

Create `apps/docs/content/foundations/typography.mdx`:
```mdx
---
title: Typography
---

Clarity V2 ships 12 role presets — H1–H6, Body 1/2 Regular and Emphasis,
Caption Regular and Emphasis — sourced from Figma node `18422:14`. The
Typography atom implements these directly. See the
[Typography component](/docs/components/display/typography) for props and
usage; role tokens live in `@nivoda/tokens` under `--text-typography-*`.
```

Create stubs for `spacing.mdx`, `elevation.mdx`, `motion.mdx` using the pattern in the intro above. 2-3 sentences each. Reference `@nivoda/tokens` where relevant.

- [ ] **Step 4: Components — functional grouping meta.json**

Create `apps/docs/content/components/meta.json`. Strategy depends on whether the installed Fumadocs supports cross-directory pages:

**Strategy A — if cross-directory works:**
```json
{
  "title": "Components",
  "pages": [
    "index",
    "---Actions---",
    "../components-src/atoms/button",
    "../components-src/atoms/button-group",
    "---Forms---",
    "../components-src/atoms/input",
    "../components-src/atoms/textarea",
    "...etc..."
  ]
}
```

**Strategy B — if not, group by creating `apps/docs/content/components/actions/`, `/forms/`, etc. as thin index pages that each link into the real component pages under `/docs/components/atoms/button` etc.** Reuse the symlink approach from Task 6 if that's the shape you took.

Group the 52 components as follows. Refer to the Storybook seeding PR commit messages as the authoritative batch-to-group mapping (#103: Forms / Display / Feedback / Overlays / Navigation / Data / Layout):

- **Actions**: Button, ButtonGroup
- **Forms**: Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Toggle, ToggleGroup, InputOTP, InputGroup, Field, Label, Combobox
- **Display**: Avatar, Badge, Card, Separator, Skeleton, Spinner, Progress, Typography, Brand, BrandExpress, Kbd, Item, Empty, Direction, FilterButton
- **Feedback**: Alert, Sonner, Tooltip, HoverCard
- **Overlays**: Dialog, Sheet, Drawer, Popover, AlertDialog, DropdownMenu
- **Navigation**: Breadcrumb, Pagination, Tabs, NavigationMenu, Sidebar, Command
- **Data**: Table, Chart
- **Filtering**: FilterButton, FilterToolbar, RangeFilter (FilterButton appears in both Display and Filtering — acceptable)
- **Layout**: AppShell, AspectRatio, ScrollArea, Collapsible, Accordion
- **PLP Kit**: (templates/plp/*)

- [ ] **Step 5: Components section landing + index**

Create `apps/docs/content/components/index.mdx`:
```mdx
---
title: Components
---

52 components, organised by the job they do. Actions, forms, feedback,
overlays, navigation, data, filtering, layout, and the PLP kit. Every
component has props, usage guidelines, and do/don'ts — authored alongside
the code so they never drift.

See [Storybook ↗](<STORYBOOK_URL or "#">) for interactive demos with
controls and args.
```

Leave the Storybook link as `#` if Storybook isn't deployed yet — fill in before the demo.

- [ ] **Step 6: Patterns — meta + stubs + 1 real**

Create `apps/docs/content/patterns/meta.json`:
```json
{
  "title": "Patterns",
  "pages": ["index", "product-listing-page", "filter-composition", "empty-states", "loading-states"]
}
```

Create stub pages for filter-composition, empty-states, loading-states (2-3 sentences each).

Create `apps/docs/content/patterns/product-listing-page.mdx` — real. Pull from the PLP work (see `docs/plans/specs/` and `packages/components/CHANGELOG.md` entries for April 16–22). 3–5 paragraphs covering: why PLP is a kit not a template, how to assemble PlpHeading/Grid/List/Row, where the filter subsystem plugs in, the grid/list view toggle pattern, empty/skeleton states. Link out to each constituent component.

Create `apps/docs/content/patterns/index.mdx` — section landing, 2-3 sentences positioning Patterns as "components in collaboration."

- [ ] **Step 7: Content — meta + 3 stubs**

Create `apps/docs/content/content/meta.json`:
```json
{
  "title": "Content",
  "pages": ["index", "voice-and-tone", "writing-for-ui", "terminology"]
}
```

Create index + 3 stubs. For voice and tone, reference `/Users/nivodatest/Documents/PROJECTS/nivoda/repos/brand-system/voice-and-tone.md` in the stub's "where to look now" sentence.

- [ ] **Step 8: Brand — meta + 2 real + 1 stub**

Create `apps/docs/content/brand/meta.json`:
```json
{
  "title": "Brand",
  "pages": ["index", "logo", "brand-expression", "illustration"]
}
```

Create `apps/docs/content/brand/logo.mdx` — show the wordmark and icon variants. Reference the Brand atom component. Can be mostly markdown in PR 1 (image tags or links to the atom's docs page); live `<Brand />` rendering is PR 2 territory.

Copy brand assets from the brand-system repo into `apps/docs/public/brand/`:
```bash
mkdir -p apps/docs/public/brand
cp /Users/nivodatest/Documents/PROJECTS/nivoda/repos/brand-system/logos/*.svg apps/docs/public/brand/
```

Reference them in `logo.mdx` via `<img src="/brand/wordmark-white.svg" />` etc.

Create `apps/docs/content/brand/brand-expression.mdx` — wraps the BrandExpress atom. Pull positioning from `brand-system/visual-identity.md` (§"Brand direction": "luxury dark theme, warm human photography, serif typography for display").

Create `illustration.mdx` as stub.

- [ ] **Step 9: Resources — wire real content from repo root**

Extend `apps/docs/source.config.ts` to add a third collection pointing at repo-root markdown:
```ts
export const resources = defineDocs({
  dir: "../..",
  include: ["ROADMAP.md", "VISION.md", "CHANGELOG.md"],
  // Reuse permissive schema
});
```
(If cross-package globs didn't work in Task 6 and you took Strategy B — symlinks — extend that too: symlink each repo-root md into `apps/docs/content/resources/`.)

Create `apps/docs/content/resources/meta.json`:
```json
{
  "title": "Resources",
  "pages": ["index", "roadmap", "vision", "architecture", "adrs", "changelog", "contributing"]
}
```

For the pages:
- `roadmap.mdx` — just renders `ROADMAP.md` (via the `resources` collection — Fumadocs can pull in external markdown sources, or use a re-export pattern if not)
- `vision.mdx` — renders `VISION.md`
- `architecture.mdx` — links/renders `docs/architecture/architecture.md` (already covered by the `guides` collection from Task 6; can just be a redirect or a short wrapper)
- `adrs.mdx` — short intro + links to the five ADRs (ADR-001 through ADR-005), each as an anchor link into architecture.mdx
- `changelog.mdx` — renders `CHANGELOG.md`
- `contributing.mdx` — stub

- [ ] **Step 10: Get started**

Create `apps/docs/content/get-started.mdx` (or `apps/docs/content/index.mdx` if that's where Fumadocs expects it):
```mdx
---
title: Get started
---

Clarity V2 is Nivoda's design system. Tokens, components, patterns, and
governance — all in one repo, all browsable here.

## For engineers

Install the components package and import tokens CSS:

\`\`\`bash
npm install @nivoda/components @nivoda/tokens
\`\`\`

\`\`\`tsx
import "@nivoda/components/styles.css";
import { Button } from "@nivoda/components";
\`\`\`

## For designers and PMs

Every component is documented with usage guidelines and do/don'ts.
Browse [Components](/docs/components) for the library,
[Foundations](/docs/foundations) for tokens and type,
[Patterns](/docs/patterns) for higher-order compositions.

For interactive component demos with controls and args, see
[Storybook ↗](<STORYBOOK_URL or "#">).

## The principle

Documentation lives in the repo. Edit a `COMPONENT.md`, push, and this
site rebuilds on every commit. No sync, no drift, no separate CMS.
```

- [ ] **Step 11: Build + verify the full IA**

Run: `npx nx build @nivoda/docs` — expected: clean build
Run: `npx nx dev @nivoda/docs` — visit:
- `/` — Get started page
- `/docs/foundations` — 7 pages in sidebar (tokens, color, typography real; spacing/elevation/motion stubs)
- `/docs/components` — functional groups visible
- `/docs/components/actions/button` (or whatever path Strategy A/B produced) — Button real content
- `/docs/patterns/product-listing-page` — real content
- `/docs/resources/roadmap` — renders ROADMAP.md
- `/docs/resources/changelog` — renders CHANGELOG.md
- Search bar — type "button", see results across components

Kill the server.

- [ ] **Step 12: Commit**

```bash
git add apps/docs apps/docs/public package-lock.json
git commit -m "feat(docs): 7-section IA with functional component grouping

Sidebar: Get started / Foundations / Components / Patterns / Content /
Brand / Resources. Components regrouped functionally (Actions, Forms,
Display, Feedback, Overlays, Navigation, Data, Filtering, Layout, PLP)
rather than atomically — matches how consumers search.

Stubs use 2-3 sentence teasers + status: not-yet-written. Real pages
in Foundations (Typography), Patterns (PLP), Brand (Logo, Expression),
and all of Resources pulling existing repo markdown (ROADMAP, VISION,
architecture, ADRs, CHANGELOG).

Brand assets copied from brand-system repo (logos only; photography
and illustration deferred)."
```

---

## Task 8: Landing page, branding, and README

**Why:** Default Fumadocs chrome says "docs framework." The leadership demo needs "Nivoda design system" — dark-first theme, Nivoda wordmark in the nav, restrained violet accent, an actual hero. Scope is deliberately small: the visible surfaces for the demo, nothing more.

**Brand rules (from `/Users/nivodatest/Documents/PROJECTS/nivoda/repos/brand-system/visual-identity.md`):**
- **Dark-first** — default theme is dark, soft black `#0c0a09` (not true black)
- **Violet is reserved** — use for CTAs and precious moments, never chrome
- **Brand name**: violet (not purple), stone (not grey)
- Wordmark white on dark, black on light — we're dark-first so use white

**Files:**
- Modify: `apps/docs/app/layout.tsx` — set default theme to dark, inject brand
- Modify: `apps/docs/app/(home)/page.tsx` — replace with hero landing
- Modify: `apps/docs/app/global.css` — brand accent tokens, soft-black background
- Create: `apps/docs/app/layout.config.tsx` (Fumadocs convention) — nav logo + brand
- Create: `apps/docs/README.md`
- Create: `apps/docs/public/brand/favicon.svg` — use `icon-white.svg` or derive

- [ ] **Step 1: Copy favicon and logo into public/**

(Covered by Task 7 Step 8 if you did it there. If not:)
```bash
mkdir -p apps/docs/public/brand
cp /Users/nivodatest/Documents/PROJECTS/nivoda/repos/brand-system/logos/*.svg apps/docs/public/brand/
cp apps/docs/public/brand/icon-white.svg apps/docs/public/favicon.svg
```

- [ ] **Step 2: Set Fumadocs theme to dark-first**

Locate Fumadocs' RootProvider in `apps/docs/app/layout.tsx`. Set the default theme:
```tsx
<RootProvider
  theme={{
    defaultTheme: "dark",
    enableSystem: false, // force dark as brand default; user can still toggle
  }}
>
```

(API may differ — check `node_modules/fumadocs-ui/dist/provider.d.ts`. The intent is dark as default, not system-based.)

- [ ] **Step 3: Override theme CSS variables for brand**

In `apps/docs/app/global.css`, after the `@import "@nivoda/components/styles.css"` line, add:

```css
:root, .dark {
  /* Fumadocs theme override — soft black, not true black */
  --background: #0c0a09;
  --fd-background: #0c0a09;
  /* Violet accent — restrained; used only for links, focus rings, CTAs */
  --fd-primary: oklch(from var(--color-primitive-violet-500) l c h);
}
```

The exact Fumadocs var names depend on the installed version. Inspect `node_modules/fumadocs-ui/dist/global.css` to find the variables Fumadocs actually consumes. Override those, not guessed names.

**Restraint check:** don't tint the sidebar, cards, or large surfaces with violet. The brand rule is "violet is precious" — keep it on links/focus/CTA only.

- [ ] **Step 4: Configure nav logo**

Fumadocs typically uses a `layout.config.tsx` or `baseOptions` object to declare nav. Add:
```tsx
import Image from "next/image";

export const baseOptions = {
  nav: {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Image src="/brand/wordmark-white.svg" alt="Nivoda" width={96} height={24} priority />
        <span style={{ opacity: 0.5, fontSize: "0.875rem" }}>/ Clarity V2</span>
      </div>
    ),
  },
  // Other options preserved from scaffolder
};
```

(Again, exact shape depends on installed Fumadocs — this is the intent.)

- [ ] **Step 5: Build the hero landing page**

Rewrite `apps/docs/app/(home)/page.tsx` as a hero + 3 value props + CTAs. Keep it to inline Tailwind, no new components. Dark-first, violet reserved for the primary CTA only:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-serif tracking-tight">Clarity V2</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Nivoda's design system. Tokens, components, patterns, and guidance —
          one browsable source, authored alongside the code.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/docs/get-started"
            className="px-6 py-3 rounded-md bg-[oklch(var(--color-primitive-violet-500))] text-white font-medium hover:opacity-90"
          >
            Get started
          </a>
          <a
            href="/docs/components"
            className="px-6 py-3 rounded-md border border-white/20 hover:bg-white/5"
          >
            Browse components
          </a>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
        <div>
          <h3 className="font-semibold mb-2">Tokens first</h3>
          <p className="text-sm text-muted-foreground">
            OKLCH color, 4px spacing, 12 type roles. Every visual decision is
            a token — nothing is hardcoded.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Components, documented</h3>
          <p className="text-sm text-muted-foreground">
            52 components built on shadcn/ui + Radix, each with usage
            guidelines, props, and do/don'ts authored alongside the code.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Self-publishing</h3>
          <p className="text-sm text-muted-foreground">
            Markdown in the repo is the source. Every push rebuilds the site.
            No sync, no drift, no separate CMS.
          </p>
        </div>
      </section>
    </main>
  );
}
```

Exact class names depend on whether Fumadocs' Tailwind config exposes `text-muted-foreground`, `bg-background`, etc. Check before committing.

- [ ] **Step 6: Write apps/docs/README.md**

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

- **Get started** — onboarding for engineers and designers
- **Foundations** — tokens, color, typography, spacing, elevation, motion
- **Components** — 52 components across Actions, Forms, Display, Feedback, Overlays, Navigation, Data, Filtering, Layout, and the PLP kit. Sourced from `packages/components/src/components/**/COMPONENT.md`
- **Patterns** — higher-order compositions (PLP, filter composition, empty/loading states)
- **Content** — voice, writing, terminology (stubs)
- **Brand** — logo and brand expression, sourced from the brand-system repo
- **Resources** — ROADMAP, VISION, architecture, ADRs, CHANGELOG — rendered from existing repo markdown

Edit any source file, push, and the site rebuilds on the next deploy.

## Deployment

Deployed to Vercel on push. Behind access protection until further notice.
```

- [ ] **Step 7: Smoke-test**

Run: `npx nx build @nivoda/docs` — expected: clean build, no missing asset errors
Run: `npx nx dev @nivoda/docs` — visit `/`:
- Dark theme is default (not system-based)
- Nivoda wordmark visible in nav, top-left
- Hero renders with serif display heading
- Primary CTA is violet; secondary is neutral outline
- Background is soft black (not pure `#000`)
- Sidebar shows all 7 sections from Task 7
- Favicon visible in browser tab

- [ ] **Step 8: Commit**

```bash
git add apps/docs package-lock.json
git commit -m "feat(docs): demo-ready landing, dark-first theme, Nivoda branding

Dark as default (brand direction: luxury dark theme, soft black #0c0a09
not true black). Violet reserved for primary CTA and focus — never chrome.
Nivoda wordmark in nav, favicon set.

Hero: serif display heading, three value props (tokens first, documented
components, self-publishing). Mirrors the brand-system positioning and
matches what leadership will see in the demo."
```

---

## Task 9: Vercel deployment (access-protected)

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

## Task 10: Update ROADMAP.md + open PR

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
| Vercel build can't resolve workspace deps | Medium | Task 9 sets Vercel's Root Directory to repo root, Build Command `npx nx build @nivoda/docs`, Output Directory `apps/docs/.next`. If deps still unresolved, force explicit workspace install: `npm install --workspaces`. |
| Minivoda PR (Joao's `origin/feat/minivoda-migration`) merges first and conflicts with root `package.json`/`package-lock.json` | Medium | Expected. Rebase `feat/docs-fumadocs` onto `dev` after merge. Check: if Joao's PR already added `apps/*` to `workspaces` (unlikely, his branch puts Minivoda in `packages/test-app/`), Task 1 Steps 1 and 3 become no-ops. If he added a different glob, merge both. `package-lock.json` regenerates via `npm install`. |
| ESLint not configured for `apps/docs` | Low | Scaffolder may or may not set up ESLint. Acceptable to ship without in PR 1 — `nx affected --target=lint` will silently skip. Flag in PR description as explicit deferral, address in PR 2. |
| Functional-grouping sidebar requires cross-directory `meta.json` references, which Fumadocs-MDX may reject | Medium | Task 7 Step 1 verifies first. Strategy A (cross-directory pages in meta.json) is preferred; Strategy B (symlink functional layout into `content/components/actions/*` etc.) is the fallback. Both produce identical rendered output. |
| Brand CSS variable overrides miss the actual Fumadocs var names | Low-Medium | Task 8 Step 3 tells the executor to inspect `node_modules/fumadocs-ui/dist/global.css` rather than guessing var names. If overrides don't land, the default Fumadocs theme is acceptable for the demo — violet primary CTA via inline Tailwind on the hero is the load-bearing piece. |
| Demo asset gaps (Storybook link stub, missing image credits) | Low | The `Storybook ↗` link in `get-started.mdx` and the components section landing need a real URL before the demo. Task 7 Step 5 flags this; confirm Storybook deploy status before the presentation. |
| Fumadocs-MDX API has shifted from what's written in Task 6 | Medium | Task 6 explicitly tells the executor to check the installed version's actual API and adapt. The *intent* is captured; the exact call signature is not load-bearing. |

---

## Out of scope for this plan (PR 2 or later)

- **Live MDX component demos** (`<ComponentPreview name="button" />` etc.) — biggest follow-up; Storybook is the live-demo surface in this cycle
- **Live visual samples on Foundation pages** — Color swatches rendered from tokens, Typography samples of the 12 role presets. Stubs for PR 1; beautiful foundation pages in a follow-up.
- **Storybook iframe embeds** in component docs pages — not recommended pattern; keep Fumadocs and Storybook separate with a link-out
- **Real brand content** — voice and tone, writing for UI, terminology, illustration. Stubs in PR 1; real in a follow-up with input from the brand-system repo
- **Experience Framework cross-repo content** (`../experience-framework/`)
- **Real ADR pages** — PR 1 has one "ADRs" page linking to anchors in architecture.md. Splitting into five ADR-xxx pages is deferred.
- **Auto-extracted prop tables** from TypeScript types (react-docgen or similar). PR 1 uses hand-written tables in COMPONENT.md.
- **Search result tuning / custom search UI** — default Fumadocs search is fine for the demo
- **Onboarding material, prompt patterns, worked self-service examples**
- **Public access** (removing the Vercel gate) — decided during Distribution-complete
- **Analytics / feedback widgets**
- **Custom typography** (e.g. serif display font for headings beyond Fumadocs default) — nice-to-have, deferred
- **ESLint configuration** for `apps/docs` — acceptable to ship without; flag as deferred in PR description

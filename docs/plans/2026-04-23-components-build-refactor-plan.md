# `@nivoda/components` Build Refactor — Implementation Plan

**Date:** 2026-04-23
**Status:** Proposal — awaiting ratification from Chris before execution.

**Goal:** Ship `@nivoda/components` in a shape that behaves correctly for any real-world consumer — pure React apps, React Server Component frameworks (Next.js App Router, Remix v2), and any CSS pipeline that imports the theme. Replace the current monolithic Vite `lib` bundle with a per-file library build, preserve per-component `"use client"` boundaries, externalise runtime dependencies, and split CSS into a truly portable theme fragment plus a Storybook-local entry.

**Motivation:** Test-app (Minivoda) has become the first real consumer of the components package, and its migration surfaced three real library-build bugs:

1. The Vite `lib` build concatenates every component into a single `dist/index.js`, stripping per-file `"use client"` directives. RSC consumers either error on server-component imports or are forced to ship the whole bundle as client-side JS. We unblocked test-app by slapping a global `"use client";` banner on the bundle — a workaround that makes every component a client component, including static primitives that should render server-only with zero JS.
2. Only four runtime deps are externalised (`react`, `react-dom`, `react/jsx-runtime`, `@radix-ui/react-slot`). Everything else — `radix-ui`, `@base-ui/react`, `recharts`, `sonner`, `cmdk` — is inlined. Consumers who also use any of these get double-bundled copies, which for context-provider libraries like Radix causes runtime bugs (two contexts, state doesn't flow).
3. `dist/*.d.ts` leaked `@/` path aliases into consumers, making `Pick<ComponentProps<typeof Button>, …>` resolve to `Pick<any, …>` and breaking typecheck with "variant/size are required" errors. Patched with `tsc-alias` — that part of the fix is correct and stays.

Additionally, the current library bundles its own Tailwind-generated utility CSS (`dist/index.css`). That means consumers only get the utilities the library happened to use internally — `<div className="p-24 bg-success/20">` in consumer code silently doesn't style, because those utilities were never generated. The theme is supposed to enable one-off styling with library tokens; the current packaging prevents it.

**Scope:**
- **In:** `packages/components/vite.config.ts`, `packages/components/project.json`, `packages/components/package.json`, `packages/components/src/styles/`, `packages/components/src/index.ts`, `packages/components/.storybook/` (preview entrypoint if it imports CSS). New devDep: `rollup-preserve-directives`, `glob`. Test-app consumer setup: `packages/test-app/app/globals.css` (recreate), `packages/test-app/app/layout.tsx`, `packages/test-app/package.json` (scripts).
- **Out:** Component source files (no props/API changes). ADRs. Token values. Storybook content or stories. The two-file CSS split is a build/packaging change, not a design change.

**Tech Stack:** Vite 6, Rollup, Tailwind v4, `@tailwindcss/vite`, `@tailwindcss/postcss`, `rollup-preserve-directives`, `tsc-alias`, TypeScript, Next.js 16.

---

## Ground rules

- No component source changes. If a component needs editing for the build to work, stop and flag.
- No token value changes. `oklch(…)` values stay identical between old and new `theme.css`.
- No `"use client"` additions or removals in source. The library build preserves what's already there, not inventing new boundaries.
- Each task ends in a typecheck pass (`npx nx build components` for library tasks, `npm run typecheck` inside test-app for test-app tasks).
- Each task is a single focused commit.
- Hacks introduced in the April 2026 test-app migration are removed only after their replacement is in place — never leaving `main` in a broken state.

---

## Prerequisites

- [ ] **Confirm decision on Minivoda font strategy.** Library default (drop next/font) vs. next/font override (keep Inter + Geist Mono, rely on `@theme inline` override path). Default recommendation: drop next/font — simpler, and test-app's role is to exercise the library as-is.

---

## Task 1: CSS split — create `theme.css`, rework `globals.css`

**Purpose:** Separate the library's consumer-facing theme fragment from its Storybook-local Tailwind entrypoint. Make `theme.css` truly portable: works in Tailwind v4 consumers (full fidelity), non-Tailwind bundled consumers (tokens + dark mode + base resets), and `<link>`-tag consumers (tokens only, fonts and animations fail gracefully).

**Files:**
- New: `packages/components/src/styles/theme.css`
- Rewrite: `packages/components/src/styles/globals.css`
- Edit: `packages/components/src/index.ts` (remove side-effect CSS import)

**Steps:**

- [ ] **Step 1: Author `src/styles/theme.css`** with the structure specified in the "true portability" design:
  - Header comment explaining what the file is, the three consumer tiers, and the critical role of `@theme inline`'s `var(--…)` references for override compatibility.
  - `@import "@fontsource-variable/inter";` and `@import "tw-animate-css";` at the top.
  - `@custom-variant dark (&:is(.dark *));`
  - `:root { … }` and `.dark { … }` with the exact token values currently in `globals.css`. Include `--font-sans: "Inter Variable", sans-serif` in `:root`.
  - `@theme inline { … }` mapping every semantic token to `var(--…)`, not literal values. Include `--font-sans: var(--font-sans);` — this is the override-preserving form.
  - `@layer base { … }` with plain-CSS resets (`border-color: var(--border)`, `color-mix(in oklch, var(--ring) 50%, transparent)`, `background: var(--background)`, `color: var(--foreground)`, `font-family: var(--font-sans)`). No `@apply`.

- [ ] **Step 2: Rewrite `src/styles/globals.css`** to exactly:
  ```css
  @import "tailwindcss";
  @import "./theme.css";
  ```
  No other content. Add a short comment noting it is Storybook + vitest-only and real consumers should use `@nivoda/components/theme.css` instead.

- [ ] **Step 3: Remove the top-line CSS side-effect import** from `src/index.ts`:
  ```ts
  import "./styles/globals.css";  // ← DELETE
  ```
  The library's JS build no longer emits CSS; this import served only to force Vite to compile CSS into the lib bundle.

- [ ] **Step 4: Storybook sanity check.** Run `npx storybook dev -p 6006`. Every story should render visually identically to pre-refactor. Dark mode toggle still works. Open a few representative stories (Button, Dialog, Typography, Badge) and eyeball. No console errors.

- [ ] **Step 5: Commit.** `feat(components): split theme.css out of globals.css for portable consumer CSS`

## Task 2: Library build — per-file output + preserved directives + externalised deps

**Purpose:** Replace the monolithic Vite `lib` bundle with per-file output so consumers' bundlers can tree-shake individual components and RSC bundlers can honour per-file `"use client"` directives. Remove the `"use client";` banner hack.

**Files:**
- Edit: `packages/components/vite.config.ts`
- Edit: `packages/components/package.json` (add `rollup-preserve-directives`, `glob` to devDeps)

**Steps:**

- [ ] **Step 1: Add devDeps.**
  ```
  npm install --save-dev --workspace=@nivoda/components rollup-preserve-directives glob
  ```

- [ ] **Step 2: Rewrite `vite.config.ts`:**
  ```ts
  import { defineConfig } from "vite";
  import { resolve } from "path";
  import { glob } from "glob";
  import preserveDirectives from "rollup-preserve-directives";

  export default defineConfig({
    plugins: [preserveDirectives()],
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
    build: {
      lib: {
        entry: glob.sync("src/**/*.{ts,tsx}", {
          cwd: __dirname,
          ignore: [
            "src/**/*.stories.tsx",
            "src/**/*.test.tsx",
            "src/**/__stories__/**",
            "src/**/*.d.ts",
          ],
        }),
        formats: ["es"],
      },
      rollupOptions: {
        external: [
          "react", "react-dom", "react/jsx-runtime",
          "radix-ui", "@radix-ui/react-slot", "@base-ui/react",
          "class-variance-authority", "clsx", "tailwind-merge",
          "cmdk", "sonner", "vaul", "recharts", "embla-carousel-react",
          "input-otp", "next-themes", "lucide-react", "@tabler/icons-react",
          "tw-animate-css", "@fontsource-variable/inter",
        ],
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].js",
        },
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  });
  ```

  Notes:
  - `@tailwindcss/vite` plugin is gone. The library build no longer processes CSS.
  - `banner: '"use client";'` is gone. `preserveDirectives()` handles it per-file.
  - `cssCodeSplit` removed — moot, no CSS being emitted.

- [ ] **Step 3: Copy `theme.css` into `dist/`.** The library build no longer processes CSS, so `theme.css` needs to be copied verbatim. Simplest approach: add a `copy` step to the Nx build command. In `packages/components/project.json`:
  ```jsonc
  "command": "npx vite build && cp src/styles/theme.css dist/theme.css && npx tsc --project tsconfig.lib.json && npx tsc-alias --project tsconfig.lib.json"
  ```
  (If someone objects to `cp` in the command, replace with a minimal Vite plugin. Either works; `cp` is simpler.)

- [ ] **Step 4: Build and inspect `dist/`.**
  ```
  npx nx build components --skip-nx-cache
  ```
  Expected structure:
  ```
  dist/
    index.js
    index.d.ts
    theme.css
    components/atoms/badge/badge.js       ← no "use client"
    components/atoms/badge/badge.d.ts
    components/molecules/dialog/dialog.js ← "use client"; at top
    components/molecules/dialog/dialog.d.ts
    …
  ```
  Verification greps:
  ```
  head -1 dist/components/atoms/badge/badge.js              # expect something other than "use client"
  head -1 dist/components/molecules/dialog/dialog.js        # expect: "use client";
  head -1 dist/components/molecules/sheet/sheet.js          # expect: "use client";
  head -1 dist/components/atoms/typography/typography.js    # expect NOT "use client"
  grep -l '^"use client";' dist/components -r              # confirm only interactive components have it
  grep '"@/' dist/components -r                             # expect empty (tsc-alias ran)
  ls dist/theme.css                                         # exists
  ```
  If any interactive component (Dialog, Sheet, DropdownMenu, Tooltip, Popover, Select, Tabs, Accordion, AlertDialog, Carousel, Command, DropdownMenu, HoverCard, NavigationMenu, Sidebar, Drawer, Combobox) is missing `"use client";`, stop and diagnose — likely a `rollup-preserve-directives` config issue or a missing directive at source.

- [ ] **Step 5: Commit.** `refactor(components): per-file library build with preserved use-client directives`

## Task 3: `package.json` restructure

**Purpose:** Correct `exports` for the new per-file dist. Move runtime deps to `peerDependencies` so consumers' bundlers dedup. Keep only self-contained utilities in `dependencies`.

**Files:**
- Edit: `packages/components/package.json`

**Steps:**

- [ ] **Step 1: Replace the `exports` map** with:
  ```jsonc
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./theme.css": "./dist/theme.css",
    "./*": {
      "types": "./dist/*.d.ts",
      "default": "./dist/*.js"
    }
  }
  ```
  Note: `"./styles.css"` is gone. It's `"./theme.css"` now. The `./*` wildcard supports deep imports like `@nivoda/components/components/atoms/button/button` for consumers who want maximum tree-shaking determinism.

- [ ] **Step 2: Classify deps.** Move to `peerDependencies`:
  - `react`, `react-dom`
  - `radix-ui`, `@radix-ui/react-slot`
  - `@base-ui/react`
  - `lucide-react`, `@tabler/icons-react`
  - `next-themes`

  Keep in `dependencies`:
  - `tw-animate-css` (CSS utility imported from `theme.css`)
  - `@fontsource-variable/inter` (fonts imported from `theme.css`)
  - `class-variance-authority`, `clsx`, `tailwind-merge` (small internal utils, version-duplication-safe)
  - `cmdk`, `sonner`, `vaul`, `embla-carousel-react`, `input-otp`, `recharts` (component-specific runtime, unlikely to collide with consumer's own; can be moved to peers later if a consumer reports a dup issue)

- [ ] **Step 3: Add `peerDependenciesMeta`** to mark optional peers where the dependency is only needed if the consumer uses a specific component:
  ```jsonc
  "peerDependenciesMeta": {
    "recharts": { "optional": true }
  }
  ```
  (Currently only `recharts` is realistically optional — the Chart component is commented-out in the barrel. As more components are promoted, revisit.)

- [ ] **Step 4: Verify `files`, `sideEffects`.**
  - `"files": ["dist"]` — already correct.
  - `"sideEffects": ["**/*.css"]` — already correct. Prevents bundlers from tree-shaking the CSS import when a consumer does `import "@nivoda/components/theme.css"`.

- [ ] **Step 5: `npm install` from repo root** to relink the workspace with the new peer-dep layout. Inspect `packages/test-app/node_modules/` briefly to ensure Radix, etc. still resolve (they come from test-app's own deps; if test-app doesn't declare `radix-ui`, it must now — see Task 5).

- [ ] **Step 6: Rebuild components.** `npx nx build components --skip-nx-cache`. Should pass.

- [ ] **Step 7: Commit.** `chore(components): correct exports map and peer-dep classification`

## Task 4: Remove the `"use client";` banner hack from vite.config.ts

**Purpose:** Clean up the hack introduced during April 2026 test-app migration. Task 2 may have already removed it; this task is the explicit confirmation pass.

**Files:**
- `packages/components/vite.config.ts` (confirm `rollupOptions.output.banner` is gone)

**Steps:**

- [ ] **Step 1: Grep for the banner.**
  ```
  grep -n "use client" packages/components/vite.config.ts
  ```
  Expect no matches. If any match exists, remove.

- [ ] **Step 2: Confirm Task 2's output is clean.** `head -1 dist/index.js` should be a normal JS line (import, const, or similar) — not `"use client";`. Per-file directives handle the boundary correctly; a blanket top-of-index directive would once again force every consumer to treat the barrel as fully client-side.

- [ ] **Step 3: No commit needed if Task 2 did it.** Otherwise, commit: `revert(components): drop use-client banner hack, superseded by per-file preservation`

## Task 5: Test-app consumer setup

**Purpose:** Reinstate test-app's local Tailwind setup, consuming `@nivoda/components/theme.css` rather than the deleted `./styles.css`. Configure `@source` so test-app's Tailwind scans the library's `dist/` for class names. Decide font strategy.

**Files:**
- Recreate: `packages/test-app/app/globals.css`
- Edit: `packages/test-app/app/layout.tsx`
- Possibly edit: `packages/test-app/package.json` (add direct peer deps)

**Steps:**

- [ ] **Step 1: Recreate `app/globals.css`:**
  ```css
  @import "tailwindcss";
  @import "@nivoda/components/theme.css";
  @source "../node_modules/@nivoda/components/dist";
  ```
  Verify the `@source` path resolves correctly. In this monorepo with hoisted `node_modules`, the actual location is `<repo-root>/node_modules/@nivoda/components/dist` — adjust the relative path if needed. If ambiguous, `@source` accepts absolute paths via `@source "/abs/path/…"` but relative-to-css-file is standard; test in a real build.

- [ ] **Step 2: Update `app/layout.tsx`.** Replace:
  ```tsx
  import "@nivoda/components/styles.css";
  ```
  with:
  ```tsx
  import "./globals.css";
  ```

- [ ] **Step 3: Font decision.** Based on the prerequisite decision:
  - **If library default:** no action. `theme.css` loads Inter Variable via `@fontsource-variable/inter`. Leave `layout.tsx` as-is (no `next/font`, no font class names on `<html>`). `font-sans` utility uses `var(--font-sans)` → falls back to library's `:root` default.
  - **If `next/font` override:** reinstate `Inter` + `Geist_Mono` imports from `next/font/google`. Set their `variable` to `--font-sans` and `--font-mono`. Apply the variable classes to `<html>`. The library's `@theme inline { --font-sans: var(--font-sans); }` emits `.font-sans { font-family: var(--font-sans); }`, so next/font's override on `<html>` wins cleanly.

- [ ] **Step 4: Check peer dep visibility.** Radix, `@base-ui/react`, and similar moved to `peerDependencies` in `packages/components`. Test-app's `package.json` already declares all of them directly (inherited from the original Minivoda), so no action required. Verify with `npm ls radix-ui` from `packages/test-app` — should resolve cleanly.

- [ ] **Step 5: Add build-before-dev scripts.** In `packages/test-app/package.json`:
  ```jsonc
  "scripts": {
    "dev": "npm run build -w @nivoda/components && next dev --turbopack",
    "build": "npm run build -w @nivoda/components && next build",
    …
  }
  ```
  (Alternative parallel-watch setup with `concurrently` deferred; keep this pass simple.)

- [ ] **Step 6: Run test-app typecheck and build.**
  ```
  cd packages/test-app
  npm run typecheck      # expect: pass
  npm run build          # expect: pass
  ```

- [ ] **Step 7: Commit.** `feat(test-app): consume @nivoda/components/theme.css with local Tailwind`

## Task 6: Verification matrix

**Purpose:** Empirically confirm the refactor behaves correctly across the two consumer classes we care about. Run after all prior tasks land, before closing out.

**Checks — library artefacts:**

- [ ] `dist/theme.css` exists and contains: one `@theme inline` block, `:root` + `.dark` token blocks, `@custom-variant dark`, `@layer base` with plain CSS. No generated utility classes like `.bg-primary` — if any are present, Task 1 regressed.
- [ ] `dist/components/atoms/badge/badge.js` first line is NOT `"use client";`.
- [ ] `dist/components/molecules/dialog/dialog.js` first line IS `"use client";`.
- [ ] Every file under `dist/components/molecules/` containing hook usage has `"use client";` at top. Spot check 5+ files.
- [ ] `grep -r '"@/' dist --include="*.d.ts"` returns no matches.
- [ ] `dist/` contains no stray `.css` files besides `theme.css`.
- [ ] Bundle size: `dist/index.js` should drop significantly from the current ~1.2 MB (externalising runtime deps removes the bulk of it; expect under 200 KB).

**Checks — test-app behaviour:**

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Write `<div className="p-24 bg-success/20 hover:ring-4 ring-primary">` into any test-app page. Start dev server. The element should render with those utilities applied. Proves consumer-side Tailwind generates utilities against library tokens.
- [ ] Open a page that imports only `Badge` from a Server Component (e.g. a Server Component rendering `<Badge>hello</Badge>` and nothing else). Check network tab: no JS for Badge should appear in the client bundle. `view-source:` should show the Badge markup inline. Proves per-file `"use client"` boundaries work.
- [ ] Open a page that uses `Dialog`. It should open, close, focus-trap, and animate correctly. Proves interactive components still work as Client Components.
- [ ] Dark mode toggle (`d` key) still flips the theme.
- [ ] Storybook (`npx nx run components:storybook`) loads, renders stories identically, no console errors.

**Checks — deeper portability (optional, recommended):**

- [ ] Smoke-test `theme.css` in a plain Vite + React app (no Next.js, no framework). Scaffold one, `@import "@nivoda/components/theme.css"` at entry, verify tokens resolve via `getComputedStyle(document.documentElement).getPropertyValue("--primary")`, verify `.dark` class flips the theme. Catches Tier 2 regressions.
- [ ] If above passes, add the three-line Tailwind setup (`@import "tailwindcss"; @import "@nivoda/components/theme.css"; @source "…"`) and verify `<div className="bg-primary">` renders styled. Catches Tier 1 regressions.

## Task 7: Documentation

**Purpose:** Update `packages/components/CONTRIBUTING.md` and any consumer-facing docs so future consumers (including Minivoda contributors and the platform repo when it adopts) have a correct setup reference.

**Files:**
- `packages/components/CONTRIBUTING.md`
- Possibly new: `packages/components/CONSUMING.md` (or a section in README.md) — short how-to for consumers.
- Possibly update: `docs/architecture/architecture.md` if it references `styles.css`.

**Steps:**

- [ ] **Step 1: Document consumer setup.** The three-line Tailwind CSS entry, the `@source` pattern, and the `@nivoda/components/theme.css` path. One paragraph per consumer class (pure React, Next.js App Router).
- [ ] **Step 2: Document the two-file CSS split internally.** `theme.css` is consumer-facing; `globals.css` is Storybook/test-only. Edit guidance: theme edits go in `theme.css`; Storybook-preview tweaks go in `globals.css`.
- [ ] **Step 3: Note the font override path.** `@theme inline { --font-sans: var(--font-sans); }` enables consumers to override fonts via inline-style on `<html>`. Don't remove the `inline` keyword.
- [ ] **Step 4: Commit.** `docs(components): document consumer setup after build refactor`

---

## Known risks

1. **`rollup-preserve-directives` and entry points.** The plugin preserves directives in imported chunks, but behaviour for entry files varies. If Task 2's build emits `dist/index.js` without `"use client";` as the first line but with directive-needing components incorrectly NOT marked, triage:
   - Entry points don't themselves need directives (index.ts has no hooks).
   - Each interactive component file, when emitted as its own chunk via `preserveModules`, should be treated as a pseudo-entry by the plugin. If it isn't, check the plugin version and switch to `rollup-plugin-preserve-directives` (alternative package with slightly different semantics) if needed.

2. **`@source` path resolution in Tailwind v4 monorepos.** Tailwind v4's `@source` directive resolves relative to the CSS file. In a hoisted-`node_modules` monorepo, `../node_modules/@nivoda/components/dist` vs. `../../node_modules/…` can differ from what the path appears to be. If utilities don't generate in test-app, inspect `packages/test-app/node_modules/@nivoda/components` (may not exist if hoisted) and adjust. Worst case, use an absolute path via environment variable or a pre-build step.

3. **Bundler treatment of `@import` in theme.css.** Most bundlers (Vite, webpack, Next.js) resolve `@import "@fontsource-variable/inter"` via node module resolution and correctly inline the CSS. Turbopack is newer; verify in test-app's dev and prod builds that fonts actually load. If Turbopack chokes, fall back to including the `@font-face` declarations inline in `theme.css` rather than `@import`ing the fontsource package.

4. **Peer-dep install warnings.** Moving things to `peerDependencies` without pinned version ranges can produce install-time warnings if consumer versions drift. Start with broad ranges (`"react": "^19.0.0"`, `"radix-ui": "^1.4.0"`) and tighten as incompatibilities emerge.

5. **`tw-animate-css` is Tailwind-only.** The animation utilities it provides require Tailwind to process its `@utility` directives. In Tier 2 (non-Tailwind) consumers, animations don't run — components render without motion. Not a regression, but worth documenting.

6. **Verification task visual drift.** Per-file output doesn't change visual behaviour, but externalising deps can reveal latent bugs if the library was incidentally relying on a specific version of, e.g., `@radix-ui/react-dialog`. Spot-check interactive components (Dialog, Sheet, DropdownMenu, Select, Tooltip, Popover) in test-app for functional regressions.

---

## Rollback plan

If any task after Task 2 reveals a blocker that can't be resolved in-flight:

1. **`git revert` the Task 2 commit.** The old monolithic build + `"use client";` banner is the known-working state as of 2026-04-23.
2. **Keep Task 1 (CSS split).** That change is independent and safe regardless — it only makes `theme.css` exist alongside the existing `globals.css`. If reverting, update `package.json` `exports` back to `"./styles.css"` pointing at the built CSS (which the old Vite build produced).
3. **Keep Task 5 reverted consistently** so test-app isn't trying to consume a path that doesn't exist.
4. File a follow-up plan documenting what blocked execution; triage separately.

---

## Sign-off checklist (for Chris)

Before starting execution, confirm:

- [ ] The `theme.css` design — `@theme inline` + `:root`/`.dark` + plain-CSS `@layer base` + `@fontsource` + `tw-animate-css` imports, `var(--…)` override-preserving form — is the intended shape.
- [ ] The consumer setup pattern — three-line `globals.css` in the consumer — is acceptable and will be documented in `CONTRIBUTING.md`.
- [ ] The `exports` map rename from `./styles.css` to `./theme.css` is acceptable. This is a breaking change for any consumer that already uses `./styles.css`, but there are none — test-app is the only consumer and is migrating in lockstep.
- [ ] The `dependencies` → `peerDependencies` move is acceptable and the `peerDependenciesMeta` decisions are correct.
- [ ] The default font strategy is confirmed: library default (`@fontsource-variable/inter`) or next/font override in test-app.
- [ ] Per-file output + preserved directives is the intended library shape going forward, including its effect on consumers: they now tree-shake per-component and honour per-component `"use client"` boundaries. No objections to this becoming the library's published contract.

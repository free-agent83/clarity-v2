# Changelog

Cross-cutting changes affecting the monorepo as a whole. Newest entries first.

For per-package changes, see each package's own `CHANGELOG.md`.

Pre-1.0 entries are grouped by date; post-1.0 will switch to release-version subheadings. Format and rules: see [`CONTRIBUTING.md`](./CONTRIBUTING.md#changelog).

---

## 2026-04-30

- Introduced `staging` as a third trunk branch between `dev` and `main`. Defines stability contracts, merge triggers (design leadership judgment), staging-fix path, and hotfix path in `CONTRIBUTING.md` and `CLAUDE.md` (`ab740b7`).



- **M0 — Hygiene, conventions, and consolidation** closed. Installed Angular Conventional Commits + the `dev`/`main` flow, pre-1.0 versioning, by-date changelog format, and the agent commit-cadence rule in a new root `CONTRIBUTING.md`. Scrubbed all cross-repo references, the deleted-`VISION.md` design-triad metaphor, and the `Phase A/B/C/D` framing from agent-first markdown; deleted root `ROADMAP.md`. Aligned all package versions to `0.0.1` and renamed test-app to `@nivoda/test-app`. Merged the in-flight `claude/festive-beaver-0e136c` branch and pruned it (`c30630d`).
- Created root [`CONTRIBUTING.md`](./CONTRIBUTING.md) — single source for branching (Angular Conventional Commits, off `dev`, merge commits, no squash), versioning (0.0.1 pre-1.0; independent semver post-1.0), changelog (date subheadings pre-1.0), ADR format, and PR etiquette (`2e97d0c`).
- Agent-first markdown scrubbed: deleted root `ROADMAP.md`; removed cross-repo references and the design-triad / "Law branch" / "Flow surface" framing from every `CLAUDE.md`; dropped broken `VISION.md` links (`2c2a57f`, `9dee241`, `17bcbc5`, `b531283`, `5fcc227`).
- Aligned every `package.json` version to `0.0.1` and renamed `minivoda-digital-twin` → `@nivoda/test-app` to fit the `@nivoda/*` scope (`a385834`, `7b39eb0`).
- Stripped overlapping branching/versioning/PR sections from the existing package `CONTRIBUTING.md` files; added a stub for `packages/test-app` (`128ef7e`, `c8e3143`, `e2a1775`).
- Linked root `CONTRIBUTING.md` from root `CLAUDE.md` so agents see the commit-as-you-go cadence on first orient (`e92ca0a`).
- Temporarily relaxed the `PreToolUse` hook on `packages/tokens/CONTRIBUTING.md` to allow audit-driven edits during M0; restoration tracked as a roadmap task (`6ce42b1`).

## 2026-04-23

- Minivoda's six PLP pages adopt the `FilterToolbar` organism from `@nivoda/components`. Each page ships a colocated `filters.tsx` controller; a shared `usePlpFilterController` hook drives the drawer + URL-as-source-of-truth flow.
- DB-backed filtering wired for five of six PLPs (engagement rings deferred). Carat filters become range sliders; sort values aligned to DB shape (`price_asc`, `carat_desc`, etc.).
- `LayoutPlp` reshaped: accepts a `toolbar?: ReactNode`; legacy `quickFilters` / `sortOptions` props removed.

## 2026-04-10

- Removed the shadcn-specific layer from `@nivoda/tokens` — surface-specific theme mapping is a consumer concern, not a foundation one. Deleted `src/shadcn/`, `buildShadcnCSS()`, the `./shadcn` subpath export, and the `dist/shadcn/tokens.css` output.

## 2026-04-08

- Token alignment with platform: 15 decisions applied. `purple` → `violet`; palette values updated to production; missing tiers added (red 800–950, amber 200–400 + 800–950, green 800–950, blue 50–950). Dropped MUI legacy palettes (orange, grey, blue_grey).

## 2026-04-07

- Phase 1 token alignment: replaced Style Dictionary v5 with a bespoke ~200-line `build.mjs`. Migrated to OKLCH (W3C DTCG v2025.10). Added the shadcn output platform. 20 tests passing.
- Four ADRs recorded: bespoke build (ADR-001), Chromatic removed (ADR-002), Tokens Studio rejected (ADR-003), Fumadocs over Zeroheight (ADR-004).

## 2026-04

- Initial scaffolding: Nx monorepo structure, token source files, single Button component in Storybook, test-app skeleton. Used Style Dictionary v5 for the token pipeline (later replaced — see 2026-04-07).

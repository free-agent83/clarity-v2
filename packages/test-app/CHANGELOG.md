# Changelog — @nivoda/test-app

Package-specific changes for Minivoda, the test-app digital twin. Newest entries first.

For cross-cutting monorepo changes, see the root [`CHANGELOG.md`](../../CHANGELOG.md). Format and rules: see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md#changelog).

---

## 2026-04-30

- Renamed package `minivoda-digital-twin` → `@nivoda/test-app` to fit the `@nivoda/*` scope (`7b39eb0`).
- Merged the in-flight `claude/festive-beaver-0e136c` branch into `dev`: PLP product lists for diamonds, engagement rings, gemstones, and melee now propagate `businessDays` consistently (`c30630d`, originally `5700f3c`, `8b16d4f`).
- Added stub `CONTRIBUTING.md` pointing to root for cross-cutting policy; carries only test-app-specific notes for now (`e2a1775`).
- Scrubbed the design-triad / "Flow surface" metaphor and Phase A/B/C/D references from `CLAUDE.md` (`9dee241`, `17bcbc5`).

## 2026-04-28

- Top-aligned delivery icons on PLP rows; kept the date parenthetical intact (in-flight work on a feature branch — see roadmap M0.1.3).
- Propagated `businessDays` to all PLP stories and the list-row API.

## 2026-04-27

- Refreshed delivery line copy and styling on `PlpGridItem` (`d6fba23`).

## 2026-04-23

- Added PLP list view with URL-backed pagination and shell updates (`e498d05`).
- Rebuilt PDPs from scratch against the Clarity V2 PDP kit (`451d884`).
- Migrated PLP/PDP to Clarity V2 template primitives (`ec9097e`).
- Adopted `FilterToolbar` from `@nivoda/components` across all six browse pages (natural/lab-grown diamonds, gemstones, natural/lab-grown melee, engagement rings). Each page ships a colocated `filters.tsx` controller; shared `usePlpFilterController` hook drives the drawer + URL flow. DB-backed filtering for five of six PLPs (engagement rings deferred).

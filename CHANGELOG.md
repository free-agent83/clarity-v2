# Changelog

All notable progress on Clarity V2 is recorded here. Most recent entries first.

---

## 2026-04-23 — Minivoda PLP pages adopt `FilterToolbar` from the component library

Minivoda's six browse pages (natural/lab-grown diamonds, gemstones, natural/lab-grown melee, engagement rings) now render their filter / sort chrome through the design-system `FilterToolbar` organism. Each page owns its own filter-state controller, colocated alongside `page.tsx` as `filters.tsx`, following the DS's consumer-owned-state pattern.

**Why:** the previous PLPs composed a hand-rolled search + filter-bar + sort trio inline in `LayoutProductList`, duplicating UI the design system already ships. Routing through `FilterToolbar` gives every category the same chrome, layout, sticky behaviour, and future drawer / preview-count scaffolding for free.

**Scope of this pass:**
- **Per-category filter controllers.** Each browse page now has a sibling `filters.tsx` client component that owns `useState` for active filter selections and sort value, composes filter buttons from a local filter definition, and renders `<FilterToolbar>` with the full consumer-owned prop surface (`filters`, `activeFilterCount`, `hasActiveFilters`, `onClearAll`, `sortOptions`, `sortValue`, `onSortChange`). Colocated so filter UI stays next to the category it belongs to — matching the "kit at the call site" guidance in the PLP COMPONENT.md.
- **Shared `MultiSelectFilterButton` helper** in `components/filters/` — composes the DS `FilterButton` render-prop with a checkbox list inside the popover. Used by every category's filter controller; category-specific option lists stay in the per-category controller files.
- **`LayoutPlp` reshaped.** Accepts a `toolbar?: ReactNode` prop and renders whatever the page passes between `PlpHeading` and `PlpGridContainer`. The `quickFilters` / `sortOptions` props, the local `SearchInput`, the `UncontrolledSortButton`, and the re-exported `SortOption` type are gone — all superseded by `FilterToolbar`.

**Deliberately not done this pass (tracked for follow-up):**
- **Search was dropped from PLPs.** `FilterToolbar` supports an `onSearchSubmit` callback, but the previous `<SearchInput>` in `LayoutPlp` was a dead UI (no submit wiring, no filter-the-grid behaviour). Rather than fake a search bar, this pass ships PLPs without one. The global search sits in the `AppShell` header; per-category scoped search returns as a follow-up when backend search supports it.
- **All-filters drawer.** `FilterToolbar` supports a bundled drawer via the `drawer` prop for "All filters" overflow. Not wired here — if a category's filter count outgrows the main row, the drawer gets wired in that pass.
- **Filter state is still ephemeral.** Selections don't persist to URL params or trigger refetches — filters are a visual shell on the prototype, same as before. URL-param integration is a separate task with its own design decisions.
- **Legacy `filter-bar` / `sort-button` / `search-input` files remain on disk.** They still have non-PLP consumers (`orders-filterable-list`, `finances-table`, the stone-selection configurator page). Deleting them is the conclusion of a later pass when those surfaces also route through DS primitives.

---

## 2026-04-10 — Architectural correction: tokens package is surface-agnostic

Removed the shadcn-specific layer from the tokens package. The tokens package now emits only primitives and the surface-agnostic semantic layer; any mapping to a specific surface theme (shadcn, Tailwind `@theme`, etc.) lives in-loco in the consumer.

**Why:** surface-specific theme mapping is an implementation detail of each consumer, not a concern of the foundation. The previous layout had the tokens package carrying a parallel shadcn semantic layer (`src/shadcn/light.tokens.json`, `dark.tokens.json`, `radius.tokens.json`) and emitting `dist/shadcn/tokens.css` — leaking surface decisions into a layer that should be theme-agnostic.

**Removed:**
- `packages/tokens/src/shadcn/` (all three JSON files)
- `buildShadcnCSS()` in `packages/tokens/build.mjs`
- `./shadcn` subpath export in `packages/tokens/package.json`
- `dist/shadcn/tokens.css` output and its integration test

**Minivoda implication:** Minivoda will consume `@nivoda/components` as a finished product — it imports the components package and gets the shadcn theme mapping baked in via `packages/components/src/styles/globals.css`. Minivoda does not need to maintain any token mapping on its end; that mapping already lives alongside the components that use it.

---

## 2026-04-08 — Token alignment with platform

Applied 15 design decisions after auditing the platform design system (MUI + Style Dictionary v3) against Clarity V2. The token foundation now reflects production-vetted color values with Clarity V2's modern naming conventions.

**Palette changes:**
- Renamed `purple` → `violet` (platform convention)
- Violet values updated to match platform production values
- Added violet 950 tier
- Green values updated to match platform production values
- Added missing tiers: red 800-950, amber 200-400 + 800-950, green 800-950
- Added blue palette (50-950) for info states and links

**Kept from Clarity V2:** `stone` naming, Tailwind-standard typography (xs-5xl), 4 font weights, 13-tier spacing scale, `radius sm = 4px`.

**Dropped from platform:** orange, grey, blue_grey palettes (MUI legacy).

See [`docs/design/token-decisions.md`](docs/design/token-decisions.md) for full rationale and [`docs/design/token-alignment.md`](docs/design/token-alignment.md) for the side-by-side comparison that drove the decisions.

---

## 2026-04-07 — Token alignment Phase 1 complete

Phase 1 of the broader token alignment plan. Replaced Style Dictionary with a bespoke build script, converted color tokens to OKLCH, added shadcn-compatible output for frontend consumption, and removed Chromatic.

**Delivered:**
- Bespoke build script (`packages/tokens/build.mjs`) — ~200 lines of plain Node.js, replacing Style Dictionary v5
- OKLCH color format throughout (W3C DTCG v2025.10 structured color objects)
- New output platform: `dist/shadcn/tokens.css` with `:root` + `.dark` scoped CSS for shadcn/ui consumption
- Complete test suite (20 tests passing) — color conversion, reference resolution, integration
- Four Architectural Decision Records (ADRs) documenting why each choice was made

**Architectural decisions recorded** (see [`docs/architecture/architecture.md`](docs/architecture/architecture.md)):
- ADR-001: Bespoke build script over Style Dictionary
- ADR-002: Chromatic removed
- ADR-003: Tokens Studio rejected (retained from original design)
- ADR-004: Fumadocs over Zeroheight

**Verification:** `nx build tokens`, `nx build components`, `nx build test-app` all succeed. 20/20 tests pass.

See [`docs/plans/2026-04-07-token-alignment-phase1.md`](docs/plans/2026-04-07-token-alignment-phase1.md) for the full implementation plan and [`docs/plans/specs/2026-04-07-token-alignment-design.md`](docs/plans/specs/2026-04-07-token-alignment-design.md) for the design spec.

---

## 2026-04 — Initial scaffolding

Initial repo setup: Nx monorepo structure, token source files, single Button component in Storybook, test app. Used Style Dictionary v5 for the token pipeline (later replaced — see above).

**Context documents produced:**
- [`docs/research/ds-diagnosis.md`](docs/research/ds-diagnosis.md) — evidence-based assessment of the current design system and priority recommendations
- [`docs/research/code-first-ds.md`](docs/research/code-first-ds.md) — industry research on code-first design systems, AI tooling, W3C DTCG spec
- [`docs/research/mobile-ds-diagnosis.md`](docs/research/mobile-ds-diagnosis.md) — mobile design system state and alignment roadmap

---

## Roadmap — what's next

See [`ROADMAP.md`](ROADMAP.md) for the full phased plan.

**Phase B — Proof** (active, 2-week window)
Build the core component set (~10-15 components). Rebuild a real Nivoda screen using Claude Code + Clarity V2 as the headline demo. Storybook runs locally.

**Phase C — Distribution**
Fumadocs documentation site deployed. Onboarding material for self-service UI delivery. First external person (designer or PM) builds something real with Clarity V2 + AI.

**Phase D — Adoption** (conditional, multi-quarter)
Design and PM use Clarity V2 to ship real features. Platform migration proceeds opportunistically as new features replace old MUI code. Governance (Experience Framework) becomes load-bearing as more people build.

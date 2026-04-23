# Changelog

All notable progress on Clarity V2 is recorded here. Most recent entries first.

---

## 2026-04-23 — Minivoda PLP pages adopt `FilterToolbar` from the component library

Minivoda's six browse pages (natural/lab-grown diamonds, gemstones, natural/lab-grown melee, engagement rings) now render their filter / sort chrome through the design-system `FilterToolbar` organism. Each page owns its own filter-state controller, colocated alongside `page.tsx` as `filters.tsx`, following the DS's consumer-owned-state pattern.

**Why:** the previous PLPs composed a hand-rolled search + filter-bar + sort trio inline in `LayoutProductList`, duplicating UI the design system already ships. Routing through `FilterToolbar` gives every category the same chrome, layout, sticky behaviour, and future drawer / preview-count scaffolding for free.

**Scope of this pass:**
- **Per-category filter controllers.** Each browse page has a sibling `filters.tsx` client component that defines the category's filter / sort config and renders `<FilterToolbar>`. Colocated so filter UI stays next to the category it belongs to — matching the "kit at the call site" guidance in the PLP COMPONENT.md.
- **Shared `usePlpFilterController` hook** in `hooks/` — owns both the applied filter state and the drawer's draft state for every PLP controller. Each category passes in its `FilterDef[]` + `FilterToolbarSortOption[]` and gets back the full `FilterToolbar` prop surface (`filters`, `activeFilterCount`, `hasActiveFilters`, `onClearAll`, `sortOptions`, `sortValue`, `onSortChange`, and the composed `drawer` object). The category files stay focused on config, not machinery.
- **Shared `MultiSelectFilterButton` helper** in `components/filters/` — composes the DS `FilterButton` render-prop with a checkbox list inside the popover. Used by the hook for the main filter row; the drawer body uses DS `FilterSection` + `Checkbox` directly.
- **All-filters drawer wired** via `FilterToolbar`'s `drawer` prop. Consumer provides the drawer content (one `FilterSection` per filter definition), the `onOpen` handler (seeds the draft from the applied state), `onApply` (copies the draft back to the applied state; the toolbar closes the drawer automatically), and `onClearDraft` (wipes the draft).
- **Search bar rendered** in the toolbar with a no-op `onSearchSubmit={() => {}}`. Visually present for consistency with the DS assembly pattern; pressing Enter is currently inert. Actual search routing is deferred to the ephemeral-state → URL-param pass below.
- **`LayoutPlp` reshaped.** Accepts a `toolbar?: ReactNode` prop and renders whatever the page passes between `PlpHeading` and `PlpGridContainer`. The `quickFilters` / `sortOptions` props, the local `SearchInput`, the `UncontrolledSortButton`, and the re-exported `SortOption` type are gone — all superseded by `FilterToolbar`.

**Deliberately not done this pass (tracked for follow-up):**
- **Filter state is still ephemeral.** Selections don't persist to URL params or trigger refetches — filters are a visual shell on the prototype, same as before. URL-param integration is a separate task with its own design decisions (encoding, pagination reset, fetch-layer shape).
- **Search submit is a no-op.** The search bar renders but doesn't route anywhere — backend search coverage for per-category scoped search lands in a later pass.
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

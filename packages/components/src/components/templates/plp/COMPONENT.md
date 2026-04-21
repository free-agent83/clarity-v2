---
name: PLP (Product Listing Page)
slug: plp
version: 0.6.0
status: unstable
lastUpdated: 2026-04-21
---

# PLP (Product Listing Page)

Conceptually, the PLP is a single template — the product-listing page. In practice the library does not ship a unified `PlpTemplate` component; consumers assemble the page in their own code from a small set of PLP-specific building blocks (this folder) plus the filter subsystem and other library primitives. This doc covers the whole template: every kit piece and how they fit together.

The refactor that produced this shape was deliberate. A fixed PlpTemplate couldn't accommodate the insertion points consumers inevitably need — category intro banners, promos, recommendation strips, interstitials — without growing a prop for each one. The kit-plus-assembly pattern lets consumers slot whatever they want between pieces while still leaning on the library for the hard parts (sticky filter chrome, responsive grid, skeleton loading, drawer draft lifecycle).

## Kit pieces

| Component | Role |
|-----------|------|
| [`PlpHeading`](./plp-heading.tsx) | Breadcrumbs + title (H1) + results count (aria-live) |
| [`PlpGridContainer`](./plp-grid-container.tsx) | Responsive 2/3/4-col grid + internal loading skeletons |
| [`PlpListContainer`](./plp-list-container.tsx) | Table shell + internal loading skeletons |
| [`PlpGridItem` primitives](./grid/plp-grid-item.tsx) | Card composition primitives (media, name, price, etc.) |
| [`PlpListRow` primitives](./list/plp-list-row.tsx) | Row composition primitives (cells, media, price, etc.) |

### PlpHeading

Heading region for a PLP page — breadcrumbs, category title (H1), and results count. The results count uses `aria-live="polite"` so screen readers announce when filters or pagination change it.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb segments. The last is rendered as the current page. |
| `title` | `string` | — | Category title (H1) |
| `resultsCount` | `number` | — | Total result count |

### PlpGridContainer

Responsive 2/3/4-column grid wrapper for PLP cards. When `loading` is true, renders a grid of skeleton cards tuned to the default `PlpGridItem` card proportions (aspect-square image placeholder, name + caption lines, badges, delivery / returns / price lines). When false, renders `children`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Grid cards (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton card count |

### PlpListContainer

Table shell for PLP list view. Provides the scroll container, sticky header positioning, and `<thead>` / `<tbody>` scaffolding. Consumer provides the header row and body rows as pre-rendered nodes. When `loading` is true, renders `skeletonCount` generic single-cell skeleton rows that span the full width regardless of column count.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | A single `PlpListHeaderRow` with `PlpListHeaderCell` children |
| `children` | `ReactNode` | — | List rows (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton row count |

### PlpGridItem and PlpListRow primitives

Composition primitives for individual product cards (grid view) and rows (list view). See the respective stories files for the full primitive menu and composition examples.

## Dependencies from the rest of the library

A full PLP page typically composes these non-PLP-specific pieces too:

- [`FilterToolbar`](../../organisms/filter-toolbar/filter-toolbar.tsx) — search + filters + sort + actions slot + sticky chrome
- [`FilterDrawer`](../../molecules/filter-drawer/filter-drawer.tsx) (with its co-located `FilterDrawerTrigger` and `FilterSection`) and the preset molecules — composed inside the drawer for the full filter list
- [`FilterButton`](../../atoms/filter-button/filter-button.tsx) — quick-filter chips in the toolbar row
- [`Empty`](../../atoms/empty/empty.tsx) + sub-components — empty / error states, composed by the consumer with the copy and CTAs that fit their context
- [`Pagination`](../../molecules/pagination/pagination.tsx) + [`Select`](../../molecules/select/select.tsx) — pagination control
- [`ToggleGroup`](../../atoms/toggle-group/toggle-group.tsx) — grid/list view toggle, rendered in the toolbar's `actions` slot
- [`AppShell`](../../organisms/app-shell/app-shell.tsx) — wraps everything

## Assembly reference

The canonical assembly pattern is in [`plp.stories.tsx`](./plp.stories.tsx). That file is the source of truth for:

- How to wire filter state via a consumer-owned `useFilterController` hook
- How to compose filter buttons for both the toolbar row and the drawer body
- How to route pinned vs. engaged filters between the main toolbar and the sticky chrome
- How to wire the debounced preview-count loop into the drawer
- How to branch on status for loading / empty-filtered / empty-no-items / error / content states (see `renderPlpEmptyState` — a sample Empty-atom composition for PLP empty / error states that consumers can copy and adapt)
- Where to insert banners / promos between kit pieces

Consumers should read this file, copy the pattern, and adapt it. Do not try to encapsulate the assembly behind a wrapper component — the extensibility points (banner positioning, status branching, view toggle rendering) are the point.

## Usage guidelines

**When to use:** Any product listing page. The kit covers grid + list views, filtering, sorting, search, pagination, and standard states.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows). Pages that need a completely custom layout.

## Best practices

**Do:** Copy the assembly pattern from the story file and adapt to your data shape. Keep filter state in a consumer-owned controller hook.

**Do:** Use the library's filter subsystem (`FilterToolbar`, `FilterDrawer`, `FilterSection`, preset molecules) — don't re-implement a filter UI.

**Do:** Compose empty / error states at the consumption site using the `Empty` atom + sub-components. The library intentionally doesn't ship PLP-specific empty / error components so consumers can tailor copy and CTAs to their context.

**Do:** Compose banners, promos, and recommendations between kit pieces as plain React children. The library's grid and list containers don't reach above themselves; insertion points are yours to decide.

**Don't:** Re-introduce a unified PLP template. The kit is the deliberate surface.

## Quality checklist

- [x] Accessibility: semantic H1, aria-live on count, breadcrumb semantics, table semantics, sticky header in the viewport
- [x] Responsive: 2 cols mobile / 3 cols tablet / 4 cols desktop; list falls back to grid below 1024px at the consumer's discretion
- [x] Tokens only: no hardcoded visual values in kit pieces

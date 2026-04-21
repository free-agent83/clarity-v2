---
name: PLP (Product Listing Page) Kit
slug: plp
version: 0.6.0
status: unstable
lastUpdated: 2026-04-21
---

# PLP Kit

The PLP kit is a set of PLP-specific building blocks plus a demonstration of how to assemble a full PLP page from them. There is no unified `PlpTemplate` component — consumers assemble the page in their own code. The kit pieces cover only what is PLP-specific; everything else (filter subsystem, pagination, view toggle) comes from the general library.

## Kit pieces

| Component | Role |
|-----------|------|
| [`PlpHeading`](./plp-heading.tsx) | Breadcrumbs + title (H1) + results count (aria-live) |
| [`PlpGridContainer`](./plp-grid-container.tsx) | Responsive 2/3/4-col grid + internal loading skeletons |
| [`PlpListContainer`](./plp-list-container.tsx) | Table shell + internal loading skeletons |
| [`PlpEmpty`](./states/plp-empty.tsx) | Empty-filtered / empty-no-items state wrappers with PLP-specific copy |
| [`PlpError`](./states/plp-error.tsx) | Error state with retry + support link |
| [`PlpGridItem` primitives](./grid/plp-grid-item.tsx) | Card composition primitives (media, name, price, etc.) |
| [`PlpListRow` primitives](./list/plp-list-row.tsx) | Row composition primitives (cells, media, price, etc.) |

## Dependencies from the rest of the library

A full PLP page typically composes these non-PLP-specific pieces too:

- [`FilterToolbar`](../../organisms/filter-toolbar/filter-toolbar.tsx) — search + filters + sort + actions slot + sticky chrome
- [`FilterDrawer`](../../molecules/filter-drawer/filter-drawer.tsx), [`FilterSection`](../../molecules/filter-section/filter-section.tsx), and preset molecules — composed inside the drawer for the full filter list
- [`FilterButton`](../../atoms/filter-button/filter-button.tsx) — quick-filter chips in the toolbar row
- [`Pagination`](../../molecules/pagination/pagination.tsx) + [`Select`](../../molecules/select/select.tsx) — pagination control
- [`ToggleGroup`](../../atoms/toggle-group/toggle-group.tsx) — grid/list view toggle, rendered in the toolbar's `actions` slot
- [`AppShell`](../../organisms/app-shell/app-shell.tsx) — wraps everything

## Assembly reference

The canonical assembly pattern is in [`plp.stories.tsx`](./plp.stories.tsx). That file is the source of truth for:

- How to wire filter state via a consumer-owned `useFilterController` hook
- How to compose filter buttons for both the toolbar row and the drawer body
- How to route pinned vs. engaged filters between the main toolbar and the sticky chrome
- How to wire the debounced preview-count loop into the drawer
- How to branch on status for loading / empty-filtered / empty-no-items / error / content states
- Where to insert banners / promos between kit pieces

Consumers should read this file, copy the pattern, and adapt it. Do not try to encapsulate the assembly behind a wrapper component — the extensibility points (banner positioning, status branching, view toggle rendering) are the point.

## Usage guidelines

**When to use:** Any product listing page. The kit covers grid + list views, filtering, sorting, search, pagination, and standard states.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows). Pages that need a completely custom layout.

## Best practices

**Do:** Copy the assembly pattern from the story file and adapt to your data shape. Keep filter state in a consumer-owned controller hook.

**Do:** Use the library's filter subsystem (`FilterToolbar`, `FilterDrawer`, `FilterSection`, preset molecules) — don't re-implement a filter UI.

**Do:** Compose banners, promos, and recommendations between kit pieces as plain React children. The library's grid and list containers don't reach above themselves; insertion points are yours to decide.

**Don't:** Re-introduce a unified PLP template. The kit is the deliberate surface.

## Quality checklist

- [x] Accessibility: heading, aria-live on counts, semantic landmarks in assembly reference
- [x] Responsive: 2/3/4 col grid; list falls back to grid below 1024px at the consumer's discretion
- [x] Tokens only: no hardcoded visual values in kit pieces

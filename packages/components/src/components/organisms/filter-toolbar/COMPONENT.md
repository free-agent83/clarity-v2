---
name: FilterToolbar
slug: filter-toolbar
version: 0.2.0
status: unstable
lastUpdated: 2026-04-21
---

<Gap>Usage guidance for this component is light — props and the live demo are accurate; written guidance is forthcoming.</Gap>

# FilterToolbar

Complete filter chrome for a filterable / sortable / searchable listing view. Bundles in one organism: a search input, a wrapping row of quick-filter chips, an "All filters" button that opens an internally-managed drawer, a sort dropdown, a right-side actions slot for extras (view toggle, etc.), and a sticky version of the filter row that pins to the top of the viewport once the main toolbar scrolls past.

The drawer, its trigger button, and the `FilterSection` wrappers used inside the drawer body are all part of this module — they always ship together because a drawer without a trigger and a trigger without a drawer both have no purpose. The consumer passes drawer content and lifecycle callbacks through the `drawer` prop; the organism owns the drawer's open state.

The toolbar is shape-agnostic about filters. Consumers compose filter chips from `FilterButton` (atom) plus preset controls (`ToggleGroup` for chip-style select, `RangeFilter`, or any custom React control) and hand them in as a `ReactNode[]` slot. The toolbar flows them into its wrapping row and mirrors a subset into the sticky chrome.

## Exports

| Export | Role |
|--------|------|
| `FilterToolbar` | The organism. Renders the full chrome and owns drawer open state. |
| `FilterSection` | Heading + optional leading separator + control wrapper used inside `drawer.content`. |
| `FilterToolbarProps` | Prop interface for `FilterToolbar`. |
| `FilterToolbarDrawer` | Config-object interface for the `drawer` prop. |
| `FilterToolbarSortOption` | `{ value, label }` shape for the sort dropdown. |
| `FilterSectionProps` | Prop interface for `FilterSection`. |

## FilterToolbar props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `ReactNode[]` | — | Pre-composed filter chips for the main row. Each element should be a `FilterButton` (or any ReactNode); the toolbar does not reason about their shape. |
| `stickyFilters` | `ReactNode[]` | — | Chips for the sticky chrome. Typically a subset of `filters` — engaged filters only, no empty pinned ones. Consumer decides membership. |
| `activeFilterCount` | `number` | — | Drives the "All filters" badge. |
| `hasActiveFilters` | `boolean` | — | Gates the "Clear all" button and the sticky chrome's visibility. |
| `onClearAll` | `() => void` | — | Fired when "Clear all" is clicked. |
| `onSearchSubmit` | `(query: string) => void` | — | Enable search; fires on Enter. Omit to hide the search input. |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder. |
| `sortOptions` | `FilterToolbarSortOption[]` | — | Enable the sort dropdown by providing options alongside `sortValue` and `onSortChange`. |
| `sortValue` | `string` | — | Selected sort value (controlled). |
| `onSortChange` | `(value: string) => void` | — | Sort setter. |
| `actions` | `ReactNode` | — | Right-side extras rendered after sort (e.g. a `ToggleGroup` view toggle). |
| `stickyTopOffset` | `number` | `72` | Pixel offset from the viewport top at which the sticky chrome appears. Default matches `AppShellHeader` height. |
| `disableSticky` | `boolean` | `false` | Disable the sticky chrome entirely. |
| `drawer` | `FilterToolbarDrawer` | — | All-filters drawer configuration. When omitted, the "All filters" button disappears and no drawer renders. |

## FilterToolbarDrawer

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `content` | `ReactNode` | — | Filter sections composed by the consumer (typically `FilterSection` wrappers containing preset controls). |
| `onOpen` | `() => void` | — | Fires when the drawer transitions from closed to open. Consumer typically reseeds its draft filter state from the applied state here. |
| `onApply` | `() => void` | — | Fires on the drawer's primary action. Consumer commits the draft; the drawer closes itself automatically. |
| `onClearDraft` | `() => void` | — | Fires on the drawer's header Clear action. Only rendered when `hasActiveDraft` and `onClearDraft` are both provided. |
| `hasActiveDraft` | `boolean` | `false` | Whether the current draft has any active filters. Gates the header Clear action. |
| `resultsCount` | `number` | — | Preview count. When set, the primary action reads `"Show X results"`. |
| `isCountLoading` | `boolean` | `false` | Primary action shows a spinner and is disabled while a preview-count fetch is in flight. |
| `applyLabel` | `string` | `"Apply"` | Primary action label when `resultsCount` is undefined. |

## FilterSection props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Section heading shown above the control. |
| `children` | `ReactNode` | — | The filter control. |
| `separator` | `boolean` | `true` | Leading separator. Set `false` on the first section of a drawer to avoid a redundant top rule. |

## Behaviour

**Sticky chrome.** An `IntersectionObserver` watches the main toolbar element with `rootMargin: "-${stickyTopOffset}px 0px 0px 0px"`. When the element leaves the adjusted viewport and `hasActiveFilters` is true, the compact sticky chrome fades in at `top: ${stickyTopOffset}` (default 72px, matching the `AppShellHeader`). Only the All Filters button and `stickyFilters` are rendered in the sticky chrome — no sort, search, or actions.

**Drawer open state.** FilterToolbar owns `drawerOpen` internally via `useState`. The All Filters buttons (main + sticky) both flip it to true. Dismissal (Escape, click outside, Apply) flips it back to false. The consumer never sees this state — they only receive the `drawer.onOpen` / `drawer.onApply` / `drawer.onClearDraft` signals.

**Draft lifecycle.** The toolbar does not manage draft state. Consumers own a draft filter state object, reseed it from applied state on `drawer.onOpen`, mutate it through the preset controls inside `drawer.content`, and commit it on `drawer.onApply`. The drawer closes itself after `onApply`.

## Usage

Plop it in. A minimum-viable usage:

```tsx
<FilterToolbar
  filters={filterButtons}          // FilterButton[] composed by the consumer
  stickyFilters={engagedButtons}
  activeFilterCount={n}
  hasActiveFilters={n > 0}
  onClearAll={controller.clearAll}
  sortOptions={SORT_OPTIONS}
  sortValue={sort}
  onSortChange={setSort}
  drawer={{
    content: (
      <>
        <FilterSection label="Colour" separator={false}>{/* ... */}</FilterSection>
        <FilterSection label="Price">{/* ... */}</FilterSection>
      </>
    ),
    onOpen: controller.seedDraft,
    onApply: controller.commitDraft,
    onClearDraft: controller.clearDraft,
    hasActiveDraft: controller.hasActiveDraft,
    resultsCount: preview.count,
    isCountLoading: preview.loading,
  }}
/>
```

See the PLP assembly story (`templates/plp/plp.stories.tsx`) for the full pattern: `useFilterController` hook, per-filter chip building, pinned/engaged routing, debounced preview-count loop.

## Quality checklist

- [x] Accessibility: keyboard navigable, semantic search input, semantic heading per filter section, aria-hidden on the hidden sticky chrome, focus trap in the drawer via the Sheet molecule
- [x] Responsive: mobile condenses to All Filters + Sort; the filter row hides on `< 640px`
- [x] Tokens only: no hardcoded visual values

## Live component

<StorybookEmbed story="filtering-filtertoolbar--default" />

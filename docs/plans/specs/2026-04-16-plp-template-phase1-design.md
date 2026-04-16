---
title: PLP Template — Phase 1 Implementation Design
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-16
status: Draft
parent: docs/plans/specs/2026-04-16-plp-template-component-spec.md
tags:
  - design-system
  - plp
  - phase-1
  - implementation-design
---

# PLP Template — Phase 1 Implementation Design

## Scope

Phase 1 of the PLP template as defined in the architectural spec. This document captures the implementation design decisions validated during brainstorming. It covers the component decomposition, filter registry, grid item model, toolbar, states, responsive behaviour, and Storybook strategy for the first shippable slice.

### Phase 1 includes

- PLP template shell (breadcrumbs, heading, toolbar, active filters strip, content area, pagination)
- Grid view with the full grid item model (thumbnail, name, lead slot, badges, category slots, delivery, returns, pricing, primary action)
- Hover behaviour (platform + category action toolbar on thumbnail, add-to-cart reveal) — no 360 media
- Filter system: All Filters drawer, quick filters with popovers, active filter chips with sticky behaviour
- Filter presets: boolean chip, single-select chips, multi-select chips (with adornment support), single-select dropdown
- Custom filter support via render-prop escape hatch
- Skeleton, empty, and error states for grid view
- Responsive grid (2/3/4 columns at mobile/tablet/desktop)
- Sort dropdown
- Storybook stories inside AppShell, including isolated grid item variant playground
- Light mode only

### Phase 1 excludes

- List view + column model
- Range slider with histogram, multi-axis range, async searchable dropdown (filter presets)
- 360 media on hover
- Analytics hooks
- Bulk selection (checkbox present when category opts in, but no bulk-action bar)
- Search input functionality (rendered but consumer-wired)
- Saved searches (removed from template scope entirely — feature being revamped)
- Grid/list view toggle (hidden until list view ships)
- Dark mode

---

## 1. File structure

```
src/components/templates/plp/
├── plp-template.tsx              Top-level orchestrator
├── plp-template.stories.tsx      Full PLP stories (inside AppShell)
├── COMPONENT.md                  Documentation
│
├── context/
│   └── plp-user-context.tsx      Test/Storybook-only mock user context provider
│
├── heading/
│   └── plp-heading.tsx           Breadcrumbs + title + results count
│
├── toolbar/
│   ├── plp-toolbar.tsx           Search, quick filters, sort
│   └── plp-quick-filter.tsx      Individual quick filter button + popover
│
├── filters/
│   ├── plp-filter-drawer.tsx     All Filters sheet (left-side)
│   ├── plp-active-filters.tsx    Active filter chips strip (with sticky behaviour)
│   ├── plp-filter-registry.ts    Filter registry type definitions and lookup logic
│   └── presets/
│       ├── boolean-chip.tsx
│       ├── single-select-chips.tsx
│       ├── multi-select-chips.tsx
│       └── single-select-dropdown.tsx
│
├── grid/
│   ├── plp-grid.tsx              Grid layout container
│   ├── plp-grid-item.tsx         Individual grid card
│   ├── plp-grid-item.stories.tsx Isolated grid item stories (variant playground)
│   └── plp-grid-skeleton.tsx     Skeleton loading state
│
└── states/
    ├── plp-empty.tsx             Empty state (no results / no items)
    └── plp-error.tsx             Error state with retry
```

All sub-components are internal to the template. Only `PlpTemplate` is exported from the barrel. The grid item gets its own stories file for the variant playground but is not a public export.

Filter presets live in their own folder — adding a new preset means adding a file, not editing an existing one.

`plp-user-context.tsx` is a Storybook/testing convenience only. In production, user context (currency, location, pricing model, feature flags) comes from the consuming app's own context provider at the app root. The template reads from that ambient context.

---

## 2. Filter registry contract

### FilterDefinition

The category provides an array of filter definitions. Each definition either names a preset or supplies a custom renderer. The template owns rendering; the category owns data and configuration.

```ts
type FilterDefinition = {
  id: string;                          // unique key, e.g. "color", "clarity"
  label: string;                       // display name, e.g. "Color"
  isQuickFilter?: boolean;             // promoted to toolbar
  popoverWidth?: number | string;      // optional width for quick filter popover
} & (
  | PresetFilter
  | CustomFilter
);

type PresetFilter = {
  preset: "boolean-chip" | "single-select-chips" | "multi-select-chips" | "single-select-dropdown";
  options?: FilterOption[];
  chipLabel?: string;                  // for boolean-chip, e.g. "Only Nivoda Curated items"
};

type FilterOption = {
  value: string;
  label: string;
  /** Small visual before the label (color swatch, flag icon). */
  adornment?: React.ReactNode;
  /**
   * Overrides the default toggle button content entirely.
   * Receives selection state so the consumer can style accordingly.
   * The preset still owns the outer button shell (click, aria, selection border).
   * Use for rich option layouts (e.g., icon on top + label below, card-shaped).
   */
  renderOption?: (props: { selected: boolean }) => React.ReactNode;
};

type CustomFilter = {
  preset: "custom";
  renderControl: (props: FilterControlProps) => React.ReactNode;
  formatChipValue?: (value: FilterValue) => string;
};

type FilterControlProps = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  options?: FilterOption[];
};

type FilterValue = string | string[] | { min: number; max: number } | boolean | undefined;

type FilterState = Record<string, FilterValue>;
```

### Single source of truth

All three surfaces (quick filter popover, drawer section, active chip edit popover) resolve the same `FilterDefinition` and render the same control. The registry is the definition array itself — no separate registration step. The template iterates definitions, matches on `preset`, and renders the corresponding component.

### Change handling

The template receives a single top-level callback:

```ts
onFilterChange: (filterId: string, value: FilterValue) => void;
```

The template wires this into each filter control:

```ts
{
  value: filterState[definition.id],
  onChange: (value) => onFilterChange(definition.id, value),
}
```

The category's `FilterDefinition` does not carry a change handler — it only describes what the filter is. The consumer gets a single `onFilterChange` callback and decides what to do (update state, refetch, sync URL, etc.).

### Chip value formatting

Presets have built-in chip formatters:
- Boolean: the label itself
- Single-select: the selected option label
- Multi-select: selected labels joined with commas
- Range-based (Phase 2): `"$100 — $300"` format with interval bounds

Custom filters must supply `formatChipValue`.

---

## 3. Grid item model

### Fixed sections (template-rendered, in order)

| # | Section | Data shape | Notes |
|---|---------|-----------|-------|
| 1 | Thumbnail | `thumbnailSrc: string, thumbnailAlt: string` | Template handles hover actions, 1:1 aspect ratio |
| 2 | Name | `string` | |
| 3 | Lead | `ReactNode \| undefined` | Category-owned slot — can contain text, links, mixed content |
| 4 | Badges | `ReactNode[]` | Category supplies nodes, template renders with consistent spacing |
| 5 | Category slot top | `ReactNode \| undefined` | Optional, category-owned |
| 6 | Delivery | `{ estimatedDate: string, shipsFrom: string, isExpress?: boolean }` | Template auto-renders Express badge/styling |
| 7 | Returns | `{ isReturnable: boolean }` | Template renders "Returnable" with fair-use link or "Non-returnable" |
| 8 | Pricing | `PricingData` | Template handles all variant rendering from data + user context |
| 9 | Category slot bottom | `ReactNode \| undefined` | Optional, category-owned |
| 10 | Primary action | `{ onAddToCart: () => void }` | Hover-revealed on desktop, always visible on touch |

All sections are rendered in this fixed order. Categories cannot reorder or substitute rendering for template-driven sections.

### PricingData

```ts
type PricingData = {
  amount: number;
  currency: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  legacyDeliveredPrice?: { amount: number; currency: string };
  includeTariffs?: boolean;
};
```

The template reads user context (currency, location, pricing model) and combines with pricing data:
- User currency differs from item currency → secondary line with converted price
- `includeTariffs` true + US user → "Stone price including US tariffs" label
- `discount` present → struck-through original + discount percentage
- `legacyDeliveredPrice` present + legacy pricing model → two-line pricing
- `perCarat` present → secondary line under main price

The category never decides how pricing looks. Visual consistency across categories is guaranteed by the template.

### Thumbnail actions — two tiers

**Platform actions** — always present, template-owned, consistent everywhere:
- `favorite` — add to shortlist
- `share` — share item
- `viewMedia` — open Lightbox

**Category-specific actions** — opt-in, category provides everything:

```ts
type CategoryThumbnailAction = {
  id: string;
  icon: ReactNode;
  label: string;                       // tooltip + accessible name
  onAction: (itemId: string) => void;
};
```

The template renders platform actions first, then category actions. The template controls placement and styling; the category controls what extra actions exist.

### Multiselect

Category-decided via `enableSelection?: boolean`. When true, the select checkbox appears in the thumbnail toolbar alongside the platform actions. Selection state and bulk actions are deferred to Phase 2+.

---

## 4. Consumer API (markup shape)

```tsx
<AppShell>
  <PlpTemplate
    // Heading
    breadcrumbs={[
      { label: "Gemstones", href: "/gemstones" },
      { label: "Sapphire" },
    ]}
    title="Sapphire"
    resultsCount={1234567}

    // Filters
    filters={[
      {
        id: "nivoda-curated",
        label: "Nivoda Curated",
        preset: "boolean-chip",
        chipLabel: "Only Nivoda Curated items",
        isQuickFilter: true,
      },
      {
        id: "color",
        label: "Color",
        preset: "multi-select-chips",
        isQuickFilter: true,
        popoverWidth: 320,
        options: [
          { value: "blue", label: "Blue", adornment: <ColorSwatch color="blue" /> },
          { value: "green", label: "Green", adornment: <ColorSwatch color="green" /> },
        ],
      },
      {
        id: "my-custom-filter",
        label: "Special Filter",
        preset: "custom",
        renderControl: ({ value, onChange }) => (
          <MyCustomFilterUI value={value} onChange={onChange} />
        ),
        formatChipValue: (value) => `Custom: ${value}`,
      },
    ]}
    filterState={filterState}
    onFilterChange={(filterId, value) => {
      setFilterState((prev) => ({ ...prev, [filterId]: value }));
    }}
    filteredResultsCount={10234}

    // Sort
    sortOptions={[
      { value: "price-asc", label: "Price, low to high" },
      { value: "price-desc", label: "Price, high to low" },
    ]}
    sortValue="price-asc"
    onSortChange={setSortValue}

    // Search
    searchPlaceholder="Search by certificate number or stock ID..."
    onSearchSubmit={handleSearch}

    // Grid items
    items={items}
    renderGridItem={(item) => ({
      id: item.id,
      name: item.name,
      thumbnailSrc: item.image,
      thumbnailAlt: `${item.carat}ct ${item.color} ${item.shape}`,
      lead: <span>{item.stockId}</span>,
      badges: [
        <OriginBadge country={item.origin} />,
        <CertBadge lab={item.certLab} number={item.certNumber} />,
      ],
      categorySlotTop: <DiamondDimensions dimensions={item.dimensions} />,
      categorySlotBottom: null,
      delivery: {
        estimatedDate: "Nov 18 - 23",
        shipsFrom: "United States",
        isExpress: item.isExpress,
      },
      returns: { isReturnable: item.isReturnable },
      pricing: {
        amount: item.price,
        currency: "USD",
        perCarat: item.pricePerCarat
          ? { amount: item.pricePerCarat, currency: "USD" }
          : undefined,
        discount: item.discount
          ? { percentage: item.discount, originalAmount: item.originalPrice }
          : undefined,
        includeTariffs: item.includeTariffs,
      },
      onAddToCart: () => handleAddToCart(item.id),
      enableSelection: true,
      categoryActions: [
        {
          id: "findMatchingPair",
          icon: <MatchPairIcon />,
          label: "Find matching pair",
          onAction: (id) => handleFindPair(id),
        },
      ],
    })}

    // Pagination
    page={1}
    pageSize={20}
    totalItems={1234567}
    pageSizeOptions={[20, 50, 100]}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}

    // States
    status="success"
    onRetry={refetch}
    emptyFilterSuggestions={["Color", "Clarity"]}
    emptyMessage="No sapphires available at the moment."
  />
</AppShell>
```

---

## 5. Filter surfaces behaviour

### All Filters drawer

- Left-side `Sheet` (existing molecule)
- Filters render in definition order, each in its own section with the filter label as heading
- Every filter renders via the registry — same control whether preset or custom
- Sticky footer:
  - Primary: result-count-aware, e.g. "Show 10,000+ results" (from `filteredResultsCount` prop)
  - Secondary: "Clear filters"
- Focus trapped while open, Escape closes, focus returns to "All Filters" button

### Quick filters

- Filters with `isQuickFilter: true` render as buttons in the toolbar
- Click opens a `Popover` (existing atom) containing the registry-resolved control
- Popover width controlled via optional `popoverWidth` on the filter definition
- Popover includes Apply and Clear buttons
- Button shows active visual state when the filter has a value
- "All Filters" button shows badge with count of distinct active filter IDs

### Active filters strip

- Appears below toolbar when any filter has a value
- Each chip: `"{label}: {formatted value}"`
- Chip click → opens popover with the same registry-resolved control for inline editing
- Chip dismiss → calls `onFilterChange(filterId, undefined)` to clear that filter
- "Clear all" action at the end of the strip
- Sticky: when toolbar scrolls out of view, strip sticks to viewport top as horizontally-scrollable bar

### Data flow

```
filterState (consumer owns)
       ↓
  PlpTemplate holds filter definitions + filterState
       ↓
  ┌─────────────┬──────────────────┬──────────────────┐
  │ Quick filter │ Drawer section   │ Active chip edit  │
  │ popover      │                  │ popover           │
  └──────┬───────┴────────┬─────────┴────────┬──────────┘
         │                │                  │
         └────────────────┴──────────────────┘
                          ↓
              Same FilterDefinition resolved
              Same control component rendered
              Same value from filterState
              Same onChange → onFilterChange(id, value)
```

---

## 6. Toolbar

### Layout (left to right)

| Element | Behaviour |
|---------|-----------|
| Search input | Rendered, consumer-wired via `onSearchSubmit(query: string)`. Placeholder configurable. |
| "All Filters" button | Opens drawer. Badge shows count of active filter IDs. |
| Quick filter buttons | One per `isQuickFilter: true` definition, in definition order. |
| Sort dropdown | Existing `Select` molecule. Consumer provides `sortOptions`, `sortValue`, `onSortChange`. |

### Responsive (mobile < 640px)

- All Filters button + Sort dropdown only
- No quick filters, no search input
- Active filters strip still appears below when filters are active

---

## 7. Pagination, states, responsive grid

### Pagination

- Existing `Pagination` molecule at the bottom of the content area
- Props: `page`, `pageSize`, `totalItems`, `onPageChange`, `onPageSizeChange`
- `pageSizeOptions?: number[]` (defaults to `[20, 50, 100]`)
- Renders "Results per page" dropdown + Previous/Next + "Page X of Y"

### Responsive grid

| Breakpoint | Columns |
|-----------|---------|
| Mobile (< 640px) | 2 |
| Tablet (640–1024px) | 3 |
| Desktop (>= 1024px) | 4 |

System-controlled, not category-configurable.

### States

Driven by a single `status` prop:

| Status | Renders |
|--------|---------|
| `"loading"` | Skeleton grid — each skeleton mirrors grid item structure with shimmer animation |
| `"success"` | Normal grid with items |
| `"empty-filtered"` | Friendly copy + "Clear all filters" + "Try removing" hint (via `emptyFilterSuggestions`) |
| `"empty-no-items"` | Category-specific copy (via `emptyMessage`) without clear-filters action |
| `"error"` | Friendly copy + Retry action (via `onRetry`) + support link |

---

## 8. Storybook strategy

All stories render inside AppShell. Grid item gets its own isolated story file.

### `plp-template.stories.tsx` — `Templates/PLP`

| Story | Purpose |
|-------|---------|
| `GemstoneCategory` | Dense card: badges, lead as SKU, discount pricing, Express delivery, category actions. Mimics wireframe 1. |
| `JewelryCategory` | Clean card: lead as subtitle with link, "Starting from" pricing, slot bottom with swatches. Mimics wireframe 2. |
| `WithActiveFilters` | Pre-applied filters showing active strip + sticky behaviour. |
| `WithCustomFilter` | Render-prop escape hatch alongside preset filters. |
| `Loading` | Skeleton state. |
| `EmptyFiltered` | No results after filtering with "Try removing" suggestions. |
| `EmptyNoItems` | Category has no items at all. |
| `Error` | Error state with retry. |
| `Mobile` | Mobile viewport — 2 columns, condensed toolbar (All Filters + Sort only). |

### `plp-grid-item.stories.tsx` — `Templates/PLP Grid Item`

ArgTypes playground:

| Control | Type |
|---------|------|
| `isReturnable` | boolean |
| `isExpress` | boolean |
| `pricingModel` | select: standard / legacy |
| `showDiscount` | boolean |
| `showPerCarat` | boolean |
| `showTariffs` | boolean |
| `multiCurrency` | boolean |
| `thumbnailActions` | category actions configuration |
| `enableSelection` | boolean |
| `hasCategorySlotTop` | boolean |
| `hasCategorySlotBottom` | boolean |
| `hasLead` | boolean |
| `hasBadges` | boolean |

Named stories:
- `Default` — baseline with argTypes anchor
- `HoverState` — action toolbar + add-to-cart via `play` function
- `AllVariantsActive` — Express + discount + legacy pricing + tariffs + multi-currency all on

Both story files wrap in `PlpUserContext` for context controls (currency, location, pricing model).

---

## 9. Accessibility (Phase 1 scope)

Per the architectural spec §5, Phase 1 implements:

- Toolbar controls reachable via Tab in visual order
- Filter popovers trap focus, Escape closes, focus restores to trigger
- All Filters drawer: focus trapped, Escape closes, focus restores to "All Filters" button
- Grid items in list semantic structure, Tab moves through items in reading order
- Within a grid item: Tab visits thumbnail link, badge hovercard triggers, primary action
- Hover-only UI (thumbnail toolbar, add-to-cart) appears on keyboard focus within the card
- Active filter chips: Enter/Space opens edit, Delete/Backspace clears, dismiss button is separately focusable
- Results count announces via `aria-live="polite"` on change
- Breadcrumbs: `nav` with `aria-label`, ordered list
- Filter popovers: `role="dialog"` with filter name as accessible label
- Drawer: `role="dialog"` with `aria-modal="true"`
- Pagination: `nav` with `aria-label`
- Chip dismiss: accessible label "Remove filter: {name}"
- Images: meaningful alt text via `thumbnailAlt`

---

## 10. Existing components consumed

| Component | Tier | Used for |
|-----------|------|----------|
| `Breadcrumb` | molecule | Heading area breadcrumbs |
| `Badge` | atom | Filter count badge, Express badge |
| `Sheet` | molecule | All Filters drawer |
| `Popover` | atom | Quick filter popovers, active chip edit popovers |
| `Select` | molecule | Sort dropdown, single-select-dropdown preset |
| `Skeleton` | atom | Loading state |
| `Button` | atom | Actions throughout (add to cart, clear filters, retry) |
| `Input` | atom | Search input |
| `ToggleGroup` | atom | Chip-based filter presets |
| `ScrollArea` | atom | Horizontal scroll for active filter strip |
| `HoverCard` | atom | Badge progressive disclosure |
| `Pagination` | molecule | Page navigation |
| `Separator` | atom | Visual dividers |
| `Tooltip` | atom | Thumbnail action tooltips |
| `DropdownMenu` | molecule | Potential use in category actions overflow |

---

## 11. Phasing overview

| Phase | Scope |
|-------|-------|
| **Phase 1 (this doc)** | Grid view + toolbar + filter system (4 presets + custom) + pagination + states + responsive + Storybook |
| **Phase 2** | List view + column model + grid/list toggle |
| **Phase 3** | Range slider with histogram, multi-axis range, async searchable dropdown (filter presets) + 360 media on hover + analytics hooks |

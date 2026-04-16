# DataTable Phase 3 Design Spec — Quick Filters + Clear All

**Status:** Approved  
**Date:** 2026-04-15  
**Phase:** 3 of 4  
**Depends on:** Phase 2 (complete)

---

## 1. Scope

Phase 3 adds quick filters and a "Clear all" button to the DataTable toolbar:

- **Quick filter popover** — shared popover template with trigger button, Apply/Clear actions, and pending state management
- **Checkbox-list filter** — options derived from faceted unique values, sorted alphabetically
- **Interval-slider filter** — range slider with bounds from faceted min/max values
- **"Clear all" button** — resets all column filters AND global search
- **Active filter indicators** — trigger label shows context: "Status (2)" for checkbox, "Price: $87 – $1,625" for slider

**Explicitly out of scope (deferred):**

- `custom` filter type (render prop) → deferred until needed
- Slider with editable number inputs → future Slider atom variant (noted in CHANGELOG.md)
- Select all / Deselect all in checkbox filter → deferred
- Server-side mode → Phase 4

---

## 2. Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | "Clear all" resets column filters AND global search | From user perspective, "Clear all" = "show me everything again" |
| 2 | `custom` filter type deferred | YAGNI — checkbox-list and interval-slider cover the majority of use cases |
| 3 | Slider uses existing Slider atom as-is | Slider-with-inputs is a reusable atom variant, not a DataTable concern |
| 4 | Checkbox options sorted alphabetically, no select all | Scannable order; "Clear" button serves as deselect all |
| 5 | Active indicator: label text — "Status (2)" for checkbox, "Price: $87 – $1,625" for slider | Informative, no extra UI elements needed |
| 6 | `formatValue` optional callback on interval-slider | Consumer knows their domain (currency, units, etc.) |

---

## 3. New types

Added to `data-table-types.ts`:

```ts
/**
 * Quick filter configuration for the toolbar.
 *
 * Each quick filter renders as a popover trigger button in the toolbar.
 * The popover contains filter-specific controls, an Apply button, and
 * a Clear button. Changes are pending until Apply is clicked.
 */
type QuickFilter =
  | {
      name: string
      columnId: string
      type: "checkbox-list"
    }
  | {
      name: string
      columnId: string
      type: "interval-slider"
      formatValue?: (value: number) => string
    }
```

`DataTableToolbarConfig` gains:

```ts
quickFilters?: QuickFilter[]
```

---

## 4. New components

All internal — not exported from barrel. Never used standalone.

### 4.1 `DataTableQuickFilterPopover<TData>`

**File:** `data-table-quick-filter-popover.tsx`

Shared popover template. Renders the trigger button and popover content for one quick filter.

**Props:**

```ts
interface DataTableQuickFilterPopoverProps<TData> {
  table: Table<TData>
  filter: QuickFilter
}
```

**Responsibilities:**

- Resolve the column from `table.getColumn(filter.columnId)`
- Render the trigger button with the filter's `name`
- Show active indicator in trigger label:
  - Checkbox-list: "Status (2)" — name + count of selected values
  - Interval-slider: "Price: $87 – $1,625" — name + formatted range using `formatValue` (falls back to raw numbers)
- Render `Popover` → `PopoverContent` containing:
  - The filter-specific controls (checkbox or slider)
  - An "Apply" `Button` that calls `column.setFilterValue(pendingValue)` and closes the popover
  - A "Clear" `Button` (variant: `ghost`) that calls `column.setFilterValue(undefined)`, resets pending state, and closes the popover
- Hold pending state locally (`useState`). Changes are NOT applied live — only on Apply.
- Initialise pending state from the column's current filter value when the popover opens (so reopening reflects the last applied state)

**Trigger label logic:**

```ts
// Checkbox-list
const activeCount = (column.getFilterValue() as string[] | undefined)?.length
const label = activeCount ? `${filter.name} (${activeCount})` : filter.name

// Interval-slider
const range = column.getFilterValue() as [number, number] | undefined
const fmt = filter.type === "interval-slider" && filter.formatValue
  ? filter.formatValue
  : (v: number) => String(v)
const label = range
  ? `${filter.name}: ${fmt(range[0])} – ${fmt(range[1])}`
  : filter.name
```

### 4.2 `DataTableCheckboxFilter`

**File:** `data-table-checkbox-filter.tsx`

Renders inside `DataTableQuickFilterPopover`. Stateless — receives value and onChange from parent.

**Props:**

```ts
interface DataTableCheckboxFilterProps {
  options: string[]
  value: Set<string>
  onChange: (value: Set<string>) => void
}
```

**Behaviour:**

- Renders a `Checkbox` + `Label` for each option (sorted alphabetically — parent passes sorted array)
- Options derived from `column.getFacetedUniqueValues()` (a `Map<string, number>`) — the popover extracts keys and sorts them
- Checking/unchecking a box calls `onChange` with the updated `Set`
- Layout: vertical list with `gap-2`, each row is `flex items-center gap-2`

### 4.3 `DataTableSliderFilter`

**File:** `data-table-slider-filter.tsx`

Renders inside `DataTableQuickFilterPopover`. Stateless — receives value and onChange from parent.

**Props:**

```ts
interface DataTableSliderFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}
```

**Behaviour:**

- Renders the library `Slider` component with `min`, `max`, `value`, and `onValueChange`
- Shows the current selected range as text below the slider: `"{formatted min} – {formatted max}"` using `formatValue` or `String` fallback
- Bounds derived from `column.getFacetedMinMaxValues()` (returns `[min, max]`) — the popover extracts these
- `onValueChange` calls `onChange` with the new `[min, max]` tuple

---

## 5. Hook changes (`use-data-table.ts`)

### 5.1 Filter function mapping

When `config.toolbar?.quickFilters` is defined, map `filterFn` onto columns that have quick filters. This is done alongside the existing `enableGlobalFilter` mapping:

```ts
// For each quick filter, set the appropriate filterFn on the column
if (quickFilter.type === "checkbox-list") {
  return { ...col, filterFn: "arrIncludesSome" }
}
if (quickFilter.type === "interval-slider") {
  return { ...col, filterFn: "inNumberRange" }
}
```

`arrIncludesSome` and `inNumberRange` are built-in TanStack Table filter functions — no custom implementation needed.

### 5.2 New return values

```ts
interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
  resetAllFilters: () => void
}
```

`resetAllFilters` resets both column filters and global search:

```ts
const resetAllFilters = () => {
  table.resetColumnFilters()
  setGlobalFilter("")
}
```

### 5.3 New validation rules

- Each `quickFilter.columnId` must match an existing column → throw if not
- No duplicate `columnId` values in `quickFilters` → throw if duplicates found

---

## 6. Toolbar changes (`data-table-toolbar.tsx`)

### 6.1 New props

The toolbar receives two additional props from the root component:

```ts
interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
  hasActiveFilters: boolean
  resetAllFilters: () => void
}
```

### 6.2 Layout update

```
┌──────────────────────────────────────────────────────────────────────┐
│ [🔍 Search] [Status ▾] [Price ▾] [Clear all]      [Price, high ▾]  │
│  ← search + filters + clear-all (left)          sort (right) →      │
└──────────────────────────────────────────────────────────────────────┘
```

Inside the existing left-side `<div className="flex flex-1 items-center gap-2">`:

1. Search input (existing, when `toolbar.search` configured)
2. `DataTableQuickFilterPopover` for each entry in `toolbar.quickFilters`
3. "Clear all" `Button` (variant: `ghost`, size: `sm`) — shown when `hasActiveFilters` is true

### 6.3 "Clear all" button

```tsx
{hasActiveFilters && (
  <Button variant="ghost" size="sm" onClick={resetAllFilters}>
    Clear all
  </Button>
)}
```

---

## 7. Root component changes (`data-table.tsx`)

Pass `hasActiveFilters` and `resetAllFilters` from hook return to `DataTableToolbar`:

```tsx
const { table, globalFilter, setGlobalFilter, hasActiveFilters, resetAllFilters } =
  useDataTable(data, config)

{config.toolbar && (
  <DataTableToolbar
    table={table}
    toolbar={config.toolbar}
    globalFilter={globalFilter}
    setGlobalFilter={setGlobalFilter}
    hasActiveFilters={hasActiveFilters}
    resetAllFilters={resetAllFilters}
  />
)}
```

---

## 8. Stories

| Story | Config | Play function |
|-------|--------|---------------|
| `WithCheckboxFilter` | Quick filter on `category` (checkbox-list) | Opens popover → checks two options → Apply → verifies filtered rows → Clear → verifies reset |
| `WithSliderFilter` | Quick filter on `price` (interval-slider, with `formatValue`) | Opens popover → adjusts slider → Apply → verifies trigger label shows range |
| `WithQuickFilters` | Both checkbox + slider, plus search + sort | Render-only story showing full toolbar |
| `WithClearAll` | Search + quick filters active, then Clear all | Applies a filter → verifies Clear all appears → clicks it → verifies all reset |

---

## 9. Tests (`data-table.test.tsx`)

New `validateConfig` test cases:

| Test | Input | Expected |
|------|-------|----------|
| `quickFilter.columnId not in columns throws` | `quickFilters: [{ columnId: "nonexistent", ... }]` | Error |
| `duplicate columnId in quickFilters throws` | Two filters with same `columnId` | Error |
| `valid quickFilters config passes` | Valid checkbox + slider config | No error |

---

## 10. Barrel exports

Export `QuickFilter` type from `index.ts`.

---

## 11. File change summary

| File | Change |
|------|--------|
| `data-table-types.ts` | Add `QuickFilter` type, `quickFilters?` to toolbar config |
| `use-data-table.ts` | Filter function mapping, validation, `resetAllFilters`, expanded return |
| `data-table-quick-filter-popover.tsx` | **New** — shared popover template |
| `data-table-checkbox-filter.tsx` | **New** — checkbox list filter |
| `data-table-slider-filter.tsx` | **New** — range slider filter |
| `data-table-toolbar.tsx` | Render filter buttons + "Clear all", new props |
| `data-table.tsx` | Pass `hasActiveFilters` + `resetAllFilters` to toolbar |
| `data-table.stories.tsx` | 4 new stories |
| `data-table.test.tsx` | 3 new validation tests |
| `COMPONENT.md` | Document quick filter config |
| `index.ts` | Export `QuickFilter` type |
| `CHANGELOG.md` | Note Slider-with-inputs as future work |

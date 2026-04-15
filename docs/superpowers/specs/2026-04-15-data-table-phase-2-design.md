# DataTable Phase 2 Design Spec — Toolbar

**Status:** Approved  
**Date:** 2026-04-15  
**Phase:** 2 of 4  
**Depends on:** Phase 1 (complete)

---

## 1. Scope

Phase 2 adds `DataTableToolbar` to the DataTable component with:

- **Debounced search input** — filters rows across configured columns using TanStack Table's global filter, debounced via the shared `useDebounce` hook
- **Sort dropdown** — preset sort options rendered in a `DropdownMenu`, trigger shows the active sort label

**Explicitly out of scope (deferred):**

- "Clear all" button → Phase 3 (arrives alongside quick filters)
- `quickFilters` type field and rendering → Phase 3
- Server-side mode → Phase 4

---

## 2. Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | `quickFilters` field excluded from `DataTableToolbarConfig` until Phase 3 | YAGNI — type surface should reflect what's implemented |
| 2 | No "Clear all" button in Phase 2 | Only makes sense with multiple filter sources; search has its own inline × |
| 3 | Sort dropdown uses `DropdownMenu` (not `Select`) | Sort options are actions, not form values; supports checkmarks and grouping |
| 4 | Search input uses `InputGroup` + `InputGroupButton` for inline × clear | Leverages existing library primitive; no custom wrapper needed |
| 5 | Sort trigger shows active sort label (e.g. "Price, high to low"), falls back to "Sort" | Keeps current state visible at a glance without opening the menu |

---

## 3. New types

Added to `data-table-types.ts`:

```ts
interface DataTableToolbarConfig {
  search?: {
    placeholder?: string
    columnIds: string[]      // required — columns that are globally searchable; must be non-empty
    debounceMs?: number      // default: 300
  }
  sorting?: SortOption[]
}

interface SortOption {
  label: string
  columnId: string
  direction: "asc" | "desc"
}
```

`DataTableConfig<TData>` gains:

```ts
toolbar?: DataTableToolbarConfig
```

---

## 4. Hook changes (`use-data-table.ts`)

### 4.1 New state

- `globalFilter: string` — starts as `""`

### 4.2 Global filter column restriction

When `config.toolbar?.search` is defined, columns NOT listed in `columnIds` must have `enableGlobalFilter: false`. This is done by mapping over `config.columns` before passing to `useReactTable`:

```ts
const columns = config.toolbar?.search
  ? config.columns.map((col) => {
      const id = "accessorKey" in col ? String(col.accessorKey) : col.id
      const isSearchable = config.toolbar!.search!.columnIds.includes(id ?? "")
      return isSearchable ? col : { ...col, enableGlobalFilter: false }
    })
  : config.columns
```

### 4.3 Table instance additions

Pass to `useReactTable`:

- `state.globalFilter` — the current global filter value
- `onGlobalFilterChange: setGlobalFilter` — state setter

### 4.4 Return type additions

```ts
interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
}
```

### 4.5 `hasActiveFilters` update

```ts
const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""
```

### 4.6 New validation rules

Added to `validateConfig`:

- If `toolbar.search` is defined but `columnIds` is missing or empty → throw
- If `toolbar.search.columnIds` contains a value that doesn't match any column `accessorKey` or `id` → throw
- If `toolbar.sorting` is defined and a `columnId` doesn't match any column → throw

---

## 5. New component: `DataTableToolbar`

### 5.1 Overview

Internal component — **not exported** from the package barrel. Rendered by `DataTable` when `config.toolbar` is defined.

**File:** `data-table-toolbar.tsx`

### 5.2 Props

```ts
interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
}
```

### 5.3 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [🔍 Search input ×]                    [Price, high to low ▾] │
│   ← left-aligned                           right-aligned →   │
└──────────────────────────────────────────────────────────────┘
```

Container: `flex items-center justify-between gap-4`

- **Left:** Search input (when `toolbar.search` is configured)
- **Right:** Sort dropdown (when `toolbar.sorting` is configured)

### 5.4 Search input

Composed from existing `InputGroup` primitives:

```tsx
<InputGroup className="max-w-sm">
  <InputGroupAddon align="inline-start">
    <IconSearch />
  </InputGroupAddon>
  <InputGroupInput
    placeholder={toolbar.search.placeholder ?? "Search..."}
    value={localSearch}
    onChange={(e) => setLocalSearch(e.target.value)}
  />
  {localSearch && (
    <InputGroupAddon align="inline-end">
      <InputGroupButton size="icon-xs" onClick={() => setLocalSearch("")}>
        <IconX />
      </InputGroupButton>
    </InputGroupAddon>
  )}
</InputGroup>
```

**Debounce flow:**

1. `localSearch` — local state, updates on every keystroke (responsive UI)
2. `debouncedSearch` — `useDebounce(localSearch, debounceMs ?? 300)`
3. `useEffect` syncs `debouncedSearch` → `setGlobalFilter(debouncedSearch)`

When the × button is clicked, `localSearch` is set to `""` and the global filter clears after debounce (or immediately — the effect fires on the next render with `""`, and since debounce delay applies, we can call `setGlobalFilter("")` directly on clear for instant feedback).

### 5.5 Sort dropdown

Composed from existing `DropdownMenu` primitives:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      {activeSort?.label ?? "Sort"}
      <IconChevronDown />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuRadioGroup value={activeSortValue} onValueChange={handleSort}>
      {toolbar.sorting.map((option) => (
        <DropdownMenuRadioItem
          key={`${option.columnId}-${option.direction}`}
          value={`${option.columnId}-${option.direction}`}
        >
          {option.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

**Active sort detection:** Read `table.getState().sorting[0]` and match against the sort options to determine which is active.

**Sort application:** On select, call `table.getColumn(columnId)?.toggleSorting(direction === "desc")`.

---

## 6. Root component changes (`data-table.tsx`)

- Import `DataTableToolbar`
- Render above the table border container, conditionally:

```tsx
{config.toolbar && (
  <DataTableToolbar
    table={table}
    toolbar={config.toolbar}
    globalFilter={globalFilter}
    setGlobalFilter={setGlobalFilter}
  />
)}
```

---

## 7. Stories

| Story | Config | Play function |
|-------|--------|---------------|
| `WithSearch` | Search on `header` + `reviewer` columns | Types in input → verifies filtered row count → clears via × → verifies rows restored |
| `WithSorting` | Sort options for price asc/desc | Opens dropdown → selects "Price, high to low" → verifies first row has highest price |
| `WithToolbar` | Both search and sorting | Types search → applies sort → verifies combined behaviour |

---

## 8. Tests (`data-table.test.tsx`)

New `validateConfig` test cases:

| Test | Input | Expected |
|------|-------|----------|
| `toolbar.search with empty columnIds throws` | `{ toolbar: { search: { columnIds: [] } } }` | Error |
| `toolbar.search with non-existent columnId throws` | `columnIds: ["nonexistent"]` | Error |
| `toolbar.sorting with non-existent columnId throws` | `sorting: [{ columnId: "nonexistent", ... }]` | Error |
| `valid toolbar config passes` | Valid search + sorting config | No error |

---

## 9. Barrel exports

No new public exports. `DataTableToolbar` is internal — it's composed by `DataTable` and never used standalone.

The new types (`DataTableToolbarConfig`, `SortOption`) are exported from the barrel for consumers who build config objects in separate files.

---

## 10. File change summary

| File | Change |
|------|--------|
| `data-table-types.ts` | Add `DataTableToolbarConfig`, `SortOption`, `toolbar?` field on config |
| `use-data-table.ts` | Add `globalFilter` state, column restriction, new validations, expanded return type |
| `data-table-toolbar.tsx` | **New file** — internal toolbar component |
| `data-table.tsx` | Import + conditionally render `DataTableToolbar` |
| `data-table.stories.tsx` | Add 3 new stories with play functions |
| `data-table.test.tsx` | Add 4 new validation test cases |
| `index.ts` | Export `DataTableToolbarConfig`, `SortOption` types |

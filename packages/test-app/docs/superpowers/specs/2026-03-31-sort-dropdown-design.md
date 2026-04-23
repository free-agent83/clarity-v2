# Sort Dropdown — Design Spec

**Issue:** #12 — Product sorting: functional sort dropdown
**Branch:** issue-12
**Phase:** 0 (UI-only; no data re-sorting)
**Date:** 2026-03-31

---

## Summary

Add an interactive "Sort by" dropdown to all product listing pages (PLPs). Clicking the button opens a dropdown; selecting an option updates the button label and closes the dropdown. No actual list re-sorting happens in Phase 0.

---

## Architecture

### New file: `components/layouts/layout-product-list/sort-button.tsx`

A `"use client"` component. Owns a single piece of state: the selected sort value (`string`). The button label is **derived during render** from the selected value — no second state variable, no effect.

Uses `DropdownMenu` + `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` from `components/ui/dropdown-menu.tsx` for native single-select behaviour (checkmark on active item, auto-closes on selection).

```tsx
type SortOption = {
  value: string       // unique key, e.g. "price_asc"
  label: string       // dropdown item text, e.g. "Price: Low → High"
  displayLabel: string // short button label, e.g. "Price ↑"
}
```

Props: `options: SortOption[]`. No default export — named export `SortButton`.

### Modified: `components/layouts/layout-product-list/layout-product-list.tsx`

Add one optional prop: `sortOptions?: SortOption[]`. When provided, renders `<SortButton options={sortOptions} />` in place of the current static button. When absent, the sort button is hidden entirely (safe for any future PLP that opts out).

`layout-product-list.tsx` stays a Server Component. `SortButton` is the only client boundary added.

### Modified: all 6 PLP pages

Each page file defines its own `SORT_OPTIONS` constant at module scope and passes it to `LayoutProductList`:

| Page | Sort options |
|------|-------------|
| Natural Diamonds | Featured, Price ↑, Price ↓, Newest, Carat |
| Lab-grown Diamonds | Featured, Price ↑, Price ↓, Newest, Carat |
| Gemstones | Featured, Price ↑, Price ↓, Newest, Carat |
| Natural Melee | Featured, Price ↑, Price ↓, Newest, Carat |
| Lab-grown Melee | Featured, Price ↑, Price ↓, Newest, Carat |
| Engagement Rings | Featured, Price ↑, Price ↓, Newest |

---

## Label Format

| Dropdown item | Button label |
|---------------|-------------|
| Featured | `Sort by: Featured` |
| Price: Low → High | `Sort by: Price ↑` |
| Price: High → Low | `Sort by: Price ↓` |
| Newest | `Sort by: Newest` |
| Carat | `Sort by: Carat` |

The `displayLabel` field on each `SortOption` carries the short form. The button renders `Sort by: {displayLabel}` derived inline during render.

---

## Behaviour

- Default selected value is `sortOptions[0].value` (first option = "Featured")
- Click button → dropdown opens
- Click option → label updates, dropdown closes (handled automatically by `DropdownMenuRadioItem`)
- No URL params, no data-layer calls (Phase 0)

---

## Constraints (from Vercel React best practices)

- **`rerender-derived-state-no-effect`** — button label derived from `selectedValue` during render, not stored in state or computed in an effect
- **`rerender-no-inline-components`** — `SortButton` defined in its own file, never inside `LayoutProductList`
- **`server-serialization`** — `SortOption` type contains only the three string fields the client actually uses; `SORT_OPTIONS` constants defined at module scope on each page

---

## Phase 1 Upgrade Path

When real sorting is wired up:
1. Add `defaultSort?: string` prop to `SortButton` (reads from URL search param on the server, passed down)
2. Add `onSortChange` callback or use `useRouter` inside `SortButton` to write `?sort=` to the URL
3. Pages read `searchParams.sort` and pass it to the data-fetch call

No structural changes needed — the component boundary and prop shape are already correct.

---

## Files Changed

| File | Change |
|------|--------|
| `components/layouts/layout-product-list/sort-button.tsx` | **New** — `SortButton` client component |
| `components/layouts/layout-product-list/layout-product-list.tsx` | Add `sortOptions?` prop, render `<SortButton>` |
| `app/buyer/(shop)/browse/natural-diamonds/page.tsx` | Add `SORT_OPTIONS`, pass to layout |
| `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx` | Add `SORT_OPTIONS`, pass to layout |
| `app/buyer/(shop)/browse/gemstones/page.tsx` | Add `SORT_OPTIONS`, pass to layout |
| `app/buyer/(shop)/browse/natural-melee/page.tsx` | Add `SORT_OPTIONS`, pass to layout |
| `app/buyer/(shop)/browse/lab-grown-melee/page.tsx` | Add `SORT_OPTIONS`, pass to layout |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx` | Add `SORT_OPTIONS` (no Carat), pass to layout |

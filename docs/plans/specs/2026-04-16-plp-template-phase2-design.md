---
title: PLP Template — Phase 2 Implementation Design
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-16
status: Implemented
parent: docs/plans/specs/2026-04-16-plp-template-component-spec.md
predecessor: docs/plans/specs/2026-04-16-plp-template-phase1-design.md
tags:
  - design-system
  - plp
  - phase-2
  - list-view
  - implementation-design
---

# PLP Template — Phase 2 Implementation Design

## Scope

Phase 2 adds **list view** to the PLP template, alongside the existing grid view shipped in Phase 1. List view is a density-oriented alternative for advanced users browsing highly-standardised categories (diamonds is the canonical case). It prioritises scan density and parameter-by-parameter comparison over visual richness.

### Phase 2 includes

- List view with the full column model (core columns + category-configured columns)
- Grid/list view toggle in the toolbar, opt-in per category
- Responsive fallback: list view disabled below tablet (< 1024px); toggle hidden at those widths; template falls back to grid internally if consumer sets `viewMode="list"` at a disabled width
- Actions column with hover-gated Add to cart + More menu (platform actions + category actions)
- Skeleton loading rows for list view
- Empty and error states shared with grid view (rendered within the table area)
- Storybook stories demonstrating list view with gemstone-like and diamond-like category configs

### Phase 2 excludes

- Column header sorting (spec §4.5: all sorting driven by toolbar Sort dropdown)
- User-configurable row density (spec §4.3: single comfortable density, no toggle)
- Sticky columns (spec §4.4: only header is sticky; horizontal overflow scrolls normally)
- Column reordering, resizing, hiding (not in any phase currently)
- Bulk selection column (deferred to future phase alongside grid view bulk)

### Relationship to Phase 1

Phase 2 does not modify any Phase 1 component behaviour. It adds:

- A new `listColumns` consumer prop on `PlpTemplate`
- A new `viewMode` + `onViewModeChange` controlled pair on `PlpTemplate`
- Internal sub-components for list view (table, row, column renderers, skeleton)
- A new view toggle in the toolbar (hidden when `listColumns` is empty or undefined)

The `renderGridItem` mapper continues to produce `GridItemData` exactly as in Phase 1. List view reads from the same `GridItemData` for its fixed core columns and reads the raw `TItem` for category-configured columns via each column's `cell` function.

---

## 1. List view availability and view toggle

### Opt-in

A category opts into list view by supplying a non-empty `listColumns` array. No separate `enableListView` flag — the presence of columns is the opt-in. A category with no list view simply doesn't pass `listColumns`.

### View toggle in toolbar

- A new grid/list toggle appears in the toolbar when `listColumns` is provided and non-empty
- Toggle lives to the left of the Sort dropdown
- Hidden entirely when list view is not available
- Hidden also on mobile (< 1024px), even when available — list view is disabled below tablet per §6.2

### View mode state

The template is stateless with respect to view mode — consumer owns it:

```ts
viewMode: "grid" | "list";
onViewModeChange: (mode: "grid" | "list") => void;
```

Consumer passes the current mode and receives change events. Consumer decides whether to persist (URL, localStorage, etc.) — same pattern as filter state and sort.

### Responsive fallback

List view requires ≥ 1024px viewport. Below that:

- The view toggle in the toolbar hides itself
- If the consumer's `viewMode` is `"list"` at a disabled viewport width, the template **silently falls back to grid** without calling `onViewModeChange`
- When the viewport grows back to ≥ 1024px, the template honors the consumer's stored `viewMode` again

This means the consumer's state reflects their intent; the template resolves what to render based on intent + viewport.

The template detects viewport via a `matchMedia` listener (same pattern as the existing `useIsMobile` hook but for the tablet breakpoint).

---

## 2. Column model

### Fixed core columns (template-rendered)

In order, leftmost to rightmost:

| Column | Data source | Notes |
|--------|-------------|-------|
| Thumbnail | `data.thumbnailSrc`, `data.thumbnailAlt` | 1:1 image, clickable, opens item detail. No hover actions toolbar, no 360 rotate — just the static image. |
| Name + lead | `data.name`, `data.lead` | Name on top as bold text, optional lead underneath in muted style. |
| *(category-configured columns fill here — see §2.2)* | | |
| Delivery | `data.delivery` | Inherits Express badge, shipping origin rendering from Phase 1 grid item's delivery logic. |
| Returns | `data.returns` | Same returnable / non-returnable rendering as grid view. |
| Price | `data.pricing` | Inherits discount, legacy, multi-currency, tariff variants. |
| Price/ct *(conditional)* | `data.pricing.perCarat` | Separate column rather than stacked under Price so the list stays scannable. Column hidden if no item in the current page has `perCarat` data. |
| Actions (rightmost) | `data.onAddToCart`, platform actions, `data.categoryActions` | Add to cart primary + More menu. Hover-gated (see §3). |

### Category-configured columns (§2.2)

Categories define middle-table columns via a `listColumns` prop on `PlpTemplate`:

```ts
interface ListColumn<TItem> {
  id: string;
  header: string;
  /**
   * Cell render function — receives the raw item (not GridItemData) and
   * returns any ReactNode. This gives the category full access to original
   * item data (fields that don't live on GridItemData) without needing to
   * smuggle them through the grid item shape.
   */
  cell: (item: TItem) => ReactNode;
  /** Optional fixed width (CSS value or number of pixels). */
  width?: number | string;
  /**
   * Optional text alignment for the cell and header.
   * Defaults to "left".
   */
  align?: "left" | "center" | "right";
}
```

Consumer passes an array of `ListColumn<TItem>`. Columns render in the order provided, between the fixed "Name + lead" and "Delivery" columns.

### Unpacked badges

Categories decompose what grid badges convey into individual columns. Example (diamond):

- Grid view: `badges: [<OriginBadge country="Brazil" />, <CertBadge lab="IGI" number="287329347" />]`
- List view `listColumns`:
  ```ts
  [
    { id: "origin", header: "Origin", cell: (item) => <OriginCell country={item.origin} /> },
    { id: "cert", header: "Certificate", cell: (item) => <CertCell lab={item.lab} number={item.certNumber} /> },
    { id: "carat", header: "Carat", cell: (item) => item.carat },
    { id: "color", header: "Color", cell: (item) => item.color },
    { id: "clarity", header: "Clarity", cell: (item) => item.clarity },
  ]
  ```

The category decides the decomposition. The template does not infer columns from badges — they are independent rendering paths for the same underlying item.

### Price/ct conditional column visibility

Price/ct only makes sense for categories that sell by weight (loose stones). The column renders **only when at least one item in the current page has `pricing.perCarat`**. Computed once per render from the items array. This keeps categories that don't use per-carat pricing (jewellery) from getting an empty column.

No consumer config required — the conditional rendering is driven by data.

---

## 3. Actions column

The rightmost column. Per §4.3 of the architectural spec and the Phase 2 decision to hover-gate actions:

- **Add to cart** primary Button (full button, not icon-only) — hover-gated per the user's decision
- **More menu** (DropdownMenu) containing:
  - Platform actions: favorite, share, viewMedia (template-owned, always shown if the corresponding `onFavorite` / `onShare` / `onViewMedia` callback exists on `GridItemData`)
  - Category actions from `data.categoryActions` (if any)
- Both Add to cart and More menu are revealed on row hover / focus-within (same mechanism as grid view's hover-gating)
- Space is reserved in the DOM so there's no layout shift when actions appear (visibility/opacity, not display:none)

On touch devices, actions are always visible (same fallback as grid view via `@media(hover:none)`).

Selection checkbox is not added in Phase 2 — deferred to the future bulk-selection phase.

---

## 4. Row behaviour

- **Row click opens item detail** — same target as clicking the thumbnail or name. Implemented by wrapping the entire row in a click handler that calls a new `onItemClick?: (item: TItem) => void` consumer callback. Actions column buttons stop propagation so they don't trigger row click.
- **Hover state:** subtle background tint on the entire row (using `hover:bg-muted/50` or equivalent token-based class).
- **Focus management:** `Tab` moves across interactive cells within a row (thumbnail link, any category-supplied links, Add to cart, More menu). Non-interactive cells are skipped by keyboard tab traversal.

---

## 5. Sticky header and scrolling

- Table header is sticky to the top of the scroll container (`position: sticky; top: 0`).
- The header becomes visually distinct on scroll (border-bottom + subtle background). This replaces the toolbar's sticky active-filters strip behaviour only within the table's scroll context — the active-filters strip above still works as in Phase 1.
- No sticky columns. Horizontal overflow scrolls normally.
- The table scrolls vertically within its container; the page doesn't scroll separately from the table.

---

## 6. Consumer API additions

New props on `PlpTemplateProps<TItem>`:

```ts
// List view opt-in — category-configured middle columns
listColumns?: ListColumn<TItem>[];

// View mode — controlled state
viewMode?: "grid" | "list";           // defaults to "grid" when undefined
onViewModeChange?: (mode: "grid" | "list") => void;

// Row click — list view only, optional
onItemClick?: (item: TItem) => void;
```

None of these are required. A consumer that doesn't want list view ignores them entirely.

Example usage showing the additions:

```tsx
<PlpTemplate
  // ...all Phase 1 props...

  listColumns={[
    { id: "carat", header: "Carat", cell: (item) => item.carat },
    { id: "color", header: "Color", cell: (item) => item.color },
    { id: "clarity", header: "Clarity", cell: (item) => item.clarity },
    { id: "shape", header: "Shape", cell: (item) => item.shape },
    { id: "origin", header: "Origin", cell: (item) => <OriginCell country={item.origin} /> },
    { id: "cert", header: "Certificate", cell: (item) => <CertCell lab={item.lab} number={item.certNumber} /> },
  ]}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  onItemClick={(item) => navigate(`/item/${item.id}`)}
/>
```

---

## 7. File structure additions

```
src/components/templates/plp/
├── ...existing Phase 1 files...
│
├── list/
│   ├── plp-list.tsx              List view container (sticky header, scroll behaviour)
│   ├── plp-list-row.tsx          Individual row renderer
│   ├── plp-list-skeleton.tsx     Skeleton rows for loading state
│   └── plp-list-actions-cell.tsx Actions column cell (Add to cart + More menu)
│
└── toolbar/
    └── plp-view-toggle.tsx       Grid/list toggle button pair
```

Existing `plp-template.tsx` is modified to:

- Accept new props (`listColumns`, `viewMode`, `onViewModeChange`, `onItemClick`)
- Thread `viewMode` to `PlpToolbar` (which renders the toggle)
- Switch between `<PlpGrid>` and `<PlpList>` based on `viewMode` + viewport detection
- Use `PlpListSkeleton` instead of `PlpGridSkeleton` when `viewMode="list"` and loading

Existing `plp-toolbar.tsx` is modified to:

- Accept `viewMode`, `onViewModeChange`, and a boolean indicating whether list view is available (i.e., `listColumns` is non-empty)
- Render `PlpViewToggle` to the left of Sort when list view is available and viewport is tablet+

A new `useIsTabletUp` hook (or similar) detects the 1024px breakpoint. Lives in `hooks/` alongside existing `useIsMobile`.

---

## 8. Type additions

```ts
// plp-types.ts additions

/**
 * A category-configured column for list view.
 *
 * The `cell` function receives the raw item (not GridItemData) so the
 * category has full access to original item data.
 */
export interface ListColumn<TItem> {
  id: string;
  header: string;
  cell: (item: TItem) => ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
}

/** View mode — grid or list. */
export type PlpViewMode = "grid" | "list";
```

---

## 9. Storybook strategy

Two new stories added to `plp-template.stories.tsx`:

| Story | Purpose |
|-------|---------|
| `DiamondListView` | Diamond-like category with 6 list columns (Carat, Color, Clarity, Shape, Origin, Certificate). Demonstrates the density-oriented view. Uses `viewMode="list"`. |
| `GemstoneListView` | Reuses the Phase 1 gemstone mock data with 4 list columns (Color, Size, Origin, Treatment). Shows that categories can keep simpler column sets. |

One new story in a new file, if warranted:

- `plp-list.stories.tsx` (optional, in `Templates/PLP List`) — isolated list component for reviewing header behaviour, hover states, and actions column. Lower priority; the full template stories cover most cases.

Both existing stories (`GemstoneCategory`, `JewelryCategory`) stay grid-only — they don't pass `listColumns`, so the toggle stays hidden. This demonstrates the "no list view" path.

---

## 10. Accessibility (Phase 2 additions)

Per the architectural spec §5.1 and §5.2:

- List view uses semantic `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` — inherits default table semantics for screen readers.
- Row click handler must not interfere with tab traversal of cell interactives. Row-level click is implemented on the `<tr>` via a click handler with `role="link"` + `tabIndex={0}` + keyboard handler (Enter/Space), but interactive cells stop propagation.
- Actions column buttons: `aria-label` on each action (platform action labels are "Add to shortlist", "Share", "View media"; category actions supply their own label).
- Sticky header announces correctly via native `<th scope="col">`.
- View toggle: `role="group"` wrapping two `role="radio"` buttons with `aria-checked`, so screen readers understand it as a mutually exclusive view choice. Announces the current view.
- Viewport-based fallback to grid does not require an announcement — the consumer's intent is preserved, the rendering simply adapts.

---

## 11. Loading, empty, error states in list view

- **Loading** (`status="loading"`): renders `PlpListSkeleton` — a table with sticky header (showing column headers) and skeleton `<td>` cells for each row. Row count matches `pageSize`.
- **Empty (`empty-filtered`, `empty-no-items`)**: renders the existing `PlpEmpty` component *below* the table header (so the column headers remain visible). The empty state replaces the `<tbody>` rows.
- **Error**: renders `PlpError` below the table header, same approach as empty.

The state rendering location distinguishes list view from grid view: in grid view the empty/error state replaces the grid entirely; in list view it replaces the rows while keeping the column context visible.

---

## 12. Phase 2 not responsible for

Explicitly out of scope, to protect against scope creep:

- URL serialisation of view mode (that's the consumer's routing adapter, Phase 3+ addressed in architectural spec §9.2)
- Column header sorting — the Sort dropdown in the toolbar is the sole sort mechanism
- Column reordering / resizing / hiding
- Row density toggles
- Sticky columns
- Bulk selection column (deferred)
- Analytics events specific to list view (belongs in Phase 3 with the full analytics hook set)

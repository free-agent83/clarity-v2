# PLP Template Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add list view to the PLP template — a density-oriented table alternative to the grid view, with a grid/list toggle, category-configured columns, and responsive fallback to grid below the tablet breakpoint.

**Architecture:** List view is a sibling rendering mode to the existing grid view. A new `listColumns` consumer prop opts the category in; a new controlled `viewMode` prop (with viewport-based fallback) selects the rendering mode. Fixed core columns (thumbnail, name, delivery, returns, price, price/ct conditional, actions) are template-owned and read from the existing `GridItemData` shape; category-configured middle columns receive the raw `TItem` via each column's `cell` function. No changes to Phase 1 behaviour — all Phase 2 props are optional.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, existing Clarity V2 atoms/molecules/organisms (`Table` organism, `DropdownMenu` molecule, `ToggleGroup` atom, `Button` atom, Tabler icons), Storybook 8.6 (CSF3).

**Design spec:** `docs/plans/specs/2026-04-16-plp-template-phase2-design.md`
**Phase 1 design (for context):** `docs/plans/specs/2026-04-16-plp-template-phase1-design.md`

---

## File map

All files live under `packages/components/src/components/templates/plp/`. Base path abbreviated as `plp/` below.

| File | Action | Responsibility |
|------|--------|---------------|
| `plp/plp-types.ts` | Modify | Add `ListColumn<TItem>` interface and `PlpViewMode` type |
| `plp/hooks/use-is-tablet-up.ts` | Create | Hook for detecting viewport ≥ 1024px |
| `plp/list/plp-list.tsx` | Create | List view container — table with sticky header, maps items to rows |
| `plp/list/plp-list-row.tsx` | Create | Individual row renderer — fixed cells + category cells + actions cell |
| `plp/list/plp-list-actions-cell.tsx` | Create | Actions column cell (Add to cart button + More menu) |
| `plp/list/plp-list-skeleton.tsx` | Create | Skeleton rows for loading state |
| `plp/toolbar/plp-view-toggle.tsx` | Create | Grid/list toggle ToggleGroup |
| `plp/toolbar/plp-toolbar.tsx` | Modify | Accept view toggle props; render toggle when list view available |
| `plp/plp-template.tsx` | Modify | Accept new props; switch grid/list based on viewMode + viewport |
| `plp/plp-template.stories.tsx` | Modify | Add `DiamondListView` + `GemstoneListView` stories |
| `plp/COMPONENT.md` | Modify | Document new props |
| `packages/components/CHANGELOG.md` | Modify | Add Phase 2 entry |

---

## Conventions reference

Read `packages/components/CONTRIBUTING.md` before writing code. Fast recap for this plan:

- **Imports:** `cn()` from `@/lib/utils`. Existing components from tier paths (e.g. `../../organisms/table/table`).
- **Props:** `interface` for props, extend native HTML element, `VariantProps` if CVA.
- **Exports:** Named only. Export component + props type.
- **Comments:** JSDoc on every named export. No other comments.
- **Tokens:** Tailwind theme classes or `var(--token)` only. No raw literals.
- **Stories:** CSF3, `tags: ["autodocs"]`. Compose from system components only — no raw `<input>`/`<button>` in stories.
- **Client components:** `"use client"` directive on files that use hooks or state.

---

## Task 1: Types (ListColumn, PlpViewMode)

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-types.ts`

Add two new exports to the types file.

- [ ] **Step 1: Append the new types**

At the end of `plp/plp-types.ts` (after the existing `PlpStatus` export), append:

```ts

// -- List view --------------------------------------------------------------

/**
 * A category-configured column for list view.
 *
 * The `cell` function receives the raw item (not `GridItemData`) so the
 * category has full access to original item data — including fields that
 * don't live on `GridItemData` (e.g., certificate number, carat, clarity).
 */
export interface ListColumn<TItem> {
  id: string;
  header: string;
  cell: (item: TItem) => ReactNode;
  /** Optional fixed width (CSS value or number of pixels). */
  width?: number | string;
  /** Text alignment for cell and header. Defaults to "left". */
  align?: "left" | "center" | "right";
}

/** View mode — grid or list. */
export type PlpViewMode = "grid" | "list";
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-types.ts
git commit -m "feat(plp): add ListColumn and PlpViewMode types for list view"
```

---

## Task 2: useIsTabletUp hook

**Files:**
- Create: `packages/components/src/components/templates/plp/hooks/use-is-tablet-up.ts`

A hook that mirrors the existing `useIsMobile` pattern (`packages/components/src/hooks/use-mobile.ts`) but for the tablet+ breakpoint (≥ 1024px). Lives under the PLP template folder because it's PLP-specific for now; if a second template needs it, it gets promoted to the shared `hooks/` folder.

- [ ] **Step 1: Create the hook**

```ts
// plp/hooks/use-is-tablet-up.ts
import * as React from "react";

const TABLET_BREAKPOINT = 1024;

/**
 * Returns `true` when the viewport is ≥ 1024px (tablet and above).
 *
 * Follows the same pattern as `useIsMobile` but inverted and tuned to the
 * tablet breakpoint. Used by the PLP template to decide whether list view
 * is available at the current viewport width.
 *
 * Returns `false` during SSR and the first client render, then updates to
 * the actual value after the `matchMedia` listener attaches.
 */
export function useIsTabletUp(): boolean {
  const [isTabletUp, setIsTabletUp] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
    const onChange = () => {
      setIsTabletUp(window.innerWidth >= TABLET_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsTabletUp(window.innerWidth >= TABLET_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTabletUp;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/hooks/
git commit -m "feat(plp): add useIsTabletUp hook for viewport detection"
```

---

## Task 3: Actions cell (Add to cart + More menu)

**Files:**
- Create: `packages/components/src/components/templates/plp/list/plp-list-actions-cell.tsx`

The rightmost cell of every data row. Renders a hover-gated Add to cart button and a More menu (DropdownMenu) containing platform actions (favorite, share, viewMedia) + any category-specific actions.

Platform actions rendered only if the corresponding callback (`onFavorite`, `onShare`, `onViewMedia`) exists on the `GridItemData`. This matches Phase 1 grid item behaviour where undefined platform callbacks cause the button to still render but no-op — but in a dropdown context, it's cleaner to hide the item entirely when the consumer didn't wire it up.

- [ ] **Step 1: Create the actions cell**

```tsx
// plp/list/plp-list-actions-cell.tsx
"use client";

import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../molecules/dropdown-menu/dropdown-menu";
import type { GridItemData } from "../plp-types";

/**
 * Actions column cell for list view.
 *
 * Renders an Add to cart button and a More menu containing platform
 * actions (favorite, share, viewMedia — shown only when the corresponding
 * callback is provided) and any category-specific actions from
 * `data.categoryActions`.
 *
 * Hover-gated: becomes visible on row hover/focus-within and on touch
 * devices (where hover doesn't apply).
 */
export function PlpListActionsCell({ data }: { data: GridItemData }) {
  const hasPlatformActions =
    !!data.onFavorite || !!data.onShare || !!data.onViewMedia;
  const hasCategoryActions =
    !!data.categoryActions && data.categoryActions.length > 0;
  const hasMoreMenu = hasPlatformActions || hasCategoryActions;

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1",
        "opacity-0 transition-opacity group-hover/plp-row:opacity-100 group-focus-within/plp-row:opacity-100",
        "[@media(hover:none)]:opacity-100"
      )}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          data.onAddToCart();
        }}
      >
        Add to cart
      </Button>

      {hasMoreMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More actions"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {data.onFavorite && (
              <DropdownMenuItem
                onSelect={() => data.onFavorite?.(data.id)}
              >
                <IconHeart className="h-4 w-4" />
                Add to shortlist
              </DropdownMenuItem>
            )}
            {data.onShare && (
              <DropdownMenuItem
                onSelect={() => data.onShare?.(data.id)}
              >
                <IconShare className="h-4 w-4" />
                Share
              </DropdownMenuItem>
            )}
            {data.onViewMedia && (
              <DropdownMenuItem
                onSelect={() => data.onViewMedia?.(data.id)}
              >
                <IconPhoto className="h-4 w-4" />
                View media
              </DropdownMenuItem>
            )}
            {hasPlatformActions && hasCategoryActions && (
              <DropdownMenuSeparator />
            )}
            {data.categoryActions?.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onSelect={() => action.onAction(data.id)}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/list/
git commit -m "feat(plp): add list view actions cell with Add to cart and More menu"
```

---

## Task 4: List row

**Files:**
- Create: `packages/components/src/components/templates/plp/list/plp-list-row.tsx`

Renders a single row. Reads `GridItemData` for the fixed core cells (thumbnail, name+lead, delivery, returns, price, price/ct). Renders category-configured columns in the middle by invoking each column's `cell` function with the raw `TItem`. Actions cell is always rightmost.

Pricing variant rendering is shared with grid view via duplication here — not extracted into a shared helper in this phase, to keep grid and list independent. If a third surface needs it, extract then.

- [ ] **Step 1: Create the list row**

```tsx
// plp/list/plp-list-row.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { TableCell, TableRow } from "../../../organisms/table/table";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData, ListColumn, PlpUserContextValue } from "../plp-types";
import { PlpListActionsCell } from "./plp-list-actions-cell";

/**
 * Formats a number as a currency string using the en-US locale.
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Renders the main Price cell with all pricing variants from data + user context.
 */
function PriceCell({
  pricing,
  userContext,
}: {
  pricing: GridItemData["pricing"];
  userContext: PlpUserContextValue;
}) {
  const showTariffs =
    pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    !!pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="flex flex-col gap-0.5">
      {pricing.discount && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-success">
            {pricing.discount.percentage}% below
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </span>
        </div>
      )}
      <div className="text-sm font-semibold text-foreground">
        {formatCurrency(pricing.amount, pricing.currency)}
      </div>
      {showTariffs && (
        <div className="text-xs text-muted-foreground">Incl. US tariffs</div>
      )}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <div className="text-xs text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </div>
      )}
      {showMultiCurrency && (
        <div className="text-xs text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </div>
      )}
    </div>
  );
}

/**
 * A single row in the PLP list view.
 *
 * Renders fixed core cells (thumbnail, name+lead, delivery, returns, price,
 * price/ct, actions) around the category-configured middle columns.
 * Invokes each category column's `cell` function with the raw item.
 *
 * The row itself is clickable (opens item detail via `onItemClick`), with
 * interactive cells stopping propagation so their own click handlers fire.
 */
export function PlpListRow<TItem>({
  item,
  data,
  listColumns,
  showPricePerCarat,
  onItemClick,
}: {
  item: TItem;
  data: GridItemData;
  listColumns: ListColumn<TItem>[];
  showPricePerCarat: boolean;
  onItemClick?: (item: TItem) => void;
}) {
  const userContext = usePlpUserContext();

  const clickable = !!onItemClick;

  function handleRowClick() {
    onItemClick?.(item);
  }

  function handleRowKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onItemClick?.(item);
    }
  }

  return (
    <TableRow
      className={cn(
        "group/plp-row",
        clickable && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      role={clickable ? "link" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleRowClick : undefined}
      onKeyDown={clickable ? handleRowKeyDown : undefined}
    >
      {/* Thumbnail */}
      <TableCell>
        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
          <img
            src={data.thumbnailSrc}
            alt={data.thumbnailAlt}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </TableCell>

      {/* Name + lead */}
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-medium text-foreground">{data.name}</div>
          {data.lead && (
            <div className="text-xs text-muted-foreground">{data.lead}</div>
          )}
        </div>
      </TableCell>

      {/* Category-configured columns */}
      {listColumns.map((column) => (
        <TableCell
          key={column.id}
          style={{
            textAlign: column.align ?? "left",
            width:
              typeof column.width === "number"
                ? `${column.width}px`
                : column.width,
          }}
        >
          {column.cell(item)}
        </TableCell>
      ))}

      {/* Delivery */}
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs">
          <div className="flex items-center gap-1">
            {data.delivery.isExpress && (
              <Badge variant="success" size="sm">
                Express
              </Badge>
            )}
            <span className="text-foreground">{data.delivery.estimatedDate}</span>
          </div>
          <div className="text-muted-foreground">
            from {data.delivery.shipsFrom}
          </div>
        </div>
      </TableCell>

      {/* Returns */}
      <TableCell>
        {data.returns.isReturnable ? (
          <span className="text-xs text-success">Returnable</span>
        ) : (
          <span className="text-xs text-destructive">Non-returnable</span>
        )}
      </TableCell>

      {/* Price */}
      <TableCell>
        <PriceCell pricing={data.pricing} userContext={userContext} />
      </TableCell>

      {/* Price/ct (conditional) */}
      {showPricePerCarat && (
        <TableCell>
          {data.pricing.perCarat ? (
            <span className="text-xs text-foreground">
              {formatCurrency(
                data.pricing.perCarat.amount,
                data.pricing.perCarat.currency
              )}
              /ct
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      )}

      {/* Actions */}
      <TableCell>
        <PlpListActionsCell data={data} />
      </TableCell>
    </TableRow>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/list/plp-list-row.tsx
git commit -m "feat(plp): add list view row with fixed core cells and category columns"
```

---

## Task 5: List container

**Files:**
- Create: `packages/components/src/components/templates/plp/list/plp-list.tsx`

The table container. Builds the header from fixed columns + category columns + price/ct (conditional) + actions. Maps items to rows. Computes `showPricePerCarat` from the items array. Handles sticky header styling on the `<thead>`.

- [ ] **Step 1: Create the list container**

```tsx
// plp/list/plp-list.tsx
"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../organisms/table/table";
import type { GridItemData, ListColumn } from "../plp-types";
import { PlpListRow } from "./plp-list-row";

/**
 * List view container — a table of items with sticky header.
 *
 * Renders fixed core columns around category-configured middle columns.
 * The Price/ct column is conditionally rendered when at least one item in
 * the current page has per-carat pricing data.
 *
 * No sticky columns — horizontal overflow scrolls normally in the
 * underlying Table organism.
 */
export function PlpList<TItem>({
  items,
  renderGridItem,
  listColumns,
  onItemClick,
}: {
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;
  listColumns: ListColumn<TItem>[];
  onItemClick?: (item: TItem) => void;
}) {
  const rows = useMemo(
    () => items.map((item) => ({ item, data: renderGridItem(item) })),
    [items, renderGridItem]
  );

  const showPricePerCarat = useMemo(
    () => rows.some(({ data }) => !!data.pricing.perCarat),
    [rows]
  );

  return (
    <Table data-slot="plp-list">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead className="w-[72px]">
            <span className="sr-only">Thumbnail</span>
          </TableHead>
          <TableHead>Name</TableHead>
          {listColumns.map((column) => (
            <TableHead
              key={column.id}
              style={{
                textAlign: column.align ?? "left",
                width:
                  typeof column.width === "number"
                    ? `${column.width}px`
                    : column.width,
              }}
            >
              {column.header}
            </TableHead>
          ))}
          <TableHead>Delivery</TableHead>
          <TableHead>Returns</TableHead>
          <TableHead>Price</TableHead>
          {showPricePerCarat && <TableHead>Price/ct</TableHead>}
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, data }) => (
          <PlpListRow
            key={data.id}
            item={item}
            data={data}
            listColumns={listColumns}
            showPricePerCarat={showPricePerCarat}
            onItemClick={onItemClick}
          />
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/list/plp-list.tsx
git commit -m "feat(plp): add list view container with sticky header and conditional price/ct"
```

---

## Task 6: List skeleton

**Files:**
- Create: `packages/components/src/components/templates/plp/list/plp-list-skeleton.tsx`

Skeleton loading state for list view. Renders a table with real column headers (so the list structure is immediately visible) and skeleton `<td>` cells for each row. Row count matches `pageSize`.

- [ ] **Step 1: Create the list skeleton**

```tsx
// plp/list/plp-list-skeleton.tsx
import { Skeleton } from "../../../atoms/skeleton/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../organisms/table/table";
import type { ListColumn } from "../plp-types";

/**
 * Skeleton loading state for the PLP list view.
 *
 * Renders the table header with real column labels so the list structure
 * is visible immediately, and replaces row data with Skeleton blocks.
 */
export function PlpListSkeleton<TItem>({
  listColumns,
  count = 20,
}: {
  listColumns: ListColumn<TItem>[];
  count?: number;
}) {
  const columnCount = 2 /* thumb + name */ + listColumns.length + 3 /* delivery + returns + price */ + 1 /* actions */;

  return (
    <Table data-slot="plp-list-skeleton">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead className="w-[72px]">
            <span className="sr-only">Thumbnail</span>
          </TableHead>
          <TableHead>Name</TableHead>
          {listColumns.map((column) => (
            <TableHead key={column.id}>{column.header}</TableHead>
          ))}
          <TableHead>Delivery</TableHead>
          <TableHead>Returns</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: count }, (_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <Skeleton className="h-12 w-12 rounded-md" />
            </TableCell>
            {Array.from({ length: columnCount - 2 }, (_, cellIndex) => (
              <TableCell key={cellIndex}>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            ))}
            <TableCell>
              <Skeleton className="ml-auto h-8 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/list/plp-list-skeleton.tsx
git commit -m "feat(plp): add list view skeleton loading state"
```

---

## Task 7: View toggle component

**Files:**
- Create: `packages/components/src/components/templates/plp/toolbar/plp-view-toggle.tsx`

A two-button ToggleGroup for grid/list mode. Uses Tabler icons. Wraps `ToggleGroup` from the atoms tier.

- [ ] **Step 1: Create the view toggle**

```tsx
// plp/toolbar/plp-view-toggle.tsx
"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../atoms/toggle-group/toggle-group";
import type { PlpViewMode } from "../plp-types";

/**
 * Grid/list view toggle.
 *
 * Renders two mutually exclusive toggle buttons — one for grid, one for
 * list. Announces as a radio group to screen readers via ToggleGroup's
 * underlying semantics (type="single").
 */
export function PlpViewToggle({
  value,
  onValueChange,
}: {
  value: PlpViewMode;
  onValueChange: (value: PlpViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next === "grid" || next === "list") {
          onValueChange(next);
        }
      }}
      aria-label="View mode"
      className="shrink-0"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <IconLayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <IconListDetails className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/toolbar/plp-view-toggle.tsx
git commit -m "feat(plp): add grid/list view toggle component"
```

---

## Task 8: Wire view toggle into toolbar

**Files:**
- Modify: `packages/components/src/components/templates/plp/toolbar/plp-toolbar.tsx`

Add three optional props (`viewMode`, `onViewModeChange`, `showViewToggle`). Render `PlpViewToggle` to the left of the sort dropdown when `showViewToggle` is true and both `viewMode` + `onViewModeChange` are provided. The toggle is also hidden on mobile via Tailwind classes (`hidden lg:flex` wrapper).

- [ ] **Step 1: Open the current toolbar file**

Read `packages/components/src/components/templates/plp/toolbar/plp-toolbar.tsx` to confirm the current structure.

- [ ] **Step 2: Replace the file with the updated version**

```tsx
// plp/toolbar/plp-toolbar.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Input } from "../../../atoms/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import { PlpQuickFilter } from "./plp-quick-filter";
import { PlpViewToggle } from "./plp-view-toggle";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
  PlpViewMode,
  SortOption,
} from "../plp-types";

/**
 * PLP toolbar — search, All Filters button, quick filters, view toggle, and sort.
 *
 * On mobile (< 640px): shows only All Filters + Sort.
 * On desktop: full toolbar with search, quick filters, and sort.
 *
 * The grid/list view toggle renders to the left of Sort when all of the
 * following are true:
 *   - `showViewToggle` is true (category has list view available)
 *   - `viewMode` and `onViewModeChange` are both provided
 *   - Viewport is ≥ 1024px (enforced here via `hidden lg:flex` wrapper)
 */
export function PlpToolbar({
  filters,
  filterState,
  onFilterChange,
  onOpenDrawer,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onOpenDrawer: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;
  showViewToggle?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const quickFilters = filters.filter((f) => f.isQuickFilter);
  const activeFilterCount = Object.keys(filterState).filter(
    (id) => filterState[id] !== undefined
  ).length;

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

  const renderViewToggle =
    showViewToggle && viewMode !== undefined && !!onViewModeChange;

  return (
    <div className="space-y-3" data-slot="plp-toolbar">
      {/* Search -- hidden on mobile */}
      {onSearchSubmit && (
        <div className="hidden sm:block">
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full"
          />
        </div>
      )}

      {/* Filter bar + toggle + sort */}
      <div className="flex items-center gap-2">
        {/* All Filters button */}
        <Button variant="outline" onClick={onOpenDrawer} className="shrink-0">
          <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
          All filters
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm" className="ml-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Quick filters -- hidden on mobile */}
        <div className="hidden items-center gap-2 sm:flex">
          {quickFilters.map((def) => (
            <PlpQuickFilter
              key={def.id}
              definition={def}
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle -- only at tablet+ when list view is available */}
        {renderViewToggle && (
          <div className={cn("hidden lg:flex")}>
            <PlpViewToggle value={viewMode!} onValueChange={onViewModeChange!} />
          </div>
        )}

        {/* Sort */}
        <div className="shrink-0">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-[140px]">
              <span className="mr-1 text-muted-foreground">Sort by</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/toolbar/plp-toolbar.tsx
git commit -m "feat(plp): wire view toggle into toolbar behind tablet+ responsive gate"
```

---

## Task 9: Wire list view into PlpTemplate

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-template.tsx`

Accept four new optional props (`listColumns`, `viewMode`, `onViewModeChange`, `onItemClick`). Compute the resolved view mode based on the consumer's `viewMode`, the presence of `listColumns`, and the viewport (via `useIsTabletUp`). Render `<PlpList>` when resolved mode is `"list"`, otherwise `<PlpGrid>`. Swap skeleton between grid and list. Pass the effective values to `PlpToolbar`.

The resolved-view-mode logic:

1. If `listColumns` is missing or empty → always grid
2. If viewport < 1024px → always grid (silent fallback)
3. Otherwise → consumer's `viewMode` (defaults to `"grid"` when undefined)

The consumer's `viewMode` state is preserved — we never call `onViewModeChange` to mutate it during fallback. When the viewport grows, the intent is honored again.

- [ ] **Step 1: Open the current template file to confirm structure**

Read `packages/components/src/components/templates/plp/plp-template.tsx` to confirm the current prop interface and render structure.

- [ ] **Step 2: Replace the file with the updated version**

```tsx
// plp/plp-template.tsx
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../molecules/pagination/pagination";
import { PlpHeading } from "./heading/plp-heading";
import { PlpToolbar } from "./toolbar/plp-toolbar";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpActiveFilters } from "./filters/plp-active-filters";
import { PlpGrid } from "./grid/plp-grid";
import { PlpGridItem } from "./grid/plp-grid-item";
import { PlpGridSkeleton } from "./grid/plp-grid-skeleton";
import { PlpList } from "./list/plp-list";
import { PlpListSkeleton } from "./list/plp-list-skeleton";
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import { useIsTabletUp } from "./hooks/use-is-tablet-up";
import type {
  BreadcrumbSegment,
  FilterDefinition,
  FilterState,
  FilterValue,
  GridItemData,
  ListColumn,
  PlpStatus,
  PlpViewMode,
  SortOption,
} from "./plp-types";

/**
 * Props for the PLP template.
 */
export interface PlpTemplateProps<TItem> {
  // Heading
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;

  // Filters
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;

  // Sort
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;

  // Search
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;

  // Items
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;

  // List view (Phase 2) — optional
  /**
   * Category-configured columns for list view. Presence of a non-empty
   * array enables list view availability (the toggle appears and the
   * consumer can switch modes). Omit or pass empty to keep grid-only.
   */
  listColumns?: ListColumn<TItem>[];
  /**
   * Current view mode. Defaults to "grid" when undefined.
   * The template silently falls back to grid at viewports < 1024px,
   * without calling `onViewModeChange`.
   */
  viewMode?: PlpViewMode;
  onViewModeChange?: (mode: PlpViewMode) => void;
  /**
   * Called when the user clicks a list view row.
   * List view only; no effect in grid view.
   */
  onItemClick?: (item: TItem) => void;

  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // States
  status: PlpStatus;
  onRetry?: () => void;
  emptyFilterSuggestions?: string[];
  emptyMessage?: string;
}

/**
 * Product Listing Page template.
 *
 * A page-level component that orchestrates a complete product listing
 * experience: heading, toolbar with filtering/sorting/view toggle,
 * responsive product grid or list, pagination, and loading/empty/error
 * states.
 *
 * The template is stateless with respect to data fetching, routing, and
 * persistence. It receives state and emits change events. Consumers own
 * the data lifecycle.
 *
 * Must be rendered inside an AppShell.
 *
 * @see docs/plans/specs/2026-04-16-plp-template-phase1-design.md
 * @see docs/plans/specs/2026-04-16-plp-template-phase2-design.md
 */
export function PlpTemplate<TItem>({
  breadcrumbs,
  title,
  resultsCount,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  items,
  renderGridItem,
  listColumns,
  viewMode = "grid",
  onViewModeChange,
  onItemClick,
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
  status,
  onRetry,
  emptyFilterSuggestions,
  emptyMessage,
}: PlpTemplateProps<TItem>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isTabletUp = useIsTabletUp();

  function handleClearAllFilters() {
    for (const filter of filters) {
      if (filterState[filter.id] !== undefined) {
        onFilterChange(filter.id, undefined);
      }
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  // Resolve the effective view mode:
  // - Grid if list view is not available (no columns or empty)
  // - Grid if viewport is below tablet (silent fallback, consumer intent preserved)
  // - Otherwise, whatever the consumer asked for
  const listViewAvailable = !!listColumns && listColumns.length > 0;
  const effectiveViewMode: PlpViewMode =
    listViewAvailable && isTabletUp && viewMode === "list" ? "list" : "grid";

  const showViewToggle = listViewAvailable;

  return (
    <main className="space-y-4" data-slot="plp-template">
      {/* Heading */}
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />

      {/* Toolbar */}
      <PlpToolbar
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onOpenDrawer={() => setDrawerOpen(true)}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        searchPlaceholder={searchPlaceholder}
        onSearchSubmit={onSearchSubmit}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={showViewToggle}
      />

      {/* Active filters strip */}
      <PlpActiveFilters
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onClearAll={handleClearAllFilters}
      />

      {/* Content area */}
      {status === "loading" &&
        (effectiveViewMode === "list" && listColumns ? (
          <PlpListSkeleton listColumns={listColumns} count={pageSize} />
        ) : (
          <PlpGridSkeleton count={pageSize} />
        ))}

      {status === "success" &&
        (effectiveViewMode === "list" && listColumns ? (
          <PlpList
            items={items}
            renderGridItem={renderGridItem}
            listColumns={listColumns}
            onItemClick={onItemClick}
          />
        ) : (
          <PlpGrid>
            {items.map((item) => {
              const data = renderGridItem(item);
              return (
                <div key={data.id} role="listitem">
                  <PlpGridItem data={data} />
                </div>
              );
            })}
          </PlpGrid>
        ))}

      {(status === "empty-filtered" || status === "empty-no-items") && (
        <PlpEmpty
          variant={status}
          onClearFilters={
            status === "empty-filtered" ? handleClearAllFilters : undefined
          }
          filterSuggestions={emptyFilterSuggestions}
          message={emptyMessage}
        />
      )}

      {status === "error" && <PlpError onRetry={onRetry} />}

      {/* Pagination -- only shown when there are items */}
      {status === "success" && totalItems > 0 && (
        <PlpPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* Filter drawer */}
      <PlpFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        filteredResultsCount={filteredResultsCount}
        onClearAll={handleClearAllFilters}
      />
    </main>
  );
}

/**
 * PLP pagination footer — results per page selector + previous/next navigation.
 *
 * Uses the design system Pagination molecule for Previous/Next and the
 * Select molecule for the page size dropdown.
 */
function PlpPagination({
  page,
  pageSize,
  totalPages,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Results per page</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-template.tsx
git commit -m "feat(plp): wire list view into PlpTemplate with viewport-based fallback"
```

---

## Task 10: Storybook — Diamond and Gemstone list view stories

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-template.stories.tsx`

Add two stories demonstrating list view. Diamond is the canonical case (6 dense columns). Gemstone shows a lighter column set reusing the existing gemstone mock data. Both stories start with `viewMode="list"` so reviewers land on list view immediately.

- [ ] **Step 1: Open the current stories file**

Read the current `plp-template.stories.tsx` to confirm:
- `PlpTemplateInteractive` is the stateful wrapper used by interactive stories
- `generateGemstoneItems` and `gemstoneRenderGridItem` are the gemstone mock utilities
- `GEMSTONE_FILTERS` and `SORT_OPTIONS` exist

These are already defined in the file from Phase 1 — verify the names match before writing the new stories.

- [ ] **Step 2: Extend `PlpTemplateInteractive` to support view mode**

Locate the existing `PlpTemplateInteractive` component in the stories file. It currently manages `filterState`, `sortValue`, `page`, and `pageSize` via `useState`. Add `viewMode` state management. The updated component signature:

```tsx
function PlpTemplateInteractive<TItem>({
  initialFilterState = {},
  initialViewMode = "grid",
  ...props
}: Omit<
  PlpTemplateProps<TItem>,
  | "filterState"
  | "onFilterChange"
  | "sortValue"
  | "onSortChange"
  | "page"
  | "onPageChange"
  | "pageSize"
  | "onPageSizeChange"
  | "viewMode"
  | "onViewModeChange"
> & {
  initialFilterState?: FilterState;
  initialViewMode?: PlpViewMode;
  sortValue: string;
  page: number;
  pageSize: number;
}) {
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [sortValue, setSortValue] = useState(props.sortValue);
  const [page, setPage] = useState(props.page);
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [viewMode, setViewMode] = useState<PlpViewMode>(initialViewMode);

  return (
    <PlpTemplate
      {...props}
      filterState={filterState}
      onFilterChange={(id, value) =>
        setFilterState((prev) => {
          const next = { ...prev };
          if (value === undefined) {
            delete next[id];
          } else {
            next[id] = value;
          }
          return next;
        })
      }
      sortValue={sortValue}
      onSortChange={setSortValue}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}
```

Update the imports at the top of the file to include `PlpViewMode`:

```tsx
import type {
  FilterDefinition,
  FilterState,
  GridItemData,
  ListColumn,
  PlpViewMode,
  SortOption,
} from "./plp-types";
```

And import `PlpTemplate`'s props type:

```tsx
import { PlpTemplate } from "./plp-template";
import type { PlpTemplateProps } from "./plp-template";
```

- [ ] **Step 3: Add diamond mock data at the top of the file**

After the existing gemstone mock utilities, append:

```tsx
// -- Diamond mock data (list view) -----------------------------------------

interface DiamondItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  carat: number;
  color: string;
  clarity: string;
  shape: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
}

function generateDiamondItems(count: number): DiamondItem[] {
  const shapes = ["Round", "Oval", "Cushion", "Princess", "Pear", "Emerald"];
  const colors = ["D", "E", "F", "G", "H", "I"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
  const origins = ["Botswana", "Russia", "Canada", "Australia", "South Africa"];
  const labs = ["GIA", "IGI", "AGS"];

  return Array.from({ length: count }, (_, i) => ({
    id: `diamond-${i}`,
    name: `${(0.5 + i * 0.1).toFixed(2)}ct ${shapes[i % shapes.length]} Diamond`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Diamond+${i + 1}`,
    stockId: `DM-${10000 + i}`,
    carat: Number((0.5 + i * 0.1).toFixed(2)),
    color: colors[i % colors.length],
    clarity: clarities[i % clarities.length],
    shape: shapes[i % shapes.length],
    origin: origins[i % origins.length],
    certLab: labs[i % labs.length],
    certNumber: `${287329000 + i}`,
    price: 2500 + i * 350,
    pricePerCarat: 5000 + i * 100,
    isExpress: i % 5 === 0,
    isReturnable: i % 3 !== 0,
  }));
}

function diamondRenderGridItem(item: DiamondItem): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [],
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: item.origin,
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
    },
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

const DIAMOND_FILTERS: FilterDefinition[] = [
  {
    id: "shape",
    label: "Shape",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: [
      { value: "round", label: "Round" },
      { value: "oval", label: "Oval" },
      { value: "cushion", label: "Cushion" },
      { value: "princess", label: "Princess" },
    ],
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: ["D", "E", "F", "G", "H", "I"].map((c) => ({ value: c, label: c })),
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"].map((c) => ({
      value: c,
      label: c,
    })),
  },
];

const DIAMOND_LIST_COLUMNS: ListColumn<DiamondItem>[] = [
  {
    id: "carat",
    header: "Carat",
    cell: (item) => item.carat.toFixed(2),
    align: "right",
  },
  {
    id: "shape",
    header: "Shape",
    cell: (item) => item.shape,
  },
  {
    id: "color",
    header: "Color",
    cell: (item) => item.color,
    align: "center",
  },
  {
    id: "clarity",
    header: "Clarity",
    cell: (item) => item.clarity,
    align: "center",
  },
  {
    id: "origin",
    header: "Origin",
    cell: (item) => item.origin,
  },
  {
    id: "cert",
    header: "Certificate",
    cell: (item) => (
      <span className="font-mono text-xs">
        {item.certLab} {item.certNumber}
      </span>
    ),
  },
];
```

- [ ] **Step 4: Add the two new stories**

Append these story exports at the end of the file (after all existing stories):

```tsx
export const DiamondListView: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      filters={DIAMOND_FILTERS}
      filteredResultsCount={48291}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      items={generateDiamondItems(20)}
      renderGridItem={diamondRenderGridItem}
      listColumns={DIAMOND_LIST_COLUMNS}
      initialViewMode="list"
      onItemClick={fn()}
      page={1}
      pageSize={20}
      totalItems={48291}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const GemstoneListView: StoryObj = {
  render: () => {
    const gemstoneListColumns: ListColumn<ReturnType<typeof generateGemstoneItems>[number]>[] = [
      { id: "stockId", header: "Stock ID", cell: (item) => <span className="font-mono text-xs">{item.stockId}</span> },
      { id: "origin", header: "Origin", cell: (item) => item.origin },
      { id: "cert", header: "Certificate", cell: (item) => (
        <span className="font-mono text-xs">{item.certLab} {item.certNumber}</span>
      ) },
    ];

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
        title="Sapphire"
        resultsCount={1234567}
        filters={GEMSTONE_FILTERS}
        filteredResultsCount={10234}
        sortOptions={SORT_OPTIONS}
        sortValue="price-asc"
        items={generateGemstoneItems(20)}
        renderGridItem={gemstoneRenderGridItem}
        listColumns={gemstoneListColumns}
        initialViewMode="list"
        onItemClick={fn()}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};
```

- [ ] **Step 5: Verify Storybook renders**

Run:
```bash
cd packages/components && npx storybook dev -p 6006
```

Navigate to `Templates/PLP` in the sidebar. Verify:
- `DiamondListView` renders as a table with 11 columns (thumb, name, carat, shape, color, clarity, origin, cert, delivery, returns, price, price/ct, actions)
- `GemstoneListView` renders with 3 category columns
- Toggle in toolbar switches between grid and list
- Hover on a row reveals Add to cart + More menu
- More menu shows favorite, share, view media items
- Existing Phase 1 stories (GemstoneCategory, JewelryCategory, etc.) still render correctly in grid view with no toggle visible

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-template.stories.tsx
git commit -m "feat(plp): add DiamondListView and GemstoneListView Storybook stories"
```

---

## Task 11: Update COMPONENT.md

**Files:**
- Modify: `packages/components/src/components/templates/plp/COMPONENT.md`

Update `lastUpdated`, bump `version` from `0.1.0` to `0.2.0`, and add documentation for the four new props.

- [ ] **Step 1: Read the existing COMPONENT.md to locate the props table**

Read `packages/components/src/components/templates/plp/COMPONENT.md` and find the existing props table. Note the exact formatting conventions used (column widths, backtick use, etc.).

- [ ] **Step 2: Update the frontmatter**

Change the frontmatter from:

```yaml
---
name: PlpTemplate
slug: plp-template
version: 0.1.0
status: unstable
lastUpdated: 2026-04-16
---
```

to:

```yaml
---
name: PlpTemplate
slug: plp-template
version: 0.2.0
status: unstable
lastUpdated: 2026-04-16
---
```

- [ ] **Step 3: Add the new rows to the props table**

Locate the props table and add these rows (place them in a logical position — after the `renderGridItem` row and before `page`, grouped as "List view"):

```md
| `listColumns` | `ListColumn<TItem>[]` | — | Category-configured columns for list view. Presence of a non-empty array enables the grid/list toggle. Omit for grid-only. |
| `viewMode` | `"grid" \| "list"` | `"grid"` | Current view mode. Template silently falls back to grid at viewports < 1024px. |
| `onViewModeChange` | `(mode: "grid" \| "list") => void` | — | Called when the user toggles view mode. |
| `onItemClick` | `(item: TItem) => void` | — | Called when a list view row is clicked. No effect in grid view. |
```

- [ ] **Step 4: Add a short Phase 2 note to the Usage guidelines section**

After the existing "When NOT to use" subsection, append a brief list view note:

```md
### List view (Phase 2)

List view is a density-oriented alternative to grid view for categories that benefit from parameter-by-parameter comparison (diamonds is the canonical case). Opt in by passing a non-empty `listColumns` array. The grid/list toggle appears in the toolbar automatically when list view is available and the viewport is ≥ 1024px. Below the tablet breakpoint, the template silently falls back to grid view — the consumer's `viewMode` state is preserved and honored when the viewport grows.
```

- [ ] **Step 5: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/COMPONENT.md
git commit -m "docs(plp): document Phase 2 list view props and usage in COMPONENT.md"
```

---

## Task 12: Final verification

Run all quality gates.

- [ ] **Step 1: TypeScript check**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx tsc --noEmit
```
Expected: no output (zero errors).

- [ ] **Step 2: Run unit tests**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx vitest run --project unit
```
Expected: all 8 tests from `plp-filter-registry.test.ts` PASS (no regressions from Phase 1).

- [ ] **Step 3: Smoke-check Storybook**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx storybook dev -p 6006
```

Walk through each PLP story and confirm:

**Phase 1 stories (should be unchanged):**
- `Templates/PLP/GemstoneCategory` — grid view, no toggle visible
- `Templates/PLP/JewelryCategory` — grid view, no toggle visible
- `Templates/PLP/WithActiveFilters` — active filter chips visible
- `Templates/PLP/WithCustomFilter` — custom filter renders
- `Templates/PLP/Loading` — grid skeleton
- `Templates/PLP/EmptyFiltered`, `EmptyNoItems`, `Error` — state screens

**Phase 2 stories (new):**
- `Templates/PLP/DiamondListView` — starts in list view, 11+ columns, toggle present, row hover reveals actions
- `Templates/PLP/GemstoneListView` — starts in list view, 3 category columns, toggle present

**Grid item stories:**
- `Templates/PLP Grid Item/*` — all render normally, unaffected by Phase 2

- [ ] **Step 4: Update CHANGELOG.md**

Prepend a new entry at the top of `packages/components/CHANGELOG.md`, below the existing `# Changelog — @nivoda/components` header and above the existing Phase 1 entry. The new entry must reference commit hashes — fill them in by running `git log --oneline feat/plp-template --not dev | head -20` and using the short SHAs.

Entry template (replace `<SHA-N>` placeholders with actual short SHAs from git log):

```md
### PLP Template — Phase 2 (unstable 0.2.0)

Adds list view to the PLP template, alongside the existing grid view. Stateless controlled `viewMode` with viewport-based fallback to grid below 1024px. Opt-in per category via the new `listColumns` prop.

- Added `ListColumn<TItem>` and `PlpViewMode` types (`<SHA-1>`)
- New `useIsTabletUp` hook mirroring `useIsMobile` at the 1024px breakpoint (`<SHA-2>`)
- List view: table container with sticky header, row renderer with fixed core cells (thumbnail, name+lead, delivery, returns, price, conditional price/ct) around category-configured middle columns, and hover-gated actions cell (Add to cart + More menu with platform actions and category actions) (`<SHA-3>`, `<SHA-4>`, `<SHA-5>`)
- Skeleton loading rows preserving column headers for loading state (`<SHA-6>`)
- Grid/list view toggle in the toolbar using `ToggleGroup` atom, hidden below tablet breakpoint (`<SHA-7>`, `<SHA-8>`)
- `PlpTemplate` gained `listColumns`, `viewMode`, `onViewModeChange`, and `onItemClick` props; resolves effective view mode from consumer intent + availability + viewport without mutating consumer state on fallback (`<SHA-9>`)
- Storybook: `DiamondListView` with 6 list columns (carat, shape, color, clarity, origin, certificate) and `GemstoneListView` with 3 list columns demonstrating the feature (`<SHA-10>`)
- COMPONENT.md bumped to `0.2.0` with the new props documented (`<SHA-11>`)
```

- [ ] **Step 5: Commit the CHANGELOG update**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/CHANGELOG.md
git commit -m "docs(plp): add Phase 2 entry to package CHANGELOG"
```

- [ ] **Step 6: Mark the Phase 2 design spec as implemented**

Update the frontmatter status of `docs/plans/specs/2026-04-16-plp-template-phase2-design.md`:

Change:
```yaml
status: Draft
```

to:
```yaml
status: Implemented
```

Commit:
```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add docs/plans/specs/2026-04-16-plp-template-phase2-design.md
git commit -m "docs(plp): mark Phase 2 spec as implemented"
```

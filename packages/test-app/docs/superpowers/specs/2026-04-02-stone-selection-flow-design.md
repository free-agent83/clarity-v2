# Stone Selection Flow — Design Spec

**Issue:** #16 — "Proceed to stone selection" (engagement rings): mock next step
**Date:** 2026-04-02

## Overview

When a buyer configures an engagement ring (metal, stone shape, size, engraving) and clicks "Proceed to stone selection," they enter a focused, multi-step flow to select a center stone for their ring. The flow culminates in an "Added to cart" confirmation screen.

This is a Phase 0 mock — the flow is visual and navigable but does not persist cart state.

## User Flow

1. **Ring detail page** — buyer configures ring (shape, metal, size, engraving) → clicks "Proceed to stone selection"
2. **Stone selection page** — stripped-down layout, paginated diamond grid filtered by compatible shape/carat → buyer selects a stone → fixed footer shows mount + stone + total → clicks "Confirm and add ring to cart"
3. **Added to cart page** — full app shell, success banner, ring+stone summary, action buttons (View cart / Share with stone / Back to browsing)

## Route Structure

| Page | URL | Route Group | Layout |
|------|-----|-------------|--------|
| Ring detail | `/buyer/browse/jewelry/engagement-rings/[slug]` | `(shop)` | Full app shell (existing) |
| Stone selection | `/buyer/browse/jewelry/engagement-rings/[slug]/select-stone` | `(configurator)` | Stripped-down (`LayoutConfigurator`) |
| Added to cart | `/buyer/browse/jewelry/engagement-rings/[slug]/added-to-cart` | `(shop)` | Full app shell (existing) |

### File structure

```
app/buyer/
  (configurator)/
    layout.tsx                                        # Wraps children in LayoutConfigurator
    browse/jewelry/engagement-rings/[slug]/
      select-stone/page.tsx                           # Stone picker page
  (shop)/
    browse/jewelry/engagement-rings/[slug]/
      page.tsx                                        # Ring detail (existing)
      added-to-cart/page.tsx                          # Confirmation page

components/layouts/
  layout-configurator/
    layout-configurator.tsx                           # Stripped-down shell component
```

### Config passing via URL params

The ring configurator serializes its state to search params when navigating to the stone selection page:

```
/buyer/browse/jewelry/engagement-rings/[slug]/select-stone
  ?shapeId=abc
  &maxCarat=2.5
  &metalId=xyz
  &size=7
  &engraving=True+love+forever
```

The stone selection page reads these server-side. The ring's identity (name, images, base price) comes from the `[slug]` param via `fetchEngagementRingItem`.

The added-to-cart page receives the same config params plus the selected stone ID:

```
/buyer/browse/jewelry/engagement-rings/[slug]/added-to-cart
  ?metalId=xyz
  &size=7
  &engraving=True+love+forever
  &stoneId=abc
  &labGrown=false
```

## Component Design

### LayoutConfigurator

**Location:** `components/layouts/layout-configurator/layout-configurator.tsx`

Stripped-down shell for the `(configurator)` route group. Focuses the user on completing the task.

**Props:**
- `heading: string` — page title (e.g., "Select a stone")
- `cancelHref: string` — URL for the cancel/close button (back to ring detail)
- `children: ReactNode`

**Structure:**
- **Header** (fixed top bar, same height as `BuyerNav`):
  - Left: Minivoda logo (links to `/buyer`)
  - Center: heading text
  - Right: Cancel button (×) linking to `cancelHref`
- **Body**: scrollable content area below the header, renders `children`
- No footer, no sidebar, no categories menu

### Stone Selection Page

**Location:** `app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/page.tsx`

**Validation:** If required URL params (`shapeId`, `metalId`) are missing or the ring slug is invalid, return 404 via `notFound()`.

**Data flow:**
- Server component reads `[slug]` → `fetchEngagementRingItem(slug)` for ring name, thumbnail, metal prices
- Reads `shapeId` and `maxCarat` from URL params → `fetchDiamondListFiltered` with shape filter and carat ≤ maxCarat. The existing function requires a `labGrown` boolean — call it twice (once for natural, once for lab-grown) and merge results, sorted together. This avoids modifying the shared API function.
- Reads `metalId` from URL params → finds matching metal price from ring's `availableMetals`
- Pagination via `page` URL param

**Layout (top to bottom):**

1. **Ring context bar** — ring name + config summary (e.g., "14K Yellow Gold · Round · Size 7")
2. **Results count + sort dropdown** — "X results", sort by price asc/desc or carat asc/desc (sort as URL param, triggers server re-fetch)
3. **Stone grid** — reuses `ProductListItem` component. Each card: diamond image, specs (shape, carat, color, clarity, cut), price. Clicking selects the stone (highlighted border).
4. **Pagination** — reuses existing pagination component
5. **Fixed footer** — persistent bar at bottom of viewport:
   - Before selection: mount thumbnail + ring name + config price. CTA disabled.
   - After selection: mount info + selected stone info (thumbnail, specs, price) + combined total. CTA enabled: "Confirm and add ring to cart."
   - CTA navigates to the added-to-cart route with config + stoneId as params.

**Client/server split:** Page is a server component. A client wrapper component manages selection state (which stone is highlighted) and renders the grid + footer. The grid items and footer are interactive; pagination and sort trigger full page navigations via URL params.

### Added to Cart Page

**Location:** `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/page.tsx`

**Validation:** If required URL params (`metalId`, `stoneId`) are missing or the ring slug / stone ID are invalid, return 404 via `notFound()`.

**Data flow:** Server component reads `[slug]` + URL params → fetches ring details via `fetchEngagementRingItem` and stone details via `fetchDiamondItem(stoneId, labGrown)`. The `labGrown` boolean is passed as a URL param from the stone selection page (derived from the diamond data at selection time).

**Layout (top to bottom):**

1. **Success banner** — green checkmark icon + "Added to cart."
2. **Ring summary card** — ring thumbnail, ring name, config details as subtitle (e.g., "14K Yellow gold · Round center stone · Size 7 · Engraving: 'True love forever'"), combined total price.
3. **Action buttons:**
   - "View cart" (primary) — opens existing cart Sheet via `useCartStore.openSheet()`
   - "Share with stone" — opens existing `ShareModal`
   - "Back to browsing" — navigates to `/buyer/browse/jewelry/engagement-rings`
4. **Included stones section** — heading: "The following stones are included in the item, and were also added to your cart:" followed by stone card(s): thumbnail, "Center stone" label, stone specs (shape, carat, color, clarity, cut, fluorescence), certification (lab + number), price.

**Cart integration:** This page does not modify the Zustand cart store. It is a visual confirmation only (Phase 0). The cart badge in the header continues showing its existing static count.

## Modifications to Existing Code

### JewelryConfiguration component

**File:** `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx`

Currently manages config state internally with no external access. The "Proceed to stone selection" button is defined in the parent server component and passed as `ctaButton` to `LayoutProductDetail`.

**Change:** Move the CTA button inside the `JewelryConfiguration` client component so it can read the current config state and navigate with the correct URL params. The button renders inside the `configuration` slot of `LayoutProductDetail` rather than the `ctaButton` slot.

### Ring detail page

**File:** `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/page.tsx`

- Remove the static `ctaButton` prop from `LayoutProductDetail`
- Pass the ring slug to `JewelryConfiguration` so it can construct the navigation URL
- Pass compatible stone shapes with their `maxCarat` values to the configurator (already available as `compatibleStones`)

### No changes to

- `LayoutProductDetail` — stays as-is
- `ProductListItem` — reused as-is for the stone grid
- `ShareModal` — reused as-is on the confirmation page
- Cart store — not wired for Phase 0
- Diamond data layer — `fetchDiamondListFiltered` already supports shape + carat filtering

## Out of Scope (Phase 0)

- Real cart state persistence (adding items to Zustand store or backend)
- Stone filtering/sorting beyond sort dropdown (no filter bar)
- Category tabs (natural vs lab-grown diamonds)
- Gemstone or melee stone support
- Ring configurator changes beyond navigation wiring

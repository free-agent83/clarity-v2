# Add to Cart / Buy Now Buttons — Design Spec

**Issue:** #15
**Date:** 2026-03-31
**Status:** Draft

## Summary

Replace "Add to shortlist" CTAs on product detail pages with "Add to cart" buttons backed by a Zustand cart store. Stones (unique products) get a three-state button (add → in cart → hover-to-remove). Jewelry (non-unique, can add multiples) gets a simple "Add to cart" that always adds. Adding an item opens the cart sheet. Cart state is client-side only (no API calls).

## Scope

### In scope

- Zustand cart store with mock client-side state
- CTA swap on 5 stone-category PDPs (natural diamonds, lab-grown diamonds, gemstones, natural melee, lab-grown melee)
- Three-state CTA button for stones (add / in cart / remove) — unique products, max one in cart
- Simple "Add to cart" CTA for jewelry (wedding bands, tennis bracelets) — non-unique, can add multiples. No `[slug]` pages yet, but behavior is specced for when they're built.
- Cart sheet reads from Zustand store instead of hardcoded mock data
- Header cart count reflects store item count

### Out of scope

- Engagement rings PDP ("Proceed to stone selection" stays unchanged)
- Wedding bands / tennis bracelets (no `[slug]` pages yet — `AddToCartButtonSimple` is ready for when they're built)
- Wiring to real cart API (`/api/v1/cart/`)
- Changes to ProductActions (Shortlist + Share buttons)
- Changes to LayoutProductDetail
- Cart sheet UI/UX (animations, credit bar, checkout CTA — stays as built)

## Design

### 1. Zustand Cart Store

**File:** `hooks/use-cart-store.ts`

**State shape:**

```ts
interface CartItem {
  id: string               // unique cart entry ID (generated client-side, e.g. crypto.randomUUID())
  productId: string        // product UUID from the PDP
  name: string             // product display name
  certLab: string | null   // e.g. "GIA", "IGI" — null for jewelry
  certNumber: string | null
  stockId: string          // e.g. "NV-284619"
  price: number            // price as a number (e.g. 1234.50)
  discount: number | null  // percentage discount (e.g. -41.01) — null if none
  image: string | null     // primary product image URL — fallback to category icon if null
  category: string         // category slug (e.g. "natural_diamond", "gemstone")
  quantity: number          // always 1 for Phase 0
}

interface CartStore {
  items: CartItem[]
  isSheetOpen: boolean
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (productId: string) => void
  openSheet: () => void
  closeSheet: () => void
  toggleSheet: () => void
}
```

**Behavior:**

- `addItem` — appends to `items` and sets `isSheetOpen: true`. For stones (unique products), deduplicates by `productId` (if already in cart, no-op but still opens sheet). For jewelry, always appends a new entry (each call creates a new cart item with a unique `id`).
- `removeItem` — removes by `productId` (removes all entries with that `productId`)
- Components derive `isInCart` via selector: `useCartStore(s => s.items.some(i => i.productId === id))`
- No persistence (state resets on page reload — acceptable for Phase 0)

**CartItem shape rationale:** Mirrors the existing `MockCartItem` type in `cart-button.tsx` so the cart sheet UI renders correctly without changes to `CartItemRow`. The `icon` field from the original mock is replaced by `image` (product image URL) + `category` (for fallback icon mapping). The `CartItemRow` component will be updated to render an `<img>` when `image` is available, falling back to a category-based icon (e.g. `IconDiamond` for diamonds, `IconDiamondsFilled` for jewelry).

### 2. CTA Button Components

**File:** `components/products/add-to-cart-button.tsx`

Two `"use client"` components that receive product data as props and read cart state via Zustand selectors. Both share the same file.

#### `AddToCartButton` (stones — unique products)

For natural diamonds, lab-grown diamonds, gemstones, natural melee, lab-grown melee. Each stone is a unique product — the user can only have one copy in the cart.

**Three visual states:**

| State | Label | Icon | Style | Click action |
|-------|-------|------|-------|-------------|
| Default | "Add to cart" | `IconShoppingCartPlus` | Primary (dark bg, light text) | Adds item + opens cart sheet |
| In cart | "In cart" | `IconCheck` | Success (green bg) | No action (hover to change) |
| In cart + hover | "Remove from cart" | `IconTrash` or `IconX` | Destructive (red bg) | Removes item from cart |

**Hover interaction:** Uses local `useState` for hover tracking. On mouse enter (when in cart), switches label to "Remove from cart" with destructive styling. On mouse leave, reverts to "In cart" success styling.

#### `AddToCartButtonSimple` (jewelry — non-unique products)

For wedding bands, tennis bracelets (when their PDPs are built). Each click adds another copy to the cart. No in-cart/remove states.

**Single state:**

| State | Label | Icon | Style | Click action |
|-------|-------|------|-------|-------------|
| Default | "Add to cart" | `IconShoppingCartPlus` | Primary (dark bg, light text) | Adds item + opens cart sheet |

#### Shared props

```ts
interface AddToCartButtonProps {
  product: Omit<CartItem, "id">
}
```

`AddToCartButton` derives `isInCart` via selector: `useCartStore(s => s.items.some(i => i.productId === product.productId))` to avoid unnecessary re-renders. `AddToCartButtonSimple` does not need this selector.

### 3. CartButton Refactor

**File:** `components/shell/cart-button.tsx`

**Changes:**

- Remove hardcoded mock items array and local `useState` for items
- Read `items` from `useCartStore(s => s.items)`
- Read `isSheetOpen`, `closeSheet` from the store
- Sheet `open` prop bound to `isSheetOpen`, `onOpenChange` calls `closeSheet`
- The cart trigger button in the header continues to call `toggleSheet` on click
- Remove item action calls `removeItem(productId)` on the store
- Existing UI (item rows, credit bar, checkout CTA, empty state, animations) stays unchanged — just backed by store data instead of hardcoded array

**Cart count in header:** `CartButton` already renders item count. Since it now reads from the store, the count is automatically correct.

### 4. PDP Changes (5 files)

**Files:**

- `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx`
- `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx`

**Change:** Replace the inline `<button>Add to shortlist</button>` in the `ctaButton` prop with `<AddToCartButton product={...} />`, passing the relevant product fields from the page's server-fetched data. All 5 stone PDPs use `AddToCartButton` (three-state, unique product behavior).

**Engagement rings** (`jewelry/engagement-rings/[slug]/page.tsx`): No changes. "Proceed to stone selection" stays.

**Wedding bands / tennis bracelets:** No `[slug]` pages exist yet. When built, they should use `AddToCartButtonSimple` (always "Add to cart", allows multiples).

### 5. Data Flow

```
PDP (Server Component)
  └─ fetches product data via lib/api/
  └─ passes product props to AddToCartButton (Client Component)
       └─ reads isInCart from Zustand store
       └─ on click: calls store.addItem(product) → store opens sheet

CartButton (Client Component, in BuyerNav)
  └─ reads items, isSheetOpen from Zustand store
  └─ renders cart sheet with store items
  └─ badge shows items.length

Header badge
  └─ rendered inside CartButton, reflects store.items.length
```

## Acceptance Criteria Mapping

| Criterion (from issue) | How addressed |
|---|---|
| "Add to shortlist" CTAs replaced by "Add to cart" in all categories except engagement rings | CTA swap in 5 PDP files; engagement rings untouched |
| "Add to cart" adds to cart + opens the cart sheet | `addItem` appends to store and sets `isSheetOpen: true` |
| Cart counter in header reflects number of mock items | CartButton reads `items.length` from Zustand store |

## Dependencies

- `zustand` npm package (needs to be installed)
- Cart sheet (issue #6) — already built and merged

# Cart Sheet Design

**Issue:** [#6 — Cart button: open cart sheet (right-hand flyout)](https://github.com/uxbyjoao/clarity-digital-twin/issues/6)
**Milestone:** Phase 0: Full Mock UI Coverage
**Date:** 2026-03-31

## Overview

Clicking the cart button in the header opens a right-hand Sheet flyout showing mock cart contents. This is Phase 0 — all data is hardcoded, no API calls. The sheet lets users browse their cart, remove items, toggle shortlist, and see a total.

## Architecture

### Component structure

```
BuyerNav (server component — unchanged)
  └─ <CartButton />  (NEW — client component, replaces static <button>)
     ├─ SheetTrigger  (cart button with dynamic item count)
     └─ SheetContent  (the cart sheet panel)
        ├─ CartHeader
        ├─ CartItemList → CartItem[]
        ├─ CartFooter
        └─ (toast via sonner)
```

### Design decision: self-contained client component

The cart button and sheet live in a single `CartButton` client component rather than using React Context or a shared state wrapper. Rationale:

- **BuyerNav stays a server component** — only the cart button becomes a client island
- **No context, no provider, no extra client boundary** — minimal blast radius
- **Zero unnecessary re-renders** — state is scoped to the one component that needs it
- **Aligns with `server-serialization`** — no data crosses the RSC boundary (mock data lives client-side)

When the real cart API is wired (Phase 1+), state can be lifted into a context or fetched server-side. The sheet UI stays the same.

### Files

| File | Action | Purpose |
|------|--------|---------|
| `components/shell/cart-button.tsx` | Create | `"use client"` component owning all cart state + Sheet |
| `components/shell/buyer-nav.tsx` | Edit | Replace static `<button>Cart (2)</button>` with `<CartButton />` |

Sub-components (`CartHeader`, `CartItemList`, `CartItem`, `CartFooter`) are separate functions in the same file — tightly coupled to the cart sheet, not reused elsewhere. Defined as top-level functions, not inline (per `rerender-no-inline-components` rule).

## Data

### CartItem type

```ts
type CartItem = {
  id: string
  name: string           // "Cushion Brilliant 1.00ct H VS2 VG EX VG Faint"
  certLab: string | null // "GIA", "IGI", or null for jewelry
  certNumber: string | null
  stockId: string        // "NV-284619"
  price: number          // 1234.50
  discount: number | null // -41.01 (percentage), null if no discount
  image: string          // product thumbnail URL
  quantity: number       // 1 for stones, could be >1 for jewelry
}
```

### Mock data

3 hardcoded items at the top of `cart-button.tsx`:

1. **Natural diamond** — Cushion Brilliant, GIA certified, with discount pill
2. **Engagement ring** — Solitaire 18K White Gold, no cert, no discount
3. **Lab-grown diamond** — Round Brilliant, IGI certified, with discount pill

Thumbnail images: use placeholder `bg-muted` divs with a small product-type icon (e.g. `IconDiamond` for stones, `IconDiamondsFilled` for rings) rather than external image URLs. Keeps it self-contained with no broken image dependencies.

Credit bar constants:
```ts
const CREDIT_USED = 4500
const CREDIT_TOTAL = 5000
```

Total is computed from the items array (`items.reduce((sum, item) => sum + item.price * item.quantity, 0)`), not hardcoded — updates correctly when items are removed.

## UI Layout

### Sheet properties

- **Side:** right
- **Width:** default shadcn Sheet width for `side="right"` (`sm:max-w-sm`, 384px)
- **Overlay:** default radix Sheet overlay (click to dismiss)
- **Animation:** default radix slide-in/out

### Header (pinned top)

- Title: "My cart (N)" where N is current item count
- Close button: circular `bg-muted` button with `IconX`, top-right
- Bottom border separating from item list

### Item list (scrollable middle)

Each item row:
- **Thumbnail:** 44px square, rounded-md
- **Name:** font-medium, single line, truncated with ellipsis
- **Cert/stock line:** caption size, muted color. Format varies:
  - Stones: `{certLab} {certNumber} · Stock ID {stockId}`
  - Jewelry (no cert): `Stock ID {stockId}`
- **Price line:** font-medium + optional discount pill
  - Discount pill: `bg-[#f4f2ff] text-[#5620e1]` rounded, only shown when `discount` is not null
- **Actions row:** two icon+text links with gap-3
  - "Add to shortlist" / "Shortlisted" — `IconHeart` / `IconHeartFilled` (rose-500)
  - "Remove" — `IconTrash`

Items separated by subtle border (`border-muted`).

### Footer (pinned bottom)

Stacked vertically with gap-5:

1. **Credit available section:**
   - Label: "Credit available" (muted, font-medium) + `IconInfoCircle` (small, muted)
   - Progress bar: 12px tall, rounded-full, purple fill (`primary` token) on muted background
   - Labels below: "$X used" (purple, left) / "$Y total" (right)

2. **Divider:** 1px border

3. **Total line:** "Total" (muted, left) + formatted amount (text-xl, font-medium, right)

4. **CTA:** Full-width dark button, "Proceed to checkout" + `IconArrowRight`. Matches existing button variant (default variant, full width). Inert for Phase 0 — shows "Coming soon" toast on click.

### Empty state

When all items are removed:
- Centered text: "Your cart is empty"
- "Continue shopping" link that closes the sheet
- Footer (credit bar, total, CTA) hidden when empty

## Interactions

### Open / Close

- **Open:** Click cart button in header
- **Close:** Click X button, click overlay, or press Escape
- Standard radix Sheet behavior — no custom logic needed

### Remove item

1. Click "Remove" on a cart item
2. Item animates out (height collapse + opacity fade, ~200ms)
3. Toast: "Item removed from cart" (via sonner)
4. Cart count in header button updates
5. Total recalculates
6. If last item removed, transition to empty state

### Shortlist toggle

Matches existing PLP pattern from `components/product-actions.tsx`:

- **Default:** `IconHeart` (outline) + "Add to shortlist"
- **Shortlisted:** `IconHeartFilled` with `text-rose-500` + "Shortlisted"
- **Click:** Toggles state, shows toast "Added to shortlist" / "Removed from shortlist"
- Each cart item tracks its own `isShortlisted` boolean in local state

### Proceed to checkout

- Button is present but inert for Phase 0
- Click shows toast: "Coming soon"
- Will be wired in a future checkout ticket

## Icons

All from `@tabler/icons-react`:

| Icon | Usage |
|------|-------|
| `IconShoppingCart` | Cart button trigger (existing) |
| `IconX` | Sheet close button |
| `IconHeart` | Shortlist (default) |
| `IconHeartFilled` | Shortlist (active, `text-rose-500`) |
| `IconTrash` | Remove item |
| `IconArrowRight` | Checkout CTA |
| `IconInfoCircle` | Credit available tooltip hint |

## Acceptance Criteria

- [ ] Cart button opens a Sheet from the right
- [ ] Mock items displayed with prices and quantities
- [ ] Remove button animates item out and shows toast
- [ ] Shortlist toggle fills heart red and shows toast (matches PLP pattern)
- [ ] "Proceed to checkout" button exists (shows "Coming soon" toast)
- [ ] Sheet can be dismissed (X, overlay click, Escape)
- [ ] Cart count in header updates when items are removed
- [ ] Total recalculates when items are removed
- [ ] Empty state shown when all items removed
- [ ] Credit available progress bar displayed with mock values

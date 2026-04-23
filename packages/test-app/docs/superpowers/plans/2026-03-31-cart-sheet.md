# Cart Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a right-hand cart sheet flyout triggered by the header cart button, showing mock cart items with remove and shortlist interactions.

**Architecture:** Self-contained `CartButton` client component replaces the static cart button in `BuyerNav`. It owns all mock data and state internally, using the existing shadcn `Sheet` component. BuyerNav remains a server component.

**Tech Stack:** React 19, Next.js 16, shadcn/ui Sheet (radix-ui Dialog), @tabler/icons-react, sonner (toast), Tailwind CSS v4

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `components/shell/cart-button.tsx` | Create | `"use client"` component: mock data, cart state, Sheet trigger + content, all sub-components |
| `components/shell/buyer-nav.tsx` | Modify | Import `CartButton`, replace static `<button>Cart (2)</button>` |

Sub-components inside `cart-button.tsx` (top-level functions, not exported):
- `CartButton` — main export, owns state, renders `Sheet` + `SheetTrigger` + `SheetContent`
- `CartItemRow` — single cart item (thumbnail, info, price, actions)
- `CartFooter` — credit bar, total, CTA

---

### Task 1: Create CartButton with Sheet open/close

**Files:**
- Create: `components/shell/cart-button.tsx`

- [ ] **Step 1: Create the CartButton component with Sheet wiring**

Create `components/shell/cart-button.tsx`:

```tsx
"use client"

import { useState } from "react"
import {
  IconArrowRight,
  IconDiamond,
  IconDiamondsFilled,
  IconHeart,
  IconHeartFilled,
  IconInfoCircle,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { formatUSD } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

type MockCartItem = {
  id: string
  name: string
  certLab: string | null
  certNumber: string | null
  stockId: string
  price: number
  discount: number | null
  icon: React.ComponentType<{ size?: number; className?: string }>
  quantity: number
}

const INITIAL_CART_ITEMS: MockCartItem[] = [
  {
    id: "cart-1",
    name: "Cushion Brilliant 1.00ct H VS2 VG EX VG Faint",
    certLab: "GIA",
    certNumber: "7458574931",
    stockId: "NV-284619",
    price: 1234.5,
    discount: -41.01,
    icon: IconDiamond,
    quantity: 1,
  },
  {
    id: "cart-2",
    name: "Solitaire Engagement Ring — 18K White Gold",
    certLab: null,
    certNumber: null,
    stockId: "NV-ER-00412",
    price: 2850.0,
    discount: null,
    icon: IconDiamondsFilled,
    quantity: 1,
  },
  {
    id: "cart-3",
    name: "Round Brilliant 0.50ct D IF EX EX EX None",
    certLab: "IGI",
    certNumber: "LG5829104",
    stockId: "NV-LG-91024",
    price: 3200.0,
    discount: -22.5,
    icon: IconDiamond,
    quantity: 1,
  },
]

const CREDIT_USED = 4500
const CREDIT_TOTAL = 5000

export function CartButton() {
  const [items, setItems] = useState<MockCartItem[]>(INITIAL_CART_ITEMS)
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast("Item removed from cart")
  }

  function handleShortlist(id: string) {
    setShortlisted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast("Removed from shortlist")
      } else {
        next.add(id)
        toast("Added to shortlist")
      }
      return next
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Cart ({items.length})
          <IconShoppingCart size={20} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-base">My cart ({items.length})</span>
          <SheetClose />
        </div>

        {/* Item list or empty state */}
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto border-b border-border">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  isShortlisted={shortlisted.has(item.id)}
                  onRemove={handleRemove}
                  onShortlist={handleShortlist}
                />
              ))}
            </div>
            <CartFooter total={total} />
          </>
        ) : (
          <CartEmptyState />
        )}
      </SheetContent>
    </Sheet>
  )
}
```

Note: this will not compile yet — `SheetClose`, `CartItemRow`, `CartFooter`, and `CartEmptyState` are defined in later steps.

- [ ] **Step 2: Add the SheetClose button import**

Add `SheetClose` to the import from `@/components/ui/sheet`:

```tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
```

And replace the `<SheetClose />` placeholder in the header with:

```tsx
<SheetClose asChild>
  <Button
    variant="ghost"
    size="icon-sm"
    className="rounded-full bg-muted hover:bg-muted/80"
  >
    <IconX size={16} />
    <span className="sr-only">Close cart</span>
  </Button>
</SheetClose>
```

Add `IconX` to the Tabler imports:

```tsx
import {
  IconArrowRight,
  IconDiamond,
  IconDiamondsFilled,
  IconHeart,
  IconHeartFilled,
  IconInfoCircle,
  IconShoppingCart,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
```

- [ ] **Step 3: Commit scaffold**

```bash
git add components/shell/cart-button.tsx
git commit -m "feat(cart): scaffold CartButton with Sheet open/close (#6)"
```

---

### Task 2: Build CartItemRow sub-component

**Files:**
- Modify: `components/shell/cart-button.tsx`

- [ ] **Step 1: Add CartItemRow component**

Add this function above `CartButton` in `cart-button.tsx`:

```tsx
function CartItemRow({
  item,
  isShortlisted,
  onRemove,
  onShortlist,
}: {
  item: MockCartItem
  isShortlisted: boolean
  onRemove: (id: string) => void
  onShortlist: (id: string) => void
}) {
  const Icon = item.icon

  return (
    <div className="flex gap-4 border-b border-muted p-4 last:border-b-0">
      {/* Thumbnail */}
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon size={20} className="text-muted-foreground" />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Name */}
        <div>
          <p className="truncate text-sm font-medium text-foreground">
            {item.name}
          </p>

          {/* Cert / Stock line */}
          <p className="text-xs text-muted-foreground">
            {item.certLab && item.certNumber ? (
              <>
                <span>{item.certLab}</span>{" "}
                <span className="text-foreground">{item.certNumber}</span>
                {" · "}
              </>
            ) : null}
            <span>Stock ID</span>{" "}
            <span className="text-foreground">{item.stockId}</span>
          </p>

          {/* Price + discount */}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">
              {formatUSD(item.price)}
            </span>
            {item.discount !== null && (
              <span className="rounded bg-[#f4f2ff] px-1.5 py-0.5 text-xs text-[#5620e1]">
                {item.discount}%
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onShortlist(item.id)}
            className="flex items-center gap-1 text-xs text-foreground transition-colors hover:text-foreground/70"
          >
            {isShortlisted ? (
              <IconHeartFilled size={16} className="text-rose-500" />
            ) : (
              <IconHeart size={16} />
            )}
            {isShortlisted ? "Shortlisted" : "Add to shortlist"}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-xs text-foreground transition-colors hover:text-foreground/70"
          >
            <IconTrash size={16} />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `npm run typecheck`
Expected: No errors related to `CartItemRow` (there will still be errors for `CartFooter` and `CartEmptyState` which don't exist yet).

- [ ] **Step 3: Commit**

```bash
git add components/shell/cart-button.tsx
git commit -m "feat(cart): add CartItemRow with shortlist toggle and remove (#6)"
```

---

### Task 3: Build CartFooter and CartEmptyState sub-components

**Files:**
- Modify: `components/shell/cart-button.tsx`

- [ ] **Step 1: Add CartFooter component**

Add this function above `CartButton` in `cart-button.tsx`:

```tsx
function CartFooter({ total }: { total: number }) {
  const creditPercent = Math.min((CREDIT_USED / CREDIT_TOTAL) * 100, 100)

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Credit available */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          Credit available
          <IconInfoCircle size={14} className="text-muted-foreground/60" />
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${creditPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>
            <span className="font-medium text-primary">
              {formatUSD(CREDIT_USED)}
            </span>{" "}
            <span className="text-muted-foreground">used</span>
          </span>
          <span>
            <span className="font-medium text-foreground">
              {formatUSD(CREDIT_TOTAL)}
            </span>{" "}
            <span className="text-muted-foreground">total</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="text-base text-muted-foreground">Total</span>
        <span className="text-xl font-medium text-foreground">
          {formatUSD(total)}
        </span>
      </div>

      {/* CTA */}
      <Button
        className="h-11 w-full gap-2"
        onClick={() => toast("Coming soon")}
      >
        Proceed to checkout
        <IconArrowRight size={20} />
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Add CartEmptyState component**

Add this function above `CartButton` in `cart-button.tsx`:

```tsx
function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5">
      <p className="text-sm text-muted-foreground">Your cart is empty</p>
      <SheetClose asChild>
        <Button variant="link" className="text-sm">
          Continue shopping
        </Button>
      </SheetClose>
    </div>
  )
}
```

- [ ] **Step 3: Verify the component compiles**

Run: `npm run typecheck`
Expected: PASS — all sub-components now exist. Zero type errors in `cart-button.tsx`.

- [ ] **Step 4: Commit**

```bash
git add components/shell/cart-button.tsx
git commit -m "feat(cart): add CartFooter with credit bar and CartEmptyState (#6)"
```

---

### Task 4: Wire CartButton into BuyerNav

**Files:**
- Modify: `components/shell/buyer-nav.tsx`

- [ ] **Step 1: Replace the static cart button**

In `components/shell/buyer-nav.tsx`, add the import at the top with the other shell imports:

```tsx
import { CartButton } from "@/components/shell/cart-button"
```

Then replace lines 61-64 (the static cart button):

```tsx
          <button className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Cart (2)
            <IconShoppingCart size={20} />
          </button>
```

With:

```tsx
          <CartButton />
```

Also remove `IconShoppingCart` from the Tabler import at the top of `buyer-nav.tsx` since it's no longer used there (it's now imported in `cart-button.tsx`):

```tsx
import {
  IconChevronDown,
  IconCurrencyEuro,
  IconHeart,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react"
```

- [ ] **Step 2: Type check**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`

1. Navigate to any `/buyer` page
2. Click the "Cart (3)" button in the header
3. Verify the Sheet slides in from the right
4. Verify 3 mock items are displayed with correct info
5. Click X, overlay, or press Escape to close
6. Verify the sheet closes

- [ ] **Step 4: Commit**

```bash
git add components/shell/buyer-nav.tsx components/shell/cart-button.tsx
git commit -m "feat(cart): wire CartButton into BuyerNav header (#6)"
```

---

### Task 5: Add remove animation

**Files:**
- Modify: `components/shell/cart-button.tsx`

- [ ] **Step 1: Add CSS transition for item removal**

The remove animation needs items to collapse smoothly. Update `CartItemRow` to accept a `removing` prop and apply transition classes. First, update the `CartButton` component to track which item is being removed:

Replace the `handleRemove` function in `CartButton`:

```tsx
  const [removingId, setRemovingId] = useState<string | null>(null)

  function handleRemove(id: string) {
    setRemovingId(id)
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
      setRemovingId(null)
      toast("Item removed from cart")
    }, 200)
  }
```

- [ ] **Step 2: Update CartItemRow to animate out**

Add the `removing` prop to `CartItemRow` and apply transition styles:

Update the props type:

```tsx
function CartItemRow({
  item,
  isShortlisted,
  removing,
  onRemove,
  onShortlist,
}: {
  item: MockCartItem
  isShortlisted: boolean
  removing: boolean
  onRemove: (id: string) => void
  onShortlist: (id: string) => void
}) {
```

Update the outer `<div>` of `CartItemRow`:

```tsx
    <div
      className={cn(
        "flex gap-4 border-b border-muted p-4 transition-all duration-200 last:border-b-0",
        removing && "h-0 overflow-hidden opacity-0 !p-0",
      )}
    >
```

Add the `cn` import at the top of the file:

```tsx
import { cn, formatUSD } from "@/lib/utils"
```

Update the `CartItemRow` usage in `CartButton` to pass the `removing` prop:

```tsx
                <CartItemRow
                  key={item.id}
                  item={item}
                  isShortlisted={shortlisted.has(item.id)}
                  removing={removingId === item.id}
                  onRemove={handleRemove}
                  onShortlist={handleShortlist}
                />
```

- [ ] **Step 3: Verify in the browser**

1. Open the cart sheet
2. Click "Remove" on any item
3. Verify the item fades out and collapses over ~200ms
4. Verify a toast appears: "Item removed from cart"
5. Verify the cart count in the header updates
6. Verify the total updates
7. Remove all items — verify empty state appears

- [ ] **Step 4: Commit**

```bash
git add components/shell/cart-button.tsx
git commit -m "feat(cart): add remove animation with height collapse and toast (#6)"
```

---

### Task 6: Format and lint

**Files:**
- All modified files

- [ ] **Step 1: Run Prettier**

```bash
npm run format
```

- [ ] **Step 2: Run ESLint**

```bash
npm run lint
```

Fix any issues reported.

- [ ] **Step 3: Run type check**

```bash
npm run typecheck
```

Expected: PASS with zero errors.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: PASS — production build succeeds.

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "style: format cart-button and buyer-nav (#6)"
```

(Skip this commit if formatting produced no changes.)

---

### Task 7: Final verification against acceptance criteria

- [ ] **Step 1: Manual verification checklist**

Run: `npm run dev`

Open any `/buyer` page and verify each acceptance criterion:

1. **Cart button opens a Sheet from the right** — click cart button, sheet slides in
2. **Mock items displayed with prices and quantities** — 3 items shown with correct data
3. **Remove button animates item out and shows toast** — click Remove, see animation + toast
4. **Shortlist toggle fills heart red and shows toast** — click shortlist, heart fills red, toast appears; click again, unfills, toast appears
5. **"Proceed to checkout" button exists** — visible at bottom, click shows "Coming soon" toast
6. **Sheet can be dismissed** — X button, overlay click, Escape all work
7. **Cart count in header updates when items are removed** — count decrements from 3
8. **Total recalculates when items are removed** — total changes on removal
9. **Empty state shown when all items removed** — "Your cart is empty" + "Continue shopping" link
10. **Credit available progress bar displayed with mock values** — purple bar with $4,500 / $5,000

# Add to Cart Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace "Add to shortlist" CTAs on stone PDPs with "Add to cart" buttons backed by a Zustand cart store, wired to the existing cart sheet.

**Architecture:** A Zustand store (`use-cart-store`) holds cart items and sheet open/close state. `AddToCartButton` is a client component with three visual states (add/in-cart/remove-on-hover) for unique stone products. `CartButton` is refactored to read from the store instead of hardcoded mock data. All 5 stone PDP pages swap their CTA to use the new button.

**Tech Stack:** Zustand, React 19, Next.js 16, @tabler/icons-react, Tailwind CSS v4, sonner (toasts)

**Spec:** `docs/superpowers/specs/2026-03-31-add-to-cart-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `hooks/use-cart-store.ts` | Create | Zustand store: cart items, sheet state, add/remove actions |
| `components/products/add-to-cart-button.tsx` | Create | Three-state CTA button for stone PDPs (add → in cart → remove on hover) |
| `components/shell/cart-button.tsx` | Modify | Replace local state + mock data with Zustand store reads |
| `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx` | Modify | Swap CTA to `AddToCartButton` |
| `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx` | Modify | Swap CTA to `AddToCartButton` |
| `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx` | Modify | Swap CTA to `AddToCartButton` |
| `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx` | Modify | Swap CTA to `AddToCartButton` |
| `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx` | Modify | Swap CTA to `AddToCartButton` |

---

### Task 1: Install Zustand

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('zustand')" && echo "OK"
```

Expected: `OK` (no errors)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install zustand for client-side cart state"
```

---

### Task 2: Create the Cart Store

**Files:**
- Create: `hooks/use-cart-store.ts`

- [ ] **Step 1: Create the Zustand store**

Create `hooks/use-cart-store.ts`:

```ts
import { create } from "zustand"

export interface CartItem {
  id: string
  productId: string
  name: string
  certLab: string | null
  certNumber: string | null
  stockId: string
  price: number
  discount: number | null
  image: string | null
  category: string
  quantity: number
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

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isSheetOpen: false,

  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId)
    if (existing) {
      // Stone products are unique — don't add duplicates, just open the sheet
      set({ isSheetOpen: true })
      return
    }
    set((state) => ({
      items: [...state.items, { ...item, id: crypto.randomUUID() }],
      isSheetOpen: true,
    }))
  },

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  toggleSheet: () => set((state) => ({ isSheetOpen: !state.isSheetOpen })),
}))
```

- [ ] **Step 2: Verify the store compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `use-cart-store.ts`.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-cart-store.ts
git commit -m "feat: add Zustand cart store with items and sheet state"
```

---

### Task 3: Create the AddToCartButton Component

**Files:**
- Create: `components/products/add-to-cart-button.tsx`

- [ ] **Step 1: Create the component**

Create `components/products/add-to-cart-button.tsx`:

```tsx
"use client"

import { useState } from "react"
import {
  IconCheck,
  IconShoppingCartPlus,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/hooks/use-cart-store"

interface AddToCartButtonProps {
  product: Omit<CartItem, "id">
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.productId === product.productId),
  )
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)

  if (isInCart) {
    return (
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          removeItem(product.productId)
          setIsHovered(false)
          toast("Removed from cart")
        }}
        className={cn(
          "flex h-15 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
          isHovered
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-emerald-600 text-white hover:bg-emerald-700",
        )}
      >
        {isHovered ? (
          <>
            Remove from cart
            <IconX size={20} />
          </>
        ) : (
          <>
            In cart
            <IconCheck size={20} />
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product)
        toast("Added to cart")
      }}
      className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
    >
      Add to cart
      <IconShoppingCartPlus size={20} />
    </button>
  )
}
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `add-to-cart-button.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/products/add-to-cart-button.tsx
git commit -m "feat: add three-state AddToCartButton for stone PDPs"
```

---

### Task 4: Refactor CartButton to Use the Zustand Store

**Files:**
- Modify: `components/shell/cart-button.tsx`

This is the biggest change. The `CartButton` component currently uses local `useState` with hardcoded `INITIAL_CART_ITEMS`. We need to:

1. Remove `MockCartItem` type, `INITIAL_CART_ITEMS`, and the local items `useState`
2. Import `useCartStore` and `CartItem` from the store
3. Control the `Sheet` open state via the store
4. Update `CartItemRow` to render images (with icon fallback) using `CartItem` instead of `MockCartItem`
5. Route remove actions through the store

- [ ] **Step 1: Replace the full file**

Rewrite `components/shell/cart-button.tsx`:

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
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { cn, formatUSD } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/hooks/use-cart-store"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

const CREDIT_USED = 4500
const CREDIT_TOTAL = 5000

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  natural_diamond: IconDiamond,
  lab_grown_diamond: IconDiamond,
  gemstone: IconDiamondsFilled,
  natural_melee: IconDiamond,
  lab_grown_melee: IconDiamond,
  engagement_ring: IconDiamondsFilled,
  wedding_band: IconDiamondsFilled,
  tennis_bracelet: IconDiamondsFilled,
}

function CartItemRow({
  item,
  isShortlisted,
  removing,
  reference,
  onReferenceChange,
  onRemove,
  onShortlist,
}: {
  item: CartItem
  isShortlisted: boolean
  removing: boolean
  reference: string
  onReferenceChange: (id: string, value: string) => void
  onRemove: (id: string) => void
  onShortlist: (id: string) => void
}) {
  const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond

  return (
    <div
      className={cn(
        "flex gap-4 border-b border-muted p-4 transition-all duration-200 last:border-b-0",
        removing && "h-0 overflow-hidden opacity-0 !p-0",
      )}
    >
      {/* Thumbnail */}
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <FallbackIcon size={20} className="text-muted-foreground" />
        )}
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
                {Math.abs(item.discount)}%
              </span>
            )}
          </div>

          {/* Internal order reference */}
          <input
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(item.id, e.target.value)}
            placeholder="Internal order ref."
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onShortlist(item.id)}
          >
            {isShortlisted ? (
              <IconHeartFilled size={16} className="text-rose-500" />
            ) : (
              <IconHeart size={16} />
            )}
            {isShortlisted ? "Shortlisted" : "Add to shortlist"}
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onRemove(item.id)}>
            <IconTrash size={16} />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}

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

function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5">
      <p className="text-sm text-muted-foreground">Your cart is empty</p>
      <Button
        variant="link"
        className="text-sm"
        onClick={() => useCartStore.getState().closeSheet()}
      >
        Continue shopping
      </Button>
    </div>
  )
}

export function CartButton() {
  const items = useCartStore((s) => s.items)
  const isSheetOpen = useCartStore((s) => s.isSheetOpen)
  const toggleSheet = useCartStore((s) => s.toggleSheet)
  const closeSheet = useCartStore((s) => s.closeSheet)
  const removeItem = useCartStore((s) => s.removeItem)

  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [references, setReferences] = useState<Record<string, string>>({})

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  function handleRemove(id: string) {
    const item = items.find((i) => i.id === id)
    setRemovingId(id)
    setTimeout(() => {
      if (item) removeItem(item.productId)
      setRemovingId(null)
      toast("Item removed from cart")
    }, 200)
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
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (open) toggleSheet()
        else closeSheet()
      }}
    >
      <button
        type="button"
        onClick={toggleSheet}
        className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Cart ({items.length})
        <IconShoppingCart size={20} />
      </button>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0"
      >
        <SheetTitle className="sr-only">Cart</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-base">My cart ({items.length})</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-muted hover:bg-muted/80"
            onClick={closeSheet}
          >
            <IconX size={16} />
            <span className="sr-only">Close cart</span>
          </Button>
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
                  removing={removingId === item.id}
                  reference={references[item.id] ?? ""}
                  onReferenceChange={(id, value) =>
                    setReferences((prev) => ({ ...prev, [id]: value }))
                  }
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

**Key changes from original:**
- Removed `MockCartItem` type, `INITIAL_CART_ITEMS`, and local items `useState`
- Import `useCartStore` and `CartItem` from the store
- `Sheet` uses controlled `open`/`onOpenChange` via store (no `SheetTrigger`)
- Cart trigger button calls `toggleSheet` directly
- `CartItemRow` renders `<img>` when `item.image` is available, falls back to category icon via `CATEGORY_ICONS` map
- `handleRemove` looks up the cart entry by `id`, then calls `removeItem(productId)` on the store
- `CartEmptyState` uses `useCartStore.getState().closeSheet()` instead of `SheetClose` (since sheet is now controlled)
- Close button uses `onClick={closeSheet}` instead of `SheetClose`

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Verify the cart sheet still opens from the header**

```bash
npm run dev
```

Open the app in a browser, click the "Cart (0)" button in the header. The sheet should open (empty state). Click "Continue shopping" or the X button — sheet should close.

- [ ] **Step 4: Commit**

```bash
git add components/shell/cart-button.tsx
git commit -m "refactor: wire CartButton to Zustand store, remove hardcoded mock data"
```

---

### Task 5: Swap CTA on Natural Diamonds PDP

**Files:**
- Modify: `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx`

- [ ] **Step 1: Update the imports**

In `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx`, replace the imports:

Replace:
```tsx
import {
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
```

With:
```tsx
import {
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
```

(`IconArrowRight` is no longer needed since the CTA button is now a component.)

- [ ] **Step 2: Replace the ctaButton prop**

Replace:
```tsx
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add to shortlist
          <IconArrowRight size={20} />
        </button>
      }
```

With:
```tsx
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: item.certification.lab,
            certNumber: item.certification.number,
            stockId: item.stockId,
            price: item.price,
            discount: null,
            image: item.images.main,
            category: "natural_diamond",
            quantity: 1,
          }}
        />
      }
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 4: Manual verification**

Navigate to any natural diamond detail page. Verify:
1. "Add to cart" button appears where "Add to shortlist" was
2. Clicking "Add to cart" adds the item and opens the cart sheet
3. The cart sheet shows the diamond with correct name, cert, stock ID, price, and image
4. The button changes to green "In cart" state
5. Hovering over "In cart" shows red "Remove from cart"
6. Clicking "Remove from cart" removes the item and reverts the button to "Add to cart"
7. Cart count in the header updates correctly

- [ ] **Step 5: Commit**

```bash
git add app/buyer/\(shop\)/browse/natural-diamonds/\[slug\]/page.tsx
git commit -m "feat: replace 'Add to shortlist' with 'Add to cart' on natural diamonds PDP"
```

---

### Task 6: Swap CTA on Lab-Grown Diamonds PDP

**Files:**
- Modify: `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx`

- [ ] **Step 1: Update the imports**

In `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx`, replace the imports:

Replace:
```tsx
import {
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
```

With:
```tsx
import {
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
```

- [ ] **Step 2: Replace the ctaButton prop**

Replace:
```tsx
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add to shortlist
          <IconArrowRight size={20} />
        </button>
      }
```

With:
```tsx
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: item.certification.lab,
            certNumber: item.certification.number,
            stockId: item.stockId,
            price: item.price,
            discount: null,
            image: item.images.main,
            category: "lab_grown_diamond",
            quantity: 1,
          }}
        />
      }
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/browse/lab-grown-diamonds/\[slug\]/page.tsx
git commit -m "feat: replace 'Add to shortlist' with 'Add to cart' on lab-grown diamonds PDP"
```

---

### Task 7: Swap CTA on Gemstones PDP

**Files:**
- Modify: `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx`

- [ ] **Step 1: Update the imports**

In `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx`, replace the imports:

Replace:
```tsx
import {
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
```

With:
```tsx
import {
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
```

- [ ] **Step 2: Replace the ctaButton prop**

Replace:
```tsx
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add to shortlist
          <IconArrowRight size={20} />
        </button>
      }
```

With:
```tsx
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: item.certification.lab,
            certNumber: item.certification.number,
            stockId: item.stockId,
            price: item.price,
            discount: null,
            image: item.images.main,
            category: "gemstone",
            quantity: 1,
          }}
        />
      }
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/browse/gemstones/\[slug\]/page.tsx
git commit -m "feat: replace 'Add to shortlist' with 'Add to cart' on gemstones PDP"
```

---

### Task 8: Swap CTA on Natural Melee PDP

**Files:**
- Modify: `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx`

Note: Melee items use `item.totalPrice` instead of `item.price`.

- [ ] **Step 1: Update the imports**

In `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx`, replace the imports:

Replace:
```tsx
import {
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
```

With:
```tsx
import {
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
```

- [ ] **Step 2: Replace the ctaButton prop**

Replace:
```tsx
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add to shortlist
          <IconArrowRight size={20} />
        </button>
      }
```

With:
```tsx
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: null,
            certNumber: null,
            stockId: item.stockId,
            price: item.totalPrice,
            discount: null,
            image: item.images.main,
            category: "natural_melee",
            quantity: 1,
          }}
        />
      }
```

Note: Melee parcels have no certification, so `certLab` and `certNumber` are `null`. Price uses `item.totalPrice` (the parcel total, not per-carat).

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/browse/natural-melee/\[slug\]/page.tsx
git commit -m "feat: replace 'Add to shortlist' with 'Add to cart' on natural melee PDP"
```

---

### Task 9: Swap CTA on Lab-Grown Melee PDP

**Files:**
- Modify: `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx`

- [ ] **Step 1: Update the imports**

In `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx`, replace the imports:

Replace:
```tsx
import {
  IconArrowRight,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
```

With:
```tsx
import {
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
```

- [ ] **Step 2: Replace the ctaButton prop**

Replace:
```tsx
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add to shortlist
          <IconArrowRight size={20} />
        </button>
      }
```

With:
```tsx
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: null,
            certNumber: null,
            stockId: item.stockId,
            price: item.totalPrice,
            discount: null,
            image: item.images.main,
            category: "lab_grown_melee",
            quantity: 1,
          }}
        />
      }
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/browse/lab-grown-melee/\[slug\]/page.tsx
git commit -m "feat: replace 'Add to shortlist' with 'Add to cart' on lab-grown melee PDP"
```

---

### Task 10: Format and Final Verification

- [ ] **Step 1: Run Prettier**

```bash
npm run format
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Successful build.

- [ ] **Step 5: Commit any formatting changes**

```bash
git add -A
git diff --cached --stat
```

If there are changes:

```bash
git commit -m "style: format add-to-cart files"
```

---

### Task 11: End-to-End Manual Smoke Test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test natural diamond PDP**

Navigate to a natural diamond detail page. Verify:
1. "Add to cart" button with cart icon appears
2. Click it — item appears in cart sheet, header count shows "Cart (1)"
3. Button changes to green "In cart" with checkmark
4. Hover → red "Remove from cart" with X icon
5. Click "Remove from cart" → item removed, button reverts, header shows "Cart (0)"

- [ ] **Step 3: Test multiple items across categories**

1. Add a natural diamond to cart
2. Navigate to a gemstone detail page → add it too
3. Header should show "Cart (2)"
4. Open cart sheet — both items should appear with correct images/names/prices
5. Remove one item from the sheet via the "Remove" button — count decreases

- [ ] **Step 4: Test deduplication**

Navigate to a diamond that's already in the cart. The button should show green "In cart" immediately (not "Add to cart").

- [ ] **Step 5: Test empty state**

Remove all items from the cart. Cart sheet should show "Your cart is empty" with "Continue shopping" button. Clicking it should close the sheet.

- [ ] **Step 6: Test engagement rings are unchanged**

Navigate to an engagement ring detail page. Verify "Proceed to stone selection" button is still present, unchanged.

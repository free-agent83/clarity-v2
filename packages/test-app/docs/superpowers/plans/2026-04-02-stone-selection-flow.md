# Stone Selection Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-step engagement ring stone selection flow — from the ring configurator CTA through stone picking to an "Added to cart" confirmation page.

**Architecture:** Three new routes: a `(configurator)` route group with stripped-down layout for the stone picker, and an `added-to-cart` page under the existing `(shop)` group. Ring configuration passes between pages via URL search params. A new `LayoutConfigurator` component provides the minimal shell. The stone picker server component fetches diamonds filtered by shape/carat, hands them to a client wrapper that manages selection state and the fixed footer.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, Drizzle ORM (existing diamond queries), Zustand (existing cart store — read-only for Phase 0), Tabler Icons.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/layouts/layout-configurator/layout-configurator.tsx` | Create | Stripped-down shell: logo, heading, cancel button |
| `app/buyer/(configurator)/layout.tsx` | Create | Wraps children in `LayoutConfigurator` |
| `app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/page.tsx` | Create | Server component: fetch ring + diamonds, render stone picker |
| `app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/stone-picker.tsx` | Create | Client component: selection state, grid, fixed footer |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/page.tsx` | Create | Server component: fetch ring + stone, render confirmation |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/added-to-cart-actions.tsx` | Create | Client component: View cart / Share / Back to browsing buttons |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx` | Modify | Add CTA button with navigation, accept new props |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/page.tsx` | Modify | Remove static CTA, pass slug + compatibleStones to configurator |

---

### Task 1: Create `LayoutConfigurator` component

**Files:**
- Create: `components/layouts/layout-configurator/layout-configurator.tsx`

- [ ] **Step 1: Create the layout component**

The `LOGOMARK` URL is imported from `BuyerNav` — use the same URL. The header matches `BuyerNav` height (same `py-3.5` padding + border).

```tsx
// components/layouts/layout-configurator/layout-configurator.tsx
import Link from "next/link"
import { IconX } from "@tabler/icons-react"

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788"

type LayoutConfiguratorProps = {
  heading: string
  cancelHref: string
  children: React.ReactNode
}

export function LayoutConfigurator({
  heading,
  cancelHref,
  children,
}: LayoutConfiguratorProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href="/buyer" aria-label="Minivoda Home">
            <img
              src={LOGOMARK}
              alt=""
              className="h-6 w-auto"
              style={{ width: 50.853 }}
            />
          </Link>
          <h1 className="text-base font-medium text-foreground">{heading}</h1>
          <Link
            href={cancelHref}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
            <IconX size={20} />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-8 pt-5">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors related to `layout-configurator`.

- [ ] **Step 3: Commit**

```bash
git add components/layouts/layout-configurator/layout-configurator.tsx
git commit -m "feat(layouts): add LayoutConfigurator stripped-down shell"
```

---

### Task 2: Create `(configurator)` route group layout

**Files:**
- Create: `app/buyer/(configurator)/layout.tsx`

- [ ] **Step 1: Create the route group layout**

This layout is a thin wrapper — the `LayoutConfigurator` props (`heading`, `cancelHref`) are set by individual pages, so the route group layout just passes through children. It mirrors `app/buyer/(shop)/layout.tsx` but without the full app shell.

Note: Unlike the `(shop)` layout, we don't wrap in `LayoutBase` or `RealtimeShell` — the configurator is a focused flow. We still need session auth though, which is handled by `middleware.ts` for all `/buyer/*` routes.

```tsx
// app/buyer/(configurator)/layout.tsx
export default function ConfiguratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 2: Verify the route group is recognised**

Run: `npm run typecheck`
Expected: No errors. The route group exists but has no pages yet — that's fine.

- [ ] **Step 3: Commit**

```bash
git add app/buyer/\(configurator\)/layout.tsx
git commit -m "feat(routes): add (configurator) route group layout"
```

---

### Task 3: Wire the CTA button in `JewelryConfiguration`

**Files:**
- Modify: `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx`
- Modify: `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/page.tsx`

- [ ] **Step 1: Update `JewelryConfiguration` to accept new props and render the CTA**

Add `slug` and `compatibleStones` props. The component already tracks `selectedStoneShape` and `selectedMetal` in state. On CTA click, build the URL with all config params and navigate.

In `jewelry-configuration.tsx`, change the props type and add the CTA button at the bottom:

Replace the existing `JewelryConfigurationProps` type and component signature:

```tsx
// At top of file, add import:
import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

// Replace the props type:
type JewelryConfigurationProps = {
  slug: string
  defaultStoneShape: string
  defaultMetal: string
  availableStoneShapes: { id: string; value: string }[]
  availableMetals: { id: string; value: string; priceUsd: number }[]
  compatibleStones: { id: string; shape: { id: string; value: string }; maxCarat: number }[]
}
```

Update the component signature to destructure the new props:

```tsx
export function JewelryConfiguration({
  slug,
  defaultStoneShape,
  defaultMetal,
  availableStoneShapes,
  availableMetals,
  compatibleStones,
}: JewelryConfigurationProps) {
```

Add a function that builds the stone selection URL from current config state. Place this after the `toggleSelector` function:

```tsx
  function getStoneSelectionHref(): string {
    // Find the compatible stone entry for the selected shape to get maxCarat
    const match = compatibleStones.find(
      (cs) => cs.shape.value === selectedStoneShape,
    )
    const shapeId = match?.shape.id ?? ""
    const maxCarat = match?.maxCarat ?? 10

    // Find the metal ID for the selected metal
    const metalMatch = availableMetals.find((m) => m.value === selectedMetal)
    const metalId = metalMatch?.id ?? ""

    const params = new URLSearchParams({
      shapeId,
      maxCarat: String(maxCarat),
      metalId,
      size: selectedSize,
    })
    if (engravingText) {
      params.set("engraving", engravingText)
    }

    return `/buyer/browse/jewelry/engagement-rings/${slug}/select-stone?${params.toString()}`
  }
```

At the end of the returned JSX, after the engraving `</div>` (the last config section) and before the closing `</div>` of the wrapper, add the CTA button:

```tsx
      {/* CTA — proceed to stone selection */}
      <Link
        href={getStoneSelectionHref()}
        className="mt-3 flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Proceed to stone selection
        <IconArrowRight size={20} />
      </Link>
```

- [ ] **Step 2: Update the ring detail page to pass new props and remove static CTA**

In `page.tsx`, pass `slug` and `compatibleStones` to `JewelryConfiguration`, and remove the `ctaButton` prop from `LayoutProductDetail`.

Replace the `configuration` prop section (around lines 123-129):

```tsx
      configuration={
        <JewelryConfiguration
          slug={item.id}
          defaultStoneShape={defaultStoneShape}
          defaultMetal={defaultMetal}
          availableStoneShapes={availableStoneShapes}
          availableMetals={availableMetals}
          compatibleStones={item.compatibleStones}
        />
      }
```

Remove the entire `ctaButton` prop (lines 138-143):

```tsx
      // DELETE this entire prop:
      ctaButton={
        <button className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Proceed to stone selection
          <IconArrowRight size={20} />
        </button>
      }
```

Also remove the `IconArrowRight` import from `page.tsx` since it's no longer used there (it's now in `jewelry-configuration.tsx`).

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors. The `ctaButton` prop on `LayoutProductDetail` is optional, so removing it is safe.

- [ ] **Step 4: Verify the page renders**

Run: `npm run dev`
Visit an engagement ring detail page. The "Proceed to stone selection" button should appear at the bottom of the configuration section. Hovering should show a URL with search params. Clicking navigates to a 404 (the stone selection page doesn't exist yet) — that's expected.

- [ ] **Step 5: Commit**

```bash
git add app/buyer/\(shop\)/browse/jewelry/engagement-rings/\[slug\]/jewelry-configuration.tsx
git add app/buyer/\(shop\)/browse/jewelry/engagement-rings/\[slug\]/page.tsx
git commit -m "feat(engagement-rings): wire CTA button to navigate with config params"
```

---

### Task 4: Create the stone picker client component

**Files:**
- Create: `app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/stone-picker.tsx`

- [ ] **Step 1: Create the client component**

This component receives the server-fetched data and manages:
- Which stone is selected (client state)
- The fixed footer (mount info + selected stone + CTA)
- Click handlers on stone cards

The grid uses `ProductListItem` but wraps each in a selectable container (since `ProductListItem` renders as a `<Link>`, we need to intercept clicks for selection instead of navigation).

```tsx
// app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/stone-picker.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconShoppingCart } from "@tabler/icons-react"

import { cn, formatUSD } from "@/lib/utils"

type StoneItem = {
  id: string
  shape: string
  carat: number
  color: string
  clarity: string
  cut: string
  price: number
  pricePerCarat: number
  image: string
  description: string
  labGrown: boolean
}

type MountInfo = {
  name: string
  thumbnail: string
  metalLabel: string
  metalPrice: number
  size: string
  engraving: string
  slug: string
}

type StonePickerProps = {
  stones: StoneItem[]
  mount: MountInfo
  configParams: Record<string, string>
}

export function StonePicker({ stones, mount, configParams }: StonePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const selectedStone = stones.find((s) => s.id === selectedId)
  const totalPrice = selectedStone
    ? mount.metalPrice + selectedStone.price
    : mount.metalPrice

  function handleConfirm() {
    if (!selectedStone) return
    const params = new URLSearchParams({
      metalId: configParams.metalId ?? "",
      size: configParams.size ?? "",
      stoneId: selectedStone.id,
      labGrown: String(selectedStone.labGrown),
    })
    if (configParams.engraving) {
      params.set("engraving", configParams.engraving)
    }
    router.push(
      `/buyer/browse/jewelry/engagement-rings/${mount.slug}/added-to-cart?${params.toString()}`,
    )
  }

  return (
    <div className="pb-40">
      {/* Stone grid */}
      <div className="grid grid-cols-4 gap-x-5 gap-y-10">
        {stones.map((stone) => {
          const isSelected = selectedId === stone.id
          return (
            <button
              key={stone.id}
              onClick={() => setSelectedId(stone.id)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl p-2 text-left transition-all",
                isSelected
                  ? "ring-2 ring-foreground"
                  : "hover:ring-1 hover:ring-border",
              )}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden rounded-xl border border-black/4">
                <img
                  src={stone.image}
                  alt={stone.description}
                  className="size-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <p className="truncate text-base leading-7 text-foreground">
                  {stone.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stone.shape} · {stone.carat}ct · {stone.color} ·{" "}
                  {stone.clarity} · {stone.cut}
                </p>
                <p className="text-base leading-7 text-foreground">
                  {formatUSD(stone.price)}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Fixed footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          {/* Mount info */}
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={mount.thumbnail}
                alt={mount.name}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Mount</span>
              <span className="text-sm font-medium text-foreground">
                {mount.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatUSD(mount.metalPrice)}
              </span>
            </div>
          </div>

          {/* Selected stone info */}
          {selectedStone && (
            <>
              <div className="h-10 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border">
                  <img
                    src={selectedStone.image}
                    alt={selectedStone.description}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Center stone
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedStone.description}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatUSD(selectedStone.price)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Total + CTA */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                Total ring price
              </span>
              <span className="text-lg font-medium text-foreground">
                {formatUSD(totalPrice)}
              </span>
            </div>
            <button
              disabled={!selectedStone}
              onClick={handleConfirm}
              className={cn(
                "flex h-12 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors",
                selectedStone
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Confirm and add ring to cart
              <IconShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors related to `stone-picker`.

- [ ] **Step 3: Commit**

```bash
git add app/buyer/\(configurator\)/browse/jewelry/engagement-rings/\[slug\]/select-stone/stone-picker.tsx
git commit -m "feat(stone-selection): add StonePicker client component with grid and fixed footer"
```

---

### Task 5: Create the stone selection server page

**Files:**
- Create: `app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/page.tsx`

- [ ] **Step 1: Create the server page**

This page fetches ring details + diamonds, validates URL params, and renders inside `LayoutConfigurator`. It calls `fetchDiamondListFiltered` twice (natural + lab-grown) and merges results.

```tsx
// app/buyer/(configurator)/browse/jewelry/engagement-rings/[slug]/select-stone/page.tsx
import { notFound } from "next/navigation"

import { fetchEngagementRingItem } from "@/lib/api/jewelry"
import { fetchDiamondListFiltered } from "@/lib/api/diamonds"
import { LayoutConfigurator } from "@/components/layouts/layout-configurator/layout-configurator"
import { PaginationControls } from "@/components/layouts/pagination-controls"
import { SortButton, type SortOption } from "@/components/layouts/layout-product-list/sort-button"
import { StonePicker } from "./stone-picker"

const SORT_OPTIONS: SortOption[] = [
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "carat_asc", label: "Carat: Low → High", displayLabel: "Carat ↑" },
  { value: "carat_desc", label: "Carat: High → Low", displayLabel: "Carat ↓" },
]

const PER_PAGE = 20

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function StoneSelectionPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const sp = await searchParams

  const shapeId = sp.shapeId
  const metalId = sp.metalId
  if (!shapeId || !metalId) notFound()

  const maxCarat = Number(sp.maxCarat) || 10
  const page = Math.max(1, Number(sp.page) || 1)
  const sort = sp.sort ?? "price_asc"

  // Fetch ring details
  const ring = await fetchEngagementRingItem(slug)
  if (!ring) notFound()

  // Find the selected metal's price and label
  const selectedMetal = ring.availableMetals.find((am) => am.metal.id === metalId)
  const metalPrice = selectedMetal?.priceUsd ?? 0
  const metalLabel = selectedMetal?.metal.value ?? "Unknown"

  // Find shape value from compatible stones
  const compatibleStone = ring.compatibleStones.find(
    (cs) => cs.shape.id === shapeId,
  )
  const shapeValue = compatibleStone?.shape.value ?? "Unknown"

  // Build filters for diamond query
  const filters: Record<string, string[] | { min?: number; max?: number }> = {
    shape: [shapeValue],
    carat: { max: maxCarat },
  }

  const pagination = { page, perPage: PER_PAGE, offset: (page - 1) * PER_PAGE }

  // Fetch both natural and lab-grown diamonds, merge results
  const [naturalResult, labGrownResult] = await Promise.all([
    fetchDiamondListFiltered(filters, sort, pagination, false),
    fetchDiamondListFiltered(filters, sort, pagination, true),
  ])

  // Merge and re-sort. Tag each with labGrown.
  const allStones = [
    ...naturalResult.items.map((d) => ({ ...d, labGrown: false })),
    ...labGrownResult.items.map((d) => ({ ...d, labGrown: true })),
  ].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price
    if (sort === "price_desc") return b.price - a.price
    if (sort === "carat_asc") return a.carat - b.carat
    if (sort === "carat_desc") return b.carat - a.carat
    return a.price - b.price
  })

  // Take only PER_PAGE from merged results
  const pagedStones = allStones.slice(0, PER_PAGE)
  const totalItems = naturalResult.totalItems + labGrownResult.totalItems
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE))

  // Build thumbnail
  const thumbnail =
    ring.images.find((img) => img.isThumbnail)?.url ?? ring.images[0]?.url ?? ""

  // Config summary
  const size = sp.size ?? "7"
  const engraving = sp.engraving ?? ""

  // Format metal label for display
  const metalDisplay = metalLabel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const configSummary = [metalDisplay, shapeValue, `Size ${size}`]
    .filter(Boolean)
    .join(" · ")

  const cancelHref = `/buyer/browse/jewelry/engagement-rings/${slug}`

  return (
    <LayoutConfigurator heading="Select a stone" cancelHref={cancelHref}>
      <div className="flex flex-col gap-6">
        {/* Ring context bar */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium text-foreground">
            {ring.description}
          </h2>
          <p className="text-sm text-muted-foreground">{configSummary}</p>
        </div>

        {/* Results count + sort */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium text-muted-foreground">
            {totalItems.toLocaleString()} results
          </p>
          <SortButton options={SORT_OPTIONS} />
        </div>

        {/* Client component: grid + footer */}
        <StonePicker
          stones={pagedStones}
          mount={{
            name: ring.description,
            thumbnail,
            metalLabel: metalDisplay,
            metalPrice,
            size,
            engraving,
            slug,
          }}
          configParams={{
            metalId: metalId,
            size,
            engraving,
          }}
        />

        {/* Pagination */}
        <div className="pb-32">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            perPageOptions={[20]}
          />
        </div>
      </div>
    </LayoutConfigurator>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Verify the page renders**

Run: `npm run dev`
Navigate to an engagement ring → click "Proceed to stone selection." The stone selection page should render with:
- Stripped-down header (logo, "Select a stone", Cancel)
- Ring name + config summary
- Grid of diamonds filtered by the selected shape
- Fixed footer with mount info

If the database has no diamonds matching the shape, you'll see an empty grid — that's OK for now.

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(configurator\)/browse/jewelry/engagement-rings/\[slug\]/select-stone/page.tsx
git commit -m "feat(stone-selection): add stone selection server page with diamond fetching"
```

---

### Task 6: Create the "Added to cart" actions client component

**Files:**
- Create: `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/added-to-cart-actions.tsx`

- [ ] **Step 1: Create the client component for action buttons**

This needs to be a client component because "View cart" opens the cart Sheet (Zustand store) and "Share with stone" opens the `ShareModal` (client-side dialog).

```tsx
// app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/added-to-cart-actions.tsx
"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { IconShoppingCart, IconShare } from "@tabler/icons-react"

import { useCartStore } from "@/hooks/use-cart-store"
import type { ShareableProduct } from "@/components/share-modal"

const ShareModal = dynamic(
  () =>
    import("@/components/share-modal").then((m) => ({
      default: m.ShareModal,
    })),
  { ssr: false },
)

type AddedToCartActionsProps = {
  product: ShareableProduct
}

export function AddedToCartActions({ product }: AddedToCartActionsProps) {
  const openSheet = useCartStore((s) => s.openSheet)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={openSheet}
        className="flex h-11.25 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        View cart
        <IconShoppingCart size={20} />
      </button>

      <ShareModal product={product}>
        <button className="flex h-11.25 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Share with stone
          <IconShare size={20} />
        </button>
      </ShareModal>

      <Link
        href="/buyer/browse/jewelry/engagement-rings"
        className="flex h-11.25 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Back to browsing
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/buyer/\(shop\)/browse/jewelry/engagement-rings/\[slug\]/added-to-cart/added-to-cart-actions.tsx
git commit -m "feat(added-to-cart): add action buttons client component"
```

---

### Task 7: Create the "Added to cart" server page

**Files:**
- Create: `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/page.tsx`

- [ ] **Step 1: Create the server page**

Fetches ring + stone details, renders the confirmation layout within the existing `(shop)` app shell.

```tsx
// app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/added-to-cart/page.tsx
import { notFound } from "next/navigation"
import { IconCircleCheckFilled } from "@tabler/icons-react"

import { fetchEngagementRingItem } from "@/lib/api/jewelry"
import { fetchDiamondItem } from "@/lib/api/diamonds"
import { formatUSD } from "@/lib/utils"
import { AddedToCartActions } from "./added-to-cart-actions"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AddedToCartPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const sp = await searchParams

  const metalId = sp.metalId
  const stoneId = sp.stoneId
  const labGrown = sp.labGrown === "true"
  if (!metalId || !stoneId) notFound()

  // Fetch ring and stone in parallel
  const [ring, stone] = await Promise.all([
    fetchEngagementRingItem(slug),
    fetchDiamondItem(stoneId, labGrown),
  ])
  if (!ring || !stone) notFound()

  // Resolve config details
  const selectedMetal = ring.availableMetals.find(
    (am) => am.metal.id === metalId,
  )
  const metalPrice = selectedMetal?.priceUsd ?? 0
  const metalLabel = (selectedMetal?.metal.value ?? "Unknown")
    .split("_")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const size = sp.size ?? "7"
  const engraving = sp.engraving ?? ""
  const totalPrice = metalPrice + stone.price

  const thumbnail =
    ring.images.find((img) => img.isThumbnail)?.url ?? ring.images[0]?.url ?? ""

  // Config subtitle
  const configDetails = [
    metalLabel,
    `${stone.shape} center stone`,
    `Size ${size}`,
    engraving ? `Engraving: "${engraving}"` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  // ShareableProduct for the share modal
  const shareProduct = {
    title: ring.description,
    subtitle: configDetails,
    price: totalPrice,
    imageSrc: thumbnail,
    attributes: [
      { label: "Metal", value: metalLabel },
      { label: "Center stone", value: stone.description },
      { label: "Size", value: size },
      ...(engraving ? [{ label: "Engraving", value: engraving }] : []),
    ],
  }

  return (
    <div className="mx-auto max-w-3xl py-10">
      {/* Success banner */}
      <div className="flex items-center gap-3 pb-8">
        <IconCircleCheckFilled size={28} className="text-green-600" />
        <h1 className="text-2xl font-medium text-foreground">Added to cart.</h1>
      </div>

      {/* Ring summary card */}
      <div className="flex items-start justify-between rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
            <img
              src={thumbnail}
              alt={ring.description}
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium text-foreground">
              {ring.description}
            </h2>
            <p className="text-sm text-muted-foreground">{configDetails}</p>
          </div>
        </div>
        <span className="text-lg font-medium text-foreground">
          {formatUSD(totalPrice)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="pt-6 pb-8">
        <AddedToCartActions product={shareProduct} />
      </div>

      {/* Included stones section */}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          The following stones are included in the item, and were also added to
          your cart:
        </p>

        <div className="flex items-start justify-between rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={stone.images.main}
                alt={stone.description}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Center stone
              </span>
              <h3 className="text-base font-medium text-foreground">
                {stone.shape} {stone.carat}ct {stone.color} {stone.clarity}{" "}
                {stone.cut} {stone.fluorescence}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stone.certification.lab} {stone.certification.number}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-medium text-foreground">
              {formatUSD(stone.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Verify the full flow end-to-end**

Run: `npm run dev`

1. Visit an engagement ring detail page
2. Configure the ring (select a stone shape, metal, size)
3. Click "Proceed to stone selection" → stone picker page loads
4. Select a diamond from the grid → footer updates with stone info + total
5. Click "Confirm and add ring to cart" → added-to-cart confirmation page loads
6. Verify: success banner, ring summary with config details, stone card, action buttons
7. Click "View cart" → cart sheet opens
8. Click "Share with stone" → share modal opens
9. Click "Back to browsing" → navigates to engagement rings listing

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/browse/jewelry/engagement-rings/\[slug\]/added-to-cart/page.tsx
git commit -m "feat(added-to-cart): add confirmation page with ring+stone summary"
```

---

### Task 8: Format and lint

- [ ] **Step 1: Run formatter and linter**

```bash
npm run format
npm run lint
npm run typecheck
```

Fix any issues that arise.

- [ ] **Step 2: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: format and lint stone selection flow"
```

---

### Task 9: Build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors. The new routes should appear in the build output.

- [ ] **Step 2: Commit if any build fixes were needed**

Only commit if changes were required. Otherwise, no commit needed.

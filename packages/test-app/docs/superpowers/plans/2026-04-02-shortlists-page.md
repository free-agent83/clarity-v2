# Shortlists Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shortlists "under construction" placeholder with a working shortlists UI — index page with card grid and detail page with data grid — using mock data and client-side state.

**Architecture:** A single `useShortlistsState` hook colocates mock data, types, and all mutation logic (following the `use-search.ts` pattern). Two page components consume the hook: an index page rendering shortlist cards in a 3-column grid, and a `[id]` detail page rendering items in a shadcn `Table`. All state is session-scoped — no backend wiring.

**Tech Stack:** Next.js App Router, React `useState`, shadcn/ui (`Dialog`, `Table`, `Button`, `Input`, `DropdownMenu`), Tabler Icons, `sonner` for toasts, Tailwind CSS v4.

---

## File Structure

| File | Responsibility |
|---|---|
| `hooks/use-shortlists-state.ts` | Types, mock data constants, `useShortlistsState()` hook with all mutations |
| `app/buyer/(shop)/shortlists/page.tsx` | Index page — card grid, empty state, create dialog (replaces placeholder) |
| `app/buyer/(shop)/shortlists/[id]/page.tsx` | Detail page — header, data grid, rename dialog, empty state |

---

### Task 1: Create the `useShortlistsState` hook

**Files:**
- Create: `hooks/use-shortlists-state.ts`

- [ ] **Step 1: Create the hook file with types, mock data, and hook**

```ts
"use client"

import { useState } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShortlistItem {
  id: string
  stockId: string
  title: string
  specs: string
  category: string
  image: string | null
  href: string
  price: number
  addedAt: string
}

export interface Shortlist {
  id: string
  name: string
  createdAt: string
  items: ShortlistItem[]
}

// ---------------------------------------------------------------------------
// Mock data — all scoped here for easy purging when real APIs are wired up
// ---------------------------------------------------------------------------

const MOCK_SHORTLISTS: Shortlist[] = [
  {
    id: "sl-001",
    name: "Engagement collection",
    createdAt: "2026-02-14T00:00:00Z",
    items: [
      {
        id: "sli-001",
        stockId: "STK-1001",
        title: "1.01ct Round D IF Excellent Cut",
        specs: "1.01ct · Round · D · IF",
        category: "Natural Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/natural-diamonds/d001",
        price: 18750,
        addedAt: "2026-02-15T10:00:00Z",
      },
      {
        id: "sli-002",
        stockId: "STK-1002",
        title: "0.71ct Round E VVS1 Excellent Cut",
        specs: "0.71ct · Round · E · VVS1",
        category: "Natural Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/natural-diamonds/d002",
        price: 4890,
        addedAt: "2026-02-16T14:30:00Z",
      },
      {
        id: "sli-003",
        stockId: "STK-3001",
        title: "Solitaire Round Diamond Ring",
        specs: "14K White Gold · Round",
        category: "Engagement Ring",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
        href: "/buyer/browse/jewelry/engagement-rings/er001",
        price: 3200,
        addedAt: "2026-02-17T09:00:00Z",
      },
      {
        id: "sli-004",
        stockId: "STK-1003",
        title: "2.03ct Round F VS1 Excellent Cut",
        specs: "2.03ct · Round · F · VS1",
        category: "Natural Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/natural-diamonds/d003",
        price: 28400,
        addedAt: "2026-02-18T11:15:00Z",
      },
    ],
  },
  {
    id: "sl-002",
    name: "Client favourites",
    createdAt: "2026-03-01T00:00:00Z",
    items: [
      {
        id: "sli-005",
        stockId: "STK-2001",
        title: "1.25ct Cushion E VS1 Excellent Cut",
        specs: "1.25ct · Cushion · E · VS1",
        category: "Lab Grown Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/lab-grown-diamonds/lg001",
        price: 1200,
        addedAt: "2026-03-02T08:00:00Z",
      },
      {
        id: "sli-006",
        stockId: "STK-4001",
        title: "2.15ct Oval Vivid Red Ruby",
        specs: "2.15ct · Oval · Vivid Red · Minor treatment",
        category: "Gemstone",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
        href: "/buyer/browse/gemstones/gs001",
        price: 68000,
        addedAt: "2026-03-03T16:45:00Z",
      },
      {
        id: "sli-007",
        stockId: "STK-4002",
        title: "3.50ct Oval Blue Sapphire",
        specs: "3.50ct · Oval · Blue · No treatment",
        category: "Gemstone",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
        href: "/buyer/browse/gemstones/gs002",
        price: 12500,
        addedAt: "2026-03-04T10:00:00Z",
      },
    ],
  },
  {
    id: "sl-003",
    name: "Investment Stones",
    createdAt: "2026-03-15T00:00:00Z",
    items: [
      {
        id: "sli-008",
        stockId: "STK-1004",
        title: "1.50ct Oval G VVS2 Very Good Cut",
        specs: "1.50ct · Oval · G · VVS2",
        category: "Natural Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/natural-diamonds/d004",
        price: 14200,
        addedAt: "2026-03-16T12:00:00Z",
      },
      {
        id: "sli-009",
        stockId: "STK-1005",
        title: "0.50ct Princess D VS2 Excellent Cut",
        specs: "0.50ct · Princess · D · VS2",
        category: "Natural Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/natural-diamonds/d005",
        price: 2850,
        addedAt: "2026-03-17T15:30:00Z",
      },
      {
        id: "sli-010",
        stockId: "STK-2002",
        title: "2.00ct Emerald F VVS2 Very Good Cut",
        specs: "2.00ct · Emerald · F · VVS2",
        category: "Lab Grown Diamond",
        image:
          "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
        href: "/buyer/browse/lab-grown-diamonds/lg002",
        price: 2400,
        addedAt: "2026-03-18T09:00:00Z",
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

let nextId = 100

export function useShortlistsState() {
  const [shortlists, setShortlists] = useState<Shortlist[]>(MOCK_SHORTLISTS)

  function getShortlist(id: string) {
    return shortlists.find((sl) => sl.id === id)
  }

  function createShortlist(name: string) {
    const id = `sl-${nextId++}`
    setShortlists((prev) => [
      ...prev,
      { id, name, createdAt: new Date().toISOString(), items: [] },
    ])
  }

  function renameShortlist(id: string, name: string) {
    setShortlists((prev) =>
      prev.map((sl) => (sl.id === id ? { ...sl, name } : sl)),
    )
  }

  function deleteShortlist(id: string) {
    setShortlists((prev) => prev.filter((sl) => sl.id !== id))
  }

  function removeItem(shortlistId: string, itemId: string) {
    setShortlists((prev) =>
      prev.map((sl) =>
        sl.id === shortlistId
          ? { ...sl, items: sl.items.filter((item) => item.id !== itemId) }
          : sl,
      ),
    )
  }

  return { shortlists, getShortlist, createShortlist, renameShortlist, deleteShortlist, removeItem }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `use-shortlists-state.ts`.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-shortlists-state.ts
git commit -m "feat(shortlists): add useShortlistsState hook with mock data"
```

---

### Task 2: Build the shortlists index page

**Files:**
- Modify: `app/buyer/(shop)/shortlists/page.tsx` (replaces current placeholder)

**Context:** The current file imports `LayoutUnderConstruction` and renders a placeholder. Replace the entire contents. This is a `"use client"` component because it uses the `useShortlistsState` hook. The page renders a 3-column card grid where each card shows a 2x2 thumbnail mosaic, shortlist name, and item count + date. A "New shortlist" button opens a `Dialog` with a name input.

- [ ] **Step 1: Replace the shortlists index page**

Replace the entire contents of `app/buyer/(shop)/shortlists/page.tsx` with:

```tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { IconPlus, IconHeart } from "@tabler/icons-react"
import { useShortlistsState } from "@/hooks/use-shortlists-state"
import type { Shortlist } from "@/hooks/use-shortlists-state"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })
}

function ThumbnailMosaic({ items }: { items: Shortlist["items"] }) {
  const images = items.slice(0, 4).map((item) => item.image)

  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-t-lg border border-dashed border-border bg-muted">
        <IconHeart className="size-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-t-lg bg-muted">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden bg-muted">
          {images[i] ? (
            <Image
              src={images[i]}
              alt=""
              width={200}
              height={150}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-muted" />
          )}
        </div>
      ))}
    </div>
  )
}

function ShortlistCard({ shortlist }: { shortlist: Shortlist }) {
  return (
    <Link
      href={`/buyer/shortlists/${shortlist.id}`}
      className="group rounded-lg border border-border bg-background transition-colors hover:bg-muted/50"
    >
      <ThumbnailMosaic items={shortlist.items} />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground">
          {shortlist.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {shortlist.items.length} {shortlist.items.length === 1 ? "item" : "items"} · {formatDate(shortlist.createdAt)}
        </p>
      </div>
    </Link>
  )
}

function CreateShortlistDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setName(""), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New shortlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="e.g. Wedding Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ShortlistsPage() {
  const { shortlists, createShortlist } = useShortlistsState()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-medium leading-14 text-foreground">
            Shortlists
          </h1>
          <p className="text-sm text-muted-foreground">
            {shortlists.length} {shortlists.length === 1 ? "list" : "lists"}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={() => setDialogOpen(true)}>
          <IconPlus className="size-5" />
          New shortlist
        </Button>
      </div>

      {/* Card grid or empty state */}
      {shortlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <IconHeart className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              No shortlists yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first shortlist to start saving items.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="size-4" />
            New shortlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortlists.map((sl) => (
            <ShortlistCard key={sl.id} shortlist={sl} />
          ))}
        </div>
      )}

      <CreateShortlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={createShortlist}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Visual check**

Run: `npm run dev` and navigate to `/buyer/shortlists`. Verify:
- 3-column grid with 3 shortlist cards visible
- Each card has a 2x2 thumbnail mosaic, name, item count, and date
- "New shortlist" button opens a dialog with a name input
- Clicking "Create" in the dialog adds a new card to the grid
- No "under construction" placeholder

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/shortlists/page.tsx
git commit -m "feat(shortlists): replace placeholder with index page card grid"
```

---

### Task 3: Build the shortlist detail page

**Files:**
- Create: `app/buyer/(shop)/shortlists/[id]/page.tsx`

**Context:** This page shows a single shortlist: header with name/meta/actions, and a data grid (shadcn `Table`) of items. The header has a back link, rename/delete via `DropdownMenu`, and the table has columns for thumbnail, internal ref, product, category, price, and actions (remove, add to cart). Row clicks navigate to the product detail page.

- [ ] **Step 1: Create the detail page**

```tsx
"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  IconArrowLeft,
  IconDots,
  IconTrash,
  IconShoppingCartPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useShortlistsState } from "@/hooks/use-shortlists-state"
import type { ShortlistItem } from "@/hooks/use-shortlists-state"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatPrice(price: number) {
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2 })
}

function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onRename: (name: string) => void
}) {
  const [name, setName] = useState(currentName)

  useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onRename(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename shortlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ItemRow({
  item,
  onRemove,
}: {
  item: ShortlistItem
  onRemove: () => void
}) {
  return (
    <TableRow>
      <TableCell className="w-14">
        <Link href={item.href}>
          <div className="size-10 shrink-0 overflow-hidden rounded-md border border-border">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                width={40}
                height={40}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-muted" />
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        <Link href={item.href}>{item.stockId}</Link>
      </TableCell>
      <TableCell className="max-w-md">
        <Link href={item.href} className="block">
          <span className="text-sm font-medium text-foreground">
            {item.title}
          </span>
          <br />
          <span className="text-sm text-muted-foreground">{item.specs}</span>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.category}
      </TableCell>
      <TableCell className="text-right text-sm font-semibold text-foreground">
        {formatPrice(item.price)}
      </TableCell>
      <TableCell className="w-20">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              toast("Added to cart")
            }}
          >
            <IconShoppingCartPlus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
              toast("Removed from shortlist")
            }}
          >
            <IconTrash className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function ShortlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getShortlist, renameShortlist, deleteShortlist, removeItem } =
    useShortlistsState()
  const shortlist = getShortlist(id)
  const [renameOpen, setRenameOpen] = useState(false)

  if (!shortlist) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-foreground">
          Shortlist not found
        </p>
        <Button variant="outline" asChild>
          <Link href="/buyer/shortlists">
            <IconArrowLeft className="size-4" />
            Back to shortlists
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/buyer/shortlists"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          Back to shortlists
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-medium leading-14 text-foreground">
              {shortlist.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {shortlist.items.length}{" "}
              {shortlist.items.length === 1 ? "item" : "items"} · Created{" "}
              {formatDate(shortlist.createdAt)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IconDots className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  deleteShortlist(id)
                  toast("Shortlist deleted")
                  router.push("/buyer/shortlists")
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data grid or empty state */}
      {shortlist.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-lg font-medium text-foreground">
            This shortlist is empty
          </p>
          <p className="text-sm text-muted-foreground">
            Browse products to add items to this shortlist.
          </p>
          <Button variant="outline" asChild>
            <Link href="/buyer">Browse products</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Internal Ref</TableHead>
              <TableHead className="max-w-md">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortlist.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(id, item.id)}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={shortlist.name}
        onRename={(name) => renameShortlist(id, name)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Visual check**

Navigate to `/buyer/shortlists` and click into "Engagement collection". Verify:
- Back link to `/buyer/shortlists` works
- Title shows "Engagement collection" with item count and date
- Data grid shows all items with thumbnail, internal ref, product name + specs, category, price
- Overflow menu has "Rename" and "Delete" options
- "Rename" opens a dialog, saving updates the title
- "Delete" removes the shortlist and navigates back
- Remove (trash icon) removes the row with a toast
- Add to cart (cart icon) shows a toast
- Clicking a row navigates to the product detail page

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/shortlists/\[id\]/page.tsx
git commit -m "feat(shortlists): add shortlist detail page with data grid"
```

---

### Task 4: Format, lint, and final verification

**Files:**
- All files from Tasks 1-3

- [ ] **Step 1: Run Prettier**

Run: `npm run format`

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: No errors. Fix any issues.

- [ ] **Step 3: Run type check**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit any formatting changes**

If Prettier or lint changed anything:
```bash
git add -A
git commit -m "chore(shortlists): format and lint fixes"
```

- [ ] **Step 6: Final visual smoke test**

Start dev server (`npm run dev`) and verify end-to-end:
1. `/buyer/shortlists` — 3 cards visible, mosaic thumbnails, correct item counts and dates
2. Click "New shortlist" — dialog opens, type a name, click Create — new card appears (empty mosaic with heart icon)
3. Click "Engagement collection" — detail page loads with 4 items in data grid
4. Click trash icon on a row — row removed, toast shown
5. Click cart icon on a row — toast "Added to cart"
6. Overflow menu → Rename → type new name → Save — title updates
7. Overflow menu → Delete — redirects to index, shortlist gone
8. Click "Back to shortlists" — returns to index
9. Navigate to a shortlist, then open the same URL in a new tab — second tab shows fresh mock data (session-scoped state does not persist across tabs)

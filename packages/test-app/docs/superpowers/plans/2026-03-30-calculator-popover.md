# Calculator Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a functional diamond pricing calculator that opens in a persistent popover from the buyer nav calculator button.

**Architecture:** A new `"use client"` component (`CalculatorPopover`) owns all state and UI. It replaces the bare `<button>` in `BuyerNav`, which stays a Server Component. The popover uses the existing shadcn Popover primitive with `onInteractOutside` blocked so it stays open while the user browses.

**Tech Stack:** React `useState`, shadcn Popover, shadcn Select, shadcn Input, shadcn Label, @tabler/icons-react

---

## Files

| Action | Path | Responsibility |
|---|---|---|
| Create | `components/shell/calculator-popover.tsx` | All calculator state + UI |
| Modify | `components/shell/buyer-nav.tsx` | Replace bare button with `<CalculatorPopover />` |

---

### Task 1: Create the CalculatorPopover component

**Files:**
- Create: `components/shell/calculator-popover.tsx`

- [ ] **Step 1: Create the file with the full implementation**

```tsx
"use client"

import { useState } from "react"
import { IconCalculator, IconX } from "@tabler/icons-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const SHAPES = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Marquise",
  "Emerald",
  "Asscher",
  "Radiant",
  "Heart",
]
const COLOURS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]
const CLARITIES = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
]

export function CalculatorPopover() {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState("")
  const [shape, setShape] = useState("")
  const [colour, setColour] = useState("")
  const [clarity, setClarity] = useState("")
  const [pricePerCt, setPricePerCt] = useState("")
  const [discount, setDiscount] = useState(0)

  const sizeNum = parseFloat(size)
  const priceNum = parseFloat(pricePerCt)
  const totalPrice =
    !isNaN(sizeNum) && !isNaN(priceNum) && sizeNum > 0 && priceNum > 0
      ? sizeNum * priceNum * (1 + discount / 100)
      : null

  const formattedTotal =
    totalPrice !== null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(totalPrice)
      : "$0.00"

  function handleReset() {
    setSize("")
    setShape("")
    setColour("")
    setClarity("")
    setPricePerCt("")
    setDiscount(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-lg p-3 text-foreground transition-colors hover:bg-muted",
            open && "bg-muted",
          )}
          aria-label="Open calculator"
        >
          <IconCalculator size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Calculator</span>
            <button
              onClick={handleReset}
              className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close calculator"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Stone params — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Size (ct)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Shape</Label>
              <Select value={shape} onValueChange={setShape}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Shape" />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Colour</Label>
              <Select value={colour} onValueChange={setColour}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Colour" />
                </SelectTrigger>
                <SelectContent>
                  {COLOURS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Clarity</Label>
              <Select value={clarity} onValueChange={setClarity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Clarity" />
                </SelectTrigger>
                <SelectContent>
                  {CLARITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label className="text-xs">Discount (%)</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="pr-6"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
              <button
                onClick={() => setDiscount((d) => Math.max(-99, d - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                aria-label="Decrease by 1%"
              >
                −
              </button>
              <button
                onClick={() => setDiscount((d) => Math.min(999, d + 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                aria-label="Increase by 1%"
              >
                +
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use negative values for discount, positive values for markup.
            </p>
          </div>

          {/* Output */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Price/Ct (USD)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={pricePerCt}
                    onChange={(e) => setPricePerCt(e.target.value)}
                    className="pr-14"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    per ct
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total Price (USD)</Label>
                <div className="flex h-9 items-center justify-between rounded-md border border-border bg-muted/50 px-3">
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      totalPrice !== null
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {formattedTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Run the type-checker to verify no errors**

```bash
npm run typecheck
```

Expected: exits with no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shell/calculator-popover.tsx
git commit -m "feat: add CalculatorPopover component (issue #10)"
```

---

### Task 2: Wire CalculatorPopover into BuyerNav

**Files:**
- Modify: `components/shell/buyer-nav.tsx`

- [ ] **Step 1: Replace the bare button with `<CalculatorPopover />`**

In `components/shell/buyer-nav.tsx`:

Remove the `IconCalculator` import from the top-level imports (it's now inside the component):
```tsx
import {
  IconChevronDown,
  IconCurrencyEuro,
  IconHeart,
  IconHelp,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react"
```

Add the CalculatorPopover import after the existing imports:
```tsx
import { CalculatorPopover } from "@/components/shell/calculator-popover"
```

Replace the bare calculator button:
```tsx
// Remove this:
<button className="rounded-lg p-3 text-foreground transition-colors hover:bg-muted">
  <IconCalculator size={20} />
</button>

// Replace with:
<CalculatorPopover />
```

- [ ] **Step 2: Run the type-checker**

```bash
npm run typecheck
```

Expected: exits with no errors.

- [ ] **Step 3: Run the linter**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Start the dev server and manually verify**

```bash
npm run dev
```

Visit `http://localhost:3000/buyer` (log in if needed).

Verify:
1. Calculator icon appears in the nav — click it → popover opens anchored below the button
2. Button appears active (muted bg) while open
3. Click anywhere on the page outside the popover → popover stays open
4. Press Escape → popover closes
5. Reopen → enter `1.00` in Size, `5000` in Price/Ct → Total shows `$5,000.00`
6. Set Discount to `-10` → Total shows `$4,500.00`
7. Click Reset → all fields clear, Total resets to `$0.00`, popover stays open
8. Click `×` → popover closes
9. Click calculator button again → popover reopens
10. Dark mode (press `d`) → verify styling is consistent

- [ ] **Step 5: Commit**

```bash
git add components/shell/buyer-nav.tsx
git commit -m "feat: wire CalculatorPopover into BuyerNav (issue #10)"
```

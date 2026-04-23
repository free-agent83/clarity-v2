# Calculator Popover — Design Spec

**Issue:** #10
**Date:** 2026-03-30
**Branch:** issue-10

---

## Overview

Clicking the calculator icon in the buyer nav opens a persistent popover containing a diamond pricing calculator. The popover stays open while the user browses the page underneath; it can only be dismissed explicitly.

---

## Component

**New file:** `components/shell/calculator-popover.tsx`

- `"use client"` directive — all state is local to this component
- Imported into `components/shell/buyer-nav.tsx`, replacing the bare `<button>`
- `BuyerNav` remains a Server Component

---

## State

| Field | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | `false` | Popover visibility |
| `size` | `string` | `""` | Carat weight input |
| `shape` | `string` | `""` | Dropdown (context only, Phase 0) |
| `colour` | `string` | `""` | Dropdown (context only, Phase 0) |
| `clarity` | `string` | `""` | Dropdown (context only, Phase 0) |
| `pricePerCt` | `string` | `""` | Base price per carat input |
| `discount` | `number` | `0` | Integer %, range −99 to +999 |

**Computed:** `totalPrice = parseFloat(size) × parseFloat(pricePerCt) × (1 + discount / 100)`
Displayed as `$0.00` when either input is empty or non-numeric.

---

## Dropdown Options

**Shape:** Round, Princess, Cushion, Oval, Pear, Marquise, Emerald, Asscher, Radiant, Heart

**Colour (GIA):** D, E, F, G, H, I, J, K, L, M

**Clarity (GIA):** FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3

---

## Popover Behaviour

- `onInteractOutside={(e) => e.preventDefault()}` — clicking outside does NOT close
- `onEscapeKeyDown` — default behaviour preserved; Escape closes the popover
- Toggle: clicking the calculator button opens/closes the popover
- Close button (`×`) in the popover header also closes it
- Reset button clears all fields to defaults without closing

---

## Layout

**Popover:** width 320px, `align="end"`, anchored to the calculator button in the nav.

```
┌─────────────────────────────────────────┐
│ Calculator        [Reset]            [×] │
├─────────────────────────────────────────┤
│ Size (ct)          Shape                │
│ [______]           [_________ ▾]        │
│                                         │
│ Colour             Clarity              │
│ [_________ ▾]      [_________ ▾]        │
├─────────────────────────────────────────┤
│ Discount (%)                            │
│ [  0    ] %   [−]  [+]                  │
│ Use negative for discount, positive     │
│ for markup.                             │
├─────────────────────────────────────────┤
│ Price/Ct (USD)     Total Price (USD)    │
│ [______] per ct    $0.00               │
└─────────────────────────────────────────┘
```

- Stone params in a **2×2 grid** (Size + Shape top row, Colour + Clarity bottom row)
- Discount ± are icon-sized buttons, step 1
- Total Price displayed with larger, prominent font
- Visual separators between sections
- Styled with existing theme tokens (bg-popover, text-popover-foreground, muted for secondary elements)

---

## Changes to `buyer-nav.tsx`

Replace:
```tsx
<button className="rounded-lg p-3 text-foreground transition-colors hover:bg-muted">
  <IconCalculator size={20} />
</button>
```

With:
```tsx
<CalculatorPopover />
```

`BuyerNav` gains one import; no other changes.

---

## Acceptance Criteria

- [ ] Calculator button opens the popover
- [ ] Clicking outside the popover does not close it
- [ ] Escape key closes the popover
- [ ] Calculator button click toggles the popover
- [ ] `×` close button closes the popover
- [ ] Reset clears all fields without closing
- [ ] Total Price updates reactively as Size, Price/Ct, or Discount change
- [ ] Displays `$0.00` when inputs are empty or invalid
- [ ] Shape, Colour, Clarity dropdowns populate with correct GIA values

# Checkout Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-step checkout flow with mock data and a confirmation page, entered from the cart sheet.

**Architecture:** Single route at `/buyer/checkout` with client-side step management via Zustand. Each step is a lazy-loaded component. Confirmation gets its own URL at `/buyer/checkout/confirmation`. All checkout-specific components live in `components/checkout/`. No database writes — cart items are real (from `useCartStore`), everything else is mock/local state.

**Tech Stack:** Next.js 16 App Router, React 19, Zustand 5, Tailwind CSS 4, shadcn/ui, Tabler Icons, Recharts (credit bar), Sonner (toasts)

**Spec:** `docs/superpowers/specs/2026-04-07-checkout-flow-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `hooks/use-checkout-store.ts` | Create | Zustand store for all checkout state (step, notes, delivery, payment, discount, QC) |
| `app/buyer/(checkout)/layout.tsx` | Create | Server component: checkout shell header (logo, help link, cancel) |
| `app/buyer/(checkout)/checkout/page.tsx` | Create | Client component: step orchestrator, renders stepper + active step + sidebar |
| `app/buyer/(checkout)/checkout/confirmation/page.tsx` | Create | Confirmation page with guard |
| `components/checkout/checkout-stepper.tsx` | Create | Horizontal 4-step progress indicator |
| `components/checkout/order-summary.tsx` | Create | Sticky sidebar: totals, discount codes, QC requirements, CTA |
| `components/checkout/qc-requirements-modal.tsx` | Create | Modal with textarea for editing QC requirements |
| `components/checkout/step-review.tsx` | Create | Step 1: general notes, cart item list with reference/notes inputs |
| `components/checkout/step-delivery.tsx` | Create | Step 2: address mode toggle, address selection, per-item addresses |
| `components/checkout/add-address-modal.tsx` | Create | Modal form for adding a new address to session |
| `components/checkout/step-payment.tsx` | Create | Step 3: credit bar, payment terms selection |
| `components/checkout/step-confirm.tsx` | Create | Step 4: order review with edit links |
| `components/checkout/checkout-confirmation.tsx` | Create | Confirmation content: thank you, timeline, support |
| `components/shell/cart-button.tsx` | Modify | Wire "Proceed to checkout" to navigate to `/buyer/checkout` |

---

### Task 1: Checkout Store

**Files:**
- Create: `hooks/use-checkout-store.ts`

- [ ] **Step 1: Create the checkout store**

```ts
import { create } from "zustand"

import { useCartStore } from "@/hooks/use-cart-store"

/* ── Mock data ─────────────────────────────────────────────── */

export const MOCK_PAYMENT_TERMS = [
  {
    id: "pt-3-days",
    name: "Pay in 3 days",
    badge: "1.4% DISCOUNT + TAX",
    discountPercent: 1.4,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 3 days to pay the invoice",
    ],
  },
  {
    id: "pt-30-days",
    name: "Pay in 30 days",
    badge: null,
    discountPercent: 0,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 30 days to pay the invoice",
    ],
  },
  {
    id: "pt-60-days",
    name: "Pay in 60 days",
    badge: "1.4% FEE + TAX",
    discountPercent: -1.4,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 60 days to pay the invoice",
    ],
  },
  {
    id: "pt-upfront",
    name: "Upfront payment",
    badge: "1.4% DISCOUNT + TAX",
    discountPercent: 1.4,
    description: "Shipping after confirmed payment",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "We issue an invoice for upfront payment",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order after payment is confirmed",
    ],
  },
] as const

export type PaymentTerm = (typeof MOCK_PAYMENT_TERMS)[number]

export const CREDIT_LIMIT = 10_000
export const CREDIT_USED_BEFORE = 5_000
export const MOCK_DISCOUNT_CODE = "DEMO10"
export const MOCK_DISCOUNT_PERCENT = 10

export const DEFAULT_QC_REQUIREMENTS =
  "Flag any BGM or not eye clean stones to us"

/* ── Address type (for locally-added addresses) ────────────── */

export type LocalAddress = {
  id: string
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  countryName: string
  isDefault: boolean
}

/* ── Store ─────────────────────────────────────────────────── */

type CheckoutStep = 1 | 2 | 3 | 4

interface CheckoutState {
  // Navigation
  step: CheckoutStep
  completedSteps: Set<number>

  // Step 1 — Review & notes
  generalNotes: string
  itemNotes: Record<string, { reference: string; notes: string }>

  // Step 2 — Delivery
  deliveryMode: "single" | "multiple"
  selectedAddressId: string | null
  perItemAddressId: Record<string, string>
  localAddresses: LocalAddress[]

  // Step 3 — Payment
  selectedPaymentTermId: string
  savePaymentPreference: boolean

  // Discount
  discountCode: string
  appliedDiscount: { code: string; percent: number } | null

  // QC
  qcRequirements: string

  // Confirmation guard
  orderJustPlaced: boolean
}

interface CheckoutActions {
  setStep: (step: CheckoutStep) => void
  completeStep: (step: number) => void

  setGeneralNotes: (notes: string) => void
  setItemNote: (
    productId: string,
    field: "reference" | "notes",
    value: string,
  ) => void
  removeItemNote: (productId: string) => void

  setDeliveryMode: (mode: "single" | "multiple") => void
  setSelectedAddressId: (id: string | null) => void
  setPerItemAddressId: (productId: string, addressId: string) => void
  addLocalAddress: (address: LocalAddress) => void

  setSelectedPaymentTermId: (id: string) => void
  setSavePaymentPreference: (save: boolean) => void

  applyDiscountCode: (code: string) => boolean
  clearDiscount: () => void
  setDiscountCode: (code: string) => void

  setQcRequirements: (requirements: string) => void

  placeOrder: () => void
  clearOrderJustPlaced: () => void
  reset: () => void
}

type CheckoutStore = CheckoutState & CheckoutActions

const initialState: CheckoutState = {
  step: 1,
  completedSteps: new Set(),
  generalNotes: "",
  itemNotes: {},
  deliveryMode: "single",
  selectedAddressId: null,
  perItemAddressId: {},
  localAddresses: [],
  selectedPaymentTermId: MOCK_PAYMENT_TERMS[0].id,
  savePaymentPreference: false,
  discountCode: "",
  appliedDiscount: null,
  qcRequirements: DEFAULT_QC_REQUIREMENTS,
  orderJustPlaced: false,
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  completeStep: (step) =>
    set((s) => ({
      completedSteps: new Set([...s.completedSteps, step]),
    })),

  setGeneralNotes: (generalNotes) => set({ generalNotes }),
  setItemNote: (productId, field, value) =>
    set((s) => ({
      itemNotes: {
        ...s.itemNotes,
        [productId]: {
          reference: s.itemNotes[productId]?.reference ?? "",
          notes: s.itemNotes[productId]?.notes ?? "",
          [field]: value,
        },
      },
    })),
  removeItemNote: (productId) =>
    set((s) => {
      const { [productId]: _, ...rest } = s.itemNotes
      return { itemNotes: rest }
    }),

  setDeliveryMode: (deliveryMode) => set({ deliveryMode }),
  setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
  setPerItemAddressId: (productId, addressId) =>
    set((s) => ({
      perItemAddressId: { ...s.perItemAddressId, [productId]: addressId },
    })),
  addLocalAddress: (address) =>
    set((s) => ({
      localAddresses: [...s.localAddresses, address],
    })),

  setSelectedPaymentTermId: (selectedPaymentTermId) =>
    set({ selectedPaymentTermId }),
  setSavePaymentPreference: (savePaymentPreference) =>
    set({ savePaymentPreference }),

  setDiscountCode: (discountCode) => set({ discountCode }),
  applyDiscountCode: (code) => {
    if (code.toUpperCase() === MOCK_DISCOUNT_CODE) {
      set({
        appliedDiscount: {
          code: MOCK_DISCOUNT_CODE,
          percent: MOCK_DISCOUNT_PERCENT,
        },
        discountCode: "",
      })
      return true
    }
    return false
  },
  clearDiscount: () => set({ appliedDiscount: null }),

  setQcRequirements: (qcRequirements) => set({ qcRequirements }),

  placeOrder: () => {
    useCartStore.getState().items.forEach((item) => {
      useCartStore.getState().removeItem(item.productId)
    })
    set({ ...initialState, orderJustPlaced: true })
  },
  clearOrderJustPlaced: () => set({ orderJustPlaced: false }),
  reset: () => set(initialState),
}))

/* ── Derived selectors ─────────────────────────────────────── */

export function useCheckoutSubtotal() {
  const items = useCartStore((s) => s.items)
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function useCheckoutPaymentTerm() {
  const id = useCheckoutStore((s) => s.selectedPaymentTermId)
  return MOCK_PAYMENT_TERMS.find((t) => t.id === id) ?? MOCK_PAYMENT_TERMS[0]
}
```

- [ ] **Step 2: Verify the store compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `use-checkout-store.ts`.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-checkout-store.ts
git commit -m "feat(checkout): add Zustand checkout store with mock data"
```

---

### Task 2: Checkout Layout Shell

**Files:**
- Create: `app/buyer/(checkout)/layout.tsx`

- [ ] **Step 1: Create the checkout route group layout**

This is a server component that renders the static checkout header. The Cancel button needs client-side navigation (`router.back()`), so it's extracted as a tiny client component inside the same file (defined at module level, not inline — per `rerender-no-inline-components`).

```tsx
import Link from "next/link"

import { CancelButton } from "./cancel-button"

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3.5">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <Link href="/buyer" aria-label="Minivoda Home">
              <img
                src={LOGOMARK}
                alt=""
                className="h-6 w-auto"
                style={{ width: 50.853 }}
              />
            </Link>
            <span className="text-base font-medium text-foreground">
              Minivoda Checkout
            </span>
          </div>

          {/* Right: help + cancel */}
          <div className="flex items-center gap-3">
            <Link
              href="/help"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Help
            </Link>
            <CancelButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-8 pt-5">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create the CancelButton client component**

Create `app/buyer/(checkout)/cancel-button.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { IconX } from "@tabler/icons-react"

export function CancelButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Cancel
      <IconX size={20} />
    </button>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(checkout\)/layout.tsx app/buyer/\(checkout\)/cancel-button.tsx
git commit -m "feat(checkout): add checkout route group layout with header"
```

---

### Task 3: Checkout Stepper

**Files:**
- Create: `components/checkout/checkout-stepper.tsx`

- [ ] **Step 1: Create the stepper component**

```tsx
"use client"

import { IconCheck, IconChevronRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { useCheckoutStore } from "@/hooks/use-checkout-store"

const STEPS = [
  { number: 1, label: "Review & notes" },
  { number: 2, label: "Delivery options" },
  { number: 3, label: "Payment method" },
  { number: 4, label: "Order review" },
] as const

export function CheckoutStepper() {
  const step = useCheckoutStore((s) => s.step)
  const completedSteps = useCheckoutStore((s) => s.completedSteps)
  const setStep = useCheckoutStore((s) => s.setStep)

  return (
    <nav aria-label="Checkout progress" className="flex items-center gap-2">
      {STEPS.map(({ number, label }, i) => {
        const isActive = step === number
        const isCompleted = completedSteps.has(number)
        const isClickable = isCompleted && !isActive

        return (
          <div key={number} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) setStep(number as 1 | 2 | 3 | 4)
              }}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors",
                isActive &&
                  "bg-foreground text-background",
                isCompleted &&
                  !isActive &&
                  "cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900",
                !isActive &&
                  !isCompleted &&
                  "cursor-default text-muted-foreground",
              )}
            >
              {/* Circle */}
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isActive && "bg-background text-foreground",
                  isCompleted &&
                    !isActive &&
                    "bg-emerald-600 text-white dark:bg-emerald-500",
                  !isActive &&
                    !isCompleted &&
                    "border border-border text-muted-foreground",
                )}
              >
                {isCompleted && !isActive ? (
                  <IconCheck size={14} strokeWidth={3} />
                ) : (
                  number
                )}
              </span>
              <span className={cn("font-medium", !isActive && !isCompleted && "font-normal")}>
                {label}
              </span>
            </button>

            {/* Chevron separator (not after last) */}
            {i < STEPS.length - 1 && (
              <IconChevronRight
                size={16}
                className="text-muted-foreground/50"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/checkout/checkout-stepper.tsx
git commit -m "feat(checkout): add horizontal checkout stepper component"
```

---

### Task 4: QC Requirements Modal

**Files:**
- Create: `components/checkout/qc-requirements-modal.tsx`

- [ ] **Step 1: Create the QC modal**

```tsx
"use client"

import { useState } from "react"

import { useCheckoutStore } from "@/hooks/use-checkout-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type QcRequirementsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QcRequirementsModal({
  open,
  onOpenChange,
}: QcRequirementsModalProps) {
  const qcRequirements = useCheckoutStore((s) => s.qcRequirements)
  const setQcRequirements = useCheckoutStore((s) => s.setQcRequirements)
  const [draft, setDraft] = useState(qcRequirements)

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) setDraft(qcRequirements)
    onOpenChange(nextOpen)
  }

  function handleSave() {
    setQcRequirements(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QC Requirements</DialogTitle>
          <DialogDescription>
            Describe your quality control requirements for this order.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="e.g. Flag any BGM or not eye clean stones to us"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/checkout/qc-requirements-modal.tsx
git commit -m "feat(checkout): add QC requirements edit modal"
```

---

### Task 5: Order Summary Sidebar

**Files:**
- Create: `components/checkout/order-summary.tsx`

- [ ] **Step 1: Create the order summary sidebar**

```tsx
"use client"

import { useState } from "react"
import { IconInfoCircle, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

import { cn, formatUSD } from "@/lib/utils"
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
  MOCK_DISCOUNT_CODE,
} from "@/hooks/use-checkout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QcRequirementsModal } from "@/components/checkout/qc-requirements-modal"

const MOCK_EUR_RATE = 0.92

type OrderSummaryProps = {
  onContinue: () => void
  ctaLabel: string
  ctaLoading?: boolean
}

export function OrderSummary({
  onContinue,
  ctaLabel,
  ctaLoading,
}: OrderSummaryProps) {
  const step = useCheckoutStore((s) => s.step)
  const subtotal = useCheckoutSubtotal()
  const paymentTerm = useCheckoutPaymentTerm()
  const appliedDiscount = useCheckoutStore((s) => s.appliedDiscount)
  const discountCode = useCheckoutStore((s) => s.discountCode)
  const setDiscountCode = useCheckoutStore((s) => s.setDiscountCode)
  const applyDiscountCode = useCheckoutStore((s) => s.applyDiscountCode)
  const clearDiscount = useCheckoutStore((s) => s.clearDiscount)
  const qcRequirements = useCheckoutStore((s) => s.qcRequirements)
  const [qcModalOpen, setQcModalOpen] = useState(false)
  const [discountError, setDiscountError] = useState(false)

  const discountAmount = appliedDiscount
    ? subtotal * (appliedDiscount.percent / 100)
    : 0
  const paymentDiscountAmount =
    step >= 3 ? subtotal * (paymentTerm.discountPercent / 100) : 0
  const shipping = 0
  const vat = 0
  const total = subtotal - discountAmount - paymentDiscountAmount + shipping + vat
  const eurSubtotal = subtotal * MOCK_EUR_RATE
  const eurTotal = total * MOCK_EUR_RATE

  function handleApplyDiscount() {
    setDiscountError(false)
    if (!discountCode.trim()) return
    const success = applyDiscountCode(discountCode.trim())
    if (!success) {
      setDiscountError(true)
    }
  }

  return (
    <>
      <Card className="sticky top-24 w-full shrink-0">
        <CardHeader>
          <CardTitle className="text-base font-normal">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Subtotal */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              {eurSubtotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
            </div>
          </div>

          {/* Total excl taxes */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total excl. taxes</span>
              <span className="font-medium">{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              {eurSubtotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
            </div>
          </div>

          {/* Payment terms (from step 3) */}
          {step >= 3 && paymentTerm.discountPercent !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment terms</span>
              <div className="flex flex-col items-end">
                <span className="text-xs text-emerald-600">
                  {paymentTerm.name}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    paymentTerm.discountPercent > 0
                      ? "text-emerald-600"
                      : "text-destructive",
                  )}
                >
                  {paymentTerm.discountPercent > 0 ? "-" : "+"}
                  {formatUSD(Math.abs(paymentDiscountAmount))}
                </span>
              </div>
            </div>
          )}

          {/* VAT */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">VAT (0%)</span>
            <span>{formatUSD(0)}</span>
          </div>

          <Separator />

          {/* Discount codes */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">
              Discount codes
            </span>
            {appliedDiscount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {appliedDiscount.code} (-{appliedDiscount.percent}%)
                  <button
                    type="button"
                    onClick={clearDiscount}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value)
                    setDiscountError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyDiscount()
                  }}
                  placeholder="Type code here"
                  className={cn(
                    "h-9 text-sm",
                    discountError && "border-destructive",
                  )}
                />
              </div>
            )}
            {discountError && (
              <p className="text-xs text-destructive">Invalid discount code</p>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">TOTAL</span>
              <span className="text-lg font-semibold">{formatUSD(total)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              €
              {eurTotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* CTA */}
          <Button
            className="h-11 w-full"
            onClick={onContinue}
            disabled={ctaLoading}
          >
            {ctaLoading ? "Placing order..." : ctaLabel}
          </Button>

          {/* Fine print */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            The local currency amount is the current value converted from $USD.
            The final amount payable in your local currency will be calculated
            once shipment is confirmed.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            For stones eligible for free returns, you will be credited with the
            full stone purchase amount as long as you have not returned 6 items
            during the month. The shipping fee, wherever applicable, is not
            refundable if the stone is returned.
          </p>

          <Separator />

          {/* QC Requirements */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              Default QC requirements
              <IconInfoCircle size={14} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{qcRequirements}</p>
            <button
              type="button"
              onClick={() => setQcModalOpen(true)}
              className="self-start text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
            >
              Edit default QC requirements
            </button>
          </div>
        </CardContent>
      </Card>

      <QcRequirementsModal open={qcModalOpen} onOpenChange={setQcModalOpen} />
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/checkout/order-summary.tsx
git commit -m "feat(checkout): add order summary sidebar with discount codes and QC"
```

---

### Task 6: Step 1 — Review Cart & Add Notes

**Files:**
- Create: `components/checkout/step-review.tsx`

- [ ] **Step 1: Create the review step**

```tsx
"use client"

import { useState } from "react"
import { IconDiamond, IconDiamondsFilled, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { cn, formatUSD } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/hooks/use-cart-store"
import { useCheckoutStore } from "@/hooks/use-checkout-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

function ReviewItem({
  item,
  reference,
  notes,
  removing,
  onReferenceChange,
  onNotesChange,
  onRemove,
}: {
  item: CartItem
  reference: string
  notes: string
  removing: boolean
  onReferenceChange: (value: string) => void
  onNotesChange: (value: string) => void
  onRemove: () => void
}) {
  const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond

  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border border-border p-4 transition-all duration-200",
        removing && "h-0 overflow-hidden opacity-0 !p-0 !border-0",
      )}
    >
      {/* Thumbnail */}
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : (
          <FallbackIcon size={24} className="text-muted-foreground" />
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.certLab && item.certNumber && (
                <>
                  {item.certLab}{" "}
                  <span className="text-foreground">{item.certNumber}</span>
                  {" · "}
                </>
              )}
              Stock ID{" "}
              <span className="text-foreground">{item.stockId}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">
              {formatUSD(item.price)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        </div>

        {/* Reference and notes inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Internal order reference
            </label>
            <Input
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
              placeholder="Your internal reference"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <Input
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Notes for this item"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StepReview() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const generalNotes = useCheckoutStore((s) => s.generalNotes)
  const setGeneralNotes = useCheckoutStore((s) => s.setGeneralNotes)
  const itemNotes = useCheckoutStore((s) => s.itemNotes)
  const setItemNote = useCheckoutStore((s) => s.setItemNote)
  const removeItemNote = useCheckoutStore((s) => s.removeItemNote)
  const [removingId, setRemovingId] = useState<string | null>(null)

  function handleRemove(item: CartItem) {
    setRemovingId(item.id)
    setTimeout(() => {
      removeItem(item.productId)
      removeItemNote(item.productId)
      setRemovingId(null)
      toast("Item removed from cart")
    }, 200)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Review cart & add notes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the items in your cart, add internal order references & general
          notes.
        </p>
      </div>

      {/* General order notes */}
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            General order notes
          </h2>
          <p className="text-xs text-muted-foreground">
            These notes will be visible to your sellers (optional)
          </p>
        </div>
        <Textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Add any notes that apply to all items in your order..."
          rows={3}
        />
      </div>

      <Separator />

      {/* Cart items */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground">
          Your cart ({items.length})
        </h2>
        {items.map((item) => (
          <ReviewItem
            key={item.id}
            item={item}
            reference={itemNotes[item.productId]?.reference ?? ""}
            notes={itemNotes[item.productId]?.notes ?? ""}
            removing={removingId === item.id}
            onReferenceChange={(value) =>
              setItemNote(item.productId, "reference", value)
            }
            onNotesChange={(value) =>
              setItemNote(item.productId, "notes", value)
            }
            onRemove={() => handleRemove(item)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/checkout/step-review.tsx
git commit -m "feat(checkout): add step 1 — review cart and add notes"
```

---

### Task 7: Step 2 — Delivery Options + Add Address Modal

**Files:**
- Create: `components/checkout/add-address-modal.tsx`
- Create: `components/checkout/step-delivery.tsx`

- [ ] **Step 1: Create the add address modal**

```tsx
"use client"

import { useState } from "react"

import {
  useCheckoutStore,
  type LocalAddress,
} from "@/hooks/use-checkout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AddAddressModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: (id: string) => void
}

export function AddAddressModal({
  open,
  onOpenChange,
  onAdded,
}: AddAddressModalProps) {
  const addLocalAddress = useCheckoutStore((s) => s.addLocalAddress)

  const [name, setName] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryName, setCountryName] = useState("")

  function resetForm() {
    setName("")
    setStreet("")
    setCity("")
    setState("")
    setPostalCode("")
    setCountryName("")
  }

  function handleSave() {
    if (!name.trim() || !street.trim() || !city.trim() || !countryName.trim())
      return

    const id = crypto.randomUUID()
    const address: LocalAddress = {
      id,
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      countryName: countryName.trim(),
      isDefault: false,
    }
    addLocalAddress(address)
    onAdded?.(id)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new address</DialogTitle>
          <DialogDescription>
            This address will only be available for this checkout session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Name / Label *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Berlin Branch"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Street *</label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">City *</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                State / Province
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Postal code
              </label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Country *
              </label>
              <Input
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name.trim() ||
              !street.trim() ||
              !city.trim() ||
              !countryName.trim()
            }
          >
            Add address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create the delivery step**

```tsx
"use client"

import { useEffect, useState } from "react"
import {
  IconCheck,
  IconAlertTriangle,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { useCartStore } from "@/hooks/use-cart-store"
import {
  useCheckoutStore,
  type LocalAddress,
} from "@/hooks/use-checkout-store"
import { NativeSelect } from "@/components/ui/native-select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AddAddressModal } from "@/components/checkout/add-address-modal"

/* ── Normalised address type used by this component ────────── */

type NormalisedAddress = {
  id: string
  name: string
  line: string
  isDefault: boolean
  isVerified: boolean
}

function normaliseDbAddress(a: {
  id: string
  name: string
  street: string
  city: string
  state: string | null
  postalCode: string | null
  isDefault: boolean
}): NormalisedAddress {
  const parts = [a.street, a.city, a.state, a.postalCode].filter(Boolean)
  return {
    id: a.id,
    name: a.name,
    line: parts.join(", "),
    isDefault: a.isDefault,
    isVerified: a.isDefault,
  }
}

function normaliseLocalAddress(a: LocalAddress): NormalisedAddress {
  const parts = [a.street, a.city, a.state, a.postalCode, a.countryName].filter(
    Boolean,
  )
  return {
    id: a.id,
    name: a.name,
    line: parts.join(", "),
    isDefault: false,
    isVerified: false,
  }
}

/* ── Address card ──────────────────────────────────────────── */

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: NormalisedAddress
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-foreground bg-muted/50"
          : "border-border hover:border-foreground/30",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border",
        )}
      >
        {selected && <IconCheck size={12} strokeWidth={3} />}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">{address.name}</span>
        <span className="text-xs text-muted-foreground">{address.line}</span>
      </div>
      {!address.isVerified && (
        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          Not verified
        </span>
      )}
    </button>
  )
}

/* ── Main component ────────────────────────────────────────── */

export function StepDelivery() {
  const items = useCartStore((s) => s.items)
  const deliveryMode = useCheckoutStore((s) => s.deliveryMode)
  const setDeliveryMode = useCheckoutStore((s) => s.setDeliveryMode)
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId)
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId)
  const perItemAddressId = useCheckoutStore((s) => s.perItemAddressId)
  const setPerItemAddressId = useCheckoutStore((s) => s.setPerItemAddressId)
  const localAddresses = useCheckoutStore((s) => s.localAddresses)

  const [dbAddresses, setDbAddresses] = useState<NormalisedAddress[]>([])
  const [expanded, setExpanded] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Fetch user addresses on mount
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/me/addresses")
      if (!res.ok) return
      const json = await res.json()
      const normalised = (json.data ?? []).map(normaliseDbAddress)
      setDbAddresses(normalised)

      // Auto-select default address if none selected
      if (!selectedAddressId) {
        const defaultAddr = normalised.find(
          (a: NormalisedAddress) => a.isDefault,
        )
        if (defaultAddr) setSelectedAddressId(defaultAddr.id)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allAddresses: NormalisedAddress[] = [
    ...dbAddresses,
    ...localAddresses.map(normaliseLocalAddress),
  ]

  const selectedAddress = allAddresses.find((a) => a.id === selectedAddressId)

  // Not expanded yet — show default address
  if (!expanded) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Delivery options
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select how you would like your purchase to reach you.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">
            Check your shipping destination
          </h2>
          <p className="text-xs text-muted-foreground">
            You may change your delivery destination.
          </p>

          {selectedAddress && (
            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <IconMapPin size={20} className="mt-0.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {selectedAddress.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedAddress.line}
                </span>
                {!selectedAddress.isVerified && (
                  <span className="mt-1 text-xs text-amber-600">
                    Not verified
                  </span>
                )}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="self-start"
            onClick={() => setExpanded(true)}
          >
            Change delivery for this order
          </Button>
        </div>
      </div>
    )
  }

  // Expanded — delivery mode selection
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Delivery options
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select how you would like your purchase to reach you.
        </p>
      </div>

      {/* Delivery mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDeliveryMode("single")}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors",
            deliveryMode === "single"
              ? "border-foreground bg-muted/50"
              : "border-border hover:border-foreground/30",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Deliver to a single address
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                deliveryMode === "single"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border",
              )}
            >
              {deliveryMode === "single" && (
                <IconCheck size={12} strokeWidth={3} />
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            All items in your cart will be delivered to the address you select
            below.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMode("multiple")}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors",
            deliveryMode === "multiple"
              ? "border-foreground bg-muted/50"
              : "border-border hover:border-foreground/30",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Deliver to multiple addresses
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                deliveryMode === "multiple"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border",
              )}
            >
              {deliveryMode === "multiple" && (
                <IconCheck size={12} strokeWidth={3} />
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            You may select different delivery addresses for each individual item
            in your cart.
          </span>
        </button>
      </div>

      {/* Unverified address warning */}
      {selectedAddress && !selectedAddress.isVerified && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <IconAlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Selected address is not verified</p>
            <p className="text-xs">
              This may cause delivery delays. Please make sure you have uploaded
              valid documents for faster address verification.
            </p>
          </div>
        </div>
      )}

      {/* Single address mode */}
      {deliveryMode === "single" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">
                Choose where to deliver your items to
              </h2>
              <p className="text-xs text-muted-foreground">
                Select from your saved addresses or add a new one.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <IconPlus size={16} />
              Add new address
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {allAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                selected={selectedAddressId === address.id}
                onSelect={() => setSelectedAddressId(address.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Multiple addresses mode */}
      {deliveryMode === "multiple" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">
                Choose where to deliver each item
              </h2>
              <p className="text-xs text-muted-foreground">
                You may select different delivery addresses.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <IconPlus size={16} />
              Add new address
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.certLab && item.certNumber
                    ? `${item.certLab} ${item.certNumber} · `
                    : ""}
                  Stock ID {item.stockId}
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    Deliver this item to
                  </label>
                  <NativeSelect
                    value={perItemAddressId[item.productId] ?? ""}
                    onChange={(e) =>
                      setPerItemAddressId(item.productId, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select an address
                    </option>
                    {allAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.line}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddAddressModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={(id) => {
          if (deliveryMode === "single") setSelectedAddressId(id)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add components/checkout/add-address-modal.tsx components/checkout/step-delivery.tsx
git commit -m "feat(checkout): add step 2 — delivery options with address selection"
```

---

### Task 8: Step 3 — Payment Selection

**Files:**
- Create: `components/checkout/step-payment.tsx`

- [ ] **Step 1: Create the payment step**

This step uses a simple CSS-based stacked bar chart for the credit visualisation (no Recharts needed — it's just three coloured segments in a flex row).

```tsx
"use client"

import { useState } from "react"
import { IconCheck, IconInfoCircle } from "@tabler/icons-react"

import { cn, formatUSD } from "@/lib/utils"
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
  MOCK_PAYMENT_TERMS,
  CREDIT_LIMIT,
  CREDIT_USED_BEFORE,
  type PaymentTerm,
} from "@/hooks/use-checkout-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

/* ── Credit bar ────────────────────────────────────────────── */

function CreditBar({ subtotal }: { subtotal: number }) {
  const usedAfter = CREDIT_USED_BEFORE + subtotal
  const available = Math.max(CREDIT_LIMIT - usedAfter, 0)

  const pctBefore = (CREDIT_USED_BEFORE / CREDIT_LIMIT) * 100
  const pctOrder = (subtotal / CREDIT_LIMIT) * 100
  const pctAvailable = (available / CREDIT_LIMIT) * 100

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Credit available
        </h2>
        <IconInfoCircle size={14} className="text-muted-foreground/60" />
      </div>
      <p className="text-3xl font-semibold text-foreground">
        {formatUSD(CREDIT_LIMIT)}
      </p>
      <p className="text-sm text-muted-foreground">Your credit limit</p>

      {/* Bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary"
          style={{ width: `${pctBefore}%` }}
        />
        <div
          className="bg-foreground"
          style={{ width: `${pctOrder}%` }}
        />
        <div
          className="bg-amber-400 dark:bg-amber-500"
          style={{ width: `${pctAvailable}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              Used before this request
            </span>
          </div>
          <span>{formatUSD(CREDIT_USED_BEFORE)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-foreground" />
            <span className="text-muted-foreground">
              Used after this request
            </span>
          </div>
          <span>{formatUSD(usedAfter)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-400 dark:bg-amber-500" />
            <span className="text-muted-foreground">
              Available after this request
            </span>
          </div>
          <span>{formatUSD(available)}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Payment term card ─────────────────────────────────────── */

function PaymentTermCard({
  term,
  subtotal,
  selected,
  expanded,
  onSelect,
}: {
  term: PaymentTerm
  subtotal: number
  selected: boolean
  expanded: boolean
  onSelect: () => void
}) {
  const discountAmount = subtotal * (term.discountPercent / 100)
  const finalPrice = subtotal - discountAmount

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-foreground bg-muted/50"
          : "border-border hover:border-foreground/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full border",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border",
            )}
          >
            {selected && <IconCheck size={12} strokeWidth={3} />}
          </span>
          <div>
            <span className="text-sm font-medium">{term.name}</span>
            {term.badge && (
              <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {term.badge}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {term.discountPercent !== 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatUSD(subtotal)}
            </span>
          )}
          <span className="text-sm font-medium">{formatUSD(finalPrice)}</span>
          {term.discountPercent !== 0 && (
            <span className="text-xs text-muted-foreground">
              Price after discount (excl. tax)
            </span>
          )}
        </div>
      </div>

      {/* Expanded process timeline */}
      {expanded && selected && (
        <div className="mt-2 flex flex-col gap-2 pl-8">
          <p className="text-xs text-muted-foreground">{term.description}</p>
          <ul className="flex flex-col gap-1.5">
            {term.steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  )
}

/* ── Main component ────────────────────────────────────────── */

export function StepPayment() {
  const subtotal = useCheckoutSubtotal()
  const selectedPaymentTermId = useCheckoutStore(
    (s) => s.selectedPaymentTermId,
  )
  const setSelectedPaymentTermId = useCheckoutStore(
    (s) => s.setSelectedPaymentTermId,
  )
  const savePaymentPreference = useCheckoutStore(
    (s) => s.savePaymentPreference,
  )
  const setSavePaymentPreference = useCheckoutStore(
    (s) => s.setSavePaymentPreference,
  )
  const paymentTerm = useCheckoutPaymentTerm()

  const [expanded, setExpanded] = useState(false)

  // Default view — show selected payment term
  if (!expanded) {
    const discountAmount = subtotal * (paymentTerm.discountPercent / 100)
    const finalPrice = subtotal - discountAmount

    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Payment selection
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your credit, and choose payment terms.
          </p>
        </div>

        <CreditBar subtotal={subtotal} />

        <Separator />

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">
            Payment terms for this purchase
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{paymentTerm.name}</span>
              {paymentTerm.badge && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {paymentTerm.badge}
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1.5">
              {paymentTerm.steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                  {s}
                </li>
              ))}
            </ul>
            {paymentTerm.discountPercent !== 0 && (
              <div className="mt-2">
                <p className="text-sm">
                  <span className="text-muted-foreground line-through">
                    {formatUSD(subtotal)}
                  </span>{" "}
                  <span className="font-medium">{formatUSD(finalPrice)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Price after discount (excl. tax)
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => setExpanded(true)}
          >
            Change payment terms for this order
          </Button>
        </div>
      </div>
    )
  }

  // Expanded — all payment options
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Payment selection
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your credit, and choose payment terms.
        </p>
      </div>

      <CreditBar subtotal={subtotal} />

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">
          Select payment terms for this purchase
        </h2>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={savePaymentPreference}
            onCheckedChange={(checked) =>
              setSavePaymentPreference(checked === true)
            }
          />
          Save this selection for my future purchases
        </label>

        <div className="flex flex-col gap-2">
          {MOCK_PAYMENT_TERMS.map((term) => (
            <PaymentTermCard
              key={term.id}
              term={term}
              subtotal={subtotal}
              selected={selectedPaymentTermId === term.id}
              expanded={true}
              onSelect={() => setSelectedPaymentTermId(term.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/checkout/step-payment.tsx
git commit -m "feat(checkout): add step 3 — payment selection with credit bar"
```

---

### Task 9: Step 4 — Order Review

**Files:**
- Create: `components/checkout/step-confirm.tsx`

- [ ] **Step 1: Create the review/confirm step**

```tsx
"use client"

import { IconDiamond, IconDiamondsFilled } from "@tabler/icons-react"

import { formatUSD } from "@/lib/utils"
import { useCartStore } from "@/hooks/use-cart-store"
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
} from "@/hooks/use-checkout-store"
import { Separator } from "@/components/ui/separator"

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

const MOCK_ESTIMATED_DELIVERY = "15 Apr 2026"

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
    >
      Edit
    </button>
  )
}

export function StepConfirm() {
  const items = useCartStore((s) => s.items)
  const generalNotes = useCheckoutStore((s) => s.generalNotes)
  const itemNotes = useCheckoutStore((s) => s.itemNotes)
  const setStep = useCheckoutStore((s) => s.setStep)
  const subtotal = useCheckoutSubtotal()
  const paymentTerm = useCheckoutPaymentTerm()
  const appliedDiscount = useCheckoutStore((s) => s.appliedDiscount)

  const discountAmount = appliedDiscount
    ? subtotal * (appliedDiscount.percent / 100)
    : 0
  const paymentDiscountAmount = subtotal * (paymentTerm.discountPercent / 100)
  const total = subtotal - discountAmount - paymentDiscountAmount

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Review your order before finishing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your order details, and place your order by clicking the
          button below.
        </p>
      </div>

      {/* Cart items */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Your order</h2>
          <EditLink onClick={() => setStep(1)} />
        </div>
        {items.map((item) => {
          const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond
          const note = itemNotes[item.productId]

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <FallbackIcon size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatUSD(item.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.certLab && item.certNumber && (
                    <>
                      {item.certLab} {item.certNumber} ·{" "}
                    </>
                  )}
                  Stock ID {item.stockId}
                </p>
                {note?.reference && (
                  <p className="text-xs text-muted-foreground">
                    Ref: {note.reference}
                  </p>
                )}
                {note?.notes && (
                  <p className="text-xs text-muted-foreground">
                    Notes: {note.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Est. delivery: {MOCK_ESTIMATED_DELIVERY}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Notes and shipping */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Notes and shipping</h2>
        </div>
        {generalNotes && (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                General order notes
              </p>
              <p className="text-sm">{generalNotes}</p>
            </div>
            <EditLink onClick={() => setStep(1)} />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Delivery address</p>
            <p className="text-sm">See delivery options</p>
          </div>
          <EditLink onClick={() => setStep(2)} />
        </div>
      </div>

      <Separator />

      {/* Payment & price breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Payment & price breakdown</h2>
          <EditLink onClick={() => setStep(3)} />
        </div>

        {/* Payment term summary */}
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{paymentTerm.name}</span>
            {paymentTerm.badge && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {paymentTerm.badge}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {paymentTerm.steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Price breakdown table */}
        <div className="flex flex-col text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatUSD(subtotal)}</span>
          </div>
          {appliedDiscount && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">
                Discount ({appliedDiscount.code})
              </span>
              <span className="text-emerald-600">
                -{formatUSD(discountAmount)}
              </span>
            </div>
          )}
          {paymentTerm.discountPercent !== 0 && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">
                {paymentTerm.discountPercent > 0
                  ? "Payment discount"
                  : "Payment fee"}
              </span>
              <span
                className={
                  paymentTerm.discountPercent > 0
                    ? "text-emerald-600"
                    : "text-destructive"
                }
              >
                {paymentTerm.discountPercent > 0 ? "-" : "+"}
                {formatUSD(Math.abs(paymentDiscountAmount))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Standard shipping</span>
            <span>{formatUSD(0)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">VAT (0%)</span>
            <span>{formatUSD(0)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between py-1.5">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatUSD(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/checkout/step-confirm.tsx
git commit -m "feat(checkout): add step 4 — order review with edit links"
```

---

### Task 10: Confirmation Screen

**Files:**
- Create: `components/checkout/checkout-confirmation.tsx`
- Create: `app/buyer/(checkout)/checkout/confirmation/page.tsx`

- [ ] **Step 1: Create the confirmation content component**

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconPackage,
  IconTruckDelivery,
  IconFileInvoice,
  IconSearch,
  IconTools,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { useCheckoutStore } from "@/hooks/use-checkout-store"
import { Button } from "@/components/ui/button"

const MOCK_ORDER_NUMBER = "MN-1234-56789"
const MOCK_EMAIL = "jo******@gmail.com"

const TIMELINE_STEPS = [
  {
    icon: IconCircleCheck,
    title: "We confirm your order",
    description: "You will get confirmation in under 24 hours",
    active: true,
  },
  {
    icon: IconTools,
    title: "Your item is manufactured",
    description: "You will be notified when manufacturing is completed",
    active: false,
  },
  {
    icon: IconSearch,
    title: "We quality control your item",
    description: "We check to see if your item is up to standards",
    active: false,
  },
  {
    icon: IconTruckDelivery,
    title: "Your item is shipped to you",
    description: "Invoice is generated immediately after shipping",
    active: false,
  },
  {
    icon: IconFileInvoice,
    title: "An invoice is generated",
    description: "You have 30 days to pay your invoice",
    active: false,
  },
]

export function CheckoutConfirmation() {
  const router = useRouter()
  const orderJustPlaced = useCheckoutStore((s) => s.orderJustPlaced)
  const clearOrderJustPlaced = useCheckoutStore((s) => s.clearOrderJustPlaced)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!orderJustPlaced) {
      router.replace("/buyer")
      return
    }
    clearOrderJustPlaced()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!orderJustPlaced) return null

  function handleCopyOrderNumber() {
    navigator.clipboard.writeText(MOCK_ORDER_NUMBER)
    toast("Order number copied")
  }

  function handleResendEmail() {
    setResent(true)
    toast("Confirmation email resent")
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-10 py-12">
      {/* Success icon */}
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
        <IconCheck
          size={32}
          strokeWidth={3}
          className="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold">
          Thank you!
          <br />
          Your order has been placed.
        </h1>
        <p className="text-sm text-muted-foreground">
          An order request email has been sent to {MOCK_EMAIL}. It should arrive
          in the next few minutes.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Your order number is</span>
          <span className="font-medium">{MOCK_ORDER_NUMBER}</span>
          <button
            type="button"
            onClick={handleCopyOrderNumber}
            className="text-muted-foreground hover:text-foreground"
          >
            <IconCopy size={14} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3">
        <Button className="h-11 px-8" onClick={() => router.push("/buyer")}>
          Back to browsing
        </Button>
        <Button
          variant="link"
          className="text-sm"
          onClick={() => router.push("/buyer/orders")}
        >
          View your order
        </Button>
      </div>

      {/* What happens now */}
      <div className="flex w-full flex-col gap-4">
        <h2 className="text-lg font-semibold">What happens now?</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a timeline for what happens next. You will be notified at
          each step.
        </p>
        <div className="flex flex-col">
          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex gap-4">
                {/* Timeline line + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      step.active
                        ? "bg-emerald-100 dark:bg-emerald-950"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        step.active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }
                    />
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className="h-8 w-px bg-border" />
                  )}
                </div>
                {/* Text */}
                <div className="pb-8">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Didn't receive email */}
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-semibold">
          I didn&apos;t receive a confirmation email
        </h2>
        <p className="text-sm text-muted-foreground">
          Please make sure you have checked your spam folder. If you didn&apos;t
          get an email within the next 5 minutes, please click the button below
          and we&apos;ll resend it.
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={handleResendEmail}
          disabled={resent}
        >
          {resent ? "Email resent" : "Resend order request email"}
        </Button>
      </div>

      {/* Contact support */}
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-semibold">Contact support</h2>
        <p className="text-sm text-muted-foreground">
          In case you have issues with the confirmation email, forgot to add QC,
          or just want to ask a question about your order in general our
          customer support team is ready and at your disposal.
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => router.push("/help")}
        >
          Contact customer support
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the confirmation page route**

Create `app/buyer/(checkout)/checkout/confirmation/page.tsx`:

```tsx
import { CheckoutConfirmation } from "@/components/checkout/checkout-confirmation"

export default function ConfirmationPage() {
  return <CheckoutConfirmation />
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add components/checkout/checkout-confirmation.tsx app/buyer/\(checkout\)/checkout/confirmation/page.tsx
git commit -m "feat(checkout): add order confirmation page with timeline"
```

---

### Task 11: Page Orchestrator

**Files:**
- Create: `app/buyer/(checkout)/checkout/page.tsx`

- [ ] **Step 1: Create the checkout page orchestrator**

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"

import { useCartStore } from "@/hooks/use-cart-store"
import { useCheckoutStore } from "@/hooks/use-checkout-store"
import { CheckoutStepper } from "@/components/checkout/checkout-stepper"
import { OrderSummary } from "@/components/checkout/order-summary"

const StepReview = dynamic(() =>
  import("@/components/checkout/step-review").then((m) => m.StepReview),
)
const StepDelivery = dynamic(() =>
  import("@/components/checkout/step-delivery").then((m) => m.StepDelivery),
)
const StepPayment = dynamic(() =>
  import("@/components/checkout/step-payment").then((m) => m.StepPayment),
)
const StepConfirm = dynamic(() =>
  import("@/components/checkout/step-confirm").then((m) => m.StepConfirm),
)

const CTA_LABELS: Record<number, string> = {
  1: "Continue to delivery options",
  2: "Continue to payment method",
  3: "Continue to order review",
  4: "Place order",
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const step = useCheckoutStore((s) => s.step)
  const setStep = useCheckoutStore((s) => s.setStep)
  const completeStep = useCheckoutStore((s) => s.completeStep)
  const deliveryMode = useCheckoutStore((s) => s.deliveryMode)
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId)
  const perItemAddressId = useCheckoutStore((s) => s.perItemAddressId)
  const placeOrder = useCheckoutStore((s) => s.placeOrder)
  const [placing, setPlacing] = useState(false)

  // Guard: empty cart redirects away
  useEffect(() => {
    if (items.length === 0 && !placing) {
      router.replace("/buyer")
    }
  }, [items.length, placing, router])

  if (items.length === 0 && !placing) return null

  function validateStep2(): boolean {
    if (deliveryMode === "single") {
      return selectedAddressId !== null
    }
    return items.every((item) => !!perItemAddressId[item.productId])
  }

  function handleContinue() {
    if (step === 2 && !validateStep2()) {
      toast(
        deliveryMode === "single"
          ? "Please select a delivery address"
          : "Please assign a delivery address to all items",
      )
      return
    }

    if (step === 4) {
      setPlacing(true)
      setTimeout(() => {
        placeOrder()
        router.push("/buyer/checkout/confirmation")
      }, 1500)
      return
    }

    completeStep(step)
    setStep((step + 1) as 1 | 2 | 3 | 4)
  }

  const StepComponent = {
    1: StepReview,
    2: StepDelivery,
    3: StepPayment,
    4: StepConfirm,
  }[step]

  return (
    <div className="flex flex-col gap-8">
      <CheckoutStepper />
      <div className="grid grid-cols-[1fr_380px] items-start gap-8">
        <StepComponent />
        <OrderSummary
          onContinue={handleContinue}
          ctaLabel={CTA_LABELS[step]}
          ctaLoading={placing}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Start dev server and verify the checkout page renders**

Run: `npm run dev`

Navigate to `http://localhost:3000/buyer`, add items to cart, open cart sheet, verify checkout page loads when you navigate to `/buyer/checkout` manually. (The "Proceed to checkout" button isn't wired yet — that's the next task.)

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(checkout\)/checkout/page.tsx
git commit -m "feat(checkout): add page orchestrator with step routing and sidebar"
```

---

### Task 12: Wire Cart Sheet Entry Point

**Files:**
- Modify: `components/shell/cart-button.tsx`

- [ ] **Step 1: Update the "Proceed to checkout" button**

In `components/shell/cart-button.tsx`, replace the toast handler with navigation. Change the `CartFooter` component:

Find this code in `CartFooter`:
```tsx
<Button
  className="h-11 w-full gap-2"
  onClick={() => toast("Coming soon")}
>
  Proceed to checkout
  <IconArrowRight size={20} />
</Button>
```

Replace with:
```tsx
<Button
  className="h-11 w-full gap-2"
  onClick={() => {
    useCartStore.getState().closeSheet()
    window.location.href = "/buyer/checkout"
  }}
>
  Proceed to checkout
  <IconArrowRight size={20} />
</Button>
```

Note: Using `window.location.href` instead of `router.push` because `CartFooter` is a plain function component inside `CartButton` without its own `useRouter`. This causes a full navigation which is appropriate for entering a different route group (the checkout shell replaces the shop shell).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Test the full flow**

Run: `npm run dev`

1. Navigate to `/buyer`
2. Browse to any product and add it to cart
3. Open cart sheet
4. Click "Proceed to checkout"
5. Verify checkout loads at `/buyer/checkout` with the item
6. Complete all 4 steps
7. Click "Place order"
8. Verify confirmation page at `/buyer/checkout/confirmation`
9. Verify cart is empty after returning to `/buyer`

- [ ] **Step 4: Commit**

```bash
git add components/shell/cart-button.tsx
git commit -m "feat(checkout): wire cart sheet 'Proceed to checkout' to checkout flow"
```

---

### Task 13: Final Typecheck and Lint

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing warnings).

- [ ] **Step 3: Run format**

Run: `npm run format`

- [ ] **Step 4: Commit any formatting changes**

```bash
git add -A
git commit -m "chore: format checkout files"
```

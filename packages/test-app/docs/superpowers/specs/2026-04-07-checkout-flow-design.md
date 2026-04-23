# Checkout Flow Design

**Issue:** [#20 — Checkout: 4-step flow with mock forms](https://github.com/uxbyjoao/clarity-digital-twin/issues/20)
**Also covers:** [#21 — Purchase confirmation screen](https://github.com/uxbyjoao/clarity-digital-twin/issues/21)
**Milestone:** Phase 0: Full Mock UI Coverage
**Date:** 2026-04-07

## Overview

A 4-step checkout flow entered from the cart sheet's "Proceed to checkout" button, plus a confirmation screen after order placement. Phase 0 — real cart items from the Zustand store, everything else is mock/local state with no database writes.

The checkout lives at a single URL (`/buyer/checkout`) with client-side step management. The confirmation screen has its own URL (`/buyer/checkout/confirmation`).

## Architecture

### Route structure

```
app/buyer/(checkout)/
  layout.tsx                        ← Server component: checkout shell (header)
  checkout/
    page.tsx                        ← Client component: step orchestrator
    confirmation/
      page.tsx                      ← Confirmation page (own URL, guarded)
```

The `(checkout)` route group provides a dedicated layout separate from the main `(shop)` shell. The checkout layout is visually similar to the existing `(configurator)` layout but distinct — it will eventually include a footer.

### Component structure

```
components/checkout/
  checkout-stepper.tsx              ← Progress indicator (4 steps)
  order-summary.tsx                 ← Sticky sidebar with totals, discount, QC, CTA
  step-review.tsx                   ← Step 1: review cart & add notes
  step-delivery.tsx                 ← Step 2: delivery options
  step-payment.tsx                  ← Step 3: payment selection
  step-confirm.tsx                  ← Step 4: order review with edit links
  checkout-confirmation.tsx         ← Confirmation content
  qc-requirements-modal.tsx         ← QC requirements edit modal (textarea)
  add-address-modal.tsx             ← New address form modal

hooks/
  use-checkout-store.ts             ← Zustand store for all checkout state
```

### Design decisions

**Single URL, client-side steps (no URL-based step routing):**
Industry standard for modern e-commerce checkouts (Shopify, Stripe, BigCommerce). The checkout is a controlled linear flow — steps are not independently addressable pages. This prevents users from attempting to jump to a specific step by typing a URL. Step state lives in a Zustand store; the page orchestrator renders the active step via `next/dynamic`.

**Confirmation page gets its own URL:**
Unlike the 4 checkout steps, the confirmation screen is a fundamentally different state (post-purchase). Users expect to be able to revisit it. Guarded by an `orderJustPlaced` flag in the checkout store — direct navigation without placing an order redirects to `/buyer`.

**Components in `components/checkout/`:**
Follows the project convention (`components/products/`, `components/admin/`, `components/shell/`). Step components are lazy-loaded via `next/dynamic` per `bundle-dynamic-imports` — only the active step's code is loaded.

**Layout is a server component, stepper is inside the client boundary:**
The stepper reads the current step from the Zustand store, so it must be a client component. It lives inside `page.tsx`'s client boundary, not in `layout.tsx`. The layout renders only the static checkout header (logo, help link, cancel button) and never re-renders on step changes. Per `server-serialization`.

**Checkout store reads from cart store, no duplication:**
Cart items are read from `useCartStore`. The checkout store holds only checkout-specific state (notes, addresses, payment terms, discount). The `itemNotes` map syncs the reference field bidirectionally with the cart store's existing per-item reference.

## State management

### `hooks/use-checkout-store.ts`

```ts
type CheckoutStore = {
  // Navigation
  step: 1 | 2 | 3 | 4
  completedSteps: Set<number>
  setStep: (n: number) => void

  // Step 1 — Review & notes
  generalNotes: string
  itemNotes: Map<string, { reference: string; notes: string }>

  // Step 2 — Delivery
  deliveryMode: "single" | "multiple"
  selectedAddressId: string | null
  perItemAddressId: Map<string, string>
  localAddresses: Address[]

  // Step 3 — Payment
  selectedPaymentTermId: string
  savePaymentPreference: boolean

  // Discount (available on all steps via sidebar)
  discountCode: string
  appliedDiscount: { code: string; percent: number } | null

  // QC Requirements (editable from sidebar on all steps)
  qcRequirements: string

  // Confirmation guard
  orderJustPlaced: boolean

  // Actions
  reset: () => void
}
```

**Derived values** (computed from cart + checkout state, not stored):
- `subtotal` — sum of cart item prices
- `discountAmount` — subtotal * applied discount percent
- `paymentDiscount` — from selected payment term's discount/fee rate
- `creditUsedBefore` — hardcoded mock ($5,000)
- `creditUsedAfter` — creditUsedBefore + subtotal (dynamic)
- `creditAvailable` — hardcoded limit ($10,000) minus creditUsedAfter (dynamic)

### Mock data

| Data | Source | Details |
|------|--------|---------|
| Cart items | `useCartStore` | Real items added by the user |
| Addresses | DB fetch on Step 2 mount | User's addresses from seed data; locally added ones appended in session |
| Payment terms | Hardcoded array | 4 options: Pay in 3 days (1.4% discount), 30 days (no change), 60 days (1.4% fee), Upfront (1.4% discount) |
| Credit limit | Hardcoded | $10,000 |
| Credit used before | Hardcoded | $5,000 |
| Discount code | Hardcoded | "DEMO10" applies 10% discount; all other codes show "Invalid discount code" |
| Shipping | Hardcoded | $0.00 |
| VAT | Hardcoded | 0% |
| Estimated delivery | Hardcoded | Static mock date per item |
| QC requirements | Default string | "Flag any BGM or not eye clean stones to us" |

## Step-by-step design

### Checkout layout (`layout.tsx`)

Server component. Renders:
- **Header bar:** Minivoda logomark + "Minivoda Checkout" text (left), Help link (`/help`) + Cancel X button (right)
- Cancel navigates back via `router.back()` (fallback to `/buyer`)
- No footer for now (planned for future)

Children are rendered below the header.

### Step orchestrator (`checkout/page.tsx`)

Client component. Renders:
1. `CheckoutStepper` at the top
2. Two-column grid: active step component (left ~60%) + `OrderSummary` sidebar (right ~40%)

On mount: if the cart is empty, redirects to `/buyer`.

Step components are lazy-loaded:
```tsx
const StepReview = dynamic(() => import("@/components/checkout/step-review"))
const StepDelivery = dynamic(() => import("@/components/checkout/step-delivery"))
const StepPayment = dynamic(() => import("@/components/checkout/step-payment"))
const StepConfirm = dynamic(() => import("@/components/checkout/step-confirm"))
```

### Checkout stepper (`checkout-stepper.tsx`)

Horizontal 4-step progress indicator:
- **Active step:** Filled purple circle with step number, bold label
- **Completed steps:** Green checkmark circle, clickable (navigates back)
- **Future steps:** Grey outline circle with number, not clickable
- Steps connected by chevron separators

Navigation rules:
- **Forward:** Only via the primary CTA button (validates before proceeding)
- **Backward:** Click any completed step in the stepper
- **No skipping forward**

### Step 1: Review cart & add notes (`step-review.tsx`)

**General order notes** at the top:
- Label + subtitle: "These notes will be visible to your sellers (optional)"
- Full-width textarea

**Cart items list** — "Your cart (N)" header:
- Each item card shows all information directly (no expandable/hidden sections):
  - Product thumbnail, name, cert lab, stock ID, key specs
  - Internal order reference text input (pre-filled from cart store if set, synced back)
  - Notes text input (per-item)
  - Price with red "Remove" button
- Remove: calls `useCartStore.removeItem()` with 200ms exit animation
- If last item removed: redirect to `/buyer`

**CTA:** "Continue to delivery options" — marks step 1 completed, advances to step 2. No validation (all fields optional).

### Step 2: Delivery options (`step-delivery.tsx`)

**Title:** "Delivery options" with subtitle.

**Default view:** Shows user's default address. "Change delivery for this order" button expands to selection mode.

**Delivery mode toggle** — two radio cards:
- "Deliver to a single address" — all items to one address
- "Deliver to multiple addresses" — per-item address selection

**Single address mode:**
- "Choose where to deliver your items to" heading + "Add new address +" button
- Saved addresses as selectable radio cards (name, full address). Selected gets checkmark.
- Unverified address warning banner if applicable (static mock flag on seed addresses)

**Multiple addresses mode:**
- Each cart item listed with name + key specs
- Dropdown select per item to pick a delivery address
- "Add new address +" button

**Add new address modal:**
- Fields: name/label, street, city, state/province, postal code, country dropdown
- Submit adds to `localAddresses` in checkout store, auto-selects it
- No DB write

**CTA:** "Continue to payment method" — validates: single mode requires an address selected; multiple mode requires all items assigned. Inline error if not met.

### Step 3: Payment selection (`step-payment.tsx`)

**Title:** "Payment selection" with subtitle.

**Credit available section:**
- Large "$10,000.00" display with "Your credit limit" subtitle
- Horizontal stacked bar chart (three segments):
  - Purple: used before this request (hardcoded $5,000)
  - Dark: used after this request ($5,000 + cart subtotal — dynamic)
  - Amber: available after ($10,000 - used after — dynamic)
- Legend with amounts below the bar

**Default payment terms** (first visit):
- Shows default: "Pay in 3 days" with "1.4% discount + tax" badge
- Bulleted process timeline (5 steps)
- Price with discount applied
- "Change payment terms for this order" button to expand

**Payment terms selection** (expanded):
- "Save this selection for my future purchases" checkbox
- Radio card list — selected card expands to show process timeline:
  - Pay in 3 days — 1.4% discount
  - Pay in 30 days — no change
  - Pay in 60 days — 1.4% fee
  - Upfront payment — 1.4% discount, shipping after confirmed payment

**CTA:** "Continue to order review" — always valid (a payment term is always selected).

### Step 4: Order review (`step-confirm.tsx`)

**Title:** "Review your order before finishing" with subtitle.

**Cart items section:**
- Each item: thumbnail, name, specs, internal order reference, item notes, delivery address, estimated delivery, price
- **"Edit" link per item** → navigates to Step 1

**Notes and shipping section:**
- General order notes displayed (if set) — **"Edit" link** → Step 1
- Delivery address summary — **"Edit" link** → Step 2

**Payment & price breakdown section:**
- Selected payment terms with process timeline — **"Edit" link** → Step 3
- Price breakdown: subtotal, payment discount/fee, shipping, VAT, total

**CTA:** "Place order" (black, prominent). On click:
1. Button shows loading spinner (1-2 second mock delay)
2. Sets `orderJustPlaced: true` in checkout store
3. Clears `useCartStore` (empties cart)
4. Calls `useCheckoutStore.reset()` (preserves `orderJustPlaced`)
5. Navigates to `/buyer/checkout/confirmation`

Edit links call `setStep(n)`. The user lands on the target step, makes changes, then proceeds forward — completed steps are preserved so they can click through quickly.

### Confirmation screen (`confirmation/page.tsx` + `checkout-confirmation.tsx`)

**Layout:** Centered single column. Uses the `(checkout)` layout shell (header) but no stepper, no sidebar.

**Guard:** If `orderJustPlaced` is false, redirect to `/buyer`. Flag is cleared after the confirmation page mounts.

**Content:**
- Green checkmark icon (large, centered)
- "Thank you! Your order has been placed."
- "An order request email has been sent to [user email]. It should arrive in the next few minutes."
- Mock order number (e.g. "MN-1234-56789") with copy-to-clipboard button
- **"Back to browsing"** primary CTA → `/buyer`
- **"View your order"** text link → `/buyer/orders`

**"What happens now?" timeline** (vertical, 5 steps):
1. "We confirm your order" — confirmation in under 24 hours
2. "Your item is manufactured" — notified when complete
3. "We quality control your item" — checked against standards
4. "Your item is shipped to you" — invoice generated after shipping
5. "An invoice is generated" — 30 days to pay

**Support sections:**
- "I didn't receive a confirmation email" — explanatory text + "Resend order request email" button (shows toast on click, mock)
- "Contact support" — text + "Contact customer support" button → `/help`

## Order summary sidebar (`order-summary.tsx`)

Sticky sidebar rendered alongside steps 1-4. Hidden on confirmation page.

**Contents:**
- "Order summary" heading
- Subtotal (with secondary converted currency line, mock)
- Total excl. taxes
- Payment terms line — appears from Step 3 onward, shows selected term + discount
- VAT (0% for Phase 0)
- **Discount codes** input:
  - "DEMO10" applies 10% discount
  - Invalid codes show inline error
  - Applied code shows as removable tag
- **TOTAL** (bold, large, with converted currency)
- **Primary CTA button** — label changes per step:
  - Step 1: "Continue to delivery options"
  - Step 2: "Continue to payment method"
  - Step 3: "Continue to order review"
  - Step 4: "Place order"
- Fine print about currency conversion and returns policy (static text from Figma)

**QC requirements section** (below fine print):
- "Default QC requirements" heading with info icon
- Current QC text displayed
- "Edit default QC requirements" link opens `qc-requirements-modal.tsx`
- Editable on all steps (1-4)

**QC requirements modal:**
- Single textarea pre-filled with current requirements
- Default: "Flag any BGM or not eye clean stones to us"
- Save updates `qcRequirements` in checkout store

## Entry point

The "Proceed to checkout" button in the cart sheet (`components/shell/cart-button.tsx`) navigates to `/buyer/checkout`. Currently shows a "Coming soon" toast — will be changed to `router.push("/buyer/checkout")`.

## Acceptance criteria

From issue #20:
- [ ] 4 checkout steps are navigable
- [ ] Each step has appropriate forms with appropriate mock data
- [ ] Progress indicator shows current step
- [ ] Can navigate forward and backward (clicking the progress steps)
- [ ] "Place order" leads to confirmation screen (#21)

Additional:
- [ ] Empty cart redirects away from checkout
- [ ] Confirmation page guarded (requires order placement)
- [ ] Discount code "DEMO10" functional
- [ ] Credit bar dynamically reflects cart total
- [ ] QC requirements editable from sidebar on any step
- [ ] Edit links on Step 4 navigate to the correct step
- [ ] Cart cleared after order placed
- [ ] Help button links to `/help`

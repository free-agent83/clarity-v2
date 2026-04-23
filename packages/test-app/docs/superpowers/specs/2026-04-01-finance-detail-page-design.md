# Finance Document Detail Page

**Issue:** #45 — Finances: invoice detail page
**Date:** 2026-04-01
**Status:** Approved

## Overview

Implement `/buyer/finances/[id]` — a detail page for a single invoice or credit note, reached by clicking any row on the finances list. Uses static mock data. Handles both invoices and credit notes, adapting headers, timeline events, and sidebar content based on document type.

## Page Layout

Two-column layout following the orders detail page pattern (`orders/[id]/page.tsx`):

- **Container:** `max-w-5xl`, centered, with vertical padding
- **Header:** Back link → eyebrow label → document number + status badge (inline in `page.tsx`)
- **Separator** below header
- **Left column** (`flex-1`): Invoiced items table stacked above history timeline, separated by a divider
- **Right sidebar** (`w-96`, `sticky top-24`): Invoice summary card above payment breakdown card

## Header (inline in page.tsx)

- **Back link:** `← Back to Finances` linking to `/buyer/finances`
- **Eyebrow:** "Invoice" or "Credit Note" — uppercase, small, muted text
- **Title:** Document number (e.g. `INV-2025-0412`) in `text-4xl font-medium tracking-tight`
- **Status badge:** Dot + label, reusing the same `STATUS_DOT_COLORS` map from the finances table

## Components

### `components/finances/invoiced-items-table.tsx`

Server component. Receives `lineItems: FinanceLineItem[]` as props.

- Section heading: "Invoiced items" (`text-xl font-medium tracking-tight`)
- shadcn `Table` with columns: **Item description** · **Qty** · **Unit price** · **VAT** · **Total**
- Each row has a primary line (description) and a secondary line (descriptionDetail) in `text-muted-foreground`
- Totals row at bottom with `bg-muted` background, summing VAT and Total columns

### `components/finances/history-timeline.tsx`

Server component. Receives `events: FinanceHistoryEvent[]` as props.

- Section heading: "History" (`text-xl font-medium tracking-tight`)
- Vertical timeline with 32px icon circles and connecting lines between events
- Each event type maps to a distinct Tabler icon:
  - `invoice_issued` → `IconFileInvoice`
  - `due_date_set` → `IconCalendar`
  - `credit_note_allocated` → `IconCreditCardRefund`
  - `late_fee_added` → `IconAlertTriangle`
  - `late_fee_removed` → `IconReceiptOff`
  - `invoice_voided` → `IconX`
  - `invoice_partially_paid` → `IconCashBanknote`
  - `invoice_fully_paid` → `IconCheck`
  - `credit_note_issued` → `IconFileInvoice`
  - `credit_note_partially_allocated` → `IconCreditCardRefund`
  - `credit_note_fully_allocated` → `IconCheck`
- Each entry: icon circle (bg-muted, or bg-emerald-100 for completion events) → description (font-medium) → timestamp (muted)
- Last event has no connecting line below it

### `components/finances/invoice-summary-card.tsx`

Server component. Receives the `FinanceDocumentDetail` as props.

- shadcn `Card` with header "Invoice summary" (or "Credit note summary")
- Rows: Status (dot + label) · Date issued · Due date
- "Due in X days" computed from today — shown for `issued` and `partially_paid` invoices. For `overdue` invoices, shows "Overdue by X days" in `text-destructive`. Hidden for credit notes, paid, and cancelled documents.
- Separator
- "Download .PDF" outline button — visually present, completely inert

### `components/finances/payment-breakdown-card.tsx`

Server component. Receives the `FinanceDocumentDetail` as props.

- "Pay [amount] now" primary button — inert, hidden for credit notes and paid/cancelled invoices
- Payment terms row (e.g. "Wire Transfer")
- Separator
- Breakdown rows: Ordered items (subtotal) · VAT · Shipping & fees
- Separator
- Invoice total (bold) · Total paid · Total due (bold, `text-destructive` if amount > 0)

## Data Layer

All changes in `lib/api/finances.ts`.

### New types

```typescript
type FinanceLineItem = {
  id: string
  description: string        // "Round Diamond 1.02ct E VS1"
  descriptionDetail: string  // "Natural diamond · GIA #12345678"
  quantity: number
  unitPrice: number
  vatAmount: number
  total: number
}

type FinanceHistoryEvent = {
  id: string
  type:
    | "invoice_issued"
    | "due_date_set"
    | "credit_note_allocated"
    | "late_fee_added"
    | "late_fee_removed"
    | "invoice_voided"
    | "invoice_partially_paid"
    | "invoice_fully_paid"
    | "credit_note_issued"
    | "credit_note_partially_allocated"
    | "credit_note_fully_allocated"
  description: string        // Human-readable
  occurredAt: string         // ISO datetime
}

type FinanceDocumentDetail = FinanceDocument & {
  lineItems: FinanceLineItem[]
  historyEvents: FinanceHistoryEvent[]
  subtotal: number
  vatTotal: number
  shippingAndFees: number
}
```

### New function

`fetchFinanceDocument(id: string): Promise<FinanceDocumentDetail | null>`

Looks up the existing mock `FinanceDocument` by ID, enriches it with mock line items and history events appropriate to its status and type. Returns `null` if not found.

### History events per status

- **issued** — invoice issued → due date set
- **partially_paid** — invoice issued → due date set → invoice partially paid
- **paid** — invoice issued → due date set → invoice fully paid
- **overdue** — invoice issued → due date set (no payment events — past due)
- **cancelled** — invoice issued → due date set → invoice voided
- **Credit notes (issued)** — credit note issued
- **Credit notes (partially_paid)** — credit note issued → credit note partially allocated
- **Credit notes (paid)** — credit note issued → credit note fully allocated

Each mock document gets its own line items (1–5 items matching `itemCount`) and its own realistic history events with timestamps derived from the document's `issueDate` and `dueDate`.

## Files Created/Modified

| File | Action |
|---|---|
| `app/buyer/(shop)/finances/[id]/page.tsx` | **Create** — page server component |
| `components/finances/invoiced-items-table.tsx` | **Create** |
| `components/finances/history-timeline.tsx` | **Create** |
| `components/finances/invoice-summary-card.tsx` | **Create** |
| `components/finances/payment-breakdown-card.tsx` | **Create** |
| `lib/api/finances.ts` | **Modify** — add detail types, mock data, `fetchFinanceDocument()` |

## Acceptance Criteria (from issue)

- [x] Page renders at `/buyer/finances/[id]` with mock data
- [x] Back link returns to `/buyer/finances`
- [x] Status badge reflects the invoice status
- [x] Invoiced items table renders with generic mock line items and a correct totals row
- [x] History timeline renders all event types with correct icons and mock timestamps
- [x] Invoice summary card shows all fields
- [x] "Download .PDF" button is present but does nothing
- [x] "Pay now" CTA is present but does nothing
- [x] Payment breakdown card shows all line items and totals

## Out of Scope

- Real database queries (mock data only for Phase 0)
- Payment flow interaction (future issue)
- PDF generation
- Filtering/sorting on the list page linking here

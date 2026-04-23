# Finances Page Design

**Issue:** #23 — Finances page: replace placeholder with mock invoices and statements
**Date:** 2026-03-31
**Phase:** 0 (Full Mock UI Coverage)

## Overview

Replace the "under construction" placeholder on `/buyer/finances` with a fully mocked finances view — invoices and credit notes interleaved in a single table, with summary cards, tabs, filter bar, and pagination.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Data source | Hardcoded mock array | Phase 0 scope; avoids schema changes for credit notes |
| Mock data location | `lib/api/finances.ts` | Colocated where the real fetch would live; swap mock for Drizzle query later |
| Data shape | Matches DB `Invoice` schema + `type` discriminator | Easy migration to real data |
| Credit note representation | `type: "credit_note"` field on `FinanceDocument` | Explicit discriminator; not in DB but clean for UI logic |
| Status values | DB values (`issued`, `partially_paid`, `paid`, `overdue`, `cancelled`) | Matches existing `invoice_statuses` lookup table |
| Status display | Formatted from snake_case for display (e.g. `partially_paid` → "Partially paid") | Consistent with how we'd display real data |
| Summary card values | Computed from mock array; credit limit hardcoded | Cards stay consistent with table data |

## Files

### `lib/api/finances.ts` (new)

Data layer for the finances page.

**Types:**

```ts
export type FinanceDocument = {
  id: string
  type: "invoice" | "credit_note"
  invoiceNumber: string
  paymentMethod: { id: string; value: string }
  issueDate: string
  dueDate: string
  totalAmountUsd: number
  balanceDue: number
  settledAmount: number
  currentStatus: { id: string; value: string } | null
  itemCount: number
  ledgerEntries: LedgerEntry[]  // reuses type from lib/api/invoices.ts
}

export type FinanceSummary = {
  totalUnpaid: { amount: number; invoiceCount: number; currencyCount: number }
  totalOverdue: { amount: number; invoiceCount: number; lateFees: number }
  availableCredit: { amount: number; used: number; limit: number }
}
```

**Exports:**

- `fetchFinanceDocuments(): FinanceDocument[]` — returns ~12-15 hardcoded mock rows mixing invoices and credit notes
- `computeFinanceSummary(docs: FinanceDocument[]): FinanceSummary` — derives summary card values from the array; credit `limit` is hardcoded (e.g. $50,000)

**Mock data characteristics:**
- ~10 invoices, ~3-5 credit notes
- Mix of statuses: `issued`, `partially_paid`, `paid`, `overdue`, `cancelled`
- Realistic invoice numbers: `INV-2025-XXXX` for invoices, `CN-2025-XXXX` for credit notes
- Payment methods from the DB lookup: `wire_transfer`, `credit_card`, `net_terms`
- All amounts in USD (currency count in summary card will be 1; multi-currency is a future concern)
- Dates spanning the last 2-3 months
- `ledgerEntries` arrays kept minimal (1-3 entries per document) since they're not displayed in the list view

### `app/buyer/(shop)/finances/page.tsx` (replace)

Server component. Replaces the current `LayoutUnderConstruction` placeholder.

**Structure:**
1. Header — "Finances" `<h1>` + "Export" `<Button variant="outline">` (static)
2. Summary cards — 3-column grid:
   - **Total unpaid** — amount, invoice count, currency count
   - **Total overdue** — amount, invoice count, late fees callout
   - **Available credit** — amount, used/limit, `<Progress>` bar, "Apply for more credit" link (static)
3. `<FinancesTable documents={documents} />` — client component

No `getCurrentUser()` call needed (mock data). When real data arrives, add user fetch like orders does.

### `components/finances/finances-table.tsx` (new)

`"use client"` component. Receives `documents: FinanceDocument[]` as props.

**Tabs** — shadcn `<Tabs>` with `line` variant:
- All — no filter
- Unpaid (count badge) — `issued`, `partially_paid`, `overdue`
- Paid — `paid`
- Credit notes — `type === "credit_note"`

Client-side filtering via `useState` for active tab.

**Filter bar** — Static UI only (no filtering logic). Inline pattern matching orders page:
- Search input (pill style, `bg-secondary`)
- Dropdown buttons: Status, Payment terms, Issue currency, Amount, Issue date, Due date
- Clear all button
- Sort button (right-aligned): "Sort by Date issued"

**Table** — shadcn `<Table>` with columns:

| Column | Content | Alignment |
|---|---|---|
| Checkbox | `<Checkbox>` | Left |
| Details | Invoice/CN number + item count + payment method | Left |
| Total inc. tax | Formatted USD | Right |
| Balance due | Formatted USD | Right |
| Settled amount | Formatted USD | Right |
| Issued | Formatted date | Left |
| Due date | Formatted date | Left |
| Status | Dot + formatted label | Left |
| Actions | Download icon + "Pay now" (invoices) / "Allocate" (credit notes) | Right |

Each row wraps in `<Link href={/buyer/finances/${doc.id}}>` (detail page not built yet).

**Status dot colors** (following orders pattern):
- `issued` → `bg-foreground`
- `partially_paid` → `bg-amber-500`
- `paid` → `bg-emerald-500`
- `overdue` → `bg-destructive`
- `cancelled` → `bg-muted-foreground`

**Pagination** — `<PaginationControls>` from existing component. Client-side slicing of filtered array. With ~12-15 rows and default per-page of 20, effectively one page but controls are present and functional.

## Acceptance Criteria (from issue)

- [ ] No "under construction" placeholder
- [ ] Three summary cards render with realistic mock values
- [ ] Tabs render; selecting a tab filters the table rows client-side
- [ ] Filter bar renders with the correct controls; no filtering logic required
- [ ] Table renders all columns with realistic mock data
- [ ] Invoice rows show "Pay now" action; credit note rows show "Allocate" action
- [ ] Status badges render the correct label for each row type
- [ ] Clicking any row navigates to `/buyer/finances/[id]`
- [ ] Pagination controls render; previous/next behave correctly against mock data

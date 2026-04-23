# Finance Document Detail Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/buyer/finances/[id]` detail page for invoices and credit notes with mock data.

**Architecture:** Server-component page that calls `fetchFinanceDocument(id)` from the mock data layer, then composes four presentational components (items table, timeline, summary card, breakdown card) in a two-column layout. No client state needed.

**Tech Stack:** Next.js 16 App Router, React server components, shadcn/ui (Card, Table, Button, Separator), @tabler/icons-react, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-04-01-finance-detail-page-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/api/finances.ts` | Modify | Add detail types, mock line items/events per document, `fetchFinanceDocument()` |
| `components/finances/invoiced-items-table.tsx` | Create | Table of line items with totals row |
| `components/finances/history-timeline.tsx` | Create | Vertical timeline with typed icons |
| `components/finances/invoice-summary-card.tsx` | Create | Status, dates, due-in-X-days, download button |
| `components/finances/payment-breakdown-card.tsx` | Create | Pay now CTA, payment terms, cost breakdown |
| `app/buyer/(shop)/finances/[id]/page.tsx` | Create | Page server component — header, layout, composition |

---

### Task 1: Extend the data layer with detail types and mock data

**Files:**
- Modify: `lib/api/finances.ts`

- [ ] **Step 1: Add the new types below the existing `FinanceSummary` type**

Add these after the existing `FinanceSummary` type (around line 26):

```typescript
export type FinanceLineItem = {
  id: string
  description: string
  descriptionDetail: string
  quantity: number
  unitPrice: number
  vatAmount: number
  total: number
}

export type FinanceHistoryEventType =
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

export type FinanceHistoryEvent = {
  id: string
  type: FinanceHistoryEventType
  description: string
  occurredAt: string
}

export type FinanceDocumentDetail = FinanceDocument & {
  lineItems: FinanceLineItem[]
  historyEvents: FinanceHistoryEvent[]
  subtotal: number
  vatTotal: number
  shippingAndFees: number
}
```

- [ ] **Step 2: Add mock line items data**

Add a `MOCK_LINE_ITEMS` record below the `MOCK_DOCUMENTS` array. Each key is a document ID, and the value is an array of `FinanceLineItem` objects. Generate realistic items matching each document's `itemCount`. Example pattern:

```typescript
const MOCK_LINE_ITEMS: Record<string, FinanceLineItem[]> = {
  "fin-001": [
    {
      id: "li-001-1",
      description: "Round Diamond 1.02ct E VS1",
      descriptionDetail: "Natural diamond · GIA #2251234567",
      quantity: 1,
      unitPrice: 2975.87,
      vatAmount: 595.17,
      total: 3571.04,
    },
  ],
  "fin-002": [
    {
      id: "li-002-1",
      description: "Oval Diamond 0.71ct F VS2",
      descriptionDetail: "Natural diamond · GIA #6381234568",
      quantity: 1,
      unitPrice: 1190.0,
      vatAmount: 238.0,
      total: 1428.0,
    },
    {
      id: "li-002-2",
      description: "Princess Diamond 0.85ct G VVS1",
      descriptionDetail: "Natural diamond · GIA #1171234569",
      quantity: 1,
      unitPrice: 1200.0,
      vatAmount: 240.0,
      total: 1440.0,
    },
  ],
  "fin-003": [
    {
      id: "li-003-1",
      description: "Emerald Cut Diamond 1.50ct D IF",
      descriptionDetail: "Lab-grown diamond · IGI #LG1234570",
      quantity: 1,
      unitPrice: 3500.0,
      vatAmount: 700.0,
      total: 4200.0,
    },
    {
      id: "li-003-2",
      description: "Cushion Diamond 0.90ct E VS1",
      descriptionDetail: "Natural diamond · GIA #4421234571",
      quantity: 1,
      unitPrice: 2525.0,
      vatAmount: 505.0,
      total: 3030.0,
    },
    {
      id: "li-003-3",
      description: "Pear Diamond 1.20ct F VS2",
      descriptionDetail: "Natural diamond · GIA #7891234572",
      quantity: 1,
      unitPrice: 2500.0,
      vatAmount: 500.0,
      total: 3000.0,
    },
  ],
  "fin-004": [
    {
      id: "li-004-1",
      description: "Marquise Diamond 0.65ct G VS1",
      descriptionDetail: "Natural diamond · GIA #3361234573",
      quantity: 1,
      unitPrice: 2975.87,
      vatAmount: 595.17,
      total: 3571.04,
    },
  ],
  "fin-005": [
    {
      id: "li-005-1",
      description: "Heart Diamond 1.10ct E VVS2",
      descriptionDetail: "Natural diamond · GIA #5521234574",
      quantity: 1,
      unitPrice: 3400.0,
      vatAmount: 680.0,
      total: 4080.0,
    },
    {
      id: "li-005-2",
      description: "Radiant Diamond 0.80ct F VS1",
      descriptionDetail: "Lab-grown diamond · IGI #LG1234575",
      quantity: 1,
      unitPrice: 2275.0,
      vatAmount: 455.0,
      total: 2730.0,
    },
  ],
  "fin-006": [
    {
      id: "li-006-1",
      description: "Asscher Diamond 2.01ct D VVS1",
      descriptionDetail: "Natural diamond · GIA #9981234576",
      quantity: 1,
      unitPrice: 12500.0,
      vatAmount: 2500.0,
      total: 15000.0,
    },
    {
      id: "li-006-2",
      description: "Round Diamond 1.50ct E IF",
      descriptionDetail: "Natural diamond · GIA #1121234577",
      quantity: 1,
      unitPrice: 8200.0,
      vatAmount: 1640.0,
      total: 9840.0,
    },
    {
      id: "li-006-3",
      description: "Oval Diamond 1.80ct F VS1",
      descriptionDetail: "Natural diamond · GIA #4451234578",
      quantity: 1,
      unitPrice: 6500.0,
      vatAmount: 1300.0,
      total: 7800.0,
    },
    {
      id: "li-006-4",
      description: "Cushion Diamond 1.20ct G VS2",
      descriptionDetail: "Lab-grown diamond · IGI #LG1234579",
      quantity: 1,
      unitPrice: 3750.0,
      vatAmount: 750.0,
      total: 4500.0,
    },
    {
      id: "li-006-5",
      description: "Emerald Cut Diamond 1.00ct E VVS2",
      descriptionDetail: "Natural diamond · GIA #7781234580",
      quantity: 1,
      unitPrice: 7291.67,
      vatAmount: 1458.33,
      total: 8750.0,
    },
  ],
  "fin-007": [
    {
      id: "li-007-1",
      description: "Pear Diamond 0.95ct D VS1",
      descriptionDetail: "Natural diamond · GIA #2231234581",
      quantity: 1,
      unitPrice: 3750.0,
      vatAmount: 750.0,
      total: 4500.0,
    },
    {
      id: "li-007-2",
      description: "Round Diamond 0.70ct F VVS1",
      descriptionDetail: "Natural diamond · GIA #5561234582",
      quantity: 1,
      unitPrice: 2500.0,
      vatAmount: 500.0,
      total: 3000.0,
    },
  ],
  "fin-008": [
    {
      id: "li-008-1",
      description: "Princess Diamond 0.55ct E VS2",
      descriptionDetail: "Lab-grown diamond · IGI #LG1234583",
      quantity: 1,
      unitPrice: 1041.67,
      vatAmount: 208.33,
      total: 1250.0,
    },
  ],
  "fin-009": [
    {
      id: "li-009-1",
      description: "Oval Diamond 1.05ct G VS1",
      descriptionDetail: "Natural diamond · GIA #8891234584",
      quantity: 1,
      unitPrice: 3500.0,
      vatAmount: 700.0,
      total: 4200.0,
    },
  ],
  "fin-010": [
    {
      id: "li-010-1",
      description: "Round Diamond 0.30ct F VS1",
      descriptionDetail: "Natural diamond · GIA #1231234585",
      quantity: 1,
      unitPrice: 741.67,
      vatAmount: 148.33,
      total: 890.0,
    },
  ],
  "fin-011": [
    {
      id: "li-011-1",
      description: "Round Diamond 0.71ct E VS1 — Return",
      descriptionDetail: "Credit for returned item · Ref INV-2025-0355",
      quantity: 1,
      unitPrice: 2083.33,
      vatAmount: 416.67,
      total: 2500.0,
    },
  ],
  "fin-012": [
    {
      id: "li-012-1",
      description: "Oval Diamond 0.50ct F VS2 — Return",
      descriptionDetail: "Credit for returned item · Ref INV-2025-0298",
      quantity: 1,
      unitPrice: 1500.0,
      vatAmount: 300.0,
      total: 1800.0,
    },
  ],
  "fin-013": [
    {
      id: "li-013-1",
      description: "Cushion Diamond 1.00ct D VS1 — Return",
      descriptionDetail: "Credit for returned item · Ref INV-2025-0267",
      quantity: 1,
      unitPrice: 2750.0,
      vatAmount: 550.0,
      total: 3300.0,
    },
    {
      id: "li-013-2",
      description: "Princess Diamond 0.60ct E VS2 — Return",
      descriptionDetail: "Credit for returned item · Ref INV-2025-0267",
      quantity: 1,
      unitPrice: 1750.0,
      vatAmount: 350.0,
      total: 2100.0,
    },
  ],
  "fin-014": [
    {
      id: "li-014-1",
      description: "Emerald Cut Diamond 0.80ct F VVS1 — Return",
      descriptionDetail: "Credit for returned item · Ref INV-2025-0389",
      quantity: 1,
      unitPrice: 2666.67,
      vatAmount: 533.33,
      total: 3200.0,
    },
  ],
}
```

- [ ] **Step 3: Add a helper to generate history events for a document**

```typescript
function buildHistoryEvents(doc: FinanceDocument): FinanceHistoryEvent[] {
  const events: FinanceHistoryEvent[] = []
  const issueDate = doc.issueDate + "T09:00:00Z"
  const status = doc.currentStatus?.value ?? "issued"

  if (doc.type === "credit_note") {
    events.push({
      id: `evt-${doc.id}-1`,
      type: "credit_note_issued",
      description: `Credit note ${doc.invoiceNumber} issued`,
      occurredAt: issueDate,
    })

    if (status === "partially_paid") {
      const midDate = new Date(doc.issueDate + "T00:00:00Z")
      midDate.setDate(midDate.getDate() + 10)
      events.push({
        id: `evt-${doc.id}-2`,
        type: "credit_note_partially_allocated",
        description: `Credit note partially allocated`,
        occurredAt: midDate.toISOString(),
      })
    }

    if (status === "paid") {
      const midDate = new Date(doc.issueDate + "T00:00:00Z")
      midDate.setDate(midDate.getDate() + 14)
      events.push({
        id: `evt-${doc.id}-2`,
        type: "credit_note_fully_allocated",
        description: `Credit note fully allocated`,
        occurredAt: midDate.toISOString(),
      })
    }

    return events
  }

  // Invoice events
  events.push({
    id: `evt-${doc.id}-1`,
    type: "invoice_issued",
    description: `Invoice ${doc.invoiceNumber} issued`,
    occurredAt: issueDate,
  })

  events.push({
    id: `evt-${doc.id}-2`,
    type: "due_date_set",
    description: `Due date set to ${new Date(doc.dueDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    occurredAt: issueDate,
  })

  if (status === "partially_paid") {
    const payDate = new Date(doc.issueDate + "T00:00:00Z")
    payDate.setDate(payDate.getDate() + 15)
    events.push({
      id: `evt-${doc.id}-3`,
      type: "invoice_partially_paid",
      description: `Partial payment received`,
      occurredAt: payDate.toISOString(),
    })
  }

  if (status === "paid") {
    const payDate = new Date(doc.issueDate + "T00:00:00Z")
    payDate.setDate(payDate.getDate() + 20)
    events.push({
      id: `evt-${doc.id}-3`,
      type: "invoice_fully_paid",
      description: `Invoice fully paid`,
      occurredAt: payDate.toISOString(),
    })
  }

  if (status === "cancelled") {
    const voidDate = new Date(doc.issueDate + "T00:00:00Z")
    voidDate.setDate(voidDate.getDate() + 5)
    events.push({
      id: `evt-${doc.id}-3`,
      type: "invoice_voided",
      description: `Invoice voided`,
      occurredAt: voidDate.toISOString(),
    })
  }

  return events
}
```

- [ ] **Step 4: Add the `fetchFinanceDocument` function**

Add at the bottom of the "Public API" section:

```typescript
export async function fetchFinanceDocument(
  id: string,
): Promise<FinanceDocumentDetail | null> {
  const doc = MOCK_DOCUMENTS.find((d) => d.id === id)
  if (!doc) return null

  const lineItems = MOCK_LINE_ITEMS[doc.id] ?? []
  const historyEvents = buildHistoryEvents(doc)
  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)
  const vatTotal = lineItems.reduce((sum, li) => sum + li.vatAmount, 0)
  const shippingAndFees = 0

  return {
    ...doc,
    lineItems,
    historyEvents,
    subtotal,
    vatTotal,
    shippingAndFees,
  }
}
```

- [ ] **Step 5: Verify the types compile**

Run: `npm run typecheck`
Expected: No errors in `lib/api/finances.ts`

- [ ] **Step 6: Commit**

```bash
git add lib/api/finances.ts
git commit -m "feat(finances): add detail types, mock data, and fetchFinanceDocument (#45)"
```

---

### Task 2: Build the invoiced items table component

**Files:**
- Create: `components/finances/invoiced-items-table.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatUSD } from "@/lib/utils"
import type { FinanceLineItem } from "@/lib/api/finances"

interface InvoicedItemsTableProps {
  lineItems: FinanceLineItem[]
}

export function InvoicedItemsTable({ lineItems }: InvoicedItemsTableProps) {
  const vatTotal = lineItems.reduce((sum, li) => sum + li.vatAmount, 0)
  const grandTotal = lineItems.reduce((sum, li) => sum + li.total, 0)

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-medium tracking-tight text-foreground">
        Invoiced items
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">VAT</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {item.description}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.descriptionDetail}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {formatUSD(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatUSD(item.vatAmount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatUSD(item.total)}
              </TableCell>
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {formatUSD(vatTotal)}
            </TableCell>
            <TableCell className="text-right">
              {formatUSD(grandTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/finances/invoiced-items-table.tsx
git commit -m "feat(finances): add invoiced items table component (#45)"
```

---

### Task 3: Build the history timeline component

**Files:**
- Create: `components/finances/history-timeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  IconFileInvoice,
  IconCalendar,
  IconCreditCardRefund,
  IconAlertTriangle,
  IconReceiptOff,
  IconX,
  IconCashBanknote,
  IconCheck,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { FinanceHistoryEvent, FinanceHistoryEventType } from "@/lib/api/finances"

const EVENT_ICON_MAP: Record<
  FinanceHistoryEventType,
  React.ComponentType<{ className?: string }>
> = {
  invoice_issued: IconFileInvoice,
  due_date_set: IconCalendar,
  credit_note_allocated: IconCreditCardRefund,
  late_fee_added: IconAlertTriangle,
  late_fee_removed: IconReceiptOff,
  invoice_voided: IconX,
  invoice_partially_paid: IconCashBanknote,
  invoice_fully_paid: IconCheck,
  credit_note_issued: IconFileInvoice,
  credit_note_partially_allocated: IconCreditCardRefund,
  credit_note_fully_allocated: IconCheck,
}

const COMPLETION_EVENTS: FinanceHistoryEventType[] = [
  "invoice_fully_paid",
  "credit_note_fully_allocated",
]

interface HistoryTimelineProps {
  events: FinanceHistoryEvent[]
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-medium tracking-tight text-foreground">
        History
      </h3>
      <div className="flex flex-col">
        {events.map((event, i) => {
          const isLast = i === events.length - 1
          const Icon = EVENT_ICON_MAP[event.type] ?? IconFileInvoice
          const isCompletion = COMPLETION_EVENTS.includes(event.type)
          const eventDate = new Date(event.occurredAt)

          return (
            <div key={event.id} className="relative flex gap-3 pb-6">
              {/* Icon circle + connecting line */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                    isCompletion ? "bg-emerald-100" : "bg-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      isCompletion
                        ? "text-emerald-600"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                {!isLast && (
                  <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="text-sm font-medium text-foreground">
                  {event.description}
                </span>
                <span className="text-sm text-muted-foreground">
                  {eventDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &middot;{" "}
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/finances/history-timeline.tsx
git commit -m "feat(finances): add history timeline component (#45)"
```

---

### Task 4: Build the invoice summary card

**Files:**
- Create: `components/finances/invoice-summary-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { IconDownload } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { FinanceDocumentDetail } from "@/lib/api/finances"

const STATUS_DOT_COLORS: Record<string, string> = {
  issued: "bg-foreground",
  partially_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  overdue: "bg-destructive",
  cancelled: "bg-muted-foreground",
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getDueDaysLabel(
  dueDate: string,
  status: string,
): { label: string; className: string } | null {
  if (!["issued", "partially_paid", "overdue"].includes(status)) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + "T00:00:00")
  const diffMs = due.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (status === "overdue" || diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)} days`,
      className: "text-destructive",
    }
  }

  return {
    label: `Due in ${diffDays} days`,
    className: "text-muted-foreground",
  }
}

interface InvoiceSummaryCardProps {
  document: FinanceDocumentDetail
}

export function InvoiceSummaryCard({ document }: InvoiceSummaryCardProps) {
  const statusValue = document.currentStatus?.value ?? "issued"
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground"
  const isInvoice = document.type === "invoice"
  const dueDaysLabel = isInvoice ? getDueDaysLabel(document.dueDate, statusValue) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal">
          {isInvoice ? "Invoice summary" : "Credit note summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
              <span className="font-medium">{formatStatus(statusValue)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date issued</span>
            <span>{formatDate(document.issueDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due date</span>
            <span>{formatDate(document.dueDate)}</span>
          </div>
          {dueDaysLabel && (
            <div className="flex justify-end">
              <span className={cn("text-sm", dueDaysLabel.className)}>
                {dueDaysLabel.label}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <Button variant="outline" className="w-full">
          <IconDownload className="size-4" />
          Download .PDF
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/finances/invoice-summary-card.tsx
git commit -m "feat(finances): add invoice summary card component (#45)"
```

---

### Task 5: Build the payment breakdown card

**Files:**
- Create: `components/finances/payment-breakdown-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn, formatUSD } from "@/lib/utils"
import type { FinanceDocumentDetail } from "@/lib/api/finances"

function formatPaymentMethod(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

interface PaymentBreakdownCardProps {
  document: FinanceDocumentDetail
}

export function PaymentBreakdownCard({ document }: PaymentBreakdownCardProps) {
  const status = document.currentStatus?.value ?? "issued"
  const isInvoice = document.type === "invoice"
  const showPayButton =
    isInvoice && !["paid", "cancelled"].includes(status)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal">
          Payment breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showPayButton && (
          <Button className="w-full">
            Pay {formatUSD(document.balanceDue)} now
          </Button>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Payment terms</span>
          <span>{formatPaymentMethod(document.paymentMethod.value)}</span>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ordered items</span>
            <span>{formatUSD(document.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatUSD(document.vatTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping & fees</span>
            <span>{formatUSD(document.shippingAndFees)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span>Invoice total</span>
            <span>{formatUSD(document.totalAmountUsd)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total paid</span>
            <span>{formatUSD(document.settledAmount)}</span>
          </div>
          <div
            className={cn(
              "flex items-center justify-between font-semibold",
              document.balanceDue > 0 && "text-destructive",
            )}
          >
            <span>Total due</span>
            <span>{formatUSD(document.balanceDue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/finances/payment-breakdown-card.tsx
git commit -m "feat(finances): add payment breakdown card component (#45)"
```

---

### Task 6: Build the page server component

**Files:**
- Create: `app/buyer/(shop)/finances/[id]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"

import { fetchFinanceDocument } from "@/lib/api/finances"
import { Separator } from "@/components/ui/separator"
import { IconArrowLeft } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { InvoicedItemsTable } from "@/components/finances/invoiced-items-table"
import { HistoryTimeline } from "@/components/finances/history-timeline"
import { InvoiceSummaryCard } from "@/components/finances/invoice-summary-card"
import { PaymentBreakdownCard } from "@/components/finances/payment-breakdown-card"

const STATUS_DOT_COLORS: Record<string, string> = {
  issued: "bg-foreground",
  partially_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  overdue: "bg-destructive",
  cancelled: "bg-muted-foreground",
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default async function FinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const document = await fetchFinanceDocument(id)

  if (!document) {
    notFound()
  }

  const statusValue = document.currentStatus?.value ?? "issued"
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground"
  const isInvoice = document.type === "invoice"

  return (
    <div className="flex flex-col gap-14 pb-44 pt-12">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex flex-col gap-6">
          {/* Back link */}
          <Link
            href="/buyer/finances"
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:underline"
          >
            <IconArrowLeft className="size-4" />
            Back to Finances
          </Link>

          {/* Eyebrow + Title + Badge */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {isInvoice ? "Invoice" : "Credit Note"}
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-medium tracking-tight text-foreground">
                {document.invoiceNumber}
              </h1>
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <span
                  className={cn("size-2 shrink-0 rounded-full", dotColor)}
                />
                <span className="text-sm font-medium">
                  {formatStatus(statusValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mx-auto w-full max-w-5xl" />

      {/* Main content area with sidebar */}
      <div className="mx-auto flex w-full max-w-5xl gap-9 px-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-10">
          <InvoicedItemsTable lineItems={document.lineItems} />
          <Separator />
          <HistoryTimeline events={document.historyEvents} />
        </div>

        {/* Right sidebar */}
        <div className="flex w-96 shrink-0 flex-col gap-4">
          <div className="sticky top-24 flex flex-col gap-4">
            <InvoiceSummaryCard document={document} />
            <PaymentBreakdownCard document={document} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Verify the page renders**

Run: `npm run dev`

Then open:
- `http://localhost:3000/buyer/finances/fin-001` — issued invoice (should show "Pay now" button, "Due in X days")
- `http://localhost:3000/buyer/finances/fin-004` — overdue invoice (should show "Overdue by X days" in red)
- `http://localhost:3000/buyer/finances/fin-003` — paid invoice (no "Pay now" button, no due days label)
- `http://localhost:3000/buyer/finances/fin-011` — credit note (eyebrow says "Credit Note", no "Pay now" button)
- `http://localhost:3000/buyer/finances/nonexistent` — should show 404

- [ ] **Step 4: Verify navigation from list page**

Open `http://localhost:3000/buyer/finances` and click any row. It should navigate to the detail page for that document. The "Back to Finances" link should return to the list.

- [ ] **Step 5: Commit**

```bash
git add app/buyer/\(shop\)/finances/\[id\]/page.tsx
git commit -m "feat(finances): add finance document detail page (#45)"
```

---

### Task 7: Format and final verification

- [ ] **Step 1: Run formatter**

Run: `npm run format`

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit any formatting changes**

```bash
git add -A
git diff --cached --quiet || git commit -m "style: format finance detail page files (#45)"
```

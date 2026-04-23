# Finances Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the finances under-construction placeholder with a mocked invoices and credit notes view featuring summary cards, tabs, filter bar, table, and pagination.

**Architecture:** Mock data lives in `lib/api/finances.ts` colocated with the future real fetch. The server component page renders summary cards and passes data to a `FinancesTable` client component that owns tab filtering and pagination state. No DB changes.

**Tech Stack:** Next.js App Router, shadcn/ui (Tabs, Table, Card, Checkbox, Button, Progress, Badge), Tailwind CSS, TypeScript

---

### File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/api/finances.ts` | Create | Types (`FinanceDocument`, `FinanceSummary`), mock data array, `fetchFinanceDocuments()`, `computeFinanceSummary()` |
| `app/buyer/(shop)/finances/page.tsx` | Replace | Server component: header, summary cards, passes data to `FinancesTable` |
| `components/finances/finances-table.tsx` | Create | Client component: tabs, filter bar, table, pagination |

---

### Task 1: Data layer — types and mock data

**Files:**
- Create: `lib/api/finances.ts`

- [ ] **Step 1: Create `lib/api/finances.ts` with types, mock data, and helpers**

```ts
import type { LedgerEntry } from "@/lib/api/invoices"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  ledgerEntries: LedgerEntry[]
}

export type FinanceSummary = {
  totalUnpaid: { amount: number; invoiceCount: number; currencyCount: number }
  totalOverdue: { amount: number; invoiceCount: number; lateFees: number }
  availableCredit: { amount: number; used: number; limit: number }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UNPAID_STATUSES = ["issued", "partially_paid", "overdue"]

export function computeFinanceSummary(
  docs: FinanceDocument[],
): FinanceSummary {
  const invoices = docs.filter((d) => d.type === "invoice")
  const unpaid = invoices.filter((d) =>
    UNPAID_STATUSES.includes(d.currentStatus?.value ?? ""),
  )
  const overdue = invoices.filter(
    (d) => d.currentStatus?.value === "overdue",
  )

  const unpaidAmount = unpaid.reduce((sum, d) => sum + d.balanceDue, 0)
  const overdueAmount = overdue.reduce((sum, d) => sum + d.balanceDue, 0)
  const lateFees = overdue.length * 75 // flat $75 per overdue invoice for mock

  const creditNotes = docs.filter((d) => d.type === "credit_note")
  const availableCredit = creditNotes
    .filter((d) => d.currentStatus?.value !== "cancelled")
    .reduce((sum, d) => sum + d.balanceDue, 0)

  const CREDIT_LIMIT = 50000
  const used = CREDIT_LIMIT - availableCredit

  return {
    totalUnpaid: {
      amount: unpaidAmount,
      invoiceCount: unpaid.length,
      currencyCount: 1,
    },
    totalOverdue: {
      amount: overdueAmount,
      invoiceCount: overdue.length,
      lateFees,
    },
    availableCredit: {
      amount: availableCredit,
      used,
      limit: CREDIT_LIMIT,
    },
  }
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_DOCUMENTS: FinanceDocument[] = [
  {
    id: "fin-001",
    type: "invoice",
    invoiceNumber: "INV-2025-0412",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-03-25",
    dueDate: "2025-04-25",
    totalAmountUsd: 3571.04,
    balanceDue: 3571.04,
    settledAmount: 0,
    currentStatus: { id: "s-1", value: "issued" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-002",
    type: "invoice",
    invoiceNumber: "INV-2025-0389",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-03-22",
    dueDate: "2025-04-22",
    totalAmountUsd: 2868.0,
    balanceDue: 1434.0,
    settledAmount: 1434.0,
    currentStatus: { id: "s-2", value: "partially_paid" },
    itemCount: 2,
    ledgerEntries: [],
  },
  {
    id: "fin-003",
    type: "invoice",
    invoiceNumber: "INV-2025-0355",
    paymentMethod: { id: "pm-2", value: "credit_card" },
    issueDate: "2025-03-19",
    dueDate: "2025-04-19",
    totalAmountUsd: 10230.0,
    balanceDue: 0,
    settledAmount: 10230.0,
    currentStatus: { id: "s-3", value: "paid" },
    itemCount: 3,
    ledgerEntries: [],
  },
  {
    id: "fin-004",
    type: "invoice",
    invoiceNumber: "INV-2025-0334",
    paymentMethod: { id: "pm-3", value: "net_terms" },
    issueDate: "2025-03-11",
    dueDate: "2025-03-25",
    totalAmountUsd: 3571.04,
    balanceDue: 3571.04,
    settledAmount: 0,
    currentStatus: { id: "s-4", value: "overdue" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-005",
    type: "invoice",
    invoiceNumber: "INV-2025-0298",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-03-02",
    dueDate: "2025-03-16",
    totalAmountUsd: 6810.0,
    balanceDue: 0,
    settledAmount: 6810.0,
    currentStatus: { id: "s-3", value: "paid" },
    itemCount: 2,
    ledgerEntries: [],
  },
  {
    id: "fin-006",
    type: "invoice",
    invoiceNumber: "INV-2025-0456",
    paymentMethod: { id: "pm-2", value: "credit_card" },
    issueDate: "2025-03-28",
    dueDate: "2025-04-28",
    totalAmountUsd: 45890.0,
    balanceDue: 45890.0,
    settledAmount: 0,
    currentStatus: { id: "s-1", value: "issued" },
    itemCount: 5,
    ledgerEntries: [],
  },
  {
    id: "fin-007",
    type: "invoice",
    invoiceNumber: "INV-2025-0267",
    paymentMethod: { id: "pm-3", value: "net_terms" },
    issueDate: "2025-02-15",
    dueDate: "2025-03-15",
    totalAmountUsd: 7500.0,
    balanceDue: 0,
    settledAmount: 7500.0,
    currentStatus: { id: "s-3", value: "paid" },
    itemCount: 2,
    ledgerEntries: [],
  },
  {
    id: "fin-008",
    type: "invoice",
    invoiceNumber: "INV-2025-0478",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-03-30",
    dueDate: "2025-04-30",
    totalAmountUsd: 1250.0,
    balanceDue: 625.0,
    settledAmount: 625.0,
    currentStatus: { id: "s-2", value: "partially_paid" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-009",
    type: "invoice",
    invoiceNumber: "INV-2025-0201",
    paymentMethod: { id: "pm-2", value: "credit_card" },
    issueDate: "2025-01-28",
    dueDate: "2025-02-28",
    totalAmountUsd: 4200.0,
    balanceDue: 4200.0,
    settledAmount: 0,
    currentStatus: { id: "s-4", value: "overdue" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-010",
    type: "invoice",
    invoiceNumber: "INV-2025-0490",
    paymentMethod: { id: "pm-3", value: "net_terms" },
    issueDate: "2025-03-31",
    dueDate: "2025-04-30",
    totalAmountUsd: 890.0,
    balanceDue: 0,
    settledAmount: 890.0,
    currentStatus: { id: "s-5", value: "cancelled" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-011",
    type: "credit_note",
    invoiceNumber: "CN-2025-0001",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-03-20",
    dueDate: "2025-04-20",
    totalAmountUsd: 2500.0,
    balanceDue: 2500.0,
    settledAmount: 0,
    currentStatus: { id: "s-1", value: "issued" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-012",
    type: "credit_note",
    invoiceNumber: "CN-2025-0002",
    paymentMethod: { id: "pm-2", value: "credit_card" },
    issueDate: "2025-03-10",
    dueDate: "2025-04-10",
    totalAmountUsd: 1800.0,
    balanceDue: 900.0,
    settledAmount: 900.0,
    currentStatus: { id: "s-2", value: "partially_paid" },
    itemCount: 1,
    ledgerEntries: [],
  },
  {
    id: "fin-013",
    type: "credit_note",
    invoiceNumber: "CN-2025-0003",
    paymentMethod: { id: "pm-1", value: "wire_transfer" },
    issueDate: "2025-02-28",
    dueDate: "2025-03-28",
    totalAmountUsd: 5400.0,
    balanceDue: 0,
    settledAmount: 5400.0,
    currentStatus: { id: "s-3", value: "paid" },
    itemCount: 2,
    ledgerEntries: [],
  },
  {
    id: "fin-014",
    type: "credit_note",
    invoiceNumber: "CN-2025-0004",
    paymentMethod: { id: "pm-3", value: "net_terms" },
    issueDate: "2025-03-15",
    dueDate: "2025-04-15",
    totalAmountUsd: 3200.0,
    balanceDue: 3200.0,
    settledAmount: 0,
    currentStatus: { id: "s-1", value: "issued" },
    itemCount: 1,
    ledgerEntries: [],
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function fetchFinanceDocuments(): FinanceDocument[] {
  return MOCK_DOCUMENTS
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors related to `lib/api/finances.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/api/finances.ts
git commit -m "feat(finances): add mock data layer with types and helpers (#23)"
```

---

### Task 2: Server component — page with summary cards

**Files:**
- Replace: `app/buyer/(shop)/finances/page.tsx`

**Reference:** `app/buyer/(shop)/orders/page.tsx` for header + layout pattern

- [ ] **Step 1: Replace `page.tsx` with full server component**

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  IconUpload,
  IconFileInvoice,
  IconAlertTriangle,
  IconCreditCard,
} from "@tabler/icons-react"
import {
  fetchFinanceDocuments,
  computeFinanceSummary,
} from "@/lib/api/finances"
import { FinancesTable } from "@/components/finances/finances-table"

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
}

export default function FinancesPage() {
  const documents = fetchFinanceDocuments()
  const summary = computeFinanceSummary(documents)

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-medium leading-14 text-foreground">
          Finances
        </h1>
        <Button variant="outline" size="lg">
          <IconUpload className="size-5" />
          Export
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total unpaid */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconFileInvoice className="size-4" />
              Total unpaid
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.totalUnpaid.amount)}
            </span>
            <span className="text-sm text-muted-foreground">
              {summary.totalUnpaid.invoiceCount} invoice
              {summary.totalUnpaid.invoiceCount !== 1 ? "s" : ""} &middot;{" "}
              {summary.totalUnpaid.currencyCount} currency
            </span>
          </CardContent>
        </Card>

        {/* Total overdue */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconAlertTriangle className="size-4" />
              Total overdue
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.totalOverdue.amount)}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-muted-foreground">
                {summary.totalOverdue.invoiceCount} invoice
                {summary.totalOverdue.invoiceCount !== 1 ? "s" : ""}
              </span>
              {summary.totalOverdue.lateFees > 0 && (
                <span className="text-sm font-medium text-destructive">
                  +{formatUsd(summary.totalOverdue.lateFees)} late fees
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available credit */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCreditCard className="size-4" />
              Available credit
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.availableCredit.amount)}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {formatUsd(summary.availableCredit.used)} /{" "}
                  {formatUsd(summary.availableCredit.limit)} used
                </span>
              </div>
              <Progress
                value={
                  (summary.availableCredit.used /
                    summary.availableCredit.limit) *
                  100
                }
              />
              <button className="mt-1 text-sm font-medium text-primary hover:underline self-start">
                Apply for more credit
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table with tabs, filters, pagination */}
      <FinancesTable documents={documents} />
    </div>
  )
}
```

Note: This will show a TypeScript error because `FinancesTable` doesn't exist yet. That's expected — Task 3 creates it.

- [ ] **Step 2: Commit**

```bash
git add app/buyer/\(shop\)/finances/page.tsx
git commit -m "feat(finances): replace placeholder with summary cards and page layout (#23)"
```

---

### Task 3: Client component — tabs, filter bar, table, and pagination

**Files:**
- Create: `components/finances/finances-table.tsx`

**Reference:** `components/orders/orders-realtime-wrapper.tsx` for table + pagination pattern

- [ ] **Step 1: Create `components/finances/finances-table.tsx`**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconSearch,
  IconChevronDown,
  IconDownload,
  IconX,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { FinanceDocument } from "@/lib/api/finances"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UNPAID_STATUSES = ["issued", "partially_paid", "overdue"]
const PER_PAGE_OPTIONS = [10, 20, 40]
const DEFAULT_PER_PAGE = 20

const STATUS_DOT_COLORS: Record<string, string> = {
  issued: "bg-foreground",
  partially_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  overdue: "bg-destructive",
  cancelled: "bg-muted-foreground",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatPaymentMethod(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ doc }: { doc: FinanceDocument }) {
  const statusValue = doc.currentStatus?.value ?? "unknown"
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground"
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      <span className="text-sm font-medium">{formatStatus(statusValue)}</span>
    </div>
  )
}

function DocumentRow({ doc }: { doc: FinanceDocument }) {
  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <Checkbox />
      </TableCell>
      <TableCell>
        <Link href={`/buyer/finances/${doc.id}`} className="block">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {doc.invoiceNumber}
            </span>
            <span className="text-sm text-muted-foreground">
              {doc.itemCount} item{doc.itemCount !== 1 ? "s" : ""} &middot;{" "}
              {formatPaymentMethod(doc.paymentMethod.value)}
            </span>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.totalAmountUsd)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.balanceDue)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.settledAmount)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(doc.issueDate)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(doc.dueDate)}
      </TableCell>
      <TableCell>
        <StatusBadge doc={doc} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon-sm">
            <IconDownload className="size-4" />
          </Button>
          {doc.type === "invoice" ? (
            <Button variant="default" size="sm">
              Pay now
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              Allocate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Filter bar (static UI)
// ---------------------------------------------------------------------------

function FilterBar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-11 border-none bg-secondary pl-9 shadow-none"
          />
        </div>
        <Button variant="outline" size="default">
          Status
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="outline" size="default">
          Payment terms
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="outline" size="default">
          Issue currency
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="outline" size="default">
          Amount
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="outline" size="default">
          Issue date
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="outline" size="default">
          Due date
          <IconChevronDown className="size-4" />
        </Button>
        <Button variant="ghost" size="default">
          <IconX className="size-4" />
          Clear
        </Button>
      </div>
      <Button variant="outline" size="default">
        Sort by Date issued
        <IconChevronDown className="size-4" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Table content
// ---------------------------------------------------------------------------

function DocumentTable({
  documents,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}: {
  documents: FinanceDocument[]
  page: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}) {
  const totalItems = documents.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const start = (page - 1) * perPage
  const pageItems = documents.slice(start, start + perPage)

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pr-0">
              <Checkbox />
            </TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Total inc. tax</TableHead>
            <TableHead className="text-right">Balance due</TableHead>
            <TableHead className="text-right">Settled amount</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : start + 1}-
          {Math.min(start + perPage, totalItems)} of {totalItems}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Results per page:
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              onPerPageChange(Number(v))
              onPageChange(1)
            }}
          >
            <SelectTrigger className="h-11.25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="lg"
            className="h-11.25 w-21.25"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            <span className="text-muted-foreground">Page </span>
            <span className="font-semibold text-foreground">{page}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>
          <Button
            variant="secondary"
            size="lg"
            className="h-11.25 w-21.25"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface FinancesTableProps {
  documents: FinanceDocument[]
}

export function FinancesTable({ documents }: FinancesTableProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)

  const unpaidDocs = documents.filter((d) =>
    UNPAID_STATUSES.includes(d.currentStatus?.value ?? ""),
  )
  const paidDocs = documents.filter(
    (d) => d.currentStatus?.value === "paid",
  )
  const creditNoteDocs = documents.filter(
    (d) => d.type === "credit_note",
  )
  const unpaidCount = unpaidDocs.length

  function handleTabChange() {
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unpaid" className="gap-1.5">
            Unpaid
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
              {unpaidCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="credit_notes">Credit notes</TabsTrigger>
        </TabsList>

        <FilterBar />

        <TabsContent value="all">
          <DocumentTable
            documents={documents}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </TabsContent>
        <TabsContent value="unpaid">
          <DocumentTable
            documents={unpaidDocs}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </TabsContent>
        <TabsContent value="paid">
          <DocumentTable
            documents={paidDocs}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </TabsContent>
        <TabsContent value="credit_notes">
          <DocumentTable
            documents={creditNoteDocs}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

Note: The `PaginationControls` component from `components/layouts/pagination-controls.tsx` uses `useRouter` and URL search params, which won't work for client-side tab filtering. So we inline the pagination UI here instead, using the same visual structure (Select + Previous/Next buttons with the same class names).

- [ ] **Step 2: Verify the build compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/finances/finances-table.tsx
git commit -m "feat(finances): add client-side table with tabs, filters, and pagination (#23)"
```

---

### Task 4: Verify and format

- [ ] **Step 1: Run the dev server and verify the page renders**

Run: `npm run dev`
Navigate to: `http://localhost:3000/buyer/finances`
Expected: Summary cards, tabs, filter bar, table with 14 rows, pagination controls. No "under construction" placeholder.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: no new errors

- [ ] **Step 3: Run the formatter**

Run: `npm run format`

- [ ] **Step 4: Run the type checker**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 5: Commit any formatting changes**

```bash
git add -A
git commit -m "chore(finances): format and lint (#23)"
```

---

### Task 5: Manual acceptance verification

Walk through each acceptance criterion from the issue:

- [ ] **AC 1:** No "under construction" placeholder — the old `LayoutUnderConstruction` import is gone
- [ ] **AC 2:** Three summary cards render — Total unpaid, Total overdue, Available credit with computed values
- [ ] **AC 3:** Tabs filter — click "Unpaid" tab, only unpaid rows show; click "Paid", only paid rows; click "Credit notes", only credit note rows
- [ ] **AC 4:** Filter bar renders — Search input + 6 dropdown buttons + Clear + Sort. No filtering logic needed.
- [ ] **AC 5:** Table shows all columns — checkbox, details (number + items + payment method), total, balance, settled, issued date, due date, status, actions
- [ ] **AC 6:** Invoice rows show "Pay now" button; credit note rows show "Allocate" button
- [ ] **AC 7:** Status badges show colored dot + formatted label for each status
- [ ] **AC 8:** Clicking any row navigates to `/buyer/finances/[id]` (will 404 since detail page doesn't exist — that's expected)
- [ ] **AC 9:** Pagination controls render; with 14 rows and 20 per page default, shows page 1 of 1 with Previous disabled. Changing per page to 10 shows page 1 of 2 with functional Next button.

import type { LedgerEntry } from "@/lib/api/invoices";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinanceDocument = {
  id: string;
  type: "invoice" | "credit_note";
  invoiceNumber: string;
  paymentMethod: { id: string; value: string };
  issueDate: string;
  dueDate: string;
  totalAmountUsd: number;
  balanceDue: number;
  settledAmount: number;
  currentStatus: { id: string; value: string } | null;
  itemCount: number;
  ledgerEntries: LedgerEntry[];
};

export type FinanceSummary = {
  totalUnpaid: { amount: number; invoiceCount: number; currencyCount: number };
  totalOverdue: { amount: number; invoiceCount: number; lateFees: number };
  availableCredit: { amount: number; used: number; limit: number };
};

export type FinanceLineItem = {
  id: string;
  description: string;
  descriptionDetail: string;
  quantity: number;
  unitPrice: number;
  vatAmount: number;
  total: number;
};

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
  | "credit_note_fully_allocated";

export type FinanceHistoryEvent = {
  id: string;
  type: FinanceHistoryEventType;
  description: string;
  occurredAt: string;
};

export type FinanceDocumentDetail = FinanceDocument & {
  lineItems: FinanceLineItem[];
  historyEvents: FinanceHistoryEvent[];
  subtotal: number;
  vatTotal: number;
  shippingAndFees: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const UNPAID_STATUSES = ["issued", "partially_paid", "overdue"];

export const STATUS_DOT_COLORS: Record<string, string> = {
  issued: "bg-foreground",
  partially_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  overdue: "bg-destructive",
  cancelled: "bg-muted-foreground",
};

export function formatStatus(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function computeFinanceSummary(docs: FinanceDocument[]): FinanceSummary {
  const invoices = docs.filter((d) => d.type === "invoice");

  const unpaid = invoices.filter(
    (d) => d.currentStatus && UNPAID_STATUSES.includes(d.currentStatus.value),
  );
  const totalUnpaidAmount = unpaid.reduce((sum, d) => sum + d.balanceDue, 0);

  const overdue = invoices.filter((d) => d.currentStatus?.value === "overdue");
  const totalOverdueAmount = overdue.reduce((sum, d) => sum + d.balanceDue, 0);
  const lateFees = overdue.length * 75;

  const creditNotes = docs.filter(
    (d) => d.type === "credit_note" && d.currentStatus?.value !== "cancelled",
  );
  const availableCreditAmount = creditNotes.reduce(
    (sum, d) => sum + d.balanceDue,
    0,
  );
  const creditLimit = 50_000;
  const creditUsed = Math.max(0, creditLimit - availableCreditAmount);

  return {
    totalUnpaid: {
      amount: totalUnpaidAmount,
      invoiceCount: unpaid.length,
      currencyCount: 1,
    },
    totalOverdue: {
      amount: totalOverdueAmount,
      invoiceCount: overdue.length,
      lateFees,
    },
    availableCredit: {
      amount: availableCreditAmount,
      used: creditUsed,
      limit: creditLimit,
    },
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function formatDateUS(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildHistoryEvents(doc: FinanceDocument): FinanceHistoryEvent[] {
  const events: FinanceHistoryEvent[] = [];
  const base = doc.issueDate;
  let counter = 1;

  if (doc.type === "invoice") {
    events.push({
      id: `${doc.id}-evt-${counter++}`,
      type: "invoice_issued",
      description: `Invoice ${doc.invoiceNumber} issued for $${doc.totalAmountUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      occurredAt: addDays(base, 0),
    });

    events.push({
      id: `${doc.id}-evt-${counter++}`,
      type: "due_date_set",
      description: `Payment due by ${formatDateUS(doc.dueDate)}`,
      occurredAt: addDays(base, 0),
    });

    const status = doc.currentStatus?.value;

    if (status === "partially_paid") {
      events.push({
        id: `${doc.id}-evt-${counter++}`,
        type: "invoice_partially_paid",
        description: `Partial payment of $${doc.settledAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} received`,
        occurredAt: addDays(base, 7),
      });
    } else if (status === "paid") {
      events.push({
        id: `${doc.id}-evt-${counter++}`,
        type: "invoice_fully_paid",
        description: `Full payment of $${doc.totalAmountUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} received`,
        occurredAt: addDays(base, 14),
      });
    } else if (status === "cancelled") {
      events.push({
        id: `${doc.id}-evt-${counter++}`,
        type: "invoice_voided",
        description: `Invoice ${doc.invoiceNumber} voided`,
        occurredAt: addDays(base, 3),
      });
    }
    // "issued" and "overdue" get no additional events beyond the first two
  } else {
    // credit_note
    events.push({
      id: `${doc.id}-evt-${counter++}`,
      type: "credit_note_issued",
      description: `Credit note ${doc.invoiceNumber} issued for $${doc.totalAmountUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      occurredAt: addDays(base, 0),
    });

    const status = doc.currentStatus?.value;

    if (status === "partially_paid") {
      events.push({
        id: `${doc.id}-evt-${counter++}`,
        type: "credit_note_partially_allocated",
        description: `$${doc.settledAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} allocated against outstanding invoices`,
        occurredAt: addDays(base, 5),
      });
    } else if (status === "paid") {
      events.push({
        id: `${doc.id}-evt-${counter++}`,
        type: "credit_note_fully_allocated",
        description: `Full amount of $${doc.totalAmountUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} allocated against outstanding invoices`,
        occurredAt: addDays(base, 10),
      });
    }
  }

  return events;
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
];

// Line items keyed by document ID
// VAT rule: vatAmount = unitPrice * 0.2, total = unitPrice + vatAmount
// Line item totals for each document sum to that document's totalAmountUsd
const MOCK_LINE_ITEMS: Record<string, FinanceLineItem[]> = {
  // fin-001: invoice, 1 item, total 3571.04
  "fin-001": [
    {
      id: "li-001-1",
      description: "Round Diamond 1.02ct E VS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251234567",
      quantity: 1,
      unitPrice: 2975.87,
      vatAmount: 595.17,
      total: 3571.04,
    },
  ],
  // fin-002: invoice, 2 items, total 2868.00
  "fin-002": [
    {
      id: "li-002-1",
      description: "Princess Diamond 0.71ct F VS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251234890",
      quantity: 1,
      unitPrice: 1195.0,
      vatAmount: 239.0,
      total: 1434.0,
    },
    {
      id: "li-002-2",
      description: "Oval Diamond 0.80ct G VVS2",
      descriptionDetail: "Natural diamond \u00b7 IGI #LG45678901",
      quantity: 1,
      unitPrice: 1195.0,
      vatAmount: 239.0,
      total: 1434.0,
    },
  ],
  // fin-003: invoice, 3 items, total 10230.00
  "fin-003": [
    {
      id: "li-003-1",
      description: "Emerald Diamond 1.50ct D VVS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251239876",
      quantity: 1,
      unitPrice: 3500.0,
      vatAmount: 700.0,
      total: 4200.0,
    },
    {
      id: "li-003-2",
      description: "Cushion Diamond 1.21ct E VS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251235432",
      quantity: 1,
      unitPrice: 3000.0,
      vatAmount: 600.0,
      total: 3600.0,
    },
    {
      id: "li-003-3",
      description: "Pear Diamond 0.90ct F VS2",
      descriptionDetail: "Natural diamond \u00b7 IGI #LG98765432",
      quantity: 1,
      unitPrice: 2025.0,
      vatAmount: 405.0,
      total: 2430.0,
    },
  ],
  // fin-004: invoice, 1 item, total 3571.04
  "fin-004": [
    {
      id: "li-004-1",
      description: "Round Diamond 1.01ct E VS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251237654",
      quantity: 1,
      unitPrice: 2975.87,
      vatAmount: 595.17,
      total: 3571.04,
    },
  ],
  // fin-005: invoice, 2 items, total 6810.00
  "fin-005": [
    {
      id: "li-005-1",
      description: "Radiant Diamond 1.30ct D VS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251231234",
      quantity: 1,
      unitPrice: 3000.0,
      vatAmount: 600.0,
      total: 3600.0,
    },
    {
      id: "li-005-2",
      description: "Marquise Diamond 1.05ct E VVS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251238765",
      quantity: 1,
      unitPrice: 2675.0,
      vatAmount: 535.0,
      total: 3210.0,
    },
  ],
  // fin-006: invoice, 5 items, total 45890.00
  "fin-006": [
    {
      id: "li-006-1",
      description: "Round Diamond 2.01ct D IF",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251240001",
      quantity: 1,
      unitPrice: 10000.0,
      vatAmount: 2000.0,
      total: 12000.0,
    },
    {
      id: "li-006-2",
      description: "Oval Diamond 1.82ct D VVS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251240002",
      quantity: 1,
      unitPrice: 9000.0,
      vatAmount: 1800.0,
      total: 10800.0,
    },
    {
      id: "li-006-3",
      description: "Emerald Diamond 1.75ct E VVS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251240003",
      quantity: 1,
      unitPrice: 8000.0,
      vatAmount: 1600.0,
      total: 9600.0,
    },
    {
      id: "li-006-4",
      description: "Cushion Diamond 1.55ct E VS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251240004",
      quantity: 1,
      unitPrice: 6075.0,
      vatAmount: 1215.0,
      total: 7290.0,
    },
    {
      id: "li-006-5",
      description: "Asscher Diamond 1.40ct F VS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251240005",
      quantity: 1,
      unitPrice: 5166.67,
      vatAmount: 1033.33,
      total: 6200.0,
    },
  ],
  // fin-007: invoice, 2 items, total 7500.00
  "fin-007": [
    {
      id: "li-007-1",
      description: "Round Diamond 1.50ct E VS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251243210",
      quantity: 1,
      unitPrice: 3750.0,
      vatAmount: 750.0,
      total: 4500.0,
    },
    {
      id: "li-007-2",
      description: "Oval Diamond 1.10ct F VVS1",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251246543",
      quantity: 1,
      unitPrice: 2500.0,
      vatAmount: 500.0,
      total: 3000.0,
    },
  ],
  // fin-008: invoice, 1 item, total 1250.00
  "fin-008": [
    {
      id: "li-008-1",
      description: "Round Lab Diamond 0.75ct E VS1",
      descriptionDetail: "Lab grown diamond \u00b7 IGI #LG56789012",
      quantity: 1,
      unitPrice: 1041.67,
      vatAmount: 208.33,
      total: 1250.0,
    },
  ],
  // fin-009: invoice, 1 item, total 4200.00
  "fin-009": [
    {
      id: "li-009-1",
      description: "Round Diamond 1.20ct D VS2",
      descriptionDetail: "Natural diamond \u00b7 GIA #2251249876",
      quantity: 1,
      unitPrice: 3500.0,
      vatAmount: 700.0,
      total: 4200.0,
    },
  ],
  // fin-010: invoice, 1 item, total 890.00 (cancelled)
  "fin-010": [
    {
      id: "li-010-1",
      description: "Princess Lab Diamond 0.55ct G VS1",
      descriptionDetail: "Lab grown diamond \u00b7 IGI #LG34567890",
      quantity: 1,
      unitPrice: 741.67,
      vatAmount: 148.33,
      total: 890.0,
    },
  ],
  // fin-011: credit_note, 1 item, total 2500.00
  "fin-011": [
    {
      id: "li-011-1",
      description: "Oval Diamond 0.85ct F VS1 \u2014 Return",
      descriptionDetail:
        "Natural diamond \u00b7 GIA #2251234890 \u00b7 Ref INV-2025-0389",
      quantity: 1,
      unitPrice: 2083.33,
      vatAmount: 416.67,
      total: 2500.0,
    },
  ],
  // fin-012: credit_note, 1 item, total 1800.00
  "fin-012": [
    {
      id: "li-012-1",
      description: "Pear Diamond 0.90ct F VS2 \u2014 Return",
      descriptionDetail:
        "Natural diamond \u00b7 IGI #LG98765432 \u00b7 Ref INV-2025-0355",
      quantity: 1,
      unitPrice: 1500.0,
      vatAmount: 300.0,
      total: 1800.0,
    },
  ],
  // fin-013: credit_note, 2 items, total 5400.00
  "fin-013": [
    {
      id: "li-013-1",
      description: "Radiant Diamond 1.30ct D VS1 \u2014 Return",
      descriptionDetail:
        "Natural diamond \u00b7 GIA #2251231234 \u00b7 Ref INV-2025-0298",
      quantity: 1,
      unitPrice: 2500.0,
      vatAmount: 500.0,
      total: 3000.0,
    },
    {
      id: "li-013-2",
      description: "Marquise Diamond 1.05ct E VVS2 \u2014 Return",
      descriptionDetail:
        "Natural diamond \u00b7 GIA #2251238765 \u00b7 Ref INV-2025-0298",
      quantity: 1,
      unitPrice: 2000.0,
      vatAmount: 400.0,
      total: 2400.0,
    },
  ],
  // fin-014: credit_note, 1 item, total 3200.00
  "fin-014": [
    {
      id: "li-014-1",
      description: "Emerald Diamond 1.50ct D VVS1 \u2014 Return",
      descriptionDetail:
        "Natural diamond \u00b7 GIA #2251239876 \u00b7 Ref INV-2025-0355",
      quantity: 1,
      unitPrice: 2666.67,
      vatAmount: 533.33,
      total: 3200.0,
    },
  ],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchFinanceDocuments(): Promise<FinanceDocument[]> {
  return MOCK_DOCUMENTS;
}

export async function fetchFinanceDocument(
  id: string,
): Promise<FinanceDocumentDetail | null> {
  const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
  if (!doc) return null;

  const lineItems = MOCK_LINE_ITEMS[doc.id] ?? [];
  const historyEvents = buildHistoryEvents(doc);

  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice, 0);
  const vatTotal = lineItems.reduce((sum, li) => sum + li.vatAmount, 0);
  const shippingAndFees = doc.totalAmountUsd - (subtotal + vatTotal);

  return {
    ...doc,
    lineItems,
    historyEvents,
    subtotal: Math.round(subtotal * 100) / 100,
    vatTotal: Math.round(vatTotal * 100) / 100,
    shippingAndFees: Math.round(shippingAndFees * 100) / 100,
  };
}

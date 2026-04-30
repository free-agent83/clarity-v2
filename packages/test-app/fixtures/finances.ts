import type {
  FinanceDocumentDetail,
  FinanceLineItem,
  FinanceHistoryEvent,
} from "@/fixtures/types/finance";

const PM = {
  wire: { id: "pm-1", value: "wire_transfer" },
  card: { id: "pm-2", value: "credit_card" },
  terms: { id: "pm-3", value: "net_terms" },
} as const;

const STATUS = {
  issued: { id: "s-1", value: "issued" },
  partial: { id: "s-2", value: "partially_paid" },
  paid: { id: "s-3", value: "paid" },
  overdue: { id: "s-4", value: "overdue" },
  cancelled: { id: "s-5", value: "cancelled" },
} as const;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildHistory(
  id: string,
  type: "invoice" | "credit_note",
  invoiceNumber: string,
  issueDate: string,
  dueDate: string,
  totalAmountUsd: number,
  settledAmount: number,
  status: string,
): FinanceHistoryEvent[] {
  const events: FinanceHistoryEvent[] = [];
  let n = 1;

  if (type === "invoice") {
    events.push({
      id: `${id}-evt-${n++}`,
      type: "invoice_issued",
      description: `Invoice ${invoiceNumber} issued for $${fmtUsd(totalAmountUsd)}`,
      occurredAt: addDays(issueDate, 0),
    });
    events.push({
      id: `${id}-evt-${n++}`,
      type: "due_date_set",
      description: `Payment due by ${fmtDate(dueDate)}`,
      occurredAt: addDays(issueDate, 0),
    });
    if (status === "partially_paid") {
      events.push({
        id: `${id}-evt-${n++}`,
        type: "invoice_partially_paid",
        description: `Partial payment of $${fmtUsd(settledAmount)} received`,
        occurredAt: addDays(issueDate, 7),
      });
    } else if (status === "paid") {
      events.push({
        id: `${id}-evt-${n++}`,
        type: "invoice_fully_paid",
        description: `Full payment of $${fmtUsd(totalAmountUsd)} received`,
        occurredAt: addDays(issueDate, 14),
      });
    } else if (status === "cancelled") {
      events.push({
        id: `${id}-evt-${n++}`,
        type: "invoice_voided",
        description: `Invoice ${invoiceNumber} voided`,
        occurredAt: addDays(issueDate, 3),
      });
    }
  } else {
    events.push({
      id: `${id}-evt-${n++}`,
      type: "credit_note_issued",
      description: `Credit note ${invoiceNumber} issued for $${fmtUsd(totalAmountUsd)}`,
      occurredAt: addDays(issueDate, 0),
    });
    if (status === "partially_paid") {
      events.push({
        id: `${id}-evt-${n++}`,
        type: "credit_note_partially_allocated",
        description: `$${fmtUsd(settledAmount)} allocated against outstanding invoices`,
        occurredAt: addDays(issueDate, 5),
      });
    } else if (status === "paid") {
      events.push({
        id: `${id}-evt-${n++}`,
        type: "credit_note_fully_allocated",
        description: `Full amount of $${fmtUsd(totalAmountUsd)} allocated against outstanding invoices`,
        occurredAt: addDays(issueDate, 10),
      });
    }
  }

  return events;
}

function doc(
  base: Omit<FinanceDocumentDetail, "subtotal" | "vatTotal" | "shippingAndFees" | "historyEvents">,
): FinanceDocumentDetail {
  const subtotal = base.lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0);
  const vatTotal = base.lineItems.reduce((s, li) => s + li.vatAmount, 0);
  const shippingAndFees =
    Math.round((base.totalAmountUsd - subtotal - vatTotal) * 100) / 100;
  const historyEvents = buildHistory(
    base.id,
    base.type,
    base.invoiceNumber,
    base.issueDate,
    base.dueDate,
    base.totalAmountUsd,
    base.settledAmount,
    base.currentStatus?.value ?? "",
  );
  return {
    ...base,
    subtotal: Math.round(subtotal * 100) / 100,
    vatTotal: Math.round(vatTotal * 100) / 100,
    shippingAndFees,
    historyEvents,
  };
}

function li(
  id: string,
  description: string,
  descriptionDetail: string,
  unitPrice: number,
): FinanceLineItem {
  const vatAmount = Math.round(unitPrice * 0.2 * 100) / 100;
  return { id, description, descriptionDetail, quantity: 1, unitPrice, vatAmount, total: unitPrice + vatAmount };
}

export const FINANCE_DOCUMENTS: FinanceDocumentDetail[] = [
  doc({
    id: "fin-001",
    type: "invoice",
    invoiceNumber: "INV-2025-0412",
    paymentMethod: PM.wire,
    issueDate: "2025-03-25",
    dueDate: "2025-04-25",
    totalAmountUsd: 3571.04,
    balanceDue: 3571.04,
    settledAmount: 0,
    currentStatus: STATUS.issued,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-001-1", "Round Diamond 1.02ct E VS1", "Natural diamond · GIA #2251234567", 2975.87),
    ],
  }),
  doc({
    id: "fin-002",
    type: "invoice",
    invoiceNumber: "INV-2025-0389",
    paymentMethod: PM.wire,
    issueDate: "2025-03-22",
    dueDate: "2025-04-22",
    totalAmountUsd: 2868.0,
    balanceDue: 1434.0,
    settledAmount: 1434.0,
    currentStatus: STATUS.partial,
    itemCount: 2,
    ledgerEntries: [],
    lineItems: [
      li("li-002-1", "Princess Diamond 0.71ct F VS2", "Natural diamond · GIA #2251234890", 1195.0),
      li("li-002-2", "Oval Diamond 0.80ct G VVS2", "Natural diamond · IGI #LG45678901", 1195.0),
    ],
  }),
  doc({
    id: "fin-003",
    type: "invoice",
    invoiceNumber: "INV-2025-0355",
    paymentMethod: PM.card,
    issueDate: "2025-03-19",
    dueDate: "2025-04-19",
    totalAmountUsd: 10230.0,
    balanceDue: 0,
    settledAmount: 10230.0,
    currentStatus: STATUS.paid,
    itemCount: 3,
    ledgerEntries: [],
    lineItems: [
      li("li-003-1", "Emerald Diamond 1.50ct D VVS1", "Natural diamond · GIA #2251239876", 3500.0),
      li("li-003-2", "Cushion Diamond 1.21ct E VS1", "Natural diamond · GIA #2251235432", 3000.0),
      li("li-003-3", "Pear Diamond 0.90ct F VS2", "Natural diamond · IGI #LG98765432", 2025.0),
    ],
  }),
  doc({
    id: "fin-004",
    type: "invoice",
    invoiceNumber: "INV-2025-0334",
    paymentMethod: PM.terms,
    issueDate: "2025-03-11",
    dueDate: "2025-03-25",
    totalAmountUsd: 3571.04,
    balanceDue: 3571.04,
    settledAmount: 0,
    currentStatus: STATUS.overdue,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-004-1", "Round Diamond 1.01ct E VS1", "Natural diamond · GIA #2251237654", 2975.87),
    ],
  }),
  doc({
    id: "fin-005",
    type: "invoice",
    invoiceNumber: "INV-2025-0298",
    paymentMethod: PM.wire,
    issueDate: "2025-03-02",
    dueDate: "2025-03-16",
    totalAmountUsd: 6810.0,
    balanceDue: 0,
    settledAmount: 6810.0,
    currentStatus: STATUS.paid,
    itemCount: 2,
    ledgerEntries: [],
    lineItems: [
      li("li-005-1", "Radiant Diamond 1.30ct D VS1", "Natural diamond · GIA #2251231234", 3000.0),
      li("li-005-2", "Marquise Diamond 1.05ct E VVS2", "Natural diamond · GIA #2251238765", 2675.0),
    ],
  }),
  doc({
    id: "fin-006",
    type: "invoice",
    invoiceNumber: "INV-2025-0456",
    paymentMethod: PM.card,
    issueDate: "2025-03-28",
    dueDate: "2025-04-28",
    totalAmountUsd: 45890.0,
    balanceDue: 45890.0,
    settledAmount: 0,
    currentStatus: STATUS.issued,
    itemCount: 5,
    ledgerEntries: [],
    lineItems: [
      li("li-006-1", "Round Diamond 2.01ct D IF", "Natural diamond · GIA #2251240001", 10000.0),
      li("li-006-2", "Oval Diamond 1.82ct D VVS1", "Natural diamond · GIA #2251240002", 9000.0),
      li("li-006-3", "Emerald Diamond 1.75ct E VVS2", "Natural diamond · GIA #2251240003", 8000.0),
      li("li-006-4", "Cushion Diamond 1.55ct E VS1", "Natural diamond · GIA #2251240004", 6075.0),
      li("li-006-5", "Asscher Diamond 1.40ct F VS2", "Natural diamond · GIA #2251240005", 5166.67),
    ],
  }),
  doc({
    id: "fin-007",
    type: "invoice",
    invoiceNumber: "INV-2025-0267",
    paymentMethod: PM.terms,
    issueDate: "2025-02-15",
    dueDate: "2025-03-15",
    totalAmountUsd: 7500.0,
    balanceDue: 0,
    settledAmount: 7500.0,
    currentStatus: STATUS.paid,
    itemCount: 2,
    ledgerEntries: [],
    lineItems: [
      li("li-007-1", "Round Diamond 1.50ct E VS2", "Natural diamond · GIA #2251243210", 3750.0),
      li("li-007-2", "Oval Diamond 1.10ct F VVS1", "Natural diamond · GIA #2251246543", 2500.0),
    ],
  }),
  doc({
    id: "fin-008",
    type: "invoice",
    invoiceNumber: "INV-2025-0478",
    paymentMethod: PM.wire,
    issueDate: "2025-03-30",
    dueDate: "2025-04-30",
    totalAmountUsd: 1250.0,
    balanceDue: 625.0,
    settledAmount: 625.0,
    currentStatus: STATUS.partial,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-008-1", "Round Lab Diamond 0.75ct E VS1", "Lab grown diamond · IGI #LG56789012", 1041.67),
    ],
  }),
  doc({
    id: "fin-009",
    type: "invoice",
    invoiceNumber: "INV-2025-0201",
    paymentMethod: PM.card,
    issueDate: "2025-01-28",
    dueDate: "2025-02-28",
    totalAmountUsd: 4200.0,
    balanceDue: 4200.0,
    settledAmount: 0,
    currentStatus: STATUS.overdue,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-009-1", "Round Diamond 1.20ct D VS2", "Natural diamond · GIA #2251249876", 3500.0),
    ],
  }),
  doc({
    id: "fin-010",
    type: "invoice",
    invoiceNumber: "INV-2025-0490",
    paymentMethod: PM.terms,
    issueDate: "2025-03-31",
    dueDate: "2025-04-30",
    totalAmountUsd: 890.0,
    balanceDue: 0,
    settledAmount: 890.0,
    currentStatus: STATUS.cancelled,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-010-1", "Princess Lab Diamond 0.55ct G VS1", "Lab grown diamond · IGI #LG34567890", 741.67),
    ],
  }),
  doc({
    id: "fin-011",
    type: "credit_note",
    invoiceNumber: "CN-2025-0001",
    paymentMethod: PM.wire,
    issueDate: "2025-03-20",
    dueDate: "2025-04-20",
    totalAmountUsd: 2500.0,
    balanceDue: 2500.0,
    settledAmount: 0,
    currentStatus: STATUS.issued,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-011-1", "Oval Diamond 0.85ct F VS1 — Return", "Natural diamond · GIA #2251234890 · Ref INV-2025-0389", 2083.33),
    ],
  }),
  doc({
    id: "fin-012",
    type: "credit_note",
    invoiceNumber: "CN-2025-0002",
    paymentMethod: PM.card,
    issueDate: "2025-03-10",
    dueDate: "2025-04-10",
    totalAmountUsd: 1800.0,
    balanceDue: 900.0,
    settledAmount: 900.0,
    currentStatus: STATUS.partial,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-012-1", "Pear Diamond 0.90ct F VS2 — Return", "Natural diamond · IGI #LG98765432 · Ref INV-2025-0355", 1500.0),
    ],
  }),
  doc({
    id: "fin-013",
    type: "credit_note",
    invoiceNumber: "CN-2025-0003",
    paymentMethod: PM.wire,
    issueDate: "2025-02-28",
    dueDate: "2025-03-28",
    totalAmountUsd: 5400.0,
    balanceDue: 0,
    settledAmount: 5400.0,
    currentStatus: STATUS.paid,
    itemCount: 2,
    ledgerEntries: [],
    lineItems: [
      li("li-013-1", "Radiant Diamond 1.30ct D VS1 — Return", "Natural diamond · GIA #2251231234 · Ref INV-2025-0298", 2500.0),
      li("li-013-2", "Marquise Diamond 1.05ct E VVS2 — Return", "Natural diamond · GIA #2251238765 · Ref INV-2025-0298", 2000.0),
    ],
  }),
  doc({
    id: "fin-014",
    type: "credit_note",
    invoiceNumber: "CN-2025-0004",
    paymentMethod: PM.terms,
    issueDate: "2025-03-15",
    dueDate: "2025-04-15",
    totalAmountUsd: 3200.0,
    balanceDue: 3200.0,
    settledAmount: 0,
    currentStatus: STATUS.issued,
    itemCount: 1,
    ledgerEntries: [],
    lineItems: [
      li("li-014-1", "Emerald Diamond 1.50ct D VVS1 — Return", "Natural diamond · GIA #2251239876 · Ref INV-2025-0355", 2666.67),
    ],
  }),
];

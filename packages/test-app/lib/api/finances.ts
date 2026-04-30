import { FINANCE_DOCUMENTS } from "@/fixtures/finances";
import { simulateLatency } from "./_simulate";
import type {
  FinanceDocument,
  FinanceDocumentDetail,
  FinanceSummary,
  FinanceLineItem,
  FinanceHistoryEvent,
  FinanceHistoryEventType,
} from "@/fixtures/types/finance";

export type {
  FinanceDocument,
  FinanceDocumentDetail,
  FinanceSummary,
  FinanceLineItem,
  FinanceHistoryEvent,
  FinanceHistoryEventType,
};

// ---------------------------------------------------------------------------
// Pure helpers (preserved — consumed by views directly)
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchFinanceDocuments(): Promise<FinanceDocument[]> {
  await simulateLatency();
  return FINANCE_DOCUMENTS;
}

export async function fetchFinanceDocument(
  id: string,
): Promise<FinanceDocumentDetail | null> {
  await simulateLatency();
  return FINANCE_DOCUMENTS.find((d) => d.id === id) ?? null;
}

import { FINANCE_DOCUMENTS } from "@/fixtures/finances";
import { simulateLatency } from "./_simulate";
import type { LedgerEntry } from "@/fixtures/types/finance";

export type { LedgerEntry };

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentMethod: { id: string; value: string };
  issueDate: string;
  dueDate: string;
  totalAmountUsd: number;
  currentStatus: { id: string; value: string } | null;
  ledgerEntries: LedgerEntry[];
}

export async function fetchInvoiceList(_userId: string): Promise<Invoice[]> {
  await simulateLatency();
  return FINANCE_DOCUMENTS.filter((d) => d.type === "invoice").map((d) => ({
    id: d.id,
    invoiceNumber: d.invoiceNumber,
    paymentMethod: d.paymentMethod,
    issueDate: d.issueDate,
    dueDate: d.dueDate,
    totalAmountUsd: d.totalAmountUsd,
    currentStatus: d.currentStatus,
    ledgerEntries: d.ledgerEntries,
  }));
}

export async function fetchInvoice(
  invoiceId: string,
  _userId: string,
): Promise<Invoice | undefined> {
  await simulateLatency();
  const doc = FINANCE_DOCUMENTS.find(
    (d) => d.id === invoiceId && d.type === "invoice",
  );
  if (!doc) return undefined;
  return {
    id: doc.id,
    invoiceNumber: doc.invoiceNumber,
    paymentMethod: doc.paymentMethod,
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    totalAmountUsd: doc.totalAmountUsd,
    currentStatus: doc.currentStatus,
    ledgerEntries: doc.ledgerEntries,
  };
}

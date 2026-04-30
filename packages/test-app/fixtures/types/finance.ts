export interface LedgerEntry {
  id: string;
  type: { id: string; value: string };
  orderId: string | null;
  description: string;
  amountUsd: number;
  occurredAt: string;
  exchangeRates: {
    currency: { id: string; value: string };
    rate: number;
  }[];
}

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

export interface FinanceDocument {
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
}

export interface FinanceSummary {
  totalUnpaid: { amount: number; invoiceCount: number; currencyCount: number };
  totalOverdue: { amount: number; invoiceCount: number; lateFees: number };
  availableCredit: { amount: number; used: number; limit: number };
}

export interface FinanceLineItem {
  id: string;
  description: string;
  descriptionDetail: string;
  quantity: number;
  unitPrice: number;
  vatAmount: number;
  total: number;
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
  | "credit_note_fully_allocated";

export interface FinanceHistoryEvent {
  id: string;
  type: FinanceHistoryEventType;
  description: string;
  occurredAt: string;
}

export type FinanceDocumentDetail = FinanceDocument & {
  lineItems: FinanceLineItem[];
  historyEvents: FinanceHistoryEvent[];
  subtotal: number;
  vatTotal: number;
  shippingAndFees: number;
};

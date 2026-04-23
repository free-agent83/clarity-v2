import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { invoices } from "@/db/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchInvoiceList(userId: string): Promise<Invoice[]> {
  const rows = await db.query.invoices.findMany({
    where: eq(invoices.userId, userId),
    with: {
      paymentMethod: true,
      currentStatusRef: true,
      ledgerEntries: {
        with: {
          ledgerEntryType: true,
          exchangeRates: { with: { currency: true } },
        },
      },
    },
  });

  return rows.map(mapRow);
}

export async function fetchInvoice(
  invoiceId: string,
  userId: string,
): Promise<Invoice | undefined> {
  const row = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      paymentMethod: true,
      currentStatusRef: true,
      ledgerEntries: {
        with: {
          ledgerEntryType: true,
          exchangeRates: { with: { currency: true } },
        },
      },
    },
  });

  if (!row || row.userId !== userId) return undefined;

  return mapRow(row);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

type InvoiceRow = Awaited<
  ReturnType<
    typeof db.query.invoices.findMany<{
      with: {
        paymentMethod: true;
        currentStatusRef: true;
        ledgerEntries: {
          with: {
            ledgerEntryType: true;
            exchangeRates: { with: { currency: true } };
          };
        };
      };
    }>
  >
>[number];

function mapRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    paymentMethod: {
      id: row.paymentMethod?.id ?? "",
      value: row.paymentMethod?.value ?? "Unknown",
    },
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    totalAmountUsd: Number(row.totalAmountUsd),
    currentStatus: row.currentStatusRef
      ? { id: row.currentStatusRef.id, value: row.currentStatusRef.value }
      : null,
    ledgerEntries: (row.ledgerEntries ?? []).map((le) => ({
      id: le.id,
      type: {
        id: le.ledgerEntryType?.id ?? "",
        value: le.ledgerEntryType?.value ?? "Unknown",
      },
      orderId: le.orderId,
      description: le.description,
      amountUsd: Number(le.amountUsd),
      occurredAt: le.occurredAt.toISOString(),
      exchangeRates: (le.exchangeRates ?? []).map((er) => ({
        currency: {
          id: er.currency?.id ?? "",
          value: er.currency?.value ?? "Unknown",
        },
        rate: Number(er.rate),
      })),
    })),
  };
}

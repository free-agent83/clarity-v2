import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { invoices, ledgerEntries, ledgerEntryExchangeRates } from "@/db/schema";
import type { PaginatedResult } from "@/lib/api/helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminInvoiceListItem {
  id: string;
  invoiceNumber: string;
  userName: string;
  userId: string;
  status: string | null;
  totalAmountUsd: number;
  issueDate: string;
  dueDate: string;
}

export interface AdminInvoiceLedgerEntry {
  id: string;
  ledgerEntryTypeId: string;
  orderId: string | null;
  description: string;
  amountUsd: number;
  occurredAt: string;
}

export interface AdminInvoiceDetail {
  id: string;
  invoiceNumber: string;
  userId: string;
  paymentMethodId: string;
  statusId: string | null;
  totalAmountUsd: number;
  issueDate: string;
  dueDate: string;
  ledgerEntries: AdminInvoiceLedgerEntry[];
}

export interface CreateInvoiceInput {
  userId: string;
  invoiceNumber: string;
  paymentMethodId: string;
  statusId?: string;
  totalAmountUsd: number;
  issueDate: string;
  dueDate: string;
  ledgerEntries?: {
    ledgerEntryTypeId: string;
    orderId?: string;
    description: string;
    amountUsd: number;
    occurredAt: string;
  }[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

// ---------------------------------------------------------------------------
// fetchAdminInvoiceList
// ---------------------------------------------------------------------------

export async function fetchAdminInvoiceList(options: {
  page: number;
  perPage: number;
  search?: string;
  statusId?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminInvoiceListItem>> {
  const { page, perPage, search, statusId, userId } = options;

  const rows = await db.query.invoices.findMany({
    with: {
      user: true,
      currentStatusRef: true,
    },
  });

  let allItems: AdminInvoiceListItem[] = rows.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    userName: row.user?.name ?? row.user?.email ?? "",
    userId: row.userId,
    status: row.currentStatusRef?.value ?? null,
    totalAmountUsd: Number(row.totalAmountUsd),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
  }));

  // Apply filters
  if (userId) {
    allItems = allItems.filter((item) => item.userId === userId);
  }

  if (statusId) {
    const matchingIds = new Set(
      rows.filter((r) => r.currentStatus === statusId).map((r) => r.id),
    );
    allItems = allItems.filter((item) => matchingIds.has(item.id));
  }

  if (search) {
    const lower = search.toLowerCase();
    allItems = allItems.filter(
      (item) =>
        item.invoiceNumber.toLowerCase().includes(lower) ||
        item.userName.toLowerCase().includes(lower),
    );
  }

  // Sort by dueDate descending
  allItems.sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  );

  // Manual pagination
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const items = allItems.slice(startIndex, startIndex + perPage);

  return { items, totalItems, totalPages, currentPage, perPage };
}

// ---------------------------------------------------------------------------
// fetchAdminInvoice
// ---------------------------------------------------------------------------

export async function fetchAdminInvoice(
  invoiceId: string,
): Promise<AdminInvoiceDetail | undefined> {
  const row = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      ledgerEntries: true,
    },
  });

  if (!row) return undefined;

  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    userId: row.userId,
    paymentMethodId: row.paymentMethodId,
    statusId: row.currentStatus ?? null,
    totalAmountUsd: Number(row.totalAmountUsd),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    ledgerEntries: (row.ledgerEntries ?? []).map((e) => ({
      id: e.id,
      ledgerEntryTypeId: e.ledgerEntryTypeId,
      orderId: e.orderId ?? null,
      description: e.description,
      amountUsd: Number(e.amountUsd),
      occurredAt: e.occurredAt.toISOString(),
    })),
  };
}

// ---------------------------------------------------------------------------
// createAdminInvoice
// ---------------------------------------------------------------------------

export async function createAdminInvoice(
  input: CreateInvoiceInput,
): Promise<{ id: string }> {
  const [invoice] = await db
    .insert(invoices)
    .values({
      userId: input.userId,
      invoiceNumber: input.invoiceNumber,
      paymentMethodId: input.paymentMethodId,
      currentStatus: input.statusId ?? null,
      totalAmountUsd: String(input.totalAmountUsd),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
    })
    .returning({ id: invoices.id });

  if (input.ledgerEntries && input.ledgerEntries.length > 0) {
    await db.insert(ledgerEntries).values(
      input.ledgerEntries.map((e) => ({
        invoiceId: invoice.id,
        ledgerEntryTypeId: e.ledgerEntryTypeId,
        orderId: e.orderId ?? null,
        description: e.description,
        amountUsd: String(e.amountUsd),
        occurredAt: new Date(e.occurredAt),
      })),
    );
  }

  return { id: invoice.id };
}

// ---------------------------------------------------------------------------
// updateAdminInvoice
// ---------------------------------------------------------------------------

export async function updateAdminInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput,
): Promise<void> {
  type InvoiceUpdate = typeof invoices.$inferInsert;

  const updateFields: Partial<InvoiceUpdate> = {};

  if (input.userId !== undefined) updateFields.userId = input.userId;
  if (input.invoiceNumber !== undefined)
    updateFields.invoiceNumber = input.invoiceNumber;
  if (input.paymentMethodId !== undefined)
    updateFields.paymentMethodId = input.paymentMethodId;
  if (input.statusId !== undefined)
    updateFields.currentStatus = input.statusId ?? null;
  if (input.totalAmountUsd !== undefined)
    updateFields.totalAmountUsd = String(input.totalAmountUsd);
  if (input.issueDate !== undefined) updateFields.issueDate = input.issueDate;
  if (input.dueDate !== undefined) updateFields.dueDate = input.dueDate;

  if (Object.keys(updateFields).length > 0) {
    await db
      .update(invoices)
      .set(updateFields)
      .where(eq(invoices.id, invoiceId));
  }

  // If ledgerEntries provided: replace entirely
  if (input.ledgerEntries !== undefined) {
    // Get existing entry IDs to delete exchange rates first
    const existingEntries = await db
      .select({ id: ledgerEntries.id })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.invoiceId, invoiceId));

    if (existingEntries.length > 0) {
      const entryIds = existingEntries.map((e) => e.id);
      await db
        .delete(ledgerEntryExchangeRates)
        .where(inArray(ledgerEntryExchangeRates.ledgerEntryId, entryIds));
    }

    await db
      .delete(ledgerEntries)
      .where(eq(ledgerEntries.invoiceId, invoiceId));

    if (input.ledgerEntries.length > 0) {
      await db.insert(ledgerEntries).values(
        input.ledgerEntries.map((e) => ({
          invoiceId,
          ledgerEntryTypeId: e.ledgerEntryTypeId,
          orderId: e.orderId ?? null,
          description: e.description,
          amountUsd: String(e.amountUsd),
          occurredAt: new Date(e.occurredAt),
        })),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// deleteAdminInvoice
// ---------------------------------------------------------------------------

export async function deleteAdminInvoice(invoiceId: string): Promise<void> {
  // Get all ledger entry IDs for this invoice
  const entries = await db
    .select({ id: ledgerEntries.id })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.invoiceId, invoiceId));

  // Delete exchange rates per entry
  if (entries.length > 0) {
    const entryIds = entries.map((e) => e.id);
    await db
      .delete(ledgerEntryExchangeRates)
      .where(inArray(ledgerEntryExchangeRates.ledgerEntryId, entryIds));
  }

  // Delete ledger entries
  await db.delete(ledgerEntries).where(eq(ledgerEntries.invoiceId, invoiceId));

  // Delete invoice
  await db.delete(invoices).where(eq(invoices.id, invoiceId));
}

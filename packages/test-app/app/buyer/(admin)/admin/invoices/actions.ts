"use server";

import {
  fetchAdminInvoiceList,
  fetchAdminInvoice,
  createAdminInvoice,
  updateAdminInvoice,
  deleteAdminInvoice,
} from "@/lib/api/admin/invoices";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  AdminInvoiceListItem,
} from "@/lib/api/admin/invoices";
import type { PaginatedResult } from "@/lib/api/helpers";

export async function getAdminInvoices(options: {
  page: number;
  perPage: number;
  search?: string;
  statusId?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminInvoiceListItem>> {
  return fetchAdminInvoiceList(options);
}

export async function getAdminInvoice(id: string) {
  return fetchAdminInvoice(id);
}

export async function saveAdminInvoice(input: CreateInvoiceInput) {
  return createAdminInvoice(input);
}

export async function editAdminInvoice(id: string, input: UpdateInvoiceInput) {
  return updateAdminInvoice(id, input);
}

export async function removeAdminInvoice(id: string) {
  return deleteAdminInvoice(id);
}

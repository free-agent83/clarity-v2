"use server";

import {
  fetchAdminShortlistList,
  fetchAdminShortlist,
  createAdminShortlist,
  updateAdminShortlist,
  deleteAdminShortlist,
} from "@/lib/api/admin/shortlists";
import type {
  CreateShortlistInput,
  UpdateShortlistInput,
  AdminShortlistListItem,
} from "@/lib/api/admin/shortlists";
import type { PaginatedResult } from "@/lib/api/helpers";

export async function getAdminShortlists(options: {
  page: number;
  perPage: number;
  search?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminShortlistListItem>> {
  return fetchAdminShortlistList(options);
}

export async function getAdminShortlist(id: string) {
  return fetchAdminShortlist(id);
}

export async function saveAdminShortlist(input: CreateShortlistInput) {
  return createAdminShortlist(input);
}

export async function editAdminShortlist(
  id: string,
  input: UpdateShortlistInput,
) {
  return updateAdminShortlist(id, input);
}

export async function removeAdminShortlist(id: string) {
  return deleteAdminShortlist(id);
}

"use client";

import * as React from "react";
import { AdminListPage } from "@/components/admin/admin-list-page";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { InvoiceModal } from "@/components/admin/invoices/invoice-modal";
import { Badge } from "@/components/ui/badge";
import {
  getAdminInvoices,
  getAdminInvoice,
  saveAdminInvoice,
  editAdminInvoice,
  removeAdminInvoice,
} from "@/app/buyer/(admin)/admin/invoices/actions";
import { formatUSD } from "@/lib/utils";
import type { PaginatedResult } from "@/lib/api/helpers";
import type {
  AdminInvoiceListItem,
  AdminInvoiceDetail,
  CreateInvoiceInput,
} from "@/lib/api/admin/invoices";
import type { AllLookups } from "@/lib/api/admin/lookups";
import type { AdminUserItem } from "@/lib/api/admin/users";

interface InvoicesListProps {
  initialData: PaginatedResult<AdminInvoiceListItem>;
  lookups: AllLookups;
  users: AdminUserItem[];
  defaultUserId?: string;
}

const columns = [
  {
    header: "Invoice #",
    accessorKey: "invoiceNumber" as const,
  },
  {
    header: "User",
    accessorKey: "userName" as const,
  },
  {
    header: "Status",
    cell: (row: AdminInvoiceListItem) =>
      row.status ? <Badge variant="secondary">{row.status}</Badge> : "—",
  },
  {
    header: "Amount",
    cell: (row: AdminInvoiceListItem) => formatUSD(row.totalAmountUsd),
    className: "text-right",
  },
  {
    header: "Issue Date",
    accessorKey: "issueDate" as const,
  },
  {
    header: "Due Date",
    accessorKey: "dueDate" as const,
  },
];

export function InvoicesList({
  initialData,
  lookups,
  users,
  defaultUserId,
}: InvoicesListProps) {
  const [data, setData] =
    React.useState<PaginatedResult<AdminInvoiceListItem>>(initialData);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] =
    React.useState<AdminInvoiceDetail | null>(null);
  const [deletingInvoice, setDeletingInvoice] =
    React.useState<AdminInvoiceListItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function refreshData(page?: number) {
    const result = await getAdminInvoices({
      page: page ?? data.currentPage,
      perPage: data.perPage,
      search: search || undefined,
      statusId: statusFilter || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    const result = await getAdminInvoices({
      page: 1,
      perPage: data.perPage,
      search: value || undefined,
      statusId: statusFilter || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleFilterChange(key: string, value: string) {
    const nextStatus = key === "statusId" ? value : statusFilter;
    const nextUser = key === "userId" ? value : userFilter;

    if (key === "statusId") setStatusFilter(value);
    if (key === "userId") setUserFilter(value);

    const result = await getAdminInvoices({
      page: 1,
      perPage: data.perPage,
      search: search || undefined,
      statusId: nextStatus || undefined,
      userId: nextUser || undefined,
    });
    setData(result);
  }

  async function handlePageChange(page: number) {
    const result = await getAdminInvoices({
      page,
      perPage: data.perPage,
      search: search || undefined,
      statusId: statusFilter || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleEdit(row: AdminInvoiceListItem) {
    const detail = await getAdminInvoice(row.id);
    if (detail) {
      setEditingInvoice(detail);
    }
  }

  async function handleSave(input: CreateInvoiceInput) {
    if (editingInvoice) {
      await editAdminInvoice(editingInvoice.id, input);
      setEditingInvoice(null);
    } else {
      await saveAdminInvoice(input);
      setIsCreateOpen(false);
    }
    await refreshData();
  }

  async function handleDelete() {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      await removeAdminInvoice(deletingInvoice.id);
      setDeletingInvoice(null);
      await refreshData();
    } finally {
      setIsDeleting(false);
    }
  }

  const statusFilterOptions = [
    { label: "All statuses", value: "" },
    ...lookups.invoiceStatuses.map((s) => ({ label: s.value, value: s.id })),
  ];

  const userFilterOptions = [
    { label: "All users", value: "" },
    ...users.map((u) => ({ label: u.name ?? u.email, value: u.id })),
  ];

  return (
    <>
      <AdminListPage
        title="Invoices"
        searchValue={search}
        onSearchChange={handleSearch}
        onCreateClick={() => setIsCreateOpen(true)}
        filters={[
          {
            label: "Status",
            value: "statusId",
            options: statusFilterOptions,
          },
          {
            label: "User",
            value: "userId",
            options: userFilterOptions,
          },
        ]}
        filterValues={{ statusId: statusFilter, userId: userFilter }}
        onFilterChange={handleFilterChange}
        totalItems={data.totalItems}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        perPage={data.perPage}
        onPageChange={handlePageChange}
      >
        <AdminDataTable
          columns={columns}
          data={data.items}
          onEdit={handleEdit}
          onDelete={(row) => setDeletingInvoice(row)}
        />
      </AdminListPage>

      {/* Create Modal */}
      <InvoiceModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        users={users}
        paymentMethods={lookups.paymentMethods}
        invoiceStatuses={lookups.invoiceStatuses}
        ledgerEntryTypes={lookups.ledgerEntryTypes}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Edit Modal */}
      <InvoiceModal
        open={editingInvoice !== null}
        onOpenChange={(open) => {
          if (!open) setEditingInvoice(null);
        }}
        invoice={editingInvoice ?? undefined}
        users={users}
        paymentMethods={lookups.paymentMethods}
        invoiceStatuses={lookups.invoiceStatuses}
        ledgerEntryTypes={lookups.ledgerEntryTypes}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deletingInvoice !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingInvoice(null);
        }}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${deletingInvoice?.invoiceNumber ?? ""}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}

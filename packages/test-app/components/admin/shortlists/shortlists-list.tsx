"use client";

import * as React from "react";
import { AdminListPage } from "@/components/admin/admin-list-page";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ShortlistModal } from "@/components/admin/shortlists/shortlist-modal";
import {
  getAdminShortlists,
  getAdminShortlist,
  saveAdminShortlist,
  editAdminShortlist,
  removeAdminShortlist,
} from "@/app/buyer/(admin)/admin/shortlists/actions";
import type { PaginatedResult } from "@/lib/api/helpers";
import type {
  AdminShortlistListItem,
  AdminShortlistDetail,
  CreateShortlistInput,
} from "@/lib/api/admin/shortlists";
import type { AdminUserItem } from "@/lib/api/admin/users";
import type { ProductOption } from "@/components/admin/product-combobox";

interface ShortlistsListProps {
  initialData: PaginatedResult<AdminShortlistListItem>;
  users: AdminUserItem[];
  products: ProductOption[];
  defaultUserId?: string;
}

const columns = [
  {
    header: "Name",
    accessorKey: "name" as const,
  },
  {
    header: "User",
    accessorKey: "userName" as const,
  },
  {
    header: "Items",
    accessorKey: "itemCount" as const,
    className: "text-center",
  },
  {
    header: "Created",
    accessorKey: "createdAt" as const,
  },
];

export function ShortlistsList({
  initialData,
  users,
  products,
  defaultUserId,
}: ShortlistsListProps) {
  const [data, setData] =
    React.useState<PaginatedResult<AdminShortlistListItem>>(initialData);
  const [search, setSearch] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingShortlist, setEditingShortlist] =
    React.useState<AdminShortlistDetail | null>(null);
  const [deletingShortlist, setDeletingShortlist] =
    React.useState<AdminShortlistListItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function refreshData(page?: number) {
    const result = await getAdminShortlists({
      page: page ?? data.currentPage,
      perPage: data.perPage,
      search: search || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    const result = await getAdminShortlists({
      page: 1,
      perPage: data.perPage,
      search: value || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleFilterChange(key: string, value: string) {
    if (key === "userId") {
      const nextUserId = value === "all" ? "" : value;
      setUserFilter(nextUserId);
      const result = await getAdminShortlists({
        page: 1,
        perPage: data.perPage,
        search: search || undefined,
        userId: nextUserId || undefined,
      });
      setData(result);
    }
  }

  async function handlePageChange(page: number) {
    const result = await getAdminShortlists({
      page,
      perPage: data.perPage,
      search: search || undefined,
      userId: userFilter || undefined,
    });
    setData(result);
  }

  async function handleEdit(row: AdminShortlistListItem) {
    const detail = await getAdminShortlist(row.id);
    if (detail) {
      setEditingShortlist(detail);
    }
  }

  async function handleSave(input: CreateShortlistInput) {
    if (editingShortlist) {
      await editAdminShortlist(editingShortlist.id, input);
      setEditingShortlist(null);
    } else {
      await saveAdminShortlist(input);
      setIsCreateOpen(false);
    }
    await refreshData();
  }

  async function handleDelete() {
    if (!deletingShortlist) return;
    setIsDeleting(true);
    try {
      await removeAdminShortlist(deletingShortlist.id);
      setDeletingShortlist(null);
      await refreshData();
    } finally {
      setIsDeleting(false);
    }
  }

  const userFilterOptions = [
    { label: "All users", value: "all" },
    ...users.map((u) => ({ label: u.name ?? u.email, value: u.id })),
  ];

  return (
    <>
      <AdminListPage
        title="Shortlists"
        searchValue={search}
        onSearchChange={handleSearch}
        onCreateClick={() => setIsCreateOpen(true)}
        filters={[
          {
            label: "User",
            value: "userId",
            options: userFilterOptions,
          },
        ]}
        filterValues={{ userId: userFilter || "all" }}
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
          onDelete={(row) => setDeletingShortlist(row)}
        />
      </AdminListPage>

      {/* Create Modal */}
      <ShortlistModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        users={users}
        products={products}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Edit Modal */}
      <ShortlistModal
        open={editingShortlist !== null}
        onOpenChange={(open) => {
          if (!open) setEditingShortlist(null);
        }}
        shortlist={editingShortlist ?? undefined}
        users={users}
        products={products}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deletingShortlist !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingShortlist(null);
        }}
        title="Delete Shortlist"
        description={`Are you sure you want to delete shortlist "${deletingShortlist?.name ?? ""}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}

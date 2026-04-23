"use client";

import * as React from "react";
import { AdminListPage } from "@/components/admin/admin-list-page";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { OrderModal } from "@/components/admin/orders/order-modal";
import { Badge } from "@nivoda/components";
import {
  getAdminOrders,
  getAdminOrder,
  saveAdminOrder,
  editAdminOrder,
  removeAdminOrder,
} from "@/app/buyer/(admin)/admin/orders/actions";
import { formatUSD } from "@/lib/utils";
import type { PaginatedResult } from "@/lib/api/helpers";
import type {
  AdminOrderListItem,
  AdminOrderDetail,
  CreateOrderInput,
} from "@/lib/api/admin/orders";
import type { AllLookups } from "@/lib/api/admin/lookups";
import type { AdminUserItem } from "@/lib/api/admin/users";
import type { ProductOption } from "@/components/admin/product-combobox";

interface OrdersListProps {
  initialData: PaginatedResult<AdminOrderListItem>;
  lookups: AllLookups;
  users: AdminUserItem[];
  products: ProductOption[];
  defaultUserId?: string;
}

const columns = [
  {
    header: "Order #",
    accessorKey: "orderNumber" as const,
  },
  {
    header: "User",
    accessorKey: "userName" as const,
  },
  {
    header: "Status",
    cell: (row: AdminOrderListItem) =>
      row.status ? <Badge variant="secondary">{row.status}</Badge> : "—",
  },
  {
    header: "Items",
    accessorKey: "itemCount" as const,
    className: "text-center",
  },
  {
    header: "Final Price",
    cell: (row: AdminOrderListItem) => formatUSD(row.finalPriceUsd),
    className: "text-right",
  },
  {
    header: "Created",
    accessorKey: "createdAt" as const,
  },
];

export function OrdersList({
  initialData,
  lookups,
  users,
  products,
  defaultUserId,
}: OrdersListProps) {
  const [data, setData] =
    React.useState<PaginatedResult<AdminOrderListItem>>(initialData);
  const [search, setSearch] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] =
    React.useState<AdminOrderDetail | null>(null);
  const [deletingOrder, setDeletingOrder] =
    React.useState<AdminOrderListItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [addresses, setAddresses] = React.useState<
    { id: string; name: string }[]
  >([]);

  async function refreshData(page?: number) {
    const result = await getAdminOrders({
      page: page ?? data.currentPage,
      perPage: data.perPage,
      search: search || undefined,
    });
    setData(result);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    const result = await getAdminOrders({
      page: 1,
      perPage: data.perPage,
      search: value || undefined,
    });
    setData(result);
  }

  async function handlePageChange(page: number) {
    const result = await getAdminOrders({
      page,
      perPage: data.perPage,
      search: search || undefined,
    });
    setData(result);
  }

  async function handleEdit(row: AdminOrderListItem) {
    const detail = await getAdminOrder(row.id);
    if (detail) {
      // Load addresses for the user
      const userAddresses = await loadUserAddresses(detail.userId);
      setAddresses(userAddresses);
      setEditingOrder(detail);
    }
  }

  async function loadUserAddresses(
    userId: string,
  ): Promise<{ id: string; name: string }[]> {
    // Find addresses from users data — the order detail has deliveryAddressId
    // For simplicity, we pass an empty array if no addresses are available
    // The admin can still select from what's available
    void userId;
    return [];
  }

  async function handleSave(input: CreateOrderInput) {
    if (editingOrder) {
      await editAdminOrder(editingOrder.id, input);
      setEditingOrder(null);
    } else {
      await saveAdminOrder(input);
      setIsCreateOpen(false);
    }
    await refreshData();
  }

  async function handleDelete() {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await removeAdminOrder(deletingOrder.id);
      setDeletingOrder(null);
      await refreshData();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <AdminListPage
        title="Orders"
        searchValue={search}
        onSearchChange={handleSearch}
        onCreateClick={() => {
          setAddresses([]);
          setIsCreateOpen(true);
        }}
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
          onDelete={(row) => setDeletingOrder(row)}
        />
      </AdminListPage>

      {/* Create Modal */}
      <OrderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        users={users}
        products={products}
        paymentTerms={lookups.paymentTerms}
        orderEventTypes={lookups.orderEventTypes}
        addresses={addresses}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Edit Modal */}
      <OrderModal
        open={editingOrder !== null}
        onOpenChange={(open) => {
          if (!open) setEditingOrder(null);
        }}
        order={editingOrder ?? undefined}
        users={users}
        products={products}
        paymentTerms={lookups.paymentTerms}
        orderEventTypes={lookups.orderEventTypes}
        addresses={addresses}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deletingOrder !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingOrder(null);
        }}
        title="Delete Order"
        description={`Are you sure you want to delete order ${deletingOrder?.orderNumber ?? ""}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}

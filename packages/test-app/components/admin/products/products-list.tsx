"use client";

import * as React from "react";
import { AdminListPage } from "@/components/admin/admin-list-page";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ProductModal } from "@/components/admin/products/product-modal";
import { Badge } from "@/components/ui/badge";
import {
  getAdminProducts,
  saveAdminProduct,
  removeAdminProduct,
} from "@/app/buyer/(admin)/admin/products/actions";
import { formatUSD } from "@/lib/utils";
import type { PaginatedResult } from "@/lib/api/helpers";
import type {
  AdminProductListItem,
  CreateProductInput,
  AdminSupplierItem,
} from "@/lib/api/admin/products";
import type { AllLookups } from "@/lib/api/admin/lookups";

interface ProductsListProps {
  initialData: PaginatedResult<AdminProductListItem>;
  lookups: AllLookups;
  suppliers: AdminSupplierItem[];
}

const columns = [
  {
    header: "Stock ID",
    accessorKey: "stockId" as const,
  },
  {
    header: "Category",
    accessorKey: "category" as const,
  },
  {
    header: "Supplier",
    accessorKey: "supplierName" as const,
  },
  {
    header: "Price",
    cell: (row: AdminProductListItem) => formatUSD(row.priceUsd),
    className: "text-right",
  },
  {
    header: "Status",
    cell: (row: AdminProductListItem) =>
      row.isActive ? (
        <Badge variant="secondary">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      ),
  },
  {
    header: "Created",
    accessorKey: "createdAt" as const,
  },
];

export function ProductsList({
  initialData,
  lookups,
  suppliers,
}: ProductsListProps) {
  const [data, setData] =
    React.useState<PaginatedResult<AdminProductListItem>>(initialData);
  const [search, setSearch] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] =
    React.useState<AdminProductListItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string>
  >({});

  const filters = React.useMemo(
    () => [
      {
        label: "Category",
        value: "categoryId",
        options: [
          { label: "All categories", value: "__all__" },
          ...lookups.productCategories.map((c) => ({
            label: c.value,
            value: c.id,
          })),
        ],
      },
      {
        label: "Status",
        value: "isActive",
        options: [
          { label: "All statuses", value: "__all__" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [lookups.productCategories],
  );

  async function refreshData(page?: number) {
    const categoryId = filterValues.categoryId;
    const isActiveRaw = filterValues.isActive;
    const result = await getAdminProducts({
      page: page ?? data.currentPage,
      perPage: data.perPage,
      search: search || undefined,
      categoryId:
        categoryId && categoryId !== "__all__" ? categoryId : undefined,
      isActive:
        isActiveRaw === "true"
          ? true
          : isActiveRaw === "false"
            ? false
            : undefined,
    });
    setData(result);
  }

  async function handleSearch(value: string) {
    setSearch(value);
    const categoryId = filterValues.categoryId;
    const isActiveRaw = filterValues.isActive;
    const result = await getAdminProducts({
      page: 1,
      perPage: data.perPage,
      search: value || undefined,
      categoryId:
        categoryId && categoryId !== "__all__" ? categoryId : undefined,
      isActive:
        isActiveRaw === "true"
          ? true
          : isActiveRaw === "false"
            ? false
            : undefined,
    });
    setData(result);
  }

  async function handlePageChange(page: number) {
    const categoryId = filterValues.categoryId;
    const isActiveRaw = filterValues.isActive;
    const result = await getAdminProducts({
      page,
      perPage: data.perPage,
      search: search || undefined,
      categoryId:
        categoryId && categoryId !== "__all__" ? categoryId : undefined,
      isActive:
        isActiveRaw === "true"
          ? true
          : isActiveRaw === "false"
            ? false
            : undefined,
    });
    setData(result);
  }

  async function handleFilterChange(key: string, value: string) {
    const updated = { ...filterValues, [key]: value };
    setFilterValues(updated);

    const categoryId = updated.categoryId;
    const isActiveRaw = updated.isActive;
    const result = await getAdminProducts({
      page: 1,
      perPage: data.perPage,
      search: search || undefined,
      categoryId:
        categoryId && categoryId !== "__all__" ? categoryId : undefined,
      isActive:
        isActiveRaw === "true"
          ? true
          : isActiveRaw === "false"
            ? false
            : undefined,
    });
    setData(result);
  }

  async function handleSave(input: CreateProductInput) {
    await saveAdminProduct(input);
    setIsCreateOpen(false);
    await refreshData();
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await removeAdminProduct(deletingProduct.id);
      setDeletingProduct(null);
      await refreshData();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <AdminListPage
        title="Products"
        searchValue={search}
        onSearchChange={handleSearch}
        onCreateClick={() => setIsCreateOpen(true)}
        filters={filters}
        filterValues={filterValues}
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
          onDelete={(row) => setDeletingProduct(row)}
        />
      </AdminListPage>

      {/* Create Modal */}
      <ProductModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        lookups={lookups}
        suppliers={suppliers}
        onSave={handleSave}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deletingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete product ${deletingProduct?.stockId ?? ""}? This will also remove it from all orders, shortlists, and carts. This action cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}

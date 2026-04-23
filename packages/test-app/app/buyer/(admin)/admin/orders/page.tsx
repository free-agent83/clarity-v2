import { fetchAdminOrderList } from "@/lib/api/admin/orders";
import { fetchAllLookups } from "@/lib/api/admin/lookups";
import { fetchAllUsers } from "@/lib/api/admin/users";
import { fetchAdminProductOptions } from "@/lib/api/admin/products";
import { OrdersList } from "@/components/admin/orders/orders-list";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 20;

  const [data, lookups, users, products] = await Promise.all([
    fetchAdminOrderList({ page, perPage }),
    fetchAllLookups(),
    fetchAllUsers(),
    fetchAdminProductOptions(),
  ]);

  return (
    <OrdersList
      initialData={data}
      lookups={lookups}
      users={users}
      products={products}
    />
  );
}

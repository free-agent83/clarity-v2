import { fetchAdminProductList } from "@/lib/api/admin/products";
import { fetchAdminSuppliers } from "@/lib/api/admin/products";
import { fetchAllLookups } from "@/lib/api/admin/lookups";
import { ProductsList } from "@/components/admin/products/products-list";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 20;

  const [data, lookups, suppliers] = await Promise.all([
    fetchAdminProductList({ page, perPage }),
    fetchAllLookups(),
    fetchAdminSuppliers(),
  ]);

  return (
    <ProductsList initialData={data} lookups={lookups} suppliers={suppliers} />
  );
}

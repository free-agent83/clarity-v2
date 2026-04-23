import { fetchAdminShortlistList } from "@/lib/api/admin/shortlists";
import { fetchAllUsers } from "@/lib/api/admin/users";
import { fetchAdminProductOptions } from "@/lib/api/admin/products";
import { ShortlistsList } from "@/components/admin/shortlists/shortlists-list";

export default async function AdminShortlistsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 20;

  const [data, users, products] = await Promise.all([
    fetchAdminShortlistList({ page, perPage }),
    fetchAllUsers(),
    fetchAdminProductOptions(),
  ]);

  return (
    <ShortlistsList initialData={data} users={users} products={products} />
  );
}

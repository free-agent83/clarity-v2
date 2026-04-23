import { fetchAdminInvoiceList } from "@/lib/api/admin/invoices";
import { fetchAllLookups } from "@/lib/api/admin/lookups";
import { fetchAllUsers } from "@/lib/api/admin/users";
import { InvoicesList } from "@/components/admin/invoices/invoices-list";

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 20;

  const [data, lookups, users] = await Promise.all([
    fetchAdminInvoiceList({ page, perPage }),
    fetchAllLookups(),
    fetchAllUsers(),
  ]);

  return <InvoicesList initialData={data} lookups={lookups} users={users} />;
}

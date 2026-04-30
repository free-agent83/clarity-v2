import { getCurrentUser } from "@/lib/api/users";
import { fetchAllOrders } from "@/lib/api/orders";
import { Button } from "@nivoda/components";
import { IconUpload } from "@tabler/icons-react";
import { OrdersRealtimeWrapper } from "@/components/orders/orders-realtime-wrapper";
import { checkSimulateError } from "@/lib/api/_simulate";

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
}) {
  const sp = await searchParams;
  checkSimulateError(sp);
  const user = await getCurrentUser();
  const initialOrders = await fetchAllOrders(user.id);

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-medium leading-14 text-foreground">
          Orders
        </h1>
        <Button variant="outline" size="lg">
          <IconUpload className="size-5" />
          Export
        </Button>
      </div>

      {/* Realtime data → Filterable list */}
      <OrdersRealtimeWrapper initialData={initialOrders} />
    </div>
  );
}

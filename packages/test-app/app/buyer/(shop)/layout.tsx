import { getCurrentUser } from "@/lib/api/users";
import { LayoutBase } from "@/components/layouts/layout-base/layout-base";
import { RealtimeShell } from "@/components/realtime-shell";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <RealtimeShell>
      <LayoutBase user={user}>{children}</LayoutBase>
    </RealtimeShell>
  );
}

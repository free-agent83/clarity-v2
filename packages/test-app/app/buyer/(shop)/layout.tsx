import { getCurrentUser } from "@/lib/api/users";
import { LayoutBase } from "@/components/layouts/layout-base/layout-base";
import { RealtimeShell } from "@/components/realtime-shell";
import { UserProvider } from "@/providers/user-provider";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <UserProvider>
      <RealtimeShell>
        <LayoutBase user={user}>{children}</LayoutBase>
      </RealtimeShell>
    </UserProvider>
  );
}

import Link from "next/link";
import { Badge } from "@nivoda/components";
import { UserSwitcher } from "@/components/admin/user-switcher";
import type { AdminUserItem } from "@/lib/api/admin/users";

export function AdminHeader({
  userName,
  users,
  currentUserId,
}: {
  userName: string;
  users: AdminUserItem[];
  currentUserId?: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Link href="/buyer/admin" className="text-lg font-semibold">
          Minivoda
        </Link>
        <Badge variant="secondary">Admin</Badge>
      </div>
      <div className="flex items-center gap-4">
        <UserSwitcher users={users} currentUserId={currentUserId} />
        <span className="text-sm text-muted-foreground">{userName}</span>
      </div>
    </header>
  );
}

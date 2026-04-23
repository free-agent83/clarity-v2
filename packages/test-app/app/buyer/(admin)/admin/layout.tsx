import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/api/users";
import { fetchAllUsers } from "@/lib/api/admin/users";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const role = authUser.app_metadata?.role;
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">403 — Forbidden</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have admin access.
          </p>
        </div>
      </div>
    );
  }

  const [appUser, allUsers] = await Promise.all([
    getCurrentUser(),
    fetchAllUsers(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader
        userName={appUser.name ?? appUser.email}
        users={allUsers}
        currentUserId={appUser.id}
      />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

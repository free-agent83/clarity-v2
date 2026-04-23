"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconListCheck,
  IconHeart,
  IconReceipt2,
  IconDiamond,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Orders", href: "/buyer/admin/orders", icon: IconListCheck },
  { label: "Shortlists", href: "/buyer/admin/shortlists", icon: IconHeart },
  { label: "Invoices", href: "/buyer/admin/invoices", icon: IconReceipt2 },
  { label: "Products", href: "/buyer/admin/products", icon: IconDiamond },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r p-3">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-chart-2/10 text-chart-2"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}

import * as React from "react";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";

import { productCategories } from "@/lib/navigation";

export function CategoriesMenu() {
  return (
    <nav
      className="flex h-22.5 items-center justify-center gap-2 bg-foreground py-4"
      style={
        {
          "--foreground": "oklch(0.147 0.004 49.25)",
          "--background": "oklch(1 0 0)",
        } as React.CSSProperties
      }
    >
      {productCategories.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-3 text-base text-background transition-colors hover:bg-white/10"
        >
          <span>{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-background px-1.5 py-0.5 text-[13px] leading-tight text-[#5620e1]">
              {item.badge}
            </span>
          )}
          {item.hasSubmenu && (
            <IconChevronDown size={16} className="text-background" />
          )}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";
import {
  IconHeart,
  IconHelp,
  IconShoppingCart,
  IconSearch,
} from "@tabler/icons-react";

import type { AppUser } from "@/lib/api/users";
import { CalculatorPopover } from "@/components/shell/calculator-popover";
import { CartButton } from "@/components/shell/cart-button";
import { CurrencySelector } from "@/components/shell/currency-selector";
import { NavSheet } from "@/components/shell/nav-sheet";
import { SearchTrigger } from "@/components/shell/search-trigger";

// Figma-hosted assets (expire 7 days from design export — replace with local files)
const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788";

export function BuyerNav({ user }: { user?: AppUser }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center gap-7 px-4 py-3.5">
        {/* Left: menu + logomark */}
        <div className="flex shrink-0 items-center gap-4">
          <NavSheet user={user} />
          <Link href="/buyer" aria-label="Minivoda Home">
            <img
              src={LOGOMARK}
              alt=""
              className="h-6 w-auto"
              style={{ width: 50.853 }}
            />
          </Link>
        </div>

        {/* Search */}
        <SearchTrigger />

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          <CalculatorPopover />

          <CurrencySelector />

          <Link
            href="/buyer/shortlists"
            className="flex h-11.25 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span>0</span>
            <IconHeart size={20} />
          </Link>

          <CartButton />

          <Link
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-foreground pl-3 pr-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <IconHelp size={20} />
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-left">
              Help
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChevronRight,
  IconExternalLink,
  IconHeart,
  IconHelp,
} from "@tabler/icons-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AppShell,
  AppShellActions,
  AppShellHeader,
  AppShellMain,
  AppShellNavigationSheet,
  Badge,
  Button,
} from "@nivoda/components";

import type { AppUser } from "@/lib/api/users";
import { type NavItem, productCategories } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { COOKIE_NAME } from "@/lib/auth/config";
import { CalculatorPopover } from "@/components/shell/calculator-popover";
import { CartButton } from "@/components/shell/cart-button";
import { CategoriesMenu } from "@/components/shell/categories-menu";
import { CurrencySelector } from "@/components/shell/currency-selector";
import { AppFooter } from "@/components/shell/app-footer";

const SearchDialog = dynamic(
  () => import("@/components/shell/search-dialog").then((m) => m.SearchDialog),
  { ssr: false },
);

function preloadSearchDialog() {
  void import("@/components/shell/search-dialog");
}

type LayoutBaseProps = {
  children: React.ReactNode;
  user?: AppUser;
};

export function LayoutBase({ children, user }: LayoutBaseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search");
  const [searchOpen, setSearchOpen] = React.useState(() => searchParam !== null);
  const [initialQuery, setInitialQuery] = React.useState(() =>
    searchParam !== null && searchParam !== "true" ? searchParam : "",
  );

  // Strip the `?search=` param from the URL once we've consumed it — a pure
  // side-effect on the URL bar, not a state update.
  React.useEffect(() => {
    const param = searchParams.get("search");
    if (param !== null) {
      const url = new URL(window.location.href);
      url.searchParams.delete("search");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  // If a new `?search=` lands after mount, open the dialog with the query.
  React.useEffect(() => {
    const param = searchParams.get("search");
    if (param === null) return;
    const timer = setTimeout(() => {
      setInitialQuery(param === "true" ? "" : param);
      setSearchOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // ⌘K / Ctrl+K global shortcut.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const [confirmSignOutOpen, setConfirmSignOutOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
    window.location.href = "/login";
  }

  return (
    <>
      <AppShell>
        <AppShellHeader
          onSearch={() => setSearchOpen(true)}
          onMouseEnter={preloadSearchDialog}
          onFocus={preloadSearchDialog}
        >
          <AppShellActions>
            <CalculatorPopover />
            <CurrencySelector />
            <Button variant="outline" size="default" asChild>
              <Link href="/buyer/shortlists">
                <span>0</span>
                <IconHeart />
              </Link>
            </Button>
            <CartButton />
            <Button size="default" asChild>
              <Link href="/help" target="_blank" rel="noopener noreferrer">
                <IconHelp />
                Help
              </Link>
            </Button>
          </AppShellActions>
        </AppShellHeader>

        <AppShellNavigationSheet
          title="Navigation"
          heading={
            <span className="text-xl font-bold tracking-tight text-foreground">
              Minivoda
            </span>
          }
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? undefined,
          }}
          onLogout={() => setConfirmSignOutOpen(true)}
        >
          <Button size="lg" block>
            Launch Showroom
            <IconExternalLink />
          </Button>

          <NavSection heading="Browse" items={productCategories} />
        </AppShellNavigationSheet>

        <CategoriesMenu />
        <AppShellMain>{children}</AppShellMain>
        <AppFooter />
      </AppShell>

      <SearchDialog
        key={initialQuery}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialQuery={initialQuery}
      />

      <AlertDialog
        open={confirmSignOutOpen}
        onOpenChange={setConfirmSignOutOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? "Signing out..." : "Sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function NavSection({
  heading,
  items,
}: {
  heading?: string;
  items: NavItem[];
}) {
  return (
    <section className="flex flex-col gap-3">
      {heading ? (
        <h3 className="text-lg font-bold text-foreground">{heading}</h3>
      ) : null}
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </section>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.target}
      className={cn(
        "flex h-12 items-center gap-2 rounded-md px-3 py-2.5 text-sm tracking-wide transition-colors",
        isActive
          ? "bg-muted text-accent-foreground"
          : "text-foreground hover:text-accent-foreground hover:bg-muted",
      )}
    >
      {Icon ? (
        <span className="relative shrink-0">
          <Icon size={20} />
          {item.hasNotification ? (
            <span className="absolute -top-0.5 left-4.5 size-1 rounded-full bg-destructive" />
          ) : null}
        </span>
      ) : null}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <Badge className="bg-accent text-accent-foreground" size="sm">
          {item.badge}
        </Badge>
      ) : null}
      {item.hasChevron ? (
        <IconChevronRight size={20} className="shrink-0 text-muted-foreground" />
      ) : null}
    </Link>
  );
}

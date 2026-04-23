"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChevronRight,
  IconExternalLink,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

import type { AppUser } from "@/lib/api/users";
import {
  type NavItem,
  productCategories,
  myListItems,
  adminItems,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.target}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm tracking-wide transition-colors",
        isActive
          ? "bg-chart-2/10 text-chart-2"
          : "text-foreground hover:bg-muted",
      )}
    >
      {Icon && (
        <span className="relative shrink-0">
          <Icon size={20} />
          {item.hasNotification && (
            <span className="absolute -top-0.5 left-4.5 size-1 rounded-full bg-destructive" />
          )}
        </span>
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Badge
          variant="secondary"
          className="rounded-sm border-transparent bg-chart-2/10 text-chart-2"
        >
          {item.badge}
        </Badge>
      )}
      {item.hasChevron && (
        <IconChevronRight
          size={20}
          className="shrink-0 text-muted-foreground"
        />
      )}
    </Link>
  );
}

export function NavSheet({ user }: { user?: AppUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleLinkClick() {
    setOpen(false);
    window.scrollTo(0, 0);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <IconMenu2 size={20} />
          Menu
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="gap-0 p-0 data-closed:animate-none!"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Minivoda
          </span>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm">
              <IconX size={20} />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 overflow-hidden">
          {/* Launch Showroom */}
          <div className="border-b border-border px-6 py-6">
            <Button className="w-full" size="lg">
              Launch Showroom
              <IconExternalLink size={20} />
            </Button>
          </div>

          {/* Browse section */}
          <div className="border-b border-border px-3 py-6">
            <h3 className="px-3 text-lg font-bold text-foreground">Browse</h3>
            <nav className="mt-3 flex flex-col gap-1">
              {productCategories.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={handleLinkClick}
                />
              ))}
            </nav>
          </div>

          {/* My List section */}
          <div className="border-b border-border px-3 py-6">
            <h3 className="px-3 text-lg font-bold text-foreground">My List</h3>
            <nav className="mt-3 flex flex-col gap-1">
              {myListItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={handleLinkClick}
                />
              ))}
            </nav>
          </div>

          {/* Bottom nav section */}
          <div className="px-3 py-6">
            <nav className="flex flex-col gap-1">
              {adminItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={handleLinkClick}
                />
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user
                  ? user.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {user?.name ?? "User"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {user?.email ?? ""}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import * as React from "react";

import {
  Megamenu,
  MegamenuContent,
  MegamenuGroup,
  MegamenuTrigger,
} from "@nivoda/components";

import { productCategories } from "@/lib/navigation";
import { EngagementRingsPanel } from "./engagement-rings-panel";
import { GemstonesPanel } from "./gemstones-panel";
import { NavLinkItem } from "./nav-link-item";

/**
 * Map from category `href` to the panel that should open as a megamenu
 * for that item. Items not in this map render as plain links even when
 * their `NavItem.hasSubmenu` flag is true.
 */
const PANELS: Record<string, React.ReactNode> = {
  "/buyer/browse/jewelry/engagement-rings": <EngagementRingsPanel />,
  "/buyer/browse/gemstones": <GemstonesPanel />,
};

/**
 * Persistent dark categories strip that sits below the app header.
 *
 * Categories with an entry in `PANELS` open a megamenu panel on
 * hover/click; the rest render as plain Next.js links. Below the `lg`
 * breakpoint the strip scrolls horizontally (scrollbar hidden) and
 * megamenu panels collapse into a bottom Sheet — both behaviours come
 * from `MegamenuContent` automatically.
 */
export function CategoriesMenu() {
  return (
    <MegamenuGroup
      aria-label="Product categories"
      className="h-22.5 gap-2 overflow-x-auto bg-negative px-6 py-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] lg:justify-center"
    >
      {productCategories.map((item) => {
        const panel = PANELS[item.href];

        if (panel) {
          return (
            <Megamenu key={item.href}>
              <MegamenuTrigger asChild>
                <NavLinkItem badge={item.badge} withChevron>
                  {item.label}
                </NavLinkItem>
              </MegamenuTrigger>
              <MegamenuContent aria-label={item.label}>
                {panel}
              </MegamenuContent>
            </Megamenu>
          );
        }

        return (
          <NavLinkItem
            key={item.href}
            href={item.href}
            badge={item.badge}
          >
            {item.label}
          </NavLinkItem>
        );
      })}
    </MegamenuGroup>
  );
}

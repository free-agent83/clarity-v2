import type { ComponentType } from "react";
import {
  IconAdjustmentsAlt,
  IconHeart,
  IconListCheck,
  IconReceipt2,
  IconSettings,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  hasSubmenu?: boolean;
  hasNotification?: boolean;
  hasChevron?: boolean;
  target?: string;
}

// ---------------------------------------------------------------------------
// Product categories
// Used by: CategoriesMenu, NavSheet (browse section)
// ---------------------------------------------------------------------------

export const productCategories: NavItem[] = [
  {
    label: "Engagement rings",
    href: "/buyer/browse/jewelry/engagement-rings",
    badge: "NEW",
    hasSubmenu: true,
  },
  { label: "Natural diamonds", href: "/buyer/browse/natural-diamonds" },
  { label: "Lab grown diamonds", href: "/buyer/browse/lab-grown-diamonds" },
  { label: "Gemstones", href: "/buyer/browse/gemstones", hasSubmenu: true },
  { label: "Natural melee", href: "/buyer/browse/natural-melee" },
  { label: "Lab-grown melee", href: "/buyer/browse/lab-grown-melee" },
  { label: "Custom jewellery", href: "/buyer/browse/custom-jewellery" },
];

// ---------------------------------------------------------------------------
// My List — account & activity items
// Used by: NavSheet
// ---------------------------------------------------------------------------

export const myListItems: NavItem[] = [
  { label: "Orders", href: "/buyer/orders", icon: IconListCheck },
  { label: "Finances", href: "/buyer/finances", icon: IconReceipt2 },
  { label: "Shortlists", href: "/buyer/shortlists", icon: IconHeart },
];

// ---------------------------------------------------------------------------
// Admin & settings
// Used by: NavSheet
// ---------------------------------------------------------------------------

export const adminItems: NavItem[] = [
  {
    label: "Admin Dashboard",
    href: "/buyer/admin",
    icon: IconAdjustmentsAlt,
    hasChevron: true,
    target: "_blank",
  },
  { label: "Settings", href: "/buyer/settings", icon: IconSettings },
];

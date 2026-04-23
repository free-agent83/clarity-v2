"use client";

import { CommandItem } from "@/components/ui/command";
import {
  IconDiamond,
  IconPackage,
  IconFileInvoice,
  IconHeart,
} from "@tabler/icons-react";

// Icon mapping by entity type
const ENTITY_ICONS: Record<string, typeof IconDiamond> = {
  "Natural Diamond": IconDiamond,
  "Lab Grown Diamond": IconDiamond,
  Gemstone: IconDiamond,
  "Natural Melee": IconDiamond,
  "Lab Grown Melee": IconDiamond,
  "Engagement Ring": IconDiamond,
  "Wedding Band": IconDiamond,
  "Tennis Bracelet": IconDiamond,
  Order: IconPackage,
  Invoice: IconFileInvoice,
  Shortlist: IconHeart,
};

interface SearchResultItemProps {
  title: string;
  subtitle: string;
  category: string;
  onSelect: () => void;
}

export function SearchResultItem({
  title,
  subtitle,
  category,
  onSelect,
}: SearchResultItemProps) {
  const Icon = ENTITY_ICONS[category] ?? IconDiamond;

  return (
    <CommandItem onSelect={onSelect} className="gap-3 px-2 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
        <Icon size={16} className="text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </CommandItem>
  );
}

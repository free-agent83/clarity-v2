"use client";

import * as React from "react";
import { IconCheck, IconSelector } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatUSD } from "@/lib/utils";

export interface ProductOption {
  id: string;
  stockId: string;
  category: string;
  priceUsd: number;
}

interface ProductComboboxProps {
  products: ProductOption[];
  value: string | null;
  onChange: (productId: string, product: ProductOption) => void;
  placeholder?: string;
}

export function ProductCombobox({
  products,
  value,
  onChange,
  placeholder = "Select a product…",
}: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selected =
    value != null ? products.find((p) => p.id === value) : undefined;

  const displayLabel = selected
    ? `${selected.stockId} — ${selected.category} — ${formatUSD(selected.priceUsd)}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={selected ? undefined : "text-muted-foreground"}>
            {displayLabel}
          </span>
          <IconSelector className="ml-2 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search by stock ID…" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.stockId}
                  onSelect={() => {
                    onChange(product.id, product);
                    setOpen(false);
                  }}
                  data-checked={value === product.id ? "true" : undefined}
                >
                  <IconCheck
                    className={
                      value === product.id ? "opacity-100" : "opacity-0"
                    }
                  />
                  <span className="flex flex-1 items-center gap-2">
                    <span className="font-medium">{product.stockId}</span>
                    <span className="text-muted-foreground">
                      {product.category}
                    </span>
                  </span>
                  <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                    {formatUSD(product.priceUsd)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

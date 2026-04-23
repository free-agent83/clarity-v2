"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", label: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
];

export function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(CURRENCIES[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <span>
            {selected.code} ({selected.symbol})
          </span>
          <IconChevronDown size={14} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-1">
        <ul role="listbox" aria-label="Select currency">
          {CURRENCIES.map((currency) => {
            const isSelected = currency.code === selected.code;
            return (
              <li key={currency.code} role="option" aria-selected={isSelected}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                    isSelected ? "bg-muted" : "",
                  )}
                  onClick={() => {
                    setSelected(currency);
                    setOpen(false);
                  }}
                >
                  {/* Flag */}
                  <span className="w-5 shrink-0 text-base leading-none">
                    {currency.flag}
                  </span>
                  {/* Code + symbol */}
                  <span
                    className={cn(
                      "flex-1 text-left font-medium",
                      isSelected && "text-foreground",
                    )}
                  >
                    {currency.code} ({currency.symbol})
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {currency.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nivoda/components";

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
        <Button variant="ghost">
          <span>
            {selected.code} ({selected.symbol})
          </span>
          <IconChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-1">
        <ul role="listbox" aria-label="Select currency">
          {CURRENCIES.map((currency) => {
            const isSelected = currency.code === selected.code;
            return (
              <li key={currency.code} role="option" aria-selected={isSelected}>
                <Button
                  variant="ghost"
                  block
                  className={cn("justify-start gap-3", isSelected && "bg-muted")}
                  onClick={() => {
                    setSelected(currency);
                    setOpen(false);
                  }}
                >
                  <span className="w-5 shrink-0 text-base leading-none">
                    {currency.flag}
                  </span>
                  <span className={cn("flex-1 text-left font-medium", isSelected && "text-foreground")}>
                    {currency.code} ({currency.symbol})
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {currency.label}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

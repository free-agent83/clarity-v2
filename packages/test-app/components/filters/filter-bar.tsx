"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";

export type FilterOption = {
  key: string;
  label: string;
  options: string[];
};

type FilterBarProps = {
  filters: FilterOption[];
  value: Record<string, string[]>;
  onChange: (filters: Record<string, string[]>) => void;
};

type FilterPopoverProps = {
  filter: FilterOption;
  committed: string[];
  onApply: (key: string, values: string[]) => void;
};

function FilterPopover({ filter, committed, onApply }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string[]>([]);

  function handleOpenChange(next: boolean) {
    if (next) setPending(committed);
    setOpen(next);
  }

  function toggle(value: string) {
    setPending((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleApply() {
    onApply(filter.key, pending);
    setOpen(false);
  }

  const isActive = committed.length > 0;
  const label =
    committed.length === 0
      ? filter.label
      : committed.length === 1
        ? committed[0]
        : `${filter.label} (${committed.length})`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="lg"
          className="h-11.25"
        >
          {label}
          {isActive ? (
            <span
              role="button"
              aria-label={`Clear ${filter.label} filter`}
              onClick={(e) => {
                e.stopPropagation();
                onApply(filter.key, []);
              }}
            >
              <IconX className="size-4" />
            </span>
          ) : (
            <IconChevronDown className="size-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 gap-3">
        <p className="text-sm font-medium">{filter.label}</p>
        <div className="flex flex-col gap-2">
          {filter.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={pending.includes(option)}
                onCheckedChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApply} className="flex-1">
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type AllFiltersSheetProps = {
  filters: FilterOption[];
  committed: Record<string, string[]>;
  onApply: (next: Record<string, string[]>) => void;
};

function AllFiltersSheet({
  filters,
  committed,
  onApply,
}: AllFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [sheetPending, setSheetPending] = useState<Record<string, string[]>>(
    {},
  );

  function handleOpenChange(next: boolean) {
    if (next) setSheetPending(committed);
    setOpen(next);
  }

  function toggle(key: string, value: string) {
    setSheetPending((prev) => {
      const current = prev[key] ?? [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  function handleApply() {
    onApply(sheetPending);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="h-11.25">
          <IconAdjustmentsHorizontal className="size-5" />
          All filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>All filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {filters.map((filter) => (
            <div key={filter.key} className="border-b py-4 last:border-0">
              <p className="mb-3 text-sm font-medium">{filter.label}</p>
              <div className="flex flex-col gap-2">
                {filter.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={(sheetPending[filter.key] ?? []).includes(
                        option,
                      )}
                      onCheckedChange={() => toggle(filter.key, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button onClick={handleApply} className="w-full">
            Apply filters
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSheetPending({})}
            className="w-full"
          >
            Clear all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function FilterBar({ filters, value, onChange }: FilterBarProps) {
  function applyFilter(key: string, values: string[]) {
    const next = { ...value };
    if (values.length === 0) {
      delete next[key];
    } else {
      next[key] = values;
    }
    onChange(next);
  }

  const hasActive = Object.keys(value).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AllFiltersSheet filters={filters} committed={value} onApply={onChange} />
      {filters.map((filter) => (
        <FilterPopover
          key={filter.key}
          filter={filter}
          committed={value[filter.key] ?? []}
          onApply={applyFilter}
        />
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="lg"
          className="h-11.25"
          onClick={() => onChange({})}
        >
          Clear all
          <IconX className="size-5" />
        </Button>
      )}
    </div>
  );
}

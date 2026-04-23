"use client";

import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@nivoda/components";

import { usePlpLoading } from "@/components/layouts/layout-plp/plp-loading-context";
import { parsePlpViewMode, type PlpViewMode } from "@/lib/plp-view-mode";

export function PlpViewModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTransition } = usePlpLoading();

  const current = parsePlpViewMode(searchParams.get("view") ?? undefined);

  function handleChange(next: string) {
    if (!next || next === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "grid") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    // Reset pagination when switching views so rows/cards realign.
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      value={current}
      onValueChange={(v: PlpViewMode) => v && handleChange(v)}
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <IconLayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <IconList className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

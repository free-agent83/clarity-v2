// ── Gemstone filter UI ────────────────────────────────────────────────
//
// The toolbar-button factory and drawer body for the Gemstone category.

import { useMemo, type ReactNode } from "react";
import { FilterButton } from "../../../../atoms/filter-button/filter-button";
import { Label } from "../../../../atoms/label/label";
import { Switch } from "../../../../atoms/switch/switch";
import { ToggleGroup, ToggleGroupItem } from "../../../../atoms/toggle-group/toggle-group";
import {
  AsyncComboboxFilter,
  type AsyncComboboxOption,
} from "../../../../molecules/async-combobox-filter/async-combobox-filter";
import { RangeFilter } from "../../../../molecules/range-filter/range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../molecules/select/select";
import { FilterSection } from "../../../../organisms/filter-toolbar/filter-toolbar";
import { mockApi } from "../shared/api";
import {
  formatMultiAxisChip,
  formatMultiSelectChip,
  formatRangeChip,
  labelForValue,
} from "../shared/formatters";
import type { useFilterController } from "../shared/controller";
import { GEMSTONE_FILTER_SCHEMA, type GemstoneFilterState } from "./api";

export const GEMSTONE_PINNED_IDS = [
  "nivoda-curated",
  "color",
  "price",
] as const;

export function useGemstoneFilterButtons(
  ctrl: ReturnType<typeof useFilterController<GemstoneFilterState>>
): Record<string, ReactNode> {
  const { applied, setAppliedFor } = ctrl;
  const { color, clarity, treatment, location, price, carat, size } =
    GEMSTONE_FILTER_SCHEMA;

  return useMemo<Record<string, ReactNode>>(
    () => ({
      "nivoda-curated": (
        <FilterButton<true>
          key="nivoda-curated"
          label="Nivoda Curated"
          chipSummary={
            applied["nivoda-curated"] ? "Only Nivoda Curated items" : undefined
          }
          isActive={applied["nivoda-curated"] === true}
          initialValue={applied["nivoda-curated"]}
          onApply={(v) => setAppliedFor("nivoda-curated", v)}
          onClear={() => setAppliedFor("nivoda-curated", undefined)}
          onDismiss={() => setAppliedFor("nivoda-curated", undefined)}
        >
          {(draft, setDraft) => (
            <div className="flex items-center gap-3">
              <Switch
                id="nivoda-curated-switch"
                checked={draft === true}
                onCheckedChange={(c) => setDraft(c ? true : undefined)}
              />
              <Label htmlFor="nivoda-curated-switch" className="cursor-pointer">
                Only Nivoda Curated items
              </Label>
            </div>
          )}
        </FilterButton>
      ),
      color: (
        <FilterButton<string[]>
          key="color"
          label="Color"
          chipSummary={formatMultiSelectChip(
            (applied.color ?? []).map((v) => labelForValue(color, v))
          )}
          isActive={(applied.color ?? []).length > 0}
          initialValue={applied.color}
          popoverWidth={320}
          onApply={(v) => setAppliedFor("color", v)}
          onClear={() => setAppliedFor("color", undefined)}
          onDismiss={() => setAppliedFor("color", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              value={v ?? []}
              onValueChange={(next: string[]) =>
                set(next.length > 0 ? next : undefined)
              }
            >
              {color.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      clarity: (
        <FilterButton<string[]>
          key="clarity"
          label="Clarity"
          chipSummary={formatMultiSelectChip(
            (applied.clarity ?? []).map((v) => labelForValue(clarity, v))
          )}
          isActive={(applied.clarity ?? []).length > 0}
          initialValue={applied.clarity}
          onApply={(v) => setAppliedFor("clarity", v)}
          onClear={() => setAppliedFor("clarity", undefined)}
          onDismiss={() => setAppliedFor("clarity", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              value={v ?? []}
              onValueChange={(next: string[]) =>
                set(next.length > 0 ? next : undefined)
              }
            >
              {clarity.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      treatment: (
        <FilterButton<string>
          key="treatment"
          label="Treatment"
          chipSummary={
            applied.treatment
              ? labelForValue(treatment, applied.treatment)
              : undefined
          }
          isActive={!!applied.treatment}
          initialValue={applied.treatment}
          onApply={(v) => setAppliedFor("treatment", v)}
          onClear={() => setAppliedFor("treatment", undefined)}
          onDismiss={() => setAppliedFor("treatment", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={v ?? ""}
              onValueChange={(next: string) => set(next || undefined)}
            >
              {treatment.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      location: (
        <FilterButton<string>
          key="location"
          label="Location"
          chipSummary={
            applied.location
              ? labelForValue(location, applied.location)
              : undefined
          }
          isActive={!!applied.location}
          initialValue={applied.location}
          onApply={(v) => setAppliedFor("location", v)}
          onClear={() => setAppliedFor("location", undefined)}
          onDismiss={() => setAppliedFor("location", undefined)}
        >
          {(v, setDraft) => (
            <Select
              value={v ?? ""}
              onValueChange={(val) => setDraft(val || undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {location.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FilterButton>
      ),
      price: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="price"
          label="Price"
          chipSummary={formatRangeChip(applied.price, "price", price.unit)}
          isActive={!!applied.price}
          initialValue={applied.price}
          onApply={(v) => setAppliedFor("price", v)}
          onClear={() => setAppliedFor("price", undefined)}
          onDismiss={() => setAppliedFor("price", undefined)}
        >
          {(v, set) => <RangeFilter value={v} onChange={set} axes={[price]} />}
        </FilterButton>
      ),
      carat: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="carat"
          label="Carat"
          chipSummary={formatRangeChip(applied.carat, "carat", carat.unit)}
          isActive={!!applied.carat}
          initialValue={applied.carat}
          onApply={(v) => setAppliedFor("carat", v)}
          onClear={() => setAppliedFor("carat", undefined)}
          onDismiss={() => setAppliedFor("carat", undefined)}
        >
          {(v, set) => <RangeFilter value={v} onChange={set} axes={[carat]} />}
        </FilterButton>
      ),
      size: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="size"
          label="Size (mm)"
          chipSummary={formatMultiAxisChip(applied.size, size)}
          isActive={!!applied.size}
          initialValue={applied.size}
          onApply={(v) => setAppliedFor("size", v)}
          onClear={() => setAppliedFor("size", undefined)}
          onDismiss={() => setAppliedFor("size", undefined)}
        >
          {(v, set) => <RangeFilter value={v} onChange={set} axes={size} />}
        </FilterButton>
      ),
      supplier: (
        <FilterButton<AsyncComboboxOption[]>
          key="supplier"
          label="Supplier"
          chipSummary={formatMultiSelectChip(
            (applied.supplier ?? []).map((o) => o.label)
          )}
          isActive={(applied.supplier ?? []).length > 0}
          initialValue={applied.supplier}
          onApply={(v) => setAppliedFor("supplier", v)}
          onClear={() => setAppliedFor("supplier", undefined)}
          onDismiss={() => setAppliedFor("supplier", undefined)}
        >
          {(v, set) => (
            <AsyncComboboxFilter
              value={v}
              onChange={set}
              searchFn={mockApi.searchSuppliers}
              searchPlaceholder="Search suppliers..."
            />
          )}
        </FilterButton>
      ),
    }),
    [
      applied,
      setAppliedFor,
      color,
      clarity,
      treatment,
      location,
      price,
      carat,
      size,
    ]
  );
}

export function GemstoneDrawerBody({
  ctrl,
}: {
  ctrl: ReturnType<typeof useFilterController<GemstoneFilterState>>;
}) {
  const { draft, setDraftFor } = ctrl;
  const { color, clarity, treatment, location, price, carat, size } =
    GEMSTONE_FILTER_SCHEMA;
  return (
    <>
      <FilterSection label="Nivoda Curated" separator={false}>
        <div className="flex items-center gap-3">
          <Switch
            id="drawer-nivoda-curated"
            checked={draft["nivoda-curated"] === true}
            onCheckedChange={(c) =>
              setDraftFor("nivoda-curated", c ? true : undefined)
            }
          />
          <Label htmlFor="drawer-nivoda-curated" className="cursor-pointer">
            Only Nivoda Curated items
          </Label>
        </div>
      </FilterSection>
      <FilterSection label="Color">
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft.color ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("color", next.length > 0 ? next : undefined)
          }
        >
          {color.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
      <FilterSection label="Clarity">
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft.clarity ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("clarity", next.length > 0 ? next : undefined)
          }
        >
          {clarity.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
      <FilterSection label="Treatment">
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={2}
          value={draft.treatment ?? ""}
          onValueChange={(next: string) =>
            setDraftFor("treatment", next || undefined)
          }
        >
          {treatment.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
      <FilterSection label="Location">
        <Select
          value={draft.location ?? ""}
          onValueChange={(v) => setDraftFor("location", v || undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {location.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>
      <FilterSection label="Price">
        <RangeFilter
          value={draft.price}
          onChange={(v) => setDraftFor("price", v)}
          axes={[price]}
        />
      </FilterSection>
      <FilterSection label="Carat">
        <RangeFilter
          value={draft.carat}
          onChange={(v) => setDraftFor("carat", v)}
          axes={[carat]}
        />
      </FilterSection>
      <FilterSection label="Size (mm)">
        <RangeFilter
          value={draft.size}
          onChange={(v) => setDraftFor("size", v)}
          axes={size}
        />
      </FilterSection>
      <FilterSection label="Supplier">
        <AsyncComboboxFilter
          value={draft.supplier}
          onChange={(v) => setDraftFor("supplier", v)}
          searchFn={mockApi.searchSuppliers}
          searchPlaceholder="Search suppliers..."
        />
      </FilterSection>
    </>
  );
}

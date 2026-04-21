// ── Diamond filter UI ─────────────────────────────────────────────────
//
// The toolbar-button factory and drawer body for the Diamond category.
// Reads from `DIAMOND_FILTER_SCHEMA`, renders filter primitives, and
// wires applied/draft state through a shared filter controller.

import { useMemo, type ReactNode } from "react";
import { FilterButton } from "../../../../atoms/filter-button/filter-button";
import { ToggleGroup, ToggleGroupItem } from "../../../../atoms/toggle-group/toggle-group";
import {
  AsyncComboboxFilter,
  type AsyncComboboxOption,
} from "../../../../molecules/async-combobox-filter/async-combobox-filter";
import { RangeFilter } from "../../../../molecules/range-filter/range-filter";
import { FilterSection } from "../../../../organisms/filter-toolbar/filter-toolbar";
import { mockApi } from "../shared/api";
import {
  formatMultiAxisChip,
  formatMultiSelectChip,
  formatRangeChip,
} from "../shared/formatters";
import type { useFilterController } from "../shared/controller";
import { DIAMOND_FILTER_SCHEMA, type DiamondFilterState } from "./api";

export const DIAMOND_PINNED_IDS = ["shape", "color", "price"] as const;

export function useDiamondFilterButtons(
  ctrl: ReturnType<typeof useFilterController<DiamondFilterState>>
): Record<string, ReactNode> {
  const { applied, setAppliedFor } = ctrl;
  const { shape, color, clarity, price, carat, size } = DIAMOND_FILTER_SCHEMA;

  return useMemo<Record<string, ReactNode>>(
    () => ({
      shape: (
        <FilterButton<string[]>
          key="shape"
          label="Shape"
          chipSummary={formatMultiSelectChip(
            (applied.shape ?? []).map((v) =>
              shape.find((o) => o.value === v)?.label ?? v
            )
          )}
          isActive={(applied.shape ?? []).length > 0}
          initialValue={applied.shape}
          onApply={(v) => setAppliedFor("shape", v)}
          onClear={() => setAppliedFor("shape", undefined)}
          onDismiss={() => setAppliedFor("shape", undefined)}
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
              {shape.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      color: (
        <FilterButton<string[]>
          key="color"
          label="Color"
          chipSummary={formatMultiSelectChip(applied.color ?? [])}
          isActive={(applied.color ?? []).length > 0}
          initialValue={applied.color}
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
          chipSummary={formatMultiSelectChip(applied.clarity ?? [])}
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
    [applied, setAppliedFor, shape, color, clarity, price, carat, size]
  );
}

export function DiamondDrawerBody({
  ctrl,
}: {
  ctrl: ReturnType<typeof useFilterController<DiamondFilterState>>;
}) {
  const { draft, setDraftFor } = ctrl;
  const { shape, color, clarity, price, carat, size } = DIAMOND_FILTER_SCHEMA;
  return (
    <>
      <FilterSection label="Shape" separator={false}>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft.shape ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("shape", next.length > 0 ? next : undefined)
          }
        >
          {shape.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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

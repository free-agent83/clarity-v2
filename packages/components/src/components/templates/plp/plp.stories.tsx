import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { FilterButton } from "../../atoms/filter-button/filter-button";
import { Label } from "../../atoms/label/label";
import { Switch } from "../../atoms/switch/switch";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { Typography } from "../../atoms/typography/typography";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { AsyncComboboxFilter } from "../../molecules/async-combobox-filter/async-combobox-filter";
import type { AsyncComboboxOption } from "../../molecules/async-combobox-filter/async-combobox-filter";
import {
  FilterSection,
  FilterToolbar,
} from "../../organisms/filter-toolbar/filter-toolbar";
import type {
  FilterToolbarDrawer,
  FilterToolbarSortOption,
} from "../../organisms/filter-toolbar/filter-toolbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../molecules/pagination/pagination";
import { RangeFilter } from "../../molecules/range-filter/range-filter";
import type { RangeAxis } from "../../molecules/range-filter/range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import { useIsTabletUp } from "../../../hooks/use-is-tablet-up";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemReturnable,
} from "./grid/plp-grid-item";
import { PlpGridContainer } from "./plp-grid-container";
import { PlpHeading } from "./plp-heading";
import { PlpListContainer } from "./plp-list-container";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../atoms/empty/empty";
import type { BreadcrumbSegment, PlpStatus, PlpViewMode } from "./plp-types";
import { SORT_OPTIONS, mockPreviewCount } from "./mocks/common";
import { MOCK_LATENCY } from "./mocks/simulate-api-call";
import {
  GEMSTONE_CARAT_CONFIG,
  GEMSTONE_CLARITY_OPTIONS,
  GEMSTONE_COLOR_OPTIONS,
  GEMSTONE_LOCATION_OPTIONS,
  GEMSTONE_PRESELECTED_SUPPLIERS,
  GEMSTONE_PRICE_CONFIG,
  GEMSTONE_SIZE_AXES,
  GEMSTONE_SUPPLIER_SEARCH,
  GEMSTONE_TREATMENT_OPTIONS,
  GemstonePlpGridItem,
  GemstonePlpListHeader,
  GemstonePlpListRow,
  generateGemstoneItems,
  type GemstoneFilterState,
} from "./mocks/gemstone";
import {
  DIAMOND_CARAT_CONFIG,
  DIAMOND_CLARITY_OPTIONS,
  DIAMOND_COLOR_OPTIONS,
  DIAMOND_PRICE_CONFIG,
  DIAMOND_SHAPE_OPTIONS,
  DIAMOND_SIZE_AXES,
  DIAMOND_SUPPLIER_SEARCH,
  DiamondPlpGridItem,
  DiamondPlpListHeader,
  DiamondPlpListRow,
  generateDiamondItems,
  type DiamondFilterState,
} from "./mocks/diamond";

// ── Reference wiring: useFilterController ─────────────────────────────
//
// This hook is the canonical pattern for wiring filter state into the
// PLP assembly. It is deliberately defined inside this story file (not
// exported from the library) — the refactor's goal is to show consumers
// how to own filter state themselves rather than hide it behind a
// library hook. Copy, adapt to your own state shape, or replace it
// entirely; the library makes no assumptions.

function useFilterController<T extends object>(initial: Partial<T> = {}) {
  const [applied, setApplied] = useState<Partial<T>>(initial);
  const [draft, setDraft] = useState<Partial<T>>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeIds = (Object.keys(applied) as Array<keyof T>).filter(
    (k) => applied[k] !== undefined
  );

  function openDrawer() {
    setDraft(applied);
    setDrawerOpen(true);
  }

  function applyDraft() {
    setApplied(draft);
    setDrawerOpen(false);
  }

  function setAppliedFor<K extends keyof T>(id: K, v: T[K] | undefined) {
    setApplied((p) => {
      const next = { ...p };
      if (v === undefined) delete next[id];
      else next[id] = v;
      return next;
    });
  }

  function setDraftFor<K extends keyof T>(id: K, v: T[K] | undefined) {
    setDraft((p) => {
      const next = { ...p };
      if (v === undefined) delete next[id];
      else next[id] = v;
      return next;
    });
  }

  const hasActiveDraft = Object.values(draft).some((v) => v !== undefined);

  return {
    applied,
    draft,
    drawerOpen,
    activeIds: activeIds as Array<string>,
    activeCount: activeIds.length,
    hasActiveDraft,
    setDrawerOpen,
    openDrawer,
    applyDraft,
    setAppliedFor,
    setDraftFor,
    clearDraft: () => setDraft({}),
    clearAll: () => setApplied({}),
  };
}

// ── Debounced preview-count fetcher ───────────────────────────────────

function usePreviewCount(draft: object) {
  const [count, setCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const next = await mockPreviewCount(draft);
      setCount(next);
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft]);

  return { count, loading };
}

// ── Simulated backend-commit latency ──────────────────────────────────
//
// Flips the effective `status` to "loading" for ~commit ms whenever the
// applied state changes so the grid/list briefly shows skeletons.

function useSimulatedCommitStatus(applied: object, baseline: PlpStatus) {
  const [effective, setEffective] = useState<PlpStatus>(baseline);
  const firstRenderRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (baseline !== "success") return;
    setEffective("loading");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setEffective(baseline);
    }, MOCK_LATENCY.commit);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on `applied` only; baseline changing is a story-setup event, not a commit
  }, [applied]);

  return effective;
}

// ── Chip-summary formatters ───────────────────────────────────────────
//
// Each filter has its own chip-summary shape; format helpers live here
// in the consumer. The library no longer ships a chip formatter.

function formatMultiSelectChip(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
}

function formatUnitValue(n: number, unit?: string): string {
  if (!unit) return String(n);
  const isPrefix =
    ["$", "€", "£", "¥"].some((c) => unit.startsWith(c)) ||
    ["USD", "EUR", "GBP", "JPY"].includes(unit);
  return isPrefix ? `${unit}${n}` : `${n}${unit}`;
}

function formatRangeChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axisId: string,
  unit?: string
): string {
  const v = value?.[axisId];
  if (!v) return "";
  return `${formatUnitValue(v.min, unit)}\u2013${formatUnitValue(v.max, unit)}`;
}

function formatMultiAxisChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axes: RangeAxis[]
): string {
  if (!value) return "";
  const segments: string[] = [];
  for (const axis of axes) {
    const v = value[axis.id];
    if (!v) continue;
    const abbrev = axis.label
      ? axis.label.charAt(0).toUpperCase()
      : axis.id.charAt(0).toUpperCase();
    segments.push(
      `${abbrev} ${formatUnitValue(v.min, axis.unit)}\u2013${formatUnitValue(v.max, axis.unit)}`
    );
  }
  if (segments.length === 0) return "";
  if (segments.length <= 2) return segments.join(", ");
  return `${segments[0]}, ${segments[1]} +${segments.length - 2} more`;
}

function labelForValue(options: { value: string; label: string }[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v;
}

// ── Gemstone filter buttons ───────────────────────────────────────────

function useGemstoneFilterButtons(
  ctrl: ReturnType<typeof useFilterController<GemstoneFilterState>>
): Record<string, ReactNode> {
  const { applied, setAppliedFor } = ctrl;

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
            (applied.color ?? []).map((v) =>
              labelForValue(GEMSTONE_COLOR_OPTIONS, v)
            )
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
              {GEMSTONE_COLOR_OPTIONS.map((o) => (
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
            (applied.clarity ?? []).map((v) =>
              labelForValue(GEMSTONE_CLARITY_OPTIONS, v)
            )
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
              {GEMSTONE_CLARITY_OPTIONS.map((o) => (
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
              ? labelForValue(GEMSTONE_TREATMENT_OPTIONS, applied.treatment)
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
              {GEMSTONE_TREATMENT_OPTIONS.map((o) => (
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
              ? labelForValue(GEMSTONE_LOCATION_OPTIONS, applied.location)
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
                {GEMSTONE_LOCATION_OPTIONS.map((o) => (
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
          chipSummary={formatRangeChip(
            applied.price,
            "price",
            GEMSTONE_PRICE_CONFIG.unit
          )}
          isActive={!!applied.price}
          initialValue={applied.price}
          onApply={(v) => setAppliedFor("price", v)}
          onClear={() => setAppliedFor("price", undefined)}
          onDismiss={() => setAppliedFor("price", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={[GEMSTONE_PRICE_CONFIG]} />
          )}
        </FilterButton>
      ),
      carat: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="carat"
          label="Carat"
          chipSummary={formatRangeChip(
            applied.carat,
            "carat",
            GEMSTONE_CARAT_CONFIG.unit
          )}
          isActive={!!applied.carat}
          initialValue={applied.carat}
          onApply={(v) => setAppliedFor("carat", v)}
          onClear={() => setAppliedFor("carat", undefined)}
          onDismiss={() => setAppliedFor("carat", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={[GEMSTONE_CARAT_CONFIG]} />
          )}
        </FilterButton>
      ),
      size: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="size"
          label="Size (mm)"
          chipSummary={formatMultiAxisChip(applied.size, GEMSTONE_SIZE_AXES)}
          isActive={!!applied.size}
          initialValue={applied.size}
          onApply={(v) => setAppliedFor("size", v)}
          onClear={() => setAppliedFor("size", undefined)}
          onDismiss={() => setAppliedFor("size", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={GEMSTONE_SIZE_AXES} />
          )}
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
              searchFn={GEMSTONE_SUPPLIER_SEARCH}
              searchPlaceholder="Search suppliers..."
            />
          )}
        </FilterButton>
      ),
    }),
    [applied, setAppliedFor]
  );
}

const GEMSTONE_PINNED_IDS = [
  "nivoda-curated",
  "color",
  "price",
] as const;

function GemstoneDrawerBody({
  ctrl,
}: {
  ctrl: ReturnType<typeof useFilterController<GemstoneFilterState>>;
}) {
  const { draft, setDraftFor } = ctrl;
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
          {GEMSTONE_COLOR_OPTIONS.map((o) => (
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
          {GEMSTONE_CLARITY_OPTIONS.map((o) => (
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
          {GEMSTONE_TREATMENT_OPTIONS.map((o) => (
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
            {GEMSTONE_LOCATION_OPTIONS.map((o) => (
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
          axes={[GEMSTONE_PRICE_CONFIG]}
        />
      </FilterSection>
      <FilterSection label="Carat">
        <RangeFilter
          value={draft.carat}
          onChange={(v) => setDraftFor("carat", v)}
          axes={[GEMSTONE_CARAT_CONFIG]}
        />
      </FilterSection>
      <FilterSection label="Size (mm)">
        <RangeFilter
          value={draft.size}
          onChange={(v) => setDraftFor("size", v)}
          axes={GEMSTONE_SIZE_AXES}
        />
      </FilterSection>
      <FilterSection label="Supplier">
        <AsyncComboboxFilter
          value={draft.supplier}
          onChange={(v) => setDraftFor("supplier", v)}
          searchFn={GEMSTONE_SUPPLIER_SEARCH}
          searchPlaceholder="Search suppliers..."
        />
      </FilterSection>
    </>
  );
}

// ── Diamond filter buttons ────────────────────────────────────────────

function useDiamondFilterButtons(
  ctrl: ReturnType<typeof useFilterController<DiamondFilterState>>
): Record<string, ReactNode> {
  const { applied, setAppliedFor } = ctrl;

  return useMemo<Record<string, ReactNode>>(
    () => ({
      shape: (
        <FilterButton<string[]>
          key="shape"
          label="Shape"
          chipSummary={formatMultiSelectChip(
            (applied.shape ?? []).map((v) =>
              labelForValue(DIAMOND_SHAPE_OPTIONS, v)
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
              {DIAMOND_SHAPE_OPTIONS.map((o) => (
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
              {DIAMOND_COLOR_OPTIONS.map((o) => (
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
              {DIAMOND_CLARITY_OPTIONS.map((o) => (
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
          chipSummary={formatRangeChip(
            applied.price,
            "price",
            DIAMOND_PRICE_CONFIG.unit
          )}
          isActive={!!applied.price}
          initialValue={applied.price}
          onApply={(v) => setAppliedFor("price", v)}
          onClear={() => setAppliedFor("price", undefined)}
          onDismiss={() => setAppliedFor("price", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={[DIAMOND_PRICE_CONFIG]} />
          )}
        </FilterButton>
      ),
      carat: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="carat"
          label="Carat"
          chipSummary={formatRangeChip(
            applied.carat,
            "carat",
            DIAMOND_CARAT_CONFIG.unit
          )}
          isActive={!!applied.carat}
          initialValue={applied.carat}
          onApply={(v) => setAppliedFor("carat", v)}
          onClear={() => setAppliedFor("carat", undefined)}
          onDismiss={() => setAppliedFor("carat", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={[DIAMOND_CARAT_CONFIG]} />
          )}
        </FilterButton>
      ),
      size: (
        <FilterButton<Record<string, { min: number; max: number }>>
          key="size"
          label="Size (mm)"
          chipSummary={formatMultiAxisChip(applied.size, DIAMOND_SIZE_AXES)}
          isActive={!!applied.size}
          initialValue={applied.size}
          onApply={(v) => setAppliedFor("size", v)}
          onClear={() => setAppliedFor("size", undefined)}
          onDismiss={() => setAppliedFor("size", undefined)}
        >
          {(v, set) => (
            <RangeFilter value={v} onChange={set} axes={DIAMOND_SIZE_AXES} />
          )}
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
              searchFn={DIAMOND_SUPPLIER_SEARCH}
              searchPlaceholder="Search suppliers..."
            />
          )}
        </FilterButton>
      ),
    }),
    [applied, setAppliedFor]
  );
}

const DIAMOND_PINNED_IDS = ["shape", "color", "price"] as const;

function DiamondDrawerBody({
  ctrl,
}: {
  ctrl: ReturnType<typeof useFilterController<DiamondFilterState>>;
}) {
  const { draft, setDraftFor } = ctrl;
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
          {DIAMOND_SHAPE_OPTIONS.map((o) => (
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
          {DIAMOND_COLOR_OPTIONS.map((o) => (
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
          {DIAMOND_CLARITY_OPTIONS.map((o) => (
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
          axes={[DIAMOND_PRICE_CONFIG]}
        />
      </FilterSection>
      <FilterSection label="Carat">
        <RangeFilter
          value={draft.carat}
          onChange={(v) => setDraftFor("carat", v)}
          axes={[DIAMOND_CARAT_CONFIG]}
        />
      </FilterSection>
      <FilterSection label="Size (mm)">
        <RangeFilter
          value={draft.size}
          onChange={(v) => setDraftFor("size", v)}
          axes={DIAMOND_SIZE_AXES}
        />
      </FilterSection>
      <FilterSection label="Supplier">
        <AsyncComboboxFilter
          value={draft.supplier}
          onChange={(v) => setDraftFor("supplier", v)}
          searchFn={DIAMOND_SUPPLIER_SEARCH}
          searchPlaceholder="Search suppliers..."
        />
      </FilterSection>
    </>
  );
}

// ── Toolbar + sticky slot routing ─────────────────────────────────────
//
// Given a buttons-by-id map, a pinned id list, and the currently active
// ids, produce the two slot arrays the FilterToolbar consumes:
// - `toolbarFilters`: pinned ids first (always), then engaged non-pinned
// - `stickyFilters`: only engaged ids (no empty pinned buttons)

function routeFilterSlots(
  buttons: Record<string, ReactNode>,
  pinnedIds: readonly string[],
  activeIds: string[]
) {
  const pinnedSet = new Set(pinnedIds);
  const engagedNonPinned = activeIds.filter((id) => !pinnedSet.has(id));

  const toolbarFilters = [
    ...pinnedIds.map((id) => buttons[id]),
    ...engagedNonPinned.map((id) => buttons[id]),
  ].filter((n): n is ReactNode => !!n);

  const stickyFilters = activeIds
    .map((id) => buttons[id])
    .filter((n): n is ReactNode => !!n);

  return { toolbarFilters, stickyFilters };
}

// ── Card/row builder helpers ──────────────────────────────────────────

function buildGemstoneCards(count: number): ReactNode[] {
  return generateGemstoneItems(count).map((item) => (
    <GemstonePlpGridItem key={item.id} item={item} />
  ));
}

function buildDiamondCards(count: number): ReactNode[] {
  return generateDiamondItems(count).map((item) => (
    <DiamondPlpGridItem key={item.id} item={item} />
  ));
}

function buildGemstoneRows(count: number): ReactNode[] {
  return generateGemstoneItems(count).map((item) => (
    <GemstonePlpListRow key={item.id} item={item} onClick={fn()} />
  ));
}

function buildDiamondRows(count: number): ReactNode[] {
  return generateDiamondItems(count).map((item) => (
    <DiamondPlpListRow key={item.id} item={item} onClick={fn()} />
  ));
}

// ── AssemblyShell ─────────────────────────────────────────────────────
//
// Local helper that wires PlpHeading + FilterToolbar + content + optional
// pagination + FilterDrawer sibling into the canonical page layout.

function AssemblyShell({
  breadcrumbs,
  title,
  resultsCount,
  banner,
  toolbarFilters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onClearAll,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  actions,
  drawer,
  children,
  pagination,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  banner?: ReactNode;
  toolbarFilters?: ReactNode[];
  stickyFilters?: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onSearchSubmit?: (q: string) => void;
  searchPlaceholder?: string;
  sortOptions?: FilterToolbarSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  actions?: ReactNode;
  drawer?: FilterToolbarDrawer;
  children: ReactNode;
  pagination?: ReactNode;
}) {
  return (
    <main className="space-y-4" data-slot="plp-assembly">
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />
      {banner}
      <FilterToolbar
        filters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onClearAll={onClearAll}
        onSearchSubmit={onSearchSubmit}
        searchPlaceholder={searchPlaceholder}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        actions={actions}
        drawer={drawer}
      />
      {children}
      {pagination}
    </main>
  );
}

// ── InlinePagination ──────────────────────────────────────────────────

function InlinePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Typography as="span" variant="body-2">
          Results per page
        </Typography>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <Typography
              as="span"
              variant="body-2"
              className="px-2 text-muted-foreground"
            >
              Page {page} of {totalPages}
            </Typography>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ── Empty / error state suggestion ────────────────────────────────────
//
// The library doesn't ship PLP-specific empty/error components.
// Consumers compose the `Empty` atom with the copy and CTAs that fit
// their context. This helper is one example of what that looks like
// for a product-listing page — copy it into your app and adapt.

function renderPlpEmptyState({
  status,
  onClearAll,
  onRetry,
  emptyMessage,
  emptyFilterSuggestions,
}: {
  status: "empty-filtered" | "empty-no-items" | "error";
  onClearAll?: () => void;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyFilterSuggestions?: string[];
}): ReactNode {
  if (status === "empty-filtered") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items match your filters</EmptyTitle>
          <EmptyDescription>
            Try adjusting your filters to find what you're looking for.
          </EmptyDescription>
          {emptyFilterSuggestions && emptyFilterSuggestions.length > 0 && (
            <EmptyDescription>
              Try removing:{" "}
              <Typography
                as="span"
                variant="body-2"
                emphasis
                className="text-foreground"
              >
                {emptyFilterSuggestions.join(", ")}
              </Typography>
            </EmptyDescription>
          )}
        </EmptyHeader>
        {onClearAll && (
          <EmptyContent>
            <Button variant="outline" onClick={onClearAll}>
              Clear all filters
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  if (status === "empty-no-items") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items available</EmptyTitle>
          <EmptyDescription>
            {emptyMessage || "There are no items in this category yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          We couldn't load the products. Please try again or contact support
          if the problem persists.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Button variant="outline" asChild>
          <a href="/support">Contact support</a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

// ── Story meta ────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppShell>
        <AppShellHeader onSearch={fn()} />
        <AppShellMain>
          <Story />
        </AppShellMain>
      </AppShell>
    ),
  ],
};

export default meta;

// ── Shared props interface ────────────────────────────────────────────

interface InteractiveShellProps {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  totalItems: number;
  sortOptions?: FilterToolbarSortOption[];
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  listHeader?: ReactNode;
  listRows?: ReactNode[];
  listViewAvailable?: boolean;
  gridItems?: ReactNode[];
  onRetry?: () => void;
  emptyMessage?: string;
  emptyFilterSuggestions?: string[];
  initialSortValue?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialViewMode?: PlpViewMode;
  baselineStatus?: PlpStatus;
}

// ── GemstoneInteractive ───────────────────────────────────────────────

function GemstoneInteractive({
  initialFilterState = {},
  breadcrumbs,
  title,
  resultsCount,
  totalItems,
  sortOptions,
  searchPlaceholder,
  onSearchSubmit,
  listHeader,
  listRows,
  listViewAvailable = false,
  gridItems,
  onRetry,
  emptyMessage,
  emptyFilterSuggestions,
  initialSortValue = "price-asc",
  initialPage = 1,
  initialPageSize = 20,
  initialViewMode = "grid",
  baselineStatus = "success",
}: InteractiveShellProps & {
  initialFilterState?: Partial<GemstoneFilterState>;
}) {
  const ctrl = useFilterController<GemstoneFilterState>(initialFilterState);
  const buttons = useGemstoneFilterButtons(ctrl);
  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    GEMSTONE_PINNED_IDS,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);

  const [sortValue, setSortValue] = useState(initialSortValue);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [view, setView] = useState<PlpViewMode>(initialViewMode);
  const status = useSimulatedCommitStatus(ctrl.applied, baselineStatus);

  const isTabletUp = useIsTabletUp();
  const effectiveView: PlpViewMode =
    listViewAvailable && isTabletUp && view === "list" ? "list" : "grid";

  return (
    <AssemblyShell
      breadcrumbs={breadcrumbs}
      title={title}
      resultsCount={resultsCount}
      toolbarFilters={toolbarFilters}
      stickyFilters={stickyFilters}
      activeFilterCount={ctrl.activeCount}
      hasActiveFilters={ctrl.activeCount > 0}
      onClearAll={ctrl.clearAll}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder={searchPlaceholder}
      sortOptions={sortOptions}
      sortValue={sortValue}
      onSortChange={setSortValue}
      actions={
        listViewAvailable ? (
          <div className="hidden lg:flex">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as PlpViewMode)}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <IconList className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ) : undefined
      }
      pagination={
        status === "success" && totalItems > 0 ? (
          <InlinePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : undefined
      }
      drawer={{
        content: <GemstoneDrawerBody ctrl={ctrl} />,
        onOpen: ctrl.openDrawer,
        onApply: ctrl.applyDraft,
        onClearDraft: ctrl.clearDraft,
        hasActiveDraft: ctrl.hasActiveDraft,
        resultsCount: preview.count,
        isCountLoading: preview.loading,
      }}
    >
      {status === "empty-filtered" ||
      status === "empty-no-items" ||
      status === "error" ? (
        renderPlpEmptyState({
          status,
          onClearAll: ctrl.clearAll,
          onRetry,
          emptyMessage,
          emptyFilterSuggestions,
        })
      ) : effectiveView === "list" ? (
        <PlpListContainer
          header={listHeader}
          loading={status === "loading"}
          skeletonCount={pageSize}
        >
          {listRows}
        </PlpListContainer>
      ) : (
        <PlpGridContainer loading={status === "loading"} skeletonCount={pageSize}>
          {gridItems}
        </PlpGridContainer>
      )}
    </AssemblyShell>
  );
}

// ── DiamondInteractive ────────────────────────────────────────────────

function DiamondInteractive({
  initialFilterState = {},
  breadcrumbs,
  title,
  resultsCount,
  totalItems,
  sortOptions,
  searchPlaceholder,
  onSearchSubmit,
  listHeader,
  listRows,
  listViewAvailable = false,
  gridItems,
  onRetry,
  emptyMessage,
  emptyFilterSuggestions,
  initialSortValue = "price-asc",
  initialPage = 1,
  initialPageSize = 20,
  initialViewMode = "grid",
  baselineStatus = "success",
}: InteractiveShellProps & {
  initialFilterState?: Partial<DiamondFilterState>;
}) {
  const ctrl = useFilterController<DiamondFilterState>(initialFilterState);
  const buttons = useDiamondFilterButtons(ctrl);
  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    DIAMOND_PINNED_IDS,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);

  const [sortValue, setSortValue] = useState(initialSortValue);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [view, setView] = useState<PlpViewMode>(initialViewMode);
  const status = useSimulatedCommitStatus(ctrl.applied, baselineStatus);

  const isTabletUp = useIsTabletUp();
  const effectiveView: PlpViewMode =
    listViewAvailable && isTabletUp && view === "list" ? "list" : "grid";

  return (
    <AssemblyShell
      breadcrumbs={breadcrumbs}
      title={title}
      resultsCount={resultsCount}
      toolbarFilters={toolbarFilters}
      stickyFilters={stickyFilters}
      activeFilterCount={ctrl.activeCount}
      hasActiveFilters={ctrl.activeCount > 0}
      onClearAll={ctrl.clearAll}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder={searchPlaceholder}
      sortOptions={sortOptions}
      sortValue={sortValue}
      onSortChange={setSortValue}
      actions={
        listViewAvailable ? (
          <div className="hidden lg:flex">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as PlpViewMode)}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <IconList className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ) : undefined
      }
      pagination={
        status === "success" && totalItems > 0 ? (
          <InlinePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : undefined
      }
      drawer={{
        content: <DiamondDrawerBody ctrl={ctrl} />,
        onOpen: ctrl.openDrawer,
        onApply: ctrl.applyDraft,
        onClearDraft: ctrl.clearDraft,
        hasActiveDraft: ctrl.hasActiveDraft,
        resultsCount: preview.count,
        isCountLoading: preview.loading,
      }}
    >
      {status === "empty-filtered" ||
      status === "empty-no-items" ||
      status === "error" ? (
        renderPlpEmptyState({
          status,
          onClearAll: ctrl.clearAll,
          onRetry,
          emptyMessage,
          emptyFilterSuggestions,
        })
      ) : effectiveView === "list" ? (
        <PlpListContainer
          header={listHeader}
          loading={status === "loading"}
          skeletonCount={pageSize}
        >
          {listRows}
        </PlpListContainer>
      ) : (
        <PlpGridContainer loading={status === "loading"} skeletonCount={pageSize}>
          {gridItems}
        </PlpGridContainer>
      )}
    </AssemblyShell>
  );
}

// ── Jewelry — inline filter schema to show the composition pattern ────

interface JewelryFilterState {
  "stone-shape"?: string[];
  metal?: string[];
  style?: string[];
}

const JEWELRY_STONE_SHAPE_OPTIONS = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
];

const JEWELRY_METAL_OPTIONS = [
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "silver", label: "Silver" },
];

const JEWELRY_STYLE_OPTIONS = [
  { value: "solitaire", label: "Solitaire" },
  { value: "halo", label: "Halo" },
  { value: "three-stone", label: "Three stone" },
];

const JEWELRY_PINNED_IDS = ["stone-shape", "metal"] as const;

function JewelryInteractive() {
  const ctrl = useFilterController<JewelryFilterState>({});
  const { applied, setAppliedFor, draft, setDraftFor } = ctrl;

  const buttons: Record<string, ReactNode> = {
    "stone-shape": (
      <FilterButton<string[]>
        key="stone-shape"
        label="Stone shape"
        chipSummary={formatMultiSelectChip(
          (applied["stone-shape"] ?? []).map((v) =>
            labelForValue(JEWELRY_STONE_SHAPE_OPTIONS, v)
          )
        )}
        isActive={(applied["stone-shape"] ?? []).length > 0}
        initialValue={applied["stone-shape"]}
        onApply={(v) => setAppliedFor("stone-shape", v)}
        onClear={() => setAppliedFor("stone-shape", undefined)}
        onDismiss={() => setAppliedFor("stone-shape", undefined)}
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
            {JEWELRY_STONE_SHAPE_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </FilterButton>
    ),
    metal: (
      <FilterButton<string[]>
        key="metal"
        label="Metal"
        chipSummary={formatMultiSelectChip(
          (applied.metal ?? []).map((v) =>
            labelForValue(JEWELRY_METAL_OPTIONS, v)
          )
        )}
        isActive={(applied.metal ?? []).length > 0}
        initialValue={applied.metal}
        onApply={(v) => setAppliedFor("metal", v)}
        onClear={() => setAppliedFor("metal", undefined)}
        onDismiss={() => setAppliedFor("metal", undefined)}
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
            {JEWELRY_METAL_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </FilterButton>
    ),
    style: (
      <FilterButton<string[]>
        key="style"
        label="Style"
        chipSummary={formatMultiSelectChip(
          (applied.style ?? []).map((v) =>
            labelForValue(JEWELRY_STYLE_OPTIONS, v)
          )
        )}
        isActive={(applied.style ?? []).length > 0}
        initialValue={applied.style}
        onApply={(v) => setAppliedFor("style", v)}
        onClear={() => setAppliedFor("style", undefined)}
        onDismiss={() => setAppliedFor("style", undefined)}
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
            {JEWELRY_STYLE_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </FilterButton>
    ),
  };

  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    JEWELRY_PINNED_IDS,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);

  const [sortValue, setSortValue] = useState("featured");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const status = useSimulatedCommitStatus(ctrl.applied, "success");

  const totalItems = 1234567;

  const items = Array.from({ length: 20 }, (_, i) => ({
    id: `ring-${i}`,
    name: "Three-Stone Anniversary Band",
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Ring+${i + 1}`,
    sku: "SKU 100019ERDPL",
    price: 9999.0,
  }));

  const gridItems: ReactNode[] = items.map((item) => (
    <PlpGridItem key={item.id}>
      <PlpGridItemMedia image={item.image} imageAlt={item.name} />
      <PlpGridItemName>{item.name}</PlpGridItemName>
      <Typography variant="caption" className="text-muted-foreground">
        Wedding ring · {item.sku}
      </Typography>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice amount={item.price} currency="USD" />
    </PlpGridItem>
  ));

  return (
    <AssemblyShell
      breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Wedding rings" }]}
      title="Wedding rings"
      resultsCount={totalItems}
      toolbarFilters={toolbarFilters}
      stickyFilters={stickyFilters}
      activeFilterCount={ctrl.activeCount}
      hasActiveFilters={ctrl.activeCount > 0}
      onClearAll={ctrl.clearAll}
      sortOptions={[
        { value: "featured", label: "Featured" },
        ...SORT_OPTIONS.slice(0, 2),
      ]}
      sortValue={sortValue}
      onSortChange={setSortValue}
      pagination={
        status === "success" && totalItems > 0 ? (
          <InlinePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : undefined
      }
      drawer={{
        content: (
          <>
            <FilterSection label="Stone shape" separator={false}>
              <ToggleGroup
                type="multiple"
                variant="outline"
                spacing={2}
                value={draft["stone-shape"] ?? []}
                onValueChange={(next: string[]) =>
                  setDraftFor("stone-shape", next.length > 0 ? next : undefined)
                }
              >
                {JEWELRY_STONE_SHAPE_OPTIONS.map((o) => (
                  <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FilterSection>
            <FilterSection label="Metal">
              <ToggleGroup
                type="multiple"
                variant="outline"
                spacing={2}
                value={draft.metal ?? []}
                onValueChange={(next: string[]) =>
                  setDraftFor("metal", next.length > 0 ? next : undefined)
                }
              >
                {JEWELRY_METAL_OPTIONS.map((o) => (
                  <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FilterSection>
            <FilterSection label="Style">
              <ToggleGroup
                type="multiple"
                variant="outline"
                spacing={2}
                value={draft.style ?? []}
                onValueChange={(next: string[]) =>
                  setDraftFor("style", next.length > 0 ? next : undefined)
                }
              >
                {JEWELRY_STYLE_OPTIONS.map((o) => (
                  <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FilterSection>
          </>
        ),
        onOpen: ctrl.openDrawer,
        onApply: ctrl.applyDraft,
        onClearDraft: ctrl.clearDraft,
        hasActiveDraft: ctrl.hasActiveDraft,
        resultsCount: preview.count,
        isCountLoading: preview.loading,
      }}
    >
      <PlpGridContainer loading={status === "loading"} skeletonCount={pageSize}>
        {gridItems}
      </PlpGridContainer>
    </AssemblyShell>
  );
}

// ── Story exports ─────────────────────────────────────────────────────

/**
 * One PLP at a time, switchable between Gemstones and Jewelry via the
 * `category` tweakable. Each selection renders the full assembly for a
 * real category with its own filter set, sort options, and sample data.
 */
type FullCategoryArgs = { category: "gemstones" | "jewelry" };

export const FullCategory: StoryObj<FullCategoryArgs> = {
  args: { category: "gemstones" },
  argTypes: {
    category: {
      control: { type: "radio" },
      options: ["gemstones", "jewelry"],
    },
  },
  render: ({ category }) => {
    if (category === "jewelry") return <JewelryInteractive />;
    return (
      <GemstoneInteractive
        breadcrumbs={[
          { label: "Gemstones", href: "#" },
          { label: "Sapphire" },
        ]}
        title="Sapphire"
        resultsCount={1234567}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search by certificate number or stock ID..."
        onSearchSubmit={fn()}
        gridItems={buildGemstoneCards(20)}
        totalItems={1234567}
        onRetry={fn()}
      />
    );
  },
};

export const DiamondsCategory: StoryObj = {
  render: () => (
    <DiamondInteractive
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      sortOptions={SORT_OPTIONS}
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      gridItems={buildDiamondCards(20)}
      totalItems={48291}
      onRetry={fn()}
    />
  ),
};

export const WithActiveFilters: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={342}
      initialFilterState={{
        color: ["blue", "green"],
        treatment: "heated",
        price: { price: { min: 1000, max: 5000 } },
        supplier: GEMSTONE_PRESELECTED_SUPPLIERS,
      }}
      sortOptions={SORT_OPTIONS}
      gridItems={buildGemstoneCards(20)}
      totalItems={342}
      onRetry={fn()}
    />
  ),
};

export const EmptyFiltered: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      initialFilterState={{ color: ["pink"], clarity: ["eye-clean"] }}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="empty-filtered"
    />
  ),
};

export const EmptyNoItems: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[
        { label: "Gemstones", href: "#" },
        { label: "Alexandrite" },
      ]}
      title="Alexandrite"
      resultsCount={0}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="empty-no-items"
      emptyMessage="No alexandrite available at the moment."
    />
  ),
};

export const Error: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="error"
      onRetry={fn()}
    />
  ),
};

export const DiamondListView: StoryObj = {
  render: () => (
    <DiamondInteractive
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      sortOptions={SORT_OPTIONS}
      gridItems={buildDiamondCards(20)}
      listHeader={<DiamondPlpListHeader />}
      listRows={buildDiamondRows(20)}
      listViewAvailable
      initialViewMode="list"
      totalItems={48291}
      onRetry={fn()}
    />
  ),
};

export const GemstoneListView: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      sortOptions={SORT_OPTIONS}
      gridItems={buildGemstoneCards(20)}
      listHeader={<GemstonePlpListHeader />}
      listRows={buildGemstoneRows(20)}
      listViewAvailable
      initialViewMode="list"
      totalItems={1234567}
      onRetry={fn()}
    />
  ),
};

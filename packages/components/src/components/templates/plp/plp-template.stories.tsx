import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PlpTemplate, type PlpTemplateProps } from "./plp-template";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemReturnable,
} from "./grid/plp-grid-item";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { Typography } from "../../atoms/typography/typography";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpFilterSection } from "./filters/plp-filter-section";
import { PlpQuickFilter } from "./toolbar/plp-quick-filter";
import { BooleanChipFilter } from "./filters/presets/boolean-chip";
import { SingleSelectChipsFilter } from "./filters/presets/single-select-chips";
import { MultiSelectChipsFilter } from "./filters/presets/multi-select-chips";
import { SingleSelectDropdownFilter } from "./filters/presets/single-select-dropdown";
import { RangeSliderFilter } from "./filters/presets/range-slider";
import { MultiAxisRangeFilter } from "./filters/presets/multi-axis-range";
import { AsyncComboboxFilter } from "./filters/presets/async-combobox";
import type { AsyncComboboxOption } from "./filters/presets/async-combobox";
import type { MultiSelectChipOption } from "./filters/presets/multi-select-chips";
import type { MultiAxisRangeAxis } from "./filters/presets/multi-axis-range";
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
import type { PlpStatus, PlpViewMode } from "./plp-types";
import type { PlpQuickFilterProps } from "./toolbar/plp-quick-filter";

// ── Reference wiring: useFilterController ─────────────────────────────
//
// This hook is the canonical pattern for wiring filter state into the
// PLP template. It is deliberately defined inside this story file (not
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
// Flips the template's `status` to "loading" for ~commit ms whenever the
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]);

  return effective;
}

// ── Chip-summary formatters ───────────────────────────────────────────
//
// Each preset has its own chip-summary shape; format helpers live here
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
  value: { min: number; max: number } | undefined,
  unit?: string
): string {
  if (!value) return "";
  return `${formatUnitValue(value.min, unit)}\u2013${formatUnitValue(value.max, unit)}`;
}

function formatMultiAxisChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axes: MultiAxisRangeAxis[]
): string {
  if (!value) return "";
  const segments: string[] = [];
  for (const axis of axes) {
    const v = value[axis.id];
    if (!v) continue;
    const abbrev = axis.label.charAt(0).toUpperCase();
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

  // Keyed builders so each filter button is a discrete ReactNode the
  // story can route into the right slot. Each button uses PlpQuickFilter
  // with a render-prop child choosing its preset component.
  return useMemo<Record<string, ReactNode>>(
    () => ({
      "nivoda-curated": (
        <PlpQuickFilter<true>
          key="nivoda-curated"
          label="Nivoda Curated"
          chipSummary="Only Nivoda Curated items"
          isActive={applied["nivoda-curated"] === true}
          initialValue={applied["nivoda-curated"]}
          onApply={(v) => setAppliedFor("nivoda-curated", v)}
          onClear={() => setAppliedFor("nivoda-curated", undefined)}
          onDismiss={() => setAppliedFor("nivoda-curated", undefined)}
        >
          {(v, set) => (
            <BooleanChipFilter
              value={v}
              onChange={set}
              label="Only Nivoda Curated items"
            />
          )}
        </PlpQuickFilter>
      ),
      color: (
        <PlpQuickFilter<string[]>
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
            <MultiSelectChipsFilter
              value={v}
              onChange={set}
              options={GEMSTONE_COLOR_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      clarity: (
        <PlpQuickFilter<string[]>
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
            <MultiSelectChipsFilter
              value={v}
              onChange={set}
              options={GEMSTONE_CLARITY_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      treatment: (
        <PlpQuickFilter<string>
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
            <SingleSelectChipsFilter
              value={v}
              onChange={set}
              options={GEMSTONE_TREATMENT_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      location: (
        <PlpQuickFilter<string>
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
          {(v, set) => (
            <SingleSelectDropdownFilter
              value={v}
              onChange={set}
              options={GEMSTONE_LOCATION_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      price: (
        <PlpQuickFilter<{ min: number; max: number }>
          key="price"
          label="Price"
          chipSummary={formatRangeChip(
            applied.price,
            GEMSTONE_PRICE_CONFIG.unit
          )}
          isActive={!!applied.price}
          initialValue={applied.price}
          onApply={(v) => setAppliedFor("price", v)}
          onClear={() => setAppliedFor("price", undefined)}
          onDismiss={() => setAppliedFor("price", undefined)}
        >
          {(v, set) => (
            <RangeSliderFilter
              value={v}
              onChange={set}
              min={GEMSTONE_PRICE_CONFIG.min}
              max={GEMSTONE_PRICE_CONFIG.max}
              step={GEMSTONE_PRICE_CONFIG.step}
              unit={GEMSTONE_PRICE_CONFIG.unit}
              histogram={GEMSTONE_PRICE_CONFIG.histogram}
            />
          )}
        </PlpQuickFilter>
      ),
      carat: (
        <PlpQuickFilter<{ min: number; max: number }>
          key="carat"
          label="Carat"
          chipSummary={formatRangeChip(
            applied.carat,
            GEMSTONE_CARAT_CONFIG.unit
          )}
          isActive={!!applied.carat}
          initialValue={applied.carat}
          onApply={(v) => setAppliedFor("carat", v)}
          onClear={() => setAppliedFor("carat", undefined)}
          onDismiss={() => setAppliedFor("carat", undefined)}
        >
          {(v, set) => (
            <RangeSliderFilter
              value={v}
              onChange={set}
              min={GEMSTONE_CARAT_CONFIG.min}
              max={GEMSTONE_CARAT_CONFIG.max}
              step={GEMSTONE_CARAT_CONFIG.step}
              unit={GEMSTONE_CARAT_CONFIG.unit}
              histogram={GEMSTONE_CARAT_CONFIG.histogram}
            />
          )}
        </PlpQuickFilter>
      ),
      size: (
        <PlpQuickFilter<Record<string, { min: number; max: number }>>
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
            <MultiAxisRangeFilter
              value={v}
              onChange={set}
              axes={GEMSTONE_SIZE_AXES}
            />
          )}
        </PlpQuickFilter>
      ),
      supplier: (
        <PlpQuickFilter<AsyncComboboxOption[]>
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
        </PlpQuickFilter>
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
      <PlpFilterSection label="Nivoda Curated" separator={false}>
        <BooleanChipFilter
          value={draft["nivoda-curated"]}
          onChange={(v) => setDraftFor("nivoda-curated", v)}
          label="Only Nivoda Curated items"
        />
      </PlpFilterSection>
      <PlpFilterSection label="Color">
        <MultiSelectChipsFilter
          value={draft.color}
          onChange={(v) => setDraftFor("color", v)}
          options={GEMSTONE_COLOR_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Clarity">
        <MultiSelectChipsFilter
          value={draft.clarity}
          onChange={(v) => setDraftFor("clarity", v)}
          options={GEMSTONE_CLARITY_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Treatment">
        <SingleSelectChipsFilter
          value={draft.treatment}
          onChange={(v) => setDraftFor("treatment", v)}
          options={GEMSTONE_TREATMENT_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Location">
        <SingleSelectDropdownFilter
          value={draft.location}
          onChange={(v) => setDraftFor("location", v)}
          options={GEMSTONE_LOCATION_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Price">
        <RangeSliderFilter
          value={draft.price}
          onChange={(v) => setDraftFor("price", v)}
          min={GEMSTONE_PRICE_CONFIG.min}
          max={GEMSTONE_PRICE_CONFIG.max}
          step={GEMSTONE_PRICE_CONFIG.step}
          unit={GEMSTONE_PRICE_CONFIG.unit}
          histogram={GEMSTONE_PRICE_CONFIG.histogram}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Carat">
        <RangeSliderFilter
          value={draft.carat}
          onChange={(v) => setDraftFor("carat", v)}
          min={GEMSTONE_CARAT_CONFIG.min}
          max={GEMSTONE_CARAT_CONFIG.max}
          step={GEMSTONE_CARAT_CONFIG.step}
          unit={GEMSTONE_CARAT_CONFIG.unit}
          histogram={GEMSTONE_CARAT_CONFIG.histogram}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Size (mm)">
        <MultiAxisRangeFilter
          value={draft.size}
          onChange={(v) => setDraftFor("size", v)}
          axes={GEMSTONE_SIZE_AXES}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Supplier">
        <AsyncComboboxFilter
          value={draft.supplier}
          onChange={(v) => setDraftFor("supplier", v)}
          searchFn={GEMSTONE_SUPPLIER_SEARCH}
          searchPlaceholder="Search suppliers..."
        />
      </PlpFilterSection>
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
        <PlpQuickFilter<string[]>
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
            <MultiSelectChipsFilter
              value={v}
              onChange={set}
              options={DIAMOND_SHAPE_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      color: (
        <PlpQuickFilter<string[]>
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
            <MultiSelectChipsFilter
              value={v}
              onChange={set}
              options={DIAMOND_COLOR_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      clarity: (
        <PlpQuickFilter<string[]>
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
            <MultiSelectChipsFilter
              value={v}
              onChange={set}
              options={DIAMOND_CLARITY_OPTIONS}
            />
          )}
        </PlpQuickFilter>
      ),
      price: (
        <PlpQuickFilter<{ min: number; max: number }>
          key="price"
          label="Price"
          chipSummary={formatRangeChip(
            applied.price,
            DIAMOND_PRICE_CONFIG.unit
          )}
          isActive={!!applied.price}
          initialValue={applied.price}
          onApply={(v) => setAppliedFor("price", v)}
          onClear={() => setAppliedFor("price", undefined)}
          onDismiss={() => setAppliedFor("price", undefined)}
        >
          {(v, set) => (
            <RangeSliderFilter
              value={v}
              onChange={set}
              min={DIAMOND_PRICE_CONFIG.min}
              max={DIAMOND_PRICE_CONFIG.max}
              step={DIAMOND_PRICE_CONFIG.step}
              unit={DIAMOND_PRICE_CONFIG.unit}
              histogram={DIAMOND_PRICE_CONFIG.histogram}
            />
          )}
        </PlpQuickFilter>
      ),
      carat: (
        <PlpQuickFilter<{ min: number; max: number }>
          key="carat"
          label="Carat"
          chipSummary={formatRangeChip(
            applied.carat,
            DIAMOND_CARAT_CONFIG.unit
          )}
          isActive={!!applied.carat}
          initialValue={applied.carat}
          onApply={(v) => setAppliedFor("carat", v)}
          onClear={() => setAppliedFor("carat", undefined)}
          onDismiss={() => setAppliedFor("carat", undefined)}
        >
          {(v, set) => (
            <RangeSliderFilter
              value={v}
              onChange={set}
              min={DIAMOND_CARAT_CONFIG.min}
              max={DIAMOND_CARAT_CONFIG.max}
              step={DIAMOND_CARAT_CONFIG.step}
              unit={DIAMOND_CARAT_CONFIG.unit}
              histogram={DIAMOND_CARAT_CONFIG.histogram}
            />
          )}
        </PlpQuickFilter>
      ),
      size: (
        <PlpQuickFilter<Record<string, { min: number; max: number }>>
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
            <MultiAxisRangeFilter
              value={v}
              onChange={set}
              axes={DIAMOND_SIZE_AXES}
            />
          )}
        </PlpQuickFilter>
      ),
      supplier: (
        <PlpQuickFilter<AsyncComboboxOption[]>
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
        </PlpQuickFilter>
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
      <PlpFilterSection label="Shape" separator={false}>
        <MultiSelectChipsFilter
          value={draft.shape}
          onChange={(v) => setDraftFor("shape", v)}
          options={DIAMOND_SHAPE_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Color">
        <MultiSelectChipsFilter
          value={draft.color}
          onChange={(v) => setDraftFor("color", v)}
          options={DIAMOND_COLOR_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Clarity">
        <MultiSelectChipsFilter
          value={draft.clarity}
          onChange={(v) => setDraftFor("clarity", v)}
          options={DIAMOND_CLARITY_OPTIONS}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Price">
        <RangeSliderFilter
          value={draft.price}
          onChange={(v) => setDraftFor("price", v)}
          min={DIAMOND_PRICE_CONFIG.min}
          max={DIAMOND_PRICE_CONFIG.max}
          step={DIAMOND_PRICE_CONFIG.step}
          unit={DIAMOND_PRICE_CONFIG.unit}
          histogram={DIAMOND_PRICE_CONFIG.histogram}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Carat">
        <RangeSliderFilter
          value={draft.carat}
          onChange={(v) => setDraftFor("carat", v)}
          min={DIAMOND_CARAT_CONFIG.min}
          max={DIAMOND_CARAT_CONFIG.max}
          step={DIAMOND_CARAT_CONFIG.step}
          unit={DIAMOND_CARAT_CONFIG.unit}
          histogram={DIAMOND_CARAT_CONFIG.histogram}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Size (mm)">
        <MultiAxisRangeFilter
          value={draft.size}
          onChange={(v) => setDraftFor("size", v)}
          axes={DIAMOND_SIZE_AXES}
        />
      </PlpFilterSection>
      <PlpFilterSection label="Supplier">
        <AsyncComboboxFilter
          value={draft.supplier}
          onChange={(v) => setDraftFor("supplier", v)}
          searchFn={DIAMOND_SUPPLIER_SEARCH}
          searchPlaceholder="Search suppliers..."
        />
      </PlpFilterSection>
    </>
  );
}

// ── Toolbar + sticky slot routing ─────────────────────────────────────
//
// Given a buttons-by-id map, a pinned id list, and the currently active
// ids, produce the two slot arrays the template consumes:
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

// ── Helpers ───────────────────────────────────────────────

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

// ── Story meta ────────────────────────────────────────────

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

// ── Shared interactive wrappers ───────────────────────────

type InteractiveTemplateShellProps = Omit<
  PlpTemplateProps,
  | "toolbarFilters"
  | "stickyFilters"
  | "activeFilterCount"
  | "hasActiveFilters"
  | "onOpenDrawer"
  | "onClearAll"
  | "sortValue"
  | "onSortChange"
  | "page"
  | "onPageChange"
  | "pageSize"
  | "onPageSizeChange"
  | "viewMode"
  | "onViewModeChange"
  | "status"
> & {
  initialSortValue?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialViewMode?: PlpViewMode;
  baselineStatus?: PlpStatus;
};

/**
 * Local state for sort/page/view mode + simulated commit status.
 * Filter state is supplied by the caller via the controller.
 */
function usePlpShellState({
  initialSortValue = "price-asc",
  initialPage = 1,
  initialPageSize = 20,
  initialViewMode = "grid",
  baselineStatus = "success",
  applied,
}: {
  initialSortValue?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialViewMode?: PlpViewMode;
  baselineStatus?: PlpStatus;
  applied: object;
}) {
  const [sortValue, setSortValue] = useState(initialSortValue);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [viewMode, setViewMode] = useState<PlpViewMode>(initialViewMode);
  const status = useSimulatedCommitStatus(applied, baselineStatus);

  return {
    sortValue,
    setSortValue,
    page,
    setPage,
    pageSize,
    setPageSize,
    viewMode,
    setViewMode,
    status,
  };
}

// ── Stories ───────────────────────────────────────────────

function GemstoneInteractive({
  initialFilterState = {},
  ...shellProps
}: InteractiveTemplateShellProps & {
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
  const shell = usePlpShellState({
    ...shellProps,
    applied: ctrl.applied,
  });

  return (
    <>
      <PlpTemplate
        {...shellProps}
        toolbarFilters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={ctrl.activeCount}
        hasActiveFilters={ctrl.activeCount > 0}
        onOpenDrawer={ctrl.openDrawer}
        onClearAll={ctrl.clearAll}
        sortValue={shell.sortValue}
        onSortChange={shell.setSortValue}
        page={shell.page}
        onPageChange={shell.setPage}
        pageSize={shell.pageSize}
        onPageSizeChange={shell.setPageSize}
        viewMode={shell.viewMode}
        onViewModeChange={shell.setViewMode}
        status={shell.status}
      />
      <PlpFilterDrawer
        open={ctrl.drawerOpen}
        onOpenChange={ctrl.setDrawerOpen}
        onApply={ctrl.applyDraft}
        onClearDraft={ctrl.clearDraft}
        hasActiveDraft={ctrl.hasActiveDraft}
        resultsCount={preview.count}
        isCountLoading={preview.loading}
      >
        <GemstoneDrawerBody ctrl={ctrl} />
      </PlpFilterDrawer>
    </>
  );
}

function DiamondInteractive({
  initialFilterState = {},
  ...shellProps
}: InteractiveTemplateShellProps & {
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
  const shell = usePlpShellState({
    ...shellProps,
    applied: ctrl.applied,
  });

  return (
    <>
      <PlpTemplate
        {...shellProps}
        toolbarFilters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={ctrl.activeCount}
        hasActiveFilters={ctrl.activeCount > 0}
        onOpenDrawer={ctrl.openDrawer}
        onClearAll={ctrl.clearAll}
        sortValue={shell.sortValue}
        onSortChange={shell.setSortValue}
        page={shell.page}
        onPageChange={shell.setPage}
        pageSize={shell.pageSize}
        onPageSizeChange={shell.setPageSize}
        viewMode={shell.viewMode}
        onViewModeChange={shell.setViewMode}
        status={shell.status}
      />
      <PlpFilterDrawer
        open={ctrl.drawerOpen}
        onOpenChange={ctrl.setDrawerOpen}
        onApply={ctrl.applyDraft}
        onClearDraft={ctrl.clearDraft}
        hasActiveDraft={ctrl.hasActiveDraft}
        resultsCount={preview.count}
        isCountLoading={preview.loading}
      >
        <DiamondDrawerBody ctrl={ctrl} />
      </PlpFilterDrawer>
    </>
  );
}

export const GemstoneCategory: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      sortOptions={SORT_OPTIONS}
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      gridItems={buildGemstoneCards(20)}
      totalItems={1234567}
      onRetry={fn()}
    />
  ),
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
        price: { min: 1000, max: 5000 },
        supplier: GEMSTONE_PRESELECTED_SUPPLIERS,
      }}
      sortOptions={SORT_OPTIONS}
      gridItems={buildGemstoneCards(20)}
      totalItems={342}
      onRetry={fn()}
    />
  ),
};

// ── Jewelry — inlines its own filter schema to show the composition pattern

interface JewelryFilterState {
  "stone-shape"?: string[];
  metal?: string[];
  style?: string[];
}

const JEWELRY_STONE_SHAPE_OPTIONS: MultiSelectChipOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
];

const JEWELRY_METAL_OPTIONS: MultiSelectChipOption[] = [
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "silver", label: "Silver" },
];

const JEWELRY_STYLE_OPTIONS: MultiSelectChipOption[] = [
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
      <PlpQuickFilter<string[]>
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
          <MultiSelectChipsFilter
            value={v}
            onChange={set}
            options={JEWELRY_STONE_SHAPE_OPTIONS}
          />
        )}
      </PlpQuickFilter>
    ),
    metal: (
      <PlpQuickFilter<string[]>
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
          <MultiSelectChipsFilter
            value={v}
            onChange={set}
            options={JEWELRY_METAL_OPTIONS}
          />
        )}
      </PlpQuickFilter>
    ),
    style: (
      <PlpQuickFilter<string[]>
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
          <MultiSelectChipsFilter
            value={v}
            onChange={set}
            options={JEWELRY_STYLE_OPTIONS}
          />
        )}
      </PlpQuickFilter>
    ),
  };

  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    JEWELRY_PINNED_IDS,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);
  const shell = usePlpShellState({
    initialSortValue: "featured",
    applied: ctrl.applied,
  });

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
    <>
      <PlpTemplate
        breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Wedding rings" }]}
        title="Wedding rings"
        resultsCount={1234567}
        toolbarFilters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={ctrl.activeCount}
        hasActiveFilters={ctrl.activeCount > 0}
        onOpenDrawer={ctrl.openDrawer}
        onClearAll={ctrl.clearAll}
        sortOptions={[
          { value: "featured", label: "Featured" },
          ...SORT_OPTIONS.slice(0, 2),
        ]}
        sortValue={shell.sortValue}
        onSortChange={shell.setSortValue}
        gridItems={gridItems}
        page={shell.page}
        onPageChange={shell.setPage}
        pageSize={shell.pageSize}
        onPageSizeChange={shell.setPageSize}
        totalItems={1234567}
        status={shell.status}
        onRetry={fn()}
      />
      <PlpFilterDrawer
        open={ctrl.drawerOpen}
        onOpenChange={ctrl.setDrawerOpen}
        onApply={ctrl.applyDraft}
        onClearDraft={ctrl.clearDraft}
        hasActiveDraft={ctrl.hasActiveDraft}
        resultsCount={preview.count}
        isCountLoading={preview.loading}
      >
        <PlpFilterSection label="Stone shape" separator={false}>
          <MultiSelectChipsFilter
            value={draft["stone-shape"]}
            onChange={(v) => setDraftFor("stone-shape", v)}
            options={JEWELRY_STONE_SHAPE_OPTIONS}
          />
        </PlpFilterSection>
        <PlpFilterSection label="Metal">
          <MultiSelectChipsFilter
            value={draft.metal}
            onChange={(v) => setDraftFor("metal", v)}
            options={JEWELRY_METAL_OPTIONS}
          />
        </PlpFilterSection>
        <PlpFilterSection label="Style">
          <MultiSelectChipsFilter
            value={draft.style}
            onChange={(v) => setDraftFor("style", v)}
            options={JEWELRY_STYLE_OPTIONS}
          />
        </PlpFilterSection>
      </PlpFilterDrawer>
    </>
  );
}

export const JewelryCategory: StoryObj = {
  render: () => <JewelryInteractive />,
};

// ── Custom filter inside a quick filter ───────────────────
//
// Demonstrates that any React node can sit inside a PlpQuickFilter's
// children — not just the shipped presets. Here, a star-rating control
// is composed inline.

interface CustomRatingFilterState {
  "quality-rating"?: string;
  color?: string[];
  clarity?: string[];
}

function CustomRatingInteractive() {
  const ctrl = useFilterController<CustomRatingFilterState>({});
  const { applied, setAppliedFor, draft, setDraftFor } = ctrl;

  const colorButton = (
    <PlpQuickFilter<string[]>
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
        <MultiSelectChipsFilter
          value={v}
          onChange={set}
          options={GEMSTONE_COLOR_OPTIONS}
        />
      )}
    </PlpQuickFilter>
  );

  const clarityButton = (
    <PlpQuickFilter<string[]>
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
        <MultiSelectChipsFilter
          value={v}
          onChange={set}
          options={GEMSTONE_CLARITY_OPTIONS}
        />
      )}
    </PlpQuickFilter>
  );

  const ratingButton: ReactNode = (() => {
    const props: PlpQuickFilterProps<string> = {
      label: "Quality Rating",
      chipSummary: applied["quality-rating"]
        ? `${applied["quality-rating"]}+ stars`
        : undefined,
      isActive: !!applied["quality-rating"],
      initialValue: applied["quality-rating"],
      onApply: (v) => setAppliedFor("quality-rating", v),
      onClear: () => setAppliedFor("quality-rating", undefined),
      onDismiss: () => setAppliedFor("quality-rating", undefined),
      children: (v, set) => (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-xl ${Number(v) >= star ? "text-warning" : "text-muted"}`}
              onClick={() => set(String(star))}
            >
              ★
            </button>
          ))}
        </div>
      ),
    };
    return <PlpQuickFilter key="quality-rating" {...props} />;
  })();

  const buttons: Record<string, ReactNode> = {
    color: colorButton,
    clarity: clarityButton,
    "quality-rating": ratingButton,
  };
  const pinnedIds = ["color", "clarity", "quality-rating"] as const;
  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    pinnedIds,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);
  const shell = usePlpShellState({ applied: ctrl.applied });

  return (
    <>
      <PlpTemplate
        breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
        title="Sapphire"
        resultsCount={1234567}
        toolbarFilters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={ctrl.activeCount}
        hasActiveFilters={ctrl.activeCount > 0}
        onOpenDrawer={ctrl.openDrawer}
        onClearAll={ctrl.clearAll}
        sortOptions={SORT_OPTIONS}
        sortValue={shell.sortValue}
        onSortChange={shell.setSortValue}
        gridItems={buildGemstoneCards(20)}
        page={shell.page}
        onPageChange={shell.setPage}
        pageSize={shell.pageSize}
        onPageSizeChange={shell.setPageSize}
        totalItems={1234567}
        status={shell.status}
        onRetry={fn()}
      />
      <PlpFilterDrawer
        open={ctrl.drawerOpen}
        onOpenChange={ctrl.setDrawerOpen}
        onApply={ctrl.applyDraft}
        onClearDraft={ctrl.clearDraft}
        hasActiveDraft={ctrl.hasActiveDraft}
        resultsCount={preview.count}
        isCountLoading={preview.loading}
      >
        <PlpFilterSection label="Color" separator={false}>
          <MultiSelectChipsFilter
            value={draft.color}
            onChange={(v) => setDraftFor("color", v)}
            options={GEMSTONE_COLOR_OPTIONS}
          />
        </PlpFilterSection>
        <PlpFilterSection label="Clarity">
          <MultiSelectChipsFilter
            value={draft.clarity}
            onChange={(v) => setDraftFor("clarity", v)}
            options={GEMSTONE_CLARITY_OPTIONS}
          />
        </PlpFilterSection>
        <PlpFilterSection label="Quality Rating">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-xl ${
                  Number(draft["quality-rating"]) >= star
                    ? "text-warning"
                    : "text-muted"
                }`}
                onClick={() => setDraftFor("quality-rating", String(star))}
              >
                ★
              </button>
            ))}
          </div>
        </PlpFilterSection>
      </PlpFilterDrawer>
    </>
  );
}

export const WithCustomFilter: StoryObj = {
  render: () => <CustomRatingInteractive />,
};

// ── Static status stories (loading / empty / error) ───────

export const Loading: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      activeFilterCount={0}
      hasActiveFilters={false}
      onOpenDrawer={fn()}
      onClearAll={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="loading"
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
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Alexandrite" }]}
      title="Alexandrite"
      resultsCount={0}
      activeFilterCount={0}
      hasActiveFilters={false}
      onOpenDrawer={fn()}
      onClearAll={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="empty-no-items"
      emptyMessage="No alexandrite available at the moment."
    />
  ),
};

export const Error: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      activeFilterCount={0}
      hasActiveFilters={false}
      onOpenDrawer={fn()}
      onClearAll={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="error"
      onRetry={fn()}
    />
  ),
};

// ── List-view stories ─────────────────────────────────────

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

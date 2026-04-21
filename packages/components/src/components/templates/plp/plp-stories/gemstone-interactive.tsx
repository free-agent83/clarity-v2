// ── GemstoneInteractive ───────────────────────────────────────────────

import { useMemo, useState, type ReactNode } from "react";
import { fn } from "@storybook/test";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { FilterButton } from "../../../atoms/filter-button/filter-button";
import { Label } from "../../../atoms/label/label";
import { Switch } from "../../../atoms/switch/switch";
import { ToggleGroup, ToggleGroupItem } from "../../../atoms/toggle-group/toggle-group";
import { AsyncComboboxFilter } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import type { AsyncComboboxOption } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import { RangeFilter } from "../../../molecules/range-filter/range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import {
  FilterSection,
} from "../../../organisms/filter-toolbar/filter-toolbar";
import { PlpGridContainer } from "../plp-grid-container";
import { PlpListContainer } from "../plp-list-container";
import { useIsTabletUp } from "../../../../hooks/use-is-tablet-up";
import type { PlpViewMode } from "../plp-types";
import {
  GEMSTONE_CARAT_CONFIG,
  GEMSTONE_CLARITY_OPTIONS,
  GEMSTONE_COLOR_OPTIONS,
  GEMSTONE_LOCATION_OPTIONS,
  GEMSTONE_PRICE_CONFIG,
  GEMSTONE_SIZE_AXES,
  GEMSTONE_SUPPLIER_SEARCH,
  GEMSTONE_TREATMENT_OPTIONS,
  GemstonePlpGridItem,
  GemstonePlpListRow,
  generateGemstoneItems,
  type GemstoneFilterState,
} from "../mocks/gemstone";
import {
  useFilterController,
  usePreviewCount,
  useSimulatedCommitStatus,
  routeFilterSlots,
} from "../__stories__/shared/controller";
import { formatMultiSelectChip, formatRangeChip, formatMultiAxisChip, labelForValue } from "../__stories__/shared/formatters";
import {
  AssemblyShell,
  InlinePagination,
  renderPlpEmptyState,
  type InteractiveShellProps,
} from "../__stories__/shared/assembly";

// ── Gemstone filter buttons ───────────────────────────────────────────

const GEMSTONE_PINNED_IDS = [
  "nivoda-curated",
  "color",
  "price",
] as const;

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

// ── Card/row builder helpers ──────────────────────────────────────────

export function buildGemstoneCards(count: number): ReactNode[] {
  return generateGemstoneItems(count).map((item) => (
    <GemstonePlpGridItem key={item.id} item={item} />
  ));
}

export function buildGemstoneRows(count: number): ReactNode[] {
  return generateGemstoneItems(count).map((item) => (
    <GemstonePlpListRow key={item.id} item={item} onClick={fn()} />
  ));
}

export function GemstoneInteractive({
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
  banner,
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
      banner={banner}
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
              variant="outline"
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

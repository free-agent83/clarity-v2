// ── DiamondInteractive ────────────────────────────────────────────────

import { useMemo, useState, type ReactNode } from "react";
import { fn } from "@storybook/test";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { FilterButton } from "../../../atoms/filter-button/filter-button";
import { ToggleGroup, ToggleGroupItem } from "../../../atoms/toggle-group/toggle-group";
import { AsyncComboboxFilter } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import type { AsyncComboboxOption } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import { RangeFilter } from "../../../molecules/range-filter/range-filter";
import {
  FilterSection,
} from "../../../organisms/filter-toolbar/filter-toolbar";
import { PlpGridContainer } from "../plp-grid-container";
import { PlpListContainer } from "../plp-list-container";
import { useIsTabletUp } from "../../../../hooks/use-is-tablet-up";
import type { PlpViewMode } from "../plp-types";
import {
  DIAMOND_CARAT_CONFIG,
  DIAMOND_CLARITY_OPTIONS,
  DIAMOND_COLOR_OPTIONS,
  DIAMOND_PRICE_CONFIG,
  DIAMOND_SHAPE_OPTIONS,
  DIAMOND_SIZE_AXES,
  DIAMOND_SUPPLIER_SEARCH,
  DiamondPlpGridItem,
  DiamondPlpListRow,
  generateDiamondItems,
  type DiamondFilterState,
} from "../mocks/diamond";
import { useFilterController, usePreviewCount, useSimulatedCommitStatus } from "./controller";
import { formatMultiSelectChip, formatRangeChip, formatMultiAxisChip } from "./formatters";
import {
  AssemblyShell,
  InlinePagination,
  renderPlpEmptyState,
  routeFilterSlots,
  type InteractiveShellProps,
} from "./assembly";

// ── Diamond filter buttons ────────────────────────────────────────────

const DIAMOND_PINNED_IDS = ["shape", "color", "price"] as const;

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
              (DIAMOND_SHAPE_OPTIONS.find((o) => o.value === v)?.label ?? v)
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

// ── Card/row builder helpers ──────────────────────────────────────────

export function buildDiamondCards(count: number): ReactNode[] {
  return generateDiamondItems(count).map((item) => (
    <DiamondPlpGridItem key={item.id} item={item} />
  ));
}

export function buildDiamondRows(count: number): ReactNode[] {
  return generateDiamondItems(count).map((item) => (
    <DiamondPlpListRow key={item.id} item={item} onClick={fn()} />
  ));
}

export function DiamondInteractive({
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

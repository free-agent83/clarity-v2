// ── GemstoneInteractive ───────────────────────────────────────────────

import { useState, type ReactNode } from "react";
import { fn } from "@storybook/test";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "../../../../atoms/toggle-group/toggle-group";
import { PlpGridContainer } from "../../plp-grid-container";
import { PlpListContainer } from "../../plp-list-container";
import { useIsTabletUp } from "../../../../../hooks/use-is-tablet-up";
import type { PlpViewMode } from "../../plp-types";
import {
  useFilterController,
  usePreviewCount,
  useSimulatedCommitStatus,
  routeFilterSlots,
} from "../shared/controller";
import {
  AssemblyShell,
  InlinePagination,
  renderPlpEmptyState,
  type InteractiveShellProps,
} from "../shared/assembly";
import { generateGemstoneItems, type GemstoneFilterState } from "./api";
import {
  GemstonePlpGridItem,
  GemstonePlpListRow,
} from "./renderers";
import {
  GEMSTONE_PINNED_IDS,
  GemstoneDrawerBody,
  useGemstoneFilterButtons,
} from "./filters";

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

// ── Jewelry — inline filter schema to show the composition pattern ────

import { useState, type ReactNode } from "react";
import { fn } from "@storybook/test";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { FilterButton } from "../../../atoms/filter-button/filter-button";
import { ToggleGroup, ToggleGroupItem } from "../../../atoms/toggle-group/toggle-group";
import { Typography } from "../../../atoms/typography/typography";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemReturnable,
} from "../grid/plp-grid-item";
import {
  PlpListCell,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRow,
  PlpListRowCheckbox,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowName,
  PlpListRowPrice,
  PlpListRowReturnable,
} from "../list/plp-list-row";
import { PlpGridContainer } from "../plp-grid-container";
import { PlpListContainer } from "../plp-list-container";
import { useIsTabletUp } from "../../../../hooks/use-is-tablet-up";
import type { PlpViewMode } from "../plp-types";
import { SORT_OPTIONS } from "../mocks/common";
import ringImg from "../mocks/images/ring.jpg";
import { FilterSection } from "../../../organisms/filter-toolbar/filter-toolbar";
import { useFilterController, usePreviewCount, useSimulatedCommitStatus } from "./controller";
import { formatMultiSelectChip, labelForValue } from "./formatters";
import {
  AssemblyShell,
  InlinePagination,
  routeFilterSlots,
} from "./assembly";

// ── Jewelry filter state ──────────────────────────────────────────────

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

// ── Jewellery list-view helpers ───────────────────────────────────────
//
// Minimal header + rows inline in the story since Jewellery doesn't
// have its own mock / primitives folder. Real consumers would assemble
// these the same way gemstone / diamond mocks do.

export function JewelryPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell width={44}>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell width={72}>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell>Name</PlpListHeaderCell>
      <PlpListHeaderCell>SKU</PlpListHeaderCell>
      <PlpListHeaderCell>Delivery</PlpListHeaderCell>
      <PlpListHeaderCell>Returns</PlpListHeaderCell>
      <PlpListHeaderCell>Price</PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export function buildJewelryListRows(count: number): ReactNode[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `ring-${i}`;
    return (
      <PlpListRow key={id}>
        <PlpListCell>
          <PlpListRowCheckbox checked={false} onChange={fn()} />
        </PlpListCell>
        <PlpListCell>
          <PlpListRowMedia
            image={ringImg}
            imageAlt="Three-Stone Anniversary Band"
          />
        </PlpListCell>
        <PlpListCell>
          <PlpListRowName>Three-Stone Anniversary Band</PlpListRowName>
        </PlpListCell>
        <PlpListCell>
          <span className="font-mono text-xs">SKU 100019ERDPL</span>
        </PlpListCell>
        <PlpListCell>
          <PlpListRowDelivery
            variant="regular"
            date="Nov 18 – 23"
            shipsFrom="United States"
          />
        </PlpListCell>
        <PlpListCell>
          <PlpListRowReturnable variant="returnable" />
        </PlpListCell>
        <PlpListCell>
          <PlpListRowPrice amount={9999} currency="USD" />
        </PlpListCell>
      </PlpListRow>
    );
  });
}

interface JewelryInteractiveProps {
  listHeader?: ReactNode;
  listRows?: ReactNode[];
  listViewAvailable?: boolean;
  initialViewMode?: PlpViewMode;
}

export function JewelryInteractive({
  listHeader,
  listRows,
  listViewAvailable = false,
  initialViewMode = "grid",
}: JewelryInteractiveProps = {}) {
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
  const [view, setView] = useState<PlpViewMode>(initialViewMode);
  const status = useSimulatedCommitStatus(ctrl.applied, "success");
  const isTabletUp = useIsTabletUp();
  const effectiveView: PlpViewMode =
    listViewAvailable && isTabletUp && view === "list" ? "list" : "grid";

  const totalItems = 1234567;

  const items = Array.from({ length: 20 }, (_, i) => ({
    id: `ring-${i}`,
    name: "Three-Stone Anniversary Band",
    image: ringImg,
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
      {effectiveView === "list" ? (
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

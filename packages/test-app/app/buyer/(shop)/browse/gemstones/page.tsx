import {
  GEMSTONE_FILTERS,
  fetchGemstoneListFiltered,
} from "@/lib/api/gemstones";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { GemstonePlpItem } from "@/components/products/gemstone-plp-item";
import {
  GemstonePlpListHeader,
  GemstonePlpListRow,
} from "@/components/products/gemstone-plp-list";
import { parsePlpViewMode } from "@/lib/plp-view-mode";

import { GemstonesFilters } from "./filters";

export default async function GemstonesListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parsePageListParams(params, GEMSTONE_FILTERS);
  const viewMode = parsePlpViewMode(params.view);
  const { items, totalItems } = await fetchGemstoneListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
  );

  const breadcrumbs = [{ label: "Gemstones", href: "/buyer/browse/gemstones" }];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Gemstones"
      resultCount={totalItems}
      toolbar={<GemstonesFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}      viewMode={viewMode}
      listHeader={viewMode === "list" ? <GemstonePlpListHeader /> : undefined}
    >
      {items.map((item) =>
        viewMode === "list" ? (
          <GemstonePlpListRow
            key={item.id}
            item={item}
            href={`/buyer/browse/gemstones/${item.id}`}
          />
        ) : (
          <GemstonePlpItem
            key={item.id}
            item={item}
            href={`/buyer/browse/gemstones/${item.id}`}
          />
        ),
      )}
    </LayoutPlp>
  );
}

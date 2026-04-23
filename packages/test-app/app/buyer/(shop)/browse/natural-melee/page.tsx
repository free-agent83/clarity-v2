import { MELEE_FILTERS, fetchMeleeListFiltered } from "@/lib/api/melee";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { MeleePlpItem } from "@/components/products/melee-plp-item";
import {
  MeleePlpListHeader,
  MeleePlpListRow,
} from "@/components/products/melee-plp-list";
import { parsePlpViewMode } from "@/lib/plp-view-mode";

import { NaturalMeleeFilters } from "./filters";

export default async function NaturalMeleeListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parsePageListParams(params, MELEE_FILTERS);
  const viewMode = parsePlpViewMode(params.view);
  const { items, totalItems } = await fetchMeleeListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
    false,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
  );

  const breadcrumbs = [
    { label: "Natural melee", href: "/buyer/browse/natural-melee" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Natural Melee"
      resultCount={totalItems}
      toolbar={<NaturalMeleeFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}      viewMode={viewMode}
      listHeader={viewMode === "list" ? <MeleePlpListHeader /> : undefined}
    >
      {items.map((item) =>
        viewMode === "list" ? (
          <MeleePlpListRow
            key={item.id}
            item={item}
            href={`/buyer/browse/natural-melee/${item.id}`}
            category="natural_melee"
          />
        ) : (
          <MeleePlpItem
            key={item.id}
            item={item}
            href={`/buyer/browse/natural-melee/${item.id}`}
            category="natural_melee"
          />
        ),
      )}
    </LayoutPlp>
  );
}

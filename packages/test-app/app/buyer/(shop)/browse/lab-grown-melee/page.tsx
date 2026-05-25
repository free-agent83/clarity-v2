import { MELEE_FILTERS, fetchMeleeListFiltered } from "@/lib/api/melee";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { checkSimulateError } from "@/lib/api/_simulate";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { MeleePlpItem } from "@/components/products/melee-plp-item";
import {
  MeleePlpListHeader,
  MeleePlpListRow,
} from "@/components/products/melee-plp-list";
import { parsePlpViewMode } from "@/lib/plp-view-mode";

import { LabGrownMeleeFilters } from "./filters";

export default async function LabGrownMeleeListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  checkSimulateError(params);
  const parsed = parsePageListParams(params, MELEE_FILTERS);
  const viewMode = parsePlpViewMode(params.view);
  const { items, totalItems } = await fetchMeleeListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
    true,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
  );

  const breadcrumbs = [
    { label: "Lab-grown melee", href: "/buyer/browse/lab-grown-melee" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Lab Grown Melee"
      resultCount={totalItems}
      toolbar={<LabGrownMeleeFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}      viewMode={viewMode}
      listHeader={viewMode === "list" ? <MeleePlpListHeader /> : undefined}
    >
      {items.map((item) =>
        viewMode === "list" ? (
          <MeleePlpListRow
            key={item.id}
            item={item}
            href={`/buyer/browse/lab-grown-melee/${item.id}`}
            category="lab_grown_melee"
          />
        ) : (
          <MeleePlpItem
            key={item.id}
            item={item}
            href={`/buyer/browse/lab-grown-melee/${item.id}`}
            category="lab_grown_melee"
          />
        ),
      )}
    </LayoutPlp>
  );
}

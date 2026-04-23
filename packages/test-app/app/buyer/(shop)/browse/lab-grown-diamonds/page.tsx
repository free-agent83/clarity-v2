import {
  DIAMOND_FILTERS,
  fetchDiamondListFiltered,
} from "@/lib/api/diamonds";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { ShowroomBanner } from "@/components/products/showroom-banner";
import { DiamondPlpItem } from "@/components/products/diamond-plp-item";
import {
  DiamondPlpListHeader,
  DiamondPlpListRow,
} from "@/components/products/diamond-plp-list";
import { parsePlpViewMode } from "@/lib/plp-view-mode";

import { LabGrownDiamondsFilters } from "./filters";

export default async function LabGrownDiamondsListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parsePageListParams(params, DIAMOND_FILTERS);
  const viewMode = parsePlpViewMode(params.view);
  const { items, totalItems } = await fetchDiamondListFiltered(
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
    { label: "Lab grown diamonds", href: "/buyer/browse/lab-grown-diamonds" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Lab Grown Diamonds"
      resultCount={totalItems}
      banner={<ShowroomBanner />}
      toolbar={<LabGrownDiamondsFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}      viewMode={viewMode}
      listHeader={viewMode === "list" ? <DiamondPlpListHeader /> : undefined}
    >
      {items.map((item) =>
        viewMode === "list" ? (
          <DiamondPlpListRow
            key={item.id}
            item={item}
            href={`/buyer/browse/lab-grown-diamonds/${item.id}`}
            category="lab_grown_diamond"
          />
        ) : (
          <DiamondPlpItem
            key={item.id}
            item={item}
            href={`/buyer/browse/lab-grown-diamonds/${item.id}`}
            category="lab_grown_diamond"
          />
        ),
      )}
    </LayoutPlp>
  );
}

import {
  DIAMOND_FILTERS,
  fetchDiamondListFiltered,
} from "@/lib/api/diamonds";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { DiamondPlpItem } from "@/components/products/diamond-plp-item";

import { LabGrownDiamondsFilters } from "./filters";

export default async function LabGrownDiamondsListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const parsed = parsePageListParams(await searchParams, DIAMOND_FILTERS);
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
      toolbar={<LabGrownDiamondsFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}
      perPage={parsed.pagination.perPage}
    >
      {items.map((item) => (
        <DiamondPlpItem
          key={item.id}
          item={item}
          href={`/buyer/browse/lab-grown-diamonds/${item.id}`}
          category="lab_grown_diamond"
        />
      ))}
    </LayoutPlp>
  );
}

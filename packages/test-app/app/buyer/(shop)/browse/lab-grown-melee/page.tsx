import { MELEE_FILTERS, fetchMeleeListFiltered } from "@/lib/api/melee";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { MeleePlpItem } from "@/components/products/melee-plp-item";

import { LabGrownMeleeFilters } from "./filters";

export default async function LabGrownMeleeListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const parsed = parsePageListParams(await searchParams, MELEE_FILTERS);
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
      totalPages={totalPages}
      perPage={parsed.pagination.perPage}
    >
      {items.map((item) => (
        <MeleePlpItem
          key={item.id}
          item={item}
          href={`/buyer/browse/lab-grown-melee/${item.id}`}
          category="lab_grown_melee"
        />
      ))}
    </LayoutPlp>
  );
}

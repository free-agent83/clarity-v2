import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-plp/layout-plp";
import { EngagementRingPlpItem } from "@/components/products/engagement-ring-plp-item";

import { fetchEngagementRingList } from "@/lib/api/jewelry";

import { EngagementRingsFilters } from "./filters";

export default async function JewelryListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const params = await searchParams;

  const {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    perPage,
  } = await fetchEngagementRingList({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
    perPageOptions: PER_PAGE_OPTIONS,
  });

  const breadcrumbs = [
    { label: "Jewellery", href: "/buyer/browse/jewelry" },
    {
      label: "Engagement rings",
      href: "/buyer/browse/jewelry/engagement-rings",
    },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Engagement Rings"
      resultCount={totalItems}
      toolbar={<EngagementRingsFilters />}
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => (
        <EngagementRingPlpItem
          key={item.id}
          item={item}
          href={`/buyer/browse/jewelry/engagement-rings/${item.id}`}
        />
      ))}
    </LayoutPlp>
  );
}

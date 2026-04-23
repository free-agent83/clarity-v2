import { fetchDiamondList } from "@/lib/api/diamonds";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { LabGrownDiamondsFilters } from "./filters";

export default async function LabGrownDiamondsListPage({
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
  } = await fetchDiamondList(
    {
      page: Number(params.page) || 1,
      perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
      perPageOptions: PER_PAGE_OPTIONS,
    },
    true,
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
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/lab-grown-diamonds/${item.id}`}
          imageSrc={item.images.main}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certification.lab} ${item.certification.number} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={[
            {
              key: "cert",
              label: item.certification.lab,
              title: `Certified by ${item.certification.lab}`,
            },
          ]}
        />
      ))}
    </LayoutPlp>
  );
}

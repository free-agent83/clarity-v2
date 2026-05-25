import { notFound } from "next/navigation";
import { PlpGridContainer, Separator } from "@nivoda/components";
import { PdpDelivery } from "@nivoda/components/components/templates/pdp/pdp-delivery";
import { PdpHeading } from "@nivoda/components/components/templates/pdp/pdp-heading";
import { PdpLayout } from "@nivoda/components/components/templates/pdp/pdp-layout";
import { PdpPrice } from "@nivoda/components/components/templates/pdp/pdp-price";
import { PdpPrimaryAction } from "@nivoda/components/components/templates/pdp/pdp-primary-action";
import { PdpReturns } from "@nivoda/components/components/templates/pdp/pdp-returns";
import { PdpSpecifications } from "@nivoda/components/components/templates/pdp/pdp-specifications";
import type {
  PdpSpecificationRow,
  ProductMedia,
} from "@nivoda/components/components/templates/pdp/pdp-types";

import { MeleePlpItem } from "@/components/products/melee-plp-item";
import { PdpBreadcrumbs } from "@/components/products/pdp-breadcrumbs";
import { PdpMediaWithLightbox } from "@/components/products/pdp-media-with-lightbox";
import {
  getMockStockId,
  getPlpItemMock,
} from "@/components/products/plp-item-mocks";
import { StonePdpCta } from "@/components/products/stone-pdp-cta";
import { StonePdpSecondaryActions } from "@/components/products/stone-pdp-secondary-actions";

import { fetchMeleeItem, fetchRelatedMelee } from "@/lib/api/melee";
import { formatUSD } from "@/lib/utils";
import { checkSimulateError } from "@/lib/api/_simulate";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
};

export default async function LabGrownMeleeDetailPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  checkSimulateError(sp);
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchMeleeItem(slug, true),
    fetchRelatedMelee(slug, true),
  ]);
  if (!item) notFound();

  const mockStockId = getMockStockId(item.id);
  const mock = getPlpItemMock(item.id);

  const media: ProductMedia[] = [item.images.main, ...item.images.additional]
    .filter((src) => src && src.length > 0)
    .map((src) => ({ type: "image", src, alt: item.description }));

  const specs: PdpSpecificationRow[] = [
    { label: "Shape", value: item.shape },
    { label: "Size range", value: item.sizeRange },
    { label: "Color range", value: item.colorRange },
    { label: "Clarity range", value: item.clarityRange },
    { label: "Cut", value: item.cut },
    { label: "Quantity", value: `${item.quantity} pieces` },
    {
      label: "Total carat weight",
      value: `${item.totalCaratWeight.toFixed(2)} ct`,
    },
    { label: "Price per carat", value: formatUSD(item.pricePerCarat) },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 pb-32">
      <PdpBreadcrumbs
        segments={[
          { label: "Lab-grown melee", href: "/buyer/browse/lab-grown-melee" },
          {
            label: item.description,
            href: `/buyer/browse/lab-grown-melee/${item.id}`,
          },
        ]}
      />

      <PdpLayout
        stickyTop="96px"
        media={<PdpMediaWithLightbox media={media} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name={item.description} sku={mockStockId} />
            <PdpPrice
              amount={item.totalPrice}
              currency="USD"
              label="Total price"
              perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
            />
            <div className="flex flex-col gap-1">
              <PdpReturns
                {...(mock.isReturnable
                  ? {
                      variant: "returnable",
                      returnsWindow: "14 days",
                      policyLink: <a href="#">Returns Policy applies</a>,
                    }
                  : { variant: "non-returnable" })}
              />
              <PdpDelivery
                {...(mock.isExpress
                  ? { variant: "express", date: mock.deliveryDate }
                  : {
                      variant: "regular",
                      date: mock.deliveryDate,
                      shipsFrom: mock.shipsFrom,
                    })}
              />
            </div>
            <PdpPrimaryAction
              secondaryActions={
                <StonePdpSecondaryActions
                  product={{
                    title: item.description,
                    subtitle: "Lab-grown melee",
                    price: item.totalPrice,
                    imageSrc: item.images.main,
                    attributes: specs.map((s) => ({
                      label: s.label,
                      value: String(s.value),
                    })),
                  }}
                />
              }
            >
              <StonePdpCta
                product={{
                  productId: item.id,
                  name: item.description,
                  certLab: null,
                  certNumber: null,
                  stockId: mockStockId,
                  price: item.totalPrice,
                  discount: null,
                  image: item.images.main,
                  category: "lab_grown_melee",
                  quantity: 1,
                }}
              />
            </PdpPrimaryAction>
            <Separator />
            <PdpSpecifications rows={specs} />
          </div>
        }
      />

      {relatedRaw.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-foreground">
              You may also like
            </h2>
            <PlpGridContainer>
            {relatedRaw.map((related) => (
              <MeleePlpItem
                key={related.id}
                href={`/buyer/browse/lab-grown-melee/${related.id}`}
                category="lab_grown_melee"
                item={{
                  id: related.id,
                  stockId: related.stockId,
                  shape: related.shape,
                  sizeRange: related.sizeRange,
                  colorRange: related.colorRange,
                  clarityRange: related.clarityRange,
                  cut: related.cut,
                  quantity: related.quantity,
                  totalCaratWeight: related.totalCaratWeight,
                  pricePerCarat: related.pricePerCarat,
                  totalPrice: related.totalPrice,
                  image: related.images.main,
                  description: related.description,
                }}
              />
            ))}
            </PlpGridContainer>
          </div>
        </>
      )}
    </div>
  );
}

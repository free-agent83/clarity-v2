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

import { formatGemstoneDisplayName } from "@/components/products/gemstone-name";
import { GemstonePlpItem } from "@/components/products/gemstone-plp-item";
import { PdpBreadcrumbs } from "@/components/products/pdp-breadcrumbs";
import { PdpMediaWithLightbox } from "@/components/products/pdp-media-with-lightbox";
import {
  getMockStockId,
  getPlpItemMock,
} from "@/components/products/plp-item-mocks";
import { StonePdpCta } from "@/components/products/stone-pdp-cta";
import { StonePdpSecondaryActions } from "@/components/products/stone-pdp-secondary-actions";

import { fetchGemstoneItem, fetchRelatedGemstones } from "@/lib/api/gemstones";

type Props = { params: Promise<{ slug: string }> };

export default async function GemstoneDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchGemstoneItem(slug),
    fetchRelatedGemstones(slug),
  ]);
  if (!item) notFound();

  const mockStockId = getMockStockId(item.id);
  const mock = getPlpItemMock(item.id);
  const displayName = formatGemstoneDisplayName(
    item.description,
    item.origin,
    item.treatment,
  );

  const media: ProductMedia[] = [item.images.main, ...item.images.additional]
    .filter((src) => src && src.length > 0)
    .map((src) => ({ type: "image", src, alt: displayName }));

  const specs: PdpSpecificationRow[] = [
    { label: "Type", value: item.type },
    { label: "Shape", value: item.shape },
    { label: "Carat", value: item.carat.toFixed(2) },
    { label: "Color", value: item.color },
    { label: "Clarity", value: item.clarity },
    { label: "Cut", value: item.cut },
    { label: "Treatment", value: item.treatment },
    { label: "Origin", value: item.origin },
    {
      label: "Dimensions",
      value: `${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.depth} mm`,
    },
    {
      label: "Certificate",
      value: `${item.certification.lab} ${item.certification.number}`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 pb-32">
      <PdpBreadcrumbs
        segments={[
          { label: "Gemstones", href: "/buyer/browse/gemstones" },
          {
            label: displayName,
            href: `/buyer/browse/gemstones/${item.id}`,
          },
        ]}
      />

      <PdpLayout
        stickyTop="96px"
        media={<PdpMediaWithLightbox media={media} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name={displayName} sku={mockStockId} />
            <PdpPrice
              amount={item.price}
              currency="USD"
              label="Price"
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
                      shipsFrom: item.origin || mock.shipsFrom,
                    })}
              />
            </div>
            <PdpPrimaryAction
              secondaryActions={
                <StonePdpSecondaryActions
                  product={{
                    title: displayName,
                    subtitle: item.type,
                    price: item.price,
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
                  certLab: item.certification.lab,
                  certNumber: item.certification.number,
                  stockId: mockStockId,
                  price: item.price,
                  discount: null,
                  image: item.images.main,
                  category: "gemstone",
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
              <GemstonePlpItem
                key={related.id}
                href={`/buyer/browse/gemstones/${related.id}`}
                item={{
                  id: related.id,
                  stockId: related.stockId,
                  type: related.type,
                  shape: related.shape,
                  carat: related.carat,
                  color: related.color,
                  clarity: related.clarity,
                  cut: related.cut,
                  treatment: related.treatment,
                  origin: related.origin,
                  price: related.price,
                  pricePerCarat: related.pricePerCarat,
                  image: related.images.main,
                  description: related.description,
                  certLab: related.certification.lab,
                  certNumber: related.certification.number,
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

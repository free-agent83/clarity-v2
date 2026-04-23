import { notFound } from "next/navigation";
import { PlpGridContainer, Separator } from "@nivoda/components";
import { PdpDelivery } from "@nivoda/components/components/templates/pdp/pdp-delivery";
import { PdpHeading } from "@nivoda/components/components/templates/pdp/pdp-heading";
import { PdpLayout } from "@nivoda/components/components/templates/pdp/pdp-layout";
import { PdpPrice } from "@nivoda/components/components/templates/pdp/pdp-price";
import { PdpReturns } from "@nivoda/components/components/templates/pdp/pdp-returns";
import { PdpSpecifications } from "@nivoda/components/components/templates/pdp/pdp-specifications";
import type {
  PdpSpecificationRow,
  ProductMedia,
} from "@nivoda/components/components/templates/pdp/pdp-types";

import { EngagementRingPlpItem } from "@/components/products/engagement-ring-plp-item";
import { PdpBreadcrumbs } from "@/components/products/pdp-breadcrumbs";
import { PdpMediaWithLightbox } from "@/components/products/pdp-media-with-lightbox";
import { getPlpItemMock } from "@/components/products/plp-item-mocks";
import { StonePdpSecondaryActions } from "@/components/products/stone-pdp-secondary-actions";

import {
  fetchEngagementRingItem,
  fetchRelatedEngagementRings,
} from "@/lib/api/jewelry";
import { getThumbnailUrl } from "@/lib/api/jewelry/shared";

import { EngagementRingConfigurator } from "./engagement-ring-configurator";

type Props = { params: Promise<{ slug: string }> };

export default async function JewelryDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchEngagementRingItem(slug),
    fetchRelatedEngagementRings(slug),
  ]);
  if (!item) notFound();

  const mock = getPlpItemMock(item.id);

  const media: ProductMedia[] = item.images
    .map((img) => img.url)
    .filter((url) => url && url.length > 0)
    .map((src) => ({ type: "image", src, alt: item.description }));

  const thumbnail = getThumbnailUrl(item.images);

  const basePrice =
    item.availableMetals.length > 0
      ? Math.min(...item.availableMetals.map((am) => am.priceUsd))
      : 0;

  const availableStoneShapes = item.compatibleStones.map((cs) => cs.shape);
  const defaultStoneShape = availableStoneShapes[0]?.value ?? "Round";
  const availableMetals = item.availableMetals.map((am) => ({
    id: am.metal.id,
    value: am.metal.value,
    priceUsd: am.priceUsd,
  }));
  const defaultMetal = availableMetals[0]?.value ?? "14k_white_gold";

  const specs: PdpSpecificationRow[] = [
    { label: "SKU", value: item.sku },
    { label: "Band style", value: item.bandStyle.value },
    ...(item.ringWidthMm
      ? [{ label: "Ring width", value: `${item.ringWidthMm} mm` }]
      : []),
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 pb-32">
      <PdpBreadcrumbs
        segments={[
          { label: "Jewellery", href: "/buyer/browse/jewelry" },
          {
            label: "Engagement rings",
            href: "/buyer/browse/jewelry/engagement-rings",
          },
          {
            label: item.description,
            href: `/buyer/browse/jewelry/engagement-rings/${item.id}`,
          },
        ]}
      />

      <PdpLayout
        stickyTop="96px"
        media={<PdpMediaWithLightbox media={media} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name={item.description} sku={item.sku} />
            <PdpPrice
              amount={basePrice}
              currency="USD"
              label="Starting from"
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

            <EngagementRingConfigurator
              slug={item.id}
              defaultStoneShape={defaultStoneShape}
              defaultMetal={defaultMetal}
              availableStoneShapes={availableStoneShapes}
              availableMetals={availableMetals}
              compatibleStones={item.compatibleStones}
            />

            <div className="flex items-center gap-2">
              <StonePdpSecondaryActions
                product={{
                  title: item.description,
                  subtitle: "Engagement ring",
                  price: basePrice,
                  imageSrc: thumbnail,
                  attributes: specs.map((s) => ({
                    label: s.label,
                    value: String(s.value),
                  })),
                }}
              />
            </div>

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
              <EngagementRingPlpItem
                key={related.id}
                item={related}
                href={`/buyer/browse/jewelry/engagement-rings/${related.id}`}
              />
            ))}
            </PlpGridContainer>
          </div>
        </>
      )}
    </div>
  );
}

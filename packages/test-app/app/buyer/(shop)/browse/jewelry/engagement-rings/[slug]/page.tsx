import { notFound } from "next/navigation";
import { IconInfoCircle, IconRefresh, IconTruck } from "@tabler/icons-react";

import {
  fetchEngagementRingItem,
  fetchRelatedEngagementRings,
} from "@/lib/api/jewelry";
import { formatUSD } from "@/lib/utils";
import { LayoutProductDetail } from "@/components/layouts/layout-product-detail/layout-product-detail";
import type { SpecRow } from "@/components/layouts/types";
import type { ProductListItemProps } from "@/components/products/product-list-item";
import { JewelryConfiguration } from "./jewelry-configuration";
import { IncludedInMount } from "./included-in-mount";
import { ProductActions } from "@/components/product-actions";

type Props = { params: Promise<{ slug: string }> };

export default async function JewelryDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchEngagementRingItem(slug),
    fetchRelatedEngagementRings(slug),
  ]);
  if (!item) notFound();

  const { description, bandStyle, sku, images: imgList } = item;

  const breadcrumbs = [
    { label: "Jewellery", href: "/buyer/browse/jewelry" },
    {
      label: "Engagement rings",
      href: "/buyer/browse/jewelry/engagement-rings",
    },
    {
      label: description,
      href: `/buyer/browse/jewelry/engagement-rings/${item.id}`,
    },
  ];

  // Build image list from the images array
  const thumbnail =
    imgList.find((img) => img.isThumbnail)?.url ?? imgList[0]?.url ?? "";
  const images = imgList
    .map((img) => img.url)
    .filter((url) => url && url.length > 0)
    .map((src) => ({ src, alt: description }));

  // Use the minimum available metal price as the base price
  const basePrice =
    item.availableMetals.length > 0
      ? Math.min(...item.availableMetals.map((am) => am.priceUsd))
      : 0;
  const formattedPrice = formatUSD(basePrice);

  // Derive configuration-compatible data structures
  // Build availableStoneShapes from compatibleStones
  const availableStoneShapes = item.compatibleStones.map((cs) => cs.shape);
  const defaultStoneShape = availableStoneShapes[0]?.value ?? "Round";

  // Build flat list of available metals
  const availableMetals = item.availableMetals.map((am) => ({
    id: am.metal.id,
    value: am.metal.value,
    priceUsd: am.priceUsd,
  }));
  const defaultMetal = availableMetals[0]?.value ?? "14k_white_gold";

  const specs: SpecRow[] = [
    { label: "SKU", value: sku },
    { label: "Band style", value: bandStyle.value },
    ...(availableStoneShapes.length > 0
      ? [{ label: "Stone shape", value: defaultStoneShape }]
      : []),
    { label: "Metal", value: defaultMetal },
    ...(item.ringWidthMm
      ? [{ label: "Ring width", value: `${item.ringWidthMm} mm` }]
      : []),
  ];

  const relatedItems: ProductListItemProps[] = relatedRaw.map((related) => {
    const relThumbnail =
      related.images.find((img) => img.isThumbnail)?.url ??
      related.images[0]?.url ??
      "";
    const relMinPrice =
      related.availableMetals.length > 0
        ? Math.min(...related.availableMetals.map((am) => am.priceUsd))
        : 0;
    return {
      id: related.id,
      href: `/browse/jewelry/engagement-rings/${related.id}`,
      imageSrc: relThumbnail,
      imageAlt: related.description,
      title: related.description,
      subtitle: `${related.bandStyle.value} · ${related.sku}`,
      priceLabel: "Starting from",
      formattedPrice: formatUSD(relMinPrice),
    };
  });

  return (
    <LayoutProductDetail
      breadcrumbs={breadcrumbs}
      images={images}
      title={description}
      formattedPrice={formattedPrice}
      actions={
        <ProductActions
          product={{
            title: description,
            subtitle: "Engagement ring",
            price: basePrice,
            imageSrc: thumbnail,
            attributes: specs,
          }}
        />
      }
      configuration={
        <JewelryConfiguration
          slug={item.id}
          defaultStoneShape={defaultStoneShape}
          defaultMetal={defaultMetal}
          availableStoneShapes={availableStoneShapes}
          availableMetals={availableMetals}
          compatibleStones={item.compatibleStones}
        />
      }
      includedItems={
        <IncludedInMount
          stones={[]}
          mounts={[]}
          metalTypeValue={defaultMetal}
        />
      }
      shippingInfo={
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <IconRefresh
              size={24}
              className="mt-0.5 shrink-0 text-foreground"
            />
            <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
              <span className="font-medium text-[#3d745c]">14-day returns</span>
              <span className="text-muted-foreground">
                · Returns Policy applies
              </span>
              <IconInfoCircle size={18} className="text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <IconTruck size={24} className="mt-0.5 shrink-0 text-foreground" />
            <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
              <span className="text-muted-foreground">
                Estimated delivery in
              </span>
              <span className="font-medium text-foreground">
                15 business days
              </span>
            </div>
          </div>
        </div>
      }
      specs={specs}
      relatedItems={relatedItems}
    />
  );
}

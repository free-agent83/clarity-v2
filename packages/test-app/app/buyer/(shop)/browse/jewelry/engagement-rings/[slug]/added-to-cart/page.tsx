import { notFound } from "next/navigation";
import { IconCircleCheckFilled } from "@tabler/icons-react";

import { fetchEngagementRingItem } from "@/lib/api/jewelry";
import { fetchDiamondItem } from "@/lib/api/diamonds";
import { formatUSD } from "@/lib/utils";
import { checkSimulateError } from "@/lib/api/_simulate";
import { AddedToCartActions } from "./added-to-cart-actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AddedToCartPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  checkSimulateError(sp);

  const metalId = sp.metalId;
  const stoneId = sp.stoneId;
  const labGrown = sp.labGrown === "true";
  if (!metalId || !stoneId) notFound();

  // Fetch ring and stone in parallel
  const [ring, stone] = await Promise.all([
    fetchEngagementRingItem(slug),
    fetchDiamondItem(stoneId, labGrown),
  ]);
  if (!ring || !stone) notFound();

  // Resolve config details
  const selectedMetal = ring.availableMetals.find(
    (am) => am.metal.id === metalId,
  );
  const metalPrice = selectedMetal?.priceUsd ?? 0;
  const metalLabel = (selectedMetal?.metal.value ?? "Unknown")
    .split("_")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const size = sp.size ?? "7";
  const engraving = sp.engraving ?? "";
  const totalPrice = metalPrice + stone.price;

  const thumbnail =
    ring.images.find((img) => img.isThumbnail)?.url ??
    ring.images[0]?.url ??
    "";

  // Config subtitle
  const configDetails = [
    metalLabel,
    `${stone.shape} center stone`,
    `Size ${size}`,
    engraving ? `Engraving: "${engraving}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ShareableProduct for the share modal
  const shareProduct = {
    title: ring.description,
    subtitle: configDetails,
    price: totalPrice,
    imageSrc: thumbnail,
    attributes: [
      { label: "Metal", value: metalLabel },
      { label: "Center stone", value: stone.description },
      { label: "Size", value: size },
      ...(engraving ? [{ label: "Engraving", value: engraving }] : []),
    ],
  };

  return (
    <div className="mx-auto max-w-3xl py-10">
      {/* Success banner */}
      <div className="flex items-center gap-3 pb-8">
        <IconCircleCheckFilled size={28} className="text-green-600" />
        <h1 className="text-2xl font-medium text-foreground">Added to cart.</h1>
      </div>

      {/* Ring summary card */}
      <div className="flex items-start justify-between rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
            <img
              src={thumbnail}
              alt={ring.description}
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium text-foreground">
              {ring.description}
            </h2>
            <p className="text-sm text-muted-foreground">{configDetails}</p>
          </div>
        </div>
        <span className="text-lg font-medium text-foreground">
          {formatUSD(totalPrice)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="pt-6 pb-8">
        <AddedToCartActions product={shareProduct} />
      </div>

      {/* Included stones section */}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          The following stones are included in the item, and were also added to
          your cart:
        </p>

        <div className="flex items-start justify-between rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={stone.images.main}
                alt={stone.description}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Center stone
              </span>
              <h3 className="text-base font-medium text-foreground">
                {stone.shape} {stone.carat}ct {stone.color} {stone.clarity}{" "}
                {stone.cut} {stone.fluorescence}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stone.certification.lab} {stone.certification.number}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-medium text-foreground">
              {formatUSD(stone.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

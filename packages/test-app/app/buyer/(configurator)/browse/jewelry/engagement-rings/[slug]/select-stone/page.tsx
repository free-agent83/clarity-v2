import { notFound } from "next/navigation";

import { fetchEngagementRingItem } from "@/lib/api/jewelry";
import { fetchDiamondListFiltered } from "@/lib/api/diamonds";
import { LayoutConfigurator } from "@/components/layouts/layout-configurator/layout-configurator";
import { PaginationControls } from "@/components/layouts/pagination-controls";
import { type SortOption } from "@/components/filters/sort-button";
import { UncontrolledSortButton } from "@/components/filters/uncontrolled-sort-button";
import { StonePicker } from "./stone-picker";

const SORT_OPTIONS: SortOption[] = [
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "carat_asc", label: "Carat: Low → High", displayLabel: "Carat ↑" },
  { value: "carat_desc", label: "Carat: High → Low", displayLabel: "Carat ↓" },
];

const PER_PAGE = 20;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function StoneSelectionPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const shapeId = sp.shapeId;
  const metalId = sp.metalId;
  if (!shapeId || !metalId) notFound();

  const maxCarat = Number(sp.maxCarat) || 10;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort ?? "price_asc";

  // Fetch ring details
  const ring = await fetchEngagementRingItem(slug);
  if (!ring) notFound();

  // Find the selected metal's price and label
  const selectedMetal = ring.availableMetals.find(
    (am) => am.metal.id === metalId,
  );
  const metalPrice = selectedMetal?.priceUsd ?? 0;
  const metalLabel = selectedMetal?.metal.value ?? "Unknown";

  // Find shape value from compatible stones
  const compatibleStone = ring.compatibleStones.find(
    (cs) => cs.shape.id === shapeId,
  );
  const shapeValue = compatibleStone?.shape.value ?? "Unknown";

  // Build filters for diamond query
  const filters: Record<string, string[] | { min?: number; max?: number }> = {
    shape: [shapeValue],
    carat: { max: maxCarat },
  };

  // Fetch ALL matching diamonds from both sources (no DB-level pagination).
  // We merge natural + lab-grown into a single sorted list, then paginate
  // in memory. DB-level pagination can't work here because two independently
  // paginated sources produce gaps when interleaved.
  const fetchAll = { page: 1, perPage: 10_000, offset: 0 };

  const [naturalResult, labGrownResult] = await Promise.all([
    fetchDiamondListFiltered(filters, sort, fetchAll, false),
    fetchDiamondListFiltered(filters, sort, fetchAll, true),
  ]);

  // Merge, tag with labGrown, and sort the combined set
  const allStones = [
    ...naturalResult.items.map((d) => ({ ...d, labGrown: false })),
    ...labGrownResult.items.map((d) => ({ ...d, labGrown: true })),
  ].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "carat_asc") return a.carat - b.carat;
    if (sort === "carat_desc") return b.carat - a.carat;
    return a.price - b.price;
  });

  // Paginate the merged result set in memory
  const totalItems = allStones.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const startIndex = (page - 1) * PER_PAGE;
  const pagedStones = allStones.slice(startIndex, startIndex + PER_PAGE);

  // Build thumbnail
  const thumbnail =
    ring.images.find((img) => img.isThumbnail)?.url ??
    ring.images[0]?.url ??
    "";

  // Config summary
  const size = sp.size ?? "7";
  const engraving = sp.engraving ?? "";

  // Format metal label for display
  const metalDisplay = metalLabel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const configSummary = [metalDisplay, shapeValue, `Size ${size}`]
    .filter(Boolean)
    .join(" · ");

  const cancelHref = `/buyer/browse/jewelry/engagement-rings/${slug}`;

  return (
    <LayoutConfigurator heading="Select a stone" cancelHref={cancelHref}>
      <div className="flex flex-col gap-6">
        {/* Ring context bar */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium text-foreground">
            {ring.description}
          </h2>
          <p className="text-sm text-muted-foreground">{configSummary}</p>
        </div>

        {/* Results count + sort */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium text-muted-foreground">
            {totalItems.toLocaleString()} results
          </p>
          <UncontrolledSortButton options={SORT_OPTIONS} />
        </div>

        {/* Client component: grid + footer */}
        <StonePicker
          stones={pagedStones}
          mount={{
            name: ring.description,
            thumbnail,
            metalLabel: metalDisplay,
            metalPrice,
            size,
            engraving,
            slug,
          }}
          configParams={{
            metalId: metalId,
            size,
            engraving,
          }}
        />

        {/* Pagination */}
        <div className="pb-32">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            perPageOptions={[20]}
          />
        </div>
      </div>
    </LayoutConfigurator>
  );
}

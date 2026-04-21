import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../../atoms/button/button";
import { Typography } from "../../atoms/typography/typography";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { SORT_OPTIONS } from "./mocks/common";
import {
  GemstonePlpListHeader,
  GEMSTONE_PRESELECTED_SUPPLIERS,
} from "./mocks/gemstone";
import {
  DiamondPlpListHeader,
} from "./mocks/diamond";
import {
  GemstoneInteractive,
  buildGemstoneCards,
  buildGemstoneRows,
} from "./plp-stories/gemstone-interactive";
import {
  DiamondInteractive,
  buildDiamondCards,
  buildDiamondRows,
} from "./plp-stories/diamond-interactive";
import {
  JewelryInteractive,
  JewelryPlpListHeader,
  buildJewelryListRows,
} from "./plp-stories/jewelry-interactive";

// ── Story meta ────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppShell>
        <AppShellHeader onSearch={fn()} />
        <AppShellMain>
          <Story />
        </AppShellMain>
      </AppShell>
    ),
  ],
};

export default meta;

// ── Story exports ─────────────────────────────────────────────────────

type CategoryArg = "diamonds" | "gemstones" | "jewellery";
type CategoryStoryArgs = { category: CategoryArg };

const CATEGORY_OPTIONS: CategoryArg[] = ["diamonds", "gemstones", "jewellery"];

/**
 * The canonical "healthy PLP in grid view" — switch between categories
 * with the `category` tweakable.
 */
export const GridView: StoryObj<CategoryStoryArgs> = {
  args: { category: "diamonds" },
  argTypes: {
    category: {
      control: { type: "radio" },
      options: CATEGORY_OPTIONS,
    },
  },
  render: ({ category }) => {
    if (category === "jewellery") return <JewelryInteractive />;
    if (category === "gemstones") {
      return (
        <GemstoneInteractive
          breadcrumbs={[
            { label: "Gemstones", href: "#" },
            { label: "Sapphire" },
          ]}
          title="Sapphire"
          resultsCount={1234567}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Search by certificate number or stock ID..."
          onSearchSubmit={fn()}
          gridItems={buildGemstoneCards(20)}
          totalItems={1234567}
          onRetry={fn()}
        />
      );
    }
    return (
      <DiamondInteractive
        breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
        title="Natural Diamonds"
        resultsCount={48291}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search by certificate number or stock ID..."
        onSearchSubmit={fn()}
        gridItems={buildDiamondCards(20)}
        totalItems={48291}
        onRetry={fn()}
      />
    );
  },
};

/**
 * The canonical "healthy PLP in list view" — same `category` tweakable.
 */
export const ListView: StoryObj<CategoryStoryArgs> = {
  args: { category: "diamonds" },
  argTypes: {
    category: {
      control: { type: "radio" },
      options: CATEGORY_OPTIONS,
    },
  },
  render: ({ category }) => {
    if (category === "jewellery") {
      return (
        <JewelryInteractive
          listHeader={<JewelryPlpListHeader />}
          listRows={buildJewelryListRows(20)}
          listViewAvailable
          initialViewMode="list"
        />
      );
    }
    if (category === "gemstones") {
      return (
        <GemstoneInteractive
          breadcrumbs={[
            { label: "Gemstones", href: "#" },
            { label: "Sapphire" },
          ]}
          title="Sapphire"
          resultsCount={1234567}
          sortOptions={SORT_OPTIONS}
          gridItems={buildGemstoneCards(20)}
          listHeader={<GemstonePlpListHeader />}
          listRows={buildGemstoneRows(20)}
          listViewAvailable
          initialViewMode="list"
          totalItems={1234567}
          onRetry={fn()}
        />
      );
    }
    return (
      <DiamondInteractive
        breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
        title="Natural Diamonds"
        resultsCount={48291}
        sortOptions={SORT_OPTIONS}
        gridItems={buildDiamondCards(20)}
        listHeader={<DiamondPlpListHeader />}
        listRows={buildDiamondRows(20)}
        listViewAvailable
        initialViewMode="list"
        totalItems={48291}
        onRetry={fn()}
      />
    );
  },
};

export const WithActiveFilters: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={342}
      initialFilterState={{
        color: ["blue", "green"],
        treatment: "heated",
        price: { price: { min: 1000, max: 5000 } },
        supplier: GEMSTONE_PRESELECTED_SUPPLIERS,
      }}
      sortOptions={SORT_OPTIONS}
      gridItems={buildGemstoneCards(20)}
      totalItems={342}
      onRetry={fn()}
    />
  ),
};

export const EmptyFiltered: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      initialFilterState={{ color: ["pink"], clarity: ["eye-clean"] }}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="empty-filtered"
    />
  ),
};

export const EmptyNoItems: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[
        { label: "Gemstones", href: "#" },
        { label: "Alexandrite" },
      ]}
      title="Alexandrite"
      resultsCount={0}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="empty-no-items"
      emptyMessage="No alexandrite available at the moment."
    />
  ),
};

export const Error: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      sortOptions={SORT_OPTIONS}
      totalItems={0}
      baselineStatus="error"
      onRetry={fn()}
    />
  ),
};

/**
 * Demonstrates how consumers can drop arbitrary content between the
 * PLP heading and the filter toolbar. The kit doesn't bake banners
 * into any template prop — `AssemblyShell` just flows a consumer-
 * provided `banner` node into the layout, full width.
 */
export const WithBanner: StoryObj = {
  render: () => (
    <GemstoneInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      sortOptions={SORT_OPTIONS}
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      gridItems={buildGemstoneCards(20)}
      totalItems={1234567}
      onRetry={fn()}
      banner={
        <div className="flex items-center justify-between gap-4 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-6 py-5 text-primary-foreground">
          <div>
            <Typography as="h2" variant="body-1" emphasis className="text-primary-foreground">
              Spring Sale — up to 20% off select gemstones
            </Typography>
            <Typography variant="body-2" className="text-primary-foreground/90">
              Applies automatically at checkout. Ends 2026-05-15.
            </Typography>
          </div>
          <Button variant="outline" className="bg-background text-foreground">
            Browse deals
          </Button>
        </div>
      }
    />
  ),
};

/**
 * Demonstrates how consumers can freely mix non-item content into the
 * grid — promo tiles, ad slots, recommendation cards, anything. The
 * `gridItems` prop is a plain `ReactNode[]`; the `PlpGridContainer`
 * doesn't reason about what a "product card" is, it just flows its
 * children into the responsive grid. Here, positions 4 and 11 in a
 * grid of 20 are swapped out for promo tiles.
 */
export const WithPromoItems: StoryObj = {
  render: () => {
    const cards = buildGemstoneCards(20);

    function PromoTile({
      headline,
      subline,
      className,
    }: {
      headline: string;
      subline: string;
      className?: string;
    }) {
      return (
        <div
          className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-lg p-6 text-center ${className}`}
        >
          <Typography
            as="h3"
            variant="body-1"
            emphasis
            className="text-primary-foreground"
          >
            {headline}
          </Typography>
          <Typography variant="body-2" className="text-primary-foreground/90">
            {subline}
          </Typography>
          <Button variant="outline" className="mt-2 bg-background text-foreground">
            Shop now
          </Button>
        </div>
      );
    }

    cards[3] = (
      <PromoTile
        key="promo-1"
        headline="Free shipping on orders over $1,000"
        subline="Applies automatically at checkout."
        className="bg-linear-to-br from-emerald-600 to-teal-600"
      />
    );
    cards[10] = (
      <PromoTile
        key="promo-2"
        headline="New: Sapphire from Kashmir"
        subline="Limited-release certified parcels."
        className="bg-linear-to-br from-indigo-600 to-violet-600"
      />
    );

    return (
      <GemstoneInteractive
        breadcrumbs={[
          { label: "Gemstones", href: "#" },
          { label: "Sapphire" },
        ]}
        title="Sapphire"
        resultsCount={1234567}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search by certificate number or stock ID..."
        onSearchSubmit={fn()}
        gridItems={cards}
        totalItems={1234567}
        onRetry={fn()}
      />
    );
  },
};

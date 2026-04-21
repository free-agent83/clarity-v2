import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { Button } from "../../atoms/button/button";
import { Typography } from "../../atoms/typography/typography";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../atoms/empty/empty";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { PlpGridContainer } from "./plp-grid-container";
import { PlpListContainer } from "./plp-list-container";
import { DiamondPage } from "./__fixtures__/diamond-page";
import { GemstonePage } from "./__fixtures__/gemstone-page";
import { JewelryPage } from "./__fixtures__/jewelry-page";
import {
  DiamondPlpGridItem,
  DiamondPlpListHeader,
  DiamondPlpListRow,
} from "./__fixtures__/diamond-renderers";
import {
  GemstonePlpGridItem,
  GemstonePlpListHeader,
  GemstonePlpListRow,
} from "./__fixtures__/gemstone-renderers";
import {
  JewelryPlpGridItem,
  JewelryPlpListHeader,
  JewelryPlpListRow,
} from "./__fixtures__/jewelry-renderers";
import { generateDiamondItems } from "./__fixtures__/diamond-items";
import { generateGemstoneItems } from "./__fixtures__/gemstone-items";
import { generateJewelryItems } from "./__fixtures__/jewelry-items";

// ── Static content pieces ─────────────────────────────────────────────

const diamondGrid: ReactNode = (
  <PlpGridContainer>
    {generateDiamondItems(20).map((item) => (
      <DiamondPlpGridItem key={item.id} item={item} />
    ))}
  </PlpGridContainer>
);

const diamondList: ReactNode = (
  <PlpListContainer header={<DiamondPlpListHeader />}>
    {generateDiamondItems(20).map((item) => (
      <DiamondPlpListRow key={item.id} item={item} />
    ))}
  </PlpListContainer>
);

const gemstoneGrid: ReactNode = (
  <PlpGridContainer>
    {generateGemstoneItems(20).map((item) => (
      <GemstonePlpGridItem key={item.id} item={item} />
    ))}
  </PlpGridContainer>
);

const gemstoneList: ReactNode = (
  <PlpListContainer header={<GemstonePlpListHeader />}>
    {generateGemstoneItems(20).map((item) => (
      <GemstonePlpListRow key={item.id} item={item} />
    ))}
  </PlpListContainer>
);

const jewelryGrid: ReactNode = (
  <PlpGridContainer>
    {generateJewelryItems(20).map((item) => (
      <JewelryPlpGridItem key={item.id} item={item} />
    ))}
  </PlpGridContainer>
);

const jewelryList: ReactNode = (
  <PlpListContainer header={<JewelryPlpListHeader />}>
    {generateJewelryItems(20).map((item) => (
      <JewelryPlpListRow key={item.id} item={item} />
    ))}
  </PlpListContainer>
);

const EmptyFilteredState: ReactNode = (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>No items match your filters</EmptyTitle>
      <EmptyDescription>
        Try adjusting your filters to find what you're looking for.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline">Clear all filters</Button>
    </EmptyContent>
  </Empty>
);

function EmptyNoItemsState({ message }: { message?: string }): ReactNode {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No items available</EmptyTitle>
        <EmptyDescription>
          {message ?? "There are no items in this category yet."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const ErrorState: ReactNode = (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>Something went wrong</EmptyTitle>
      <EmptyDescription>
        We couldn't load the products. Please try again or contact support if
        the problem persists.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button>Try again</Button>
      <Button variant="outline" asChild>
        <a href="/support">Contact support</a>
      </Button>
    </EmptyContent>
  </Empty>
);

const SpringSaleBanner: ReactNode = (
  <div className="flex items-center justify-between gap-4 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-6 py-5 text-primary-foreground">
    <div>
      <Typography
        as="h2"
        variant="body-1"
        emphasis
        className="text-primary-foreground"
      >
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
);

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

const gemstoneGridWithPromos: ReactNode = (() => {
  const cards: ReactNode[] = generateGemstoneItems(20).map((item) => (
    <GemstonePlpGridItem key={item.id} item={item} />
  ));
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
  return <PlpGridContainer>{cards}</PlpGridContainer>;
})();

// ── Story meta ────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppShell>
        <AppShellHeader onSearch={() => {}} />
        <AppShellMain>
          <Story />
        </AppShellMain>
      </AppShell>
    ),
  ],
};

export default meta;

// ── Diamond stories ───────────────────────────────────────────────────

export const DiamondDefault: StoryObj = {
  render: () => <DiamondPage>{diamondGrid}</DiamondPage>,
};

export const DiamondList: StoryObj = {
  render: () => <DiamondPage>{diamondList}</DiamondPage>,
};

export const DiamondEmptyFiltered: StoryObj = {
  render: () => (
    <DiamondPage resultsCount={0}>{EmptyFilteredState}</DiamondPage>
  ),
};

export const DiamondEmptyNoItems: StoryObj = {
  render: () => (
    <DiamondPage
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Lab-grown" }]}
      title="Lab-grown Diamonds"
      resultsCount={0}
    >
      <EmptyNoItemsState message="No lab-grown diamonds available at the moment." />
    </DiamondPage>
  ),
};

export const DiamondError: StoryObj = {
  render: () => (
    <DiamondPage resultsCount={0}>{ErrorState}</DiamondPage>
  ),
};

// ── Gemstone stories ──────────────────────────────────────────────────

export const GemstoneDefault: StoryObj = {
  render: () => <GemstonePage>{gemstoneGrid}</GemstonePage>,
};

export const GemstoneList: StoryObj = {
  render: () => <GemstonePage>{gemstoneList}</GemstonePage>,
};

export const GemstoneEmptyFiltered: StoryObj = {
  render: () => (
    <GemstonePage resultsCount={0}>{EmptyFilteredState}</GemstonePage>
  ),
};

export const GemstoneEmptyNoItems: StoryObj = {
  render: () => (
    <GemstonePage
      breadcrumbs={[
        { label: "Gemstones", href: "#" },
        { label: "Alexandrite" },
      ]}
      title="Alexandrite"
      resultsCount={0}
    >
      <EmptyNoItemsState message="No alexandrite available at the moment." />
    </GemstonePage>
  ),
};

export const GemstoneError: StoryObj = {
  render: () => (
    <GemstonePage resultsCount={0}>{ErrorState}</GemstonePage>
  ),
};

/**
 * Banner slot demo — `PlpPageShell` flows a consumer-provided node
 * between the heading and the toolbar. The library doesn't bake a
 * banner prop into any component; consumers drop in whatever markup
 * fits.
 */
export const GemstoneWithBanner: StoryObj = {
  render: () => (
    <GemstonePage banner={SpringSaleBanner}>{gemstoneGrid}</GemstonePage>
  ),
};

/**
 * Promo-tile demo — the grid's `children` is a plain `ReactNode[]`, so
 * consumers can interleave arbitrary markup with product cards. Here,
 * positions 4 and 11 in a 20-card grid are swapped for promo tiles.
 */
export const GemstoneWithPromoItems: StoryObj = {
  render: () => <GemstonePage>{gemstoneGridWithPromos}</GemstonePage>,
};

// ── Jewelry stories ───────────────────────────────────────────────────

export const JewelryDefault: StoryObj = {
  render: () => <JewelryPage>{jewelryGrid}</JewelryPage>,
};

export const JewelryList: StoryObj = {
  render: () => <JewelryPage>{jewelryList}</JewelryPage>,
};

export const JewelryEmptyFiltered: StoryObj = {
  render: () => (
    <JewelryPage resultsCount={0}>{EmptyFilteredState}</JewelryPage>
  ),
};

export const JewelryEmptyNoItems: StoryObj = {
  render: () => (
    <JewelryPage
      breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Bracelets" }]}
      title="Bracelets"
      resultsCount={0}
    >
      <EmptyNoItemsState message="No bracelets available at the moment." />
    </JewelryPage>
  ),
};

export const JewelryError: StoryObj = {
  render: () => (
    <JewelryPage resultsCount={0}>{ErrorState}</JewelryPage>
  ),
};

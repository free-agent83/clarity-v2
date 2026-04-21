import type { Meta, StoryObj } from "@storybook/react";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { Typography } from "../../atoms/typography/typography";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../molecules/pagination/pagination";
import { PlpGridContainer } from "./plp-grid-container";
import { PlpListContainer } from "./plp-list-container";
import { DiamondPage } from "./__fixtures__/diamond-page";
import {
  DiamondPlpGridItem,
  DiamondPlpListHeader,
  DiamondPlpListRow,
} from "./__fixtures__/diamond-renderers";
import { generateDiamondItems } from "./__fixtures__/diamond-items";

const items = generateDiamondItems(20);

const PromoBanner = (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-linear-to-r from-slate-900 via-violet-950 to-slate-900 px-6 py-6 text-primary-foreground">
    <div className="min-w-0">
      <Typography
        as="h2"
        variant="body-1"
        emphasis
        className="text-primary-foreground"
      >
        Boost your sales. Get started with Showroom today.
      </Typography>
      <Typography variant="body-2" className="text-primary-foreground/70">
        Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim.
      </Typography>
    </div>
    <div className="flex items-center gap-2">
      <Button className="bg-violet-600 hover:bg-violet-500">
        Learn more
        <IconArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const StaticPagination = (
  <Pagination className="mt-4">
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">1</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#" isActive>
          2
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">3</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">24</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationNext href="#" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

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

export const GridView: StoryObj = {
  render: () => (
    <DiamondPage>
      <PlpGridContainer>
        {items.map((item) => (
          <DiamondPlpGridItem key={item.id} item={item} />
        ))}
      </PlpGridContainer>
      {StaticPagination}
    </DiamondPage>
  ),
};

export const ListView: StoryObj = {
  render: () => (
    <DiamondPage>
      <PlpListContainer header={<DiamondPlpListHeader />}>
        {items.map((item) => (
          <DiamondPlpListRow key={item.id} item={item} />
        ))}
      </PlpListContainer>
      {StaticPagination}
    </DiamondPage>
  ),
};

/**
 * Demonstrates a promotional banner slotted in between the PLP heading
 * and the filter toolbar. The library doesn't bake a banner prop into
 * any component — `PlpPageShell` flows whatever node the consumer hands
 * in through its `banner` slot.
 */
export const WithBanner: StoryObj = {
  render: () => (
    <DiamondPage banner={PromoBanner}>
      <PlpGridContainer>
        {items.map((item) => (
          <DiamondPlpGridItem key={item.id} item={item} />
        ))}
      </PlpGridContainer>
      {StaticPagination}
    </DiamondPage>
  ),
};

/**
 * Demonstrates a banner dropped into the grid as a regular item. The
 * `PlpGridContainer` doesn't reason about what a cell contains — the
 * banner is just the first node in the `gridItems` array. The grid
 * stretches every cell to the row's tallest intrinsic height, so the
 * banner naturally matches its row without needing a fixed height.
 *
 * Here the banner occupies a single column and is pinned to the last
 * column of the first row via explicit grid placement. The grid's
 * default stretch pulls it up to the full row height regardless of
 * how tall the tallest card in the row happens to be. Auto-placement
 * fills the remaining cells in DOM order.
 */
export const WithInGridBanner: StoryObj = {
  render: () => {
    const GridBanner = (
      <div
        key="in-grid-banner"
        className="col-start-2 row-start-1 flex flex-col justify-between gap-3 rounded-lg bg-linear-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-primary-foreground sm:col-start-3 lg:col-start-4"
      >
        <div>
          <Typography
            as="h2"
            variant="body-1"
            emphasis
            className="text-primary-foreground"
          >
            Boost your sales. Get started with Showroom today.
          </Typography>
          <Typography variant="body-2" className="text-primary-foreground/70">
            Incididunt sint fugiat pariatur cupidatat consectetur sit cillum
            anim.
          </Typography>
        </div>
        <Button className="w-fit bg-violet-600 hover:bg-violet-500">
          Learn more
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
    return (
      <DiamondPage>
        <PlpGridContainer>
          {GridBanner}
          {items.map((item) => (
            <DiamondPlpGridItem key={item.id} item={item} />
          ))}
        </PlpGridContainer>
        {StaticPagination}
      </DiamondPage>
    );
  },
};

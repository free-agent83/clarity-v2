import type { Meta, StoryObj } from "@storybook/react";
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

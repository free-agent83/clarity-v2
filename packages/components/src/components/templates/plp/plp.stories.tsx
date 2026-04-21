import type { Meta, StoryObj } from "@storybook/react";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
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
    </DiamondPage>
  ),
};

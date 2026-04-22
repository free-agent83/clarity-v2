import type { Meta, StoryObj } from "@storybook/react";
import { PlpListContainer } from "./plp-list-container";
import {
  PlpListBodyCell,
  PlpListBodyRow,
  PlpListHeaderRow,
} from "./list/plp-list-row";
import { TableHead } from "../../organisms/table/table";

const meta: Meta<typeof PlpListContainer> = {
  title: "Templates/PLP/ListContainer",
  component: PlpListContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PlpListContainer>;

const header = (
  <PlpListHeaderRow>
    <TableHead>Name</TableHead>
    <TableHead>Description</TableHead>
  </PlpListHeaderRow>
);

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <PlpListContainer header={header} loading skeletonCount={6} />
    </div>
  ),
};

export const WithRows: Story = {
  render: () => (
    <div className="p-6">
      <PlpListContainer header={header}>
        {Array.from({ length: 6 }, (_, i) => (
          <PlpListBodyRow key={i}>
            <PlpListBodyCell>Item {i + 1}</PlpListBodyCell>
            <PlpListBodyCell>Description of item {i + 1}</PlpListBodyCell>
          </PlpListBodyRow>
        ))}
      </PlpListContainer>
    </div>
  ),
};

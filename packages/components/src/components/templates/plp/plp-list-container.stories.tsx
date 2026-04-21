import type { Meta, StoryObj } from "@storybook/react";
import { PlpListContainer } from "./plp-list-container";
import {
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListCell,
  PlpListRow,
  PlpListRowName,
} from "./list/plp-list-row";

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
    <PlpListHeaderCell>Name</PlpListHeaderCell>
    <PlpListHeaderCell>Description</PlpListHeaderCell>
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
          <PlpListRow key={i}>
            <PlpListCell>
              <PlpListRowName>Item {i + 1}</PlpListRowName>
            </PlpListCell>
            <PlpListCell>Description of item {i + 1}</PlpListCell>
          </PlpListRow>
        ))}
      </PlpListContainer>
    </div>
  ),
};

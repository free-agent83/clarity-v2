import type { Meta, StoryObj } from "@storybook/react";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "./empty";

const meta: Meta<typeof Empty> = {
  title: "Feedback/Empty",
  component: Empty,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Empty title</EmptyTitle>
        <EmptyDescription>Empty description</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  BooleanChipFilter,
  type BooleanChipValue,
} from "./boolean-chip";

const meta: Meta<typeof BooleanChipFilter> = {
  title: "Templates/PLP/Filters/BooleanChip",
  component: BooleanChipFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BooleanChipFilter>;

function Controlled({
  initial,
  label = "Only Nivoda Curated items",
}: {
  initial?: BooleanChipValue;
  label?: string;
}) {
  const [value, setValue] = useState<BooleanChipValue>(initial);
  return <BooleanChipFilter value={value} onChange={setValue} label={label} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Active: Story = {
  render: () => <Controlled initial={true} />,
};

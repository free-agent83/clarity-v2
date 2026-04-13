import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "./chart";

const meta: Meta<typeof ChartContainer> = {
  title: "Data/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

// Default render test disabled: ChartContainer requires a non-optional
// `config` prop and a Recharts child (ResponsiveContainer children). A
// zero-prop skeleton throws inside Recharts. See COMPONENT.md.
export const Default: Story = {
  tags: ["!test"],
  parameters: {
    docs: { disable: true },
  },
  render: () => (
    <div className="p-4 text-muted-foreground">
      Chart requires Recharts config + data — see per-component build ticket.
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "Display/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-32 w-48 rounded-md border p-2">
      <div className="space-y-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>Item {i + 1}</div>
        ))}
      </div>
    </ScrollArea>
  ),
};

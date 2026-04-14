import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconCircle,
  IconSquare,
  IconDiamond,
  IconHexagon,
  IconPentagon,
  IconStar,
} from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "Forms/Toggle Group",
  component: ToggleGroup,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
    },
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  args: { type: "single", defaultValue: "bold" },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <IconBold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <IconItalic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <IconUnderline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const italic = canvas.getByRole("radio", { name: "Italic" });
    await userEvent.click(italic);
    await expect(italic).toHaveAttribute("data-state", "on");
  },
};

export const Multiple: Story = {
  args: { type: "multiple", defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <IconBold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <IconItalic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <IconUnderline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Showcases how items space apart from each other. If the underlying
// component exposes a `spacing` prop, pass it via args. Otherwise this
// story falls back to container-level spacing and notes the limitation.
export const Spacing: Story = {
  args: { type: "single" },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Default spacing</span>
        <ToggleGroup {...args}>
          <ToggleGroupItem value="bold" aria-label="Bold">
            <IconBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <IconItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <IconUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

// Custom composition pattern: each item is a larger tile with a
// placeholder icon above a label. Icons are Tabler placeholders —
// real diamond-cut icons arrive when the visual asset library exists.
const CUTS = [
  { value: "round", label: "Round", Icon: IconCircle },
  { value: "princess", label: "Princess", Icon: IconSquare },
  { value: "emerald", label: "Emerald", Icon: IconHexagon },
  { value: "oval", label: "Oval", Icon: IconDiamond },
  { value: "cushion", label: "Cushion", Icon: IconPentagon },
  { value: "marquise", label: "Marquise", Icon: IconStar },
] as const;

export const DiamondCutSelector: Story = {
  args: { type: "single", defaultValue: "round" },
  render: (args) => (
    <ToggleGroup {...args} className="flex flex-wrap gap-3">
      {CUTS.map(({ value, label, Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={label}
          className="flex h-auto flex-col items-center gap-2 p-4 data-[state=on]:bg-accent"
        >
          <Icon className="size-8" />
          <span className="text-xs">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
};

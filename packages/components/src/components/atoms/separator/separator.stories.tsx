import type { Meta, StoryObj } from "@storybook/react"
import { Separator } from "./separator"

const meta: Meta<typeof Separator> = {
  title: "Display/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
}

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="space-y-3">
      <p className="text-sm">Section above</p>
      <Separator {...args} />
      <p className="text-sm">Section below</p>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <span>Item A</span>
      <Separator {...args} />
      <span>Item B</span>
      <Separator {...args} />
      <span>Item C</span>
    </div>
  ),
}

export const NonDecorative: Story = {
  args: {
    decorative: false,
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="space-y-3">
      <p className="text-sm">Content group 1</p>
      <Separator {...args} />
      <p className="text-sm">Content group 2</p>
    </div>
  ),
}

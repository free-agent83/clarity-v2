import type { Meta, StoryObj } from "@storybook/react"
import { Typography } from "./typography"

const meta: Meta<typeof Typography> = {
  title: "Display/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "lead", "large", "small", "muted"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Typography>

export const Default: Story = {
  args: { children: "The quick brown fox jumps over the lazy dog." },
}

export const Heading1: Story = {
  args: { variant: "h1", children: "Heading 1" },
}

export const Heading2: Story = {
  args: { variant: "h2", children: "Heading 2" },
}

export const Heading3: Story = {
  args: { variant: "h3", children: "Heading 3" },
}

export const Heading4: Story = {
  args: { variant: "h4", children: "Heading 4" },
}

export const Lead: Story = {
  args: { variant: "lead", children: "A lead paragraph for introductory text." },
}

export const Large: Story = {
  args: { variant: "large", children: "Large text" },
}

export const Small: Story = {
  args: { variant: "small", children: "Small text" },
}

export const Muted: Story = {
  args: { variant: "muted", children: "Muted text for secondary information." },
}

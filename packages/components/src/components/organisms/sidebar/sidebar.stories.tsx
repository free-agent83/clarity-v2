import type { Meta, StoryObj } from "@storybook/react";
import { SidebarProvider } from "./sidebar";

const meta: Meta<typeof SidebarProvider> = {
  title: "Navigation/Sidebar",
  component: SidebarProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SidebarProvider>;

export const Default: Story = {};

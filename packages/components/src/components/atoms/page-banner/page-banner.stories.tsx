import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "../button/button";
import { PageBanner, PageBannerAction, PageBannerTitle } from "./page-banner";

const meta: Meta<typeof PageBanner> = {
  title: "Feedback/Page Banner",
  component: PageBanner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;
type Story = StoryObj<typeof PageBanner>;

export const Default: Story = {
  render: (args) => (
    <PageBanner {...args}>
      <IconSparkles />
      <PageBannerTitle>
        New: AI-assisted search is now available on all accounts.
      </PageBannerTitle>
      <PageBannerAction>
        <Button variant="link" size="sm" className="text-current">
          Learn more
        </Button>
      </PageBannerAction>
    </PageBanner>
  ),
};

export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <PageBanner {...args} variant="warning">
      <IconAlertTriangle />
      <PageBannerTitle>
        Scheduled maintenance this Sunday 02:00–04:00 UTC.
      </PageBannerTitle>
      <PageBannerAction>
        <Button variant="link" size="sm" className="text-current">
          Read more
        </Button>
      </PageBannerAction>
    </PageBanner>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col">
      <PageBanner {...args} variant="default">
        <IconSparkles />
        <PageBannerTitle>Default (brand).</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="success">
        <IconInfoCircle />
        <PageBannerTitle>Success.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="info">
        <IconInfoCircle />
        <PageBannerTitle>Info.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="warning">
        <IconAlertTriangle />
        <PageBannerTitle>Warning.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="destructive">
        <IconAlertTriangle />
        <PageBannerTitle>Destructive.</PageBannerTitle>
      </PageBanner>
    </div>
  ),
};

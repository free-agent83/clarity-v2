import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconSparkles,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "../button/button";
import {
  InlineBanner,
  InlineBannerTitle,
  InlineBannerDescription,
  InlineBannerActions,
  InlineBannerMedia,
} from "./inline-banner";

const meta: Meta<typeof InlineBanner> = {
  title: "Feedback/Inline Banner",
  component: InlineBanner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "lg", "xl"],
    },
  },
  args: {
    variant: "info",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof InlineBanner>;

export const Default: Story = {
  render: (args) => (
    <InlineBanner {...args}>
      <IconInfoCircle />
      <InlineBannerTitle>Inventory refreshed</InlineBannerTitle>
      <InlineBannerDescription>
        Showing the latest listings from all sourcing partners.
      </InlineBannerDescription>
    </InlineBanner>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <InlineBanner {...args} size="lg">
      <IconSparkles />
      <InlineBannerTitle>New: AI-assisted search</InlineBannerTitle>
      <InlineBannerDescription>
        Find inventory faster with natural-language queries.
      </InlineBannerDescription>
      <InlineBannerActions>
        <Button size="sm">Try it</Button>
      </InlineBannerActions>
    </InlineBanner>
  ),
};

export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <InlineBanner {...args}>
      <IconInfoCircle />
      <InlineBannerTitle>Inventory refreshed</InlineBannerTitle>
      <InlineBannerDescription>
        Showing the latest listings from all sourcing partners.
      </InlineBannerDescription>
    </InlineBanner>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InlineBanner {...args} variant="default">
        <IconInfoCircle />
        <InlineBannerTitle>Default</InlineBannerTitle>
        <InlineBannerDescription>Neutral page-level callout.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="success">
        <IconCircleCheck />
        <InlineBannerTitle>Success</InlineBannerTitle>
        <InlineBannerDescription>Positive confirmation.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="info">
        <IconInfoCircle />
        <InlineBannerTitle>Info</InlineBannerTitle>
        <InlineBannerDescription>Neutral guidance.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="warning">
        <IconAlertTriangle />
        <InlineBannerTitle>Warning</InlineBannerTitle>
        <InlineBannerDescription>Cautionary notice.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="destructive">
        <IconAlertCircle />
        <InlineBannerTitle>Destructive</InlineBannerTitle>
        <InlineBannerDescription>Error state.</InlineBannerDescription>
      </InlineBanner>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <InlineBanner {...args} size="default">
        <IconSparkles />
        <InlineBannerTitle>Default size</InlineBannerTitle>
        <InlineBannerDescription>Compact page-level callout.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} size="lg">
        <IconSparkles />
        <InlineBannerTitle>Large size</InlineBannerTitle>
        <InlineBannerDescription>
          More generous padding for substantive messages, with a bigger icon.
        </InlineBannerDescription>
        <InlineBannerActions>
          <Button size="sm" variant="outline">Later</Button>
          <Button size="sm">Try it</Button>
        </InlineBannerActions>
      </InlineBanner>
      <InlineBanner {...args} size="xl">
        <InlineBannerMedia>
          <IconSparkles />
        </InlineBannerMedia>
        <InlineBannerTitle>XL size with media slot</InlineBannerTitle>
        <InlineBannerDescription>
          At xl, the media slot replaces the icon and supports an illustration up to ~160×160px.
        </InlineBannerDescription>
        <InlineBannerActions>
          <Button size="sm">Get started</Button>
        </InlineBannerActions>
      </InlineBanner>
    </div>
  ),
};

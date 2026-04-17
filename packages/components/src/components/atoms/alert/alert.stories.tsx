import type { Meta, StoryObj } from "@storybook/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "../button/button";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "warning", "info", "success"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        A concise, single-paragraph description of the alert.
      </AlertDescription>
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <IconInfoCircle />
      <AlertTitle>Shipment delayed</AlertTitle>
      <AlertDescription>
        Your parcel will arrive one day later than scheduled.
      </AlertDescription>
    </Alert>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Unsaved changes</AlertTitle>
      <AlertDescription>
        You have changes that have not yet been saved.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Save
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Saved successfully.</AlertTitle>
    </Alert>
  ),
};

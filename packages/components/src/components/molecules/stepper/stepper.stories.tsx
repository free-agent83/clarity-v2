import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../../atoms/button/button";
import {
  Stepper,
  StepperItem,
  StepperItemIndicator,
  StepperItemLabel,
} from "./stepper";

const LABELS = ["Details", "Shipping", "Payment", "Review"];

const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    activeStep: {
      control: { type: "number", min: 0, max: LABELS.length - 1 },
    },
  },
  args: {
    activeStep: 1,
    errorSteps: [],
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

function renderSteps() {
  return LABELS.map((label) => (
    <StepperItem key={label}>
      <StepperItemIndicator />
      <StepperItemLabel>{label}</StepperItemLabel>
    </StepperItem>
  ));
}

export const Default: Story = {
  render: (args) => <Stepper {...args}>{renderSteps()}</Stepper>,
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-2 text-xs text-muted-foreground">activeStep = 0</div>
        <Stepper {...args} activeStep={0}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">activeStep = 2</div>
        <Stepper {...args} activeStep={2}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">
          activeStep = 3, all complete
        </div>
        <Stepper {...args} activeStep={3}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">
          activeStep = 2, errorSteps = [1]
        </div>
        <Stepper {...args} activeStep={2} errorSteps={[1]}>
          {renderSteps()}
        </Stepper>
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  args: { onStepClick: fn() },
  render: (args) => <Stepper {...args} activeStep={2}>{renderSteps()}</Stepper>,
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeStep, setActiveStep] = React.useState(0);
    const last = LABELS.length - 1;
    return (
      <div className="flex flex-col gap-6">
        <Stepper activeStep={activeStep} onStepClick={setActiveStep}>
          {renderSteps()}
        </Stepper>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveStep((v) => Math.max(0, v - 1))}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => setActiveStep((v) => Math.min(last, v + 1))}
            disabled={activeStep === last}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
};

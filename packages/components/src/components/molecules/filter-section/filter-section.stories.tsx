import type { Meta, StoryObj } from "@storybook/react";
import { FilterSection } from "./filter-section";
import { Typography } from "../../atoms/typography/typography";

const meta: Meta<typeof FilterSection> = {
  title: "Filtering/FilterSection",
  component: FilterSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterSection>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <FilterSection label="Color" separator={false}>
        <Typography variant="body-2" className="text-muted-foreground">
          Filter control goes here
        </Typography>
      </FilterSection>
    </div>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div className="w-80">
      <FilterSection label="Color" separator={false}>
        <Typography variant="body-2" className="text-muted-foreground">Control 1</Typography>
      </FilterSection>
      <FilterSection label="Clarity">
        <Typography variant="body-2" className="text-muted-foreground">Control 2</Typography>
      </FilterSection>
      <FilterSection label="Price">
        <Typography variant="body-2" className="text-muted-foreground">Control 3</Typography>
      </FilterSection>
    </div>
  ),
};

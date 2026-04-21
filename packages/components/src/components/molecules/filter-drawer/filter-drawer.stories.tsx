import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { Button } from "../../atoms/button/button";
import { FilterDrawer } from "./filter-drawer";
import { FilterSection } from "../filter-section/filter-section";

const meta: Meta<typeof FilterDrawer> = {
  title: "Filtering/FilterDrawer",
  component: FilterDrawer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

function Controlled({
  initialOpen = false,
  resultsCount,
  isCountLoading,
  hasActiveDraft,
  applyLabel,
}: {
  initialOpen?: boolean;
  resultsCount?: number;
  isCountLoading?: boolean;
  hasActiveDraft?: boolean;
  applyLabel?: string;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <FilterDrawer
        open={open}
        onOpenChange={setOpen}
        onApply={() => { fn()(); setOpen(false); }}
        onClearDraft={fn()}
        hasActiveDraft={hasActiveDraft}
        resultsCount={resultsCount}
        isCountLoading={isCountLoading}
        applyLabel={applyLabel}
      >
        <FilterSection label="Section A" separator={false}>
          <div className="text-sm text-muted-foreground">Filter control A</div>
        </FilterSection>
        <FilterSection label="Section B">
          <div className="text-sm text-muted-foreground">Filter control B</div>
        </FilterSection>
      </FilterDrawer>
    </>
  );
}

export const Default: Story = { render: () => <Controlled /> };
export const Open: Story = { render: () => <Controlled initialOpen /> };
export const WithResultCount: Story = {
  render: () => <Controlled initialOpen resultsCount={1234} hasActiveDraft />,
};
export const CountLoading: Story = {
  render: () => <Controlled initialOpen resultsCount={1234} isCountLoading />,
};
export const NoCountCustomLabel: Story = {
  render: () => <Controlled initialOpen applyLabel="Save" />,
};

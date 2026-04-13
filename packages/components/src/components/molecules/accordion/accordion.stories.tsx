import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "Navigation/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" defaultValue="one" collapsible className="w-64">
      <AccordionItem value="one">
        <AccordionTrigger>Item one</AccordionTrigger>
        <AccordionContent>Content one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Item two</AccordionTrigger>
        <AccordionContent>Content two</AccordionContent>
      </AccordionItem>
      <AccordionItem value="three">
        <AccordionTrigger>Item three</AccordionTrigger>
        <AccordionContent>Content three</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

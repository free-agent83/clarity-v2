import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const meta: Meta<typeof Carousel> = {
  title: "Display/Carousel",
  component: Carousel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: () => (
    <Carousel className="w-64">
      <CarouselContent>
        <CarouselItem>
          <div className="flex aspect-square items-center justify-center bg-muted">1</div>
        </CarouselItem>
        <CarouselItem>
          <div className="flex aspect-square items-center justify-center bg-muted">2</div>
        </CarouselItem>
        <CarouselItem>
          <div className="flex aspect-square items-center justify-center bg-muted">3</div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

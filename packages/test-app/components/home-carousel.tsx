"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from "@nivoda/components";

const HERO_SLIDES = [
  { label: "Slide 1", className: "bg-violet-100 text-violet-500" },
  { label: "Slide 2", className: "bg-sky-100 text-sky-500" },
  { label: "Slide 3", className: "bg-amber-100 text-amber-500" },
];

const AUTOPLAY_INTERVAL = 5000;

function CarouselControls() {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL);
    const stop = () => clearInterval(interval);
    api.on("pointerDown", stop);
    return () => {
      clearInterval(interval);
      api.off("pointerDown", stop);
    };
  }, [api]);

  return (
    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
      <CarouselPrevious
        className="static size-8 translate-y-0 bg-background/80 backdrop-blur-sm"
        onClick={scrollPrev}
      />
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "size-2 rounded-full transition-colors",
              i === current ? "bg-foreground" : "bg-foreground/25",
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
      <CarouselNext
        className="static size-8 translate-y-0 bg-background/80 backdrop-blur-sm"
        onClick={scrollNext}
      />
    </div>
  );
}

export function HomeCarousel() {
  return (
    <Carousel className="overflow-hidden rounded-xl" opts={{ loop: true }}>
      <CarouselContent className="ml-0">
        {HERO_SLIDES.map((slide, i) => (
          <CarouselItem key={i} className="pl-0">
            <div
              className={cn(
                "flex h-100 items-center justify-center",
                slide.className,
              )}
            >
              {slide.label}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}

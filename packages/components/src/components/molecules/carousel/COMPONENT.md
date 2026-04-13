---
name: Carousel
slug: carousel
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Carousel

A scrollable container for cycling through a set of content items, powered by Embla Carousel.

## Props

### Carousel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Scroll direction |
| `opts` | `CarouselOptions` | — | Embla Carousel configuration options |
| `plugins` | `CarouselPlugin` | — | Embla Carousel plugins |
| `setApi` | `(api: CarouselApi) => void` | — | Callback to access the carousel API |
| `className` | `string` | — | Additional CSS classes |

### Sub-components

- **CarouselContent** — Scrollable track that contains carousel items.
- **CarouselItem** — Individual slide wrapper. Each direct child is one slide.
- **CarouselPrevious** — Navigation button to scroll to the previous slide.
- **CarouselNext** — Navigation button to scroll to the next slide.

## Usage guidelines

Use Carousel for browsing through a set of related items when screen space is limited — product images, testimonials, feature highlights.

Do not use Carousel for critical content that users must see. Carousels have low engagement rates for content beyond the first slide.

## Best practices

**Do:** Provide CarouselPrevious and CarouselNext for keyboard and mouse navigation.

**Do:** Keep the number of slides manageable (3-10 items).

**Don't:** Auto-advance the carousel without user consent — it creates accessibility issues.

**Don't:** Put unrelated content in different slides. Each carousel should be thematically cohesive.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values

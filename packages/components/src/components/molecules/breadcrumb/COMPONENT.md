---
name: Breadcrumb
slug: breadcrumb
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Breadcrumb

Navigation trail showing the user's location inside a hierarchical structure.

## Props

Breadcrumb is a compound component. Compose it from the following subcomponents:

- `Breadcrumb` — root `<nav>`
- `BreadcrumbList` — `<ol>` wrapping the segments
- `BreadcrumbItem` — `<li>` wrapping each segment
- `BreadcrumbLink` — clickable segment; pass `asChild` to use a framework link
- `BreadcrumbPage` — the current page segment, non-interactive, with `aria-current="page"`
- `BreadcrumbSeparator` — visual divider; defaults to a chevron icon
- `BreadcrumbEllipsis` — collapsed-state indicator for long trails

All subcomponents accept standard HTML attributes for their root element via prop spread.

## Usage guidelines

Use Breadcrumb to show the user's position in a hierarchical app structure (category → subcategory → item). Put Breadcrumb at the top of the content area, below the global navigation.

**Don't use Breadcrumb** for flat navigation — if all pages are siblings, Breadcrumb adds noise. **Don't use Breadcrumb** as a replacement for a back button in linear flows.

## Best practices

- **Do:** Always end the trail with a `BreadcrumbPage`, not a `BreadcrumbLink`, for the current page.
- **Do:** Use `BreadcrumbEllipsis` to collapse the middle of long trails — keep the first and last segments visible.
- **Do:** Keep segment labels concise — match the page title.
- **Don't:** Link the current page back to itself.
- **Don't:** Mix breadcrumbs with tabs for the same navigation level — pick one pattern.

## Writing

- Match the page title exactly. If the page title is "Round brilliant cut diamonds", the breadcrumb segment is "Round brilliant cut diamonds" — not "Round" or "Diamonds".
- Sentence case for all segments.
- No trailing punctuation.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: wraps to a new line in narrow containers
- [x] Tokens only: no raw literals inside arbitrary value syntax

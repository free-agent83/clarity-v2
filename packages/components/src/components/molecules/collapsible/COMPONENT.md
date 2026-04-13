---
name: Collapsible
slug: collapsible
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Collapsible

An interactive section that can be expanded or collapsed to show or hide content.

## Props

### Collapsible

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `className` | `string` | — | Additional CSS classes |

### Sub-components

- **CollapsibleTrigger** — The element that toggles the collapsible open/closed.
- **CollapsibleContent** — The content that is shown or hidden.

## Usage guidelines

Use Collapsible for content that is secondary or supplementary and can be hidden by default to reduce visual noise.

Do not use Collapsible for critical content that users must see. If all content is equally important, display it all.

For multiple collapsible sections, consider Accordion instead, which enforces single-open behaviour.

## Best practices

**Do:** Make the trigger clearly indicate that content can be expanded (e.g. a chevron icon).

**Do:** Use `defaultOpen` for sections that are likely to be read immediately.

**Don't:** Hide error messages or required information inside a collapsed section.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values

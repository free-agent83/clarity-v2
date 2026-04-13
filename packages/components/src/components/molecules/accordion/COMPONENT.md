---
name: Accordion
slug: accordion
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Accordion

A vertically stacked set of interactive headings that each reveal an associated section of content. Built on Radix UI Accordion primitive.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"single" \| "multiple"` | — | Whether one or multiple items can be open at once |
| `collapsible` | `boolean` | `false` | When `type="single"`, allows closing all items |
| `defaultValue` | `string \| string[]` | — | The value(s) of the item(s) to expand by default |
| `value` | `string \| string[]` | — | Controlled expanded item(s) |
| `onValueChange` | `(value: string \| string[]) => void` | — | Callback when expanded items change |

### AccordionItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Unique value identifying this item |
| `disabled` | `boolean` | `false` | Whether the item is disabled |

## Usage guidelines

Use Accordion to progressively disclose content and reduce visual clutter. Ideal for FAQs, settings panels, and long lists of related content sections.

Do not use Accordion for primary navigation — use Tabs or a sidebar instead. Do not use it when all content should be visible simultaneously.

## Best practices

**Do:** Use `type="single" collapsible` when users typically need only one section at a time.

**Do:** Use `type="multiple"` when users may need to compare content across sections.

**Don't:** Nest Accordions inside Accordions — flatten the hierarchy instead.

**Don't:** Put critical information inside accordion items that users must see.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values

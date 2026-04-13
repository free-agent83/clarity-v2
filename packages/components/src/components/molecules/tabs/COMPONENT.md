---
name: Tabs
slug: tabs
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Tabs

Organises content into multiple panels, showing one at a time. Built on Radix UI Tabs primitive.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `string` | — | The value of the tab to select by default |
| `value` | `string` | — | Controlled selected tab value |
| `onValueChange` | `(value: string) => void` | — | Callback when the selected tab changes |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation of the tab list |

### TabsList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "line"` | `"default"` | Visual style of the tabs list |

### TabsTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Unique value identifying this tab |
| `disabled` | `boolean` | `false` | Whether the tab trigger is disabled |

### TabsContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Value matching the corresponding trigger |

## Usage guidelines

Use Tabs to organise related content into a compact layout where only one panel is visible at a time. Each tab should contain content that is at the same level of hierarchy and related in purpose.

Do not use Tabs for sequential workflows or wizards — use a stepper or multi-step form instead. Do not use Tabs when content panels have very different lengths or complexity — consider an Accordion or separate pages.

## Best practices

**Do:** Keep tab labels short and descriptive — 1-2 words.

**Do:** Use the `line` variant for secondary navigation within a page section.

**Don't:** Use more than 5-6 tabs — if you need more, consider a different navigation pattern.

**Don't:** Nest Tabs inside Tabs — it creates confusing navigation hierarchy.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values

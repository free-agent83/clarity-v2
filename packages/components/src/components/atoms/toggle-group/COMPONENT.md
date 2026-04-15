---
name: ToggleGroup
slug: toggle-group
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---

# Toggle Group

Group of toggle buttons where one (or many) can be pressed at a time.

## Props

### ToggleGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"single" \| "multiple"` | — | Required. `single` behaves like a radio group; `multiple` allows independent toggles. |
| `value` | `string \| string[]` | — | Controlled selected value(s). |
| `defaultValue` | `string \| string[]` | — | Uncontrolled initial selected value(s). |
| `onValueChange` | `(value) => void` | — | Called when the selection changes. |
| `variant` | `"default" \| "outline"` | `"default"` | Visual style. |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Size of items. |
| `spacing` | `number` | `0` | Gap in pixels between items when spacing > 0. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction. |

### ToggleGroupItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Required. Identifies the item in the group's selection state. |
| `disabled` | `boolean` | `false` | Disables the individual item. |

All standard HTML button attributes are supported via prop spread on ToggleGroupItem.

## Usage guidelines

Use Toggle Group for mutually exclusive or multi-select choices where the options are few and visual. Typical cases: text alignment pickers, formatting controls, small category selectors.

**Don't use Toggle Group** when there are many options — use Select or Combobox. **Don't use Toggle Group** when the choices need labels longer than a short word — use RadioGroup or Checkbox with Label.

## Best practices

- **Do:** Choose `type="single"` for either/or choices and `type="multiple"` for independent toggles.
- **Do:** Give every item an `aria-label` when the visible content is icon-only.
- **Do:** Keep items visually consistent — same size, same icon style, same alignment.
- **Don't:** Mix icon-only items with text-only items in the same group.
- **Don't:** Use Toggle Group as a navigation control. Use Tabs or a button group instead.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: items wrap via container utilities when needed
- [x] Tokens only: no raw literals inside arbitrary value syntax

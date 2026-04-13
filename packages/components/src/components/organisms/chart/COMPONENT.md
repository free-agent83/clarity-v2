---
name: Chart
slug: chart
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Chart

A themed chart container built on Recharts that integrates with the design system's color tokens and provides consistent tooltip and legend components.

## Props

### ChartContainer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `ChartConfig` | — | Chart configuration mapping data keys to labels, colors, and icons |
| `children` | `ReactNode` | — | Recharts chart component (BarChart, LineChart, etc.) |
| `className` | `string` | — | Additional CSS classes |
| `initialDimension` | `{ width: number; height: number }` | `{ width: 320, height: 200 }` | Initial dimensions before responsive resize |

### ChartConfig

```ts
type ChartConfig = Record<string, {
  label?: ReactNode
  icon?: ComponentType
} & (
  | { color?: string; theme?: never }
  | { color?: never; theme: Record<"light" | "dark", string> }
)>
```

### Sub-components

| Sub-component | Description |
|---------------|-------------|
| `ChartContainer` | Provides chart context, responsive sizing, and theme-aware CSS variables |
| `ChartTooltip` | Re-export of Recharts Tooltip for use inside the chart context |
| `ChartTooltipContent` | Themed tooltip content with indicator styles (dot, line, dashed) |
| `ChartLegend` | Re-export of Recharts Legend for use inside the chart context |
| `ChartLegendContent` | Themed legend content with color indicators and labels |
| `ChartStyle` | Injects CSS custom properties for chart colors based on config |

## Usage guidelines

Use Chart (ChartContainer) to wrap any Recharts chart component. The container provides design-system-integrated theming, responsive sizing, and consistent tooltip/legend styling.

Do not use raw Recharts components directly — always wrap in ChartContainer so that colors, typography, and dark mode are handled automatically.

## Best practices

**Do:** Define a `ChartConfig` that maps every data key to a human-readable label and a token-based color.

**Do:** Use `var(--color-<key>)` for fill and stroke inside chart components so colors resolve from the config.

**Do:** Use `ChartTooltipContent` and `ChartLegendContent` for consistent tooltip and legend styling.

**Don't:** Hardcode hex colors in chart components — use the config's `color` or `theme` fields.

**Don't:** Skip the `config` prop — it is required for tooltip and legend rendering.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: ResponsiveContainer handles resize at all breakpoints
- [ ] Tokens only: no hardcoded visual values

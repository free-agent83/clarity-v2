---
name: ChartContainer
slug: chart
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "data-chart--default"
description: "Chart visualizes quantitative trends and comparisons using tokenized styles."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Chart when visual comparison outperforms tabular reading. Pair charts with summary values and clear axis/legend context.

## Best practices

- Use consistent color semantics across chart series and states.
- Label units explicitly; do not rely on axis position alone.
- Provide fallback table/summary for accessibility and precision tasks.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
- [ ] render: Default story disabled — ChartContainer requires a non-optional `config` prop and Recharts children; skeleton mount throws. Needs a real story with Recharts config + data; see future ticket.
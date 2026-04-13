---
name: Table
slug: table
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Table

A semantic HTML table component for displaying structured tabular data.

## Props

Table is a multi-part component. Each sub-component accepts the props of its underlying HTML element plus `className`.

| Sub-component | HTML element | Description |
|---------------|-------------|-------------|
| `Table` | `<table>` | Root table element, wrapped in a scrollable container |
| `TableHeader` | `<thead>` | Table header section |
| `TableBody` | `<tbody>` | Table body section |
| `TableFooter` | `<tfoot>` | Table footer section with muted background |
| `TableRow` | `<tr>` | Table row with hover and selected states |
| `TableHead` | `<th>` | Header cell with medium font weight |
| `TableCell` | `<td>` | Standard data cell |
| `TableCaption` | `<caption>` | Table caption with muted text |

## Usage guidelines

Use Table for presenting structured data in rows and columns. Suited for invoices, lists, comparison grids, and any dataset where users scan across multiple attributes per item.

Do not use Table for layout purposes. For complex data tables with sorting, filtering, and pagination, use the DataTable organism instead.

## Best practices

**Do:** Include a `TableHeader` for column labels so users and screen readers understand the data structure.

**Do:** Use `TableCaption` to provide context about what the table contains.

**Do:** Right-align numeric columns using `className="text-right"` for easier scanning.

**Don't:** Use Table for non-tabular data. Use Card or a list layout instead.

**Don't:** Nest interactive elements inside cells without ensuring keyboard accessibility.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: horizontal scroll container handles overflow at narrow widths
- [ ] Tokens only: no hardcoded visual values

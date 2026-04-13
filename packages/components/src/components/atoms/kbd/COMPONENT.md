---
name: Kbd
slug: kbd
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Kbd

An inline keyboard shortcut indicator styled to look like a physical key.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Key label (e.g. "K", "Ctrl", "Enter") |

## Usage guidelines

Use Kbd inside tooltips, menu items, or inline text to communicate keyboard shortcuts to users.

Do not use Kbd for decorative purposes. Every Kbd instance should represent an actual keyboard key or shortcut.

## Best practices

**Do:** Use standard key names: "Ctrl", "Shift", "Alt", "Enter", "Esc".

**Do:** Combine multiple Kbd elements with a separator for compound shortcuts (e.g. `<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>`).

**Don't:** Put long text inside Kbd — it's designed for single keys or short modifiers.

## Writing

- Use platform-appropriate key names when possible (Cmd on macOS, Ctrl on Windows)
- Capitalise single letters: "K", not "k"
- Use standard abbreviations: "Ctrl", "Cmd", "Esc", "Del"

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values

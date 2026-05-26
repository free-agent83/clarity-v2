---
name: Megamenu
slug: megamenu
version: 0.1.0
status: unstable
lastUpdated: 2026-04-30
story: "navigation-megamenu--default"
---

# Megamenu

Trigger-agnostic compound component for app-header navigation panels. A row of triggers (some megamenu, some plain links) coordinates so only one panel is open at a time, cross-trigger handoff is instant, and the panel collapses into a bottom Sheet below `lg`.

## Props

Megamenu is a compound component. The pieces:

- `MegamenuGroup` — coordinator + `<nav>` landmark
- `Megamenu` — root for a single instance; holds open state + timing
- `MegamenuTrigger` — behavior + ARIA wrapper (unstyled, `asChild`-first)
- `MegamenuContent` — the panel; portals to `document.body` on `lg+`, renders inside `Sheet` below `lg`
- `MegamenuLink` — atomic item (leading slot + title + description)
- `MegamenuFooter` — bottom strip across the panel
- `MegamenuTabs`, `MegamenuTabsList`, `MegamenuTabsTrigger`, `MegamenuTabsPanel` — internal vertical tabs

### MegamenuGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | — | Forwarded to the `<nav>` element. Set this when there are multiple `<nav>` landmarks on a page. |

Accepts all native `<nav>` props.

### Megamenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires whenever the panel opens or closes. |
| `openDelay` | `number` (ms) | `100` | Delay before hover opens. Skipped when another megamenu in the group is already open. |
| `closeDelay` | `number` (ms) | `150` | Grace period before mouseout closes — gives the cursor time to traverse the gap between trigger and panel. |

**Activation:** on `lg` and up, the panel opens on hover and clicks are pass-through — an `asChild` link navigates as expected. Below `lg`, hover is ignored and clicks open the Sheet (with `event.preventDefault()` so an `asChild` link does not navigate; the user picks a subcategory from the Sheet instead).

### MegamenuTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | When true, clones the single child and forwards `aria-expanded`, `aria-controls`, `aria-haspopup`, `data-state`, the ref, and pointer/click/keyboard handlers. |

Default rendering is a bare `<button type="button">` with no styling. Production use is almost always `asChild`. Sets `data-state="open" \| "closed"` so consumers can style their row item via attribute selectors.

### MegamenuContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | trigger text | Accessible label for the panel `region`. Defaults to the trigger's text content; override when the trigger isn't text-only. |
| `yOffset` | `1 \| 2 \| ... \| 12` | — | Pull the panel upward by N units of the Tailwind spacing scale (1 = 0.25rem). Useful when the panel sits below a dark strip and needs to overlap the boundary for visual continuity. The translation is always negative. |

### MegamenuLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | Required. |
| `title` | `ReactNode` | — | Required. Primary label. |
| `description` | `ReactNode` | — | Optional secondary line. |
| `leading` | `ReactNode` | — | Optional content rendered before the label — typically an icon, but accepts any node. |
| `asChild` | `boolean` | `false` | For routing libraries — pass a `<Link>` element through. |
| `data-keep-open` | `""` (presence) | — | When set on the rendered anchor, clicking it does not close the panel. |

### MegamenuTabs

`MegamenuTabs`, `MegamenuTabsList`, `MegamenuTabsTrigger`, and `MegamenuTabsPanel` accept the props of their underlying Radix `Tabs` primitives.

`MegamenuTabsTrigger` adds:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leading` | `ReactNode` | — | Optional content rendered before the label — typically an icon, but accepts any node. |

`MegamenuTabsPanel` adds:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabLabel` | `ReactNode` | the `value` | Heading shown above the panel on collapsed layouts (below `lg`). Ignored when the tablist is visible. |

## Usage guidelines

Use Megamenu for the primary navigation row in a marketing or product app header. The DS owns the panel and its internals; the trigger is unstyled and inherits its visual identity from the consumer's row-item component.

**Don't use Megamenu** for a contextual menu attached to a button — use `DropdownMenu`. **Don't use Megamenu** for a single-purpose link list under a header — a styled `<a>` row inside the header is enough. **Don't use Megamenu** as the primary navigation on a small-screen-only surface — below `lg` it falls back to a Sheet, which is the right behavior on mobile but isn't a substitute for a dedicated `Sidebar` or `Drawer` pattern.

The activation mode is per-instance, but in practice an app header should pick one mode and apply it consistently across all megamenus in the group.

## Best practices

**Do:** Build a single consumer row-item component (`NavLinkItem` or similar), and use it in two places — inside `<MegamenuTrigger asChild>` for megamenu items, standalone in `<MegamenuGroup>` for plain links. The DS owns no row-item styling so that the entire nav row has a single source of truth in your app.

**Do:** Style open/closed state on the row item using `data-state` selectors, e.g. `data-[state=open]:text-foreground` or rotating a chevron via `[[data-state=open]_svg]:rotate-180`.

**Do:** Always pass `aria-label` to `MegamenuGroup` when the page has more than one `<nav>` landmark.

**Don't:** Apply hover transitions on the trigger that conflict with the open state. The panel's `openDelay` is small (100ms) but visible — long trigger transitions feel jittery against it.

**Don't:** Render a megamenu trigger without an accessible name. The default `aria-label` for the panel is sourced from the trigger's text content, so an icon-only trigger needs an explicit `aria-label` on `MegamenuContent`.

## Quality checklist

- [x] Accessibility: disclosure pattern (W3C APG), `aria-expanded` / `aria-controls` on trigger, `role="region"` on panel, Escape closes + restores focus
- [x] Tokens only: no hardcoded visual values
- [x] Responsive: full panel on `lg+`, bottom Sheet below `lg`
- [x] Keyboard: Tab traverses linearly through trigger row and expanded panel; Escape closes
- [x] Reduced motion respected (animation collapses to instant)
- [ ] Storybook play functions cover hover flow, click flow, and Escape close

## Known deviations

- **Trigger styling.** Per spec, the trigger ships unstyled — consumers wire their own row-item. This is a deliberate departure from the existing `NavigationMenu` organism, which ships a styled trigger.
- **Internal tab flatten.** On collapsed layouts, all `MegamenuTabsPanel` children render in flow with their `tabLabel` as a heading. The implementation uses CSS to unhide inactive panels rather than swapping the render tree, so consumer-set `tabLabel` props are required for legibility.
- **Hover bridge.** v1 uses a time-based `closeDelay` only. The geometric "safe triangle" upgrade is tracked in the project backlog.
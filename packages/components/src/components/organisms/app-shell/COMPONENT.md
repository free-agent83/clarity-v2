---
name: AppShell
slug: app-shell
version: 0.0.6
status: unstable
lastUpdated: 2026-04-15
---

# AppShell

Top-level page shell — a sticky header with branding, a hardcoded
search bar, and a controls slot; a left-anchored navigation sheet
that owns its own three-region layout (fixed header, scrollable
body, fixed footer with user identity and sign-out); and a main
page area with a constrained inner container. The base chrome for
every Nivoda app, internal or external.

## Props

### `AppShell`

`className` is intentionally omitted — styling `AppShell` at the
root level is not allowed, so downstream apps cannot drift.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `full` | `boolean` | `false` | Remove the main area's max-width so content paints edge-to-edge. Escape hatch, not the default — see Usage guidelines. |
| `defaultNavigationOpen` | `boolean` | — | Start with the navigation sheet visible on mount. Intended for Storybook workbench stories where the nav sheet is the subject under inspection. In production surfaces, leave it undefined so the sheet starts closed. |

### `AppShellHeader`

Accepts `AppShellBrand` and `AppShellActions` as children. The
search bar in the middle is hardcoded — not a slot, not
overridable, and not composed as a child. See "Search bar" below.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `() => void` | *(required)* | Fires when the user clicks the hardcoded search bar. How the callback handles the search (opening a Dialog, a command palette, navigating to a search page, etc.) is app-specific. |

### Search bar

The header renders an internal `AppShellSearchBar` — a `<button>`
visually styled like an `Input`, with a leading search icon and
fixed placeholder text "Search Nivoda…". It is not exported,
cannot be replaced, and is the **only** way to trigger search from
the header. Clicking it fires `AppShellHeader`'s `onSearch`
callback.

The component is a button, not an input, specifically so consuming
apps can route the search interaction to whatever UI they need —
a Dialog, a command palette, a search page — without the shell
taking a position on the behaviour.

### `AppShellNavTrigger`

Takes no props. Always renders a ghost `Button` at the default size
with an `IconMenu2` and the label "Menu". The visual and the label
are a design ruling — every Nivoda app shell opens its navigation
with the same button, and consumers cannot override it.

### `AppShellNavigationSheet`

Extends `SheetContentProps` minus `side` (hardcoded to `"left"`).
Owns its own three-region layout — consumers populate only the
navigation body via `children`. The header slot is a single
`heading` prop; the footer is entirely structural and cannot be
overridden.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | *(required)* | Accessible name for the navigation dialog. Rendered in a visually-hidden `SheetTitle` so Radix can wire the dialog's accessible name — never appears on screen. |
| `heading` | `ReactNode` | *(required)* | Visible header content. Brand mark, page heading ("Supplier Area"), or any structural layout. Renders inside the fixed top region; the padding, border, and alignment are owned by the component. |
| `user` | `AppShellNavigationSheetUser` | *(required)* | Signed-in user shown in the footer. See below. |
| `onLogout` | `() => void` | *(required)* | Fires when the "Log out" button in the footer is clicked. |
| `children` | `ReactNode` | *(required)* | Navigation body — rendered inside the scrollable middle region. Compose from `<nav>`, headings, and system components like `Button` and `Separator`. |

### `AppShellNavigationSheetUser`

```ts
interface AppShellNavigationSheetUser {
  name: string       // required — drives the identity block and the auto-initials fallback
  email?: string     // optional — rendered under the name
  avatarSrc?: string // optional — populates an AvatarImage
}
```

The avatar's fallback is auto-computed from `name`: first letter of
the first word + first letter of the last word (e.g. "John
Appleseed" → "JA"). Consumers do not pass it.

### Other subcomponents

`AppShellBrand`, `AppShellActions`, and `AppShellMain` each accept
their native HTML element props and `className`. They take no other
props in the initial scaffold.

## Anatomy

```tsx
<AppShell full={false}>
  <AppShellHeader onSearch={() => { /* open search UI */ }}>
    <AppShellBrand>
      <AppShellNavTrigger />
      {/* logo */}
    </AppShellBrand>
    <AppShellActions>{/* user menu, notifications, ... */}</AppShellActions>
  </AppShellHeader>
  <AppShellNavigationSheet
    title="Navigation"
    heading={<span>Supplier Area</span>}
    user={{
      name: "John Appleseed",
      email: "j.appleseed@nivoda.net",
      avatarSrc: "https://…",
    }}
    onLogout={() => {
      /* sign out */
    }}
  >
    {/* nav subsections, links, future nav primitives */}
  </AppShellNavigationSheet>
  <AppShellMain>
    {/* page content — auto-wrapped in the inner container */}
  </AppShellMain>
</AppShell>
```

`AppShell` internally wraps its children in a `Sheet` (Radix
`Dialog.Root`) so that `AppShellNavTrigger` and
`AppShellNavigationSheet` share open/close state via Radix context
with no consumer wiring. The wrapper emits no DOM; it is purely a
context provider, so shells without navigation pay nothing for it.

`AppShellMain` wraps its children in an inner container that enforces
the page max-width and padding. Consumers do not need to add their
own container — just pass raw page content.

## Usage guidelines

**Use when** building any Nivoda application surface that needs the
standard top bar and page layout. This is the default starting
point; departures from it should be deliberate and rare.

**Do not use for** standalone marketing pages, auth screens without
navigation, or embedded widgets. Those are either chromeless or need
a different chrome.

**Do not use for closed modal flows** — checkouts, stone
selections, diamond comparison wizards, or any step-by-step
experience where the user's attention should be focused on a single
task until it's completed. The full AppShell with its branding,
search, and navigation creates escape hatches that undermine the
flow's completion metric. These flows should render in a `Dialog`,
a `Sheet`, or a bespoke minimal layout — not an AppShell.

The `full` prop is an escape hatch, not a default. Data grids,
dashboards, and other complex views should still use the default
(constrained) width as a rule — the constrained width keeps content
within comfortable reading and scanning distances, and the design
system is tuned around it. Only pass `full={true}` when the default
width demonstrably breaks the surface, and flag that decision with
the design lead.

Navigation always opens from the left. This is a design ruling, not
a knob — `AppShellNavigationSheet` does not expose `side`. Surface-
level navigation that sits elsewhere (right-hand utility drawer,
bottom action sheet) should use `Sheet` directly, not
`AppShellNavigationSheet`.

Search and navigation each have exactly one trigger, and both are
owned by the shell: the hardcoded search bar in the header, and the
hardcoded `AppShellNavTrigger` menu button in `AppShellBrand`. No
other element in the shell — including `AppShellActions` — should
open search or navigation. See the Best practices section below.

## Best practices

**Do:** Put exactly one `AppShell` at the root of the page. Nesting
another shell inside the main area is always a mistake.

**Do:** Compose the `AppShellActions` slot with system components —
a `Button` for a primary call-to-action like Sign in, a
`DropdownMenu` wrapped around a `Button` for a user menu, etc. The
search bar and the menu trigger are both hardcoded and are not part
of what you compose.

**Do:** Use `Button` with `size="default"` or `size="icon"` for
every button rendered inside `AppShellActions` — the right-hand
region of the header. Both are `h-11` (44px) and preserve the
header's vertical rhythm.

> Why: the header's vertical rhythm is tuned around the 44px
> button height shared by the search bar and the menu trigger.
> `size="default"` (text, optionally with an icon) and `size="icon"`
> (a 44×44 square) both sit at that height; any other size breaks
> the alignment with the hardcoded elements and produces the visual
> imbalance the shell exists to prevent.

The rule applies **only** to `AppShellActions`. You are free to use
any button size inside the main content area, inside the navigation
sheet body, or anywhere else in the shell — those regions are owned
by the surface, not the header's vertical rhythm.

**Don't:** Use `size="sm"`, `size="lg"`, `size="icon-sm"`, or
`size="icon-xs"` inside `AppShellActions`. These sizes are shorter
than `h-11` and break the header's alignment. If a trailing action
truly cannot fit at the allowed sizes, flag it with the design lead
rather than shrinking the button.

**Don't:** Add a second search affordance anywhere in the header.
The hardcoded `AppShellSearchBar` is the only way search is
invoked, and `onSearch` is the only way to hook it up. No
`Combobox`, no `Input[type=search]`, no bespoke button dressed up
as a search icon — they are all forbidden. If the surface needs a
second, scoped search (e.g. filter-by-text inside a table), that
search belongs inside the main content area, not the header.

**Don't:** Add a second navigation trigger anywhere in the header.
The built-in `AppShellNavTrigger` is the only way the navigation
sheet is opened. Nothing else in the header — including
`AppShellActions` — should toggle the navigation sheet.

**Don't:** Bypass `AppShellMain`'s inner container by wrapping your
page content in a sibling `<div>` with its own max-width — this
breaks the guarantee the shell exists to provide.

**Don't:** Use `full` as a hack to get more horizontal space for a
form. If the form needs a wider layout, redesign the form.

## Known deviations

_None at time of scaffold._

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values

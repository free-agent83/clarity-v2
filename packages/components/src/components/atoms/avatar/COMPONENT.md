---
name: Avatar
slug: avatar
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Avatar

A circular image element for representing a user or entity, with a fallback for when the image is unavailable.

## Props

### Avatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Avatar size |
| `className` | `string` | — | Additional CSS classes |

### Sub-components

- **AvatarImage** — The image displayed inside the avatar. Accepts standard `<img>` props including `src` and `alt`.
- **AvatarFallback** — Content shown when the image fails to load. Typically initials.
- **AvatarBadge** — A status indicator dot positioned at the bottom-right of the avatar.
- **AvatarGroup** — Stacks multiple avatars with overlap.
- **AvatarGroupCount** — Displays a count of additional avatars (e.g. "+3").

## Usage guidelines

Use Avatar to represent users in lists, headers, comments, or anywhere a person's identity needs a visual anchor.

Always provide a `AvatarFallback` with initials so the component is meaningful when images fail to load.

## Best practices

**Do:** Always include an `alt` attribute on `AvatarImage` for accessibility.

**Do:** Use `AvatarFallback` with user initials as a meaningful fallback.

**Don't:** Use Avatar for non-person entities unless the context makes it obvious (e.g. team logos).

**Don't:** Display more than 5 avatars in an `AvatarGroup` without an `AvatarGroupCount`.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
